const express = require('express');
const Usuario = require('../models/usuario');

const router = express.Router();

// Query String intencionalmente *no* validada por motivos de seguridad
router.get('/', [], async (req, res) => {
  // Buscar 'usuario' en DB
  const usuario = await Usuario.findOne({
    email: req.query.x,
  });
  // Si no se encuentra a usuario
  if (!usuario)
    return res.status(400).send({
      mensaje: 'Por favor revisa tu enlace e intenta de nuevo.',
    });
  // Revisar si el usuario ya fue verificado
  if (usuario.verificado)
    return res.status(400).send({
      mensaje: 'El enlace ya no es válido.',
    });
  // Revisar si codigo de activación concuerda con el generado
  if (usuario.codigoVerificador !== req.query.y)
    return res.status(400).send({
      mensaje: 'Por favor revisa tu enlace e intenta de nuevo.',
    });
  // Actualizar verificado a 'true' y codigoVerificador a 'null'
  usuario.verificado = true;
  usuario.codigoVerificador = null;
  // Guardar cambios en DB
  await usuario.save();
  return res.send({
    mensaje: '¡Enhorabuena! Tu cuenta ha sido verificada.',
  });
});

module.exports = router;
