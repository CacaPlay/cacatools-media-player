import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const files = ['src/index.html', 'src/player.js', 'src/player.css', 'src/favicon.svg'];
for (const file of files) {
  const content = await readFile(resolve(root, file), 'utf8');
  if (!content.trim()) throw new Error(`Archivo vacío: ${file}`);
}
const js = await readFile(resolve(root, 'src/player.js'), 'utf8');
const css = await readFile(resolve(root, 'src/player.css'), 'utf8');
if ((await stat(resolve(root, 'src/cacatools-media-player-logo.png'))).size === 0) throw new Error('Falta el logo de la aplicación');
if (/\bfetch\s*\(|WebSocket|Command::new|std::process|reqwest|sqlite|job_id/i.test(js)) throw new Error('La fuente del reproductor contiene una integración fuera de alcance');
if (/player-youtube|player-mode="embed"|player-embed-platform/i.test(css)) throw new Error('La hoja de estilos contiene una vista retirada');
if (!js.includes("video.videoWidth") || !js.includes("video.videoHeight")) throw new Error('Falta el envío de dimensiones nativas');
console.log('MEDIA_PLAYER_CHECK_OK');
