const express = require("express");
const Joi = require("joi");
const auth = require("../../../middleware/auth");
const { validateQuery } = require("../../../middleware/validar");
const { query } = require("../../../config/db/sqlsrv");

const router = express.Router();

const rolesAutorizados = [1, 2];

const validateDates = (data) => {
  const schema = Joi.object({
    fechaIni: Joi.date().iso().greater("2017-01-01").required(),
    fechaFin: Joi.date().iso().max("2040-01-01").required(),
  });
  return schema.validate(data);
};

// http://localhost:9000/v1/reportes/ventas/canal?fechaIni=2022-01-01&fechaFin=2022-01-06
router.get(
  "/",
  [auth(rolesAutorizados), validateQuery(validateDates)],
  async (req, res) => {
    const { fechaIni, fechaFin } = req.query;
    const { duration, rows } = await query(`
    DECLARE @FechaIni DATE = '${fechaIni}',
      @FechaFin DATE = '${fechaFin}'
      SELECT
        T1.canal,
        T1.ventas_siva,
        T1.nc_descuento_siva,
        T1.nc_devolucion_siva,
        (ventas_siva - nc_descuento_siva - nc_devolucion_siva) AS 'total'
      FROM
        (
          SELECT
            DV.[Descripcion General] AS 'canal',
            ISNULL(
              (
                SELECT
                  SUM(
                    ROUND(
                      CASE
                        WHEN FM.Moneda = 1 THEN FM.Total / 1.12
                        WHEN FM.Moneda != 1 THEN FM.Total * FM.[Tipo Cambio]
                      END,
                      2
                    )
                  )
                FROM
                  [FACTURA MAESTRO] AS FM
                  INNER JOIN CLIENTE AS C ON C.Empresa = FM.Empresa
                  AND FM.Cliente = C.Codigo
                WHERE
                  FM.Empresa = 1
                  AND CONVERT(DATE, FM.Fecha) BETWEEN @FechaIni AND @FechaFin
                  AND FM.Estatus = 'G'
                  AND C.Division = DV.Codigo
              ),
              0
            ) AS 'ventas_siva',
            ISNULL(
              (
                SELECT
                  SUM(
                    ROUND(
                      CASE
                        WHEN CXC.Moneda = 1 THEN CXC.Total / 1.12
                        WHEN CXC.Moneda != 1 THEN CXC.Total * CXC.[Tipo Cambio]
                      END,
                      2
                    )
                  )
                FROM
                  [CXC MAESTRO] AS CXC
                  LEFT JOIN CLIENTE AS C ON CXC.Cliente = C.Codigo
                  AND CXC.Empresa = C.Empresa
                WHERE
                  CXC.Empresa = 1
                  AND CXC.Tipo = 2
                  AND CONVERT(DATE, CXC.Fecha) BETWEEN @FechaIni AND @FechaFin
                  AND CXC.Estatus = 'G'
                  AND C.Division = DV.Codigo
                  AND NOT EXISTS (
                    SELECT
                      1
                    FROM
                      [CREDITO MAESTRO] AS CRE
                    WHERE
                      CRE.Empresa = CXC.Empresa
                      AND CRE.Cliente = CXC.Cliente
                      AND CRE.Total = CXC.Total
                      AND YEAR(CRE.Fecha) = YEAR(CXC.Fecha)
                      AND MONTH(CRE.Fecha) = MONTH(CXC.Fecha)
                  )
              ),
              0
            ) AS 'nc_descuento_siva',
            ISNULL(
              (
                SELECT
                  SUM(
                    ROUND(
                      CASE
                        WHEN CXC.Moneda = 1 THEN CXC.Total / 1.12
                        WHEN CXC.Moneda != 1 THEN CXC.Total * CXC.[Tipo Cambio]
                      END,
                      2
                    )
                  )
                FROM
                  [CXC MAESTRO] AS CXC
                  LEFT JOIN CLIENTE AS C ON CXC.Cliente = C.Codigo
                  AND CXC.Empresa = C.Empresa
                WHERE
                  CXC.Empresa = 1
                  AND CXC.Tipo = 2
                  AND CONVERT(DATE, CXC.Fecha) BETWEEN @FechaIni AND @FechaFin
                  AND CXC.Estatus = 'G'
                  AND C.Division = DV.Codigo
                  AND EXISTS (
                    SELECT
                      1
                    FROM
                      [CREDITO MAESTRO] AS CRE
                    WHERE
                      CRE.Empresa = CXC.Empresa
                      AND CRE.Cliente = CXC.Cliente
                      AND CRE.Total = CXC.Total
                      AND YEAR(CRE.Fecha) = YEAR(CXC.Fecha)
                      AND MONTH(CRE.Fecha) = MONTH(CXC.Fecha)
                  )
              ),
              0
            ) AS 'nc_devolucion_siva'
          FROM
            [DIVISION CLIENTE] AS DV
        ) AS T1
        ORDER BY
        canal
    `);
    res.send({ duration, query: req.query, rows });
  }
);

module.exports = router;
