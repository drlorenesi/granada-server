const mongoose = require('mongoose');
// Nivel 0: Administrador
// nivel 1: Gerencia
// nivel 2: Contabilidad
// nivel 3: Produccion
// nivel 4: Ventas
// nivel 5: Inventarios
// nivel 6: (pend)
// nivel 7: (pend)
// nivel 8: (pend)
// nivel 9: (pend)
// nivel 10: General

const roleSchema = new mongoose.Schema({
  nivel: {
    type: Number,
    required: true,
  },
  descripcion: {
    type: String,
    maxLength: 255,
    trim: true,
    required: true,
    maxLength: 255,
  },
});

const Role = mongoose.model('Role', roleSchema);

module.exports = { roleSchema, Role };
