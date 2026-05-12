const { app, BrowserWindow, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

if (process.platform === 'win32') {
  app.setAppUserModelId('com.cianalytics.googlecalendarapp');
}

// File to persist window bounds
const userDataPath = app.getPath('userData');
const windowBoundsFile = path.join(userDataPath, 'window-bounds.json');

// Load saved window bounds
function getSavedWindowBounds() {
  try {
    if (fs.existsSync(windowBoundsFile)) {
      const data = fs.readFileSync(windowBoundsFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('Could not load saved window bounds:', error);
  }
  return null;
}

// Save window bounds
function saveWindowBounds() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      const bounds = mainWindow.getBounds();
      fs.writeFileSync(windowBoundsFile, JSON.stringify(bounds));
    } catch (error) {
      console.log('Could not save window bounds:', error);
    }
  }
}

function createWindow() {
  // Get saved bounds or use defaults
  const savedBounds = getSavedWindowBounds();

  // Use the ICO on Windows for the runtime taskbar/window icon and PNG elsewhere.
  // Windows is most reliable with .ico for the actual app window chrome.
  const iconFile = process.platform === 'win32' ? 'icon.ico' : 'icon.png';
  const iconCandidates = [
    path.join(process.resourcesPath, 'assets', iconFile),
    path.join(__dirname, 'assets', iconFile)
  ];
  const iconPath = iconCandidates.find((candidate) => fs.existsSync(candidate)) || iconCandidates[1];
  const appIcon = nativeImage.createFromPath(iconPath);
  
  const windowConfig = {
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: appIcon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      sandbox: true,
      webSecurity: true
    }
  };

  // Apply saved bounds if available
  if (savedBounds) {
    windowConfig.x = savedBounds.x;
    windowConfig.y = savedBounds.y;
    windowConfig.width = savedBounds.width;
    windowConfig.height = savedBounds.height;
  }

  mainWindow = new BrowserWindow(windowConfig);

  if (process.platform === 'win32' && !appIcon.isEmpty()) {
    mainWindow.setIcon(appIcon);
  }

  // Remove application menu (File, Edit, View, Window)
  Menu.setApplicationMenu(null);

  // Use Electron's real Chromium version to avoid Google browser-version blocks.
  const chromeVersion = process.versions.chrome;
  const supportedUserAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
  mainWindow.webContents.setUserAgent(supportedUserAgent);
  app.userAgentFallback = supportedUserAgent;
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = supportedUserAgent;
    callback({ requestHeaders: details.requestHeaders });
  });

  // Enable persistent session for Google login and cookies
  // Electron stores cookies, localStorage, sessionStorage, and service workers automatically
  // in the app's userData directory: %APPDATA%\[AppName] (Windows) or ~/.config/[AppName] (Linux/macOS)
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    // Allow Google Calendar to request necessary permissions (camera, microphone for Meet integration)
    const allowedPermissions = ['camera', 'microphone', 'geolocation'];
    if (allowedPermissions.includes(permission)) {
      callback(true);
    } else {
      callback(false);
    }
  });

  // Load Google Calendar
  mainWindow.loadURL('https://calendar.google.com');

  // Open DevTools in development (comment out for production)
  // mainWindow.webContents.openDevTools();

  // Save window bounds when window is moved/resized
  mainWindow.on('resized', saveWindowBounds);
  mainWindow.on('moved', saveWindowBounds);

  mainWindow.on('close', function () {
    saveWindowBounds();
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Handle app lifecycle
app.on('ready', createWindow);

app.on('window-all-closed', function () {
  // On macOS, apps typically stay active until explicitly quit
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On macOS, re-create window when dock icon is clicked
  if (mainWindow === null) {
    createWindow();
  }
});
