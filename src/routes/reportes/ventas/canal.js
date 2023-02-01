const express = require('express');
const Joi = require('joi');
const auth = require('../../../middleware/auth');
const { validateQuery } = require('../../../middleware/validar');
const { runQuery } = require('../../../config/db/sqlsrv');

const router = express.Router();

const rolesAutorizados = [1, 2];

const validateDates = (data) => {
  const schema = Joi.object({
    fechaIni: Joi.date().iso().greater('2017-01-01').required(),
    fechaFin: Joi.date().iso().max('2040-01-01').required(),
  });
  return schema.validate(data);
};

// http://localhost:9000/v1/reportes/ventas/canal?fechaIni=2022-01-01&fechaFin=2022-01-06
router.get(
  '/',
  [auth(rolesAutorizados), validateQuery(validateDates)],
  async (req, res) => {
    const { fechaIni, fechaFin } = req.query;
    const { duration, rows } = await runQuery(`
    DECLARE
        @FechaIni DATE = '${fechaIni}',
        @FechaFin DATE = '${fechaFin}'
        SELECT
            T1. [Descripcion General] AS 'canal',
            ISNULL(T2. [Total Ventas sIVA], 0) AS 'total_ventas_siva',
            ISNULL(T3. [Total NC Devolución sIVA], 0) AS 'total_nc_devolucion_siva',
            ISNULL(T4. [Total NC Valor sIVA], 0) AS 'total_nc_valor_siva',
            ISNULL(T2. [Total Ventas sIVA], 0) - ISNULL(T3. [Total NC Devolución sIVA], 0) - ISNULL(T4. [Total NC Valor sIVA], 0) AS 'total' -- DIVISION CLIENTE
        FROM (
            SELECT
                DV. [Descripcion General],
                DV.Orden
            FROM
                [DIVISION CLIENTE] AS DV) AS T1 -- FACTURAS GRABADAS sIVA
        LEFT JOIN (
            SELECT
                DV. [Descripcion General],
                ISNULL(ROUND(SUM(
                            CASE WHEN FM.Moneda = 1 THEN
                                FM.Total / 1.12
                            WHEN FM.Moneda != 1 THEN
                                FM.Total * FM. [Tipo Cambio]
                            END), 2), 0) AS 'Total Ventas sIVA'
            FROM
                [FACTURA MAESTRO] AS FM
                LEFT JOIN [DIVISION CLIENTE] AS DV ON FM. [Division Cliente] = DV.Codigo
            WHERE
                FM.Empresa = 1
                AND CAST(FM.Fecha AS DATE) BETWEEN @FechaIni
                AND @FechaFin
                AND FM.Estatus = 'G'
            GROUP BY
                DV. [Descripcion General]) AS T2 ON T1. [Descripcion General] = T2. [Descripcion General] -- NOTAS DE CRÉDITO DEVOLUCION sIVA
        LEFT JOIN (
            SELECT
                DC. [Descripcion General],
                ROUND(SUM(
                        CASE WHEN CM.Moneda = 1 THEN
                            CM.Total / 1.12
                        WHEN CM.Moneda != 1 THEN
                            CM.Total * CM. [Tipo Cambio]
                        END), 2) AS 'Total NC Devolución sIVA'
            FROM
                [CREDITO MAESTRO] AS CM
                LEFT JOIN CLIENTE AS C ON CM.Cliente = C.Codigo
                    AND CM.Empresa = C.Empresa
            LEFT JOIN [DIVISION CLIENTE] AS DC ON C.Division = DC.Codigo
        WHERE
            CM.Empresa = 1
            AND CM.Tipo IN (14, 17)
            AND CAST(CM.Fecha AS DATE) BETWEEN @FechaIni
            AND @FechaFin
            AND CM.Estatus = 'G'
        GROUP BY
            DC. [Descripcion General]) AS T3 ON T1. [Descripcion General] = T3. [Descripcion General] -- NOTAS DE CRÉDITO VALOR sIVA
        LEFT JOIN (
            SELECT
                DC. [Descripcion General],
                ROUND(SUM(
                        CASE WHEN CXC.Moneda = 1 THEN
                            CXC.Total / 1.12
                        WHEN CXC.Moneda != 1 THEN
                            CXC.Total * CXC. [Tipo Cambio]
                        END), 2) AS 'Total NC Valor sIVA'
            FROM
                [CXC MAESTRO] AS CXC
                LEFT JOIN CLIENTE AS C ON CXC.Cliente = C.Codigo
                    AND CXC.Empresa = C.Empresa
            LEFT JOIN [DIVISION CLIENTE] AS DC ON C.Division = DC.Codigo
        WHERE
            CXC.Empresa = 1
            AND CXC.Tipo = 2
            AND CAST(CXC.Fecha AS DATE) BETWEEN @FechaIni
            AND @FechaFin
            AND CXC.Estatus = 'G'
        GROUP BY
            DC. [Descripcion General]) AS T4 ON T1. [Descripcion General] = T4. [Descripcion General]
    ORDER BY
        T1.Orden
    `);
    res.send({ duration, query: req.query, rows });
  }
);

module.exports = router;
