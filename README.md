# Smart Toggl Tracker for Obsidian

English | [中文](./README_zh.md)

A smart Obsidian plugin that seamlessly integrates with the Toggl time tracking service, allowing you to easily track time while taking notes.

## Features

### 🎯 Smart Timer Suggestions
- **Automatic Note Content Analysis**: Automatically suggests appropriate projects and descriptions based on current note's filename, heading hierarchy, list structure, and tags
- **Historical Record Recommendations**: Provides related timer suggestions based on previous time entries
- **One-Click Quick Start**: Select text or right-click to quickly start timing

### ⏱️ Intuitive Time Management
- **Real-time Timer**: Display current running timer in the sidebar with live elapsed time
- **Quick Operations**: Easily start, stop, and edit time entries
- **Visual Interface**: Modern user interface built with Svelte

### 📊 Time Entry Tracking
- **Weekly Statistics**: Display total time for the current week
- **Daily Breakdown**: Show time entries grouped by date
- **Project Identification**: Use colors to distinguish different projects
- **Tag Support**: Full support for Toggl tag system

### 🔄 Sync and Offline Handling
- **Auto Sync**: Automatically synchronize data with Toggl service
- **Offline Detection**: Provide reconnection options when network is down
- **Error Handling**: Comprehensive error notifications and handling mechanisms

### 🖥️ Desktop Enhanced Features
- **Status Bar Timer**: Display Toggl icon and current timing status in the bottom status bar
- **Quick Access**: Click status bar icon to quickly open timer panel
- **Real-time Display**: Status bar shows current timing task name and elapsed time in real-time

### 🔌 Developer API
- **Plugin Integration**: Provide API for other plugins to call timer start functionality
- **Programmatic Control**: Support programmatic control of timer start and stop

## Installation

### Install via BRAT (Recommended)
Since this plugin is not yet available in the official Obsidian community plugin marketplace, we recommend using BRAT for installation:

1. **Install BRAT Plugin**:
   - Open Obsidian Settings
   - Go to "Third-party plugins" → "Community plugins"
   - Turn off "Safe mode"
   - Search and install "Obsidian42 - BRAT"
   - Enable BRAT plugin

2. **Install Smart Toggl Tracker via BRAT**:
   - Open Command Palette (`Ctrl/Cmd + P`)
   - Type "BRAT: Add a beta plugin for testing"
   - Enter GitHub repository URL: `DesmondSylin/smart-toggl-tracker`
   - Click "Add Plugin"
   - Wait for installation to complete, then enable the plugin

3. **Enable Plugin**:
   - Go to "Settings" → "Third-party plugins"
   - Find "Smart Toggl Tracker" and enable it

### Manual Installation
If you prefer not to use BRAT, you can also install manually:

