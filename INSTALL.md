# Instalación y configuración de la aplicación seguros RHDF
# Reto 3 Unidad 2 Asegura y evalúa tu despliegue web
# Alumno: Raúl Humberto Díaz Fernández
# Asesor: Jenny Betsabé Vázquez Aguirre

Esta guía permite reproducir el entorno local de **RHDF - Sistema para control de seguros**. La aplicación se ejecuta con el framework Express.js, guarda la información en PostgreSQL y se levanta localmente usando Apache HTTP Server.

## Requisitos

| Herramienta | Versión utilizada |
|---|---:|
| Node.js | 22.23.3 |
| npm | 10.9.9 |
| PostgreSQL | 16.15 |
| Apache HTTP Server | 2.4.58 |

En Linux Mint, instala los requisitos del sistema con los siguientes comandos:

```bash
sudo apt update
sudo apt install nodejs npm postgresql postgresql-contrib apache2
```

## Instalar las dependencias

Desde la raíz del proyecto, instala las dependencias que están en `package.json`:

```bash
npm install
```

Las dependencias principales son las siguientes:

- `express`: framework web.
- `pg`: conexión con PostgreSQL.
- `dotenv`: carga de variables de entorno.
- `express-validator`: validación de datos de formularios.
- `helmet`: encabezados de seguridad para Express.
- `nodemon`: reinicio automático del servidor durante el desarrollo.

## Configurar la base de datos PostgreSQL

Inicia la consola de PostgreSQL con el usuario administrador:

```bash
sudo -u postgres psql
```

Dentro de la consola, crea el usuario y la base de datos con el siguiente script:

```sql
CREATE ROLE rhdf_app WITH LOGIN;
\password rhdf_app
CREATE DATABASE control_polizas OWNER rhdf_app;
\q
```

La contraseña solicitada debe mantenerse privada ya que es confidencial y no debe incluirse en el repositorio.

Ejecuta el script de inicialización incluido en el proyecto:

```bash
psql -h 127.0.0.1 -U rhdf_app -d control_polizas -W -f sql/init.sql
```

El script crea las tablas `aseguradoras` y `polizas`, la llave foránea entre ambas, restricciones de integridad, índices y las aseguradoras ficticias iniciales.

## Configurar las variables de entorno

Crea el archivo local `.env` a partir de la plantilla:

```bash
cp .env.example .env
```

Edita `.env` y reemplaza el valor de `DB_PASSWORD` con la contraseña definida para `rhdf_app`:

```env
NODE_ENV=development
HOST=127.0.0.1
PORT=3000

DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=control_polizas
DB_USER=rhdf_app
DB_PASSWORD=REEMPLAZA_CON_TU_CONTRASENA
```

El archivo `.env` está excluido por `.gitignore` para evitar publicar credenciales.

## Iniciar la aplicación

Para el desarrollo, ejecuta:

```bash
npm run dev
```

Para iniciar el servidor sin reinicio automático:

```bash
npm start
```

La aplicación estará disponible temporalmente en:

```text
http://127.0.0.1:3000
```

La conexión con la base de datos se puede comprobar en:

```text
http://127.0.0.1:3000/api/health
```

La respuesta esperada contiene los valores `"status": "ok"` y `"database": "connected"`.

## Despliegue seguro con Apache

Para el despliegue local, Apache recibe las solicitudes HTTPS y las envía al
servidor Express que escucha de forma local en `127.0.0.1:3000`. Mantén Express
activo en una terminal:

```bash
npm run dev
```

### Configurar el dominio local

Agrega el dominio local al archivo `/etc/hosts`:

```bash
sudo sh -c 'grep -qxF "127.0.0.1 segurosrhdf.local" /etc/hosts || echo "127.0.0.1 segurosrhdf.local" >> /etc/hosts'
```

Comprueba que el nombre resuelva a la máquina local:

```bash
getent hosts segurosrhdf.local
```

### Habilitar módulos de Apache

Habilita los módulos necesarios para TLS, encabezados HTTP y proxy inverso:

```bash
sudo a2enmod ssl rewrite headers proxy proxy_http
sudo systemctl restart apache2
```

Para evitar advertencias al validar Apache, crea
`/etc/apache2/conf-available/server-name.conf` con el siguiente contenido:

```apache
ServerName localhost
```

Activa la configuración:

```bash
sudo a2enconf server-name
```

### Generar un certificado autofirmado

Genera un certificado local válido por 365 días para `segurosrhdf.local`:

```bash
sudo mkdir -p /etc/apache2/ssl

sudo openssl req -x509 -nodes -newkey rsa:2048 \
  -keyout /etc/apache2/ssl/segurosrhdf.local.key \
  -out /etc/apache2/ssl/segurosrhdf.local.crt \
  -days 365 \
  -subj "/C=MX/ST=Guanajuato/L=Guanajuato/O=RHDF/OU=Academico/CN=segurosrhdf.local"
```

Como se trata de un certificado autofirmado, el navegador mostrará una
advertencia la primera vez que se visite el sitio, pero es algo normal. En este entorno local se debe aceptar la excepción de seguridad antes de continuar.

### Configurar los Virtual Hosts

Crea el archivo `/etc/apache2/sites-available/segurosrhdf.conf` con el siguiente
contenido:

```apache
<VirtualHost *:80>
    ServerName segurosrhdf.local

    Redirect permanent / https://segurosrhdf.local/
</VirtualHost>

<VirtualHost *:443>
    ServerName segurosrhdf.local

    SSLEngine on
    SSLCertificateFile /etc/apache2/ssl/segurosrhdf.local.crt
    SSLCertificateKeyFile /etc/apache2/ssl/segurosrhdf.local.key

    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1

    ProxyRequests Off
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/

    Header always set Content-Security-Policy "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; upgrade-insecure-requests"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"

    ErrorLog ${APACHE_LOG_DIR}/segurosrhdf-error.log
    CustomLog ${APACHE_LOG_DIR}/segurosrhdf-access.log combined
</VirtualHost>
```

El Virtual Host del puerto `80` obliga el uso de HTTPS. El Virtual Host del
puerto `443` configura TLS, aplica encabezados de seguridad y reenvía las
solicitudes hacia Express.

Activa el sitio, valida la sintaxis y recarga Apache:

```bash
sudo a2ensite segurosrhdf.conf
sudo a2dissite 000-default.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

El resultado esperado de `sudo apache2ctl configtest` es:

```text
Syntax OK
```

### Verificar HTTPS y encabezados

La aplicación queda disponible en:

```text
https://segurosrhdf.local
```

Comprueba que HTTP redirige a HTTPS:

```bash
curl -I http://segurosrhdf.local
```

Comprueba el certificado local y los encabezados HTTP:

```bash
curl -k -I https://segurosrhdf.local
```

La respuesta HTTPS debe incluir `content-security-policy`,
`strict-transport-security`, `x-content-type-options`, `x-frame-options` y
`referrer-policy`.

## Datos de práctica

La apliación de seguros RHDF es parte del Reto 3 de la Unidad 2 de la UVEG. Para las pruebas se deben usar aseguradoras, personas y números de póliza ficticios. No se deben registrar datos personales reales ni información confidencial.

## Estructura principal

```text
public/                 Interfaz web y documentos legales
sql/init.sql            Tablas, relación, restricciones e índices de PostgreSQL
src/db.js               Configuración del pool de conexiones de PostgreSQL
src/routes/             Rutas de la API
.env.example            Plantilla de configuración sin credenciales
server.js               Inicio del servidor Express
```
