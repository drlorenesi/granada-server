const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.send({ mensaje: 'El servicio está en línea.' });
});

module.exports = router;
