const shell = document.querySelector('.player-shell');
const video = document.querySelector('.player-video');
const audio = document.querySelector('.player-audio');
const mediaWrap = document.querySelector('[data-media-dropzone]');
const timeline = document.querySelector('.player-timeline');
const volume = document.querySelector('.player-volume');
const compactVolume = document.querySelector('.compact-volume');
const playlistPanel = document.querySelector('[data-player-playlist-panel]');
const playlistList = document.querySelector('[data-player-playlist-list]');
const infoPanel = document.querySelector('.player-info');
const playButton = document.querySelector('[data-player-action="play"]');
const stateTitle = document.querySelector('[data-player-state-title]');
const stateMessage = document.querySelector('[data-player-state-message]');
const audioCard = document.querySelector('[data-audio-card]');
const backdropCanvas = document.querySelector('[data-player-backdrop-canvas]');
const ICONS = {
  play: '<svg viewBox="0 0 24 24"><path class="fill" d="M8.2 5.8v12.4L18 12 8.2 5.8Z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><rect class="fill" x="7" y="5.5" width="3.4" height="13" rx="1"/><rect class="fill" x="13.6" y="5.5" width="3.4" height="13" rx="1"/></svg>',
  volume: '<svg viewBox="0 0 24 24"><path d="M5 10v4h3l4 3V7l-4 3H5Z"/><path d="M15 9.2c1.7 1.5 1.7 4.1 0 5.6M17.5 6.8a7.2 7.2 0 0 1 0 10.4"/></svg>',
  muted: '<svg viewBox="0 0 24 24"><path d="M5 10v4h3l4 3V7l-4 3H5Z"/><path d="m15.5 9 4 4m0-4-4 4"/></svg>',
  previous: '<svg viewBox="0 0 24 24"><path class="fill" d="M7 5.5h2.2v13H7zM18 6.2v11.6L10.2 12 18 6.2Z"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path class="fill" d="M14.8 5.5H17v13h-2.2zM6 6.2v11.6L13.8 12 6 6.2Z"/></svg>',
  repeat: '<svg viewBox="0 0 24 24"><path class="fill" d="M7 7h11.2l-2.6-2.6L17 3l5 5-5 5-1.4-1.4L18.2 9H7v3l-2-2V7h2Zm10 10H5.8l2.6 2.6L7 21l-5-5 5-5 1.4 1.4L5.8 15H17v-3l2 2v3h-2Z"/></svg>',
  open: '<svg viewBox="0 0 24 24"><path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z"/><path d="M8 12h8M12 9v6"/></svg>',
  list: '<svg viewBox="0 0 24 24"><path d="M9 7h10M9 12h10M9 17h10"/><circle class="fill" cx="5" cy="7" r="1.2"/><circle class="fill" cx="5" cy="12" r="1.2"/><circle class="fill" cx="5" cy="17" r="1.2"/></svg>',
  speed: '<svg viewBox="0 0 24 24"><path d="M5 12a7 7 0 1 1 14 0"/><path d="M12 12 16 8"/><path d="M7 19h10"/></svg>',
  'playlist-list': '<svg viewBox="0 0 24 24"><path d="M9 7h10M9 12h10M9 17h10"/><circle class="fill" cx="5" cy="7" r="1.2"/><circle class="fill" cx="5" cy="12" r="1.2"/><circle class="fill" cx="5" cy="17" r="1.2"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3A1.7 1.7 0 0 0 14 21v.1h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-2.8-2.8.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.9v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.9h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.8 2.8-.1.1a1.7 1.7 0 0 0-.3 1.9A1.7 1.7 0 0 0 21 10h.1v4H21a1.7 1.7 0 0 0-1.6 1Z"/></svg>',
  fullscreen: '<svg viewBox="0 0 24 24"><path d="M8.5 4H4v4.5M15.5 4H20v4.5M8.5 20H4v-4.5M15.5 20H20v-4.5"/></svg>'
};
const state = { queue: [], index: -1, repeat: false, rate: 1, isDragging: false, idleTimer: 0, objectUrls: new Set(), captionTrack: null, thumbnailQueue: Promise.resolve() };
const tauri = () => window.__TAURI__;
const invoke = (command, args = {}) => tauri()?.core?.invoke ? tauri().core.invoke(command, args) : Promise.reject(new Error('Tauri no disponible'));
const convertFileSrc = (path) => tauri()?.core?.convertFileSrc ? tauri().core.convertFileSrc(path) : path;
const currentMedia = () => shell.dataset.mediaKind === 'audio' ? audio : video;
const appLogoReady = new Promise((resolve) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => resolve(null);
  image.src = './cacatools-media-player-logo.png';
});
const formatTime = (seconds) => { const value = Number.isFinite(Number(seconds)) ? Math.max(0, Number(seconds)) : 0; const h = Math.floor(value / 3600); const m = Math.floor(value % 3600 / 60); const s = Math.floor(value % 60); return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`; };
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const fileName = (path) => String(path || '').split(/[\\/]/).pop() || 'Archivo multimedia';
const extension = (name) => String(name).split('.').pop()?.toLowerCase() || '';
const isAudio = (name) => ['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'opus', 'wma'].includes(extension(name));
const mediaType = (name) => isAudio(name) ? 'audio' : 'video';

function setIcon(selector, icon) { document.querySelectorAll(selector).forEach((button) => { button.innerHTML = ICONS[icon] || ''; }); }
function setState(title, message, kind = 'waiting') { shell.dataset.playerState = kind; if (stateTitle) stateTitle.textContent = title; if (stateMessage) stateMessage.textContent = message; }
function wakeUI() { shell.classList.remove('is-ui-idle'); clearTimeout(state.idleTimer); if (!currentMedia().paused) state.idleTimer = setTimeout(() => shell.classList.add('is-ui-idle'), 1800); }
function showUI() { shell.classList.remove('is-ui-idle'); clearTimeout(state.idleTimer); }
function activeItem() { return state.queue[state.index] || null; }
function updateButtons() {
  const item = activeItem(); const playlist = state.queue.length > 1;
  shell.dataset.playerSource = playlist ? 'playlist' : 'local';
  shell.classList.toggle('is-playlist-open', shell.classList.contains('is-playlist-open') && playlist);
  document.querySelectorAll('.player-playlist-only').forEach((button) => { button.hidden = !playlist; });
  document.querySelector('[data-player-action="previous-track"]')?.toggleAttribute('disabled', !playlist);
  document.querySelector('[data-player-action="next-track"]')?.toggleAttribute('disabled', !playlist);
  document.querySelector('[data-player-action="playlist-list"]')?.toggleAttribute('disabled', !playlist);
  document.querySelectorAll('[data-settings-proxy]').forEach((button) => { const target = document.querySelector(`[data-player-action="${button.dataset.settingsProxy}"]`); button.toggleAttribute('disabled', Boolean(target?.disabled)); });
  document.querySelector('[data-player-action="repeat"]')?.setAttribute('aria-pressed', String(state.repeat));
  document.querySelector('[data-player-action="repeat"]')?.classList.toggle('is-active', state.repeat);
  document.querySelector('[data-player-action="repeat"]')?.setAttribute('aria-label', state.repeat ? 'Repetir activado' : 'Repetir desactivado');
  document.querySelector('[data-player-title]').textContent = item?.name || 'CacaTools Media Player';
  document.querySelector('[data-player-playlist-summary]').textContent = playlist ? `${state.queue.length} elementos · ${state.index + 1} activo` : 'Sin elementos cargados';
  document.querySelector('[data-player-playlist-title]').textContent = playlist ? 'Lista local' : 'Lista de reproducción';
}
function renderPlaylist() {
  if (!playlistList) return;
  playlistList.innerHTML = state.queue.map((item, index) => {
    const thumbnail = item.thumbnail
      ? `<img src="${esc(item.thumbnail)}" alt="" loading="lazy">`
      : '<span class="player-playlist-fallback" aria-hidden="true"></span>';
    const typeClass = item.type === 'audio' ? 'player-playlist-item-audio' : '';
    const thumbClass = item.type === 'audio' ? 'player-playlist-thumb-audio' : '';
    return `<button type="button" class="player-playlist-item ${typeClass} ${index === state.index ? 'is-active' : ''}" data-player-playlist-index="${index}"><span class="player-playlist-index">${index + 1}</span><span class="player-playlist-thumb ${thumbClass}">${thumbnail}</span><span class="player-playlist-copy"><strong>${esc(item.name)}</strong><small>${item.type === 'audio' ? 'Audio' : 'Vídeo'}</small></span><span class="player-playlist-state">${index === state.index ? 'Activo' : 'Reproducir'}</span></button>`;
  }).join('');
}

function queueThumbnail(item) {
  if (!item || item.thumbnail || item.thumbnailPending) return;
  item.thumbnailPending = true;
  state.thumbnailQueue = state.thumbnailQueue
    .then(() => createMediaThumbnail(item))
    .catch(() => {})
    .finally(() => { item.thumbnailPending = false; });
}

function artworkFromName(name, type) {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 180;
  const context = canvas.getContext('2d');
  if (!context) return '';
  let hash = 2166136261;
  for (const char of String(name)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  const hue = Math.abs(hash) % 360;
  const gradient = context.createLinearGradient(0, 0, 320, 180);
  gradient.addColorStop(0, `hsl(${hue}, 62%, 24%)`);
  gradient.addColorStop(1, `hsl(${(hue + 70) % 360}, 72%, 38%)`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 320, 180);
  context.globalAlpha = 0.2;
  context.fillStyle = '#ffffff';
  for (let index = 0; index < 5; index += 1) {
    context.beginPath();
    context.arc(40 + index * 78, 28 + ((Math.abs(hash) + index * 31) % 100), 18 + index * 7, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 0.32;
  context.strokeStyle = '#ffffff';
  context.lineWidth = type === 'audio' ? 4 : 3;
  context.beginPath();
  for (let x = 0; x <= 320; x += 8) {
    const y = 120 + Math.sin(x / 18 + hue) * (type === 'audio' ? 22 : 12);
    if (x === 0) context.moveTo(x, y); else context.lineTo(x, y);
  }
  context.stroke();
  context.globalAlpha = 1;
  return canvas.toDataURL('image/jpeg', 0.82);
}

async function audioArtwork() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) return '';

  const background = context.createLinearGradient(0, 0, 512, 512);
  background.addColorStop(0, '#0c2942');
  background.addColorStop(0.52, '#0c1b38');
  background.addColorStop(1, '#17103d');
  context.fillStyle = background;
  context.fillRect(0, 0, 512, 512);

  const glow = context.createRadialGradient(256, 230, 24, 256, 256, 300);
  glow.addColorStop(0, 'rgba(45, 173, 255, .24)');
  glow.addColorStop(.55, 'rgba(123, 74, 255, .12)');
  glow.addColorStop(1, 'rgba(5, 12, 28, 0)');
  context.fillStyle = glow;
  context.fillRect(0, 0, 512, 512);

  const logo = await appLogoReady;
  if (logo) {
    const side = 316;
    context.drawImage(logo, (512 - side) / 2, (512 - side) / 2, side, side);
  }
  return canvas.toDataURL('image/png');
}

function waitForEvent(target, eventName, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${eventName} timeout`)), timeoutMs);
    target.addEventListener(eventName, () => { clearTimeout(timer); resolve(); }, { once: true });
    target.addEventListener('error', () => { clearTimeout(timer); reject(new Error(`${eventName} error`)); }, { once: true });
  });
}

