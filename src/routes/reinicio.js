const express = require('express');
const Joi = require('joi');
const { genSalt, hash } = require('bcryptjs');
const { validateBody } = require('../middleware/validar');
const Usuario = require('../models/usuario');

const router = express.Router();

const validarReinicio = (data) => {
  const schema = Joi.object({
    pass: Joi.string().min(4).required(),
    // Agregar validación adicional en UI
    confirmPass: Joi.string(),
  });
  return schema.validate(data);
};

// Query String intencionalmente *no* validada por motivos de seguridad
router.post('/', [validateBody(validarReinicio)], async (req, res) => {
  // Buscar 'usuario' en DB
  const usuario = await Usuario.findOne({
    email: req.query.x,
    codigoReinicio: req.query.y,
  });
  // Si no se encuentra a usuario
  if (!usuario)
    return res.status(400).send({
      mensaje:
        'Por favor revisa tu enlace o solicita un nuevo re-inicio de contraseña.',
    });
  // Generar Salt y Hash a pass
  const salt = await genSalt(10);
  const hashedPass = await hash(req.body.pass, salt);
  // Actualizar contraseña y eliminar codigoReinicio
  usuario.pass = hashedPass;
  usuario.codigoReinicio = null;
  // Guardar cambios en DB
  await usuario.save();
  res.send({
    mensaje: 'Tu contraseña fue cambiada existosamente.',
  });
});

module.exports = router;
