# Seguridad

CacaTools Media Player es un reproductor local. No realiza conexiones de red, no carga contenido remoto y no ejecuta comandos del sistema para reproducir archivos.

## Límites de seguridad

- La CSP permite únicamente recursos de la aplicación, assets de Tauri y datos locales de la sesión.
- Los archivos se reciben mediante el diálogo nativo de Windows, arrastre local o argumentos de archivo.
- Los comandos Rust expuestos se limitan a reproducción, selección de archivos, gestión de la ventana y apertura local.
- No se deben añadir permisos Tauri amplios, telemetría, servicios remotos o credenciales embebidas sin una revisión independiente.

## Reportar una vulnerabilidad

No publiques detalles de una vulnerabilidad sin corregir en un issue público. Cuando el repositorio esté publicado, utiliza GitHub Security Advisories; mientras tanto, contacta de forma privada al mantenedor del repositorio e incluye pasos reproducibles, versión afectada y alcance del problema.

No envíes archivos multimedia personales ni credenciales en un reporte.
