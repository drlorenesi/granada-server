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

// http://localhost:9000/v1/reportes/produccion/unidades-mensuales?fechaIni=2022-01-01&fechaFin=2022-01-06
router.get(
  '/',
  [auth(rolesAutorizados), validateQuery(validateDates)],
  async (req, res) => {
    const { fechaIni, fechaFin } = req.query;
    const { duration, rows } = await query(`
    DECLARE
      @fechaIni DATE = '${fechaIni}',
      @fechaFin DATE = '${fechaFin}'
      SET
      LANGUAGE Spanish
    SELECT 
      *
    FROM
      (
        SELECT
          P.Codigo 'codigo',
          P.[Codigo Alt] 'codigo_alt',
          P.Descripcion 'descripcion',
          P.Peso 'peso',
          DATENAME(MONTH, MM.Fecha) 'mes',
          SUM(MD.Cantidad) 'cantidad'
        FROM
          PRODUCTO P
          LEFT JOIN [MOVIMIENTO DETALLE] MD ON P.Codigo = MD.Producto
          LEFT JOIN [MOVIMIENTO MAESTRO] MM ON MD.Numero = MM.Numero
          AND MD.Serie = MM.Serie
          AND MD.Tipo = MM.Tipo
          AND MD.Empresa = MM.Empresa
        WHERE
          MM.Estatus = 'G'
          AND MM.Bodega IN(5, 11, 213)
          AND MM.Fecha BETWEEN @fechaIni
          AND @fechaFin
          AND MM.Tipo = 15
          AND P.[Tipo Inventario] IN(0)
        GROUP BY
          P.Codigo,
          P.[Codigo Alt],
          P.Descripcion,
          P.Peso,
          DATENAME(MONTH, MM.Fecha)
      ) T1 PIVOT (
        SUM(cantidad) FOR mes IN (
          [Enero],
          [Febrero],
          [Marzo],
          [Abril],
          [Mayo],
          [Junio],
          [Julio],
          [Agosto],
          [Septiembre],
          [Octubre],
          [Noviembre],
          [Diciembre]
        )
      ) PVT
    ORDER BY
      codigo_alt ASC
    `);
    res.send({ duration, query: req.query, rows });
  }
);

module.exports = router;
