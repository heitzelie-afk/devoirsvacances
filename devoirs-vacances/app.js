// Cahier de vacances - logique de l'application
const STORAGE_KEY = "cahier_vacances_progress_v1";
const PLAYER_KEY = "cahier_vacances_player_v1";
const MUTE_KEY = "cahier_vacances_muted_v1";
const AVATARS = { louise: "👧", tom: "👦" };
const MASCOTS = { louise: "🦋", tom: "🦁" };

const BADGES = [
  { id: "premier-pas", icon: "🌟", label: "Premier pas", check: (ctx) => ctx.subjectsAttempted >= 1 },
  { id: "sans-faute", icon: "🏆", label: "Sans faute", check: (ctx) => ctx.hadPerfectScore },
  { id: "serie-5", icon: "🔥", label: "Série de 5", check: (ctx) => ctx.bestStreak >= 5 },
  { id: "touche-a-tout", icon: "📚", label: "Touche-à-tout", check: (ctx) => ctx.subjectsAttempted >= ctx.totalSubjects },
  { id: "champion-points", icon: "💯", label: "Champion des points", check: (ctx) => ctx.points >= 200 }
];

const app = document.getElementById("app");
const homeBtn = document.getElementById("btn-home");
const muteBtn = document.getElementById("btn-mute");
const pointsPill = document.getElementById("points-pill");

let state = { screen: "home", childKey: null, subjectId: null, qIndex: 0, results: [], streak: 0, bestStreakSession: 0 };
let qState = { answered: false, correct: null, selected: null, value: "", revealed: false };
let gameState = null;
let draggedIndex = null;

// ---------- Progression (localStorage) ----------
function getProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch (e) { return {}; }
}
function saveProgressAll(p) { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }
function getSubjectProgress(childKey, key) {
  const p = getProgress();
  return (p[childKey] && p[childKey][key]) || null;
}
function setSubjectProgress(childKey, key, percent) {
  const p = getProgress();
  if (!p[childKey]) p[childKey] = {};
  const prev = p[childKey][key] || { best: 0, attempts: 0 };
  p[childKey][key] = { best: Math.max(prev.best, percent), attempts: prev.attempts + 1, last: percent };
  saveProgressAll(p);
}
function starsHtml(best) {
  if (best === null || best === undefined) return `<span style="color:#ddd">★ ★ ★</span>`;
  const filled = best >= 100 ? 3 : best >= 70 ? 2 : best >= 40 ? 1 : 0;
  return "★ ".repeat(filled) + "☆ ".repeat(3 - filled);
}

// ---------- Joueur : points & badges ----------
function getAllPlayers() {
  try { return JSON.parse(localStorage.getItem(PLAYER_KEY)) || {}; }
  catch (e) { return {}; }
}
function getPlayer(childKey) {
  const all = getAllPlayers();
  return all[childKey] || { points: 0, badges: [], bestStreak: 0 };
}
function savePlayer(childKey, player) {
  const all = getAllPlayers();
  all[childKey] = player;
  localStorage.setItem(PLAYER_KEY, JSON.stringify(all));
}
function addPoints(childKey, n) {
  const player = getPlayer(childKey);
  player.points += n;
  savePlayer(childKey, player);
  updatePointsPill();
  return player.points;
}
function updateBestStreak(childKey, streak) {
  const player = getPlayer(childKey);
  if (streak > player.bestStreak) { player.bestStreak = streak; savePlayer(childKey, player); }
}
function checkAndAwardBadges(childKey) {
  const child = DATA[childKey];
  const progress = getProgress()[childKey] || {};
  const player = getPlayer(childKey);
  const subjectIds = child.subjects.map((s) => s.id);
  const wasAttempted = (id) => !!progress[id] || !!progress[id + "__game"];
  const bestOf = (id) => Math.max(progress[id] ? progress[id].best : 0, progress[id + "__game"] ? progress[id + "__game"].best : 0);
  const ctx = {
    subjectsAttempted: subjectIds.filter(wasAttempted).length,
    totalSubjects: subjectIds.length,
    hadPerfectScore: subjectIds.some((id) => bestOf(id) >= 100),
    bestStreak: player.bestStreak,
    points: player.points
  };
  const newlyEarned = [];
  BADGES.forEach((b) => {
    if (!player.badges.includes(b.id) && b.check(ctx)) {
      player.badges.push(b.id);
      newlyEarned.push(b);
    }
  });
  if (newlyEarned.length) savePlayer(childKey, player);
  return newlyEarned;
}
function updatePointsPill() {
  if (!state.childKey) { pointsPill.hidden = true; return; }
  const player = getPlayer(state.childKey);
  pointsPill.hidden = false;
  pointsPill.textContent = `🪙 ${player.points} pts`;
}
function showBadgeToast(badges) {
  if (!badges.length) return;
  badges.forEach((b, i) => {
    setTimeout(() => {
      const toast = document.createElement("div");
      toast.className = "badge-toast";
      toast.innerHTML = `<span class="badge-toast-icon">${b.icon}</span> Badge débloqué : <strong>${b.label}</strong> !`;
      document.body.appendChild(toast);
      playSound("badge");
      spawnConfetti();
      setTimeout(() => toast.remove(), 3200);
    }, i * 600);
  });
}