1. Go to [GitHub Releases page](https://github.com/DesmondSylin/smart-toggl-tracker/releases)
2. Download the latest `smart-toggl-tracker.zip` file
3. Extract to your Obsidian plugins folder: `<vault>/.obsidian/plugins/smart-toggl-tracker/`
4. Reload Obsidian (`Ctrl/Cmd + R`)
5. Enable the plugin in settings

> **Note**: The advantage of using BRAT is automatic plugin updates, while manual installation requires manually downloading new versions.

## Setup Guide

### 1. Get Toggl API Token
1. Log in to your [Toggl Track account](https://track.toggl.com)
2. Go to [Profile page](https://track.toggl.com/profile)
3. Copy your token from the "API Token" section

### 2. Configure Plugin
1. Find "Smart Toggl Tracker" in Obsidian Settings
2. Paste your Toggl API Token
3. Click "Connect" button
4. Once connected successfully, you can start using the plugin

## Usage

### Quick Start Timer
1. **Using Command Palette**:
   - Press `Ctrl/Cmd + P` to open Command Palette
   - Type "Start Toggl Timer"
   - Choose appropriate project and description

2. **Using Right-click Menu**:
   - Right-click in the editor
   - Select "Start Timer"
   - Choose from the suggestion list

3. **Using Sidebar**:
   - Open "Toggl Timer" panel
   - Click "Start a new timer"
   - Fill in timer details

### Smart Suggestion System
The plugin automatically generates suggestions based on:

- **Filename**: Use filename as project name candidate
- **Heading Hierarchy**: Analyze current position's heading hierarchy as project structure
- **List Structure**: Suggest projects based on list level relationships
- **Folder Path**: Use folder names as project candidates
- **Tag Content**: Convert note tags to Toggl tags

### Managing Time Entries
- **Edit Entries**: Click any time entry to edit
- **Repeat Timer**: Click play button to restart the same timer
- **Stop Timer**: Click stop button to end current timer
- **Sync Data**: Manually sync Toggl data

### Desktop Status Bar Feature
- **Quick Access**: Display Toggl timer icon (⏱️) in the bottom status bar
- **Real-time Status**: Show current timing task name and elapsed time
- **One-Click Open**: Click status bar icon to quickly open timer panel
- **Auto Update**: Update timing status every second without manual refresh

> **Note**: Status bar feature is only available in desktop version of Obsidian

## Available Commands

The plugin provides the following commands (accessible via Command Palette):

- `Show Tracker`: Display timer panel
- `Sync Now`: Immediately sync Toggl data
- `Open Timer Panel`: Open timer panel
- `Stop Toggl Timer`: Stop currently running timer
- `Start Toggl Timer`: Start new timer

## Settings

### Toggl API Token
Enter your Toggl API Token to connect to Toggl service.

### Debug Mode
Enabling debug mode allows you to:
- Display detailed debug information
- Disable automatic sync functionality
- Output detailed logs to console

## Troubleshooting

### Connection Issues
- **Invalid Token**: Please verify that your Toggl API Token is correct
- **Network Error**: Check network connection, plugin will automatically detect offline status
- **Too Many Requests**: If you receive a 429 error, please try again later

### Sync Issues
- **Data Not Syncing**: Click "Sync" button to manually sync
- **Missing Records**: Check record status on Toggl website

### Performance Issues
- **Slow Loading**: Large amount of historical records may affect loading speed
- **Memory Usage**: Plugin loads records from the last 7 days

## Privacy & Security

- Plugin only communicates with official Toggl API
- All data is transmitted using HTTPS encryption
- API Token is stored locally only
- No personal data is collected or sent to third parties

## Support & Feedback

If you encounter issues or have feature suggestions, please:

1. Check [GitHub Issues](https://github.com/DesmondSylin/smart-toggl-tracker/issues)
2. Submit a new Issue describing the problem
3. Share your experience in the community

## Development Information

### Technical Architecture
- **Frontend Framework**: Svelte
- **Development Language**: TypeScript
- **API Integration**: Toggl Track API v9
- **Data Storage**: IndexedDB (via idb)

### Developer API

The plugin provides public API for other plugins to use:

#### `startTrackingByAPI(description, project, tags)`

Start a new time tracking record.

**Parameters:**
- `description` (string): Task description
- `project` (string): Project name (will automatically search for matching projects)
- `tags` (string[]): Array of tags

**Return Value:**
- `Promise<{ok: boolean}>`: Returns `{ok: true}` on success, `{ok: false}` on failure

**Usage Example:**
```javascript
// Get Smart Toggl Tracker plugin instance
const smartTogglPlugin = this.app.plugins.plugins['smart-toggl-tracker'];

// Start timing
const result = await smartTogglPlugin.startTrackingByAPI(
  'Writing documentation',
  'Project Name',
  ['tag1', 'tag2']
);

if (result.ok) {
  console.log('Timer started successfully');
} else {
  console.log('Failed to start timer');
}
```

**Notes:**
- Toggl API Token must be set first
- Project name will be searched in existing projects, if multiple matches found, the last one will be used
- If project doesn't exist, the time entry will not be associated with any project

### Project Structure
```
src/
├── main.ts              # Main plugin logic
├── setting.ts           # Settings page
├── view.ts              # View management
├── SuggestModal.ts      # Suggestion modal
├── lib/
│   ├── toggl.js         # Toggl API integration
│   ├── store.js         # Data storage management
│   └── tool.js          # Utility functions
└── view/
    ├── Timer.svelte     # Main timer interface
    ├── EntryMenu.svelte # Timer suggestion menu
    └── EntryMenuItem.svelte # Timer item component
```

### Build Instructions
```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build production version
npm run build
```

## License

This project is licensed under the MIT License. Please refer to the LICENSE file for details.

## Version History

### v0.1.7 (Latest)
- Improved smart suggestion algorithm
- Fixed sync issues
- Optimized user interface

### v0.1.6
- Added right-click menu functionality
- Support for automatic tag suggestions
- Improved error handling

---

**Author**: Desmond Sylin
**Project Homepage**: [GitHub Repository](https://github.com/DesmondSylin/smart-toggl-tracker)