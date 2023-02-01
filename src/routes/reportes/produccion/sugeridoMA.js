const express = require('express');
const Joi = require('joi');
const auth = require('../../../middleware/auth');
const { validateQuery } = require('../../../middleware/validar');
const { query } = require('../../../config/db/sqlsrv');

const router = express.Router();

const rolesAutorizados = [1, 2];

const validate = (data) => {
  const schema = Joi.object({
    tipo: Joi.number().min(1).max(4).required(),
    stock: Joi.number().min(0).max(1).required(),
    entrega: Joi.number().min(0).max(1).required(),
    bodegas: Joi.string().empty('').default(null),
  });
  return schema.validate(data);
};

// http://localhost:9000/v1/reportes/produccion/sugerido-ma?tipo=1&stock=2.00&entrega=1.00&bodegas=
router.get(
  '/',
  [auth(rolesAutorizados), validateQuery(validate)],
  async (req, res) => {
    const { tipo, stock, entrega, bodegas } = req.query;

    let seleccion;
    if (tipo === '4') {
      seleccion = `AND P.[Tipo Inventario] IN(1) AND P.Intermedio = 1`;
    } else {
      seleccion = `AND P.[Tipo Inventario] IN(${
        tipo === '' ? null : tipo
      }) AND P.Intermedio = 0`;
    }

    const { duration, rows, rowsAffected } = await query(
      `DECLARE @f_hoy DATE = GETDATE (),
      @t_stock DECIMAL (4, 2) = ${stock},
      @t_entrega DECIMAL (4, 2) = ${entrega},
      @int2 INT = 2,
      @int4 INT = 4,
      @f_ini2 DATE,
      @f_ini4 DATE
      SET
        @f_ini2 = DATEADD (MM, - @int2, @f_hoy)
      SET
        @f_ini4 = DATEADD (MM, - @int4, @f_hoy)
      SELECT
      codigo,
      codigo_alt,
      descripcion,
      unidad,
      ISNULL(costo_pp, 0) 'costo_pp',
      ISNULL(salidas_p4, 0) 'salidas_p4',
      ISNULL(salidas_p2, 0) 'salidas_p2',
      disponible,
      @t_stock 't_stock',
      @t_entrega 't_entrega',
      ISNULL((salidas_p4*@t_entrega + salidas_p4*@t_stock - disponible), 0) 'sugerido_4',
      ISNULL((salidas_p2*@t_entrega + salidas_p2*@t_stock - disponible), 0) 'sugerido_2',
      ISNULL(((salidas_p4*@t_entrega + salidas_p4*@t_stock - disponible) +
      (salidas_p2*@t_entrega + salidas_p2*@t_stock - disponible))/2, 0) 'orden'
      FROM
        (
          SELECT
            P.Codigo 'codigo',
            P.[Codigo Alt] 'codigo_alt',
            P.Descripcion 'descripcion',
            -- Unidad de Medida
            (
              SELECT
                PU.Descripcion
              FROM
                [PRODUCTO UNIDAD] PU
              WHERE
                P.Codigo = PU.Producto
                AND PU.Estandar = 1
            ) 'unidad',
            --  Seleccionar Bodegas
            (
              SELECT
                CAST(ISNULL(SUM(E.Disponible), 0) AS DECIMAL (10, 2))
              FROM
                EXISTENCIA E
              WHERE
                P.Codigo = E.Producto
                AND E.Bodega IN(${bodegas === '' ? null : bodegas})
            ) 'disponible',
            -- Costo PP
            (
              SELECT
                MAX(E.[Costo Promedio])
              FROM
                EXISTENCIA E
              WHERE
                P.Codigo = E.Producto
              GROUP BY
                E.Producto
            ) 'costo_pp'
          FROM
            PRODUCTO AS P
          WHERE
            -- Seleccionar Tipo de Inventario
            P.Estatus = 'Activo'
            ${seleccion}
        ) AS T1
        LEFT JOIN (
          -- Salidas 4
          SELECT
            MD.Producto,
            SUM(MD.Cantidad)/@int4 'salidas_p4'
          FROM
            [MOVIMIENTO MAESTRO] MM
            INNER JOIN [MOVIMIENTO DETALLE] MD ON MM.Numero = MD.Numero
            AND MM.Serie = MD.Serie
            AND MM.Tipo = MD.Tipo
          WHERE
            MM.Tipo = 5
            AND MM.Estatus = 'G'
            AND MM.Fecha BETWEEN @f_ini4
            AND @f_hoy
          GROUP BY
            MD.Producto
        ) AS T2 ON T1.Codigo = T2.Producto
        LEFT JOIN (
          -- Salidas 2
          SELECT
            MD.Producto,
            SUM(MD.Cantidad)/@int2 'salidas_p2'
          FROM
            [MOVIMIENTO MAESTRO] MM
            INNER JOIN [MOVIMIENTO DETALLE] MD ON MM.Numero = MD.Numero
            AND MM.Serie = MD.Serie
            AND MM.Tipo = MD.Tipo
          WHERE
            MM.Tipo = 5
            AND MM.Estatus = 'G'
            AND MM.Fecha BETWEEN @f_ini2
            AND @f_hoy
          GROUP BY
            MD.Producto
        ) AS T3 ON T1.Codigo = T3.Producto
      ORDER BY
        codigo`
    );
    res.send({ duration, query: req.query, rows, rowsAffected });
  }
);

module.exports = router;
