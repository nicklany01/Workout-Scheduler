import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { Exercise, Log } from '../src/pages'


// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)

const userDataFolder = path.join(app.getPath('userData'), 'UserData');

// Function to save data based on the type (logs or exercises)
function saveData(type: string, data: any) {
  const filePath = path.join(userDataFolder, `${type}.json`);

  // Ensure the data folder exists
  if (!fs.existsSync(userDataFolder)) {
    fs.mkdirSync(userDataFolder);
  }

  const replacer = (_key: any, value: any) => {
    if (value instanceof Map) {
      const mapObject: { [key: string]: any } = {};
      value.forEach((mapValue, mapKey) => {
        mapObject[mapKey] = mapValue;
      });
  
      return mapObject;
    } else {
      return value;
    }
  };

  // Save the map data to the JSON file
  fs.writeFileSync(filePath, JSON.stringify(data, replacer, 2));
}

// IPC handler for saving logs
ipcMain.on('save-logs', (event, logs) => {
  saveData('WorkoutLogs', logs);
  event.reply('main-process-message', "logs saved");
});

// IPC handler for saving exercises
ipcMain.on('save-exercises', (event, exercises) => {
  saveData('Exercises', exercises);
  event.reply('main-process-message', "exercises saved");
});

ipcMain.on('save-config', (event, config) => {
  saveData('Config', config);
  event.reply('main-process-message', "config saved");
});

// Function to load data based on the type (logs or exercises)
function loadData(type: string) {
  const filePath = path.join(userDataFolder, `${type}.json`);

  try {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      // If it doesn't exist, create it with an empty JSON object
      fs.writeFileSync(filePath, '{}', 'utf-8');
    }

    // const reviver = (key: any, value: any) => {
    //   if (value && typeof value === 'object' && value.dataType === 'Map') {
    //     return new Map(value.value);
    //   } else {
    //     return value;
    //   }
    // };

    const fileData = fs.readFileSync(filePath, 'utf-8');
    const parsedData = JSON.parse(fileData);

    if (type === 'WorkoutLogs') {
      return new Map(Object.entries(parsedData).map(([key, value]) => [key, value as Log]));
    } else if (type === 'Exercises') {
      return new Map(Object.entries(parsedData).map(([key, value]) => [key, value as Exercise]));
    } else {
      if (type === 'Config') {
        return new Map(Object.entries(parsedData).map(([key, value]) => [key, value as string]));
      } else {
        return { error: 'Invalid data type requested' };
      }
    }
  } catch (error: any) {
    return { error: error.message };
  }
}

// IPC handler for loading logs
ipcMain.handle('load-logs', () => {
  return loadData('WorkoutLogs');
});

// IPC handler for loading exercises
ipcMain.handle('load-exercises', () => {
  return loadData('Exercises');
});

ipcMain.handle('load-config', () => {
  return loadData('Config');
});