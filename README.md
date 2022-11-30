# Granada Server

Back End para para autenticar y crear sesiones de usuarios que utiliza [Express](https://expressjs.com/) y [MongoDB](https://www.mongodb.com/). Una vez autenticado el usuario, puede hacer consultas a los distintos "Endpoints" y tendrán acceso según su role.

Este proyecto hace uso de [HttpOnly Cookies](https://www.cookiepro.com/knowledge/httponly-cookie/) para autenticar a los usuarios. Por esta razón, es necesario correr el proceso en [HTTPS](https://www.cloudflare.com/learning/ssl/what-is-https/).

## Como Iniciar

La manera mas sencilla de crear un servidor seguro en un ambiente de desarrollo es usando [Caddy](https://caddyserver.com/docs/getting-started). Con Caddy podemos crear un [reverse proxy](https://caddyserver.com/docs/quick-starts/reverse-proxy) usando el `Caddyfile` incluido en el proyecto y corriendo el siguiente commando en una terminal:

```bash
caddy run
```

Adicionalmente, debemos crea un archivo tipo `.env` en el folder raíz con la siguiente información:

```text
# Generales #
JWT_SIGNATURE=
ORIGIN=(de donde vendrán las solicitudes, ej. 'mysitio.com' ó 'http://localhost:3000' en desarrollo)
ACCESTOKEN_MAX_AGE=(tiempo en minutos)
REFRESHTOKEN_MAX_AGE=(tiempo en minutos)
MONGO_URL=

# Base de Datos #
SQLSRV_USER=
SQLSRV_PASSWORD=
SQLSRV_DATABASE=
SQLSRV_HOST=(ip)

# Servidor de Correos #
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=

# Opcional #
SENTRY_URL=
```

Si la aplicación no detecta esta información, no iniciará y desplegará "`ERROR TERMINAL: ...`" en la consola.

Para iniciar la aplicación en modo `produccion` correr:

```bash
npm start
```

o en modo `desarrollo`:

```bash
npm run dev
```

En caso se agreguen pruebas, estas se pueden correr con:

```bash
npm run test
```

También es posible agregar `roles` "estándar" a la Base de Datos con:

```bash
npm run seed
```

Por último, en caso se quiera correr la aplicación usando [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/), se adjunta en los archivos del proyecto un ejemplo de configuación (`ecosystem.config.js`).
