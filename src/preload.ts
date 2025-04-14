import { Config } from "./electron-store";
import { ZealPipe } from "./zeal/zeal-pipes";

import { contextBridge, ipcRenderer } from "electron";

enum ContextEvents {
  ZealPipes = "on-zeal-pipes",
  SettingsLoaded = "settings-loaded"
}

contextBridge.exposeInMainWorld("zeal", {
  onZealPipes: (onZealPipes: (pipes: ZealPipe[]) => void) => {
    ipcRenderer.on(ContextEvents.ZealPipes, (_event, pipes) => {
      onZealPipes(pipes);
    });
  },
  getSettings: () => ipcRenderer.send("app/get-settings"),
  onSettingsLoaded: (onSettingsLoaded: (settings: Config) => void) => {
    ipcRenderer.on(ContextEvents.SettingsLoaded, (_event, settings) => {
      onSettingsLoaded(settings);
    });
  },
  close: () => ipcRenderer.send("app/close"),
  minimize: () => ipcRenderer.send("app/minimize")
});
