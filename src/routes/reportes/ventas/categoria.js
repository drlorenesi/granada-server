const express = require('express');
const Joi = require('joi');
const auth = require('../../../middleware/auth');
const { validateQuery } = require('../../../middleware/validar');
const { query } = require('../../../config/db/sqlsrv');

const router = express.Router();

const rolesAutorizados = [1, 2];

const validateDates = (data) => {
  const schema = Joi.object({
    fechaIni: Joi.date().iso().greater('2017-01-01').required(),
    fechaFin: Joi.date().iso().max('2040-01-01').required(),
  });
  return schema.validate(data);
};

// http://localhost:9000/v1/reportes/ventas/categoria?fechaIni=2022-01-01&fechaFin=2022-01-06
router.get(
  '/',
  [auth(rolesAutorizados), validateQuery(validateDates)],
  async (req, res) => {
    const { fechaIni, fechaFin } = req.query;
    const { duration, rows } = await query(`
    DECLARE
      @FechaIni DATE = '${fechaIni}',
      @FechaFin DATE = '${fechaFin}'
      SELECT
        T1.categoria,
        SUM(T1.cantidad) 'cantidad_total',
        SUM(T1.costo_total) 'costo_total',
        SUM(T1.total_siva) 'venta_total_siva',
        CAST(SUM(T1.total_siva - T1.costo_total) AS DECIMAL (10, 2)) 'profit',
        CAST(SUM(T1.total_siva - T1.costo_total) / SUM(T1.total_siva) AS DECIMAL (6, 4)) 'profit_p',
        CAST((SUM(T1.total_siva) / SUM(T1.cantidad)) * 1.12 AS DECIMAL (10, 2)) 'precio_prom_civa'
      FROM (
        SELECT
          DV. [Descripcion General] 'division',
          FD.Producto 'producto',
          P. [Codigo Alt] 'codigo_alt',
          D.Descripcion 'categoria',
          P.Descripcion 'descripcion',
          FD.Cantidad 'cantidad',
          CASE WHEN FM.Moneda = 1 THEN
            FD.Total / 1.12
          WHEN FM.Moneda != 1 THEN
            FD.Total * FM. [Tipo Cambio]
          END 'total_siva',
          P.Costo * FD.Cantidad 'costo_total'
        FROM
          [FACTURA MAESTRO] AS FM
        LEFT JOIN [FACTURA DETALLE] AS FD ON FM.Serie = FD.Serie
          AND FM.Numero = FD.Numero
          AND FM.Tipo = FD.Tipo
      LEFT JOIN [DIVISION CLIENTE] AS DV ON FM. [DIVISION CLIENTE] = DV.Codigo
      LEFT JOIN PRODUCTO AS P ON FD.Producto = P.Codigo
      LEFT JOIN MEDIDA AS M ON FD.Medida = M.Codigo
      LEFT JOIN DIVISION AS D ON P.Division = D.Codigo
    WHERE
      FM.Empresa = 1
      AND FM.Estatus = 'G'
      AND FM.Fecha BETWEEN @FechaIni
      AND @FechaFin
      AND FD.Cantidad > 0) AS T1
    GROUP BY
      T1.categoria
  `);
    res.send({ duration, query: req.query, rows });
  }
);

module.exports = router;
