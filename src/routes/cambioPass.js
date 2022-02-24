const express = require('express');
const Joi = require('joi');
const { genSalt, hash, compare } = require('bcryptjs');
const { validateBody } = require('../middleware/validar');
const auth = require('../middleware/auth');
const Usuario = require('../models/usuario');

const router = express.Router();

const validarUpdate = (data) => {
  const schema = Joi.object({
    passActual: Joi.string().required(),
    passNueva: Joi.string().min(3).required(),
    confirmPass: Joi.any()
      .valid(Joi.ref('passNueva'))
      .required()
      .options({ messages: { 'any.only': 'passwords do not match' } }),
  });
  return schema.validate(data);
};

const rolesAutorizados = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

router.post(
  '/',
  [auth(rolesAutorizados), validateBody(validarUpdate)],
  async (req, res) => {
    // Revisar si concuerda contraseña actual de usuario
    const usuario = await Usuario.findOne({
      _id: res.locals.usuarioId,
    });
    // Revisar que concuerde la contraseña actual de usuario
    const concuerda = await compare(req.body.passActual, usuario.pass);
    if (!concuerda)
      return res.status(400).send({
        mensaje: 'Tu contraseña actual no concuerda.',
      });
    // Revisar que la nueva contraseña no sea igual a la actual
    const igual = await compare(req.body.passNueva, usuario.pass);
    if (igual)
      return res.status(400).send({
        mensaje: 'Tu contraseña nueva no puede ser igual a la actual.',
      });
    // Proceder a actualizar contraseña
    if (concuerda) {
      const salt = await genSalt(10);
      const hashedPass = await hash(req.body.passNueva, salt);
      await Usuario.findOneAndUpdate(
        { _id: res.locals.usuarioId },
        { pass: hashedPass }
      );
      res.send({ mensaje: 'Tu contraseña fue modificada existosamente!' });
    }
  }
);

module.exports = router;
