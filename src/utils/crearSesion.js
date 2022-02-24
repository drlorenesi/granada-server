const { nanoid } = require('nanoid');
const Session = require('../models/session');
const Usuario = require('../models/usuario');

module.exports = async function (usuarioId, req) {
  try {
    // Obtener información de usuario
    const infoUsuario = await Usuario.findById(usuarioId);
    // Generar id de sesión
    const sessionId = nanoid();
    // Obtener información sobre la conexión
    const infoConexion = {
      // ip: req.ip,
      ip: req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
    };
    // Crear nueva sesión y guardar en DB
    let session = new Session({
      sessionId,
      usuario: {
        _id: infoUsuario._id,
        nombre: infoUsuario.nombre,
        apellido: infoUsuario.apellido,
        email: infoUsuario.email,
        role: infoUsuario.role,
      },
      userAgent: infoConexion.userAgent,
      ip: infoConexion.ip,
    });
    await session.save();
    return sessionId;
  } catch (error) {
    throw new Error('No fue posible crear sesión.');
  }
};