// ---------- Son ----------
let audioCtx = null;
function isMuted() { return localStorage.getItem(MUTE_KEY) === "1"; }
function setMuted(v) { localStorage.setItem(MUTE_KEY, v ? "1" : "0"); updateMuteBtn(); }
function updateMuteBtn() { muteBtn.textContent = isMuted() ? "🔇" : "🔊"; }
function playTone(freq, duration, type) {
  if (isMuted()) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
  } catch (e) { /* audio non disponible */ }
}
function playSound(kind) {
  if (kind === "ok") { playTone(523, 0.12, "sine"); setTimeout(() => playTone(784, 0.18, "sine"), 90); }
  else if (kind === "ko") { playTone(180, 0.25, "sawtooth"); }
  else if (kind === "badge") { playTone(660, 0.12); setTimeout(() => playTone(880, 0.12), 100); setTimeout(() => playTone(1046, 0.22), 200); }
}

// ---------- Confettis ----------
function spawnConfetti(count) {
  const colors = ["#ff8fab", "#4ea8de", "#f4b400", "#2ecc71", "#a374ff"];
  const layer = document.createElement("div");
  layer.className = "confetti-layer";
  const n = count || 26;
  for (let i = 0; i < n; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = colors[i % colors.length];
    piece.style.animationDuration = (1.4 + Math.random() * 1.2) + "s";
    piece.style.animationDelay = (Math.random() * 0.3) + "s";
    layer.appendChild(piece);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 3000);
}

