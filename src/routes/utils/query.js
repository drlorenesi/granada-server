const express = require('express');
const Joi = require('joi');
const { validateQuery } = require('../../middleware/validar');
const { runQuery } = require('../../config/db/sqlsrv');

const router = express.Router();

const query = (data) => {
  const schema = Joi.object({
    stock: Joi.number().min(0).max(1).required(),
    entrega: Joi.number().min(0).max(1).required(),
  });
  return schema.validate(data);
};

// http://localhost:9000/v1/query?stock=2.00&entrega=1.00
router.get('/', [validateQuery(query)], async (req, res) => {
  const { stock, entrega } = req.query;

  const { duration, rows, rowsAffected } = await runQuery(
    `
      DECLARE @f_hoy DATE = GETDATE (),
      @t_stock DECIMAL (4, 2) = ${stock},
      @t_entrega DECIMAL (4, 2) = ${entrega},
      @int2 INT = 2,
      @int4 INT = 4,
      @f_ini2 DATE,
      @f_ini4 DATE
      SET
        @f_ini2 = DATEADD (MM, - @int2, @f_hoy)
      SET
        @f_ini4 = DATEADD (MM, - @int4, @f_hoy)
      SELECT
        @t_stock 't_stock',
        @t_entrega 't_entrega',
        @int2 'int2',
        @int4 'int4',
        @f_ini2 'f_ini2',
        @f_ini4 'f_ini4'
      `
  );
  res.send({ duration, query: req.query, rows, rowsAffected });
});

module.exports = router;
