const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const db = require("./db/database");
const createSchema = require("./db/schema");
const seedDatabase = require("./db/seed");
const createLessonRoutes = require("./routes/lessons");
const createUserRoutes = require("./routes/users");
const createTaskResultRoutes = require("./routes/taskResults");

// JSON kérések feldolgozása
app.use(express.json());

createSchema(db);
seedDatabase(db);

// Statikus fájlok (frontend) kiszolgálása
app.use(express.static("public"));

app.use("/api/lessons", createLessonRoutes(db));
app.use("/api/users", createUserRoutes(db));
app.use("/api/task-results", createTaskResultRoutes(db));
// Szerver indítása
app.listen(PORT, () => {
  console.log(`🌐 Szerver fut: http://localhost:${PORT}`);
});