// ---------- Helpers de correction ----------
function normalize(s) {
  return String(s)
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().trim().replace(/\s+/g, " ").replace(/[.,!?;:]+$/, "");
}
function checkTextAnswer(value, answer) {
  const norm = normalize(value);
  if (!norm) return false;
  if (Array.isArray(answer)) return answer.some((a) => normalize(a) === norm);
  return normalize(answer) === norm;
}
function checkNumAnswer(value, answer) {
  const n = parseFloat(String(value).replace(/\s/g, "").replace(",", "."));
  return !isNaN(n) && n === answer;
}
function speak(word) {
  if (!("speechSynthesis" in window)) {
    alert("Ton navigateur ne sait pas encore lire les mots à voix haute. Demande à un adulte de te dire ce mot !");
    return;
  }
  const utter = new SpeechSynthesisUtterance(word);
  utter.lang = "fr-FR";
  utter.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Navigation ----------
function getCurrentChild() { return DATA[state.childKey]; }
function getCurrentSubject() { return getCurrentChild().subjects.find((s) => s.id === state.subjectId); }
function resetQState() { qState = { answered: false, correct: null, selected: null, value: "", revealed: false }; }

function goHome() {
  state = { screen: "home", childKey: null, subjectId: null, qIndex: 0, results: [], streak: 0, bestStreakSession: 0 };
  gameState = null;
  render();
}
function selectChild(childKey) {
  state.childKey = childKey; state.screen = "subjects"; render();
}
function selectSubject(subjectId) {
  state.subjectId = subjectId; state.qIndex = 0; state.results = []; state.streak = 0;
  resetQState(); state.screen = "quiz"; render();
}
function backToSubjects() { gameState = null; state.screen = "subjects"; render(); }

function finishSubjectAndAward(percentForBadges) {
  updateBestStreak(state.childKey, state.streak);
  const newBadges = checkAndAwardBadges(state.childKey);
  updatePointsPill();
  return newBadges;
}

function nextQuestion() {
  const subject = getCurrentSubject();
  state.results.push({ correct: qState.correct });
  state.qIndex++;
  resetQState();
  if (state.qIndex >= subject.questions.length) {
    const gradable = state.results.filter((r) => r.correct !== null);
    const correctCount = gradable.filter((r) => r.correct).length;
    const percent = gradable.length ? Math.round((correctCount / gradable.length) * 100) : 100;
    setSubjectProgress(state.childKey, state.subjectId, percent);
    const newBadges = finishSubjectAndAward(percent);
    state.screen = "result";
    state.pendingBadges = newBadges;
  }
  render();
}

// ---------- Rendu : Accueil ----------
function childCardHtml(childKey) {
  const child = DATA[childKey];
  const progress = getProgress()[childKey] || {};
  const subjectIds = child.subjects.map((s) => s.id);
  const attempted = subjectIds.filter((id) => progress[id]).length;
  const avgBest = attempted
    ? Math.round(subjectIds.reduce((sum, id) => sum + (progress[id] ? progress[id].best : 0), 0) / attempted)
    : 0;
  const player = getPlayer(childKey);
  return `
    <div class="child-card" data-child="${childKey}">
      <div class="child-avatar">${AVATARS[childKey] || "🧒"} ${MASCOTS[childKey] || ""}</div>
      <div class="child-name">${child.name}</div>
      <div class="child-grade">Entre en ${child.grade}</div>
      <div class="child-progress">${attempted}/${subjectIds.length} matière(s) commencée(s)${attempted ? " · " + avgBest + "% de réussite" : ""}</div>
      <div class="child-points">🪙 ${player.points} points ${player.badges.length ? "· " + player.badges.map((id) => BADGES.find((b) => b.id === id)?.icon || "").join(" ") : ""}</div>
      <button class="btn-primary" data-child="${childKey}">Jouer ▶</button>
    </div>`;
}
function renderHome() {
  app.innerHTML = `
    <h1 class="home-title">Bienvenue dans le cahier de vacances 2026 !</h1>
    <p class="home-sub">Choisis qui tu es pour commencer les jeux de révisions :</p>
    <div class="child-grid">${Object.keys(DATA).map(childCardHtml).join("")}</div>`;
  app.querySelectorAll("[data-child]").forEach((el) => {
    el.addEventListener("click", () => selectChild(el.getAttribute("data-child")));
  });
}

// ---------- Rendu : Matières ----------
function subjectCardHtml(subject, levelNum) {
  const quizProg = getSubjectProgress(state.childKey, subject.id);
  const gameProg = subject.game ? getSubjectProgress(state.childKey, subject.id + "__game") : null;
  const bestOfBoth = Math.max(quizProg ? quizProg.best : 0, gameProg ? gameProg.best : 0);
  const meta = quizProg
    ? `${quizProg.attempts} tentative(s) · meilleur score ${quizProg.best}%`
    : `${subject.questions.length} questions`;
  const quizLabel = quizProg ? "Refaire le quiz ▶" : "Quiz ▶";
  const gameLabels = { memory: "Jeu de mémo", sort: "Jeu de tri", scramble: "Jeu des lettres" };
  const gameBtnHtml = subject.game
    ? `<button class="btn-primary" data-game="${subject.id}">🎮 ${gameLabels[subject.game.type] || "Jouer"} ▶</button>`
    : "";
  return `
    <div class="subject-card">
      <div class="level-ribbon">Niveau ${levelNum}</div>
      <div class="subject-icon">${subject.icon}</div>
      <div class="subject-title">${subject.title}</div>
      <div class="subject-stars">${starsHtml(quizProg || gameProg ? bestOfBoth : null)}</div>
      <div class="subject-meta">${meta}</div>
      ${gameBtnHtml}
      <button class="btn-secondary" data-subject="${subject.id}">${subject.game ? "📝 " + quizLabel : "🎯 " + quizLabel}</button>
    </div>`;
}
function renderSubjects() {
  const child = getCurrentChild();
  const player = getPlayer(state.childKey);
  app.innerHTML = `
    <div class="subjects-header">
      <h2>${AVATARS[state.childKey] || "🧒"} ${child.name} — ${child.grade}</h2>
      <p>Choisis une matière à réviser :</p>
      ${player.badges.length ? `<div class="badge-shelf">${player.badges.map((id) => { const b = BADGES.find((x) => x.id === id); return b ? `<span title="${b.label}">${b.icon}</span>` : ""; }).join(" ")}</div>` : ""}
      <button class="btn-ghost" id="btn-switch-child">🔁 Changer d'enfant</button>
    </div>
    <div class="subject-grid">${child.subjects.map((s, i) => subjectCardHtml(s, i + 1)).join("")}</div>`;
  app.querySelectorAll("[data-subject]").forEach((el) => {
    el.addEventListener("click", () => selectSubject(el.getAttribute("data-subject")));
  });
  app.querySelectorAll("[data-game]").forEach((el) => {
    el.addEventListener("click", () => selectGame(el.getAttribute("data-game")));
  });
  document.getElementById("btn-switch-child").addEventListener("click", goHome);
  updatePointsPill();
}

// ---------- Rendu : Quiz ----------
function questionBodyHtml(question) {
  if (question.type === "qcm") {
    return `<div class="choices">${question.choices
      .map((c, i) => `<button class="choice-btn" data-idx="${i}">${c}</button>`)
      .join("")}</div>`;
  }
  if (question.type === "num") {
    return `
      <input type="text" inputmode="decimal" class="text-input" id="answer-input" placeholder="Écris ta réponse (un nombre)" />
      <div class="actions-row"><button class="btn-primary" id="btn-validate">Valider ✔</button></div>`;
  }
  if (question.type === "text") {
    return `
      <input type="text" class="text-input" id="answer-input" placeholder="Écris ta réponse" />
      <div class="actions-row"><button class="btn-primary" id="btn-validate">Valider ✔</button></div>`;
  }
  if (question.type === "dictee") {
    return `
      <div class="dictee-controls">
        <button class="btn-secondary" id="btn-speak">🔊 Écouter le mot</button>
      </div>
      <input type="text" class="text-input" id="answer-input" placeholder="Écris le mot entendu" />
      <div class="actions-row"><button class="btn-primary" id="btn-validate">Valider ✔</button></div>`;
  }
  if (question.type === "libre") {
    return `
      <textarea class="free-input" id="answer-input" rows="2" placeholder="Écris ta phrase ici"></textarea>
      <p class="libre-note">Pas de bonne ou de mauvaise réponse : fais de ton mieux, un exemple est disponible si besoin.</p>
      <div class="actions-row">
        <button class="btn-secondary" id="btn-sample">💡 Voir un exemple</button>
        <button class="btn-primary" id="btn-continue">Continuer ▶</button>
      </div>
      <div id="sample-box"></div>`;
  }
  return "";
}

function renderQuiz() {
  const subject = getCurrentSubject();
  const total = subject.questions.length;
  const question = subject.questions[state.qIndex];
  const progressPct = Math.round((state.qIndex / total) * 100);
  const mascot = MASCOTS[state.childKey] || "🙂";

  app.innerHTML = `
    <div class="quiz-card">
      <div class="quiz-top-row">
        <div class="question-count">${subject.icon} ${subject.title} — Question ${state.qIndex + 1} / ${total}</div>
        <div class="mascot" id="mascot">${mascot}</div>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${progressPct}%"></div></div>
      ${state.streak >= 2 ? `<div class="streak-banner">🔥 ${state.streak} bonnes réponses d'affilée !</div>` : ""}
      <div class="question-text">${question.q}</div>
      <div id="question-body">${questionBodyHtml(question)}</div>
      <div id="feedback-zone"></div>
    </div>`;

  attachQuizHandlers(question, subject, total);
}

function attachQuizHandlers(question, subject, total) {
  if (question.type === "qcm") {
    app.querySelectorAll(".choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (qState.answered) return;
        const idx = parseInt(btn.getAttribute("data-idx"), 10);
        qState.answered = true;
        qState.selected = idx;
        qState.correct = idx === question.answer;
        app.querySelectorAll(".choice-btn").forEach((b, i) => {
          b.disabled = true;
          if (i === question.answer) b.classList.add("correct");
          if (i === idx && idx !== question.answer) b.classList.add("incorrect");
          if (i === idx) b.classList.add("selected");
        });
        showFeedback(question, total);
      });
    });
  } else if (question.type === "num" || question.type === "text") {
    const input = document.getElementById("answer-input");
    const validate = () => {
      if (qState.answered) return;
      const value = input.value;
      qState.value = value;
      qState.answered = true;
      qState.correct = question.type === "num" ? checkNumAnswer(value, question.answer) : checkTextAnswer(value, question.answer);
      input.disabled = true;
      input.classList.add(qState.correct ? "correct" : "incorrect");
      showFeedback(question, total);
    };
    document.getElementById("btn-validate").addEventListener("click", validate);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") validate(); });
    input.focus();
  } else if (question.type === "dictee") {
    document.getElementById("btn-speak").addEventListener("click", () => speak(question.word));
    speak(question.word);
    const input = document.getElementById("answer-input");
    const validate = () => {
      if (qState.answered) return;
      const value = input.value;
      qState.answered = true;
      qState.correct = checkTextAnswer(value, question.word);
      input.disabled = true;
      input.classList.add(qState.correct ? "correct" : "incorrect");
      showFeedback(question, total);
    };
    document.getElementById("btn-validate").addEventListener("click", validate);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") validate(); });
  } else if (question.type === "libre") {
    document.getElementById("btn-sample").addEventListener("click", () => {
      document.getElementById("sample-box").innerHTML = `<div class="sample-box">💡 Exemple : ${question.sample}</div>`;
    });
    document.getElementById("btn-continue").addEventListener("click", () => {
      qState.answered = true;
      qState.correct = null;
      nextQuestion();
    });
  }
}

function showFeedback(question, total) {
  const zone = document.getElementById("feedback-zone");
  const isLast = state.qIndex + 1 >= total;
  const mascotEl = document.getElementById("mascot");

  if (qState.correct) {
    state.streak++;
    if (state.streak > state.bestStreakSession) state.bestStreakSession = state.streak;
    addPoints(state.childKey, 10 + (state.streak > 0 && state.streak % 3 === 0 ? 5 : 0));
    playSound("ok");
    spawnConfetti(14);
    if (mascotEl) mascotEl.classList.add("mascot-happy");
  } else {
    state.streak = 0;
    playSound("ko");
    if (mascotEl) mascotEl.classList.add("mascot-sad");
  }

  const okMsg = ["Bravo ! 🎉", "Super, c'est exact ! ⭐", "Bien joué ! 👏", "Parfait ! ✅"][state.qIndex % 4];
  const koMsg = question.type === "dictee" || question.type === "text"
    ? `Ce n'était pas ça. La bonne réponse : « ${Array.isArray(question.answer) ? question.answer[0] : (question.answer !== undefined ? question.answer : question.word)} »`
    : question.type === "num"
    ? `Ce n'était pas ça. La bonne réponse : ${question.answer}`
    : "Ce n'était pas la bonne réponse.";
  zone.innerHTML = `
    <div class="feedback ${qState.correct ? "ok" : "ko"}">
      ${qState.correct ? okMsg : koMsg}
      ${question.help ? `<span class="help">${question.help}</span>` : ""}
    </div>
    <div class="actions-row">
      <button class="btn-primary" id="btn-next">${isLast ? "Voir le résultat 🎉" : "Suivant ▶"}</button>
    </div>`;
  document.getElementById("btn-next").addEventListener("click", nextQuestion);
}

// ---------- Rendu : Résultat quiz ----------
function renderResult() {
  const subject = getCurrentSubject();
  const prog = getSubjectProgress(state.childKey, state.subjectId);
  const gradable = state.results.filter((r) => r.correct !== null);
  const correctCount = gradable.filter((r) => r.correct).length;
  const percent = prog.last;
  const stars = percent >= 100 ? 3 : percent >= 70 ? 2 : percent >= 40 ? 1 : 0;

  const listHtml = subject.questions.map((q, i) => {
    const r = state.results[i];
    if (r.correct === null) return `<div class="result-item">✍️ ${q.q} <em>(réponse libre)</em></div>`;
    return `<div class="result-item ${r.correct ? "ok" : "ko"}">${r.correct ? "✅" : "❌"} ${q.q}</div>`;
  }).join("");

  app.innerHTML = `
    <div class="result-card">
      <div>${subject.icon} <strong>${subject.title}</strong></div>
      <div class="result-stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>
      <div class="result-score">${correctCount} / ${gradable.length} bonnes réponses (${percent}%)</div>
      <div class="result-list">${listHtml}</div>
      <div class="actions-row" style="justify-content:center">
        <button class="btn-secondary" id="btn-retry">🔁 Recommencer</button>
        <button class="btn-primary" id="btn-back-subjects">📚 Autres matières</button>
      </div>
    </div>`;
  document.getElementById("btn-retry").addEventListener("click", () => selectSubject(state.subjectId));
  document.getElementById("btn-back-subjects").addEventListener("click", backToSubjects);
  showBadgeToast(state.pendingBadges || []);
  state.pendingBadges = [];
}

// ---------- Mini-jeu : Tri (drag & drop) ----------
function selectGame(subjectId) {
  state.subjectId = subjectId;
  const subject = getCurrentSubject();
  const game = subject.game;
  if (game.type === "sort") {
    gameState = { type: "sort", poolIndices: shuffle(game.items.map((_, i) => i)), selected: null, mistakes: 0, placed: 0, total: game.items.length };
    state.screen = "sortgame";
  } else if (game.type === "memory") {
    const cards = [];
    game.pairs.forEach((pair, p) => {
      cards.push({ pairIndex: p, value: pair.a });
      cards.push({ pairIndex: p, value: pair.b });
    });
    gameState = { type: "memory", cards: shuffle(cards), flipped: [], matched: [], mistakes: 0, locked: false };
    state.screen = "memorygame";
  } else if (game.type === "scramble") {
    gameState = { type: "scramble", words: shuffle(game.words), wordIndex: 0, mistakes: 0, locked: false };
    loadScrambleWord();
    state.screen = "scramblegame";
  }
  render();
}

function loadScrambleWord() {
  const word = gameState.words[gameState.wordIndex];
  gameState.letters = shuffle(word.split("").map((ch, i) => ({ ch, id: i, used: false })));
  gameState.built = "";
  gameState.locked = false;
  speak(word);
}

function renderSortGame() {
  const subject = getCurrentSubject();
  const game = subject.game;
  const progressPct = Math.round((gameState.placed / gameState.total) * 100);

  const poolHtml = gameState.poolIndices.map((idx) => {
    const item = game.items[idx];
    return `<div class="sort-chip ${gameState.selected === idx ? "selected" : ""}" draggable="true" data-idx="${idx}">${item.label}</div>`;
  }).join("");

  const basketsHtml = game.categories.map((cat) => `
    <div class="basket" data-cat="${cat.id}">
      <div class="basket-icon">${cat.icon}</div>
      <div class="basket-label">${cat.label}</div>
    </div>`).join("");

  app.innerHTML = `
    <div class="quiz-card">
      <div class="quiz-top-row">
        <div class="question-count">${subject.icon} ${subject.title} — Jeu de tri</div>
        <div class="mascot" id="mascot">${MASCOTS[state.childKey] || "🙂"}</div>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${progressPct}%"></div></div>
      <p class="game-instructions">${game.instructions}</p>
      <div class="sort-pool" id="sort-pool">${poolHtml || '<span class="pool-empty">Tout est trié ! 🎉</span>'}</div>
      <div class="basket-row">${basketsHtml}</div>
      <div id="feedback-zone"></div>
    </div>`;

  attachSortHandlers();
}

function attachSortHandlers() {
  const chips = app.querySelectorAll(".sort-chip");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const idx = parseInt(chip.getAttribute("data-idx"), 10);
      gameState.selected = gameState.selected === idx ? null : idx;
      renderSortGame();
    });
    chip.addEventListener("dragstart", (e) => {
      draggedIndex = parseInt(chip.getAttribute("data-idx"), 10);
      e.dataTransfer.setData("text/plain", String(draggedIndex));
    });
  });
  app.querySelectorAll(".basket").forEach((basket) => {
    basket.addEventListener("dragover", (e) => e.preventDefault());
    basket.addEventListener("drop", (e) => {
      e.preventDefault();
      const idx = parseInt(e.dataTransfer.getData("text/plain"), 10);
      handleSortPlace(idx, basket.getAttribute("data-cat"), basket);
    });
    basket.addEventListener("click", () => {
      if (gameState.selected === null) return;
      handleSortPlace(gameState.selected, basket.getAttribute("data-cat"), basket);
    });
  });
}

