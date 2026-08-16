# Checklist de release

- [ ] El cambio está revisado por alguien distinto del autor.
- [ ] `npm ci` termina correctamente.
- [ ] `npm run check` termina correctamente.
- [ ] `npm run build:web` termina correctamente.
- [ ] `cargo fmt --check --manifest-path src-tauri/Cargo.toml` termina correctamente.
- [ ] `cargo test --manifest-path src-tauri/Cargo.toml` termina correctamente.
- [ ] El ejecutable se construyó desde el tag y el commit publicados.
- [ ] Se calculó y publicó el hash SHA-256 del artefacto.
- [ ] Se verificó que el artefacto firmado corresponde exactamente al hash construido.
- [ ] Las notas de release incluyen esta línea:

  `Free code signing provided by SignPath.io, certificate by SignPath Foundation`

- [ ] El instalador, el ejecutable y el paquete Store no se mezclan entre sí en las notas de distribución.
