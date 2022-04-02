const express = require('express');
const Joi = require('joi');
// const auth = require('../../../middleware/auth');
const { validateQuery } = require('../../../middleware/validar');
const { runQuery } = require('../../../config/db/sqlsrv');

const router = express.Router();

// const rolesAutorizados = [1, 2];

const query = (data) => {
  const schema = Joi.object({
    stock: Joi.number().integer().min(1).max(4).required(),
    produccion: Joi.number().integer().min(1).max(4).required(),
  });
  return schema.validate(data);
};

// http://localhost:9000/v1/reportes/produccion/sugerido?stock=2&produccion=1
router.get(
  '/',
  //   [auth(rolesAutorizados), validateQuery(query)],
  [validateQuery(query)],
  async (req, res) => {
    const { stock, produccion } = req.query;
    const { duration, rows, rowsAffected } = await runQuery(
      `SELECT ${stock} AS stock, ${produccion} AS produccion`
    );
    res.send({ duration, query: req.query, rows, rowsAffected });
  }
);

module.exports = router;
