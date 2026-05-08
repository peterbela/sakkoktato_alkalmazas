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

    const meta = availableLESSONS.find((l) => l.id === lessonId);
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
  if (!currentLessonId || !currentTask) {
    setTaskFeedback("A feladat teljesült, de a rendszer nem találja az aktuális feladat adatait.", false);
    return;
  }

  if (!currentTask.id) {
    console.error("Hiányzó currentTask.id:", currentTask);
    setTaskFeedback("A feladat helyes, de az XP mentés nem sikerült, mert hiányzik a feladat azonosítója.", false);
    return;
  }

  const lessonId = currentLessonId;
  const totalTasks = LESSON_TASK_TOTALS[lessonId] || currentTasks.length || 1;

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
    if (!result) {
      setTaskFeedback(
        "A feladat helyes, de az XP mentése közben hiba történt.",
        false
      );
      return;
    }

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
  const hasCandidate = !!availableLESSONS.find((l) => l.id === candidate);
  const startLessonId = hasCandidate ? candidate : "intro";

  loadLesson(startLessonId);
  updateProgressUi();
}