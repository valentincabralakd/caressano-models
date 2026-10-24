# Caressano — Storage V2, 22/10/2026

**REQUIERE CONFIGURAR SUPABASE STORAGE. SUBIR SOLO EL ZIP NO COMPLETA LA SOLUCIÓN.**

La consola mostró HTTP 500 y PostgreSQL `57014` (`statement timeout`). El código anterior enviaba todas las fotos dentro de un JSON en cada guardado. Ahora sube archivos originales a Storage y después publica un JSON pequeño con enlaces. El tamaño es un problema observado; la captura no descarta otras causas del timeout, como bloqueos o políticas de la base.

## Instalación, en orden

1. En el panel actual, descargá un backup ANTES de recargar. Guardá el ZIP anterior. No borres datos del navegador ni de Supabase.
2. Cerrá las pestañas públicas del sitio para que no sigan ejecutando la versión anterior. Conservá el backup.
3. Primero en un Supabase aislado de prueba, abrí SQL Editor. Revisá `CONFIGURAR_STORAGE.sql`, ya preparado para `valentincabralakd@gmail.com`, y ejecutalo. La cuenta debe existir en Authentication. No se necesita contraseña ni clave secreta dentro del código.
4. El script crea el bucket público `caressano-media` y una lista de administradores autorizados para insertar archivos. No modifica `caressano_site`, no elimina datos, no permite cargas anónimas ni habilita borrar o sobrescribir objetos.
5. En una rama de prueba, cambiá URL y clave pública de Supabase en AMBOS JS para usar el proyecto aislado. Probá carga, guardado y lectura. Un Preview de Vercel comparte producción si conserva sus referencias.
6. Con revisión y autorización, aplicá la misma configuración al Supabase real con el correo correcto. Este paso es necesario para publicar desde el sitio real.
7. El ZIP nuevo tiene los archivos directamente en la raíz. Descomprimilo y subí TODO SU CONTENIDO a la raíz del repositorio, reemplazando los archivos del sitio. Deben quedar juntos `admin.html`, `admin.js`, `media-upload.js`, `app.js` e `index.html`. No subas una carpeta contenedora.
8. Confirmar en main puede desplegar automáticamente a producción. Primero revisá el Preview; al autorizar producción, esperá el despliegue completo de Vercel.
9. En el MISMO navegador donde cargaste las fotos, abrí `admin.html` y recargá con Ctrl+Shift+R. La primera actualización protege los datos locales con fotos incrustadas. Si hay cambios pendientes, el inicio de sesión no los reemplaza por la versión remota.
10. Iniciá sesión y presioná PUBLICAR PENDIENTES. La primera vez sube las fotos una a una y puede tardar. Esperá PUBLICADO sin pulsar repetidamente.
11. Abrí el sitio desde otro navegador: comprobá fotos, galerías, portada, textos y colores. Reabrí el panel y comprobá persistencia.

Si falla, el aviso incluye el error concreto. No se muestra PUBLICADO hasta que Supabase confirma la fila main. Conservá el backup y el aviso; no borres fotos ni importes backups a ciegas.

## Cambios

- Fotos originales sin recompresión, reducción ni recorte al subir. Se mantienen los encuadres de los modelos.
- CSS, imágenes existentes, textos y colores del proyecto sin cambios. Se mantiene el único indicador de carga original.
- IndexedDB conserva los originales locales para el backup. La caché pública usa otra base para no pisar borradores del admin.
- Se reutilizan fotos por su contenido y las subidas confirmadas al reintentar. No se borran archivos automáticamente.
- Si falla una foto, no se envía el JSON. Si falla el JSON, se mantienen los archivos ya subidos y los cambios pendientes.
- La confirmación del PATCH devuelve solo id, evitando devolver el JSON completo con imágenes.
- Los archivos del bucket son públicos: no se debe utilizar para material confidencial. Se fijan 50 MB por archivo, sujetos a los límites del proyecto.

## Validación

Con Node.js, desde la carpeta descomprimida:

```
node --check admin.js
node --check app.js
node --check media-upload.js
node tests/storage.cjs
node tests/supabase.cjs
node tests/media.cjs
```

Pasaron pruebas locales de cuota, datos superiores a 14 MB, orden de escritura y fallo de disco. Una integración HTTP con servidor local verifica: foto de 7 MB byte por byte, duplicados, reintentos, JSON inferior a 2 KB, originales sin cambios, encuadre y textos/colores, rechazo de Storage sin publicar, timeout con recuperación pendiente, confirmación y lectura de enlaces.

**No se probaron las políticas SQL en Supabase real ni un guardado autenticado en producción.** El servidor local no sustituye esa validación. La entrega está preparada para instalar; falta configurar y comprobar el servicio real.

Referencias oficiales: [permisos de Storage](https://supabase.com/docs/guides/storage/security/access-control) y [subidas estándar](https://supabase.com/docs/guides/storage/uploads/standard-uploads).

