// Generales
const registro = require('../routes/registro');
const verificar = require('../routes/verificar');
const login = require('../routes/login');
const logout = require('../routes/logout');
const solicitar = require('../routes/solicitar');
const reinicio = require('../routes/reinicio');
// Perfil
const perfil = require('../routes/perfil');
const cambioPass = require('../routes/cambioPass');
// Admin
const usuarios = require('../routes/admin/usuarios');
const sesiones = require('../routes/admin/sesiones');
const roles = require('../routes/admin/roles');
const suspender = require('../routes/admin/suspender');
const restablecer = require('../routes/admin/restablecer');
// Utils
const estado = require('../routes/utils/estado');
const email = require('../routes/utils/email');
const check = require('../routes/utils/check');
const debug = require('../routes/utils/debug');
const query = require('../routes/utils/query');
// Maestros
const productos = require('../routes/maestros/productos');
// Reportes
// --------
// A - Ventas
const canal = require('../routes/reportes/ventas/canal');
const producto = require('../routes/reportes/ventas/producto');
const categoria = require('../routes/reportes/ventas/categoria');
const unidadesMensualesV = require('../routes/reportes/ventas/unidadesMensuales');
// B - Produccion
const sugeridoPT = require('../routes/reportes/produccion/sugeridoPT');
const sugeridoMA = require('../routes/reportes/produccion/sugeridoMA');
const unidadesMensualesP = require('../routes/reportes/produccion/unidadesMensuales');

module.exports = (app) => {
  // Generales
  app.use('/v1/registro', registro);
  app.use('/v1/verificar', verificar);
  app.use('/v1/login', login);
  app.use('/v1/logout', logout);
  app.use('/v1/solicitar', solicitar);
  app.use('/v1/reinicio', reinicio);
  // Perfil
  app.use('/v1/perfil', perfil);
  app.use('/v1/cambio-pass', cambioPass);
  // Admin
  app.use('/v1/admin/usuarios', usuarios);
  app.use('/v1/admin/sesiones', sesiones);
  app.use('/v1/admin/roles', roles);
  app.use('/v1/admin/suspender', suspender);
  app.use('/v1/admin/restablecer', restablecer);
  // Utils
  app.use('/v1/utils/estado', estado);
  app.use('/v1/utils/email', email);
  app.use('/v1/utils/check', check);
  app.use('/v1/utils/debug', debug);
  app.use('/v1/utils/query', query);
  // Maestros
  app.use('/v1/maestros/productos', productos);
  // Reportes
  // --------
  // A - Ventas
  app.use('/v1/reportes/ventas/canal', canal);
  app.use('/v1/reportes/ventas/producto', producto);
  app.use('/v1/reportes/ventas/categoria', categoria);
  app.use('/v1/reportes/ventas/unidades-mensuales', unidadesMensualesV);
  // B - Produccion
  app.use('/v1/reportes/produccion/sugerido-pt', sugeridoPT);
  app.use('/v1/reportes/produccion/sugerido-ma', sugeridoMA);
  app.use('/v1/reportes/produccion/unidades-mensuales', unidadesMensualesP);
};
