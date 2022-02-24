const express = require('express');
const { isValidObjectId } = require('mongoose');
const auth = require('../../middleware/auth');
const Usuario = require('../../models/usuario');

const router = express.Router();

const rolesAutorizados = [1];

// POST
router.post('/:id', [auth(rolesAutorizados)], async (req, res) => {
  // Validar ObjectId
  if (!isValidObjectId(req.params.id))
    return res
      .status(400)
      .send({ mensaje: 'El Id del recurso solicitado no es válido.' });
  // Verificar si existe usuario
  let usuario = await Usuario.findById(req.params.id);
  // Si el ObjectId es válido pero el role no existe, retornar error tipo 404
  if (!usuario)
    return res
      .status(404)
      .send({ mensaje: 'El recurso solicitado no existe.' });
  // Actualizar recurso
  const update = await Usuario.findByIdAndUpdate(
    req.params.id,
    { suspendido: false },
    { new: true }
  );
  res.send(update);
});

module.exports = router;
