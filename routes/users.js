const express = require("express");

function createUserRoutes(db) {
  const router = express.Router();

  // Felhasználó létrehozása vagy betöltése név alapján
  router.post("/", (req, res) => {
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
  router.post("/:id/xp", (req, res) => {
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
  router.get("/:id/progress", (req, res) => {
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

  return router;
}

module.exports = createUserRoutes;