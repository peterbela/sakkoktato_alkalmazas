// @ts-nocheck

// Backend kapcsolat tesztelése
document.getElementById("checkServer").addEventListener("click", async () => {
  try {
    const res = await fetch("/");
    const text = await res.text();
    document.getElementById("response").textContent =
      "✅ Backend válasza: " + text;
  } catch (err) {
    document.getElementById("response").textContent =
      "❌ Nem sikerült kapcsolódni a szerverhez.";
  }
});

const LESSONS = [
  {
    id: "intro",
    title: "Bevezetés: Mi az a sakk?",
    body: `
A sakk egy kétjátékos stratégiai táblajáték. A célod, hogy sakkmattot adj az ellenfél királyának, vagyis olyan helyzetbe hozd, ahol a királyt támadás éri, és nincs szabályos lépés, amivel ki tudna menekülni.

Mindig a világos (fehér) kezd, és a játékosok felváltva lépnek.
    `,
  },
  {
    id: "board",
    title: "A sakktábla felépítése",
    body: `
A sakktábla 8×8-as mezőből áll, világos és sötét négyzetek váltják egymást.

Az oszlopokat betűk jelölik: a, b, c, d, e, f, g, h.  
A sorokat számok jelölik: 1–8-ig.

Egy mezőt egy betű–szám páros ír le, például:  
- "e4": az e oszlop és a 4. sor metszéspontja  
- "a1": bal alsó sarok világos mező.
    `,
  },
  {
    id: "pawn",
    title: "A gyalog lépései",
    body: `
A gyalog a legegyszerűbb, mégis nagyon fontos bábu.

- Egy mezőt lép előre.  
- Az első lépésénél dönthetsz úgy, hogy két mezőt lép előre.  
- Ütni átlósan előre tud: balra-előre vagy jobbra-előre.  
- Soha nem léphet hátra.

A táblán most egy fehér gyalogot látsz az e2 mezőn, előtte és átlósan körülötte néhány bábut. Próbáld ki, milyen lépések engedélyezettek!
    `,
  },
  {
    id: "rook",
    title: "A bástya lépései",
    body: `
A bástya nagyon erős figura, mert hosszú távon mozog:

- Egyenesen léphet: vízszintesen vagy függőlegesen.  
- Annyi mezőt mehet, ameddig útjába nem kerül valami.  
- Nem ugorhat át más bábukat.  
- Ellenfelet úgy üt, hogy rálép a mezőjére.

A bástyák különösen erősek a nyílt oszlopokon.
    `,
  },
  {
    id: "bishop",
    title: "A futó lépései",
    body: `
A futó átlós vonalakon mozog:

- Bármennyi mezőt léphet átlósan.  
- Nem ugorhat át más bábukat.  
- Mindig azon a színű mezőkön marad, amin kezdte (világos vagy sötét).

A két futó együtt hatalmas területeket képes uralni.
    `,
  },
  {
    id: "knight",
    title: "A huszár lépései",
    body: `
A huszár különleges, mert egyedül ő tud átugrani más bábukat.

A huszár L-alakban lép:
- két mezőt egy irányba, majd egy mezőt merőlegesen,  
- vagy fordítva.

Így olyan mezőkre is eljut, ahova más bábu nem.
    `,
  },
  {
    id: "queen",
    title: "A vezér lépései",
    body: `
A vezér a legerősebb bábu a táblán:

- úgy léphet, mint a bástya (egyenesen),  
- és úgy is, mint a futó (átlósan).  

Bármennyi mezőt mehet, amíg nem ütközik akadályba.
    `,
  },
  {
    id: "king",
    title: "A király lépései",
    body: `
A király egy mezőt léphet minden irányba:

- előre, hátra, oldalra, átlósan.

A király nem léphet olyan mezőre, amit az ellenfél támad, ezt hívjuk sakk helyzetnek (sakknak).

A király védelme a legfontosabb, hiszen ha sakkmatt fenyegeti, vége a játéknak.
    `,
  },
  {
    id: "rules",
    title: "Alapszabályok: sakk, sakkmatt, patt",
    body: `
Sakk: a királyt támadás éri.

Sakkmatt: a király sakkban áll, és egyetlen lépéssel sem menekülhet. Ez vereséget jelent.

Patt: a játékos nem tud szabályosan lépni, de nincs sakkban -> döntetlen.

Döntetlen még akkor is lehet, ha:
- többször ugyanaz az állás jön létre (háromszori ismétlés),
- egyik fél sem rendelkezik elég figurával a mattadásra.
    `,
  },
];

