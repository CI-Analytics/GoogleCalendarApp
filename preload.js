// Preload script for Electron context isolation
// This file runs in the isolated context between the main process and the rendered content
// Currently minimal, as Google Calendar loads remotely and doesn't require local IPC

// You can add custom IPC handlers here if needed in the future
// Example: ipcRenderer.on('message', (event, arg) => { ... })
