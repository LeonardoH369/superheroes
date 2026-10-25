const Hero = require('../models/Superhero');
const { Op } = require('sequelize');
const { id, missing, text } = require('../utils');
const { savePhoto } = require('../storage');
const notices = { created: 'Superhéroe registrado correctamente.', updated: 'Ficha actualizada correctamente.', deleted: 'Superhéroe enviado a la papelera. Su fotografía se conserva.', restored: 'Superhéroe restaurado correctamente.' };
async function get(req) { return missing(await Hero.findByPk(id(req.params.id))); }
async function retired(req) {
  const hero = missing(await Hero.findByPk(id(req.params.id), { paranoid: false }));
  if (!hero.deletedAt) { const error = new Error('La ficha no está en la papelera.'); error.status = 409; throw error; }
  return hero;
}
function validate(body) {
  const values = { real_name: text(body.real_name), alias: text(body.alias), information: text(body.information) };
  const errors = [];
  for (const [key, label] of [['real_name', 'Nombre real'], ['alias', 'Nombre de superhéroe']]) {
    if (!values[key] || values[key].length > 120) errors.push(label + ': captura entre 1 y 120 caracteres.');
  }
  if (!values.information || Buffer.byteLength(values.information) > 16000) errors.push('Agrega información adicional (máximo 16 000 bytes).');
  if (Object.hasOwn(body, 'photo_url') || Object.hasOwn(body, 'photo_path')) errors.push('Selecciona un archivo local; no se aceptan URLs ni rutas escritas manualmente.');
  return { values, errors };
}
async function save(req, res, record) {
  const { values, errors } = validate(req.body);
  if (!record && !req.file) errors.push('Selecciona una fotografía local.');
  if (!errors.length) {
    try {
      const other = await Hero.findOne({ where: { alias: values.alias }, paranoid: false });
      if (other && other.id !== record?.id) errors.push('Ese nombre de superhéroe ya está registrado, incluso en la papelera.');
      else {
        const photo_path = req.file ? await savePhoto(req.file.buffer) : record.photo_path;
        if (record) await record.update({ ...values, photo_path }); else record = await Hero.create({ ...values, photo_path });
        return res.redirect(303, '/superheroes/' + record.id + '?notice=' + (req.params.id ? 'updated' : 'created'));
      }
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') errors.push('Ese nombre de superhéroe ya está registrado.');
      else if (error.status === 422) errors.push(error.message); else throw error;
    }
  }
  return res.status(422).render('superheroes/form', { title: record ? 'Editar superhéroe' : 'Nuevo superhéroe', hero: { ...values, id: record?.id, photo_path: record?.photo_path }, errors });
}
module.exports = {
  async index(req, res) { res.render('superheroes/index', { title: 'Superhéroes', heroes: await Hero.findAll({ order: [['id', 'ASC']] }), notice: notices[req.query.notice] || '' }); },
  create(req, res) { res.render('superheroes/form', { title: 'Nuevo superhéroe', hero: {}, errors: [] }); },
  async show(req, res) { res.render('superheroes/show', { title: 'Ficha del superhéroe', hero: await get(req), notice: notices[req.query.notice] || '' }); },
  async edit(req, res) { res.render('superheroes/form', { title: 'Editar superhéroe', hero: await get(req), errors: [] }); },
  async store(req, res) { return save(req, res, null); },
  async update(req, res) { return save(req, res, await get(req)); },
  async confirmDelete(req, res) { res.render('superheroes/delete', { title: 'Dar de baja', hero: await get(req) }); },
  async destroy(req, res) { await (await get(req)).destroy(); res.redirect(303, '/superheroes?notice=deleted'); },
  async trash(req, res) { res.render('superheroes/trash', { title: 'Papelera de superhéroes', heroes: await Hero.findAll({ paranoid: false, where: { deletedAt: { [Op.ne]: null } }, order: [['deletedAt', 'DESC']] }) }); },
  async confirmRestore(req, res) { res.render('superheroes/restore', { title: 'Restaurar superhéroe', hero: await retired(req) }); },
  async restore(req, res) { const hero = await retired(req); await hero.restore(); res.redirect(303, '/superheroes/' + hero.id + '?notice=restored'); },
};
