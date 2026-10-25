const { seedPhotos } = require('../storage');
module.exports = {
  async up(q) {
    await seedPhotos();
    const columns = await q.describeTable('superheroes');
    // Se respeta deleted_at de Activity 8; solo se agrega si falta.
    if (!columns.deleted_at) await q.addColumn('superheroes', 'deleted_at', { type: require('sequelize').DATE, allowNull: true });
    if (columns.photo_url) await q.renameColumn('superheroes', 'photo_url', 'photo_path');
    const [rows] = await q.sequelize.query('SELECT id, photo_path FROM superheroes');
    for (const row of rows) {
      if (row.photo_path?.startsWith('/storage/photos/')) continue;
      const name = ['aurora', 'centinela', 'marea'].find(n => row.photo_path?.endsWith('/images/' + n + '.svg'));
      // URLs desconocidas reciben una ilustración local; no se descarga contenido externo.
      await q.sequelize.query('UPDATE superheroes SET photo_path = :photo WHERE id = :id', { replacements: { photo: '/storage/photos/demo-' + (name || 'aurora') + '.jpg', id: row.id } });
    }
  },
  async down(q) {
    await q.renameColumn('superheroes', 'photo_path', 'photo_url');
    // No se eliminan imágenes ni se reconstruyen las URLs anteriores.
  },
};