// Leckénként hány feladat van (most mindegyiknél 1, később bővíthető)
const LESSON_TASK_TOTALS = {
  intro: 1,
  board: 1,
  pawn: 1,
  rook: 1,
  bishop: 1,
  knight: 1,
  queen: 1,
  king: 1,
  rules: 1,
};


// Felváltva lépnek a világos és sötét bábuk
function getTurnLabel() {
  return currentTurn === "white" ? "Világos" : "Sötét";
}

function updateTurnUi() {
  const turnText = document.getElementById("turnText");
  if (turnText) {
    turnText.textContent = `${getTurnLabel()} következik.`;
  }
}

function switchTurn() {
  currentTurn = currentTurn === "white" ? "black" : "white";
  updateTurnUi();
}




// --- Sakktábla generálás ---
function generateChessboard() {
  const board = document.getElementById("chessboard");
  board.innerHTML = "";

  const files = "abcdefgh";

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div");
      square.classList.add("square");

      // mező színe
      if ((row + col) % 2 === 0) {
        square.classList.add("white");
      } else {
        square.classList.add("black");
      }

      square.dataset.row = row;
      square.dataset.col = col;

      // mezőjelölések
      const rank = 8 - row; // 8 felül → 1 alul
      const file = files[col]; // a–h balról jobbra

      // BAL SZÉLSŐ OSZLOP: szám (rank)
      if (col === 0) {
        const rankDiv = document.createElement("div");
        rankDiv.classList.add("square-rank");
        rankDiv.textContent = rank;
        square.appendChild(rankDiv);
      }

      // ALSÓ SOR: betű (file)
      if (row === 7) {
        const fileDiv = document.createElement("div");
        fileDiv.classList.add("square-file");
        fileDiv.textContent = file;
        square.appendChild(fileDiv);
      }

      square.addEventListener("click", onSquareClick);

      board.appendChild(square);
    }
  }

  renderPieces();
}

// --- Bábuk kirajzolása boardState alapján ---
function renderPieces() {
  const squares = document.querySelectorAll(".square");

  // csak a korábbi bábu-képeket töröljük, a jelöléseket NEM
  squares.forEach((sq) => {
    const imgs = sq.querySelectorAll("img");
    imgs.forEach((img) => img.remove());
  });

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = boardState[row][col];
      if (piece) {
        const selector =
          '.square[data-row="' + row + '"][data-col="' + col + '"]';
        const square = document.querySelector(selector);
        if (!square) continue;
        const img = document.createElement("img");
        img.src = PIECE_IMAGES[piece.code];
        img.alt = piece.code;
        square.appendChild(img);
      }
    }
  }
}

function clearBoardState() {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      boardState[r][c] = null;
    }
  }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      // Alapértelmezett struktúra megtartása
      progressState = {
        totalXp: parsed.totalXp || 0,
        lessons: parsed.lessons || {},
        lastLessonId: parsed.lastLessonId || null,
      };
    }
  } catch (e) {
    console.error("Nem sikerült betölteni a haladást:", e);
  }
}

function saveProgress() {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressState));
  } catch (e) {
    console.error("Nem sikerült elmenteni a haladást:", e);
  }
}

function updateProgressUi() {
  const xpEl = document.getElementById("xpValue");
  if (xpEl) {
    xpEl.textContent = currentUser ? currentUser.total_xp.toString() : "0";
  }

  const lessonProgEl = document.getElementById("lessonProgress");
  if (lessonProgEl) {
    const lessonId = currentLessonId;

    if (!lessonId) {
      lessonProgEl.textContent = "";
      return;
    }

    const meta = LESSONS.find((l) => l.id === lessonId);
    const name = meta ? meta.title : lessonId;

    const stored = progressState.lessons[lessonId];
    const total =
      (stored && stored.totalTasks) ||
      LESSON_TASK_TOTALS[lessonId] ||
      1;
    const completed = stored ? stored.completedTasks || 0 : 0;

    lessonProgEl.textContent = `${name}: ${completed}/${total} feladat teljesítve`;
  }
}

