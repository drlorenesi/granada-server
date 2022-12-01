const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

let origin = new RegExp(`${process.env.ORIGIN}`);

const corsOptions = {
  origin: [
    origin,
    'http://localhost:3000',
    'https://deltacold.com/',
    'https://granada-frontend.pages.dev',
  ],
  credentials: true,
};

module.exports = (app) => {
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(cookieParser());
  if (process.env.ENTORNO === 'desarrollo') {
    app.use(morgan('dev'));
  }
  if (process.env.ENTORNO === 'produccion') {
    console.log('production time!');
    app.use(helmet());
    app.use(compression());
  }
};
