function createSchema(db) {db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      level_required INTEGER DEFAULT 1,
      order_index INTEGER NOT NULL
    )
  `);

 db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    position_key TEXT,

    checklist TEXT,
    wrong_piece_message TEXT,
    wrong_target_message TEXT,
    tactical_message TEXT,

    from_row INTEGER,
    from_col INTEGER,
    to_row INTEGER,
    to_col INTEGER,
    target_row INTEGER,
    target_col INTEGER,
    from_row2 INTEGER,
from_col2 INTEGER,
to_row2 INTEGER,
to_col2 INTEGER,
target_color TEXT,
required_piece_type TEXT,
required_piece_color TEXT,


    xp_reward INTEGER DEFAULT 10,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
  )
`);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      total_xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_task_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      task_id INTEGER NOT NULL,
      is_correct INTEGER NOT NULL,
      mistake_type TEXT,
      completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    )
  `);

  console.log("✅ Adatbázistáblák ellenőrizve/létrehozva.");
});
}
module.exports = createSchema;