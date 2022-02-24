const express = require('express');
const auth = require('../../middleware/auth');
const Usuario = require('../../models/usuario');

const router = express.Router();

const rolesAutorizados = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

router.get('/', [auth(rolesAutorizados)], async (req, res) => {
  // usuarioId es obtenido en el middleware 'auth'
  const { usuarioId, role } = res.locals;
  const usuario = await Usuario.findById(usuarioId);
  res.send({
    mensaje: `Enhorabuena ${usuario.nombre}! Tu sesión se encuentra activa y tu role actual es ${role}.`,
  });
});

module.exports = router;
