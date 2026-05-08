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
