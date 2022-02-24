const logger = require('../config/logger');

module.exports = (error, req, res, next) => {
  console.log(process.env.ENTORNO);
  logger.error('API Error.\n%s', error);
  res.status(500).send({
    error:
      'Ocurrió un error en el servidor y no se pudo llevar acabo la solicitud.',
  });
};
