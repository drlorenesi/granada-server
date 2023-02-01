// https://www.npmjs.com/package/mssql
const { ConnectionPool } = require('mssql');

const pool = new ConnectionPool({
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
    encrypt: false,
    enableArithAbort: true,
  },
});

// Test connection during App startup
async function sqlsrvConnect() {
  try {
    const db = await pool.connect();
    console.log(`- Connected to ${db.config.database} on ${db.config.server}`);
  } catch (err) {
    console.error('Database connection error:', err.message);
  }
}

// Write async queries as:
// const { duration, rows, rowsAffected } = await query(`SELECT NOW()`);
async function query(sql) {
  const start = Date.now();
  try {
    await pool.connect();
    const { recordset: rows, rowsAffected } = await pool.query(sql);
    const duration = Date.now() - start;
    return { duration: `${duration} ms`, rows, rowsAffected: rowsAffected[0] };
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = { sqlsrvConnect, query };
