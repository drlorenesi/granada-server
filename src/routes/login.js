const express = require('express');
const Joi = require('joi');
const { compare } = require('bcryptjs');
const { validateBody } = require('../middleware/validar');
const crearSesion = require('../utils/crearSesion');
const crearTokens = require('../utils/crearTokens');
const crearCookies = require('../utils/crearCookies');
const Usuario = require('../models/usuario');
const Session = require('../models/session');

const router = express.Router();

const validarLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    pass: Joi.string().required(),
  });
  return schema.validate(data);
};

// Posibles errores
// 400 - Usuario no registrado / Email o contraseña inválida.
// 401 - Tu cuenta aun no ha sido verificada.
// 403 - Tu cuenta se encuentra temporalmente suspendida.

router.post('/', [validateBody(validarLogin)], async (req, res) => {
  // 1. Verificar a Usuario
  // ----------------------
  // A. Buscar a usuario
  const usuario = await Usuario.findOne({
    email: req.body.email,
  });
  if (!usuario)
    return res.status(400).send({ mensaje: 'Email o contraseña inválida.' });
  // B. Obtener pass de usuario y comparar pass contra la guardada en DB
  const savedPassword = usuario.pass;
  const concuerda = await compare(req.body.pass, savedPassword);
  if (!concuerda)
    return res.status(400).send({ mensaje: 'Email o contraseña inválida.' });
  // C. Revisar si el usuario ya fue verificado
  if (!usuario.verificado)
    return res
      .status(401)
      .send({ mensaje: 'Tu cuenta aun no ha sido verificada.' });
  // D. Revisar si el usuario ha sido suspendido
  if (usuario.suspendido)
    return res
      .status(403)
      .send({ mensaje: 'Tu cuenta se encuentra temporalmente suspendida.' });
  // 2. Actualizar/Crear Sesión, Tokens y Cookies
  // ----------------------------------------------------
  // A. Actualizar última fecha de ingreso del usuario
  await Usuario.findOneAndUpdate(
    { email: req.body.email },
    {
      ingresoActual: new Date(),
      ultimoIngreso: usuario.ingresoActual,
      codigoReinicio: null,
    }
  );
  // B. Revisar si el usuario tiene sesiones activas
  const sesionesActivas = await Session.find({ 'usuario._id': usuario._id });
  if (sesionesActivas.length > 0) {
    // Eliminar sesion activa. Permitir solo 1 sesión activa a la vez
    await Session.deleteMany({ 'usuario._id': usuario._id });
    // Crear nueva sesion
    const sessionId = await crearSesion(usuario._id, req);
    // Crear nuevos tokens
    const { accessToken, refreshToken, sessionInfo } = crearTokens(
      sessionId,
      usuario
    );
    // Crear cookies
    crearCookies(accessToken, refreshToken, sessionInfo, res);
    return res.send({
      mensaje:
        'Tu sesión ha iniciado. Por motivos de seguridad tu sesión anterior fue eliminada.',
    });
  }
  // C. Si no hay sesión activa crear una nueva
  const sessionId = await crearSesion(usuario._id, req);
  // Crear nuevos tokens
  const { accessToken, refreshToken, sessionInfo } = crearTokens(
    sessionId,
    usuario
  );
  // Crear cookies
  crearCookies(accessToken, refreshToken, sessionInfo, res);
  res.send({ mensaje: 'Tu sesión ha iniciado.' });
});

module.exports = router;
