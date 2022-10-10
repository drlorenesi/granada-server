const express = require('express');
const { nanoid } = require('nanoid');
const Joi = require('joi');
const { genSalt, hash } = require('bcryptjs');
const { validateBody } = require('../middleware/validar');
const emailVerificar = require('../utils/emailVerificar');
const Usuario = require('../models/usuario');

const router = express.Router();

const validarRegistro = (data) => {
  const schema = Joi.object({
    nombre: Joi.string().min(2).required(),
    apellido: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    pass: Joi.string().min(4).required(),
    // Comprobar que contraseñas son iguales en UI
    confirmPass: Joi.string(),
  });
  return schema.validate(data);
};

router.post('/', [validateBody(validarRegistro)], async (req, res) => {
  // Revisar si el email ya está registrado
  const duplicado = await Usuario.findOne({
    email: req.body.email,
  });
  if (duplicado)
    return res.status(400).send({ mensaje: 'Por favor usa otro email.' });
  // Generar Salt y Hash a pass
  const salt = await genSalt(10);
  const hashedPass = await hash(req.body.pass, salt);
  // Crear nuevo documento de 'usuario' y guardar
  let usuario = new Usuario({
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    email: req.body.email,
    pass: hashedPass,
    codigoVerificador: nanoid(),
    role: {
      nivel: 10,
      descripcion: 'General',
    },
  });
  // Enviar email de activación de cuenta
  const err = await emailVerificar(
    usuario.nombre,
    usuario.email,
    usuario.codigoVerificador
  );
  if (err)
    return res
      .status(500)
      .send({ mensaje: 'No fue posible completar el registro.', error: err });
  // Guardar usuario si no hay error de envío de email
  await usuario.save();
  res
    .status(201)
    .send({ mensaje: 'Por favor revisa tu email para verificar tu cuenta.' });
});

module.exports = router;
