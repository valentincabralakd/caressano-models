# Caressano Models — corrección de persistencia

## Qué se corrigió

- `caressanoDemo` y las demás secciones usan memoria e IndexedDB, sin escribir fotografías en localStorage. Se leen los valores anteriores para compatibilidad; no se borra el localStorage existente.
- Los guardados se ordenan y la publicación espera el guardado local. Un fallo de IndexedDB se informa y el valor permanece en memoria para exportar un backup.
- La web espera la consulta de Supabase antes de renderizar los ajustes. La consulta tiene un límite de 12 segundos; si falla, usa el respaldo local. Una visita sin conexión puede mostrar la última copia guardada.
- Se conserva el único indicador de carga original. No se cambiaron CSS, textos ni colores de Models ni los archivos de imágenes existentes.
- Las nuevas fotografías conservan el archivo original en una URL de datos: no se redimensionan ni se convierten a JPEG.
- Se desactivaron migraciones automáticas que recortaban contenido existente.
- El backup incluye también la portada guardada por separado en IndexedDB.
- Supabase debe devolver una fila actualizada para confirmar PUBLICADO. Una lectura vacía no publica automáticamente datos locales. Las publicaciones se procesan en orden.

## Alcance y datos

Este proyecto usa la fila `main` de `caressano_site` para guardar el JSON completo, incluidas fotografías. No contiene un flujo de Supabase Storage ni un bucket configurado. Esta entrega conserva ese contrato para evitar una migración de datos. Los originales ocupan más espacio; los límites de IndexedDB y del servidor siguen existiendo y no son infinitos.

No se ejecutaron escrituras, cambios de permisos, SQL ni despliegues contra servicios reales. No se incluyen credenciales privadas nuevas. La clave pública incluida ya estaba en el proyecto; los permisos efectivos dependen de las políticas de Supabase.

## GitHub

1. Conservá una copia del ZIP anterior y exportá un backup del panel actual si es posible. No borres datos del navegador ni de Supabase.
2. Creá una rama, por ejemplo `fix/persistencia-fotos`.
3. Descomprimí esta carpeta. Subí su contenido a la misma ubicación que tiene el sitio en el repositorio, con `index.html`, `app.js` y `admin.js` al mismo nivel. Evitá agregar otra carpeta envolvente.
4. Revisá el cambio y abrí un pull request. Los cambios de código son `app.js`, `admin.js` y la versión de sus referencias en los HTML; también se agregan estas instrucciones, pruebas.

## Vercel

1. Usá el proyecto existente y verificá que Root Directory apunte a la carpeta que contiene `index.html`. Es un sitio estático, sin proceso de compilación nuevo.
2. Generá un Preview desde la rama y comprobá navegación, Models, perfiles, colores y el único indicador de carga.
3. **El Preview conserva la misma URL de Supabase que producción. Guardar desde su admin publica en esa misma base.** Para probar guardados reales sin modificar producción, usá una copia de Supabase con datos de prueba y reemplazá URL y clave pública en ambos JS solamente en una rama de pruebas. No apuntes un panel de prueba al backend real.
4. En ese entorno aislado, cargá varias fotos grandes, guardá, verificá PUBLICADO, recargá el panel y abrí el sitio desde otro navegador. Compará fotos, portada, textos y colores. Exportá e importá un backup de prueba.
5. Simulá falta de conexión y un rechazo de permisos. Debe informarse el error de publicación; no debe mostrarse PUBLICADO. Con la red restaurada, volvé a guardar.
6. Después de revisar el Preview y con autorización del responsable, fusioná y desplegá a producción. Esta entrega no realiza esos pasos. Para volver atrás, usá el despliegue anterior; no elimines la fila ni el almacenamiento del navegador.

## Pruebas incluidas

Desde esta carpeta, con Node.js instalado:

```
node --check admin.js
node --check app.js
node tests/storage.cjs
node tests/supabase.cjs
```

Se verificaron con dobles de almacenamiento y red: localStorage que rechaza escrituras, JSON superior a 14 MB, conservación exacta de fotos, lectura heredada, eliminaciones persistentes explícitas, orden de guardado, fallo de disco, descarga remota grande, portada, textos/colores, error de red, fila vacía y confirmación de actualización de Supabase.

Las pruebas son locales y simuladas. No se validaron sesión real, políticas RLS, límites reales del servidor ni apariencia en un navegador. Esas verificaciones quedan para el Preview con backend aislado antes de publicar.

