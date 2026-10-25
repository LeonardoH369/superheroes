# Verificación Activity 10

Fecha local: 25 de octubre de 2026.

- Node.js 24.19.0, MySQL Community Server 8.4.9 y Chrome.
- Instancia de MySQL aislada en 127.0.0.1:33317, sin cambios en servicios existentes.
- Migraciones y semillas verificadas sobre una base nueva superheroes_activity10 y sobre superheroes_test, que conservaba el esquema y datos anteriores de Activity 8.
- 10 pruebas aprobadas, 0 fallidas, 0 omitidas; salida en capturas-activity10/pruebas.txt.
- Formularios reales de alta, consulta, edición, reemplazo de foto, baja y restauración recorridos desde Chrome.
- Capturas de todas las vistas principales y de la validación y error no encontrado.
- Consultas MySQL verificadas: antes de restaurar 13 filas, 10 activas, 3 retiradas; después 13 filas, 11 activas, 2 retiradas.
- Todas las filas de la demostración guardan rutas /storage/photos/ en photo_path.
- Cinco archivos JPEG conservados. Se verificó la existencia de la foto anterior al reemplazo y la huella SHA256 de la foto actual antes de dar de baja y después de restaurar, sin cambios.
- No se observaron errores JavaScript durante el recorrido.
- Datos y personajes ficticios; las imágenes son ilustraciones de demostración.
- No se realizó un despliegue público ni se verificó MariaDB en esta ejecución.
- Auditoría de dependencias: corregido el aviso alto de body-parser mediante actualización compatible; permanecen dos avisos moderados de uuid/Sequelize, descritos en README.
