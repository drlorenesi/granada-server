// https://www.npmjs.com/package/mssql
const sql = require('mssql');

const sqlConfig = {
  user: process.env.SQLSRV_USER,
  password: process.env.SQLSRV_PASSWORD,
  database: process.env.SQLSRV_DATABASE,
  server: process.env.SQLSRV_HOST,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: false, // for azure
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};

// Test connection during App startup
async function sqlsrvConnect() {
  try {
    const db = await sql.connect(sqlConfig);
    console.log(`- Conectado a ${db.config.database} en ${db.config.server}`);
  } catch (err) {
    console.error(
      '- No fue posible conectarse a la Base de Datos:',
      err.message
    );
    return err;
  }
}

// Write async queries as:
// const { duration, rows, rowsAffected } = await runQuery(`SELECT GETDATE() AS Time`);
// Return result as:
// res.send({ duration, query: req.params/query/body, rows, rowsAffected });
async function runQuery(query) {
  try {
    const start = Date.now();
    await sql.connect(sqlConfig);
    const { recordset: rows, rowsAffected } = await sql.query(query);
    const duration = Date.now() - start;
    return { duration: `${duration} ms`, rows, rowsAffected };
  } catch (err) {
    console.log('Database error:', err.message);
  }
}

module.exports = { sqlsrvConnect, runQuery };
