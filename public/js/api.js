// --- Lecke betöltése (táblaállás + feladat) ---
async function loginOrCreateUser(username) {
  try {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Nem sikerült a felhasználó betöltése.");
    }

    return await res.json();
  } catch (err) {
    console.error("❌ Felhasználó API hiba:", err);
    alert(err.message);
    return null;
  }
}

async function addXpToUser(userId, xp) {
  try {
    const res = await fetch(`/api/users/${userId}/xp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ xp }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Nem sikerült menteni az XP-t.");
    }

    return await res.json();
  } catch (err) {
    console.error("❌ XP mentési hiba:", err);
    return null;
  }
}
async function saveTaskResult(userId, taskId) {
  try {
    const res = await fetch("/api/task-results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        taskId,
        isCorrect: true,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Nem sikerült menteni a feladat eredményét.");
    }

    return await res.json();
  } catch (err) {
    console.error("❌ Feladat eredmény mentési hiba:", err);
    alert(err.message);
    return null;
  }
}
async function fetchLessonsFromApi() {
  try {
    const res = await fetch("/api/lessons");

    if (!res.ok) {
      throw new Error("Nem sikerült lekérni a leckelistát.");
    }

    return await res.json();
  } catch (err) {
    console.error("❌ Leckelista API hiba:", err);
    return [];
  }
}
async function fetchLessonFromApi(id) {
  try {
    const res = await fetch(`/api/lessons/${id}`);
    if (!res.ok) {
      throw new Error("Hiba a lekérésnél");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("❌ API hiba:", err);
    return null;
  }
}