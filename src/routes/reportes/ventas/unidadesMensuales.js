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

// http://localhost:9000/v1/reportes/ventas/unidades-mensuales?fechaIni=2022-01-01&fechaFin=2022-01-06
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
          DATENAME(MONTH, FM.Fecha) 'mes',
          SUM(FD.Cantidad) 'cantidad'
        FROM
          PRODUCTO P
          LEFT JOIN [FACTURA DETALLE] FD ON P.Codigo = FD.Producto
          LEFT JOIN [FACTURA MAESTRO] FM ON FD.Numero = FM.Numero
          AND FD.Serie = FM.Serie
          AND FD.Tipo = FM.Tipo
          AND FD.Empresa = FM.Empresa
          LEFT JOIN CLIENTE C ON FM.Cliente = C.Codigo
        WHERE
          FM.Estatus = 'G'
          AND FM.Fecha BETWEEN @fechaIni
          AND @fechaFin
          AND FM.Tipo = 4
          AND P.[Tipo Inventario] IN(0)
          AND C.[E-mail] NOT LIKE '%AUTOC%'
          AND P.Estatus = 'Activo'
        GROUP BY
          P.Codigo,
          P.[Codigo Alt],
          P.Descripcion,
          DATENAME(MONTH, FM.Fecha)
      ) T1 PIVOT (
        SUM(Cantidad) FOR Mes IN (
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
