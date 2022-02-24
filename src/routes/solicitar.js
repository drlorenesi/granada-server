const express = require('express');
const Joi = require('joi');
const { nanoid } = require('nanoid');
const { validateBody } = require('../middleware/validar');
const emailReinicio = require('../utils/emailReinicio');
const Usuario = require('../models/usuario');

const router = express.Router();

const validateEmail = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  return schema.validate(data);
};

router.post('/', [validateBody(validateEmail)], async (req, res) => {
  // Buscar usuario y crear código de reinicio
  const usuario = await Usuario.findOneAndUpdate(
    { email: req.body.email },
    { codigoReinicio: nanoid() },
    { new: true }
  );
  // Si existe el usuario, enviar email de reinicio
  if (usuario) {
    // Enviar correo de re-inicio
    const err = await emailReinicio(
      usuario.nombre,
      usuario.email,
      usuario.codigoReinicio
    );
    if (err) return res.status(500).send({ mensaje: err });
    res.send({
      mensaje:
        'Revisa tu correo para obtener instrucciones sobre como reinicar tu contraseña.',
    });
    // Si no existe el usuario solo mostrar mensaje
  } else {
    res.send({
      mensaje:
        'Revisa tu correo para obtener instrucciones sobre como reinicar tu contraseña.',
    });
  }
});

module.exports = router;
