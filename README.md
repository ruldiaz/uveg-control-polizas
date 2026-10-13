# RHDF - Sistema para control de seguros
# Reto 3 Unidad 2 UVEG
# Alumno: Raúl Humberto Díaz Fernández
# Asesor: Jenny Betsabé Vázquez Aguirre

Seguros RHDF es una aplicación web para registrar, consultar y eliminar información básica
de pólizas de seguro. El proyecto utiliza Express.js y PostgreSQL, y se despliega
en un entorno local seguro mediante Apache HTTP Server, HTTPS y un dominio
simulado.

> Para este proyecto y para sus pruebas se deben utilizar datos
> ficticios y no información personal o confidencial real.

## Funcionalidades

- Registro de número de póliza, aseguradora, persona asegurada, tipo de seguro,
  fecha de vencimiento y suma asegurada.
- Consulta de las aseguradoras registradas en PostgreSQL.
- Visualización de pólizas ordenadas por fecha de vencimiento.
- Eliminación individual de pólizas.
- Validación de los datos recibidos por la API.
- Aviso de Privacidad y Términos y Condiciones accesibles desde el footer.

## Arquitectura y tecnologías

| Componente | Tecnología | Propósito |
|---|---|---|
| Interfaz | HTML5, CSS3 y JavaScript | Captura y presentación de información. |
| Backend | Node.js y Express.js | API y servidor de la aplicación. |
| Base de datos | PostgreSQL | Persistencia de aseguradoras y pólizas. |
| Validación | express-validator | Validación de los datos enviados a la API. |
| Seguridad del backend | Helmet y dotenv | Encabezados HTTP y configuración mediante variables de entorno. |
| Proxy y HTTPS | Apache HTTP Server | Dominio local, TLS, encabezados y proxy inverso. |
| Control de versiones | Git y GitHub | Historial de cambios y repositorio remoto. |

## Estructura del proyecto

```text
.
├── public/
│   ├── css/                    # Estilos de la interfaz
│   ├── img/                    # Ilustraciones SVG
│   ├── js/                     # Lógica del navegador y consumo de la API
│   ├── aviso-privacidad.html   # Documento de privacidad
│   ├── index.html              # Página principal
│   └── terminos-condiciones.html
├── sql/
│   └── init.sql                # Tablas, relación, restricciones e índices
├── src/
│   ├── routes/                 # Rutas de aseguradoras y pólizas
│   ├── app.js                  # Configuración de Express
│   └── db.js                   # Pool de conexiones de PostgreSQL
├── .env.example                # Plantilla sin credenciales
├── INSTALL.md                  # Guía completa de instalación y despliegue
├── package.json                # Dependencias y scripts npm
└── server.js                   # Inicio del servidor
```

## API

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/health` | Comprueba la conexión entre Express y PostgreSQL. |
| `GET` | `/api/aseguradoras` | Devuelve el catálogo de aseguradoras. |
| `GET` | `/api/polizas` | Devuelve las pólizas registradas. |
| `POST` | `/api/polizas` | Registra una póliza validada. |
| `DELETE` | `/api/polizas/:id` | Elimina una póliza por identificador. |

Las consultas a PostgreSQL se realizan con parámetros para evitar inyecciones
SQL. La base de datos establece restricciones de unicidad, llaves foráneas,
validación de suma asegurada e índices para campos de consulta frecuentes.

## Instalación y ejecución

Consulta [INSTALL.md](INSTALL.md) para obtener las versiones requeridas y los
pasos completos de instalación de dependencias, PostgreSQL, variables de entorno,
Apache, HTTPS y encabezados de seguridad.

Después de configurar `.env`, inicia el servidor de desarrollo:

```bash
npm install
npm run dev
```

La aplicación estará disponible temporalmente en:

```text
http://127.0.0.1:3000
```

## Despliegue local seguro

La URL final de despliegue es:

```text
https://segurosrhdf.local
```

Apache recibe las solicitudes en los puertos `80` y `443`. El puerto `80`
redirige de forma permanente a HTTPS; el puerto `443` utiliza un certificado
autofirmado local, aplica encabezados de seguridad y funciona como proxy inverso
hacia Express en `127.0.0.1:3000`.

Los encabezados configurados incluyen:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`

El certificado es autofirmado, por lo que el navegador puede solicitar aceptar
una excepción de seguridad la primera vez que se ingrese al dominio local.

## Pruebas

La aplicación se probó funcionalmente en Mozilla Firefox y Google Chrome. En
ambos navegadores se verificaron el acceso por HTTPS, la carga de aseguradoras,
el registro, la consulta y la eliminación de pólizas, así como los enlaces a los
documentos legales.

También se ejecutó Lighthouse en Google Chrome para evaluar rendimiento,
accesibilidad, buenas prácticas y SEO.

## Versionamiento

El repositorio remoto se encuentra en:

<https://github.com/ruldiaz/uveg-control-polizas>

El proyecto utiliza commits descriptivos para identificar cambios de aplicación,
base de datos, seguridad, documentación y pruebas. El historial local se consulta
con:

```bash
git log --oneline
```
