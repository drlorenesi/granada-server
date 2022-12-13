const express = require('express');
const Joi = require('joi');
const auth = require('../../middleware/auth');
const { validateQuery, validateParams } = require('../../middleware/validar');
const { runQuery } = require('../../config/db/sqlsrv');

const router = express.Router();

const rolesAutorizados = [1];

const validateProducto = (data) => {
  const schema = Joi.object({
    tipo: Joi.number().integer().min(0).max(10).required(),
    estatus: Joi.string().empty('').default(null),
  });
  return schema.validate(data);
};

const validateCodigo = (data) => {
  const schema = Joi.object({
    id: Joi.string().length(6).required(),
  });
  return schema.validate(data);
};

// http://localhost:9000/v1/maestros/productos?tipo=0&estatus=
router.get(
  '/',
  [auth(rolesAutorizados), validateQuery(validateProducto)],
  async (req, res) => {
    const { tipo, estatus } = req.query;

    let seleccion1;
    if (tipo === '4') {
      seleccion1 = `P.[Tipo Inventario] IN(1) AND P.Intermedio = 1`;
    } else {
      seleccion1 = `P.[Tipo Inventario] IN(${
        tipo === '' ? null : tipo
      }) AND P.Intermedio = 0`;
    }

    let seleccion2;
    if (estatus === '1') {
      seleccion2 = `AND P.Estatus = 'Activo'`;
      console.log('estatus 1');
    } else if (estatus === '0') {
      seleccion2 = `AND P.Estatus = 'Inactivo'`;
    } else {
      seleccion2 = '';
    }

    const { duration, rows, rowsAffected } = await runQuery(
      `DECLARE
      @tipo INT = '${tipo}',
      @estatus VARCHAR(30) = '${estatus}'
      SELECT
        P.Codigo 'codigo',
        P. [Codigo Alt] 'codigo_alt',
        P.Descripcion 'descripcion',
        P.Estatus 'estatus'
      FROM
        PRODUCTO AS P
      WHERE
        -- Seleccionar Tipo de Inventario
        ${seleccion1}
        ${seleccion2}`
    );
    res.send({ duration, query: req.query, rows, rowsAffected });
  }
);

// http://localhost:9000/v1/inventario/productos/000101
router.get(
  '/:id',
  [auth(rolesAutorizados), validateParams(validateCodigo)],
  async (req, res) => {
    const { duration, rows, rowsAffected } = await runQuery(
      `SELECT
      P.Codigo 'codigo',
      P.[Codigo Alt] 'codigo_alt',
      P.Descripcion 'descripcion',
      P.Estatus 'estatus'
    FROM
      PRODUCTO AS P
    WHERE
      P.Codigo = '${req.params.id}'`
    );
    res.send({ duration, query: req.query, rows, rowsAffected });
  }
);

module.exports = router;
