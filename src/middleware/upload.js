const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 5, fieldSize: 24000, parts: 6 } }).single('photo');
module.exports = (req, res, next) => upload(req, res, error => {
  if (!error) return next();
  error.status = 422;
  error.message = error.code === 'LIMIT_FILE_SIZE' ? 'La fotografía supera el límite de 5 MB.' : 'Envía una sola fotografía en el campo indicado y completa el formulario.';
  next(error);
});
