const express = require('express');
const { isValidObjectId } = require('mongoose');
const auth = require('../../middleware/auth');
const Session = require('../../models/session');

const router = express.Router();

const rolesAutorizados = [1];

// GET
router.get('/', [auth(rolesAutorizados)], async (req, res) => {
  const sessions = await Session.find().sort({ createdAt: 1 });
  res.send(sessions);
});

// DELETE
router.delete('/:id', [auth(rolesAutorizados)], async (req, res) => {
  // Validar ObjectId
  if (!isValidObjectId(req.params.id))
    return res
      .status(400)
      .send({ mensaje: 'El Id del recurso solicitado no es válido.' });
  // Verificar si existe el recurso
  const session = await Session.findByIdAndDelete(req.params.id);
  // Si el ObjectId es válido pero el recurso no existe, retornar error tipo 404
  if (!session)
    return res
      .status(404)
      .send({ mensaje: 'El recurso solicitado no existe.' });
  res.send(session);
});

module.exports = router;