function handleSortPlace(idx, catId, basketEl) {
  const subject = getCurrentSubject();
  const item = subject.game.items[idx];
  const correct = item.category === catId;
  if (correct) {
    gameState.poolIndices = gameState.poolIndices.filter((i) => i !== idx);
    gameState.placed++;
    gameState.selected = null;
    addPoints(state.childKey, 15);
    playSound("ok");
    spawnConfetti(10);
    if (basketEl) { basketEl.classList.add("basket-ok"); setTimeout(() => basketEl.classList.remove("basket-ok"), 400); }
    if (gameState.poolIndices.length === 0) {
      finishGame();
      return;
    }
    renderSortGame();
  } else {
    gameState.mistakes++;
    gameState.selected = null;
    playSound("ko");
    if (basketEl) { basketEl.classList.add("basket-ko"); setTimeout(() => basketEl.classList.remove("basket-ko"), 400); }
    renderSortGame();
  }
}

// ---------- Mini-jeu : Memory ----------
function renderMemoryGame() {
  const subject = getCurrentSubject();
  const totalPairs = subject.game.pairs.length;
  const progressPct = Math.round((gameState.matched.length / 2 / totalPairs) * 100);

  const cardsHtml = gameState.cards.map((card, idx) => {
    const isUp = gameState.flipped.includes(idx) || gameState.matched.includes(idx);
    const isMatched = gameState.matched.includes(idx);
    return `<div class="memory-card ${isUp ? "flipped" : ""} ${isMatched ? "matched" : ""}" data-idx="${idx}">
      <div class="memory-card-inner">
        <div class="memory-card-back">❓</div>
        <div class="memory-card-front">${card.value}</div>
      </div>
    </div>`;
  }).join("");

  app.innerHTML = `
    <div class="quiz-card">
      <div class="quiz-top-row">
        <div class="question-count">${subject.icon} ${subject.title} — Jeu de mémo</div>
        <div class="mascot" id="mascot">${MASCOTS[state.childKey] || "🙂"}</div>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${progressPct}%"></div></div>
      <p class="game-instructions">${subject.game.instructions}</p>
      <div class="memory-grid">${cardsHtml}</div>
      <div id="feedback-zone"></div>
    </div>`;

  app.querySelectorAll(".memory-card").forEach((cardEl) => {
    cardEl.addEventListener("click", () => {
      const idx = parseInt(cardEl.getAttribute("data-idx"), 10);
      handleMemoryClick(idx);
    });
  });
}

