// Contenu des exercices - Cahier de vacances
// Types de questions gérés par app.js :
//  - "qcm"    : choix multiple (choices[], answer = index)
//  - "num"    : réponse numérique (answer = nombre)
//  - "text"   : réponse texte courte (answer = string OU tableau de réponses acceptées)
//  - "dictee" : mot lu à voix haute (Web Speech API) puis à orthographier (answer = string)
//  - "libre"  : production libre, non notée, avec exemple de correction affiché (sample = string)

const DATA = {
  louise: {
    name: "Louise",
    grade: "CE1",
    color: "#ff8fab",
    subjects: [
      {
        id: "lecture",
        title: "Lecture & sons",
        icon: "📖",
        intro: "On révise les sons et les syllabes appris en CP !",
        questions: [
          { type: "qcm", q: "Quel mot commence par le son « ch » ?", choices: ["chat", "robe", "lune", "pomme"], answer: 0 },
          { type: "qcm", q: "Quel mot contient le son « ou » ?", choices: ["loup", "papa", "vélo", "tomate"], answer: 0 },
          { type: "qcm", q: "Combien de syllabes dans « tomate » ?", choices: ["1", "2", "3", "4"], answer: 2, help: "to-ma-te = 3 syllabes" },
          { type: "qcm", q: "Combien de syllabes dans « chocolat » ?", choices: ["2", "3", "4", "5"], answer: 1, help: "cho-co-lat = 3 syllabes" },
          { type: "text", q: "Écris le contraire de « grand ».", answer: "petit" },
          { type: "text", q: "Écris le contraire de « jour ».", answer: "nuit" },
          { type: "qcm", q: "Quel son entend-on au début de « gomme » ?", choices: ["g", "j", "ch", "s"], answer: 0 },
          { type: "qcm", q: "Trouve l'intrus (ce n'est pas un animal) :", choices: ["chat", "chien", "lion", "chaise"], answer: 3 },
          { type: "text", q: "Mets au pluriel : « un chat » →", answer: ["des chats", "chats"] },
          { type: "text", q: "Mets au pluriel : « une fleur » →", answer: ["des fleurs", "fleurs"] }
        ]
      },
      {
        id: "nombres",
        title: "Nombres & calcul",
        icon: "🔢",
        intro: "Additions, soustractions, et nombres jusqu'à 100.",
        questions: [
          { type: "num", q: "12 + 5 = ?", answer: 17 },
          { type: "num", q: "20 + 30 = ?", answer: 50 },
          { type: "num", q: "45 − 3 = ?", answer: 42 },
          { type: "num", q: "9 + 8 = ?", answer: 17 },
          { type: "qcm", q: "Quel nombre vient juste après 39 ?", choices: ["38", "40", "41", "50"], answer: 1 },
          { type: "qcm", q: "Quel est le plus grand nombre ?", choices: ["56", "65"], answer: 1 },
          { type: "num", q: "Combien de dizaines dans 47 ?", answer: 4 },
          { type: "num", q: "Combien d'unités dans 47 ?", answer: 7 },
          { type: "num", q: "100 − 10 = ?", answer: 90 },
          { type: "num", q: "Léo a 8 billes, il en gagne 5. Combien a-t-il de billes en tout ?", answer: 13 }
        ]
      },
      {
        id: "longueurs",
        title: "Mesurer des longueurs (cm et m)",
        icon: "📏",
        intro: "Rappel : 1 mètre (m) = 100 centimètres (cm).",
        questions: [
          { type: "num", q: "Combien de centimètres y a-t-il dans 1 mètre ?", answer: 100 },
          { type: "qcm", q: "Quel instrument utilise-t-on pour mesurer une longueur ?", choices: ["un thermomètre", "une règle", "une balance", "une horloge"], answer: 1 },
          { type: "qcm", q: "Quelle est l'unité la plus adaptée pour mesurer un crayon ?", choices: ["le mètre", "le centimètre", "le kilomètre"], answer: 1 },
          { type: "qcm", q: "Quelle est l'unité la plus adaptée pour mesurer une salle de classe ?", choices: ["le centimètre", "le mètre"], answer: 1 },
          { type: "num", q: "Une table mesure 120 cm, soit 1 m et ___ cm. Trouve le nombre de cm.", answer: 20 },
          { type: "num", q: "2 m = ___ cm", answer: 200 },
          { type: "num", q: "350 cm, c'est 3 m et ___ cm", answer: 50 },
          { type: "qcm", q: "Quelle est la plus longue distance ?", choices: ["50 cm", "1 m"], answer: 1 },
          { type: "num", q: "Un crayon mesure 15 cm, une règle mesure 30 cm. Combien de cm de plus mesure la règle ?", answer: 15 },
          { type: "num", q: "Un ruban de 45 cm + un ruban de 30 cm = combien de cm en tout ?", answer: 75 },
          { type: "num", q: "Une ficelle mesure 4 m. Combien de centimètres cela fait-il ?", answer: 400 },
          { type: "qcm", q: "Pour mesurer la longueur d'une piscine, on utilise plutôt...", choices: ["le centimètre", "le mètre"], answer: 1 }
        ],
        game: {
          type: "sort",
          instructions: "Glisse (ou touche) chaque objet dans le bon panier : on le mesure plutôt en cm ou en m ?",
          categories: [
            { id: "cm", label: "Centimètres (cm)", icon: "📏" },
            { id: "m", label: "Mètres (m)", icon: "📐" }
          ],
          items: [
            { label: "✏️ Un crayon", category: "cm" },
            { label: "📏 Une règle", category: "cm" },
            { label: "📱 Un téléphone", category: "cm" },
            { label: "🧦 Une chaussette", category: "cm" },
            { label: "🍫 Une tablette de chocolat", category: "cm" },
            { label: "🔑 Une clé", category: "cm" },
            { label: "🖊️ Un stylo", category: "cm" },
            { label: "🚌 Un bus", category: "m" },
            { label: "🏫 Une salle de classe", category: "m" },
            { label: "🌳 Un arbre", category: "m" },
            { label: "🚗 Une voiture", category: "m" },
            { label: "🛏️ Un lit", category: "m" },
            { label: "🚪 Une porte", category: "m" },
            { label: "🏊 Une piscine", category: "m" }
          ]
        }
      },
      {
        id: "grammaire",
        title: "Mots & phrases",
        icon: "✏️",
        intro: "Petites règles de grammaire et dictée de mots.",
        questions: [
          { type: "qcm", q: "« ___ table » : un ou une ?", choices: ["un", "une"], answer: 1 },
          { type: "qcm", q: "« ___ chien » : un ou une ?", choices: ["un", "une"], answer: 0 },
          { type: "qcm", q: "Quel est le verbe dans « Le chat dort sur le tapis. » ?", choices: ["chat", "dort", "tapis", "le"], answer: 1 },
          { type: "text", q: "Complète : « Tu ___ gentil. » (est / es)", answer: "es" },
          { type: "text", q: "Complète : « Il ___ content. » (et / est)", answer: "est" },
          { type: "dictee", word: "chat", q: "Écoute le mot et écris-le." },
          { type: "dictee", word: "maison", q: "Écoute le mot et écris-le." },
          { type: "dictee", word: "vélo", q: "Écoute le mot et écris-le." },
          { type: "dictee", word: "papa", q: "Écoute le mot et écris-le." }
        ]
      },
      {
        id: "monde",
        title: "Découverte du monde",
        icon: "🌍",
        intro: "Les saisons, les jours, les mois...",
        questions: [
          { type: "qcm", q: "Combien y a-t-il de saisons dans une année ?", choices: ["2", "3", "4", "5"], answer: 2 },
          { type: "qcm", q: "Quelle saison vient après l'hiver ?", choices: ["l'été", "l'automne", "le printemps"], answer: 2 },
          { type: "qcm", q: "Combien y a-t-il de jours dans une semaine ?", choices: ["5", "6", "7", "8"], answer: 2 },
          { type: "text", q: "Quel jour vient après mercredi ?", answer: "jeudi" },
          { type: "qcm", q: "Combien y a-t-il de mois dans une année ?", choices: ["10", "11", "12", "13"], answer: 2 },
          { type: "qcm", q: "En quelle saison fait-il le plus chaud ?", choices: ["l'hiver", "l'été", "l'automne"], answer: 1 }
        ]
      }
    ]
  },

  tom: {
    name: "Tom",
    grade: "CM1",
    color: "#4ea8de",
    subjects: [
      {
        id: "circonstanciel",
        title: "Compléments circonstanciels",
        icon: "🧩",
        intro: "Le complément circonstanciel donne une précision de lieu, de temps ou de manière. On peut souvent le supprimer ou le déplacer dans la phrase.",
        questions: [
          { type: "qcm", q: "« Le week-end, nous allons à la piscine. » Quel est le complément circonstanciel de TEMPS ?", choices: ["nous", "allons", "Le week-end", "à la piscine"], answer: 2 },
          { type: "qcm", q: "« Le week-end, nous allons à la piscine. » Quel est le complément circonstanciel de LIEU ?", choices: ["nous", "allons", "Le week-end", "à la piscine"], answer: 3 },
          { type: "qcm", q: "Complète avec un complément de LIEU : « Les enfants jouent ___. »", choices: ["doucement", "dans le jardin", "hier", "avec joie"], answer: 1 },
          { type: "qcm", q: "Complète avec un complément de TEMPS : « Nous partirons en vacances ___. »", choices: ["dans la voiture", "demain matin", "avec le sourire", "au bord de la mer"], answer: 1 },
          { type: "qcm", q: "Complète avec un complément de MANIÈRE : « Le chat marche ___. »", choices: ["la nuit", "silencieusement", "dans la maison", "ce soir"], answer: 1 },
          { type: "qcm", q: "« Hier soir, Tom a fini ses devoirs rapidement. » Quel est le complément de TEMPS ?", choices: ["Hier soir", "Tom", "ses devoirs", "rapidement"], answer: 0 },
          { type: "qcm", q: "« Hier soir, Tom a fini ses devoirs rapidement. » Quel est le complément de MANIÈRE ?", choices: ["Hier soir", "Tom", "ses devoirs", "rapidement"], answer: 3 },
          { type: "qcm", q: "Complète avec un complément de LIEU : « Mon frère range ses jouets ___. »", choices: ["dans sa chambre", "lentement", "la semaine dernière", "avec soin"], answer: 0 },
          { type: "qcm", q: "Un complément circonstanciel peut-il être supprimé de la phrase sans la rendre incorrecte ?", choices: ["Oui", "Non"], answer: 0 },
          { type: "qcm", q: "Un complément circonstanciel peut-il être déplacé dans la phrase ?", choices: ["Oui", "Non"], answer: 0 },
          { type: "libre", q: "Écris une phrase avec un complément circonstanciel de TEMPS.", sample: "Demain, nous irons au zoo." },
          { type: "libre", q: "Écris une phrase avec un complément circonstanciel de LIEU.", sample: "Les poissons nagent dans l'aquarium." }
        ]
      },
      {
        id: "plurielou",
        title: "Pluriel des noms en « ou »",
        icon: "📚",
        intro: "En général, les noms en « ou » prennent un « s » au pluriel. MAIS 7 noms prennent un « x » : bijou, caillou, chou, genou, hibou, joujou, pou.",
        questions: [
          { type: "qcm", q: "Pluriel de « un clou » :", choices: ["des clous", "des cloux"], answer: 0 },
          { type: "qcm", q: "Pluriel de « un chou » :", choices: ["des chous", "des choux"], answer: 1 },
          { type: "qcm", q: "Pluriel de « un trou » :", choices: ["des trous", "des troux"], answer: 0 },
          { type: "qcm", q: "Pluriel de « un genou » :", choices: ["des genous", "des genoux"], answer: 1 },
          { type: "qcm", q: "Pluriel de « un fou » :", choices: ["des fous", "des foux"], answer: 0 },
          { type: "qcm", q: "Pluriel de « un caillou » :", choices: ["des cailloux", "des caillous"], answer: 0 },
          { type: "qcm", q: "Pluriel de « un hibou » :", choices: ["des hiboux", "des hibous"], answer: 0 },
          { type: "qcm", q: "Pluriel de « un bisou » :", choices: ["des bisous", "des bisoux"], answer: 0 },
          { type: "text", q: "Cite un des 7 noms en « ou » qui prennent un « x » au pluriel (bijou, caillou, chou, genou, hibou, joujou ou pou).", answer: ["bijou", "caillou", "chou", "genou", "hibou", "joujou", "pou"] },
          { type: "qcm", q: "Pluriel de « un pou » :", choices: ["des poux", "des pous"], answer: 0 },
          { type: "qcm", q: "Pluriel de « un sou » :", choices: ["des sous", "des soux"], answer: 0 },
          { type: "qcm", q: "Pluriel de « un joujou » :", choices: ["des joujoux", "des joujous"], answer: 0 }
        ],
        game: {
          type: "sort",
          instructions: "Glisse (ou touche) chaque mot dans le bon panier : + s ou + x !",
          categories: [
            { id: "s", label: "+ s", icon: "📄" },
            { id: "x", label: "+ x", icon: "📦" }
          ],
          items: [
            { label: "un clou", category: "s" },
            { label: "un trou", category: "s" },
            { label: "un fou", category: "s" },
            { label: "un sou", category: "s" },
            { label: "un bisou", category: "s" },
            { label: "un verrou", category: "s" },
            { label: "un matou", category: "s" },
            { label: "un bijou", category: "x" },
            { label: "un caillou", category: "x" },
            { label: "un chou", category: "x" },
            { label: "un genou", category: "x" },
            { label: "un hibou", category: "x" },
            { label: "un joujou", category: "x" },
            { label: "un pou", category: "x" }
          ]
        }
      },
      {
        id: "dictee",
        title: "Dictée de mots",
        icon: "🎧",
        intro: "Clique sur 🔊 pour écouter chaque mot, puis écris-le correctement.",
        questions: [
          { type: "dictee", word: "automne", q: "Écoute et écris le mot." },
          { type: "dictee", word: "bonheur", q: "Écoute et écris le mot." },
          { type: "dictee", word: "difficile", q: "Écoute et écris le mot." },
          { type: "dictee", word: "beaucoup", q: "Écoute et écris le mot." },
          { type: "dictee", word: "toujours", q: "Écoute et écris le mot." },
          { type: "dictee", word: "environ", q: "Écoute et écris le mot." },
          { type: "dictee", word: "quelquefois", q: "Écoute et écris le mot." },
          { type: "dictee", word: "exercice", q: "Écoute et écris le mot." },
          { type: "dictee", word: "hasard", q: "Écoute et écris le mot." },
          { type: "dictee", word: "orchestre", q: "Écoute et écris le mot." },
          { type: "dictee", word: "silence", q: "Écoute et écris le mot." },
          { type: "dictee", word: "récemment", q: "Écoute et écris le mot." }
        ]
      },
      {
        id: "multiplication",
        title: "Multiplication à 3 chiffres",
        icon: "✖️",
        intro: "On multiplie un nombre à 3 chiffres par un nombre à 1 chiffre.",
        questions: [
          { type: "num", q: "213 × 3 = ?", answer: 639 },
          { type: "num", q: "124 × 2 = ?", answer: 248 },
          { type: "num", q: "302 × 4 = ?", answer: 1208 },
          { type: "num", q: "150 × 6 = ?", answer: 900 },
          { type: "num", q: "231 × 3 = ?", answer: 693 },
          { type: "num", q: "412 × 2 = ?", answer: 824 },
          { type: "num", q: "123 × 4 = ?", answer: 492 },
          { type: "num", q: "205 × 5 = ?", answer: 1025 },
          { type: "num", q: "111 × 9 = ?", answer: 999 },
          { type: "num", q: "320 × 3 = ?", answer: 960 },
          { type: "num", q: "402 × 2 = ?", answer: 804 },
          { type: "num", q: "Une boîte contient 125 bonbons. Combien de bonbons y a-t-il dans 3 boîtes ?", answer: 375 },
          { type: "num", q: "🌟 Défi : 124 × 12 = ?", answer: 1488 }
        ],
        game: {
          type: "memory",
          instructions: "Retourne deux cartes pour trouver une multiplication et son résultat !",
          pairs: [
            { a: "213 × 3", b: "639" },
            { a: "124 × 2", b: "248" },
            { a: "302 × 4", b: "1208" },
            { a: "150 × 6", b: "900" },
            { a: "231 × 3", b: "693" },
            { a: "412 × 2", b: "824" }
          ]
        }
      },
      {
        id: "animaux",
        title: "Herbivores, carnivores, omnivores",
        icon: "🦁",
        intro: "Herbivore = ne mange que des plantes. Carnivore = ne mange que de la viande. Omnivore = mange des plantes ET de la viande.",
        questions: [
          { type: "qcm", q: "La vache est...", choices: ["herbivore", "carnivore", "omnivore"], answer: 0 },
          { type: "qcm", q: "Le lion est...", choices: ["herbivore", "carnivore", "omnivore"], answer: 1 },
          { type: "qcm", q: "Le cochon est...", choices: ["herbivore", "carnivore", "omnivore"], answer: 2 },
          { type: "qcm", q: "Le lapin est...", choices: ["herbivore", "carnivore", "omnivore"], answer: 0 },
          { type: "qcm", q: "Le tigre est...", choices: ["herbivore", "carnivore", "omnivore"], answer: 1 },
          { type: "qcm", q: "L'ours est...", choices: ["herbivore", "carnivore", "omnivore"], answer: 2 },
          { type: "qcm", q: "Le cheval est...", choices: ["herbivore", "carnivore", "omnivore"], answer: 0 },
          { type: "qcm", q: "Le loup est...", choices: ["herbivore", "carnivore", "omnivore"], answer: 1 },
          { type: "qcm", q: "L'être humain est plutôt...", choices: ["herbivore", "carnivore", "omnivore"], answer: 2 },
          { type: "qcm", q: "La girafe est...", choices: ["herbivore", "carnivore", "omnivore"], answer: 0 },
          { type: "qcm", q: "Le requin est...", choices: ["herbivore", "carnivore", "omnivore"], answer: 1 },
          { type: "qcm", q: "Un animal qui se nourrit UNIQUEMENT de plantes est un...", choices: ["carnivore", "herbivore", "omnivore"], answer: 1 },
          { type: "qcm", q: "Un animal qui se nourrit de plantes ET de viande est un...", choices: ["carnivore", "herbivore", "omnivore"], answer: 2 },
          { type: "qcm", q: "Un animal qui se nourrit UNIQUEMENT de viande est un...", choices: ["carnivore", "herbivore", "omnivore"], answer: 0 }
        ],
        game: {
          type: "sort",
          instructions: "Glisse (ou touche) chaque animal dans le bon panier !",
          categories: [
            { id: "herbivore", label: "Herbivore", icon: "🌿" },
            { id: "carnivore", label: "Carnivore", icon: "🍖" },
            { id: "omnivore", label: "Omnivore", icon: "🍽️" }
          ],
          items: [
            { label: "🐄 Vache", category: "herbivore" },
            { label: "🐰 Lapin", category: "herbivore" },
            { label: "🐴 Cheval", category: "herbivore" },
            { label: "🦒 Girafe", category: "herbivore" },
            { label: "🐑 Mouton", category: "herbivore" },
            { label: "🦁 Lion", category: "carnivore" },
            { label: "🐯 Tigre", category: "carnivore" },
            { label: "🐺 Loup", category: "carnivore" },
            { label: "🦈 Requin", category: "carnivore" },
            { label: "🦅 Aigle", category: "carnivore" },
            { label: "🐻 Ours", category: "omnivore" },
            { label: "🐷 Cochon", category: "omnivore" },
            { label: "🐔 Poule", category: "omnivore" },
            { label: "🧑 Être humain", category: "omnivore" }
          ]
        }
      },
      {
        id: "calcul",
        title: "Nombres & opérations",
        icon: "🔢",
        intro: "Révisions générales de calcul et de numération.",
        questions: [
          { type: "num", q: "4 567 + 2 345 = ?", answer: 6912 },
          { type: "num", q: "8 000 − 3 456 = ?", answer: 4544 },
          { type: "qcm", q: "Quel est le nombre juste avant 1 000 ?", choices: ["998", "999", "1001", "900"], answer: 1 },
          { type: "num", q: "Combien de centaines entières dans 3 456 ?", answer: 34 },
          { type: "qcm", q: "Quel est le plus grand nombre ?", choices: ["4 521", "4 512"], answer: 0 },
          { type: "num", q: "84 ÷ 4 = ?", answer: 21 },
          { type: "num", q: "100 × 10 = ?", answer: 1000 },
          { type: "num", q: "Un fermier a 236 poules. Il en vend 89. Combien lui en reste-t-il ?", answer: 147 },
          { type: "num", q: "7 × 8 = ?", answer: 56 },
          { type: "num", q: "9 × 7 = ?", answer: 63 }
        ]
      }
    ]
  }
};
