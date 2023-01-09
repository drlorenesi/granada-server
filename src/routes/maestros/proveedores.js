const express = require('express');
const Joi = require('joi');
const auth = require('../../middleware/auth');
const { runQuery } = require('../../config/db/sqlsrv');

const router = express.Router();

const rolesAutorizados = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// http://localhost:9000/v1/maestros/proveedores
router.get('/', [auth(rolesAutorizados)], async (req, res) => {
  const { duration, rows, rowsAffected } = await runQuery(`
    SELECT
      P.Codigo,
      P.Estatus,
      P.Repedido,
      P.Nombre,
      P.Razon,
      P.[Identificacion Tributaria],
      P.[Dias Credito],
      P.Estatus,
      P.Tipo
    FROM
      PROVEEDOR P
    WHERE 
      P.Empresa = 1
      AND P.Tipo IN (1, 2)
  `);
  res.send({ duration, query: req.query, rows, rowsAffected });
});

module.exports = router;
