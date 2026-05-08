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