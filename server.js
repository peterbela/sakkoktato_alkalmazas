const express = require("express");
const app = express();
const PORT = 3000;

const db = require("./db/database");
const createSchema = require("./db/schema");
const seedDatabase = require("./db/seed");

// JSON kérések feldolgozása
app.use(express.json());

createSchema(db);
seedDatabase(db);

// Statikus fájlok (frontend) kiszolgálása
app.use(express.static("public"));

// Összes lecke lekérése
app.get("/api/lessons", (req, res) => {
  db.all(
    `
    SELECT id, title, body, level_required, order_index
    FROM lessons
    ORDER BY order_index ASC
    `,
    [],
    (err, rows) => {
      if (err) {
        console.error("❌ Leckék lekérdezési hiba:", err.message);
        return res.status(500).json({ error: "Nem sikerült lekérni a leckéket." });
      }

      res.json(rows);
    }
  );
});

// Egy konkrét lecke lekérése a hozzá tartozó feladattal
app.get("/api/lessons/:id", (req, res) => {
  const lessonId = req.params.id;

  db.get(
    `
    SELECT id, title, body, level_required, order_index
    FROM lessons
    WHERE id = ?
    `,
    [lessonId],
    (err, lesson) => {
      if (err) {
        console.error("❌ Lecke lekérdezési hiba:", err.message);
        return res.status(500).json({ error: "Nem sikerült lekérni a leckét." });
      }

      if (!lesson) {
        return res.status(404).json({ error: "A keresett lecke nem található." });
      }

      db.all(
        `
        SELECT
          id,
          lesson_id,
          type,
          description,
          position_key,
          checklist,
          wrong_piece_message,
          wrong_target_message,
          tactical_message,
          from_row,
          from_col,
          to_row,
          to_col,
          from_row2,
          from_col2,
          to_row2,
          to_col2,
          target_row,
          target_col,
          target_color,
          required_piece_type,
          required_piece_color,
          xp_reward
        FROM tasks
        WHERE lesson_id = ?
        ORDER BY id ASC
        `,
        [lessonId],
        (taskErr, tasks) => {
          if (taskErr) {
            console.error("❌ Feladat lekérdezési hiba:", taskErr.message);
            return res.status(500).json({ error: "Nem sikerült lekérni a feladatokat." });
          }

          res.json({
            ...lesson,
            tasks,
          });
        }
      );
    }
  );
});

// Felhasználó létrehozása vagy betöltése név alapján
app.post("/api/users", (req, res) => {
  const { username } = req.body;

  if (!username || username.trim().length < 2) {
    return res.status(400).json({
      error: "A felhasználónév legalább 2 karakter hosszú legyen.",
    });
  }

  const cleanUsername = username.trim();

  db.get(
    `
    SELECT id, username, total_xp, level, created_at
    FROM users
    WHERE username = ?
    `,
    [cleanUsername],
    (err, existingUser) => {
      if (err) {
        console.error("❌ Felhasználó keresési hiba:", err.message);
        return res.status(500).json({
          error: "Nem sikerült ellenőrizni a felhasználót.",
        });
      }

      if (existingUser) {
        return res.json(existingUser);
      }

      db.run(
        `
        INSERT INTO users (username, total_xp, level)
        VALUES (?, 0, 1)
        `,
        [cleanUsername],
        function (insertErr) {
          if (insertErr) {
            console.error("❌ Felhasználó létrehozási hiba:", insertErr.message);
            return res.status(500).json({
              error: "Nem sikerült létrehozni a felhasználót.",
            });
          }

          res.status(201).json({
            id: this.lastID,
            username: cleanUsername,
            total_xp: 0,
            level: 1,
          });
        }
      );
    }
  );
});

// Felhasználó XP-jének növelése
app.post("/api/users/:id/xp", (req, res) => {
  const userId = req.params.id;
  const { xp } = req.body;

  if (!xp || xp <= 0) {
    return res.status(400).json({
      error: "Érvénytelen XP érték.",
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
  [xp, xp, userId],
    function (err) {
      if (err) {
        console.error("❌ XP frissítési hiba:", err.message);
        return res.status(500).json({
          error: "Nem sikerült frissíteni az XP-t.",
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: "A felhasználó nem található.",
        });
      }

      db.get(
        `
        SELECT id, username, total_xp, level, created_at
        FROM users
        WHERE id = ?
        `,
        [userId],
        (selectErr, updatedUser) => {
          if (selectErr) {
            console.error("❌ Felhasználó visszaolvasási hiba:", selectErr.message);
            return res.status(500).json({
              error: "Az XP frissült, de a felhasználó visszaolvasása sikertelen.",
            });
          }

          res.json(updatedUser);
        }
      );
    }
  );
});
// Felhasználó teljes haladásának lekérése adatbázisból
app.get("/api/users/:id/progress", (req, res) => {
  const userId = req.params.id;

  db.all(
    `
    SELECT
      l.id AS lesson_id,
      l.title AS lesson_title,
      l.level_required,
      l.order_index,
      COUNT(t.id) AS total_tasks,
      COALESCE(SUM(
        CASE
          WHEN utr.id IS NOT NULL THEN 1
          ELSE 0
        END
      ), 0) AS completed_tasks,
      COALESCE(SUM(
        CASE
          WHEN utr.id IS NOT NULL THEN t.xp_reward
          ELSE 0
        END
      ), 0) AS xp_earned
    FROM lessons l
    LEFT JOIN tasks t
      ON t.lesson_id = l.id
    LEFT JOIN user_task_results utr
      ON utr.task_id = t.id
      AND utr.user_id = ?
      AND utr.is_correct = 1
    GROUP BY l.id
    ORDER BY l.order_index ASC
    `,
    [userId],
    (err, rows) => {
      if (err) {
        console.error("❌ Haladás lekérdezési hiba:", err.message);
        return res.status(500).json({
          error: "Nem sikerült lekérni a felhasználói haladást.",
        });
      }

      res.json(rows);
    }
  );
});
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
