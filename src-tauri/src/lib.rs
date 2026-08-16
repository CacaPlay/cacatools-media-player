use std::{path::Path, sync::Mutex};

use tauri::{Emitter, Manager, PhysicalSize, Size, State, WebviewWindow, Window, WindowEvent};
use tauri_runtime::ResizeDirection;

#[derive(Default)]
struct PlayerGeometry {
    aspect: Mutex<Option<f64>>,
    adjusting: Mutex<bool>,
    resize_direction: Mutex<Option<ResizeDirection>>,
    maximized_before_fullscreen: Mutex<bool>,
    pending_files: Mutex<Vec<String>>,
}

fn fit_logical_size(width: f64, height: f64, max_width: f64, max_height: f64) -> (u32, u32) {
    let safe_width = width.max(1.0);
    let safe_height = height.max(1.0);
    let mut factor = (max_width / safe_width)
        .min(max_height / safe_height)
        .min(1.0)
        .max(360.0 / safe_width.min(safe_height));
    if safe_width * factor > max_width || safe_height * factor > max_height {
        factor = (max_width / safe_width).min(max_height / safe_height);
    }
    (
        (safe_width * factor).round() as u32,
        (safe_height * factor).round() as u32,
    )
}

fn media_size(
    window: &WebviewWindow,
    width: f64,
    height: f64,
) -> Result<PhysicalSize<u32>, String> {
    let scale = window
        .scale_factor()
        .map_err(|error| error.to_string())?
        .max(1.0);
    let (screen_width, screen_height) = window
        .current_monitor()
        .map_err(|error| error.to_string())?
        .map(|monitor| {
            let size = monitor.size();
            (
                f64::from(size.width) / scale,
                f64::from(size.height) / scale,
            )
        })
        .unwrap_or((1920.0, 1080.0));

    let max_width = (screen_width * 0.92).clamp(640.0, 1920.0);
    let max_height = (screen_height * 0.88).clamp(360.0, 1200.0);
    let (logical_width, logical_height) = fit_logical_size(width, height, max_width, max_height);
    Ok(PhysicalSize {
        width: (f64::from(logical_width) * scale).round().max(320.0) as u32,
        height: (f64::from(logical_height) * scale).round().max(240.0) as u32,
    })
}

#[cfg(test)]
mod tests {
    use super::fit_logical_size;

    fn assert_ratio(width: f64, height: f64) {
        let (actual_width, actual_height) = fit_logical_size(width, height, 1766.0, 950.0);
        let expected = width / height;
        let actual = f64::from(actual_width) / f64::from(actual_height);
        assert!((actual - expected).abs() < 0.01, "{actual} != {expected}");
        assert!(f64::from(actual_width) <= 1766.0);
        assert!(f64::from(actual_height) <= 950.0);
    }

    #[test]
    fn preserves_widescreen_ratio() {
        assert_ratio(1920.0, 1080.0);
    }

    #[test]
    fn preserves_vertical_ratio() {
        assert_ratio(1080.0, 1920.0);
    }

    #[test]
    fn preserves_square_ratio() {
        assert_ratio(1080.0, 1080.0);
    }

    #[test]
    fn preserves_classic_ratio() {
        assert_ratio(1440.0, 1080.0);
    }
}

fn resize_from_aspect(
    scale: f64,
    aspect: f64,
    current: PhysicalSize<u32>,
    direction: Option<ResizeDirection>,
) -> Option<PhysicalSize<u32>> {
    let scale = scale.max(1.0);
    let logical_width = f64::from(current.width) / scale;
    let logical_height = f64::from(current.height) / scale;
    let width_driven = match direction {
        Some(ResizeDirection::North | ResizeDirection::South) => false,
        Some(_) => true,
        None => (logical_width / logical_height - aspect).abs() < 0.08,
    };
    let width = if width_driven {
        logical_width
    } else {
        logical_height * aspect
    };
    let height = width / aspect;
    Some(PhysicalSize {
        width: (width * scale).round().max(320.0) as u32,
        height: (height * scale).round().max(240.0) as u32,
    })
}

#[tauri::command]
fn resize_for_media(
    width: u32,
    height: u32,
    window: WebviewWindow,
    state: State<'_, PlayerGeometry>,
) -> Result<(), String> {
    if width == 0
        || height == 0
        || window.is_fullscreen().unwrap_or(false)
        || window.is_maximized().unwrap_or(false)
    {
        return Ok(());
    }
    let aspect = f64::from(width) / f64::from(height);
    *state
        .aspect
        .lock()
        .map_err(|_| "No se pudo guardar la proporción".to_string())? = Some(aspect);
    *state
        .resize_direction
        .lock()
        .map_err(|_| "No se pudo preparar la proporción".to_string())? = None;
    let target = media_size(&window, f64::from(width), f64::from(height))?;
    *state
        .adjusting
        .lock()
        .map_err(|_| "No se pudo preparar el redimensionamiento".to_string())? = true;
    let result = window
        .set_size(Size::Physical(target))
        .map_err(|error| error.to_string());
    let _ = window.center();
    *state
        .adjusting
        .lock()
        .map_err(|_| "No se pudo liberar el redimensionamiento".to_string())? = false;
    result
}

