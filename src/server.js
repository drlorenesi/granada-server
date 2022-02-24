const app = require('./app');
const mongodbConnect = require('./config/db/mongodb');
const { sqlsrvConnect } = require('./config/db/sqlsrv');

const env = process.env.ENTORNO.toUpperCase();
const port = process.env.PORT || 9000;

app.listen(port, async () => {
  console.log(`- Entorno: ${env}`);
  console.log(`- Servidor iniciado en puerto: ${port}`);
  await mongodbConnect();
  await sqlsrvConnect();
});
