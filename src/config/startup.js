module.exports = () => {
  if (!process.env.JWT_SIGNATURE) {
    console.error('ERROR TERMINAL: JWT_SIGNATURE no está definida.');
    process.exit(1);
  }
  if (!process.env.ORIGIN) {
    console.error('ERROR TERMINAL: JWT_SIGNATURE no está definida.');
    process.exit(1);
  }
  if (!process.env.ACCESTOKEN_MAX_AGE) {
    console.error('ERROR TERMINAL: ACCESTOKEN_MAX_AGE no está definido.');
    process.exit(1);
  }
  if (!process.env.REFRESHTOKEN_MAX_AGE) {
    console.error('ERROR TERMINAL: REFRESHTOKEN_MAX_AGE no está definido.');
    process.exit(1);
  }
  if (!process.env.MONGO_URL) {
    console.error('ERROR TERMINAL: MONGO_URL no está definido.');
    process.exit(1);
  }
};
