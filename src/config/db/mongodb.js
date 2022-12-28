const mongoose = require('mongoose');

async function mongodbConnect() {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URL);
    console.log(
      `- Conectado a ${mongoose.connection.name} en ${mongoose.connection.host}`
    );
    return mongoose.connection;
  } catch (err) {
    console.log('- No fue posible conectarse a la Base de Datos:', err.message);
    return err;
  }
}

module.exports = mongodbConnect;
