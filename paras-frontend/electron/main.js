import { app, BrowserWindow, shell, net, protocol } from 'electron';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_URL = 'http://localhost:8081';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: 'Paras Auto Parts ERP',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL || process.env.ELECTRON_START_URL;

  if (devServerUrl) {
    // Dev mode: Vite dev server handles the proxy — no interception needed.
    mainWindow.loadURL(devServerUrl);
  } else {
    // Production mode: load built files. Register 'app://' to serve them and
    // transparently proxy /api/* to the Spring Boot backend.
    mainWindow.loadURL('app://paras/index.html');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Register a custom 'app://' scheme to serve the built React app AND proxy
// /api/* requests to http://localhost:8081 — all without touching the renderer code.
//
// Must be called BEFORE app.whenReady().
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

app.whenReady().then(() => {
  // Handle all requests on the 'app://' scheme.
  // - /api/* → proxy to http://localhost:8081/api/*
  // - everything else → serve from the dist folder
  protocol.handle('app', async (request) => {
    const url = new URL(request.url);

    // Proxy API calls to the Spring Boot backend.
    if (url.pathname.startsWith('/api/') || url.pathname === '/api') {
      const backendUrl = BACKEND_URL + url.pathname + url.search;
      console.log('[Electron] Proxying:', backendUrl);
      let body;

      if (request.method !== 'GET' && request.method !== 'HEAD') {
        body = await request.arrayBuffer();
      }

      return net.fetch(backendUrl, {
        method: request.method,
        headers: request.headers,
        body,
      });
    }

    // Serve static files from the Vite dist folder.
    const distPath = path.join(__dirname, '../dist');
    let filePath = path.join(distPath, url.pathname);

    // For SPA: fall back to index.html for unknown routes.
    try {
      const fs = await import('fs');
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distPath, 'index.html');
      }
    } catch {
      filePath = path.join(distPath, 'index.html');
    }

    return net.fetch(pathToFileURL(filePath).toString());
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
