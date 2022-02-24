const smtp = require('./smtp');

module.exports = async (email) => {
  let info;
  let err;

  try {
    info = await smtp.sendMail({
      from: `"Notificaciones 🍫" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Email de Prueba',
      html: `<h3>¡Hola!</h3>
          <p>Este es un correo de prueba.</p>`,
    });
  } catch (error) {
    err = error.response;
  }

  return { err, info };
};
