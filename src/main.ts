import {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  clipboard
} from "electron";
import path from "node:path";
import { configStore } from "./electron-store";
import ZealPipeReader from "./zeal/zeal-pipe-reader";
import started from "electron-squirrel-startup";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow: BrowserWindow;
const config = configStore.load();

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: config.bidTracker.width,
    height: config.bidTracker.height,
    minWidth: 375,
    minHeight: 300,
    x: config.bidTracker.x,
    y: config.bidTracker.y,
    frame: false,
    transparent: true,
    autoHideMenuBar: true,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  new ZealPipeReader([mainWindow]);

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  mainWindow.setAlwaysOnTop(true, "screen-saver");

  mainWindow.on("move", () => {
    const [x, y] = mainWindow.getPosition();
    config.bidTracker.x = x;
    config.bidTracker.y = y;
    configStore.save(config);
  });
  mainWindow.on("resize", () => {
    const [width, height] = mainWindow.getSize();
    config.bidTracker.width = width;
    config.bidTracker.height = height;
    configStore.save(config);
  });

  globalShortcut.register("Alt+CommandOrControl+Z", () => {
    mainWindow.webContents.send("get-report-shortcut");
  });

  globalShortcut.register("Alt+CommandOrControl+X", () => {
    mainWindow.webContents.send("close-all-shortcut");
  });

  globalShortcut.register("Alt+CommandOrControl+C", () => {
    mainWindow.webContents.send("declare-winners-shortcut");
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain.on("app/close", () => {
  app.quit();
});

ipcMain.on("app/minimize", () => {
  mainWindow.minimize();
});

ipcMain.on("app/get-settings", (event) => {
  event.reply("settings-loaded", config);
});

ipcMain.on("app/copy-text", (event, text: string) => {
  clipboard.writeText(text);
});

ipcMain.on("app/send-to-discord", (event, text: string) => {
  fetch(config.bidTracker.discordWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      content: text
    })
  })
    .then((data) => console.log("Message sent:", data))
    .catch((error) => console.error("Error sending message:", error));
});
