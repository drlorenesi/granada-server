const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
    format.prettyPrint()
  ),
  transports: [
    new transports.File({ filename: 'errors.log' }),
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
});

process.on('uncaughtException', (error) => {
  logger.error('Unhandled Exception.\n%s', error.stack);
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection.\n%s', error.stack);
});

module.exports = logger;
