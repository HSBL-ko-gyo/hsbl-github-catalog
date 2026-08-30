# Google Drive PDF Ctrl+Wheel Zoom

A small Manifest V3 extension that maps `Ctrl + mouse wheel` to the zoom controls
in Google Drive's PDF Preview.

- `Ctrl + wheel up` → Zoom in
- `Ctrl + wheel down` → Zoom out
- Wheel without `Ctrl` → Normal PDF scrolling
- Outside PDF Preview → Normal browser behavior

While a PDF preview is active, the extension prevents Chrome or Edge from
changing the browser page zoom.

## Install in Chrome

1. Download or clone this repository.
2. Open `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the repository folder (the folder containing `manifest.json`).
6. Reload any already-open Google Drive tabs.

## Install in Edge

1. Download or clone this repository.
2. Open `edge://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the repository folder (the folder containing `manifest.json`).
6. Reload any already-open Google Drive tabs.

## Permissions and privacy

The manifest declares no `permissions` or `host_permissions`. Its content script
is limited to `https://drive.google.com/*`. Frame matching is enabled so the
shortcut also works in same-origin and inherited-origin viewer frames.

The extension:

- does not collect or store data;
- does not perform analytics or tracking;
- does not make external network requests; and
- does not use remote code.

## How it works

The content script registers a capture-phase, non-passive `wheel` listener at
`document_start`. It calls `preventDefault()` only when all of the following are
true:

1. `Ctrl` is held;
2. a visible Google Drive PDF Preview is identified; and
3. the wheel event originated inside that preview.

It identifies a preview using a combination of dialog/viewer structure, a PDF
filename or MIME marker, and a large document rendering surface. It then finds
Drive's existing zoom buttons by their accessible labels or tooltips and clicks
them. A synthetic `+` or `-` keyboard event is used only as a fallback. Wheel
events are throttled to avoid jumping through many zoom levels at once.

### Google Drive DOM dependency

Google Drive does not expose a public API for controlling PDF Preview zoom, so
this extension necessarily depends on parts of Drive's UI DOM:

- accessible names and tooltips for the zoom buttons;
- dialog/viewer and PDF rendering elements; and
- one known Drive viewer class as a compatibility fallback.

Semantic attributes are preferred over generated CSS classes, but a future
Google Drive UI update may still require selector or label updates.

## Contributing

Issues and pull requests are welcome, especially reports that include the Drive
UI language and the zoom buttons' accessible labels.

## License

[MIT](LICENSE)
