import { Config } from "./electron-store";
import { ZealPipe } from "./zeal/zeal-pipes";

import { contextBridge, ipcRenderer } from "electron";

enum ContextEvents {
  ZealPipes = "on-zeal-pipes",
  SettingsLoaded = "settings-loaded",
  GetReportShortcut = "get-report-shortcut",
  CloseAllShortcut = "close-all-shortcut",
  DeclareWinnersShortcut = "declare-winners-shortcut"
}

contextBridge.exposeInMainWorld("zeal", {
  onZealPipes: (onZealPipes: (pipes: ZealPipe[]) => void) => {
    ipcRenderer.on(ContextEvents.ZealPipes, (_event, pipes) => {
      onZealPipes(pipes);
    });
  },
  getSettings: () => ipcRenderer.send("app/get-settings"),
  onGetReportShortcut: (onGetReportShortcut: () => void) => {
    ipcRenderer.on(ContextEvents.GetReportShortcut, (_event) => {
      onGetReportShortcut();
    });
  },
  onCloseAllShortcut: (onCloseAllShortcut: () => void) => {
    ipcRenderer.on(ContextEvents.CloseAllShortcut, (_event) => {
      onCloseAllShortcut();
    });
  },
  onDeclareAllWinnersShortcut: (onDeclareAllWinnersShortcut: () => void) => {
    ipcRenderer.on(ContextEvents.DeclareWinnersShortcut, (_event) => {
      onDeclareAllWinnersShortcut();
    });
  },
  onSettingsLoaded: (onSettingsLoaded: (settings: Config) => void) => {
    ipcRenderer.on(ContextEvents.SettingsLoaded, (_event, settings) => {
      onSettingsLoaded(settings);
    });
  },
  close: () => ipcRenderer.send("app/close"),
  minimize: () => ipcRenderer.send("app/minimize"),
  copyText: (text: string) => ipcRenderer.send("app/copy-text", text),
  sendToDiscord: (text: string) => ipcRenderer.send("app/send-to-discord", text)
});