function handleMemoryClick(idx) {
  if (gameState.locked) return;
  if (gameState.matched.includes(idx) || gameState.flipped.includes(idx)) return;
  gameState.flipped.push(idx);
  renderMemoryGame();
  if (gameState.flipped.length === 2) {
    gameState.locked = true;
    const [i1, i2] = gameState.flipped;
    const c1 = gameState.cards[i1], c2 = gameState.cards[i2];
    if (c1.pairIndex === c2.pairIndex) {
      gameState.matched.push(i1, i2);
      gameState.flipped = [];
      gameState.locked = false;
      addPoints(state.childKey, 20);
      playSound("ok");
      spawnConfetti(10);
      renderMemoryGame();
      if (gameState.matched.length === gameState.cards.length) {
        finishGame();
      }
    } else {
      gameState.mistakes++;
      setTimeout(() => {
        gameState.flipped = [];
        gameState.locked = false;
        playSound("ko");
        renderMemoryGame();
      }, 900);
    }
  }
}

// ---------- Mini-jeu : Mots mêlés (reconstituer un mot dicté) ----------
function renderScrambleGame() {
  const subject = getCurrentSubject();
  const totalWords = gameState.words.length;
  const progressPct = Math.round((gameState.wordIndex / totalWords) * 100);
  const word = gameState.words[gameState.wordIndex];

  const builtHtml = word.split("").map((_, i) => `<span class="scramble-slot">${gameState.built[i] || ""}</span>`).join("");
  const tilesHtml = gameState.letters.map((tile) => `
    <button class="letter-tile" data-id="${tile.id}" ${tile.used ? "disabled" : ""}>${tile.ch}</button>`).join("");

  app.innerHTML = `
    <div class="quiz-card">
      <div class="quiz-top-row">
        <div class="question-count">${subject.icon} ${subject.title} — Jeu des lettres (mot ${gameState.wordIndex + 1} / ${totalWords})</div>
        <div class="mascot" id="mascot">${MASCOTS[state.childKey] || "🙂"}</div>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${progressPct}%"></div></div>
      <p class="game-instructions">${subject.game.instructions}</p>
      <div class="dictee-controls">
        <button class="btn-secondary" id="btn-speak-scramble">🔊 Réécouter</button>
      </div>
      <div class="scramble-built">${builtHtml}</div>
      <div class="letter-tiles">${tilesHtml}</div>
      <div id="feedback-zone"></div>
    </div>`;

  document.getElementById("btn-speak-scramble").addEventListener("click", () => speak(word));
  app.querySelectorAll(".letter-tile").forEach((btn) => {
    btn.addEventListener("click", () => handleScrambleTileClick(parseInt(btn.getAttribute("data-id"), 10), btn));
  });
}

