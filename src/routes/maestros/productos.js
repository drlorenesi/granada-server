const express = require('express');
const Joi = require('joi');
const auth = require('../../middleware/auth');
const { validateQuery, validateParams } = require('../../middleware/validar');
const { runQuery } = require('../../config/db/sqlsrv');

const router = express.Router();

const rolesAutorizados = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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

// const validateUpdate = () => {
//   const schema = Joi.object({
//     id: Joi.string().length(6).required(),
//   });
//   return schema.validate(data);
// }

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

    const { duration, rows, rowsAffected } = await runQuery(`
    SELECT
      P.Codigo 'codigo',
      P.[Codigo Alt] 'codigo_alt',
      P.Estatus 'estatus',
      P.Division 'division',
      P.Descripcion 'descripcion',
      P.[Tipo Inventario] 'tipo_inventario',
      P.Intermedio 'intermedio',
      P.Proveedor 'proveedor',
      CAST(P.Peso AS DECIMAL(8, 4)) 'peso',
      CAST(P.[Precio Sugerido] AS DECIMAL(8, 3)) 'precio_sugerido',
      CAST(P.Costo AS DECIMAL(8, 3)) 'costo_std',
      (
        SELECT
          CAST(
            ISNULL(MAX(E.[Costo Promedio]), 0) AS DECIMAL(12, 3)
          )
        FROM
          EXISTENCIA E
        WHERE
          P.Codigo = E.Producto
      ) 'costo_pp',
      (
        SELECT
          PU.Descripcion
        FROM
          [PRODUCTO UNIDAD] PU
        WHERE
          P.Codigo = PU.Producto
          AND PU.Estandar = 1
      ) 'unidad',
      (
        SELECT
          ISNULL(SUM(E.Disponible), 0)
        FROM
          EXISTENCIA E
        WHERE
          P.Codigo = E.Producto
      ) 'disponible'
    FROM
      PRODUCTO AS P
    WHERE
      ${seleccion1}
      ${seleccion2}
    ORDER BY
      codigo
      `);
    res.send({ duration, query: req.query, rows, rowsAffected });
  }
);

// http://localhost:9000/v1/inventario/productos/000101
router.get(
  '/:id',
  [auth(rolesAutorizados), validateParams(validateCodigo)],
  async (req, res) => {
    const { duration, rows, rowsAffected } = await runQuery(`
    SELECT
      P.Codigo 'codigo',
      P.[Codigo Alt] 'codigo_alt',
      P.Descripcion 'descripcion',
      (
        SELECT
          PU.Descripcion
        FROM
          [PRODUCTO UNIDAD] PU
        WHERE
          P.Codigo = PU.Producto
          AND PU.Estandar = 1
      ) 'unidad',
      CAST(P.Costo AS DECIMAL(8, 3)) 'costo_std',
      (
        SELECT
          CAST(
            ISNULL(MAX(E.[Costo Promedio]), 0) AS DECIMAL(12, 3)
          )
        FROM
          EXISTENCIA E
        WHERE
          P.Codigo = E.Producto
      ) 'costo_pp',
      (
        SELECT
          ISNULL(SUM(E.Disponible), 0)
        FROM
          EXISTENCIA E
        WHERE
          P.Codigo = E.Producto
      ) 'disponible',
      P.Estatus 'estatus'
    FROM
      PRODUCTO AS P
    WHERE
      P.Codigo = '${req.params.id}'
    `);
    if (rows.length === 0)
      return res
        .status(404)
        .send({ mensaje: 'El producto solicitado no existe.' });
    res.send({ duration, query: req.query, rows, rowsAffected });
  }
);

router.put('/:id', [auth(rolesAutorizados)], async (req, res) => {
  const { duration, rows, rowsAffected } = await runQuery(`
  UPDATE
    PRODUCTO
  SET
    Estatus = '${req.body.estatus}',
    [Codigo Alt] = '${req.body.codigo_alt}',
    Descripcion = '${req.body.descripcion}'
  WHERE
    Codigo = '${req.body.codigo}'
  `);

  res.send({ duration, query: req.body, rows, rowsAffected });
});

module.exports = router;
