# superheroes — Activity 10

Actualización del CRUD de Activity 8 con **fotografías locales, borrado lógico y papelera con restauración**. Utiliza JavaScript, Node.js, Express, Sequelize, EJS y MySQL, siguiendo el stack de PrintBox.

- [Proyecto actualizado en GitHub](https://github.com/LeonardoH369/superheroes/tree/codex/activity-10-entrega)
- [Reporte editable con portada y capturas](docs/Activity_10_Leonardo_Hinojosa_Castro.docx)
- [Capturas de vistas y consultas reales de MySQL](docs/capturas-activity10)
- [Verificación de la entrega](docs/ACTIVITY10_VERIFICACION.md)

## Funcionalidades nuevas

1. El alta recibe una fotografía desde la computadora mediante un formulario multipart. Ya no admite URLs externas ni rutas proporcionadas por el usuario.
2. El archivo se valida como JPEG, PNG o WebP real, de hasta 5 MB y 16 megapíxeles. Se normaliza a JPEG, con orientación corregida y un máximo de 1600 px por lado. Se genera un nombre UUID y se guarda en `storage/photos`. El nombre original no determina su ruta.
3. La columna `photo_path` almacena una ruta como `/storage/photos/UUID.jpg`, sin dominio ni ruta absoluta de la computadora.
4. En edición, no elegir archivo conserva la imagen actual; elegir otro guarda una imagen nueva y conserva la anterior en el disco.
5. El listado muestra solo registros activos. La baja asigna `deleted_at`, sin eliminar la fila ni su imagen.
6. La papelera muestra las fichas retiradas y permite restaurarlas mediante confirmación y POST protegido con CSRF. La restauración conserva el identificador y la fotografía, y establece `deleted_at = NULL`.

No hay eliminación definitiva ni limpieza automática de imágenes. Conservar todos los archivos también aplica a los reemplazos. Las fotos de fichas retiradas siguen disponibles localmente; esta aplicación académica no implementa privacidad por usuario.

## Instalación nueva

Requisitos: Node.js 22.13 o superior y MySQL 8.0.16 o superior. Verificado con Node.js 24.19.0 y MySQL Community Server 8.4.9.

```powershell
npm ci
Copy-Item .env.example .env
# Configurar la conexión a una base de desarrollo en .env.
npm run db:create
npm run db:migrate
npm run db:seed
npm start
```

Abrir http://localhost:3002. No ejecutar db:create si la base ya existe. El servidor escucha en 127.0.0.1 y está destinado al uso académico local, sin autenticación.

Las semillas iniciales crean **12 registros: 10 activos y 2 con baja lógica**. Son personajes ficticios con ilustraciones locales. El recorrido de la entrega agrega una ficha desde el formulario y termina con 13 registros: 11 activos y 2 eliminados lógicamente. La captura intermedia muestra 10 activos y 3 eliminados antes de restaurarla.

## Actualización desde Activity 8

Usar la rama codex/activity-10-entrega y conservar una copia de la base y de las imágenes antes de migrar datos propios. Luego ejecutar npm ci, npm run db:migrate y npm run db:seed con la conexión configurada.

La migración incremental `20261024000100-local-photos.js` renombra photo_url a photo_path. Mantiene deleted_at, que ya existía en Activity 8, y lo agrega solo si falta. Convierte las imágenes de demostración de public/images a JPEG dentro de storage/photos y actualiza las rutas de **todas** las filas, incluidas las retiradas.

Las URLs desconocidas de registros anteriores se sustituyen por la ilustración local Aurora; no se descargan archivos externos. Para conservar una foto personalizada debe cargarse su archivo desde la edición. La migración inversa conserva los archivos y renombra la columna; no reconstruye las URLs antiguas. No deshace las bajas previas.

El seeder adicional respeta los alias existentes y agrega los ejemplos que faltan. SequelizeMeta y SequelizeData registran las migraciones y semillas. No se usa sync con force. La nueva semilla no ofrece un borrado físico inverso automático.

## Almacenamiento

`storage/photos` se crea automáticamente; Express lo sirve en /storage/photos. Solo contiene JPEG generados por la aplicación o las semillas. Las imágenes se decodifican antes de guardarse. No se guardan archivos si falla CSRF o la validación de los campos. Un fallo posterior de la base podría dejar un archivo sin referencia, que se conserva conforme a esta actividad.

Los archivos cargados, .env, node_modules y las bases locales se excluyen de Git. Las ilustraciones fuente sí se incluyen en public/images para que las semillas puedan regenerar las fotos de ejemplo. Si se mueve una instalación con fotos propias, debe copiarse también storage/photos; clonar Git no recupera los archivos privados de esa instalación.

## Rutas y organización

| Método | Ruta | Función |
| --- | --- | --- |
| GET | /superheroes | Listado activo |
| GET | /superheroes/create | Formulario de alta |
| POST | /superheroes | Registrar con foto local |
| GET | /superheroes/trash | Papelera |
| GET | /superheroes/:id | Ficha activa |
| GET | /superheroes/:id/edit | Formulario de edición |
| POST | /superheroes/:id/update | Guardar datos y foto opcional |
| GET | /superheroes/:id/delete | Confirmar baja |
| POST | /superheroes/:id/delete | Baja lógica |
| GET | /superheroes/:id/restore | Confirmar restauración |
| POST | /superheroes/:id/restore | Recuperar ficha |

src/models/Superhero.js define paranoid: true. SuperheroController separa las consultas activas de la papelera con paranoid: false y deletedAt no nulo. src/storage.js procesa imágenes; src/middleware/upload.js recibe un solo archivo con límites; src/views/superheroes contiene las siete vistas principales. src/middleware/forms.js valida CSRF en todas las escrituras, después de analizar el cuerpo del formulario.

## Pruebas y consulta de la base

```powershell
# Configurar también host, puerto y credenciales para la instancia de pruebas.
$env:DB_NAME = 'superheroes_test'
npm run db:create # Solo si la base de pruebas aún no existe.
npm run db:migrate
npm run db:seed
npm test
Remove-Item Env:DB_NAME

# Con la base de desarrollo configurada:
npm run db:inspect
```

Las 10 pruebas de tests/storage.test.js usan exclusivamente superheroes_test, crean fotos en un directorio temporal propio y limpian solo sus datos al finalizar. Comprueban alta, edición, foto opcional, reemplazo sin borrado, contenido inválido, límite de tamaño, alias únicos, CSRF, baja y restauración. La salida ejecutada se conserva en docs/capturas-activity10/pruebas.txt.

db:inspect es de solo lectura y muestra registros activos y retirados, sus rutas y el esquema. Las capturas de la base presentan resultados reales consultados directamente a MySQL mediante un visor temporal de evidencia; ese visor no forma parte de la aplicación ni equivale a una captura de phpMyAdmin.

Los documentos y capturas de Activity 8 se conservan como antecedentes. El reporte vigente de esta actividad es Activity_10_Leonardo_Hinojosa_Castro.docx.

## Referencias

- [Multer y formularios multipart](https://expressjs.com/en/resources/middleware/multer/)
- [Sharp y validación de imágenes](https://sharp.pixelplumbing.com/api-constructor/)
- [Sequelize y borrado lógico](https://sequelize.org/docs/v6/core-concepts/paranoid/)

La implementación adapta la actividad al stack de PrintBox solicitado para esta entrega; no utiliza Laravel 7.

## Estado de dependencias

Se aplicó la actualización compatible de body-parser detectada por npm audit. Permanecen dos avisos moderados asociados a uuid y Sequelize 6; la corrección automática propuesta requiere cambiar de versión mayor del ORM y no se aplicó. El proyecto conserva su alcance académico local.
