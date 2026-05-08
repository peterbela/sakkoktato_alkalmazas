const express = require("express");
const app = express();
const PORT = 3000;

const db = require("./db/database");
const createSchema = require("./db/schema");
const seedDatabase = require("./db/seed");
const createLessonRoutes = require("./routes/lessons");
const createUserRoutes = require("./routes/users");

// JSON kérések feldolgozása
app.use(express.json());

createSchema(db);
seedDatabase(db);

// Statikus fájlok (frontend) kiszolgálása
app.use(express.static("public"));

app.use("/api/lessons", createLessonRoutes(db));
app.use("/api/users", createUserRoutes(db));

// Feladatmegoldás mentése és XP jóváírása, ha még nem kapott érte pontot
app.post("/api/task-results", (req, res) => {
  const { userId, taskId, isCorrect } = req.body;

  if (!userId || !taskId) {
    return res.status(400).json({
      error: "Hiányzó felhasználó vagy feladat azonosító.",
    });
  }

  if (!isCorrect) {
    return res.status(400).json({
      error: "Csak helyes megoldást mentünk XP jóváíráshoz.",
    });
  }

  db.get(
    `
    SELECT id
    FROM user_task_results
    WHERE user_id = ? AND task_id = ? AND is_correct = 1
    `,
    [userId, taskId],
    (checkErr, existingResult) => {
      if (checkErr) {
        console.error("❌ Feladatmegoldás ellenőrzési hiba:", checkErr.message);
        return res.status(500).json({
          error: "Nem sikerült ellenőrizni a korábbi megoldást.",
        });
      }

      if (existingResult) {
        db.get(
          `
          SELECT id, username, total_xp, level, created_at
          FROM users
          WHERE id = ?
          `,
          [userId],
          (userErr, user) => {
            if (userErr) {
              console.error("❌ Felhasználó lekérdezési hiba:", userErr.message);
              return res.status(500).json({
                error: "Nem sikerült lekérni a felhasználót.",
              });
            }

            return res.json({
              alreadyCompleted: true,
              xpAwarded: 0,
              user,
            });
          }
        );

        return;
      }

      db.get(
        `
        SELECT xp_reward
        FROM tasks
        WHERE id = ?
        `,
        [taskId],
        (taskErr, task) => {
          if (taskErr) {
            console.error("❌ Feladat lekérdezési hiba:", taskErr.message);
            return res.status(500).json({
              error: "Nem sikerült lekérni a feladatot.",
            });
          }

          if (!task) {
            return res.status(404).json({
              error: "A feladat nem található.",
            });
          }

          const xpReward = task.xp_reward || 10;

          db.run(
            `
            INSERT INTO user_task_results (user_id, task_id, is_correct)
            VALUES (?, ?, 1)
            `,
            [userId, taskId],
            function (insertErr) {
              if (insertErr) {
                console.error("❌ Feladatmegoldás mentési hiba:", insertErr.message);
                return res.status(500).json({
                  error: "Nem sikerült menteni a feladatmegoldást.",
                });
              }

              db.run(
                `
                UPDATE users
                SET
                  total_xp = total_xp + ?,
                  level = CAST((total_xp + ?) / 50 AS INTEGER) + 1
                WHERE id = ?
                `,
                [xpReward, xpReward, userId],
                (xpErr) => {
                  if (xpErr) {
                    console.error("❌ XP frissítési hiba:", xpErr.message);
                    return res.status(500).json({
                      error: "Nem sikerült frissíteni az XP-t.",
                    });
                  }

                  db.get(
                    `
                    SELECT id, username, total_xp, level, created_at
                    FROM users
                    WHERE id = ?
                    `,
                    [userId],
                    (userErr, updatedUser) => {
                      if (userErr) {
                        console.error("❌ Felhasználó visszaolvasási hiba:", userErr.message);
                        return res.status(500).json({
                          error: "Nem sikerült visszaolvasni a felhasználót.",
                        });
                      }

                      res.json({
                        alreadyCompleted: false,
                        xpAwarded: xpReward,
                        user: updatedUser,
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});


// Szerver indítása
app.listen(PORT, () => {
  console.log(`🌐 Szerver fut: http://localhost:${PORT}`);
});
