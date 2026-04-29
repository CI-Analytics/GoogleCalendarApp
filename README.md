# GoogleCalendarApp

A simple Electron application that displays Google Calendar in a desktop window.

## Installation

```bash
npm install
```

This installs Electron and all necessary dependencies.

## Getting Started

```bash
npm start
```

The app opens a window and automatically loads https://calendar.google.com. You can sign in with your Google account and use the calendar as usual.

## Architecture

- **main.js**: Main Electron process that creates the BrowserWindow and loads Google Calendar
- **preload.js**: Preload script for Electron context isolation (currently minimal)
- **index.html**: Local HTML shell as project placeholder (not used as primary entry point)
- **package.json**: npm configuration with Electron dependencies

## Persistent Login

The app automatically saves:

- **Google login credentials (Cookies)**: Your Google login persists even when you close and reopen the app
- **Session data**: Calendar state, your settings, and the last viewed calendar view are restored
- **Window size and position**: Window dimensions are saved

This data is stored locally in:
- **Windows**: `%APPDATA%\googlecalendarapp`
- **macOS**: `~/Library/Application Support/googlecalendarapp`
- **Linux**: `~/.config/googlecalendarapp`

When you restart the app, you automatically land where you left off — logged in and with your calendar.