const express = require('express');
const Joi = require('joi');
const auth = require('../../../middleware/auth');
const { validateQuery } = require('../../../middleware/validar');
const { runQuery } = require('../../../config/db/sqlsrv');

const router = express.Router();

const rolesAutorizados = [1, 2];

const query = (data) => {
  const schema = Joi.object({
    produccion: Joi.number().min(0).max(1).required(),
    stock: Joi.number().min(0).max(1).required(),
  });
  return schema.validate(data);
};

// http://localhost:9000/v1/reportes/produccion/sugerido?produccion=0.25&stock=0.50
router.get(
  '/',
  [auth(rolesAutorizados), validateQuery(query)],
  [validateQuery(query)],
  async (req, res) => {
    const { produccion, stock } = req.query;
    const { duration, rows, rowsAffected } = await runQuery(
      `DECLARE
      @fecha_hoy DATE = CAST(GETDATE () AS date),
      @intervalo1 int = 2,
      @intervalo2 int = 4,
      @t_produccion decimal (18,
        2) = ${produccion},
      @t_stock decimal (18,
        2) = ${stock}
    DECLARE
      @fecha_inicio1 date = CAST(DATEADD (m, - 1 * @intervalo1, @fecha_hoy) AS date),
      @fecha_inicio2 date = CAST(DATEADD (m, - 1 * @intervalo2, @fecha_hoy) AS date
    )
    SELECT
      T1.Codigo 'codigo',
      T1. [Codigo Alt] 'codigo_alt',
      T1.Descripcion 'descripcion',
      CAST(ISNULL(T3.Ventas2, 0) / @intervalo2 AS decimal (18, 2)) 'ventas_p4',
      CAST(ISNULL(T2.Ventas1, 0) / @intervalo1 AS decimal (18, 2)) 'ventas_p2',
      T5.Disponible 'disponible',
      @t_produccion 't_produccion',
      @t_stock 't_stock',
      CAST(ISNULL(T3.Ventas2, 0) / @intervalo2 AS decimal (18, 2)) * @t_produccion + CAST(ISNULL(T3.Ventas2, 0) / @intervalo2 AS decimal (18, 2)) * @t_stock - T5.Disponible 'sugerido_4',
      CAST(ISNULL(T2.Ventas1, 0) / @intervalo1 AS decimal (18, 2)) * @t_produccion + CAST(ISNULL(T2.Ventas1, 0) / @intervalo1 AS decimal (18, 2)) * @t_stock - T5.Disponible 'sugerido_2',
      CAST(((ISNULL(T3.Ventas2, 0) / @intervalo2 * @t_produccion + ISNULL(T3.Ventas2, 0) / @intervalo2 * @t_stock - T5.Disponible) + (ISNULL(T2.Ventas1, 0) / @intervalo1 * @t_produccion + ISNULL(T2.Ventas1, 0) / @intervalo1 * @t_stock - T5.Disponible)) / 2 AS decimal (18, 2)) 'promedio'
    FROM (
      SELECT
        P.Codigo,
        P. [Codigo Alt],
        P.Descripcion AS Descripcion
      FROM
        PRODUCTO AS P
      WHERE
        P. [Tipo Inventario] = 0
        AND P.Estatus = 'Activo'
      GROUP BY
        P.Codigo,
        P. [Codigo Alt],
        P.Descripcion) AS T1
      LEFT JOIN
      /*Ventas de Período 1*/
      (
        SELECT
          FD.Producto,
          SUM(FD.Cantidad) AS Ventas1
        FROM
          [FACTURA DETALLE] AS FD
          LEFT JOIN [FACTURA MAESTRO] AS FM ON FD.Serie = FM.Serie
            AND FD.Numero = FM.Numero
            AND FD.Empresa = FM.Empresa
            AND FD.Tipo = FM.Tipo
        WHERE
          FM.Empresa = 1
          AND FM.Estatus = 'G'
          AND FM.Fecha <= @fecha_hoy
          AND FM.Fecha >= @fecha_inicio1
        GROUP BY
          FD.Producto) AS T2 ON T1.Codigo = T2.Producto
      LEFT JOIN
      /*Ventas de Período 2*/
      (
        SELECT
          FD.Producto,
          SUM(FD.Cantidad) AS Ventas2
        FROM
          [FACTURA DETALLE] AS FD
          LEFT JOIN [FACTURA MAESTRO] AS FM ON FD.Serie = FM.Serie
            AND FD.Numero = FM.Numero
            AND FD.Empresa = FM.Empresa
            AND FD.Tipo = FM.Tipo
        WHERE
          FM.Empresa = 1
          AND FM.Estatus = 'G'
          AND FM.Fecha <= @fecha_hoy
          AND FM.Fecha >= @fecha_inicio2
        GROUP BY
          FD.Producto) AS T3 ON T1.Codigo = T3.Producto
      LEFT JOIN
      /*Existencias*/
      (
        SELECT
          Producto,
          CAST(SUM(Disponible) AS decimal (18, 2)) AS Disponible
        FROM
          EXISTENCIA
        WHERE
          Bodega IN(5, 11, 14, 27)
          AND Empresa = 1
        GROUP BY
          Producto) AS T5 ON T1.Codigo = T5.Producto
    ORDER BY
      T1. [Codigo Alt]`
    );
    res.send({ duration, query: req.query, rows, rowsAffected });
  }
);

module.exports = router;