function completeCurrentTask() {
  if (!currentLessonId || !currentTask) return;

  const lessonId = currentLessonId;
  const totalTasks = LESSON_TASK_TOTALS[lessonId] || 1;

  let stored = progressState.lessons[lessonId];
  if (!stored) {
    stored = {
      completedTasks: 0,
      totalTasks: totalTasks,
      xpEarned: 0,
    };
  }

  stored.completedTasks = Math.min(stored.completedTasks + 1, stored.totalTasks);
  progressState.lessons[lessonId] = stored;
  progressState.lastLessonId = lessonId;

  saveProgress();
  updateProgressUi();

  if (!currentUser) {
    setTaskFeedback(
      "A feladat helyes, de XP mentéshez előbb jelentkezz be felhasználónévvel.",
      false
    );
    return;
  }

  saveTaskResult(currentUser.id, currentTask.id).then((result) => {
    if (!result) return;

    currentUser = result.user;
    saveCurrentUser();
    updateUserUi();
    updateProgressUi();
    updateLessonLocks();

    if (result.alreadyCompleted) {
      setTaskFeedback(
        "✅ Jó megoldás! Ezt a feladatot már korábban teljesítetted, ezért most nem kaptál új XP-t.",
        true
      );
    } else {
      setTaskFeedback(
        `✅ Jó megoldás! +${result.xpAwarded} XP jóváírva.`,
        true
      );
    }
  });
}


function initProgress() {
  loadProgress();

  // ha van utolsó lecke mentve, arra ugrunk vissza, különben intro
  const candidate = progressState.lastLessonId;
  const hasCandidate = !!LESSONS.find((l) => l.id === candidate);
  const startLessonId = hasCandidate ? candidate : "intro";

  loadLesson(startLessonId);
  updateProgressUi();
}

// --- Feladat állapot beállítása ---
function setTask(task) {
  currentTask = task;
  currentStepIndex = 0;

  const taskTextEl = document.getElementById("taskText");
  const taskFeedbackEl = document.getElementById("taskFeedback");

  if (taskTextEl) {
  if (task && task.type === "two-step") {
    taskTextEl.textContent = task.description + " (1. lépés)";
  } else if (task && task.type === "two-turns") {
    taskTextEl.textContent = task.description + " (1. lépés: világos)";
  } else {
    taskTextEl.textContent = task ? task.description : "";
  }
}

  if (taskFeedbackEl) {
    taskFeedbackEl.textContent = "";
  }
}
function setTaskFeedback(message, isSuccess) {
  const taskFeedbackEl = document.getElementById("taskFeedback");
  if (!taskFeedbackEl) return;
  taskFeedbackEl.textContent = message || "";
  taskFeedbackEl.style.color = isSuccess ? "green" : "red";
}

// --- Kiemelések törlése ---
function clearHighlights() {
  const squares = document.querySelectorAll(".square");
  squares.forEach((sq) => {
    sq.classList.remove(
      "highlight-move",
      "highlight-capture",
      "selected-square"
    );
  });
}






function updateUserUi() {
  const currentUserText = document.getElementById("currentUserText");

  if (!currentUserText) return;

  if (!currentUser) {
    currentUserText.textContent = "Nincs aktív felhasználó.";
    return;
  }

  currentUserText.textContent = `Aktív felhasználó: ${currentUser.username} | Szint: ${currentUser.level} | XP: ${currentUser.total_xp}`;
}

function saveCurrentUser() {
  if (!currentUser) return;
  localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));
}

function loadCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (!raw) return;

    currentUser = JSON.parse(raw);
  } catch (e) {
    console.error("Nem sikerült betölteni az aktív felhasználót:", e);
  }
}

function setupUserPanel() {
  const input = document.getElementById("usernameInput");
  const button = document.getElementById("loginBtn");

  if (!input || !button) return;

  button.addEventListener("click", async () => {
    const username = input.value.trim();

    if (username.length < 2) {
      alert("A felhasználónév legalább 2 karakter legyen.");
      return;
    }

    const user = await loginOrCreateUser(username);
    if (!user) return;

    currentUser = user;
    saveCurrentUser();
    updateUserUi();
    updateProgressUi();
    updateLessonLocks();
  });
}

