const PROGRESS_STORAGE_KEY = "chessTutorProgressV1";
const CURRENT_USER_STORAGE_KEY = "chessTutorCurrentUser";

// XP / haladás állapot
let progressState = {
  totalXp: 0,
  lessons: {},      // pl. { pawn: { completedTasks: 1, totalTasks: 1, xpEarned: 10 } }
  lastLessonId: null,
};

// Belső táblaállapot: 8×8, minden elem: null vagy { code, type, color }
const boardState = Array.from({ length: 8 }, () =>
  Array.from({ length: 8 }, () => null)
);

// kiválasztott bábu mezője (ha van)
let selectedSquare = null;

// leckéhez tartozó állapot / feladat
let currentLessonId = null;
let currentTask = null;
let availableLessons = [];
let currentStepIndex = 0;
let currentUser = null;
let currentTurn = "white";
