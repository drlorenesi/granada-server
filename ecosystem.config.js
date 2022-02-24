// - Sample 'ecosystem.config.js' file if you plan on running your
//   app with PM2 (https://pm2.keymetrics.io/docs/usage/quick-start/)
// - If you are using an `.env` file, make sure it is on the same
//   level as ecosystem.config.js file

module.exports = {
  apps: [
    {
      // General
      name: 'Granada Backend',
      script: './apps/granada-server/src/server.js',
      watch: './apps/granada-server',
      watch_delay: 1000,
      ignore_watch: [
        './apps/granada-server/node_modules',
        './apps/granada-server/erros.log',
      ],
      // Advanced Features
      instances: 4,
      exec_mode: 'cluster',
      max_memory_restart: '300M',
      env: {
        ENTORNO: 'produccion',
        PORT: '9000',
      },
      // Log Files
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      merge_logs: true,
    },
  ],
};
