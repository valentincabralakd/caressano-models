# Caressano Models — actualización móvil y encuadres 09/11/2026

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
Diseño redondeado, secciones y logo originales, convocatoria blanca con botón negro y letras blancas, sin el título Presencia/Identidad, portada animada configurable, encabezado con una sola cápsula de vidrio, proporciones originales en teléfono y portfolio en carrusel lateral, controles de apariencia y formato, orden de fotos y videos por modelo.
Se conservan IndexedDB, recuperación de cambios pendientes, fotografías originales sin recomprimir y publicación por Supabase Storage con enlaces en el JSON.

## Validación
Las pruebas de almacenamiento, publicación simulada, carga de medios, animación y orden del portfolio están en tests/. Se ejecutan con Node: node --test tests/*.cjs
El nuevo orden se comprobó también en la prueba local: antes/después, recarga del panel y lectura del perfil público. La producción no fue modificada durante esta preparación.

## Actualización del 09/11: teléfono, tablet y editor avanzado
Esta versión reemplaza al ZIP del 07/11. No necesita cambios de SQL ni reinstalar Supabase.
En teléfono (hasta 700 px), el perfil recupera la foto grande arriba, información debajo y portfolio lateral con fotos de 78vw × 108vw; el listado vuelve a cuatro tarjetas por vista como en la versión anterior. Se mantienen las esquinas redondeadas y la estética nueva. La composición de computadora se conserva. Tablet se comprobó a 834 px sin desbordes.
El encabezado usa gris claro #dededb y letras/logo oscuros sobre secciones oscuras. Sobre secciones claras conserva contraste inverso. Se mantiene el efecto de vidrio de los enlaces.

### Encuadres avanzados
En Modelos → Editar hay un botón para la tarjeta, otro para el perfil y uno en cada foto del portfolio. También hay botones en las fotos de Nosotros, banner, Novedades y portada.
El editor permite cambiar computadora, tablet o teléfono; heredar el ajuste de computadora o guardar uno propio; mostrar la foto completa o cubrir; elegir formato; cambiar posición, zoom y color del espacio libre; y elegir el punto de enfoque tocando la vista previa o con las flechas del teclado.
Foto completa al 100% conserva todos los bordes del archivo. Cubrir y aumentar zoom pueden recortar: revisá la cara y los extremos antes de guardar. El panel indica las dimensiones originales de la imagen.
Los ajustes avanzados tienen prioridad sobre los anteriores en esa foto. VOLVER AL ENCUADRE ANTERIOR quita únicamente el encuadre avanzado de esa foto; no borra la fotografía, su orden ni los controles previos. Cerrar el editor sin guardar descarta la propuesta.
La vista previa usa proporciones de referencia por dispositivo. Comprobá el resultado final en la página y en las pantallas donde la vas a usar.
Este editor es para fotografías; los videos conservan sus controles existentes.
No se recomprime ni se reemplaza el archivo: se guardan metadatos de encuadre. Las fotos se pueden seguir ordenando con Antes/Después.

### Comprobaciones
Seis pruebas automáticas: encuadre por pantalla y proporciones contain/cover, orden de fotos, animación, almacenamiento, carga de medios y Supabase simulado.
Comprobaciones visuales locales: perfil en 390 px y 834 px sin desbordes; carrusel lateral en teléfono; editor de foto completa, guardado y recarga; cambio de teléfono sin aplicar el encuadre a tablet; selección de foto dentro del perfil sin copiar un tamaño incorrecto.
No se ha actualizado GitHub, Vercel ni la base de producción.
Comparación de computadora a 1280 px con la versión anterior: foto principal 596,03 × 720 px y foto de galería 584,55 × 520 px, mismas posiciones y columnas. Fotografías incluidas verificadas byte por byte sin cambios.

## Banner de teléfono: versión 3
Este ZIP incluye todas las correcciones anteriores y reemplaza al ZIP móvil/encuadres anterior.
En teléfono (hasta 700 px), se elimina la regla antigua que imponía esquinas casi cuadradas al banner. Cada foto tiene recorte redondeado de 28 px; la portada ocupa 58% de la altura visible y el banner 32%, con límites para que no queden demasiado pequeños o grandes. Cada pieza usa 46% del ancho de pantalla. Computadora y tablet conservan su composición.
En Diseño → Apariencia redondeada → Inicio en teléfono podés modificar altura de portada, altura de banner, ancho de cada fotografía y redondeado. Estos ajustes de la estética nueva tienen prioridad sobre la altura de teléfono del bloque de animación. Guardá apariencia después de modificarlos.
Se mantiene el editor avanzado por foto, su orden, el contraste del encabezado y la calidad original.
Comprobaciones de esta corrección: siete pruebas automáticas aprobadas; vista a 390 px sin desborde, redondeado efectivo con recorte, portada más baja, banner más alto; tablet a 834 px sin desborde. Se probó guardar un radio distinto desde el panel y comprobarlo en la página, y se volvió a 28 px.
No se modificó producción. Subí el contenido descomprimido en la misma carpeta del sitio, reemplazando los archivos con el mismo nombre y agregando los nuevos; no borres fotos ni datos de Supabase.

## Versión 4: encaje y alineación de tarjetas en teléfono
Incluye todas las funciones y correcciones de las versiones anteriores.
Se corrige el doble redondeado de la tarjeta y su fotografía en anchos de hasta 700 px: el único recorte redondeado es el de la tarjeta exterior, y la foto ocupa todo el ancho interior. No se cambia el archivo de imagen ni el encuadre guardado.
Las tarjetas se alinean desde arriba, mantienen la misma altura y ubican Ver perfil en la misma línea pese a diferencias en los nombres. Se desactiva el desplazamiento y zoom al tocar las tarjetas en teléfono, evitando estados de hover retenidos por el navegador móvil. La vista de computadora y tablet mayor a 700 px conserva sus estilos.
Comprobación visual a 390 px: Ana Paula, Yohana, Victoria y Rosario con el mismo borde superior, altura y línea de Ver perfil; fotos cubriendo todo el ancho interior. Rosario estaba alineada en la copia de prueba antes de esta corrección; el bloqueo de elevación evita posibles desplazamientos al tocar.
Usá el contenido de ESTE ZIP para la actualización. No hace falta aplicar primero los ZIP anteriores.
