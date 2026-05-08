const express = require("express");

function createLessonRoutes(db) {
  const router = express.Router();

  // Összes lecke lekérése
  router.get("/", (req, res) => {
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
          return res.status(500).json({
            error: "Nem sikerült lekérni a leckéket.",
          });
        }

        res.json(rows);
      }
    );
  });

  // Egy konkrét lecke lekérése a hozzá tartozó feladattal
  router.get("/:id", (req, res) => {
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
          return res.status(500).json({
            error: "Nem sikerült lekérni a leckét.",
          });
        }

        if (!lesson) {
          return res.status(404).json({
            error: "A keresett lecke nem található.",
          });
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
              return res.status(500).json({
                error: "Nem sikerült lekérni a feladatokat.",
              });
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

  return router;
}

module.exports = createLessonRoutes;