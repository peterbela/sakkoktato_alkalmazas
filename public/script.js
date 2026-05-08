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