async function createMediaThumbnail(item) {
  if (item.type === 'audio') {
    item.thumbnail = await audioArtwork();
    renderPlaylist();
    updateAudioArtwork(item);
    return;
  }
  const probe = document.createElement('video');
  probe.preload = 'auto';
  probe.muted = true;
  probe.playsInline = true;
  probe.crossOrigin = 'anonymous';
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:fixed;left:-10000px;top:-10000px;width:1px;height:1px;opacity:0;pointer-events:none';
  document.body.append(probe);
  try {
    const metadataReady = waitForEvent(probe, 'loadedmetadata', 7000);
    probe.src = item.url;
    await metadataReady;
    const width = probe.videoWidth || 320;
    const height = probe.videoHeight || 180;
    const duration = Number.isFinite(probe.duration) ? probe.duration : 0;
    const position = duration >= 4
      ? 2 + Math.random() * (duration - 4)
      : duration > 0.4 ? duration * 0.5 : 0;
    if (position > 0) {
      const frameReady = waitForEvent(probe, 'seeked', 7000);
      probe.currentTime = position;
      await frameReady;
    }
    const scale = Math.min(1, 320 / width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('thumbnail canvas unavailable');
    context.drawImage(probe, 0, 0, canvas.width, canvas.height);
    item.thumbnail = canvas.toDataURL('image/jpeg', 0.82);
    renderPlaylist();
  } catch {
    item.thumbnail = artworkFromName(item.name, 'video');
    renderPlaylist();
  } finally {
    probe.removeAttribute('src');
    probe.load();
    probe.remove();
  }
}
function updateAudioArtwork(item) {
  if (item?.type !== 'audio' || !audioCard) return;
  const artwork = audioCard.querySelector('[data-audio-artwork]');
  if (artwork && item.thumbnail) artwork.src = item.thumbnail;
  audioCard.classList.toggle('has-artwork', Boolean(item.thumbnail));
}
function setPlaylistOpen(open) { shell.classList.toggle('is-playlist-open', open && state.queue.length > 1); playlistPanel?.setAttribute('aria-hidden', String(!open)); document.querySelector('[data-player-action="playlist-list"]')?.setAttribute('aria-pressed', String(open)); }
function setInfoOpen(open) { shell.classList.toggle('is-info-open', open); infoPanel?.setAttribute('aria-hidden', String(!open)); document.querySelector('[data-player-action="info"]')?.setAttribute('aria-pressed', String(open)); if (open) showUI(); }
function setCompactOpen(open) { shell.classList.toggle('is-compact-menu-open', open); document.querySelector('[data-player-compact-menu]')?.setAttribute('aria-hidden', String(!open)); }
function setSettingsPanel(name) { document.querySelectorAll('[data-settings-panel]').forEach((panel) => { panel.hidden = panel.dataset.settingsPanel !== name; }); }

async function openFiles() {
  showUI();
  let selected = [];
  try {
    selected = await invoke('pick_media_files') || [];
  } catch (error) { console.warn('No se pudo abrir el diálogo nativo', error); }
  if (!selected.length) {
    const input = document.createElement('input'); input.type = 'file'; input.multiple = true; input.accept = 'video/*,audio/*';
    input.addEventListener('change', () => addFiles([...input.files]), { once: true }); input.click(); return;
  }
  addFiles(selected.map((path) => ({ path, name: fileName(path) })));
}
function addFiles(files) {
  const existingPaths = new Set(state.queue.map((item) => item.path));
  const additions = files.map((entry) => {
    const path = typeof entry === 'string' ? entry : entry.path || entry.name;
    const name = typeof entry === 'string' ? fileName(entry) : entry.name || fileName(path);
    const url = entry instanceof File ? (state.objectUrls.add(URL.createObjectURL(entry)), [...state.objectUrls].at(-1)) : convertFileSrc(path);
    return { path, name, url, type: mediaType(name) };
  }).filter((item) => item.url && item.name && !existingPaths.has(item.path));
  if (!additions.length) return;
  const wasEmpty = !state.queue.length;
  state.queue.push(...additions);
  additions.forEach(queueThumbnail);
  if (wasEmpty) state.index = 0;
  renderPlaylist(); updateButtons();
  if (state.queue.length > 1) {
    setPlaylistOpen(true);
    loadIndex(state.index, false);
    setState('Selecciona un archivo', 'Elige un elemento de la lista para comenzar.', 'ready');
  } else {
    loadIndex(state.index, true);
  }
}
function loadIndex(index, autoplay = false) {
  const item = state.queue[index]; if (!item) return;
  state.index = index; const media = item.type === 'audio' ? audio : video; const old = currentMedia();
  if (old !== media) { old.pause(); old.removeAttribute('src'); old.load(); }
  shell.dataset.mediaKind = item.type; audioCard.hidden = item.type !== 'audio'; video.hidden = item.type === 'audio'; audio.hidden = item.type !== 'audio';
  updateAudioArtwork(item);
  media.src = item.url; media.playbackRate = state.rate; media.volume = Number(volume.value); media.load();
  setState('Preparando reproducción', item.name, 'loading'); updateButtons(); renderPlaylist();
  media.addEventListener('loadedmetadata', () => { updateMetadata(media, item); if (item.type === 'video') void invoke('resize_for_media', { width: media.videoWidth, height: media.videoHeight }).catch((error) => console.warn('No se pudo ajustar la ventana al medio', error)); setState('', '', 'ready'); if (autoplay) void media.play().catch(() => {}); }, { once: true });
  media.addEventListener('loadeddata', () => { if (item.type === 'video') captureBackdrop(); }, { once: true });
  media.addEventListener('error', () => {
    const code = media.error?.code;
    const message = code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
      ? 'WebView2 no pudo decodificar este formato o la ruta no está permitida.'
      : 'No se pudo cargar el archivo multimedia local.';
    setState('No se pudo reproducir', message, 'error');
  }, { once: true });
  if (item.type === 'video') captureBackdrop();
}
function updateMetadata(media, item) {
  const width = Number(media.videoWidth || 0); const height = Number(media.videoHeight || 0); const ratio = width && height ? `${width} × ${height} · ${(width / height).toFixed(3)}` : 'Audio';
  shell.dataset.mediaOrientation = width && height ? (height > width ? 'portrait' : 'landscape') : 'audio';
  document.querySelector('[data-info-title]').textContent = item.name; document.querySelector('[data-info-subtitle]').textContent = item.path || 'Archivo local';
  document.querySelector('[data-tech="container"]').textContent = extension(item.name).toUpperCase() || '—'; document.querySelector('[data-tech="resolution"]').textContent = width ? `${width} × ${height}` : 'Audio'; document.querySelector('[data-tech="aspect"]').textContent = ratio; document.querySelector('[data-tech="duration"]').textContent = formatTime(media.duration); document.querySelector('[data-tech="location"]').textContent = item.path || 'Origen temporal';
  document.querySelector('[data-audio-title]').textContent = item.name; document.querySelector('[data-audio-subtitle]').textContent = `${extension(item.name).toUpperCase()} · ${formatTime(media.duration)}`;
  updateAudioArtwork(item);
}
function captureBackdrop() { if (!backdropCanvas || video.readyState < 2 || !video.videoWidth) return; try { const width = Math.min(video.videoWidth, 1280); backdropCanvas.width = width; backdropCanvas.height = Math.max(1, Math.round(width * video.videoHeight / video.videoWidth)); backdropCanvas.getContext('2d')?.drawImage(video, 0, 0, backdropCanvas.width, backdropCanvas.height); shell.classList.add('has-static-backdrop'); } catch { shell.classList.remove('has-static-backdrop'); } }
function seekTo(value) { const media = currentMedia(); if (media.duration) media.currentTime = Number(value) * media.duration; }
let renderedPlayState = null;
function renderPlayIcon() {
  const media = currentMedia();
  const paused = media.paused;
  if (renderedPlayState === paused) return;
  renderedPlayState = paused;
  if (playButton) playButton.innerHTML = paused ? ICONS.play : ICONS.pause;
}
function updateProgress() { const media = currentMedia(); const duration = Number(media.duration) || 0; const current = Number(media.currentTime) || 0; timeline.value = duration ? String(Math.round(current / duration * 1000)) : '0'; document.querySelector('[data-time="current"]').textContent = formatTime(current); document.querySelector('[data-time="duration"]').textContent = formatTime(duration); renderPlayIcon(); requestAnimationFrame(updateProgress); }
function setVolume(value) { volume.value = String(value); compactVolume.value = String(value); video.volume = Number(value); audio.volume = Number(value); video.muted = Number(value) === 0; audio.muted = Number(value) === 0; const muted = Number(value) === 0; setIcon('[data-player-action="mute"]', muted ? 'muted' : 'volume'); }
function togglePlay() { const media = currentMedia(); if (!activeItem()) return openFiles(); if (media.paused) void media.play().catch(() => {}); else media.pause(); wakeUI(); }
function advance(delta) { if (state.queue.length < 2) return; state.index = (state.index + delta + state.queue.length) % state.queue.length; loadIndex(state.index, true); }
function nextOnEnd() { if (state.repeat) { currentMedia().currentTime = 0; void currentMedia().play(); } else if (state.queue.length > 1) advance(1); else setState('Reproducción terminada', 'Pulsa reproducir para volver a empezar.', 'ready'); }
function loadCaptions() { const input = document.createElement('input'); input.type = 'file'; input.accept = '.vtt,text/vtt'; input.addEventListener('change', async () => { const file = input.files?.[0]; if (!file) return; const url = URL.createObjectURL(file); const track = document.createElement('track'); track.kind = 'subtitles'; track.label = file.name; track.srclang = 'es'; track.src = url; track.default = true; video.append(track); state.captionTrack = track; video.textTracks[video.textTracks.length - 1].mode = 'showing'; }, { once: true }); input.click(); }
function disableCaptions() { if (state.captionTrack) { state.captionTrack.remove(); state.captionTrack = null; } [...video.textTracks].forEach((track) => { track.mode = 'disabled'; }); }
function isDomFullscreen() { return Boolean(document.fullscreenElement || document.webkitFullscreenElement); }
async function syncFullscreenState() {
  const domFullscreen = isDomFullscreen();
  let nativeFullscreen = false;
  try { nativeFullscreen = await invoke('fullscreen_state'); } catch { }
  shell.dataset.playerFullscreen = domFullscreen || nativeFullscreen ? 'on' : 'off';
  return domFullscreen || nativeFullscreen;
}
async function toggleFullscreen() {
  captureBackdrop();
  if (isDomFullscreen()) {
    try { if (document.exitFullscreen) await document.exitFullscreen(); else if (document.webkitExitFullscreen) document.webkitExitFullscreen(); } catch (error) { console.warn('No se pudo salir de pantalla completa', error); }
    await syncFullscreenState();
    return;
  }
  try {
    await invoke('window_action', { action: 'fullscreen' });
    await new Promise((resolve) => setTimeout(resolve, 180));
    if (await syncFullscreenState()) return;
  } catch (error) {
    console.warn('Fullscreen nativo no disponible; se intentarÃ¡ el del WebView', error);
  }
  try {
    if (shell.requestFullscreen) await shell.requestFullscreen();
    else if (shell.webkitRequestFullscreen) shell.webkitRequestFullscreen();
  } catch (error) { console.warn('No se pudo activar pantalla completa', error); }
  await syncFullscreenState();
}
async function windowAction(action) {
  if (action === 'fullscreen') return toggleFullscreen();
  try { await invoke('window_action', { action }); }
  catch (error) { console.warn(`No se pudo ejecutar la acciÃ³n de ventana: ${action}`, error); }
}

document.querySelectorAll('[data-player-action]').forEach((button) => button.addEventListener('click', (event) => {
  event.preventDefault(); event.stopPropagation();
  const action = button.dataset.playerAction;
  if (action === 'back') currentMedia().currentTime = Math.max(0, currentMedia().currentTime - 10); else if (action === 'forward') currentMedia().currentTime = Math.min(currentMedia().duration || Infinity, currentMedia().currentTime + 10); else if (action === 'mute') setVolume(Number(volume.value) ? 0 : 1); else if (action === 'repeat') { state.repeat = !state.repeat; updateButtons(); } else if (action === 'open') openFiles(); else if (action === 'captions') loadCaptions(); else if (action === 'speed') { state.rate = state.rate >= 2 ? .5 : state.rate + .25; currentMedia().playbackRate = state.rate; document.querySelectorAll('[data-player-speed],[data-settings-speed]').forEach((node) => { node.textContent = `${state.rate.toFixed(2).replace('.00', '')}x`; }); } else if (action === 'previous-track') advance(-1); else if (action === 'next-track') advance(1); else if (action === 'playlist-list') setPlaylistOpen(!shell.classList.contains('is-playlist-open')); else if (action === 'info') setInfoOpen(!shell.classList.contains('is-info-open')); else if (action === 'fullscreen') windowAction('fullscreen'); wakeUI();
}));
playButton?.addEventListener('pointerdown', (event) => { event.preventDefault(); event.stopPropagation(); wakeUI(); });
playButton?.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); togglePlay(); });
document.querySelectorAll('[data-window-action]').forEach((button) => button.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); void windowAction(button.dataset.windowAction); }));
document.querySelector('[data-player-playlist-close]')?.addEventListener('click', () => setPlaylistOpen(false)); document.querySelector('[data-player-info-close]')?.addEventListener('click', () => setInfoOpen(false)); document.querySelector('[data-player-compact-close]')?.addEventListener('click', () => setCompactOpen(false));
document.querySelector('[data-player-playlist-list]')?.addEventListener('click', (event) => { const button = event.target.closest('[data-player-playlist-index]'); if (button) { loadIndex(Number(button.dataset.playerPlaylistIndex), true); setPlaylistOpen(false); } });
document.querySelector('[data-player-open]')?.addEventListener('click', openFiles); document.querySelector('[data-player-caption-file]')?.addEventListener('click', loadCaptions); document.querySelector('[data-player-caption-off]')?.addEventListener('click', disableCaptions);
document.querySelectorAll('[data-settings-view]').forEach((button) => button.addEventListener('click', () => setSettingsPanel(button.dataset.settingsView)));
document.querySelectorAll('[data-settings-proxy]').forEach((button) => button.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); document.querySelector(`[data-player-action="${button.dataset.settingsProxy}"]`)?.click(); }));
document.querySelectorAll('[data-compact-proxy]').forEach((button) => button.addEventListener('click', (event) => {
  event.preventDefault(); event.stopPropagation();
  const action = button.dataset.compactProxy;
  document.querySelector(`[data-player-action="${action}"]`)?.click();
}));
timeline.addEventListener('input', () => { state.isDragging = true; seekTo(Number(timeline.value) / 1000); showUI(); }); timeline.addEventListener('change', () => { state.isDragging = false; wakeUI(); });
volume.addEventListener('input', () => setVolume(volume.value)); compactVolume.addEventListener('input', () => setVolume(compactVolume.value));
[video, audio].forEach((media) => { media.addEventListener('play', () => { renderPlayIcon(); wakeUI(); }); media.addEventListener('pause', () => { renderPlayIcon(); showUI(); }); media.addEventListener('ended', nextOnEnd); });
mediaWrap.addEventListener('dragover', (event) => { event.preventDefault(); shell.classList.add('is-drag-over'); }); mediaWrap.addEventListener('dragleave', () => shell.classList.remove('is-drag-over')); mediaWrap.addEventListener('drop', (event) => { event.preventDefault(); shell.classList.remove('is-drag-over'); addFiles([...event.dataTransfer.files]); });
mediaWrap.addEventListener('click', (event) => { if (event.target === video || event.target === audio || event.target === mediaWrap) togglePlay(); });
['mousemove', 'pointerdown', 'keydown'].forEach((event) => shell.addEventListener(event, wakeUI));
document.querySelector('[data-tauri-drag-region]')?.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 || event.target.closest('button')) return;
  void invoke('start_window_dragging').catch((error) => console.warn('No se pudo arrastrar la ventana', error));
});
document.querySelectorAll('[data-window-resize]').forEach((handle) => handle.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  void invoke('start_window_resize', { direction: handle.dataset.windowResize }).catch((error) => console.warn('No se pudo redimensionar la ventana', error));
}));
document.addEventListener('keydown', (event) => { if (event.key === ' ' && !/input|textarea/i.test(document.activeElement?.tagName || '')) { event.preventDefault(); togglePlay(); } if (event.key.toLowerCase() === 'f') windowAction('fullscreen'); if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'o') { event.preventDefault(); openFiles(); } if (event.key === 'Escape') { setPlaylistOpen(false); setInfoOpen(false); setCompactOpen(false); } });
document.addEventListener('fullscreenchange', () => { void syncFullscreenState(); });
window.addEventListener('resize', () => { void syncFullscreenState(); });
setIcon('[data-player-action="mute"]', 'volume'); setIcon('[data-player-action="repeat"]', 'repeat'); setIcon('[data-player-action="open"]', 'open'); setIcon('[data-player-action="previous-track"]', 'previous'); setIcon('[data-player-action="next-track"]', 'next'); setIcon('[data-player-action="playlist-list"]', 'list'); setIcon('[data-player-action="info"]', 'settings'); renderPlayIcon();
document.querySelectorAll('[data-compact-icon]').forEach((node) => { node.innerHTML = ICONS[node.dataset.compactIcon] || ICONS.settings; }); document.querySelectorAll('[data-settings-icon]').forEach((node) => { node.innerHTML = ICONS[node.dataset.settingsIcon] || ICONS.settings; });
window.__TAURI__?.event?.listen?.('tauri://drag-drop', (event) => { const paths = event.payload?.paths || []; if (paths.length) addFiles(paths.map((path) => ({ path, name: fileName(path) }))); });
window.__TAURI__?.event?.listen?.('open-files', (event) => {
  const paths = Array.isArray(event.payload) ? event.payload : [];
  if (paths.length) {
    addFiles(paths.map((path) => ({ path, name: fileName(path) })));
    showUI();
  }
});
async function loadInitialFiles() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const paths = await invoke('initial_files');
      if (Array.isArray(paths) && paths.length) addFiles(paths.map((path) => ({ path, name: fileName(path) })));
      return;
    } catch (error) {
      if (attempt === 29) console.warn('No se pudieron leer los archivos iniciales', error);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}
void loadInitialFiles();
setSettingsPanel('details'); updateButtons(); setState('Abre un archivo multimedia', 'Arrastra uno o varios archivos aquí, o usa Ctrl+O.', 'waiting'); requestAnimationFrame(updateProgress); void syncFullscreenState();
