module.exports = function (res) {
  try {
    // Eliminar Cookies. Tomar en cuenta:
    // "Web browsers and other compliant clients will only clear the cookie if
    // the given options is identical to those given to res.cookie(),
    // excluding expires and maxAge."
    res
      .clearCookie('accessToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      .clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
  } catch (error) {
    throw new Error('No fue posible eliminar cookies.');
  }
};
