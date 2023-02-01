const express = require('express');
const Joi = require('joi');
const auth = require('../../../middleware/auth');
const { validateQuery } = require('../../../middleware/validar');
const { query } = require('../../../config/db/sqlsrv');

const router = express.Router();

const rolesAutorizados = [1, 2];

const validate = (data) => {
  const schema = Joi.object({
    stock: Joi.number().min(0).max(1).required(),
    produccion: Joi.number().min(0).max(1).required(),
    bodegas: Joi.string().empty('').default(null),
  });
  return schema.validate(data);
};

// http://localhost:9000/v1/reportes/produccion/sugerido-pt?produccion=0.25&stock=0.50&bodegas=
router.get(
  '/',
  [auth(rolesAutorizados), validateQuery(validate)],
  async (req, res) => {
    const { stock, produccion, bodegas } = req.query;
    const { duration, rows, rowsAffected } = await query(
      `DECLARE @f_hoy DATE = GETDATE (),
      @t_stock DECIMAL(4, 2) = ${stock},
      @t_produccion DECIMAL(4, 2) = ${produccion},
      @int2 INT = 2,
      @int4 INT = 4,
      @f_ini2 DATE,
      @f_ini4 DATE
      SET
        @f_ini2 = DATEADD (MM, - @int2, @f_hoy)
      SET
        @f_ini4 = DATEADD (MM, - @int4, @f_hoy)
      SELECT
        *,
        CAST(
          ventas_p4 * t_produccion + ventas_p4 * t_stock - disponible AS DECIMAL(10, 2)
        ) 'sugerido_4',
        CAST(
          ventas_p2 * t_produccion + ventas_p2 * t_stock - disponible AS DECIMAL(10, 2)
        ) 'sugerido_2',
        CAST(
          (
            (
              ventas_p4 * t_produccion + ventas_p4 * t_stock - disponible
            ) + (
              ventas_p2 * t_produccion + ventas_p2 * t_stock - disponible
            )
          ) / 2 AS DECIMAL(10, 2)
        ) 'promedio'
      FROM
        (
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
            CAST(P.Costo AS DECIMAL(8, 3)) 'costo',
            -- Ventas p4
            (
              SELECT
                ISNULL(SUM(FD.Cantidad), 0)
              FROM
                [FACTURA MAESTRO] FM
                LEFT JOIN [FACTURA DETALLE] FD ON FM.Numero = FD.Numero
                AND FM.Serie = FD.Serie
                AND FM.Tipo = FD.Tipo
                AND FM.Empresa = FD.Empresa
              WHERE
                FD.Producto = P.Codigo
                AND FM.Estatus = 'G'
                AND CAST(FM.Fecha AS DATE) BETWEEN @f_ini4
                AND @f_hoy
            ) / @int4 'ventas_p4',
            -- Ventas p2
            (
              SELECT
                ISNULL(SUM(FD.Cantidad), 0)
              FROM
                [FACTURA MAESTRO] FM
                LEFT JOIN [FACTURA DETALLE] FD ON FM.Numero = FD.Numero
                AND FM.Serie = FD.Serie
                AND FM.Tipo = FD.Tipo
                AND FM.Empresa = FD.Empresa
              WHERE
                FD.Producto = P.Codigo
                AND FM.Estatus = 'G'
                AND CAST(FM.Fecha AS DATE) BETWEEN @f_ini2
                AND @f_hoy
            ) / @int2 'ventas_p2',
            -- Disponible
            (
              SELECT
                CAST(ISNULL(SUM(E.Disponible), 0) AS DECIMAL(10, 2))
              FROM
                EXISTENCIA E
              WHERE
                P.Codigo = E.Producto
                AND E.Bodega IN (${
                  bodegas === '' ? null : bodegas
                }) -- Seleccionar Bodegas
            ) 'disponible',
            @t_stock 't_stock',
            @t_produccion 't_produccion'
          FROM
            PRODUCTO P
          WHERE
            P.[Tipo Inventario] IN (0) -- Seleccionar Tipo de Inventario
            AND P.Estatus = 'Activo'
        ) AS T1
      ORDER BY
        codigo_alt`
    );
    res.send({ duration, query: req.query, rows, rowsAffected });
  }
);

module.exports = router;