function renderDefaultChecklist() {
  const checklistEl = document.getElementById("checklist");
  if (!checklistEl) return;

  checklistEl.innerHTML = "";

  const checklistItems = [
    "Mi a feladat pontos célja?",
    "Melyik bábu tudja ezt a célt teljesíteni?",
    "Szabályos-e a kiválasztott lépés?",
    "Mit változtat a lépés a táblán?",
    "Az ellenfél tud-e azonnal válaszolni rá?",
    "A lépés közelebb visz a feladat megoldásához?",
  ];

  checklistItems.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    checklistEl.appendChild(li);
  });
}



function setupBoardForLesson(id) {
  if (id === "intro") {
    setStartingPosition();
    return;
  }

  if (id === "board") {
    return; // üres tábla
  }

  if (id === "pawn") {
    boardState[6][4] = { code: "wP", type: "P", color: "white" }; // e2
    return;
  }

  if (id === "rook") {
    boardState[4][3] = { code: "wR", type: "R", color: "white" }; // d4
    boardState[1][3] = { code: "bN", type: "N", color: "black" }; // d7
    return;
  }

  if (id === "bishop") {
    boardState[7][2] = { code: "wB", type: "B", color: "white" }; // c1
    boardState[3][6] = { code: "bP", type: "P", color: "black" }; // g5
    return;
  }

  if (id === "knight") {
    boardState[7][6] = { code: "wN", type: "N", color: "white" }; // g1
    return;
  }

  if (id === "queen") {
    boardState[7][3] = { code: "wQ", type: "Q", color: "white" }; // d1
    boardState[3][7] = { code: "bP", type: "P", color: "black" }; // h5
    return;
  }

  if (id === "king") {
    boardState[7][4] = { code: "wK", type: "K", color: "white" }; // e1
    return;
  }

 if (id === "rules") {
  // Életszerűbb, középjáték-szerű állás sakkadás gyakorlásához.
  boardState[0][0] = { code: "bR", type: "R", color: "black" }; // a8
  boardState[0][2] = { code: "bB", type: "B", color: "black" }; // c8
  boardState[0][4] = { code: "bK", type: "K", color: "black" }; // e8
  boardState[0][7] = { code: "bR", type: "R", color: "black" }; // h8

  boardState[1][0] = { code: "bP", type: "P", color: "black" }; // a7
  boardState[1][1] = { code: "bP", type: "P", color: "black" }; // b7
  boardState[1][3] = { code: "bP", type: "P", color: "black" }; // d7
  boardState[1][6] = { code: "bP", type: "P", color: "black" }; // g7
  boardState[1][7] = { code: "bP", type: "P", color: "black" }; // h7

  boardState[2][2] = { code: "bN", type: "N", color: "black" }; // c6
  boardState[2][5] = { code: "bN", type: "N", color: "black" }; // f6

  boardState[7][3] = { code: "wQ", type: "Q", color: "white" }; // d1

  boardState[4][2] = { code: "wB", type: "B", color: "white" }; // c4
  boardState[5][5] = { code: "wN", type: "N", color: "white" }; // f3

  boardState[6][0] = { code: "wP", type: "P", color: "white" }; // a2
  boardState[6][1] = { code: "wP", type: "P", color: "white" }; // b2
  boardState[6][3] = { code: "wP", type: "P", color: "white" }; // d2
  boardState[6][5] = { code: "wP", type: "P", color: "white" }; // f2
  boardState[6][6] = { code: "wP", type: "P", color: "white" }; // g2
  boardState[6][7] = { code: "wP", type: "P", color: "white" }; // h2

  boardState[7][0] = { code: "wR", type: "R", color: "white" }; // a1
  boardState[7][4] = { code: "wK", type: "K", color: "white" }; // e1
  boardState[7][7] = { code: "wR", type: "R", color: "white" }; // h1
  return;
}

}

