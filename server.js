const express = require("express");
const app = express();
const PORT = 3000;

const db = require("./db/database");
const createSchema = require("./db/schema");

// JSON kérések feldolgozása
app.use(express.json());

createSchema(db);

function seedDatabase() {
  db.get("SELECT COUNT(*) AS count FROM lessons", (err, row) => {
    if (err) {
      console.error("❌ Nem sikerült ellenőrizni a lessons táblát:", err.message);
      return;
    }

    if (row.count > 0) {
      console.log("ℹ️ Az adatbázis már tartalmaz leckéket, seedelés kihagyva.");
      return;
    }

    console.log("🌱 Alap leckék és feladatok beszúrása...");

    const lessons = [
      {
        id: "intro",
        title: "Bevezetés: Mi az a sakk?",
        body: `A sakk egy kétjátékos stratégiai táblajáték. A célod, hogy sakkmattot adj az ellenfél királyának, vagyis olyan helyzetbe hozd, ahol a királyt támadás éri, és nincs szabályos lépés, amivel ki tudna menekülni.

Mindig a világos (fehér) kezd, és a játékosok felváltva lépnek.`,
        level_required: 1,
        order_index: 1,
      },
      {
        id: "board",
        title: "A sakktábla felépítése",
        body: `A sakktábla 8×8-as mezőből áll, világos és sötét négyzetek váltják egymást.

Az oszlopokat betűk jelölik: a, b, c, d, e, f, g, h.
A sorokat számok jelölik: 1–8-ig.

Egy mezőt egy betű–szám páros ír le, például:
- "e4": az e oszlop és a 4. sor metszéspontja
- "a1": bal alsó sarok világos mező.`,
        level_required: 1,
        order_index: 2,
      },
      {
        id: "pawn",
        title: "A gyalog lépései",
        body: `A gyalog a legegyszerűbb, mégis nagyon fontos bábu.

- Egy mezőt lép előre.
- Az első lépésénél dönthetsz úgy, hogy két mezőt lép előre.
- Ütni átlósan előre tud: balra-előre vagy jobbra-előre.
- Soha nem léphet hátra.

A táblán most egy fehér gyalogot látsz az e2 mezőn. Próbáld ki, milyen lépések engedélyezettek!`,
        level_required: 1,
        order_index: 3,
      },
      {
        id: "rook",
        title: "A bástya lépései",
        body: `A bástya egyenesen mozog: vízszintesen vagy függőlegesen.

Annyi mezőt léphet, ameddig útjába nem kerül egy másik bábu. Nem ugorhat át más figurákat. Ellenfelet úgy üt, hogy rálép annak mezőjére.`,
        level_required: 1,
        order_index: 4,
      },
      {
        id: "bishop",
        title: "A futó lépései",
        body: `A futó átlós vonalakon mozog.

Bármennyi mezőt léphet átlósan, de nem ugorhat át más bábukat. Mindig azon a színű mezőkön marad, amelyiken elindult.`,
        level_required: 2,
        order_index: 5,
      },
      {
        id: "knight",
        title: "A huszár lépései",
        body: `A huszár L-alakban lép.

Két mezőt halad egy irányba, majd egy mezőt merőlegesen. A huszár különleges, mert átugorhat más bábukat.`,
        level_required: 2,
        order_index: 6,
      },
      {
        id: "queen",
        title: "A vezér lépései",
        body: `A vezér a legerősebb bábu.

Úgy léphet, mint a bástya, vagyis egyenesen, és úgy is, mint a futó, vagyis átlósan. Bármennyi mezőt mehet, amíg nem ütközik akadályba.`,
        level_required: 3,
        order_index: 7,
      },
      {
        id: "king",
        title: "A király lépései",
        body: `A király egy mezőt léphet bármely irányba.

A király nem léphet olyan mezőre, amit az ellenfél támad. A király védelme a legfontosabb, mert sakkmatt esetén véget ér a játszma.`,
        level_required: 3,
        order_index: 8,
      },
      {
        id: "rules",
        title: "Alapszabályok: sakk, sakkmatt, patt",
        body: `Sakk: a királyt támadás éri.

Sakkmatt: a király sakkban áll és nincs szabályos lépése a menekülésre.

Patt: a játékos nem tud szabályosan lépni és nincs sakkban. Ez döntetlen.`,
        level_required: 3,
        order_index: 9,
      },
    ];

    const tasks = [
 {
  lesson_id: "intro",
  type: "two-turns",
  description: "Tegyél egy szabályos lépést világossal, majd egy szabályos lépést sötéttel!",
  tactical_message:
    "Figyeld meg, hogy a sakkban mindig világos kezd, utána pedig sötét következik.",
  xp_reward: 10,
},

      {
        lesson_id: "board",
        type: "click-square",
        description: "Kattints az e4 mezőre!",
        target_row: 4,
        target_col: 4,
        xp_reward: 10,
      },
{
  lesson_id: "pawn",
  type: "move-piece",
  description: "Léptesd a fehér gyalogot e2-ről e4-re!",
  checklist:
    "Nézd meg, melyik bábuval kell lépned.\nA gyalog előre lép.\nAz első lépésénél két mezőt is haladhat.\nA célmezőnek üresnek kell lennie.",
  wrong_piece_message:
    "Szabályos lépés volt, de nem ezt a bábut kéri a feladat. Keresd az e2 mezőn álló fehér gyalogot.",
  wrong_target_message:
    "Ez szabályos lépés volt, de nem a feladat szerinti célmező. A gyalog első lépésként e4-re is léphet.",
  tactical_message:
    "Ez a lépés nem oldja meg a feladatot. Gondold végig újra a feladatban megadott kezdő- és célmezőt.",
  from_row: 6,
  from_col: 4,
  to_row: 4,
  to_col: 4,
  xp_reward: 10,
},
      {
  lesson_id: "rook",
  type: "move-piece",
  description: "Léptesd a bástyát d4-ről d7-re!",
  position_key: "rook_basic",
  from_row: 4,
  from_col: 3,
  to_row: 1,
  to_col: 3,
  xp_reward: 10,
},

  {
  lesson_id: "rook",
  type: "move-piece",
  description:
    "Két fehér bástya van a táblán. Válaszd ki azt, amelyikkel le tudod ütni a d7-en álló fekete huszárt!",
  position_key: "rook_two_rooks",
  wrong_piece_message:
    "Ez szabályos lépés volt, de nem azzal a bástyával indultál, amelyik eléri a d7 mezőt.",
  wrong_target_message:
    "Ez szabályos lépés volt, de nem a d7 mezőre léptél.",
  tactical_message:
    "Gondold végig, melyik bástya mozog egyenes vonalban a d7 mező felé.",
  from_row: 4,
  from_col: 3,
  to_row: 1,
  to_col: 3,
  xp_reward: 10,
},

      {
        lesson_id: "bishop",
        type: "move-piece",
        description: "Léptesd a futót c1-ről g5-re!",
        from_row: 7,
        from_col: 2,
        to_row: 3,
        to_col: 6,
        xp_reward: 10,
      },
      {
  lesson_id: "bishop",
  type: "move-piece",
  description:
    "A futó két irányba is tudna ütni. Üsd le vele a fekete futót!",
  position_key: "bishop_two_captures",
  wrong_piece_message:
    "Ez szabályos lépés volt, de nem a megfelelő bábuval léptél. A fehér futóval kell megoldani a feladatot.",
  wrong_target_message:
    "Ez szabályos futólépés volt, de most nem ezt a bábut kell leütni. A feladat a fekete futó leütését kéri.",
  tactical_message:
    "Nézd meg mindkét átlót: a futó több irányba is támadhat, de most a fontosabb célpont a fekete futó.",
  from_row: 4,
  from_col: 3,
  to_row: 1,
  to_col: 6,
  xp_reward: 10,
},
      {
        lesson_id: "knight",
        type: "move-piece",
        description: "Léptesd a huszárt g1-ről f3-ra!",
        from_row: 7,
        from_col: 6,
        to_row: 5,
        to_col: 5,
        xp_reward: 10,
      },
      {
  lesson_id: "knight",
  type: "move-piece",
  description:
    "A huszár a tábla közepén áll. Több helyre is léphet, de most lépj vele az üres f5 mezőre!",
  position_key: "knight_center_options",
  wrong_piece_message:
    "Ez szabályos lépés volt, de nem a huszárral léptél. A középen álló fehér huszárt kell használnod.",
  wrong_target_message:
    "Ez szabályos huszárlépés volt, de nem a feladat szerinti mező. Most az üres f5 mezőre kell lépni.",
  tactical_message:
    "Figyeld meg, hogy a huszár átugorhat más bábukat, de saját bábuval foglalt mezőre nem léphet.",
  from_row: 4,
  from_col: 3,
  to_row: 3,
  to_col: 5,
  xp_reward: 10,
},
{
  lesson_id: "knight",
  type: "move-piece",
  description:
    "A fekete bástya sakkot ad a királynak. Blokkold a sakkot a huszárral!",
  position_key: "knight_block_check",
  wrong_piece_message:
    "Most a huszárral kell védekezni. Olyan mezőre kell lépnie, ahol elzárja a bástya támadási vonalát.",
 wrong_target_message:
  "Ez szabályos huszárlépés volt, de nem ez a legjobb védekezés. A feladatban olyan mezőt keress, ahol a huszár biztonságosan blokkolja a bástya támadási vonalát.",
  tactical_message:
    "A bástya egyenes vonalban támad. Keress olyan huszárlépést, amely közéjük állít egy bábut.",
  from_row: 5,
  from_col: 2,
  to_row: 6,
  to_col: 4,
  xp_reward: 10,
},
{
  lesson_id: "knight",
  type: "move-piece",
  description:
    "Üsd le a huszárral a fekete vezért!",
  position_key: "knight_capture_piece",
  wrong_piece_message:
    "Ez szabályos lépés volt, de nem a huszárral léptél. A fehér huszárral kell leütni a vezért.",
  wrong_target_message:
    "Ez szabályos huszárlépés volt, de nem a legfontosabb célpontot ütötted le. Most a fekete vezért kell leütni.",
  tactical_message:
    "A huszár veszélyes taktikai bábu: gyakran váratlanul tud értékes figurát támadni.",
  from_row: 4,
  from_col: 4,
  to_row: 2,
  to_col: 5,
  xp_reward: 10,
},
      {
        lesson_id: "queen",
        type: "move-piece",
        description: "Léptesd a vezért d1-ről h5-re!",
        from_row: 7,
        from_col: 3,
        to_row: 3,
        to_col: 7,
        xp_reward: 10,
      },
      {
        lesson_id: "king",
        type: "move-piece",
        description: "Léptesd a királyt e1-ről f2-re!",
        from_row: 7,
        from_col: 4,
        to_row: 6,
        to_col: 5,
        xp_reward: 10,
      },
 {
  lesson_id: "rules",
  type: "give-check",
  description: "Adj sakkot a fekete királynak a vezérrel!",
  wrong_piece_message:
    "Ez a lépés sakkot adhat, de a feladat most kifejezetten a vezér használatát kéri.",
  wrong_target_message:
    "Ez szabályos lépés volt, de nem ad sakkot a fekete királynak.",
  tactical_message:
    "A feladat célja sakkadás. Olyan vezérlépést keress, amely után a fekete király támadás alatt áll.",
  target_color: "black",
  required_piece_type: "Q",
  required_piece_color: "white",
  xp_reward: 10,
},

    ];

    const insertLesson = db.prepare(`
      INSERT INTO lessons (id, title, body, level_required, order_index)
      VALUES (?, ?, ?, ?, ?)
    `);

    lessons.forEach((lesson) => {
      insertLesson.run(
        lesson.id,
        lesson.title,
        lesson.body,
        lesson.level_required,
        lesson.order_index
      );
    });

    insertLesson.finalize();

 const insertTask = db.prepare(`
  INSERT INTO tasks (
    lesson_id, type, description,position_key,
    checklist,
    wrong_piece_message,
    wrong_target_message,
    tactical_message,
    from_row, from_col, to_row, to_col,
    from_row2, from_col2, to_row2, to_col2,
    target_row, target_col,
    target_color,
    required_piece_type,
    required_piece_color,
    xp_reward
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

   tasks.forEach((task) => {
 insertTask.run(
  task.lesson_id,
  task.type,
  task.description,
  task.position_key ?? null,

  task.checklist ?? null,
  task.wrong_piece_message ?? null,
  task.wrong_target_message ?? null,
  task.tactical_message ?? null,

  task.from_row ?? null,
  task.from_col ?? null,
  task.to_row ?? null,
  task.to_col ?? null,

  task.from_row2 ?? null,
  task.from_col2 ?? null,
  task.to_row2 ?? null,
  task.to_col2 ?? null,

  task.target_row ?? null,
  task.target_col ?? null,

  task.target_color ?? null,
  task.required_piece_type ?? null,
  task.required_piece_color ?? null,

  task.xp_reward
);
});

    insertTask.finalize();

    console.log("✅ Alap leckék és feladatok beszúrva az adatbázisba.");
  });
}

seedDatabase();

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
