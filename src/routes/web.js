const r = require('express').Router();
const c = require('../controllers/SuperheroController');
const upload = require('../middleware/upload');
const forms = require('../middleware/forms');
r.get('/', (req, res) => res.redirect('/superheroes'));
r.get('/superheroes', c.index);
r.get('/superheroes/create', c.create);
r.get('/superheroes/trash', c.trash);
// Primero se analiza multipart en memoria, después se valida CSRF y se persiste.
r.post('/superheroes', upload, forms, c.store);
r.get('/superheroes/:id/edit', c.edit);
r.post('/superheroes/:id/update', upload, forms, c.update);
r.get('/superheroes/:id/delete', c.confirmDelete);
r.post('/superheroes/:id/delete', forms, c.destroy);
r.get('/superheroes/:id/restore', c.confirmRestore);
r.post('/superheroes/:id/restore', forms, c.restore);
r.get('/superheroes/:id', c.show);
module.exports = r;