async function loadLesson(id) {
  currentLessonId = id;

  const lessonData = await fetchLessonFromApi(id);
  if (!lessonData) return;

  const titleEl = document.getElementById("lessonTitle");
  const bodyEl = document.getElementById("lessonBody");

  if (titleEl) titleEl.textContent = lessonData.title;
  if (bodyEl) bodyEl.textContent = lessonData.body.trim();

  // reset
  clearBoardState();
  clearHighlights();
  selectedSquare = null;
  currentTask = null;
  currentTurn = "white";
  updateTurnUi();


  // 👉 FELADATOK BACKENDBŐL
  if (lessonData.tasks && lessonData.tasks.length > 0) {
    const task = lessonData.tasks[0];
     // ✅ CHECKLIST megjelenítés
  renderDefaultChecklist();
    if (task.type === "click-square") {
      setTask({
        id: task.id,
        type: "click-square",
        target: {
          row: task.target_row,
          col: task.target_col,
        },
        description: task.description,
      });
    }

    else if (task.type === "move-piece") {
setTask({
  id: task.id,
  type: "move-piece",
  from: {
    row: task.from_row,
    col: task.from_col,
  },
  to: {
    row: task.to_row,
    col: task.to_col,
  },
  description: task.description,
  wrongPieceMessage: task.wrong_piece_message,
  wrongTargetMessage: task.wrong_target_message,
  tacticalMessage: task.tactical_message,
});
    }
    else if (task.type === "two-step") {
  setTask({
    id: task.id,
    type: "two-step",
    description: task.description,
    steps: [
      {
        from: {
          row: task.from_row,
          col: task.from_col,
        },
        to: {
          row: task.to_row,
          col: task.to_col,
        },
      },
      {
        from: {
          row: task.from_row2,
          col: task.from_col2,
        },
        to: {
          row: task.to_row2,
          col: task.to_col2,
        },
      },
    ],
  });
}
else if (task.type === "two-turns") {
  setTask({
    id: task.id,
    type: "two-turns",
    description: task.description,
    tacticalMessage: task.tactical_message,
  });
}
else if (task.type === "give-check") {
  setTask({
    id: task.id,
    type: "give-check",
    description: task.description,
    targetColor: task.target_color || "black",
    requiredPieceType: task.required_piece_type || null,
    requiredPieceColor: task.required_piece_color || null,
    wrongPieceMessage: task.wrong_piece_message,
    wrongTargetMessage: task.wrong_target_message,
    tacticalMessage: task.tactical_message,
  });
}
  }


  setupBoardForLesson(id);
  renderPieces();
  updateProgressUi();
}

function updateLessonLocks() {
  const buttons = document.querySelectorAll("#lessonNav button");
  const userLevel = currentUser ? currentUser.level : 1;

  buttons.forEach((button) => {
    const lessonId = button.dataset.lesson;
    const lesson = availableLessons.find((item) => item.id === lessonId);

    if (!lesson) return;

    const requiredLevel = lesson.level_required || 1;
    const isLocked = userLevel < requiredLevel;

    button.disabled = isLocked;
    button.classList.toggle("lockedLesson", isLocked);

    if (isLocked) {
      button.title = `Ehhez a leckéhez ${requiredLevel}. szint szükséges.`;
    } else {
      button.title = "";
    }
  });
}

async function setupLessonNav() {
  const nav = document.getElementById("lessonNav");
  if (!nav) return;

  availableLessons = await fetchLessonsFromApi();
  updateLessonLocks();

  nav.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const id = target.dataset.lesson;
    if (!id) return;

    const lesson = availableLessons.find((item) => item.id === id);
    const userLevel = currentUser ? currentUser.level : 1;

    if (lesson && userLevel < lesson.level_required) {
      setTaskFeedback(
        `Ez a lecke csak ${lesson.level_required}. szinttől érhető el.`,
        false
      );
      return;
    }

    loadLesson(id);
  });
}


