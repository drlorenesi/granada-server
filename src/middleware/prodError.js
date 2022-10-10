module.exports = (error, req, res, next) => {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.status(500).send({
    error:
      'Ocurrio un error en el servidor y no se pudo llevar a cabo la solicitud...',
    code: res.sentry,
  });
};
