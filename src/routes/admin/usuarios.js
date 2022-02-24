const express = require('express');
const { isValidObjectId } = require('mongoose');
const Joi = require('joi');
const { validateBody } = require('../../middleware/validar');
const auth = require('../../middleware/auth');
const Usuario = require('../../models/usuario');
const { Role } = require('../../models/role');

const router = express.Router();

const validarUsuario = (data) => {
  const schema = Joi.object({
    nombre: Joi.string().min(2).max(255).required(),
    apellido: Joi.string().min(2).max(255).required(),
    extension: Joi.string().max(255).allow('', null),
    email: Joi.string().email(),
    role: Joi.number().integer().max(10),
  });
  return schema.validate(data);
};

const rolesAutorizados = [1];

// NOTA: No hay POST. Usuario solo puede ser creado registrándose

// GET
router.get('/', [auth(rolesAutorizados)], async (req, res) => {
  const usuarios = await Usuario.find();
  res.send(usuarios);
});

// GET
router.get('/:id', [auth(rolesAutorizados)], async (req, res) => {
  // Validar ObjectId
  if (!isValidObjectId(req.params.id))
    return res
      .status(400)
      .send({ mensaje: 'El Id del recurso solicitado no es válido.' });
  const usuario = await Usuario.findById(req.params.id);
  // Si el ObjectId es válido pero el role no existe, retornar error tipo 404
  if (!usuario)
    return res
      .status(404)
      .send({ mensaje: 'El recurso solicitado no existe.' });
  res.send(usuario);
});

// PUT
router.put(
  '/:id',
  [auth(rolesAutorizados), validateBody(validarUsuario)],
  async (req, res) => {
    const { nombre, apellido, extension, role } = req.body;

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

    // Verificar si existe role
    const newRole = await Role.findOne({ nivel: role });
    if (!role)
      return res.status(400).send({ mensaje: 'El Id del role no es válido.' });
    // Actualizar recurso
    const actualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      {
        nombre,
        apellido,
        extension,
        role: newRole,
      },
      { new: true }
    );
    res.send(actualizado);
  }
);

// DELETE
router.delete('/:id', [auth(rolesAutorizados)], async (req, res) => {
  // Validar ObjectId
  if (!isValidObjectId(req.params.id))
    return res
      .status(400)
      .send({ mensaje: 'El Id del recurso solicitado no es válido.' });
  // Verificar si existe usuario
  const usuario = await Usuario.findByIdAndDelete(req.params.id);
  // Si el ObjectId es válido pero el role no existe, retornar error tipo 404
  if (!usuario)
    return res
      .status(404)
      .send({ mensaje: 'El recurso solicitado no existe.' });
  res.send(usuario);
});

module.exports = router;