// --- Kattintás egy mezőre: feladatkezelés + kijelöl + lép ---
function onSquareClick(e) {
  const square = e.currentTarget;
  const row = parseInt(square.dataset.row, 10);
  const col = parseInt(square.dataset.col, 10);
  const clickedPiece = boardState[row][col];

  // 1) Ha "kattints erre a mezőre" típusú feladat van
  if (currentTask && currentTask.type === "click-square") {
    const target = currentTask.target;
    if (target && target.row === row && target.col === col) {
      setTaskFeedback("✅ Ügyes! A jó mezőt választottad.", true);
      completeCurrentTask();
    } else {
      setTaskFeedback("❌ Ez most nem a keresett mező. Próbáld újra!", false);
    }
    // ilyen feladatnál nem mozgatunk bábukat
    return;
  }

  // 2) Innentől jön a sima lépés logika

  // Ha még nincs kiválasztott bábu
  if (!selectedSquare) {
    clearHighlights();

    if (!clickedPiece) {
      // üres mezőre kattintottunk → semmi
      return;
    }

    if (clickedPiece.color !== currentTurn) {
  setTaskFeedback(`${getTurnLabel()} következik, ezért most csak ${getTurnLabel().toLowerCase()} bábuval léphetsz.`, false);
  return;
}

    // kiválasztjuk a bábut
    selectedSquare = { row, col };
    square.classList.add("selected-square");

    const moves = getMovesForPiece(clickedPiece, row, col);

    moves.forEach((move) => {
      const target = document.querySelector(
        '.square[data-row="' + move.row + '"][data-col="' + move.col + '"]'
      );
      if (!target) return;
      if (move.isCapture) {
        target.classList.add("highlight-capture");
      } else {
        target.classList.add("highlight-move");
      }
    });

    return;
  }

  // Ha MÁR van kiválasztott bábu
  const fromRow = selectedSquare.row;
  const fromCol = selectedSquare.col;
  const selectedPiece = boardState[fromRow][fromCol];

  // ha ugyanarra kattintunk, mint ami ki volt jelölve → megszüntetjük a kijelölést
  if (fromRow === row && fromCol === col) {
    clearHighlights();
    selectedSquare = null;
    return;
  }

  // kiszámoljuk a kiválasztott bábu érvényes lépéseit
  const legalMoves = getMovesForPiece(selectedPiece, fromRow, fromCol);
  const targetMove = legalMoves.find((m) => m.row === row && m.col === col);

 if (targetMove) {
  const capturedPiece = boardState[row][col];

  if (capturedPiece && capturedPiece.type === "K") {
    setTaskFeedback("A királyt nem lehet leütni. Sakkot kell adni, nem levenni a tábláról.", false);
    selectedSquare = null;
    clearHighlights();
    return;
  }

  // Ideiglenesen végrehajtjuk a lépést, hogy ellenőrizni tudjuk a sakkhelyzetet.
  boardState[row][col] = selectedPiece;
  boardState[fromRow][fromCol] = null;

  if (isKingInCheck(selectedPiece.color)) {
    boardState[fromRow][fromCol] = selectedPiece;
    boardState[row][col] = capturedPiece;

    setTaskFeedback("Ezt a lépést nem teheted meg, mert a saját királyod sakkban maradna vagy sakkba kerülne.", false);
    selectedSquare = null;
    clearHighlights();
    renderPieces();
    return;
  }

  if (currentTask && currentTask.type === "move-piece") {
    const t = currentTask;
    const correctFrom =
      t.from && t.from.row === fromRow && t.from.col === fromCol;
    const correctTo =
      t.to && t.to.row === row && t.to.col === col;

    if (correctFrom && correctTo) {
      setTaskFeedback(
        "✅ Szuper! Pontosan azt a lépést hajtottad végre, amit a feladat kért.",
        true
      );
      completeCurrentTask();
    } else {
      boardState[fromRow][fromCol] = selectedPiece;
      boardState[row][col] = capturedPiece;

      if (!correctFrom && currentTask.wrongPieceMessage) {
        setTaskFeedback(currentTask.wrongPieceMessage, false);
      } else if (!correctTo && currentTask.wrongTargetMessage) {
        setTaskFeedback(currentTask.wrongTargetMessage, false);
      } else {
        setTaskFeedback(
          currentTask.tacticalMessage ||
            "Ez a lépés szabályos volt, de nem oldja meg a feladatot.",
          false
        );
      }

      selectedSquare = null;
      clearHighlights();
      renderPieces();
      return;
    }
  }

  if (currentTask && currentTask.type === "two-step") {
    const step = currentTask.steps[currentStepIndex];

    const correctFrom =
      step.from.row === fromRow && step.from.col === fromCol;
    const correctTo =
      step.to.row === row && step.to.col === col;

    if (correctFrom && correctTo) {
      currentStepIndex++;

      if (currentStepIndex === currentTask.steps.length) {
        setTaskFeedback("✅ Kész! Mindkét lépés helyes volt.", true);
        completeCurrentTask();
      } else {
        setTaskFeedback("✅ Jó lépés! Most jön a következő.", true);

        const taskTextEl = document.getElementById("taskText");
        if (taskTextEl) {
          taskTextEl.textContent =
            currentTask.description +
            ` (${currentStepIndex + 1}. lépés)`;
        }
      }
    } else {
      boardState[fromRow][fromCol] = selectedPiece;
      boardState[row][col] = capturedPiece;

      setTaskFeedback("Ez szabályos lépés volt, de nem a feladatban kért lépéssor része.", false);
      selectedSquare = null;
      clearHighlights();
      renderPieces();
      return;
    }
  }

if (currentTask && currentTask.type === "two-turns") {
  const expectedColor = currentStepIndex === 0 ? "white" : "black";

  if (selectedPiece.color !== expectedColor) {
    boardState[fromRow][fromCol] = selectedPiece;
    boardState[row][col] = capturedPiece;

    setTaskFeedback(
      currentTask.tacticalMessage ||
        "Figyelj a lépéssorrendre: először világos, utána sötét következik.",
      false
    );

    selectedSquare = null;
    clearHighlights();
    renderPieces();
    return;
  }

  currentStepIndex++;

  if (currentStepIndex === 1) {
    setTaskFeedback("✅ Jó lépés! Most sötét következik.", true);

    const taskTextEl = document.getElementById("taskText");
    if (taskTextEl) {
      taskTextEl.textContent =
        currentTask.description + " (2. lépés: sötét)";
    }
  } else {
    setTaskFeedback("✅ Kész! Világos és sötét is lépett szabályosan.", true);
    completeCurrentTask();
  }
}

  if (currentTask && currentTask.type === "give-check") {
  const targetColor = currentTask.targetColor || "black";

  const correctPieceType =
    !currentTask.requiredPieceType ||
    selectedPiece.type === currentTask.requiredPieceType;

  const correctPieceColor =
    !currentTask.requiredPieceColor ||
    selectedPiece.color === currentTask.requiredPieceColor;

  const gaveCheck = isKingInCheck(targetColor);

  if (gaveCheck && correctPieceType && correctPieceColor) {
    setTaskFeedback("✅ Jó lépés! A megadott bábuval sakkot adtál.", true);
    completeCurrentTask();
  } else {
    boardState[fromRow][fromCol] = selectedPiece;
    boardState[row][col] = capturedPiece;

    if (gaveCheck && (!correctPieceType || !correctPieceColor)) {
      setTaskFeedback(
        currentTask.wrongPieceMessage ||
          "Sakkot adtál, de nem azzal a bábuval, amit a feladat kért.",
        false
      );
    } else {
      setTaskFeedback(
        currentTask.wrongTargetMessage ||
          currentTask.tacticalMessage ||
          "Ez szabályos lépés volt, de nem adott sakkot.",
        false
      );
    }

    selectedSquare = null;
    clearHighlights();
    renderPieces();
    return;
  }
}

  switchTurn();

  selectedSquare = null;
  clearHighlights();
  renderPieces();
  return;
}

  // Ha nem érvényes mezőre kattintottunk, de ott van egy SAJÁT bábu → váltunk kijelölést
  if (clickedPiece && clickedPiece.color === selectedPiece.color) {
    clearHighlights();
    selectedSquare = { row, col };
    square.classList.add("selected-square");

    const moves = getMovesForPiece(clickedPiece, row, col);
    moves.forEach((move) => {
      const target = document.querySelector(
        '.square[data-row="' + move.row + '"][data-col="' + move.col + '"]'
      );
      if (!target) return;
      if (move.isCapture) {
        target.classList.add("highlight-capture");
      } else {
        target.classList.add("highlight-move");
      }
    });
    return;
  }

  // különben: semmisítjük a kijelölést
  clearHighlights();
  selectedSquare = null;
}


