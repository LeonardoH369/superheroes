const db = require('../src/config/database');
const queries = [
  'SELECT id, real_name, alias, photo_path, deleted_at FROM superheroes ORDER BY id',
  'SELECT COUNT(*) AS total, SUM(deleted_at IS NULL) AS activos, SUM(deleted_at IS NOT NULL) AS eliminados FROM superheroes',
  'SHOW COLUMNS FROM superheroes',
];
(async () => { for (const sql of queries) { console.log('\n' + sql); const [rows] = await db.query(sql); console.table(rows); } })()
  .catch(error => { console.error(error.message); process.exitCode = 1; })
  .finally(() => db.close());
