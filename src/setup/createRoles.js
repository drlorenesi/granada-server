require('dotenv').config();
const mongodbConnect = require('../config/db/mongodb');
const { Role } = require('../models/role');

const roles = [
  { nivel: 1, descripcion: 'Administrador' },
  { nivel: 2, descripcion: 'Gerencia' },
  { nivel: 3, descripcion: 'Ventas' },
  { nivel: 4, descripcion: 'Producción' },
  { nivel: 5, descripcion: 'Contabilidad' },
  { nivel: 6, descripcion: 'Recursos Humanos' },
  { nivel: 7, descripcion: 'Inventarios' },
  { nivel: 10, descripcion: 'General' },
];

async function createRoles() {
  try {
    await mongodbConnect();
    await Role.insertMany(roles);
    console.log('Enhorabuena! Los roles fueron creados exitosamente.');
    process.exit(0);
  } catch (error) {
    console.log('Ocurrió un error:', error.message);
    process.exit(1);
  }
}

createRoles();
