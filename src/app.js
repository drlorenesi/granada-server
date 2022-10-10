const express = require('express');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
require('dotenv').config();
require('express-async-errors');

const app = express();

// Startup Checks
require('./config/startup')();

// Prod Logger
if (process.env.ENTORNO === 'produccion') {
  Sentry.init({
    dsn: process.env.SENTRY_URL,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
  // RequestHandler creates a separate execution context using domains, so that every
  // transaction/span/breadcrumb is attached to its own Hub instance
  app.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());
}

// Middleware
require('./config/middleware')(app);

// Routes
require('./config/routes')(app);

// Prod Error Handler
// The error handler must be before any other error middleware and after all controllers
if (process.env.ENTORNO === 'produccion') {
  app.use(Sentry.Handlers.errorHandler());
  // Optional fallthrough error handler
  app.use(require('./middleware/prodError'));
}

// Dev Error Handler
if (process.env.ENTORNO === 'desarrollo') {
  app.use(require('./middleware/devError'));
}

module.exports = app;