function handleScrambleTileClick(tileId, tileEl) {
  if (gameState.locked) return;
  const tile = gameState.letters.find((t) => t.id === tileId);
  if (!tile || tile.used) return;
  const word = gameState.words[gameState.wordIndex];
  const expected = word[gameState.built.length];

  if (tile.ch === expected) {
    tile.used = true;
    gameState.built += tile.ch;
    playSound("ok");
    if (gameState.built.length === word.length) {
      gameState.locked = true;
      addPoints(state.childKey, 15);
      spawnConfetti(10);
      renderScrambleGame();
      const zone = document.getElementById("feedback-zone");
      const isLast = gameState.wordIndex + 1 >= gameState.words.length;
      zone.innerHTML = `<div class="feedback ok">Bravo ! Le mot était bien « ${word} » 🎉</div>`;
      setTimeout(() => {
        if (isLast) { finishGame(); return; }
        gameState.wordIndex++;
        loadScrambleWord();
        render();
      }, 1200);
    } else {
      renderScrambleGame();
    }
  } else {
    gameState.mistakes++;
    playSound("ko");
    if (tileEl) { tileEl.classList.add("tile-shake"); setTimeout(() => tileEl.classList.remove("tile-shake"), 400); }
  }
}

// ---------- Fin de mini-jeu ----------
function finishGame() {
  const subject = getCurrentSubject();
  let percent;
  if (gameState.type === "sort") {
    percent = Math.round((gameState.total / (gameState.total + gameState.mistakes)) * 100);
  } else if (gameState.type === "memory") {
    const totalPairs = subject.game.pairs.length;
    percent = Math.round((totalPairs / (totalPairs + gameState.mistakes)) * 100);
  } else if (gameState.type === "scramble") {
    const totalWords = subject.game.words.length;
    percent = Math.round((totalWords / (totalWords + gameState.mistakes)) * 100);
  }
  setSubjectProgress(state.childKey, subject.id + "__game", percent);
  const newBadges = finishSubjectAndAward(percent);
  state.pendingBadges = newBadges;
  state.lastGamePercent = percent;
  state.lastGameMistakes = gameState.mistakes;
  state.screen = "gameresult";
  render();
}

