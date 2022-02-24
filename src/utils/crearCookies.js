// IMPORTANTE: Éste módulo es el encargado de asignar tiempos de sesión
module.exports = function (accessToken, refreshToken, sessionInfo, res) {
  try {
    // Enviar tokens como cookies seguras e sessionInfo como header
    res
      .cookie('accessToken', accessToken, {
        // maxAge: 1000 * 60 * 60 * 1, // cookie será eliminada después de 1 hora
        maxAge: 1000 * 60 * process.env.ACCESTOKEN_MAX_AGE,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      .cookie('refreshToken', refreshToken, {
        // maxAge: 1000 * 60 * 60 * 8, // cookie será eliminada después de 8 horas
        maxAge: 1000 * 60 * process.env.REFRESHTOKEN_MAX_AGE,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      // Info de sesión para cliente, guardar en 'local storage'
      .header('session-info', sessionInfo)
      .header('access-control-expose-headers', 'session-info');
  } catch (error) {
    throw new Error('No fue posible crear cookies.');
  }
};
