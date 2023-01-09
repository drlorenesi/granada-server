const express = require('express');
const auth = require('../../middleware/auth');
const { runQuery } = require('../../config/db/sqlsrv');

const router = express.Router();

const rolesAutorizados = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// http://localhost:9000/v1/inventario/tipos
router.get('/', [auth(rolesAutorizados)], async (req, res) => {
  const { duration, rows } = await runQuery(`
  SELECT
    TI.Codigo 'codigo',
    TI.Descripcion 'descripcion'
  FROM
    [TIPO INVENTARIO] AS TI
  WHERE
    TI.Codigo IN (0, 1, 2, 3);
  `);
  res.send({ duration, rows });
});

module.exports = router;
