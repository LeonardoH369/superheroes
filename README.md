# superheroes — Activity 8

CRUD de superhéroes: nombre real, alias, URL de fotografía e información adicional. Incluye listado, alta, ficha completa, edición y confirmación de baja.

Proyecto independiente con **Express + Sequelize + EJS + MySQL/MariaDB**, conforme a la adaptación de framework autorizada por el docente. Express sustituye el controlador y las rutas de Laravel, EJS proporciona las vistas y Sequelize los modelos y migraciones. No utiliza Laravel 7 ni Artisan.

Repositorio: https://github.com/LeonardoH369/superheroes

[Reporte editable en Google Docs](https://docs.google.com/document/d/1icmADCPNSG8SJPOL-5mWxd5D0H4VR0Q7lrXD0Y9wqEQ/edit)

## Instalación

Requisitos: Node.js 22.13 o superior y MySQL 8.0.16+ o MariaDB 10.4+. Probado con Node.js 24.19 y MariaDB 10.4.32.

```powershell
npm ci
Copy-Item .env.example .env
# Configurar DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASSWORD en .env.
# Iniciar el servicio MySQL/MariaDB.
npm run db:create
npm run db:migrate
npm run db:seed
npm start
```

Abrir http://localhost:3002. No ejecutar `db:create` si la base ya existe. Las migraciones y semillas se registran en SequelizeMeta y SequelizeData; `db:seed` no vuelve a ejecutar las semillas ya registradas. No se usa sync con force. `.env` y `node_modules` se excluyen de Git. El ejemplo de conexión usa puerto de BD 3306; la validación local se realizó en una instancia aislada con puerto 3307.

## Estructura MVC

`src/models/Superhero.js`: modelo. `src/controllers/SuperheroController.js`: acciones index, create, store, show, edit, update, confirmDelete y destroy.

`src/views/` contiene las vistas EJS; `src/routes/web.js`, las rutas; `src/migrations/`, el esquema; `src/seeders/`, los ejemplos; `public/`, los estilos y recursos. El servidor escucha exclusivamente en 127.0.0.1: aplicación local de uso académico sin autenticación.

## Rutas

GET `/superheroes`, `/superheroes/create`, `/superheroes/:id`, `/superheroes/:id/edit` y `/superheroes/:id/delete`. POST `/superheroes`, `/superheroes/:id/update` y `/superheroes/:id/delete`.

Se usan formularios HTML con POST para escrituras y redirección 303 tras guardar. Abrir la confirmación de eliminación con GET no cambia la base. Los formularios incluyen token CSRF firmado y cookie HttpOnly/SameSite. EJS escapa el contenido mostrado, se validan los datos en el servidor y se usan operaciones del ORM sin concatenar SQL con entradas del usuario.

## Reglas de datos

Los alias son únicos, incluso después de una baja lógica. La foto se guarda como URL HTTP/HTTPS; los ejemplos usan ilustraciones ficticias incluidas en `public/images`, servidas por el puerto 3002. Si se cambia el puerto, deben actualizarse esas URLs. Una URL externa debe permitir su visualización desde el navegador.

Las eliminaciones son bajas lógicas mediante `deleted_at`. Los registros retirados dejan de aparecer en las consultas normales; el modelo permite recuperarlos mediante `restore()` en una operación administrativa de desarrollo. No se incluye interfaz de papelera.

## Pruebas

```powershell
$env:DB_NAME = 'superheroes_test'
npm run db:create
npm run db:migrate
npm run db:seed
npm test
Remove-Item Env:DB_NAME
```

`npm test` solo permite las bases `superheroes_test` o `grades_test`; configurar la conexión con un nombre propio de este proyecto. 5 pruebas aprobadas. Se verifican lecturas y escrituras reales, errores de validación, referencias, bajas, escape HTML y protección CSRF. Las pruebas crean y limpian sus propios registros de ejemplo; ejecutarlas sobre una base de pruebas migrada y sembrada.

## Evidencias

Capturas originales en [docs/screenshots](docs/screenshots). En `docs/screenshots/report` hay recortes de las mismas capturas para mejorar la lectura en el reporte, sin modificar datos ni controles. Los registros utilizados para demostrar las operaciones son ficticios.

## Referencias

- https://expressjs.com/en/guide/routing/
- https://sequelize.org/docs/v6/core-concepts/model-querying-basics/
- https://sequelize.org/docs/v6/core-concepts/paranoid/
- https://ejs.co/
