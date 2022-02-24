const express = require('express');
const emailTest = require('../../utils/emailTest');

const router = express.Router();

// Envía email de prueba
// http://localhost:9000/v1/utils/email?x=test%40email.com

router.get('/', async (req, res) => {
  const { info, err } = await emailTest(req.query.x);

  if (err) return res.status(500).send({ mensaje: err });

  res.send({
    mensaje: 'Correo enviado!',
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
    info: info.envelope,
    messageId: info.messageId,
  });
});

module.exports = router;