#[tauri::command]
fn window_action(
    action: String,
    window: WebviewWindow,
    state: State<'_, PlayerGeometry>,
) -> Result<(), String> {
    match action.as_str() {
        "fullscreen" => {
            let is_fullscreen = window.is_fullscreen().unwrap_or(false);
            if is_fullscreen {
                let result = window.set_fullscreen(false);
                if result.is_ok()
                    && state
                        .maximized_before_fullscreen
                        .lock()
                        .map(|value| *value)
                        .unwrap_or(false)
                {
                    let _ = window.maximize();
                }
                result
            } else {
                let was_maximized = window.is_maximized().unwrap_or(false);
                if let Ok(mut value) = state.maximized_before_fullscreen.lock() {
                    *value = was_maximized;
                }
                if was_maximized {
                    window.unmaximize().map_err(|error| error.to_string())?;
                }
                window.set_fullscreen(true)
            }
        }
        "minimize" => window.minimize(),
        "maximize" => {
            if window.is_maximized().unwrap_or(false) {
                window.unmaximize()
            } else {
                window.maximize()
            }
        }
        "close" => window.close(),
        _ => Ok(()),
    }
    .map_err(|error| error.to_string())
}

#[tauri::command]
fn fullscreen_state(window: WebviewWindow) -> bool {
    window.is_fullscreen().unwrap_or(false)
}

#[tauri::command]
fn start_window_dragging(window: WebviewWindow) -> Result<(), String> {
    window.start_dragging().map_err(|error| error.to_string())
}

#[tauri::command]
fn start_window_resize(
    direction: String,
    window: Window,
    state: State<'_, PlayerGeometry>,
) -> Result<(), String> {
    let direction = match direction.as_str() {
        "north" => ResizeDirection::North,
        "northeast" => ResizeDirection::NorthEast,
        "east" => ResizeDirection::East,
        "southeast" => ResizeDirection::SouthEast,
        "south" => ResizeDirection::South,
        "southwest" => ResizeDirection::SouthWest,
        "west" => ResizeDirection::West,
        "northwest" => ResizeDirection::NorthWest,
        _ => return Err("Dirección de redimensionamiento no válida".to_string()),
    };
    *state
        .resize_direction
        .lock()
        .map_err(|_| "No se pudo guardar la dirección de redimensionamiento".to_string())? =
        Some(direction);
    window
        .start_resize_dragging(direction)
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn initial_files(state: State<'_, PlayerGeometry>) -> Vec<String> {
    let mut files = Vec::new();
    let mut candidate = String::new();

    for argument in std::env::args().skip(1) {
        if Path::new(&argument).is_file() {
            files.push(argument);
            candidate.clear();
            continue;
        }

        let combined = if candidate.is_empty() {
            argument
        } else {
            format!("{candidate} {argument}")
        };
        if Path::new(&combined).is_file() {
            files.push(combined);
            candidate.clear();
        } else {
            candidate = combined;
        }
    }

    if let Ok(mut pending) = state.pending_files.lock() {
        files.extend(pending.drain(..));
    }
    files
}

#[tauri::command]
fn pick_media_files() -> Vec<String> {
    rfd::FileDialog::new()
        .set_title("Abrir archivos multimedia")
        .add_filter(
            "Multimedia",
            &[
                "mp4", "webm", "mkv", "mov", "avi", "m4v", "mp3", "wav", "flac", "m4a", "aac",
                "ogg", "opus",
            ],
        )
        .pick_files()
        .unwrap_or_default()
        .into_iter()
        .map(|path| path.to_string_lossy().into_owned())
        .collect()
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            let paths: Vec<String> = args
                .into_iter()
                .skip(1)
                .filter(|path| Path::new(path).is_file())
                .collect();
            if !paths.is_empty() {
                if let Ok(mut pending) = app.state::<PlayerGeometry>().pending_files.lock() {
                    pending.extend(paths.iter().cloned());
                }
                let _ = app.emit("open-files", paths);
            }
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .manage(PlayerGeometry::default())
        .invoke_handler(tauri::generate_handler![
            resize_for_media,
            window_action,
            fullscreen_state,
            start_window_dragging,
            start_window_resize,
            initial_files,
            pick_media_files
        ])
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_resizable(true);
                let _ = window.set_focus();
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::Resized(size) = event {
                if window.label() != "main"
                    || window.is_fullscreen().unwrap_or(false)
                    || window.is_maximized().unwrap_or(false)
                {
                    return;
                }
                let state = window.app_handle().state::<PlayerGeometry>();
                let aspect = state.aspect.lock().ok().and_then(|value| *value);
                let already_adjusting = state
                    .adjusting
                    .lock()
                    .map(|mut value| {
                        if *value {
                            true
                        } else {
                            *value = true;
                            false
                        }
                    })
                    .unwrap_or(true);
                let direction = state.resize_direction.lock().ok().and_then(|value| *value);
                if let (Some(aspect), false) = (aspect, already_adjusting) {
                    if let Ok(scale) = window.scale_factor() {
                        if let Some(target) = resize_from_aspect(scale, aspect, *size, direction) {
                            if target != *size {
                                let _ = window.set_size(Size::Physical(target));
                            }
                        }
                    }
                }
                {
                    if let Ok(mut value) = state.adjusting.lock() {
                        *value = false;
                    };
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running CacaTools Media Player");
}
