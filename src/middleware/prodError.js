module.exports = (app) => {
  // Optional fallthrough error handler
  app.use(function onError(err, req, res, next) {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    res.statusCode = 500;
    res.end(
      'Ocurrio un error en el servidor y no se pudo llevar a cabo la solicitud..\n' +
        'Por favor tomar nota del siguiente codigo de error: ' +
        res.sentry
    );
  });
};