// --- Véletlen állás: 1 "fő" bábu + még 3 random bábu ---
function placeRandomPosition() {
  clearBoardState();
  clearHighlights();
  selectedSquare = null;
  setTask(null);

  // számlálók: hány király / gyalog van színenként
  let whiteKing = 0;
  let blackKing = 0;
  let whitePawns = 0;
  let blackPawns = 0;

  // --- FŐ BÁBU (amin kattintani fogsz) ---
  let mainRow, mainCol, mainKey, mainColor, mainType;

  while (true) {
    mainRow = Math.floor(Math.random() * 8);
    mainCol = Math.floor(Math.random() * 8);

    mainKey = piecesList[Math.floor(Math.random() * piecesList.length)];
    mainColor = mainKey[0] === "w" ? "white" : "black";
    mainType = mainKey[1]; // K, Q, R, B, N, P

    // király limit: színenként max 1
    if (mainType === "K") {
      if (mainColor === "white" && whiteKing >= 1) continue;
      if (mainColor === "black" && blackKing >= 1) continue;
    }

    // gyalog limit + ésszerű sorok
    if (mainType === "P") {
      // ne legyen fehér gyalog az utolsó sorban
      if (mainColor === "white" && mainRow === 7) continue;

      // ne legyen fekete gyalog az első sorban
      if (mainColor === "black" && mainRow === 0) continue;

      // darabszám limit: max 8 színenként
      if (mainColor === "white" && whitePawns >= 8) continue;
      if (mainColor === "black" && blackPawns >= 8) continue;
    }

    break; // ha idáig eljutottunk, elfogadjuk
  }

  boardState[mainRow][mainCol] = {
    code: mainKey,
    type: mainType,
    color: mainColor,
  };

  // számlálók frissítése
  if (mainType === "K") {
    if (mainColor === "white") whiteKing++;
    else blackKing++;
  }
  if (mainType === "P") {
    if (mainColor === "white") whitePawns++;
    else blackPawns++;
  }

  // --- Még 3 random bábu ---
  for (let i = 0; i < 3; i++) {
    let r, c, key, color, type;

    while (true) {
      r = Math.floor(Math.random() * 8);
      c = Math.floor(Math.random() * 8);
      if (boardState[r][c] !== null) continue;

      key = piecesList[Math.floor(Math.random() * piecesList.length)];
      color = key[0] === "w" ? "white" : "black";
      type = key[1];

      // király limit: összesen max 2 király, és színenként max 1
      if (type === "K") {
        const totalKings = whiteKing + blackKing;
        if (totalKings >= 2) {
          continue;
        }
        if (color === "white" && whiteKing >= 1) continue;
        if (color === "black" && blackKing >= 1) continue;

        // ne legyen a másik király mellett
        let ok = true;
        for (let rr = 0; rr < 8; rr++) {
          for (let cc = 0; cc < 8; cc++) {
            const p = boardState[rr][cc];
            if (p && p.type === "K") {
              if (kingsAreAdjacent(r, c, rr, cc)) {
                ok = false;
              }
            }
          }
        }
        if (!ok) continue;
      }

      // gyalog limit + ésszerű sorok
      if (type === "P") {
        if (color === "white" && r === 7) continue;
        if (color === "black" && r === 0) continue;

        if (color === "white" && whitePawns >= 8) continue;
        if (color === "black" && blackPawns >= 8) continue;
      }

      break; // elfogadható hely + figura
    }

    boardState[r][c] = {
      code: key,
      type: type,
      color: color,
    };

    // számlálók frissítése
    if (type === "K") {
      if (color === "white") whiteKing++;
      else blackKing++;
    }
    if (type === "P") {
      if (color === "white") whitePawns++;
      else blackPawns++;
    }
  }

  renderPieces();
}

