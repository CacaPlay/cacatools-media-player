# Política de firma de código

La firma se reserva para artefactos de release construidos desde este repositorio. Las compilaciones de desarrollo y los artefactos locales no se presentan como firmados.

Este proyecto se prepara para solicitar firma comunitaria mediante SignPath Foundation. La aceptación depende de la revisión de SignPath y de que el repositorio público cumpla sus condiciones vigentes.

**Free code signing provided by SignPath.io, certificate by SignPath Foundation**

## Reglas del release

1. El binario se construye automáticamente desde un tag de release y desde el código fuente público correspondiente.
2. La compilación debe ser reproducible y producir un artefacto identificable por su hash.
3. Una persona distinta de quien realizó el cambio revisa el código y otra persona autorizada aprueba la solicitud de firma.
4. El artefacto firmado se publica junto con su versión, hash, fuente y notas de release.
5. No se firman binarios modificados después de la compilación ni artefactos enviados por terceros.

## Responsabilidades

- Autores y committers: preparan cambios y mantienen pruebas.
- Revisores: inspeccionan el cambio y la procedencia del artefacto.
- Aprobadores de release: autorizan únicamente versiones revisadas.
- Mantenedor del proyecto: conserva la política, la documentación de release y el acceso con MFA.

La firma de Microsoft Store es independiente de esta política. Un paquete firmado por la Store no convierte automáticamente un `.exe` distribuido en GitHub en un binario firmado por la Store.
