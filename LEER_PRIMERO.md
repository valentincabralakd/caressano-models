# Caressano Models — versión final 07/11/2026

## Antes de subir
Descargá un backup desde el panel actual y conservá la versión anterior del proyecto. No borres datos del navegador, fotografías ni tablas de Supabase.
Este ZIP contiene los archivos reales del sitio. No incluye el servidor local de prueba ni el acceso simulado del panel. El administrador publicado mantiene su inicio de sesión normal.
Las fotografías y el contenido cargados desde el panel siguen en tu navegador y Supabase; no están exportados dentro de este ZIP. Conservá también tu backup del contenido.

## GitHub: dónde van los archivos
1. Descomprimí el ZIP.
2. En el repositorio, ubicá la carpeta que Vercel usa como Root Directory. Si está vacía, es la raíz del repositorio. Si tiene una ruta, los archivos deben ir en esa ruta.
3. Subí el CONTENIDO descomprimido en esa ubicación, reemplazando los archivos con el mismo nombre. index.html, admin.html, admin.js, app.js, media-upload.js y los nuevos rounded-design y hero-motion deben quedar juntos.
4. No subas el ZIP como archivo y no agregues otra carpeta caressano-models dentro del sitio. No borres carpetas anteriores para hacer esta actualización.
5. Para revisar antes de publicar, elegí crear una rama nueva y una solicitud de cambios. Un commit directo a la rama de producción puede publicar automáticamente en Vercel.

## Vercel
Mantené el proyecto, dominio, Root Directory y configuración de compilación actuales del sitio estático. Esta actualización no agrega dependencias ni requiere un comando nuevo de build.
Revisá el Preview de la rama y después integrá los cambios cuando decidas publicarlos. Esperá que el despliegue diga Ready/Listo y comprobá que corresponde al commit nuevo.
El Preview conserva las referencias actuales a Supabase: guardar contenido desde ese Preview puede modificar la misma base que producción. Para revisar solo el diseño, no guardes datos reales allí. La prueba local de esta conversación sí bloquea las escrituras a producción.
No vuelvas a ejecutar configuraciones SQL por esta actualización visual. Se conserva la integración Storage V2 existente.

## Después de actualizar
Abrí el panel en el mismo navegador donde trabajás habitualmente y recargá con Ctrl+Shift+R. Iniciá sesión normalmente.
Comprobá Inicio, Nosotros, Modelos, Contacto y un perfil en computadora y teléfono.
En Diseño → Apariencia redondeada están los colores, tipografías, tamaños y formatos. El tamaño original de las fotos es el predeterminado; elegir un formato distinto es opcional.
En Inicio están los controles de animación de portada. El encabezado incluye cápsulas de vidrio y contraste automático.
En Modelos → Editar, cada foto/video del portfolio tiene ← Antes y Después →. El nuevo orden se guarda automáticamente usando el flujo habitual de publicación. La foto principal no cambia. Comprobá el estado de publicación antes de cerrar el panel.
Comprobá el orden desde otra pestaña y que siga igual al recargar. Los ajustes particulares viajan con cada foto.
Los botones de WhatsApp comparten el número configurado en Contacto.
Si aparece un error, conservá los datos y el mensaje; no limpies el almacenamiento ni restaures un backup sin revisarlo.

## Cambios incluidos
Diseño redondeado, secciones y logo originales, convocatoria blanca con botón negro y letras blancas, sin el título Presencia/Identidad, portada animada configurable, encabezado con una sola cápsula de vidrio, dos tarjetas por pantalla en teléfono, controles de apariencia y formato, orden de fotos y videos por modelo.
Se conservan IndexedDB, recuperación de cambios pendientes, fotografías originales sin recomprimir y publicación por Supabase Storage con enlaces en el JSON.

## Validación
Las pruebas de almacenamiento, publicación simulada, carga de medios, animación y orden del portfolio están en tests/. Se ejecutan con Node: node --test tests/*.cjs
El nuevo orden se comprobó también en la prueba local: antes/después, recarga del panel y lectura del perfil público. La producción no fue modificada durante esta preparación.
