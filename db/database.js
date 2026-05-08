const sqlite3 = require("sqlite3").verbose();
// Adatbázis létrehozása / megnyitása
const db = new sqlite3.Database("./sakk.db", (err) => {
  if (err) {
    console.error("❌ Adatbázis hiba:", err.message);
  } else {
    console.log("✅ Kapcsolódás az adatbázishoz sikeres.");
  }
});
module.exports = db;