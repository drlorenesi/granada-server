const jwt = require('jsonwebtoken');

// Usar role de 'accessToken' para verificar acceso a recursos
// Usar 'sessionInfo' para mostart accesos en UI

module.exports = function (sessionId, usuario) {
  try {
    // Crear 'accessToken' con la información mínima requerida para
    // llevar acabo solicitudes del cliente
    const accessToken = jwt.sign(
      { sessionId, usuarioId: usuario._id, role: usuario.role.nivel },
      process.env.JWT_SIGNATURE
    );
    // Crear 'refreshToken' únicamente con el id de la sesión
    const refreshToken = jwt.sign({ sessionId }, process.env.JWT_SIGNATURE);
    // Enviar info de sesión y guardar en 'local storage' del cliente
    const sessionInfo = jwt.sign(
      {
        usuarioId: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        role: usuario.role.nivel,
      },
      process.env.JWT_SIGNATURE
    );
    return { accessToken, refreshToken, sessionInfo };
  } catch (error) {
    throw new Error('No fue posible crear tokens.');
  }
};
