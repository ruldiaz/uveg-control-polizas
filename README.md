# UVEG - Reto 2 Unidad 1 
# Raúl Humberto Díaz Fernández
# RHDF - Sistema para control de seguros


Aplicación web estática para registrar y consultar información básica de pólizas de seguro.


## Funcionalidades


- Registro del número de póliza.
- Captura de la aseguradora y de los asegurados.
- Selección del tipo de seguro.
- Registro de la fecha de vencimiento y de la suma asegurada.
- Visualización y eliminación de las pólizas.
- Conservación de los registros en el navegador usando `localStorage`.


## Tecnologías utilizadas


- HTML5
- CSS3
- JavaScript
- SVG para las imágenes


## Organización del proyecto


```text
css/    # Estilos de la aplicación
js/     # Lógica de la aplicación
img/    # Imágenes SVG
dist/   # Versión optimizada para despliegue

Optimización y empaquetado

Las imágenes están en formato SVG para conservar buena calidad con un peso bajo. Los archivos CSS y JavaScript se minificaron y se guardaron en la carpeta dist/, junto con el archivo index.html preparado para cargar los recursos ya optimizados.

La carpeta dist/ se comprimió en el archivo control-polizas.zip, listo para transferirse y desplegarse en un servidor web.

# Proceso para subir archivos a Github

git init
git status
git branch -m master main

Se configuraron el usuario y correo con:
git config --global user.name "Raul Diaz"
git config --global user.email "24001729@es.uveg.edu.mx"

git add index.html css/ js/ img/
git commit -m "feat: crear sistema de control de polizas"

git add dist/ control-polizas.zip
git commit -m "build: agregar recursos optimizados y paquete de despliegue"

git add README.md
git commit -m "docs: documentar optimizacion y empaquetado"

git add .gitignore package-lock.json package.json
git commit -m "feat: archivo .gitignore y package json"

git remote add origin https://github.com/ruldiaz/uveg-control-polizas.git

git push -u origin main

Derivado de unos problemas para autenticación en github, se instaló gh con:
sudo apt install gh

gh auth login
Se hizo a través del navegador la autenticación

git push -u origin main
