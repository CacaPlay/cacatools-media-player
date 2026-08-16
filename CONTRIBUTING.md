# Contribuir

Gracias por contribuir a CacaTools Media Player.

## Cambios aceptados

El proyecto está centrado en reproducción multimedia local para Windows. Los cambios deben preservar ese límite, mantener la compatibilidad con Tauri 2 y evitar dependencias, servicios remotos o permisos nativos que no sean imprescindibles.

Antes de abrir un pull request:

```powershell
npm ci
npm run check
npm run build:web
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
```

No incluyas `node_modules`, `dist`, `src-tauri/target`, paquetes MSIX, instaladores ni archivos personales. No subas claves, certificados, tokens ni archivos `.env`.

Los pull requests deben describir el problema, el cambio realizado y la validación ejecutada. Los cambios de release requieren revisión y aprobación separadas del autor.
