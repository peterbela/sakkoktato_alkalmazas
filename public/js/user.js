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
