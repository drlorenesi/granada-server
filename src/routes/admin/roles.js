const express = require('express');
const { isValidObjectId } = require('mongoose');
const Joi = require('joi');
const { validateBody } = require('../../middleware/validar');
const auth = require('../../middleware/auth');
const { Role } = require('../../models/role');

const router = express.Router();

const validarRole = (data) => {
  const schema = Joi.object({
    nivel: Joi.number().integer().min(0).max(10).required(),
    descripcion: Joi.string().min(2).max(255).required(),
  });
  return schema.validate(data);
};

const usuarioConsulta = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const rolesAutorizados = [1];

// GET
router.get('/', [auth(usuarioConsulta)], async (req, res) => {
  const roles = await Role.find();
  res.send(roles);
});

// GET
router.get('/:id', [auth(usuarioConsulta)], async (req, res) => {
  // Validar ObjectId
  if (!isValidObjectId(req.params.id))
    return res
      .status(400)
      .send({ mensaje: 'El Id del recurso solicitado no es válido.' });
  // Buscar el role
  const role = await Role.findById(req.params.id);
  // Si el ObjectId es válido pero el role no existe, retornar error tipo 404
  if (!role)
    return res
      .status(404)
      .send({ mensaje: 'El recurso solicitado no existe.' });
  res.send(role);
});

// PUT
router.put(
  '/:id',
  [auth(rolesAutorizados), validateBody(validarRole)],
  async (req, res) => {
    // Validar ObjectId
    if (!isValidObjectId(req.params.id))
      return res
        .status(400)
        .send({ mensaje: 'El Id del recurso solicitado no es válido.' });
    // Buscar el role a actualizar
    let role = await Role.findById(req.params.id);
    // Si el ObjectId es válido pero el role no existe, retornar error tipo 404
    if (!role)
      return res
        .status(404)
        .send({ mensaje: 'El recurso solicitado no existe.' });
    // Si el nivel es el mismo, proceder a actualizar
    if (parseInt(req.body.nivel, 10) === role.nivel) {
      role = await Role.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      return res.send(role);
    }
    // Si el nivel cambia, revisar si ya está en uso
    const duplicate = await Role.find({ nivel: req.body.nivel });
    if (duplicate.length > 0) {
      return res
        .status(400)
        .send({ mensaje: 'El nivel ya se encuentra en uso.' });
    }
  }
);

// POST
router.post(
  '/',
  [auth(rolesAutorizados), validateBody(validarRole)],
  async (req, res) => {
    // Revisar si el nivel ya fue utilizado
    const duplicado = await Role.find({ nivel: req.body.nivel });
    if (duplicado.length > 0)
      return res.status(400).send({ mensaje: 'El nivel ya está asignado.' });
    // Crear nuevo role
    let nuevoRole = new Role(req.body);
    // Guardar nuevo role
    nuevoRole = await nuevoRole.save();
    res.send(nuevoRole);
  }
);

// DELETE
router.delete('/:id', [auth(rolesAutorizados)], async (req, res) => {
  // Validar ObjectId
  if (!isValidObjectId(req.params.id))
    return res
      .status(400)
      .send({ mensaje: 'El Id del recurso solicitado no es válido.' });
  // Si el role existe, eliminar
  const role = await Role.findByIdAndDelete(req.params.id);
  // Si el ObjectId es válido pero el role no existe, retornar error tipo 404
  if (!role)
    return res
      .status(404)
      .send({ mensaje: 'El recurso solicitado no existe.' });
  res.send(role);
});

module.exports = router;
