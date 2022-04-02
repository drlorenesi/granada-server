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
    estatus: Joi.string().valid('activo', 'inactivo').required(),
  });
  return schema.validate(data);
};

const validateCodigo = (data) => {
  const schema = Joi.object({
    id: Joi.string().length(6).required(),
  });
  return schema.validate(data);
};

// http://localhost:9000/v1/inventario/productos?tipo=0&estatus=activo
router.get(
  '/',
  [auth(rolesAutorizados), validateQuery(validateProducto)],
  async (req, res) => {
    const { tipo, estatus } = req.query;
    console.log(tipo, estatus);
    const { duration, rows } = await runQuery(`
  DECLARE
    @Tipo INT = '${tipo}',
    @Estatus VARCHAR(30) = '${estatus}'
    SELECT
      P.Codigo 'codigo',
      P. [Tipo Inventario] 'tipo_inventario',
      P.Intermedio 'intermedio',
      P.Division 'division',
      P. [Codigo Alt] 'codigo_alt',
      P.Descripcion 'descripcion',
      P.Minimo 'minimo',
      P.Maximo 'maximo', 
      P. [Precio Sugerido] 'precio_sugerido',
      P.Costo 'costo',
      P.Peso 'peso',
      P.[Re Orden] 're_orden',
      P.[Unidad Minima] 'unidad_minima'
    FROM
      PRODUCTO AS P
    WHERE
      P. [TIPO INVENTARIO] = @Tipo
      AND P.Estatus = @Estatus
  `);
    res.send({ duration, rows });
  }
);

// http://localhost:9000/v1/inventario/productos/000101
router.get('/:id', [validateParams(validateCodigo)], async (req, res) => {
  const { duration, rows } = await query(`
    SELECT
      P.[Tipo Inventario] 'tipo_inventario',
      P.Division 'division',
      P.[Codigo Alt] 'codigo_alt',
      P.Descripcion 'descripcion',
      P.[Precio Sugerido] 'precio_sugerido',
      P.Costo 'costo'
    FROM
      PRODUCTO AS P
    WHERE
      P.Codigo = '${req.params.id}'
  `);
  res.send({ duration, rows });
});

module.exports = router;
