const express = require('express');
const Joi = require('joi');
const { validateQuery } = require('../../middleware/validar');
const { runQuery } = require('../../config/db/sqlsrv');

const router = express.Router();

const query = (data) => {
  const schema = Joi.object({
    entrega: Joi.number().min(0).max(4).required(),
    stock: Joi.number().min(0).max(4).required(),
  });
  return schema.validate(data);
};

// http://localhost:9000/v1/query?entrega=1&stock=2
router.get('/', [validateQuery(query)], async (req, res) => {
  const { entrega, stock } = req.query;
  const { duration, rows, rowsAffected } = await runQuery(
    `SELECT 
      ${entrega} AS entrega, 
      ${stock} AS stock`
  );
  res.send({ duration, query: req.query, rows, rowsAffected });
});

module.exports = router;