function renderGameResult() {
  const subject = getCurrentSubject();
  const percent = state.lastGamePercent;
  const stars = percent >= 100 ? 3 : percent >= 70 ? 2 : percent >= 40 ? 1 : 0;
  const doneMsg = gameState.type === "scramble" ? "Bravo, tu as retrouvé tous les mots ! 🎉" : "Bravo, tu as tout trié/associé correctement ! 🎉";
  app.innerHTML = `
    <div class="result-card">
      <div>${subject.icon} <strong>${subject.title}</strong> — Mini-jeu terminé !</div>
      <div class="result-stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>
      <div class="result-score">${state.lastGameMistakes} erreur(s) · score ${percent}%</div>
      <p>${doneMsg}</p>
      <div class="actions-row" style="justify-content:center">
        <button class="btn-secondary" id="btn-retry-game">🔁 Rejouer</button>
        <button class="btn-primary" id="btn-back-subjects">📚 Autres matières</button>
      </div>
    </div>`;
  document.getElementById("btn-retry-game").addEventListener("click", () => selectGame(state.subjectId));
  document.getElementById("btn-back-subjects").addEventListener("click", backToSubjects);
  spawnConfetti(30);
  showBadgeToast(state.pendingBadges || []);
  state.pendingBadges = [];
}

// ---------- Dispatcher ----------
function render() {
  homeBtn.hidden = state.screen === "home";
  updatePointsPill();
  if (state.screen === "home") renderHome();
  else if (state.screen === "subjects") renderSubjects();
  else if (state.screen === "quiz") renderQuiz();
  else if (state.screen === "result") renderResult();
  else if (state.screen === "sortgame") renderSortGame();
  else if (state.screen === "memorygame") renderMemoryGame();
  else if (state.screen === "scramblegame") renderScrambleGame();
  else if (state.screen === "gameresult") renderGameResult();
}

homeBtn.addEventListener("click", goHome);
muteBtn.addEventListener("click", () => setMuted(!isMuted()));
updateMuteBtn();
render();
