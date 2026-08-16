# CacaTools Media Player

Reproductor multimedia local para Windows, construido con Tauri 2, Rust, HTML, CSS y JavaScript.

![CacaTools Media Player](src/cacatools-media-player-logo.png)

## Alcance

- Reproduce vídeo y audio desde archivos locales.
- Abre varios archivos en una sola lista de reproducción.
- Acepta arrastrar y soltar y asociaciones de Windows mediante `Abrir con`.
- Incluye navegación, volumen, velocidad, repetición, subtítulos WebVTT y pantalla completa.
- Conserva la relación de aspecto del medio y adapta la ventana cuando el archivo aporta sus dimensiones.
- Mantiene una interfaz compacta con fondo visual difuminado y controles translúcidos.

CMP es un proyecto independiente. No contiene código del gestor de descargas, bases de datos de la aplicación principal, servicios externos ni tareas de descarga.

## Desarrollo

Requisitos: Windows, Node.js LTS, Rust estable y WebView2.

```powershell
npm ci
npm run tauri dev
```

Comprobaciones locales:

```powershell
npm run check
npm run build:web
cargo test --manifest-path src-tauri/Cargo.toml
```

## Compilación

Ejecutable portable sin instalador:

```powershell
npm run build:portable
```

El ejecutable queda en `src-tauri/target/release/cacatools_media_player.exe`.

Instalador NSIS:

```powershell
npm run build:installer
```

El instalador queda en `src-tauri/target/release/bundle/nsis/`. La configuración registra los formatos de audio y vídeo compatibles para que Windows muestre CMP en `Abrir con`.

El paquete MSIX se genera con la configuración de Microsoft Store:

```powershell
npm run build:store
```

La firma de Microsoft Store y la firma de una descarga distribuida por GitHub son procesos distintos. No se debe reutilizar una firma de Store como si fuera una firma pública para los ejecutables de GitHub.

## Seguridad y límites

CMP no inicia conexiones de red ni carga contenido remoto. El acceso a archivos se hace mediante los diálogos nativos de Windows, el arrastre local y el protocolo de assets de Tauri. Las capacidades nativas están limitadas a reproducción, selección de archivos y gestión de la ventana.

Consulta [SECURITY.md](SECURITY.md) antes de reportar una vulnerabilidad y [CODE_SIGNING.md](CODE_SIGNING.md) para el proceso de firmas.

Free code signing provided by SignPath.io, certificate by SignPath Foundation.

## Contribuir

Las contribuciones deben mantener el alcance local del proyecto, incluir pruebas o una explicación de validación y no introducir credenciales, binarios generados ni dependencias sin revisar. El flujo está descrito en [CONTRIBUTING.md](CONTRIBUTING.md).

## Licencia

El código de este repositorio se distribuye bajo la licencia MIT. Consulta [LICENSE](LICENSE).

Los avisos de terceros de las dependencias se conservan mediante `package-lock.json` y `src-tauri/Cargo.lock`; cualquier recurso adicional debe incluir su licencia correspondiente.
