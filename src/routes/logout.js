const express = require('express');
const jwt = require('jsonwebtoken');
const eliminarCookies = require('../utils/eliminarCookies');
const Session = require('../models/session');

const router = express.Router();

router.get('/', [], async (req, res) => {
  // Revisar si existe refreshToken
  if (req.cookies?.refreshToken) {
    // Obtener refreshToken
    const { refreshToken } = req.cookies;
    // Decodificar accessToken
    const { sessionId } = jwt.verify(refreshToken, process.env.JWT_SIGNATURE);
    // Eliminar session de DB
    await Session.deleteOne({ sessionId });
  }
  eliminarCookies(res);
  res.send({ mensaje: 'Tu sesión ha terminado.' });
});

module.exports = router;
