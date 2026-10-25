const heroes = [
  ['Daniel Luna','Eclipse','aurora'], ['Sofía Montes','Brisa','marea'],
  ['Nicolás Rivera','Cometa','centinela'], ['Valeria Cruz','Destello','aurora'],
  ['Diego Salas','Titán','centinela'], ['Camila Sol','Nova','aurora'],
  ['Andrés Mar','Abisal','marea'], ['Mariana Paz','Vigía','centinela'],
  ['Gabriel León','Bastión','centinela'],
];
module.exports = {
  async up(q) {
    await require('../storage').seedPhotos();
    const [existing] = await q.sequelize.query('SELECT alias FROM superheroes');
    const names = new Set(existing.map(x => x.alias)); const now = new Date();
    const rows = heroes.filter(x => !names.has(x[1])).map(([real_name, alias, photo], i) => ({
      real_name, alias, photo_path: '/storage/photos/demo-' + photo + '.jpg',
      information: 'Personaje ficticio para demostrar almacenamiento local y recuperación de fichas. Su imagen es una ilustración de prueba.',
      created_at: now, updated_at: now, deleted_at: ['Vigía','Bastión'].includes(alias) ? now : null,
    }));
    if (rows.length) await q.bulkInsert('superheroes', rows);
  },
  async down() { throw new Error('Se conserva la demostración; no hay eliminación física automática de estas fichas.'); },
};
