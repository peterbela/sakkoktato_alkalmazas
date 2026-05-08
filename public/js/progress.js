// Leckénként hány feladat van.
// Ez csak tartalék érték, a valódi haladást a backend adja vissza.
const LESSON_TASK_TOTALS = {
  intro: 1,
  board: 1,
  pawn: 1,
  rook: 2,
  bishop: 2,
  knight: 4,
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

// Backendből érkező haladás átalakítása a frontend által használt formára
function applyBackendProgress(progressRows) {
  if (!Array.isArray(progressRows)) return;

  const lessons = {};

  progressRows.forEach((row) => {
    lessons[row.lesson_id] = {
      completedTasks: row.completed_tasks || 0,
      totalTasks: row.total_tasks || 0,
      xpEarned: row.xp_earned || 0,
    };
  });

  progressState.lessons = lessons;
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

    const meta = availableLessons.find((l) => l.id === lessonId);
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

function getNextTaskSuggestion() {
  return "A folytatáshoz kattints a „Következő feladat” gombra, vagy válassz másik leckét a menüből.";
}

function getLevelUpMessage(previousLevel, newLevel) {
  if (!newLevel || newLevel <= previousLevel) return "";

  if (newLevel === 2) {
    return " 🎉 Szintet léptél! Elérted a 2. szintet, így elérhetővé váltak a futó és huszár leckék.";
  }

  if (newLevel === 3) {
    return " 🎉 Szintet léptél! Elérted a 3. szintet, így elérhetővé váltak a nehezebb szabály- és tisztfeladatok.";
  }

  return ` 🎉 Szintet léptél! Most már ${newLevel}. szintű játékos vagy.`;
}

function completeCurrentTask() {
  if (!currentLessonId || !currentTask) {
    setTaskFeedback(
      "A feladat teljesült, de a rendszer nem találja az aktuális feladat adatait.",
      false
    );
    return;
  }

  if (!currentTask.id) {
    console.error("Hiányzó currentTask.id:", currentTask);
    setTaskFeedback(
      "A feladat helyes, de az XP mentés nem sikerült, mert hiányzik a feladat azonosítója.",
      false
    );
    return;
  }

  if (!currentUser) {
    setTaskFeedback(
      "A feladat helyes, de XP mentéshez előbb jelentkezz be felhasználónévvel.",
      false
    );
    return;
  }

  const previousLevel = currentUser.level || 1;

  saveTaskResult(currentUser.id, currentTask.id).then(async (result) => {
    if (!result) {
      setTaskFeedback(
        "A feladat helyes, de az XP mentése közben hiba történt.",
        false
      );
      return;
    }

    currentUser = result.user;
    saveCurrentUser();

    // Itt már nem kézzel növeljük a haladást,
    // hanem újra lekérjük a backendből.
    const backendProgress = await fetchUserProgress(currentUser.id);
    applyBackendProgress(backendProgress);

    // Ezt még localStorage-ban hagyjuk, mert csak kényelmi adat:
    // melyik lecke volt utoljára megnyitva.
    progressState.lastLessonId = currentLessonId;

    saveProgress();
    updateUserUi();
    updateProgressUi();
    updateLessonLocks();

    const nextSuggestion = getNextTaskSuggestion();
    const levelUpMessage = getLevelUpMessage(previousLevel, currentUser.level);

    if (result.alreadyCompleted) {
      setTaskFeedback(
        `✅ Jó megoldás! Ezt a feladatot már korábban teljesítetted, ezért most nem kaptál új XP-t. ${nextSuggestion}`,
        true
      );
    } else {
      setTaskFeedback(
        `✅ Jó megoldás! +${result.xpAwarded} XP jóváírva.${levelUpMessage} ${nextSuggestion}`,
        true
      );
    }
  });
}

async function initProgress() {
  loadProgress();

  // Ha van bejelentkezett felhasználó, akkor a haladást backendből kérjük le.
  if (currentUser && currentUser.id) {
    const backendProgress = await fetchUserProgress(currentUser.id);
    applyBackendProgress(backendProgress);
    saveProgress();
  }

 const candidate = progressState.lastLessonId;
const hasCandidate = !!availableLessons.find((l) => l.id === candidate);
const canOpenCandidate =
  hasCandidate && typeof canCurrentUserOpenLesson === "function"
    ? canCurrentUserOpenLesson(candidate)
    : false;

const startLessonId = canOpenCandidate
  ? candidate
  : typeof getFirstAvailableLessonId === "function"
    ? getFirstAvailableLessonId()
    : "intro";

loadLesson(startLessonId);
updateProgressUi();
}