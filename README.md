# RHDF - Sistema para control de seguros

Esta es una aplicación web estática para registrar y consultar la información básica de pólizas de seguro. El proyecto corresponde al Reto 2 de la Unidad 1 de la materia *Despliegue de aplicaciones web y móviles* de la Universidad Virtual del Estado de Guanajuato.

Alumno: Raúl Humberto Díaz Fernández
Asesor: Jenny Betsabé Vázquez Aguirre

## Funcionalidades de la aplicación

- Registro del número de póliza.
- Captura de la aseguradora y de las personas aseguradas.
- Selección del tipo de seguro.
- Registro de la fecha de vencimiento y de la suma asegurada.
- Visualización y eliminación de pólizas.
- Conservación de los registros en el navegador mediante `localStorage`.

## Tecnologías utilizadas en la aplicación

- HTML5 para la estructura de la aplicación.
- CSS3 para el diseño y la adaptación a distintos tamaños de pantalla.
- JavaScript para el registro y la administración de pólizas.
- SVG para imágenes representativas de los diferentes tipos de seguro.
- Git y GitHub para el control de versiones.
- Apache HTTP Server para el despliegue local.

## Organización del proyecto

```text
.
├── css/                    # Estilos de la aplicación
├── js/                     # Archivos javascript de la aplicación
├── img/                    # Imágenes SVG
├── dist/                   # Versión optimizada para despliegues
├── index.html              # Página principal
├── control-polizas.zip     # Paquete comprimido en ZIP listo para subir al servidor
├── package.json            # Dependencias de optimización
└── README.md               # Documentación técnica
```

## Optimización y empaquetado

Las imágenes se almacenaron en formato SVG porque mantienen su calidad al cambiar de tamaño y mantienen un peso reducido. Para la optimización se utilizaron SVGO, clean-css-cli y Terser:

```bash
npm init -y
npm install --save-dev svgo clean-css-cli terser
```

Después, se generó la versión optimizada en la carpeta `dist/`:

```bash
mkdir -p dist/css dist/js dist/img
npx svgo -f img -o dist/img
npx cleancss -O2 -o dist/css/styles.min.css css/styles.css
npx terser js/app.js --compress --mangle -o dist/js/app.min.js
cp index.html dist/index.html
sed -i 's|css/styles.css|css/styles.min.css|; s|js/app.js|js/app.min.js|' dist/index.html
```

La carpeta `dist/` contiene el archivo `index.html` y los recursos minificados `styles.min.css` y `app.min.js`. Finalmente, se generó el paquete comprimido listo para transferirse al servidor:

```bash
zip -r control-polizas.zip dist/
```

El contenido del paquete se puede verificar con el comando:

```bash
unzip -l control-polizas.zip
```

## Versionamiento

La URL del repositorio es:

<https://github.com/ruldiaz/uveg-control-polizas>

Se emplearon commits descriptivos para distinguir las etapas del proyecto:

```text
feat: crear sistema de control de polizas
build: agregar recursos optimizados y paquete de despliegue
docs: documentar optimizacion y empaquetado
feat: archivo .gitignore y package json
```

Para inicializar el repositorio local, vincularlo con GitHub y publicar los cambios se ejecutaron los siguientes comandos:

```bash
git init
git branch -M main
git add .
git commit -m "feat: crear sistema de control de polizas"
git remote add origin https://github.com/ruldiaz/uveg-control-polizas.git
git push -u origin main
```

La autenticación con GitHub se realizó usando GitHub CLI:

```bash
sudo apt install gh
gh auth login
```

## Despliegue con Apache en Linux Mint

La aplicación se desplegó usando Apache HTTP Server en Linux Mint y quedó disponible en:

<http://localhost/segurosrhdf>

Primero se instaló y se activó Apache:

```bash
sudo apt update
sudo apt install apache2
sudo systemctl enable --now apache2
```

La versión optimizada se copió al directorio público del servidor:

```bash
sudo mkdir -p /var/www/control-polizas
sudo cp -r dist/. /var/www/control-polizas/
sudo chown -R www-data:www-data /var/www/control-polizas
sudo find /var/www/control-polizas -type d -exec chmod 755 {} \;
sudo find /var/www/control-polizas -type f -exec chmod 644 {} \;
```

Apache escucha en el puerto `80`, configurado mediante la directiva `Listen 80` en `/etc/apache2/ports.conf`. Se creó el archivo `/etc/apache2/sites-available/control-polizas.conf` con el siguiente Virtual Host:

```apache
<VirtualHost *:80>
    ServerName localhost

    Alias /segurosrhdf /var/www/control-polizas

    <Directory /var/www/control-polizas>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
        DirectoryIndex index.html
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/control-polizas-error.log
    CustomLog ${APACHE_LOG_DIR}/control-polizas-access.log combined
</VirtualHost>
```

La directiva `Alias` relaciona la ruta web `/segurosrhdf` con el directorio físico `/var/www/control-polizas`. El bloque `<Directory>` permite a Apache servir los archivos de la aplicación y define `index.html` como la página inicial.

Por último, se habilitó el sitio, se validó la sintaxis y se recargó Apache:

```bash
sudo a2ensite control-polizas.conf
sudo a2dissite 000-default.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

El resultado esperado del comando `sudo apache2ctl configtest` es `Syntax OK`.