function setStartingPosition() {
  clearBoardState();
  clearHighlights();
  selectedSquare = null;
  currentTurn = "white";
  updateTurnUi();


  // Fekete fő bábuk (8. sor = row 0)
  const blackBackRank = ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"];
  for (let col = 0; col < 8; col++) {
    const code = blackBackRank[col];
    boardState[0][col] = {
      code: code,
      type: code[1],
      color: "black",
    };
  }

  // Fekete gyalogok (7. sor = row 1)
  for (let col = 0; col < 8; col++) {
    boardState[1][col] = {
      code: "bP",
      type: "P",
      color: "black",
    };
  }

  // Fehér gyalogok (2. sor = row 6)
  for (let col = 0; col < 8; col++) {
    boardState[6][col] = {
      code: "wP",
      type: "P",
      color: "white",
    };
  }

  // Fehér fő bábuk (1. sor = row 7)
  const whiteBackRank = ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"];
  for (let col = 0; col < 8; col++) {
    const code = whiteBackRank[col];
    boardState[7][col] = {
      code: code,
      type: code[1],
      color: "white",
    };
  }

  renderPieces();
}

// gomb eseménykezelő
document
  .getElementById("randomPieceBtn")
  .addEventListener("click", placeRandomPosition);
document
  .getElementById("startPositionBtn")
  .addEventListener("click", setStartingPosition);

// induláskor sakktábla kirajzolása + leckék és haladás betöltése
generateChessboard();
setupLessonNav();
setupUserPanel();
updateUserUi();
initProgress();