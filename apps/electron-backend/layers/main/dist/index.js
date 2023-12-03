"use strict";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var path = require("path");
var require$$0 = require("electron");
var crypto = require("crypto");
var url = require("url");
var express = require("express");
function _interopDefaultLegacy(e) {
  return e && typeof e === "object" && "default" in e ? e : { "default": e };
}
var path__default = /* @__PURE__ */ _interopDefaultLegacy(path);
var require$$0__default = /* @__PURE__ */ _interopDefaultLegacy(require$$0);
var crypto__default = /* @__PURE__ */ _interopDefaultLegacy(crypto);
var express__default = /* @__PURE__ */ _interopDefaultLegacy(express);
const electron = require$$0__default["default"];
if (typeof electron === "string") {
  throw new TypeError("Not running in an Electron environment!");
}
const app = electron.app || electron.remote.app;
const isEnvSet = "ELECTRON_IS_DEV" in process.env;
const getFromEnv = parseInt({}.ELECTRON_IS_DEV, 10) === 1;
var electronIsDev = isEnvSet ? getFromEnv : !app.isPackaged;
const isMacOS = process.platform === "darwin";
function uuid() {
  return crypto__default["default"].randomUUID();
}
let listWindow = [];
let mainWindow;
const defaultWindowUrl = electronIsDev ? "http://localhost:3000" : url.format({
  pathname: path__default["default"].join(__dirname, "../renderer/out/index.html"),
  protocol: "file:",
  slashes: true
});
const preload_js_path = path__default["default"].resolve(__dirname, "../../preload/dist/", "index.js");
async function createMainWindow() {
  if (mainWindow) {
    return mainWindow;
  }
  const window2 = new require$$0.BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    backgroundColor: isMacOS ? "#D1D5DB" : "#6B7280",
    titleBarStyle: isMacOS ? "hiddenInset" : "default",
    frame: isMacOS,
    webPreferences: {
      devTools: electronIsDev,
      contextIsolation: true,
      nodeIntegration: false,
      preload: preload_js_path,
      disableDialogs: false,
      safeDialogs: true,
      enableWebSQL: false
    }
  });
  mainWindow = window2;
  if (electronIsDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
  window2.on("closed", () => {
    mainWindow = null;
    listWindow.forEach((instance) => {
      var _a;
      (_a = instance.window.webContents) == null ? void 0 : _a.destroy();
    });
    listWindow = [];
  });
  if (electronIsDev) {
    window2.loadURL(`${defaultWindowUrl}/tabs`);
  } else {
    window2.loadURL("app://-/tabs");
  }
  window2.show();
  const windowView = await createWindow(defaultWindowUrl + "/app");
  setTab(windowView);
}
async function createWindow(href) {
  const window2 = new require$$0.BrowserView({
    webPreferences: {
      devTools: electronIsDev,
      contextIsolation: true,
      nodeIntegration: false,
      preload: preload_js_path,
      disableDialogs: false,
      safeDialogs: true,
      enableWebSQL: false
    }
  });
  window2.webContents.loadURL(href);
  if (electronIsDev) {
    window2.webContents.openDevTools({ mode: "detach" });
  }
  window2.webContents.on("did-finish-load", () => {
  });
  listWindow.push({
    window: window2,
    name: `Tab-${uuid()}`
  });
  mainWindow.webContents.send("tabChange", getTabData());
  return window2;
}
function getTabData() {
  var _a;
  return {
    tabs: listWindow.map((instance) => instance.name),
    active: ((_a = listWindow.find((instance) => {
      var _a2, _b;
      return instance.window.webContents.id === ((_b = (_a2 = mainWindow.getBrowserView()) == null ? void 0 : _a2.webContents) == null ? void 0 : _b.id);
    })) == null ? void 0 : _a.name) || ""
  };
}
function setTab(instance) {
  mainWindow.setBrowserView(instance);
  instance.setBounds({ x: 0, y: 36, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height - 36 });
  instance.setAutoResize({ width: true, height: true, horizontal: false, vertical: false });
  mainWindow.webContents.send("tabChange", getTabData());
}
async function restoreOrCreateWindow() {
  let window2 = mainWindow;
  if (window2 === void 0) {
    await createMainWindow();
    window2 = mainWindow;
  }
  if (window2.isMinimized()) {
    window2.restore();
  }
  window2.focus();
}
var renderer = { exports: {} };
var scope = scopeFactory$1;
function scopeFactory$1(logger) {
  return Object.defineProperties(scope2, {
    defaultLabel: { value: "", writable: true },
    labelPadding: { value: true, writable: true },
    maxLabelLength: { value: 0, writable: true },
    labelLength: {
      get() {
        switch (typeof scope2.labelPadding) {
          case "boolean":
            return scope2.labelPadding ? scope2.maxLabelLength : 0;
          case "number":
            return scope2.labelPadding;
          default:
            return 0;
        }
      }
    }
  });
  function scope2(label) {
    scope2.maxLabelLength = Math.max(scope2.maxLabelLength, label.length);
    const newScope = {};
    for (const level of [...logger.levels, "log"]) {
      newScope[level] = (...d) => logger.logData(d, { level, scope: label });
    }
    return newScope;
  }
}
const scopeFactory = scope;
class Logger {
  static instances = {};
  errorHandler = null;
  eventLogger = null;
  functions = {};
  hooks = [];
  isDev = false;
  levels = null;
  logId = null;
  scope = null;
  transports = {};
  variables = {};
  constructor({
    allowUnknownLevel = false,
    errorHandler,
    eventLogger,
    initializeFn,
    isDev = false,
    levels = ["error", "warn", "info", "verbose", "debug", "silly"],
    logId,
    transportFactories = {},
    variables
  } = {}) {
    this.addLevel = this.addLevel.bind(this);
    this.create = this.create.bind(this);
    this.logData = this.logData.bind(this);
    this.processMessage = this.processMessage.bind(this);
    this.allowUnknownLevel = allowUnknownLevel;
    this.initializeFn = initializeFn;
    this.isDev = isDev;
    this.levels = levels;
    this.logId = logId;
    this.transportFactories = transportFactories;
    this.variables = variables || {};
    this.scope = scopeFactory(this);
    this.addLevel("log", false);
    for (const name of this.levels) {
      this.addLevel(name, false);
    }
    this.errorHandler = errorHandler;
    errorHandler == null ? void 0 : errorHandler.setOptions({ logFn: this.error });
    this.eventLogger = eventLogger;
    eventLogger == null ? void 0 : eventLogger.setOptions({ logger: this });
    for (const [name, factory] of Object.entries(transportFactories)) {
      this.transports[name] = factory(this);
    }
    Logger.instances[logId] = this;
  }
  static getInstance({ logId }) {
    return this.instances[logId] || this.instances.default;
  }
  addLevel(level, index = this.levels.length) {
    if (index !== false) {
      this.levels.splice(index, 0, level);
    }
    this[level] = (...args) => this.logData(args, { level });
    this.functions[level] = this[level];
  }
  catchErrors(options) {
    this.processMessage({
      data: ["log.catchErrors is deprecated. Use log.errorHandler instead"],
      level: "warn"
    }, { transports: ["console"] });
    return this.errorHandler.startCatching(options);
  }
  create(options) {
    if (typeof options === "string") {
      options = { logId: options };
    }
    return new Logger(__spreadProps(__spreadValues({}, options), {
      errorHandler: this.errorHandler,
      initializeFn: this.initializeFn,
      isDev: this.isDev,
      transportFactories: this.transportFactories,
      variables: __spreadValues({}, this.variables)
    }));
  }
  compareLevels(passLevel, checkLevel, levels = this.levels) {
    const pass = levels.indexOf(passLevel);
    const check = levels.indexOf(checkLevel);
    if (check === -1 || pass === -1) {
      return true;
    }
    return check <= pass;
  }
  initialize({ preload = true, spyRendererConsole = false } = {}) {
    this.initializeFn({ logger: this, preload, spyRendererConsole });
  }
  logData(data, options = {}) {
    this.processMessage(__spreadValues({ data }, options));
  }
  processMessage(message, { transports = this.transports } = {}) {
    if (message.cmd === "errorHandler") {
      this.errorHandler.handle(message.error, {
        errorName: message.errorName,
        processType: "renderer",
        showDialog: Boolean(message.showDialog)
      });
      return;
    }
    let level = message.level;
    if (!this.allowUnknownLevel) {
      level = this.levels.includes(message.level) ? message.level : "info";
    }
    const normalizedMessage = __spreadProps(__spreadValues({
      date: new Date()
    }, message), {
      level,
      variables: __spreadValues(__spreadValues({}, this.variables), message.variables)
    });
    for (const [transName, transFn] of this.transportEntries(transports)) {
      if (typeof transFn !== "function" || transFn.level === false) {
        continue;
      }
      if (!this.compareLevels(transFn.level, message.level)) {
        continue;
      }
      try {
        const transformedMsg = this.hooks.reduce((msg, hook) => {
          return msg ? hook(msg, transFn, transName) : msg;
        }, normalizedMessage);
        if (transformedMsg) {
          transFn(__spreadProps(__spreadValues({}, transformedMsg), { data: [...transformedMsg.data] }));
        }
      } catch (e) {
        this.processInternalErrorFn(e);
      }
    }
  }
  processInternalErrorFn(_e) {
  }
  transportEntries(transports = this.transports) {
    const transportArray = Array.isArray(transports) ? transports : Object.entries(transports);
    return transportArray.map((item) => {
      switch (typeof item) {
        case "string":
          return this.transports[item] ? [item, this.transports[item]] : null;
        case "function":
          return [item.name, item];
        default:
          return Array.isArray(item) ? item : null;
      }
    }).filter(Boolean);
  }
}
var Logger_1 = Logger;
const consoleError = console.error;
class RendererErrorHandler {
  logFn = null;
  onError = null;
  showDialog = false;
  preventDefault = true;
  constructor({ logFn = null } = {}) {
    this.handleError = this.handleError.bind(this);
    this.handleRejection = this.handleRejection.bind(this);
    this.startCatching = this.startCatching.bind(this);
    this.logFn = logFn;
  }
  handle(error, {
    logFn = this.logFn,
    errorName = "",
    onError = this.onError,
    showDialog = this.showDialog
  } = {}) {
    try {
      if ((onError == null ? void 0 : onError({ error, errorName, processType: "renderer" })) !== false) {
        logFn({ error, errorName, showDialog });
      }
    } catch {
      consoleError(error);
    }
  }
  setOptions({ logFn, onError, preventDefault, showDialog }) {
    if (typeof logFn === "function") {
      this.logFn = logFn;
    }
    if (typeof onError === "function") {
      this.onError = onError;
    }
    if (typeof preventDefault === "boolean") {
      this.preventDefault = preventDefault;
    }
    if (typeof showDialog === "boolean") {
      this.showDialog = showDialog;
    }
  }
  startCatching({ onError, showDialog } = {}) {
    if (this.isActive) {
      return;
    }
    this.isActive = true;
    this.setOptions({ onError, showDialog });
    window.addEventListener("error", (event) => {
      var _a;
      this.preventDefault && ((_a = event.preventDefault) == null ? void 0 : _a.call(event));
      this.handleError(event.error || event);
    });
    window.addEventListener("unhandledrejection", (event) => {
      var _a;
      this.preventDefault && ((_a = event.preventDefault) == null ? void 0 : _a.call(event));
      this.handleRejection(event.reason || event);
    });
  }
  handleError(error) {
    this.handle(error, { errorName: "Unhandled" });
  }
  handleRejection(reason) {
    const error = reason instanceof Error ? reason : new Error(JSON.stringify(reason));
    this.handle(error, { errorName: "Unhandled rejection" });
  }
}
var RendererErrorHandler_1 = RendererErrorHandler;
var console_1 = consoleTransportRendererFactory;
const consoleMethods = {
  error: console.error,
  warn: console.warn,
  info: console.info,
  verbose: console.info,
  debug: console.debug,
  silly: console.debug,
  log: console.log
};
function consoleTransportRendererFactory(logger) {
  return Object.assign(transport, {
    format: "{h}:{i}:{s}.{ms}{scope} \u203A {text}",
    formatDataFn(_a) {
      var _b = _a, {
        data = [],
        date = new Date(),
        format = transport.format,
        logId = logger.logId,
        scope: scope2 = logger.scopeName
      } = _b, message = __objRest(_b, [
        "data",
        "date",
        "format",
        "logId",
        "scope"
      ]);
      if (typeof format === "function") {
        return format(__spreadProps(__spreadValues({}, message), { data, date, logId, scope: scope2 }));
      }
      if (typeof format !== "string") {
        return data;
      }
      data.unshift(format);
      if (typeof data[1] === "string" && data[1].match(/%[1cdfiOos]/)) {
        data = [`${data[0]} ${data[1]}`, ...data.slice(2)];
      }
      data[0] = data[0].replace(/\{(\w+)}/g, (substring, name) => {
        var _a2;
        switch (name) {
          case "level":
            return message.level;
          case "logId":
            return logId;
          case "scope":
            return scope2 ? ` (${scope2})` : "";
          case "text":
            return "";
          case "y":
            return date.getFullYear().toString(10);
          case "m":
            return (date.getMonth() + 1).toString(10).padStart(2, "0");
          case "d":
            return date.getDate().toString(10).padStart(2, "0");
          case "h":
            return date.getHours().toString(10).padStart(2, "0");
          case "i":
            return date.getMinutes().toString(10).padStart(2, "0");
          case "s":
            return date.getSeconds().toString(10).padStart(2, "0");
          case "ms":
            return date.getMilliseconds().toString(10).padStart(3, "0");
          case "iso":
            return date.toISOString();
          default: {
            return ((_a2 = message.variables) == null ? void 0 : _a2[name]) || substring;
          }
        }
      }).trim();
      return data;
    },
    writeFn({ message: { level, data } }) {
      const consoleLogFn = consoleMethods[level] || consoleMethods.info;
      setTimeout(() => consoleLogFn(...data));
    }
  });
  function transport(message) {
    transport.writeFn({
      message: __spreadProps(__spreadValues({}, message), { data: transport.formatDataFn(message) })
    });
  }
}
var ipc = ipcTransportRendererFactory;
const RESTRICTED_TYPES = new Set([Promise, WeakMap, WeakSet]);
function ipcTransportRendererFactory(logger) {
  return Object.assign(transport, {
    depth: 5,
    serializeFn(data, { depth = 5, seen = new WeakSet() } = {}) {
      if (depth < 1) {
        return `[${typeof data}]`;
      }
      if (seen.has(data)) {
        return data;
      }
      if (["function", "symbol"].includes(typeof data)) {
        return data.toString();
      }
      if (Object(data) !== data) {
        return data;
      }
      if (RESTRICTED_TYPES.has(data.constructor)) {
        return `[${data.constructor.name}]`;
      }
      if (Array.isArray(data)) {
        return data.map((item) => transport.serializeFn(item, { level: depth - 1, seen }));
      }
      if (data instanceof Error) {
        return data.stack;
      }
      if (data instanceof Map) {
        return new Map(Array.from(data).map(([key, value]) => [
          transport.serializeFn(key, { level: depth - 1, seen }),
          transport.serializeFn(value, { level: depth - 1, seen })
        ]));
      }
      if (data instanceof Set) {
        return new Set(Array.from(data).map((val) => transport.serializeFn(val, { level: depth - 1, seen })));
      }
      seen.add(data);
      return Object.fromEntries(Object.entries(data).map(([key, value]) => [
        key,
        transport.serializeFn(value, { level: depth - 1, seen })
      ]));
    }
  });
  function transport(message) {
    if (!window.__electronLog) {
      logger.processMessage({
        data: ["electron-log: logger isn't initialized in the main process"],
        level: "error"
      }, { transports: ["console"] });
      return;
    }
    try {
      __electronLog.sendToMain(transport.serializeFn(message, {
        depth: transport.depth
      }));
    } catch (e) {
      logger.transports.console({
        data: ["electronLog.transports.ipc", e, "data:", message.data],
        level: "error"
      });
    }
  }
}
(function(module) {
  const Logger2 = Logger_1;
  const RendererErrorHandler2 = RendererErrorHandler_1;
  const transportConsole = console_1;
  const transportIpc = ipc;
  module.exports = createLogger();
  module.exports.Logger = Logger2;
  module.exports.default = module.exports;
  function createLogger() {
    const logger = new Logger2({
      allowUnknownLevel: true,
      errorHandler: new RendererErrorHandler2(),
      initializeFn: () => {
      },
      logId: "default",
      transportFactories: {
        console: transportConsole,
        ipc: transportIpc
      },
      variables: {
        processType: "renderer"
      }
    });
    logger.errorHandler.setOptions({
      logFn({ error, errorName, showDialog }) {
        logger.transports.console({
          data: [errorName, error].filter(Boolean),
          level: "error"
        });
        logger.transports.ipc({
          cmd: "errorHandler",
          error: {
            cause: error == null ? void 0 : error.cause,
            code: error == null ? void 0 : error.code,
            name: error == null ? void 0 : error.name,
            message: error == null ? void 0 : error.message,
            stack: error == null ? void 0 : error.stack
          },
          errorName,
          logId: logger.logId,
          showDialog
        });
      }
    });
    if (typeof window === "object") {
      window.addEventListener("message", (event) => {
        const _a = event.data || {}, { cmd, logId } = _a, message = __objRest(_a, ["cmd", "logId"]);
        const instance = Logger2.getInstance({ logId });
        if (cmd === "message") {
          instance.processMessage(message, { transports: ["console"] });
        }
      });
    }
    return new Proxy(logger, {
      get(target, prop) {
        if (typeof target[prop] !== "undefined") {
          return target[prop];
        }
        return (...data) => logger.logData(data, { level: prop });
      }
    });
  }
})(renderer);
var log = renderer.exports;
if (!electronIsDev) {
  log.transports.file.level = "verbose";
}
process.on("unhandledRejection", log.error);
function startAutoUpdater() {
  if (require("electron-squirrel-startup")) {
    require$$0.app.quit();
  }
  if (!electronIsDev) {
    const server = "https://refi-updater.vercel.app";
    const feed = `${server}/update/${process.platform}/${require$$0.app.getVersion()}`;
    require$$0.autoUpdater.setFeedURL({ url: feed, serverType: "json" });
    setInterval(() => {
      require$$0.autoUpdater.checkForUpdates();
    }, 6e4);
    require$$0.autoUpdater.on("update-downloaded", (_, releaseNotes, releaseName) => {
      log.debug("Downloaded new update");
      const dialogOpts = {
        type: "info",
        buttons: ["Restart", "Later"],
        title: "Application Update",
        message: process.platform === "win32" ? releaseNotes : releaseName,
        detail: "A new version has been downloaded. Restart the application to apply the updates."
      };
      require$$0.dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0)
          require$$0.autoUpdater.quitAndInstall();
      });
    });
    require$$0.autoUpdater.on("error", (message) => {
      log.error("There was a problem updating the application");
      log.error(message);
    });
  }
}
function startIPC() {
  require$$0.ipcMain.on("message", (event, message) => {
    console.log(message);
    setTimeout(() => event.sender.send("message", "hi from electron"), 500);
  });
}
async function startAppServer() {
  console.log("start server sd");
  const app2 = express__default["default"]();
  const port = 3333;
  app2.use(express__default["default"].json());
  app2.get("/", (req, res) => {
    res.send("Hello, Express + TypeScript! asdf");
  });
  app2.post("/api/data", (req, res) => {
    const { data } = req.body;
    res.json({ message: `Received data: ${data}` });
  });
  app2.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}
const rendererPath = path__default["default"].join(__dirname, "../renderer");
console.log("started:", rendererPath);
require$$0.app.disableHardwareAcceleration();
require$$0.app.on("ready", async () => {
  await startAppServer();
  await createMainWindow();
  startIPC();
  startAutoUpdater();
});
require$$0.app.on("window-all-closed", require$$0.app.quit);
require$$0.app.on("activate", restoreOrCreateWindow);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9lbGVjdHJvbi1pcy1kZXZAMS4yLjAvbm9kZV9tb2R1bGVzL2VsZWN0cm9uLWlzLWRldi9pbmRleC5qcyIsIi4uL3NyYy91dGlscy50cyIsIi4uL3NyYy93aW5kb3dzLW1hbmFnZXIudHMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZWxlY3Ryb24tbG9nQDUuMC4xL25vZGVfbW9kdWxlcy9lbGVjdHJvbi1sb2cvc3JjL2NvcmUvc2NvcGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZWxlY3Ryb24tbG9nQDUuMC4xL25vZGVfbW9kdWxlcy9lbGVjdHJvbi1sb2cvc3JjL2NvcmUvTG9nZ2VyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2VsZWN0cm9uLWxvZ0A1LjAuMS9ub2RlX21vZHVsZXMvZWxlY3Ryb24tbG9nL3NyYy9yZW5kZXJlci9saWIvUmVuZGVyZXJFcnJvckhhbmRsZXIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZWxlY3Ryb24tbG9nQDUuMC4xL25vZGVfbW9kdWxlcy9lbGVjdHJvbi1sb2cvc3JjL3JlbmRlcmVyL2xpYi90cmFuc3BvcnRzL2NvbnNvbGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZWxlY3Ryb24tbG9nQDUuMC4xL25vZGVfbW9kdWxlcy9lbGVjdHJvbi1sb2cvc3JjL3JlbmRlcmVyL2xpYi90cmFuc3BvcnRzL2lwYy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9lbGVjdHJvbi1sb2dANS4wLjEvbm9kZV9tb2R1bGVzL2VsZWN0cm9uLWxvZy9zcmMvcmVuZGVyZXIvaW5kZXguanMiLCIuLi9zcmMvcHJlbGF1bmNoLnRzIiwiLi4vc3JjL2F1dG8tdXBkYXRlLnRzIiwiLi4vc3JjL2lwYy50cyIsIi4uLy4uLy4uLy4uL25vZGUvc3JjL2FwcC50cyIsIi4uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5jb25zdCBlbGVjdHJvbiA9IHJlcXVpcmUoJ2VsZWN0cm9uJyk7XG5cbmlmICh0eXBlb2YgZWxlY3Ryb24gPT09ICdzdHJpbmcnKSB7XG5cdHRocm93IG5ldyBUeXBlRXJyb3IoJ05vdCBydW5uaW5nIGluIGFuIEVsZWN0cm9uIGVudmlyb25tZW50IScpO1xufVxuXG5jb25zdCBhcHAgPSBlbGVjdHJvbi5hcHAgfHwgZWxlY3Ryb24ucmVtb3RlLmFwcDtcblxuY29uc3QgaXNFbnZTZXQgPSAnRUxFQ1RST05fSVNfREVWJyBpbiBwcm9jZXNzLmVudjtcbmNvbnN0IGdldEZyb21FbnYgPSBwYXJzZUludChwcm9jZXNzLmVudi5FTEVDVFJPTl9JU19ERVYsIDEwKSA9PT0gMTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc0VudlNldCA/IGdldEZyb21FbnYgOiAhYXBwLmlzUGFja2FnZWQ7XG4iLCJjb25zdCBpc01hY09TID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2Rhcndpbic7XG5pbXBvcnQgaXNEZXYgZnJvbSAnZWxlY3Ryb24taXMtZGV2J1xuZXhwb3J0IHtcbiAgICBpc01hY09TLFxuICAgIGlzRGV2XG59XG5pbXBvcnQgY3J5cHRvIGZyb20gXCJjcnlwdG9cIjtcbmV4cG9ydCBmdW5jdGlvbiB1dWlkKCkge1xuICAgIHJldHVybiBjcnlwdG8ucmFuZG9tVVVJRCgpO1xufSIsImltcG9ydCB7IEJyb3dzZXJWaWV3LCBCcm93c2VyV2luZG93IH0gZnJvbSBcImVsZWN0cm9uXCI7XG5pbXBvcnQgaXNEZXYgZnJvbSBcImVsZWN0cm9uLWlzLWRldlwiO1xuXG5pbXBvcnQgeyBpc01hY09TLCB1dWlkIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBmb3JtYXQgfSBmcm9tIFwidXJsXCI7XG5cbi8vIHR5cGUgZGVmaW5lXG5leHBvcnQgaW50ZXJmYWNlIElXaW5kb3dJbnN0YW5jZSB7XG4gIHdpbmRvdzogQnJvd3NlclZpZXc7XG4gIG5hbWU6IHN0cmluZztcbn1cbmV4cG9ydCBpbnRlcmZhY2UgVGFiTGlzdCB7XG4gIHRhYnM6IHN0cmluZ1tdO1xuICBhY3RpdmU6IHN0cmluZztcbn1cblxuLy8gZ29sYmFsIGRhdGFcbmxldCBsaXN0V2luZG93OiBJV2luZG93SW5zdGFuY2VbXSA9IFtdO1xubGV0IG1haW5XaW5kb3c6IEJyb3dzZXJXaW5kb3c7XG5jb25zdCBkZWZhdWx0V2luZG93VXJsID0gaXNEZXZcbiAgPyAnaHR0cDovL2xvY2FsaG9zdDozMDAwJ1xuICA6IGZvcm1hdCh7XG4gICAgcGF0aG5hbWU6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9yZW5kZXJlci9vdXQvaW5kZXguaHRtbCcpLFxuICAgIHByb3RvY29sOiAnZmlsZTonLFxuICAgIHNsYXNoZXM6IHRydWUsXG4gIH0pO1xuXG5jb25zdCBwcmVsb2FkX2pzX3BhdGggPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uLy4uL3ByZWxvYWQvZGlzdC9cIiwgXCJpbmRleC5qc1wiKTtcbi8qKlxuICogY3JlYXRlIG1haW4gd2luZG93IHRvIG1hbmFnZXIgdGFiIHdpbmRvd3NcbiAqIGh0dHBzOi8vd3d3LmVsZWN0cm9uanMub3JnL2RvY3MvbGF0ZXN0L2FwaS9icm93c2VyLXZpZXdcbiAqIEByZXR1cm5zIFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlTWFpbldpbmRvdygpIHtcbiAgaWYgKG1haW5XaW5kb3cpIHtcbiAgICByZXR1cm4gbWFpbldpbmRvdztcbiAgfVxuICBjb25zdCB3aW5kb3cgPSBuZXcgQnJvd3NlcldpbmRvdyh7XG4gICAgc2hvdzogZmFsc2UsXG4gICAgd2lkdGg6IDgwMCxcbiAgICBoZWlnaHQ6IDYwMCxcbiAgICBiYWNrZ3JvdW5kQ29sb3I6IGlzTWFjT1MgPyBcIiNEMUQ1REJcIiA6IFwiIzZCNzI4MFwiLFxuICAgIHRpdGxlQmFyU3R5bGU6IGlzTWFjT1MgPyAnaGlkZGVuSW5zZXQnIDogJ2RlZmF1bHQnLFxuICAgIGZyYW1lOiBpc01hY09TLFxuICAgIHdlYlByZWZlcmVuY2VzOiB7XG4gICAgICBkZXZUb29sczogaXNEZXYsXG4gICAgICAvLyBlbmFibGVSZW1vdGVNb2R1bGU6IGZhbHNlLFxuICAgICAgY29udGV4dElzb2xhdGlvbjogdHJ1ZSxcbiAgICAgIG5vZGVJbnRlZ3JhdGlvbjogZmFsc2UsXG4gICAgICBwcmVsb2FkOiBwcmVsb2FkX2pzX3BhdGgsXG4gICAgICBkaXNhYmxlRGlhbG9nczogZmFsc2UsXG4gICAgICBzYWZlRGlhbG9nczogdHJ1ZSxcbiAgICAgIGVuYWJsZVdlYlNRTDogZmFsc2UsXG4gICAgfSxcbiAgfSk7XG5cbiAgbWFpbldpbmRvdyA9IHdpbmRvdztcblxuICBpZiAoaXNEZXYpIHtcbiAgICBtYWluV2luZG93LndlYkNvbnRlbnRzLm9wZW5EZXZUb29scyh7IG1vZGU6ICdkZXRhY2gnIH0pXG4gIH1cblxuICB3aW5kb3cub24oJ2Nsb3NlZCcsICgpID0+IHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgbWFpbldpbmRvdyA9IG51bGw7XG4gICAgbGlzdFdpbmRvdy5mb3JFYWNoKGluc3RhbmNlID0+IHtcbiAgICAgIChpbnN0YW5jZS53aW5kb3cud2ViQ29udGVudHMgYXMgYW55KT8uZGVzdHJveSgpIC8vIFRPRE86IGVsZWN0cm9uIGhhdmVuJ3QgbWFrZSBkb2N1bWVudCBmb3IgaXQuIFJlZjogaHR0cHM6Ly9naXRodWIuY29tL2VsZWN0cm9uL2VsZWN0cm9uL2lzc3Vlcy8yNjkyOVxuICAgIH0pO1xuICAgIGxpc3RXaW5kb3cgPSBbXTtcbiAgfSlcblxuICBpZiAoaXNEZXYpIHtcbiAgICB3aW5kb3cubG9hZFVSTChgJHtkZWZhdWx0V2luZG93VXJsfS90YWJzYCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gVE9ETzogV2hhdCBpZiBJIG5lZWQgdG8gbG9hZCB0aGUgdGFicy5odG1sIGZpbGVcbiAgICB3aW5kb3cubG9hZFVSTChcImFwcDovLy0vdGFic1wiKTtcbiAgfVxuXG4gIC8vIHdpbmRvdy5tYXhpbWl6ZSgpO1xuICB3aW5kb3cuc2hvdygpO1xuXG4gIGNvbnN0IHdpbmRvd1ZpZXcgPSBhd2FpdCBjcmVhdGVXaW5kb3coZGVmYXVsdFdpbmRvd1VybCtcIi9hcHBcIik7XG4gIHNldFRhYih3aW5kb3dWaWV3KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVdpbmRvdyhocmVmOiBzdHJpbmcpIHtcbiAgLy8gQ3JlYXRlIHRoZSBicm93c2VyIHZpZXcuXG4gIGNvbnN0IHdpbmRvdyA9IG5ldyBCcm93c2VyVmlldyh7XG4gICAgd2ViUHJlZmVyZW5jZXM6IHtcbiAgICAgIGRldlRvb2xzOiBpc0RldixcbiAgICAgIGNvbnRleHRJc29sYXRpb246IHRydWUsXG4gICAgICBub2RlSW50ZWdyYXRpb246IGZhbHNlLFxuICAgICAgcHJlbG9hZDogcHJlbG9hZF9qc19wYXRoLFxuICAgICAgZGlzYWJsZURpYWxvZ3M6IGZhbHNlLFxuICAgICAgc2FmZURpYWxvZ3M6IHRydWUsXG4gICAgICBlbmFibGVXZWJTUUw6IGZhbHNlLFxuICAgIH0sXG4gIH0pO1xuXG4gIHdpbmRvdy53ZWJDb250ZW50cy5sb2FkVVJMKGhyZWYpO1xuXG4gIGlmIChpc0Rldikge1xuICAgIHdpbmRvdy53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMoeyBtb2RlOiAnZGV0YWNoJyB9KVxuICB9XG5cbiAgd2luZG93LndlYkNvbnRlbnRzLm9uKFwiZGlkLWZpbmlzaC1sb2FkXCIsICgpID0+IHtcbiAgICAvLyB3aW5kb3cud2ViQ29udGVudHMuc2VuZChcInNldC1zb2NrZXRcIiwge30pO1xuICB9KTtcblxuICBsaXN0V2luZG93LnB1c2goe1xuICAgIHdpbmRvdyxcbiAgICBuYW1lOiBgVGFiLSR7dXVpZCgpfWBcbiAgfSk7XG5cbiAgbWFpbldpbmRvdyEud2ViQ29udGVudHMuc2VuZCgndGFiQ2hhbmdlJywgZ2V0VGFiRGF0YSgpKTtcbiAgcmV0dXJuIHdpbmRvdztcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUYWJEYXRhKCk6IFRhYkxpc3R7XG4gIHJldHVybiB7XG4gICAgdGFiczogbGlzdFdpbmRvdy5tYXAoKGluc3RhbmNlKSA9PiBpbnN0YW5jZS5uYW1lKSxcbiAgICBhY3RpdmU6IGxpc3RXaW5kb3cuZmluZCgoaW5zdGFuY2UpID0+IGluc3RhbmNlLndpbmRvdy53ZWJDb250ZW50cy5pZCA9PT0gbWFpbldpbmRvdyEuZ2V0QnJvd3NlclZpZXcoKT8ud2ViQ29udGVudHM/LmlkKT8ubmFtZSB8fCAnJ1xuICB9XG59XG5cbi8vIFNldCBhY3RpdmUgdGFiXG5leHBvcnQgZnVuY3Rpb24gc2V0VGFiKGluc3RhbmNlOiBCcm93c2VyVmlldykge1xuICBtYWluV2luZG93IS5zZXRCcm93c2VyVmlldyhpbnN0YW5jZSk7XG4gIGluc3RhbmNlLnNldEJvdW5kcyh7IHg6IDAsIHk6IDM2LCB3aWR0aDogbWFpbldpbmRvdyEuZ2V0Qm91bmRzKCkud2lkdGgsIGhlaWdodDogbWFpbldpbmRvdyEuZ2V0Qm91bmRzKCkuaGVpZ2h0IC0gMzYgfSlcbiAgaW5zdGFuY2Uuc2V0QXV0b1Jlc2l6ZSh7IHdpZHRoOiB0cnVlLCBoZWlnaHQ6IHRydWUsIGhvcml6b250YWw6IGZhbHNlLCB2ZXJ0aWNhbDogZmFsc2UgfSk7XG4gIG1haW5XaW5kb3chLndlYkNvbnRlbnRzLnNlbmQoJ3RhYkNoYW5nZScsIGdldFRhYkRhdGEoKSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBuZXdUYWIoKXtcbiAgY29uc3Qgd2luZG93ID0gYXdhaXQgY3JlYXRlV2luZG93KG1haW5XaW5kb3cuZ2V0QnJvd3NlclZpZXcoKT8ud2ViQ29udGVudHMuZ2V0VVJMKCkhKTtcbiAgc2V0VGFiKHdpbmRvdyk7XG59XG5cbi8qKlxuICogUmVzdG9yZSBleGlzdGluZyBCcm93c2VyV2luZG93IG9yIENyZWF0ZSBuZXcgQnJvd3NlcldpbmRvd1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzdG9yZU9yQ3JlYXRlV2luZG93KCkge1xuICBsZXQgd2luZG93ID0gbWFpbldpbmRvdztcblxuICBpZiAod2luZG93ID09PSB1bmRlZmluZWQpIHtcbiAgICBhd2FpdCBjcmVhdGVNYWluV2luZG93KCk7XG4gICAgd2luZG93ID0gbWFpbldpbmRvdztcbiAgfVxuXG4gIGlmICh3aW5kb3cuaXNNaW5pbWl6ZWQoKSkge1xuICAgIHdpbmRvdy5yZXN0b3JlKCk7XG4gIH1cblxuICB3aW5kb3cuZm9jdXMoKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBzY29wZUZhY3Rvcnk7XG5cbmZ1bmN0aW9uIHNjb3BlRmFjdG9yeShsb2dnZXIpIHtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHNjb3BlLCB7XG4gICAgZGVmYXVsdExhYmVsOiB7IHZhbHVlOiAnJywgd3JpdGFibGU6IHRydWUgfSxcbiAgICBsYWJlbFBhZGRpbmc6IHsgdmFsdWU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0sXG4gICAgbWF4TGFiZWxMZW5ndGg6IHsgdmFsdWU6IDAsIHdyaXRhYmxlOiB0cnVlIH0sXG4gICAgbGFiZWxMZW5ndGg6IHtcbiAgICAgIGdldCgpIHtcbiAgICAgICAgc3dpdGNoICh0eXBlb2Ygc2NvcGUubGFiZWxQYWRkaW5nKSB7XG4gICAgICAgICAgY2FzZSAnYm9vbGVhbic6IHJldHVybiBzY29wZS5sYWJlbFBhZGRpbmcgPyBzY29wZS5tYXhMYWJlbExlbmd0aCA6IDA7XG4gICAgICAgICAgY2FzZSAnbnVtYmVyJzogcmV0dXJuIHNjb3BlLmxhYmVsUGFkZGluZztcbiAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICBmdW5jdGlvbiBzY29wZShsYWJlbCkge1xuICAgIHNjb3BlLm1heExhYmVsTGVuZ3RoID0gTWF0aC5tYXgoc2NvcGUubWF4TGFiZWxMZW5ndGgsIGxhYmVsLmxlbmd0aCk7XG5cbiAgICBjb25zdCBuZXdTY29wZSA9IHt9O1xuICAgIGZvciAoY29uc3QgbGV2ZWwgb2YgWy4uLmxvZ2dlci5sZXZlbHMsICdsb2cnXSkge1xuICAgICAgbmV3U2NvcGVbbGV2ZWxdID0gKC4uLmQpID0+IGxvZ2dlci5sb2dEYXRhKGQsIHsgbGV2ZWwsIHNjb3BlOiBsYWJlbCB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld1Njb3BlO1xuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHNjb3BlRmFjdG9yeSA9IHJlcXVpcmUoJy4vc2NvcGUnKTtcblxuLyoqXG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBlcnJvclxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gd2FyblxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gaW5mb1xuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gdmVyYm9zZVxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gZGVidWdcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IHNpbGx5XG4gKi9cbmNsYXNzIExvZ2dlciB7XG4gIHN0YXRpYyBpbnN0YW5jZXMgPSB7fTtcblxuICBlcnJvckhhbmRsZXIgPSBudWxsO1xuICBldmVudExvZ2dlciA9IG51bGw7XG4gIGZ1bmN0aW9ucyA9IHt9O1xuICBob29rcyA9IFtdO1xuICBpc0RldiA9IGZhbHNlO1xuICBsZXZlbHMgPSBudWxsO1xuICBsb2dJZCA9IG51bGw7XG4gIHNjb3BlID0gbnVsbDtcbiAgdHJhbnNwb3J0cyA9IHt9O1xuICB2YXJpYWJsZXMgPSB7fTtcblxuICBjb25zdHJ1Y3Rvcih7XG4gICAgYWxsb3dVbmtub3duTGV2ZWwgPSBmYWxzZSxcbiAgICBlcnJvckhhbmRsZXIsXG4gICAgZXZlbnRMb2dnZXIsXG4gICAgaW5pdGlhbGl6ZUZuLFxuICAgIGlzRGV2ID0gZmFsc2UsXG4gICAgbGV2ZWxzID0gWydlcnJvcicsICd3YXJuJywgJ2luZm8nLCAndmVyYm9zZScsICdkZWJ1ZycsICdzaWxseSddLFxuICAgIGxvZ0lkLFxuICAgIHRyYW5zcG9ydEZhY3RvcmllcyA9IHt9LFxuICAgIHZhcmlhYmxlcyxcbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5hZGRMZXZlbCA9IHRoaXMuYWRkTGV2ZWwuYmluZCh0aGlzKTtcbiAgICB0aGlzLmNyZWF0ZSA9IHRoaXMuY3JlYXRlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5sb2dEYXRhID0gdGhpcy5sb2dEYXRhLmJpbmQodGhpcyk7XG4gICAgdGhpcy5wcm9jZXNzTWVzc2FnZSA9IHRoaXMucHJvY2Vzc01lc3NhZ2UuYmluZCh0aGlzKTtcblxuICAgIHRoaXMuYWxsb3dVbmtub3duTGV2ZWwgPSBhbGxvd1Vua25vd25MZXZlbDtcbiAgICB0aGlzLmluaXRpYWxpemVGbiA9IGluaXRpYWxpemVGbjtcbiAgICB0aGlzLmlzRGV2ID0gaXNEZXY7XG4gICAgdGhpcy5sZXZlbHMgPSBsZXZlbHM7XG4gICAgdGhpcy5sb2dJZCA9IGxvZ0lkO1xuICAgIHRoaXMudHJhbnNwb3J0RmFjdG9yaWVzID0gdHJhbnNwb3J0RmFjdG9yaWVzO1xuICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzIHx8IHt9O1xuICAgIHRoaXMuc2NvcGUgPSBzY29wZUZhY3RvcnkodGhpcyk7XG5cbiAgICB0aGlzLmFkZExldmVsKCdsb2cnLCBmYWxzZSk7XG4gICAgZm9yIChjb25zdCBuYW1lIG9mIHRoaXMubGV2ZWxzKSB7XG4gICAgICB0aGlzLmFkZExldmVsKG5hbWUsIGZhbHNlKTtcbiAgICB9XG5cbiAgICB0aGlzLmVycm9ySGFuZGxlciA9IGVycm9ySGFuZGxlcjtcbiAgICBlcnJvckhhbmRsZXI/LnNldE9wdGlvbnMoeyBsb2dGbjogdGhpcy5lcnJvciB9KTtcblxuICAgIHRoaXMuZXZlbnRMb2dnZXIgPSBldmVudExvZ2dlcjtcbiAgICBldmVudExvZ2dlcj8uc2V0T3B0aW9ucyh7IGxvZ2dlcjogdGhpcyB9KTtcblxuICAgIGZvciAoY29uc3QgW25hbWUsIGZhY3RvcnldIG9mIE9iamVjdC5lbnRyaWVzKHRyYW5zcG9ydEZhY3RvcmllcykpIHtcbiAgICAgIHRoaXMudHJhbnNwb3J0c1tuYW1lXSA9IGZhY3RvcnkodGhpcyk7XG4gICAgfVxuXG4gICAgTG9nZ2VyLmluc3RhbmNlc1tsb2dJZF0gPSB0aGlzO1xuICB9XG5cbiAgc3RhdGljIGdldEluc3RhbmNlKHsgbG9nSWQgfSkge1xuICAgIHJldHVybiB0aGlzLmluc3RhbmNlc1tsb2dJZF0gfHwgdGhpcy5pbnN0YW5jZXMuZGVmYXVsdDtcbiAgfVxuXG4gIGFkZExldmVsKGxldmVsLCBpbmRleCA9IHRoaXMubGV2ZWxzLmxlbmd0aCkge1xuICAgIGlmIChpbmRleCAhPT0gZmFsc2UpIHtcbiAgICAgIHRoaXMubGV2ZWxzLnNwbGljZShpbmRleCwgMCwgbGV2ZWwpO1xuICAgIH1cblxuICAgIHRoaXNbbGV2ZWxdID0gKC4uLmFyZ3MpID0+IHRoaXMubG9nRGF0YShhcmdzLCB7IGxldmVsIH0pO1xuICAgIHRoaXMuZnVuY3Rpb25zW2xldmVsXSA9IHRoaXNbbGV2ZWxdO1xuICB9XG5cbiAgY2F0Y2hFcnJvcnMob3B0aW9ucykge1xuICAgIHRoaXMucHJvY2Vzc01lc3NhZ2UoXG4gICAgICB7XG4gICAgICAgIGRhdGE6IFsnbG9nLmNhdGNoRXJyb3JzIGlzIGRlcHJlY2F0ZWQuIFVzZSBsb2cuZXJyb3JIYW5kbGVyIGluc3RlYWQnXSxcbiAgICAgICAgbGV2ZWw6ICd3YXJuJyxcbiAgICAgIH0sXG4gICAgICB7IHRyYW5zcG9ydHM6IFsnY29uc29sZSddIH0sXG4gICAgKTtcbiAgICByZXR1cm4gdGhpcy5lcnJvckhhbmRsZXIuc3RhcnRDYXRjaGluZyhvcHRpb25zKTtcbiAgfVxuXG4gIGNyZWF0ZShvcHRpb25zKSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xuICAgICAgb3B0aW9ucyA9IHsgbG9nSWQ6IG9wdGlvbnMgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IExvZ2dlcih7XG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgZXJyb3JIYW5kbGVyOiB0aGlzLmVycm9ySGFuZGxlcixcbiAgICAgIGluaXRpYWxpemVGbjogdGhpcy5pbml0aWFsaXplRm4sXG4gICAgICBpc0RldjogdGhpcy5pc0RldixcbiAgICAgIHRyYW5zcG9ydEZhY3RvcmllczogdGhpcy50cmFuc3BvcnRGYWN0b3JpZXMsXG4gICAgICB2YXJpYWJsZXM6IHsgLi4udGhpcy52YXJpYWJsZXMgfSxcbiAgICB9KTtcbiAgfVxuXG4gIGNvbXBhcmVMZXZlbHMocGFzc0xldmVsLCBjaGVja0xldmVsLCBsZXZlbHMgPSB0aGlzLmxldmVscykge1xuICAgIGNvbnN0IHBhc3MgPSBsZXZlbHMuaW5kZXhPZihwYXNzTGV2ZWwpO1xuICAgIGNvbnN0IGNoZWNrID0gbGV2ZWxzLmluZGV4T2YoY2hlY2tMZXZlbCk7XG4gICAgaWYgKGNoZWNrID09PSAtMSB8fCBwYXNzID09PSAtMSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoZWNrIDw9IHBhc3M7XG4gIH1cblxuICBpbml0aWFsaXplKHsgcHJlbG9hZCA9IHRydWUsIHNweVJlbmRlcmVyQ29uc29sZSA9IGZhbHNlIH0gPSB7fSkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZUZuKHsgbG9nZ2VyOiB0aGlzLCBwcmVsb2FkLCBzcHlSZW5kZXJlckNvbnNvbGUgfSk7XG4gIH1cblxuICBsb2dEYXRhKGRhdGEsIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMucHJvY2Vzc01lc3NhZ2UoeyBkYXRhLCAuLi5vcHRpb25zIH0pO1xuICB9XG5cbiAgcHJvY2Vzc01lc3NhZ2UobWVzc2FnZSwgeyB0cmFuc3BvcnRzID0gdGhpcy50cmFuc3BvcnRzIH0gPSB7fSkge1xuICAgIGlmIChtZXNzYWdlLmNtZCA9PT0gJ2Vycm9ySGFuZGxlcicpIHtcbiAgICAgIHRoaXMuZXJyb3JIYW5kbGVyLmhhbmRsZShtZXNzYWdlLmVycm9yLCB7XG4gICAgICAgIGVycm9yTmFtZTogbWVzc2FnZS5lcnJvck5hbWUsXG4gICAgICAgIHByb2Nlc3NUeXBlOiAncmVuZGVyZXInLFxuICAgICAgICBzaG93RGlhbG9nOiBCb29sZWFuKG1lc3NhZ2Uuc2hvd0RpYWxvZyksXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbGV2ZWwgPSBtZXNzYWdlLmxldmVsO1xuICAgIGlmICghdGhpcy5hbGxvd1Vua25vd25MZXZlbCkge1xuICAgICAgbGV2ZWwgPSB0aGlzLmxldmVscy5pbmNsdWRlcyhtZXNzYWdlLmxldmVsKSA/IG1lc3NhZ2UubGV2ZWwgOiAnaW5mbyc7XG4gICAgfVxuXG4gICAgY29uc3Qgbm9ybWFsaXplZE1lc3NhZ2UgPSB7XG4gICAgICBkYXRlOiBuZXcgRGF0ZSgpLFxuICAgICAgLi4ubWVzc2FnZSxcbiAgICAgIGxldmVsLFxuICAgICAgdmFyaWFibGVzOiB7XG4gICAgICAgIC4uLnRoaXMudmFyaWFibGVzLFxuICAgICAgICAuLi5tZXNzYWdlLnZhcmlhYmxlcyxcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIGZvciAoY29uc3QgW3RyYW5zTmFtZSwgdHJhbnNGbl0gb2YgdGhpcy50cmFuc3BvcnRFbnRyaWVzKHRyYW5zcG9ydHMpKSB7XG4gICAgICBpZiAodHlwZW9mIHRyYW5zRm4gIT09ICdmdW5jdGlvbicgfHwgdHJhbnNGbi5sZXZlbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5jb21wYXJlTGV2ZWxzKHRyYW5zRm4ubGV2ZWwsIG1lc3NhZ2UubGV2ZWwpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgYXJyb3ctYm9keS1zdHlsZVxuICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZE1zZyA9IHRoaXMuaG9va3MucmVkdWNlKChtc2csIGhvb2spID0+IHtcbiAgICAgICAgICByZXR1cm4gbXNnID8gaG9vayhtc2csIHRyYW5zRm4sIHRyYW5zTmFtZSkgOiBtc2c7XG4gICAgICAgIH0sIG5vcm1hbGl6ZWRNZXNzYWdlKTtcblxuICAgICAgICBpZiAodHJhbnNmb3JtZWRNc2cpIHtcbiAgICAgICAgICB0cmFuc0ZuKHsgLi4udHJhbnNmb3JtZWRNc2csIGRhdGE6IFsuLi50cmFuc2Zvcm1lZE1zZy5kYXRhXSB9KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLnByb2Nlc3NJbnRlcm5hbEVycm9yRm4oZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJvY2Vzc0ludGVybmFsRXJyb3JGbihfZSkge1xuICAgIC8vIERvIG5vdGhpbmcgYnkgZGVmYXVsdFxuICB9XG5cbiAgdHJhbnNwb3J0RW50cmllcyh0cmFuc3BvcnRzID0gdGhpcy50cmFuc3BvcnRzKSB7XG4gICAgY29uc3QgdHJhbnNwb3J0QXJyYXkgPSBBcnJheS5pc0FycmF5KHRyYW5zcG9ydHMpXG4gICAgICA/IHRyYW5zcG9ydHNcbiAgICAgIDogT2JqZWN0LmVudHJpZXModHJhbnNwb3J0cyk7XG5cbiAgICByZXR1cm4gdHJhbnNwb3J0QXJyYXlcbiAgICAgIC5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgc3dpdGNoICh0eXBlb2YgaXRlbSkge1xuICAgICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy50cmFuc3BvcnRzW2l0ZW1dID8gW2l0ZW0sIHRoaXMudHJhbnNwb3J0c1tpdGVtXV0gOiBudWxsO1xuICAgICAgICAgIGNhc2UgJ2Z1bmN0aW9uJzpcbiAgICAgICAgICAgIHJldHVybiBbaXRlbS5uYW1lLCBpdGVtXTtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoaXRlbSkgPyBpdGVtIDogbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5maWx0ZXIoQm9vbGVhbik7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMb2dnZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG5jb25zdCBjb25zb2xlRXJyb3IgPSBjb25zb2xlLmVycm9yO1xuXG5jbGFzcyBSZW5kZXJlckVycm9ySGFuZGxlciB7XG4gIGxvZ0ZuID0gbnVsbDtcbiAgb25FcnJvciA9IG51bGw7XG4gIHNob3dEaWFsb2cgPSBmYWxzZTtcbiAgcHJldmVudERlZmF1bHQgPSB0cnVlO1xuXG4gIGNvbnN0cnVjdG9yKHsgbG9nRm4gPSBudWxsIH0gPSB7fSkge1xuICAgIHRoaXMuaGFuZGxlRXJyb3IgPSB0aGlzLmhhbmRsZUVycm9yLmJpbmQodGhpcyk7XG4gICAgdGhpcy5oYW5kbGVSZWplY3Rpb24gPSB0aGlzLmhhbmRsZVJlamVjdGlvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc3RhcnRDYXRjaGluZyA9IHRoaXMuc3RhcnRDYXRjaGluZy5iaW5kKHRoaXMpO1xuICAgIHRoaXMubG9nRm4gPSBsb2dGbjtcbiAgfVxuXG4gIGhhbmRsZShlcnJvciwge1xuICAgIGxvZ0ZuID0gdGhpcy5sb2dGbixcbiAgICBlcnJvck5hbWUgPSAnJyxcbiAgICBvbkVycm9yID0gdGhpcy5vbkVycm9yLFxuICAgIHNob3dEaWFsb2cgPSB0aGlzLnNob3dEaWFsb2csXG4gIH0gPSB7fSkge1xuICAgIHRyeSB7XG4gICAgICBpZiAob25FcnJvcj8uKHsgZXJyb3IsIGVycm9yTmFtZSwgcHJvY2Vzc1R5cGU6ICdyZW5kZXJlcicgfSkgIT09IGZhbHNlKSB7XG4gICAgICAgIGxvZ0ZuKHsgZXJyb3IsIGVycm9yTmFtZSwgc2hvd0RpYWxvZyB9KTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIGNvbnNvbGVFcnJvcihlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgc2V0T3B0aW9ucyh7IGxvZ0ZuLCBvbkVycm9yLCBwcmV2ZW50RGVmYXVsdCwgc2hvd0RpYWxvZyB9KSB7XG4gICAgaWYgKHR5cGVvZiBsb2dGbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5sb2dGbiA9IGxvZ0ZuO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2Ygb25FcnJvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5vbkVycm9yID0gb25FcnJvcjtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHByZXZlbnREZWZhdWx0ID09PSAnYm9vbGVhbicpIHtcbiAgICAgIHRoaXMucHJldmVudERlZmF1bHQgPSBwcmV2ZW50RGVmYXVsdDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHNob3dEaWFsb2cgPT09ICdib29sZWFuJykge1xuICAgICAgdGhpcy5zaG93RGlhbG9nID0gc2hvd0RpYWxvZztcbiAgICB9XG4gIH1cblxuICBzdGFydENhdGNoaW5nKHsgb25FcnJvciwgc2hvd0RpYWxvZyB9ID0ge30pIHtcbiAgICBpZiAodGhpcy5pc0FjdGl2ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuaXNBY3RpdmUgPSB0cnVlO1xuICAgIHRoaXMuc2V0T3B0aW9ucyh7IG9uRXJyb3IsIHNob3dEaWFsb2cgfSk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCAoZXZlbnQpID0+IHtcbiAgICAgIHRoaXMucHJldmVudERlZmF1bHQgJiYgZXZlbnQucHJldmVudERlZmF1bHQ/LigpO1xuICAgICAgdGhpcy5oYW5kbGVFcnJvcihldmVudC5lcnJvciB8fCBldmVudCk7XG4gICAgfSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3VuaGFuZGxlZHJlamVjdGlvbicsIChldmVudCkgPT4ge1xuICAgICAgdGhpcy5wcmV2ZW50RGVmYXVsdCAmJiBldmVudC5wcmV2ZW50RGVmYXVsdD8uKCk7XG4gICAgICB0aGlzLmhhbmRsZVJlamVjdGlvbihldmVudC5yZWFzb24gfHwgZXZlbnQpO1xuICAgIH0pO1xuICB9XG5cbiAgaGFuZGxlRXJyb3IoZXJyb3IpIHtcbiAgICB0aGlzLmhhbmRsZShlcnJvciwgeyBlcnJvck5hbWU6ICdVbmhhbmRsZWQnIH0pO1xuICB9XG5cbiAgaGFuZGxlUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGNvbnN0IGVycm9yID0gcmVhc29uIGluc3RhbmNlb2YgRXJyb3JcbiAgICAgID8gcmVhc29uXG4gICAgICA6IG5ldyBFcnJvcihKU09OLnN0cmluZ2lmeShyZWFzb24pKTtcbiAgICB0aGlzLmhhbmRsZShlcnJvciwgeyBlcnJvck5hbWU6ICdVbmhhbmRsZWQgcmVqZWN0aW9uJyB9KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlbmRlcmVyRXJyb3JIYW5kbGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5cbm1vZHVsZS5leHBvcnRzID0gY29uc29sZVRyYW5zcG9ydFJlbmRlcmVyRmFjdG9yeTtcblxuY29uc3QgY29uc29sZU1ldGhvZHMgPSB7XG4gIGVycm9yOiBjb25zb2xlLmVycm9yLFxuICB3YXJuOiBjb25zb2xlLndhcm4sXG4gIGluZm86IGNvbnNvbGUuaW5mbyxcbiAgdmVyYm9zZTogY29uc29sZS5pbmZvLFxuICBkZWJ1ZzogY29uc29sZS5kZWJ1ZyxcbiAgc2lsbHk6IGNvbnNvbGUuZGVidWcsXG4gIGxvZzogY29uc29sZS5sb2csXG59O1xuXG5mdW5jdGlvbiBjb25zb2xlVHJhbnNwb3J0UmVuZGVyZXJGYWN0b3J5KGxvZ2dlcikge1xuICByZXR1cm4gT2JqZWN0LmFzc2lnbih0cmFuc3BvcnQsIHtcbiAgICBmb3JtYXQ6ICd7aH06e2l9OntzfS57bXN9e3Njb3BlfSDigLoge3RleHR9JyxcblxuICAgIGZvcm1hdERhdGFGbih7XG4gICAgICBkYXRhID0gW10sXG4gICAgICBkYXRlID0gbmV3IERhdGUoKSxcbiAgICAgIGZvcm1hdCA9IHRyYW5zcG9ydC5mb3JtYXQsXG4gICAgICBsb2dJZCA9IGxvZ2dlci5sb2dJZCxcbiAgICAgIHNjb3BlID0gbG9nZ2VyLnNjb3BlTmFtZSxcbiAgICAgIC4uLm1lc3NhZ2VcbiAgICB9KSB7XG4gICAgICBpZiAodHlwZW9mIGZvcm1hdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gZm9ybWF0KHsgLi4ubWVzc2FnZSwgZGF0YSwgZGF0ZSwgbG9nSWQsIHNjb3BlIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGZvcm1hdCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICB9XG5cbiAgICAgIGRhdGEudW5zaGlmdChmb3JtYXQpO1xuXG4gICAgICAvLyBDb25jYXRlbmF0ZSBmaXJzdCB0d28gZGF0YSBpdGVtcyB0byBzdXBwb3J0IHByaW50Zi1saWtlIHRlbXBsYXRlc1xuICAgICAgaWYgKHR5cGVvZiBkYXRhWzFdID09PSAnc3RyaW5nJyAmJiBkYXRhWzFdLm1hdGNoKC8lWzFjZGZpT29zXS8pKSB7XG4gICAgICAgIGRhdGEgPSBbYCR7ZGF0YVswXX0gJHtkYXRhWzFdfWAsIC4uLmRhdGEuc2xpY2UoMildO1xuICAgICAgfVxuXG4gICAgICBkYXRhWzBdID0gZGF0YVswXVxuICAgICAgICAucmVwbGFjZSgvXFx7KFxcdyspfS9nLCAoc3Vic3RyaW5nLCBuYW1lKSA9PiB7XG4gICAgICAgICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICAgICAgICBjYXNlICdsZXZlbCc6IHJldHVybiBtZXNzYWdlLmxldmVsO1xuICAgICAgICAgICAgY2FzZSAnbG9nSWQnOiByZXR1cm4gbG9nSWQ7XG4gICAgICAgICAgICBjYXNlICdzY29wZSc6IHJldHVybiBzY29wZSA/IGAgKCR7c2NvcGV9KWAgOiAnJztcbiAgICAgICAgICAgIGNhc2UgJ3RleHQnOiByZXR1cm4gJyc7XG5cbiAgICAgICAgICAgIGNhc2UgJ3knOiByZXR1cm4gZGF0ZS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKDEwKTtcbiAgICAgICAgICAgIGNhc2UgJ20nOiByZXR1cm4gKGRhdGUuZ2V0TW9udGgoKSArIDEpLnRvU3RyaW5nKDEwKVxuICAgICAgICAgICAgICAucGFkU3RhcnQoMiwgJzAnKTtcbiAgICAgICAgICAgIGNhc2UgJ2QnOiByZXR1cm4gZGF0ZS5nZXREYXRlKCkudG9TdHJpbmcoMTApLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgICAgICAgICBjYXNlICdoJzogcmV0dXJuIGRhdGUuZ2V0SG91cnMoKS50b1N0cmluZygxMCkucGFkU3RhcnQoMiwgJzAnKTtcbiAgICAgICAgICAgIGNhc2UgJ2knOiByZXR1cm4gZGF0ZS5nZXRNaW51dGVzKCkudG9TdHJpbmcoMTApLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgICAgICAgICBjYXNlICdzJzogcmV0dXJuIGRhdGUuZ2V0U2Vjb25kcygpLnRvU3RyaW5nKDEwKS5wYWRTdGFydCgyLCAnMCcpO1xuICAgICAgICAgICAgY2FzZSAnbXMnOiByZXR1cm4gZGF0ZS5nZXRNaWxsaXNlY29uZHMoKS50b1N0cmluZygxMClcbiAgICAgICAgICAgICAgLnBhZFN0YXJ0KDMsICcwJyk7XG4gICAgICAgICAgICBjYXNlICdpc28nOiByZXR1cm4gZGF0ZS50b0lTT1N0cmluZygpO1xuXG4gICAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlLnZhcmlhYmxlcz8uW25hbWVdIHx8IHN1YnN0cmluZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC50cmltKCk7XG5cbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sXG5cbiAgICB3cml0ZUZuKHsgbWVzc2FnZTogeyBsZXZlbCwgZGF0YSB9IH0pIHtcbiAgICAgIGNvbnN0IGNvbnNvbGVMb2dGbiA9IGNvbnNvbGVNZXRob2RzW2xldmVsXSB8fCBjb25zb2xlTWV0aG9kcy5pbmZvO1xuXG4gICAgICAvLyBtYWtlIGFuIGVtcHR5IGNhbGwgc3RhY2tcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gY29uc29sZUxvZ0ZuKC4uLmRhdGEpKTtcbiAgICB9LFxuXG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHRyYW5zcG9ydChtZXNzYWdlKSB7XG4gICAgdHJhbnNwb3J0LndyaXRlRm4oe1xuICAgICAgbWVzc2FnZTogeyAuLi5tZXNzYWdlLCBkYXRhOiB0cmFuc3BvcnQuZm9ybWF0RGF0YUZuKG1lc3NhZ2UpIH0sXG4gICAgfSk7XG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBpcGNUcmFuc3BvcnRSZW5kZXJlckZhY3Rvcnk7XG5cbmNvbnN0IFJFU1RSSUNURURfVFlQRVMgPSBuZXcgU2V0KFtQcm9taXNlLCBXZWFrTWFwLCBXZWFrU2V0XSk7XG5cbmZ1bmN0aW9uIGlwY1RyYW5zcG9ydFJlbmRlcmVyRmFjdG9yeShsb2dnZXIpIHtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24odHJhbnNwb3J0LCB7XG4gICAgZGVwdGg6IDUsXG5cbiAgICBzZXJpYWxpemVGbihkYXRhLCB7IGRlcHRoID0gNSwgc2VlbiA9IG5ldyBXZWFrU2V0KCkgfSA9IHt9KSB7XG4gICAgICBpZiAoZGVwdGggPCAxKSB7XG4gICAgICAgIHJldHVybiBgWyR7dHlwZW9mIGRhdGF9XWA7XG4gICAgICB9XG5cbiAgICAgIGlmIChzZWVuLmhhcyhkYXRhKSkge1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgIH1cblxuICAgICAgaWYgKFsnZnVuY3Rpb24nLCAnc3ltYm9sJ10uaW5jbHVkZXModHlwZW9mIGRhdGEpKSB7XG4gICAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFByaW1pdGl2ZSB0eXBlcyAoaW5jbHVkaW5nIG51bGwgYW5kIHVuZGVmaW5lZClcbiAgICAgIGlmIChPYmplY3QoZGF0YSkgIT09IGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICB9XG5cbiAgICAgIC8vIE9iamVjdCB0eXBlc1xuXG4gICAgICBpZiAoUkVTVFJJQ1RFRF9UWVBFUy5oYXMoZGF0YS5jb25zdHJ1Y3RvcikpIHtcbiAgICAgICAgcmV0dXJuIGBbJHtkYXRhLmNvbnN0cnVjdG9yLm5hbWV9XWA7XG4gICAgICB9XG5cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgIHJldHVybiBkYXRhLm1hcCgoaXRlbSkgPT4gdHJhbnNwb3J0LnNlcmlhbGl6ZUZuKFxuICAgICAgICAgIGl0ZW0sXG4gICAgICAgICAgeyBsZXZlbDogZGVwdGggLSAxLCBzZWVuIH0sXG4gICAgICAgICkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHJldHVybiBkYXRhLnN0YWNrO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICByZXR1cm4gbmV3IE1hcChcbiAgICAgICAgICBBcnJheVxuICAgICAgICAgICAgLmZyb20oZGF0YSlcbiAgICAgICAgICAgIC5tYXAoKFtrZXksIHZhbHVlXSkgPT4gW1xuICAgICAgICAgICAgICB0cmFuc3BvcnQuc2VyaWFsaXplRm4oa2V5LCB7IGxldmVsOiBkZXB0aCAtIDEsIHNlZW4gfSksXG4gICAgICAgICAgICAgIHRyYW5zcG9ydC5zZXJpYWxpemVGbih2YWx1ZSwgeyBsZXZlbDogZGVwdGggLSAxLCBzZWVuIH0pLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGlmIChkYXRhIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgIHJldHVybiBuZXcgU2V0KFxuICAgICAgICAgIEFycmF5LmZyb20oZGF0YSkubWFwKFxuICAgICAgICAgICAgKHZhbCkgPT4gdHJhbnNwb3J0LnNlcmlhbGl6ZUZuKHZhbCwgeyBsZXZlbDogZGVwdGggLSAxLCBzZWVuIH0pLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHNlZW4uYWRkKGRhdGEpO1xuXG4gICAgICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICBPYmplY3QuZW50cmllcyhkYXRhKS5tYXAoXG4gICAgICAgICAgKFtrZXksIHZhbHVlXSkgPT4gW1xuICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgdHJhbnNwb3J0LnNlcmlhbGl6ZUZuKHZhbHVlLCB7IGxldmVsOiBkZXB0aCAtIDEsIHNlZW4gfSksXG4gICAgICAgICAgXSxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfSxcbiAgfSk7XG5cbiAgZnVuY3Rpb24gdHJhbnNwb3J0KG1lc3NhZ2UpIHtcbiAgICBpZiAoIXdpbmRvdy5fX2VsZWN0cm9uTG9nKSB7XG4gICAgICBsb2dnZXIucHJvY2Vzc01lc3NhZ2UoXG4gICAgICAgIHtcbiAgICAgICAgICBkYXRhOiBbJ2VsZWN0cm9uLWxvZzogbG9nZ2VyIGlzblxcJ3QgaW5pdGlhbGl6ZWQgaW4gdGhlIG1haW4gcHJvY2VzcyddLFxuICAgICAgICAgIGxldmVsOiAnZXJyb3InLFxuICAgICAgICB9LFxuICAgICAgICB7IHRyYW5zcG9ydHM6IFsnY29uc29sZSddIH0sXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBfX2VsZWN0cm9uTG9nLnNlbmRUb01haW4odHJhbnNwb3J0LnNlcmlhbGl6ZUZuKG1lc3NhZ2UsIHtcbiAgICAgICAgZGVwdGg6IHRyYW5zcG9ydC5kZXB0aCxcbiAgICAgIH0pKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsb2dnZXIudHJhbnNwb3J0cy5jb25zb2xlKHtcbiAgICAgICAgZGF0YTogWydlbGVjdHJvbkxvZy50cmFuc3BvcnRzLmlwYycsIGUsICdkYXRhOicsIG1lc3NhZ2UuZGF0YV0sXG4gICAgICAgIGxldmVsOiAnZXJyb3InLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IExvZ2dlciA9IHJlcXVpcmUoJy4uL2NvcmUvTG9nZ2VyJyk7XG5jb25zdCBSZW5kZXJlckVycm9ySGFuZGxlciA9IHJlcXVpcmUoJy4vbGliL1JlbmRlcmVyRXJyb3JIYW5kbGVyJyk7XG5jb25zdCB0cmFuc3BvcnRDb25zb2xlID0gcmVxdWlyZSgnLi9saWIvdHJhbnNwb3J0cy9jb25zb2xlJyk7XG5jb25zdCB0cmFuc3BvcnRJcGMgPSByZXF1aXJlKCcuL2xpYi90cmFuc3BvcnRzL2lwYycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUxvZ2dlcigpO1xubW9kdWxlLmV4cG9ydHMuTG9nZ2VyID0gTG9nZ2VyO1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IG1vZHVsZS5leHBvcnRzO1xuXG5mdW5jdGlvbiBjcmVhdGVMb2dnZXIoKSB7XG4gIGNvbnN0IGxvZ2dlciA9IG5ldyBMb2dnZXIoe1xuICAgIGFsbG93VW5rbm93bkxldmVsOiB0cnVlLFxuICAgIGVycm9ySGFuZGxlcjogbmV3IFJlbmRlcmVyRXJyb3JIYW5kbGVyKCksXG4gICAgaW5pdGlhbGl6ZUZuOiAoKSA9PiB7fSxcbiAgICBsb2dJZDogJ2RlZmF1bHQnLFxuICAgIHRyYW5zcG9ydEZhY3Rvcmllczoge1xuICAgICAgY29uc29sZTogdHJhbnNwb3J0Q29uc29sZSxcbiAgICAgIGlwYzogdHJhbnNwb3J0SXBjLFxuICAgIH0sXG4gICAgdmFyaWFibGVzOiB7XG4gICAgICBwcm9jZXNzVHlwZTogJ3JlbmRlcmVyJyxcbiAgICB9LFxuICB9KTtcblxuICBsb2dnZXIuZXJyb3JIYW5kbGVyLnNldE9wdGlvbnMoe1xuICAgIGxvZ0ZuKHsgZXJyb3IsIGVycm9yTmFtZSwgc2hvd0RpYWxvZyB9KSB7XG4gICAgICBsb2dnZXIudHJhbnNwb3J0cy5jb25zb2xlKHtcbiAgICAgICAgZGF0YTogW2Vycm9yTmFtZSwgZXJyb3JdLmZpbHRlcihCb29sZWFuKSxcbiAgICAgICAgbGV2ZWw6ICdlcnJvcicsXG4gICAgICB9KTtcbiAgICAgIGxvZ2dlci50cmFuc3BvcnRzLmlwYyh7XG4gICAgICAgIGNtZDogJ2Vycm9ySGFuZGxlcicsXG4gICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgY2F1c2U6IGVycm9yPy5jYXVzZSxcbiAgICAgICAgICBjb2RlOiBlcnJvcj8uY29kZSxcbiAgICAgICAgICBuYW1lOiBlcnJvcj8ubmFtZSxcbiAgICAgICAgICBtZXNzYWdlOiBlcnJvcj8ubWVzc2FnZSxcbiAgICAgICAgICBzdGFjazogZXJyb3I/LnN0YWNrLFxuICAgICAgICB9LFxuICAgICAgICBlcnJvck5hbWUsXG4gICAgICAgIGxvZ0lkOiBsb2dnZXIubG9nSWQsXG4gICAgICAgIHNob3dEaWFsb2csXG4gICAgICB9KTtcbiAgICB9LFxuICB9KTtcblxuICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIChldmVudCkgPT4ge1xuICAgICAgY29uc3QgeyBjbWQsIGxvZ0lkLCAuLi5tZXNzYWdlIH0gPSBldmVudC5kYXRhIHx8IHt9O1xuICAgICAgY29uc3QgaW5zdGFuY2UgPSBMb2dnZXIuZ2V0SW5zdGFuY2UoeyBsb2dJZCB9KTtcblxuICAgICAgaWYgKGNtZCA9PT0gJ21lc3NhZ2UnKSB7XG4gICAgICAgIGluc3RhbmNlLnByb2Nlc3NNZXNzYWdlKG1lc3NhZ2UsIHsgdHJhbnNwb3J0czogWydjb25zb2xlJ10gfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvLyBUbyBzdXBwb3J0IGN1c3RvbSBsZXZlbHNcbiAgcmV0dXJuIG5ldyBQcm94eShsb2dnZXIsIHtcbiAgICBnZXQodGFyZ2V0LCBwcm9wKSB7XG4gICAgICBpZiAodHlwZW9mIHRhcmdldFtwcm9wXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wXTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuICguLi5kYXRhKSA9PiBsb2dnZXIubG9nRGF0YShkYXRhLCB7IGxldmVsOiBwcm9wIH0pO1xuICAgIH0sXG4gIH0pO1xufVxuIiwiaW1wb3J0IGxvZyBmcm9tICdlbGVjdHJvbi1sb2cnO1xuaW1wb3J0IHsgaXNEZXYgfSBmcm9tICcuL3V0aWxzJztcblxuLy8gbG9nc1xuaWYgKCFpc0Rldikge1xuICBsb2cudHJhbnNwb3J0cy5maWxlLmxldmVsID0gXCJ2ZXJib3NlXCI7XG59XG5cbi8vIGVyciBoYW5kbGVcbnByb2Nlc3Mub24oJ3VuaGFuZGxlZFJlamVjdGlvbicsIGxvZy5lcnJvcik7IiwiaW1wb3J0IHsgTWVzc2FnZUJveE9wdGlvbnMsIGFwcCwgYXV0b1VwZGF0ZXIsIGRpYWxvZyB9IGZyb20gXCJlbGVjdHJvblwiO1xuaW1wb3J0IGxvZyBmcm9tICdlbGVjdHJvbi1sb2cnO1xuXG4vLyBjb25zdCBpc01hY09TID0gZmFsc2U7XG5pbXBvcnQgaXNEZXYgZnJvbSBcImVsZWN0cm9uLWlzLWRldlwiO1xuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRBdXRvVXBkYXRlcigpIHtcbiAgICAvLyBIYW5kbGUgY3JlYXRpbmcvcmVtb3Zpbmcgc2hvcnRjdXRzIG9uIFdpbmRvd3Mgd2hlbiBpbnN0YWxsaW5nL3VuaW5zdGFsbGluZy5cbiAgICBpZiAocmVxdWlyZSgnZWxlY3Ryb24tc3F1aXJyZWwtc3RhcnR1cCcpKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZ2xvYmFsLXJlcXVpcmVcbiAgICAgICAgYXBwLnF1aXQoKTtcbiAgICB9XG4gICAgaWYgKCFpc0Rldikge1xuICAgICAgICBjb25zdCBzZXJ2ZXIgPSBcImh0dHBzOi8vcmVmaS11cGRhdGVyLnZlcmNlbC5hcHBcIjtcbiAgICAgICAgY29uc3QgZmVlZCA9IGAke3NlcnZlcn0vdXBkYXRlLyR7cHJvY2Vzcy5wbGF0Zm9ybX0vJHthcHAuZ2V0VmVyc2lvbigpfWBcbiAgICBcbiAgICAgICAgYXV0b1VwZGF0ZXIuc2V0RmVlZFVSTCh7IHVybDogZmVlZCwgc2VydmVyVHlwZTogXCJqc29uXCIgfSlcbiAgICBcbiAgICAgICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgYXV0b1VwZGF0ZXIuY2hlY2tGb3JVcGRhdGVzKClcbiAgICAgICAgfSwgNjAwMDApO1xuICAgIFxuICAgICAgICBhdXRvVXBkYXRlci5vbigndXBkYXRlLWRvd25sb2FkZWQnLCAoXywgcmVsZWFzZU5vdGVzLCByZWxlYXNlTmFtZSkgPT4ge1xuICAgICAgICAgICAgbG9nLmRlYnVnKCdEb3dubG9hZGVkIG5ldyB1cGRhdGUnKTtcbiAgICAgICAgICAgIGNvbnN0IGRpYWxvZ09wdHM6IE1lc3NhZ2VCb3hPcHRpb25zID0ge1xuICAgICAgICAgICAgdHlwZTogJ2luZm8nLFxuICAgICAgICAgICAgYnV0dG9uczogWydSZXN0YXJ0JywgJ0xhdGVyJ10sXG4gICAgICAgICAgICB0aXRsZTogJ0FwcGxpY2F0aW9uIFVwZGF0ZScsXG4gICAgICAgICAgICBtZXNzYWdlOiBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInID8gcmVsZWFzZU5vdGVzIDogcmVsZWFzZU5hbWUsXG4gICAgICAgICAgICBkZXRhaWw6ICdBIG5ldyB2ZXJzaW9uIGhhcyBiZWVuIGRvd25sb2FkZWQuIFJlc3RhcnQgdGhlIGFwcGxpY2F0aW9uIHRvIGFwcGx5IHRoZSB1cGRhdGVzLidcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIGRpYWxvZy5zaG93TWVzc2FnZUJveChkaWFsb2dPcHRzKS50aGVuKChyZXR1cm5WYWx1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHJldHVyblZhbHVlLnJlc3BvbnNlID09PSAwKSBhdXRvVXBkYXRlci5xdWl0QW5kSW5zdGFsbCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgYXV0b1VwZGF0ZXIub24oJ2Vycm9yJywgbWVzc2FnZSA9PiB7XG4gICAgICAgICAgICBsb2cuZXJyb3IoJ1RoZXJlIHdhcyBhIHByb2JsZW0gdXBkYXRpbmcgdGhlIGFwcGxpY2F0aW9uJylcbiAgICAgICAgICAgIGxvZy5lcnJvcihtZXNzYWdlKVxuICAgICAgICB9KVxuICAgIH0gXG59XG5cblxuIiwiaW1wb3J0IHsgSXBjTWFpbkV2ZW50LCBpcGNNYWluIH0gZnJvbSBcImVsZWN0cm9uXCJcblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0SVBDKCkge1xuICAvLyBsaXN0ZW4gdGhlIGNoYW5uZWwgYG1lc3NhZ2VgIGFuZCByZXNlbmQgdGhlIHJlY2VpdmVkIG1lc3NhZ2UgdG8gdGhlIHJlbmRlcmVyIHByb2Nlc3NcbiAgaXBjTWFpbi5vbignbWVzc2FnZScsIChldmVudDogSXBjTWFpbkV2ZW50LCBtZXNzYWdlOiBhbnkpID0+IHtcbiAgICBjb25zb2xlLmxvZyhtZXNzYWdlKVxuICAgIHNldFRpbWVvdXQoKCkgPT4gZXZlbnQuc2VuZGVyLnNlbmQoJ21lc3NhZ2UnLCAnaGkgZnJvbSBlbGVjdHJvbicpLCA1MDApXG4gIH0pXG59XG4iLCJpbXBvcnQgZXhwcmVzcywgeyBSZXF1ZXN0LCBSZXNwb25zZSB9IGZyb20gJ2V4cHJlc3MnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRBcHBTZXJ2ZXIoKSB7XG4gIGNvbnNvbGUubG9nKFwic3RhcnQgc2VydmVyIHNkXCIpO1xuICBjb25zdCBhcHAgPSBleHByZXNzKCk7XG4gIGNvbnN0IHBvcnQgPSAzMzMzO1xuICBcbiAgYXBwLnVzZShleHByZXNzLmpzb24oKSk7XG4gIFxuICBhcHAuZ2V0KCcvJywgKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkgPT4ge1xuICAgIHJlcy5zZW5kKCdIZWxsbywgRXhwcmVzcyArIFR5cGVTY3JpcHQhIGFzZGYnKTtcbiAgfSk7XG4gIFxuICBhcHAucG9zdCgnL2FwaS9kYXRhJywgKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkgPT4ge1xuICAgIGNvbnN0IHsgZGF0YSB9ID0gcmVxLmJvZHk7XG4gICAgcmVzLmpzb24oeyBtZXNzYWdlOiBgUmVjZWl2ZWQgZGF0YTogJHtkYXRhfWAgfSk7XG4gIH0pO1xuICBcbiAgYXBwLmxpc3Rlbihwb3J0LCAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coYFNlcnZlciBpcyBydW5uaW5nIGF0IGh0dHA6Ly9sb2NhbGhvc3Q6JHtwb3J0fWApO1xuICB9KTtcbn1cbiIsImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBhcHAgfSBmcm9tICdlbGVjdHJvbidcbi8vIGltcG9ydCBwcmVwYXJlTmV4dCBmcm9tICdlbGVjdHJvbi1uZXh0J1xuaW1wb3J0IHsgY3JlYXRlTWFpbldpbmRvdywgcmVzdG9yZU9yQ3JlYXRlV2luZG93IH0gZnJvbSBcIi4vd2luZG93cy1tYW5hZ2VyXCI7XG5pbXBvcnQgXCIuL3ByZWxhdW5jaFwiO1xuaW1wb3J0IHsgc3RhcnRBdXRvVXBkYXRlciB9IGZyb20gJy4vYXV0by11cGRhdGUnO1xuaW1wb3J0IHsgc3RhcnRJUEMgfSBmcm9tICcuL2lwYyc7XG5cbi8vIFByZXBhcmUgdGhlIHJlbmRlcmVyIG9uY2UgdGhlIGFwcCBpcyByZWFkeVxuY29uc3QgcmVuZGVyZXJQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgXCIuLi9yZW5kZXJlclwiKTtcbmNvbnNvbGUubG9nKFwic3RhcnRlZDpcIiwgcmVuZGVyZXJQYXRoKTtcblxuaW1wb3J0IHsgc3RhcnRBcHBTZXJ2ZXIgfSBmcm9tICdAY29tZmxvd3kvbm9kZS9zcmMvYXBwJztcblxuLyoqXG4gKiBEaXNhYmxlIEhhcmR3YXJlIEFjY2VsZXJhdGlvbiBmb3IgbW9yZSBwb3dlci1zYXZlXG4gKi9cbmFwcC5kaXNhYmxlSGFyZHdhcmVBY2NlbGVyYXRpb24oKTtcblxuYXBwLm9uKCdyZWFkeScsIGFzeW5jICgpID0+IHtcbiAgLy8gcnVuIG5leHQgZnJvbnRlbmQgc2VydmljZVxuICAvLyBhd2FpdCBwcmVwYXJlTmV4dChyZW5kZXJlclBhdGgpXG4gIGF3YWl0IHN0YXJ0QXBwU2VydmVyKCk7XG5cbiAgLy8gc3RhcnQgZGVza3RvcCB3aW5kb3dcbiAgYXdhaXQgY3JlYXRlTWFpbldpbmRvdygpO1xuXG4gIC8vIG1lc3NhZ2UgaHViXG4gIHN0YXJ0SVBDKCk7XG5cbiAgLy8gYXV0byB1cGRhdGUgbGlzdGVuZXJcbiAgc3RhcnRBdXRvVXBkYXRlcigpXG59KVxuXG4vLyBRdWl0IHRoZSBhcHAgb25jZSBhbGwgd2luZG93cyBhcmUgY2xvc2VkXG5hcHAub24oJ3dpbmRvdy1hbGwtY2xvc2VkJywgYXBwLnF1aXQpXG5cbmFwcC5vbihcImFjdGl2YXRlXCIsIHJlc3RvcmVPckNyZWF0ZVdpbmRvdyk7XG5cbiJdLCJuYW1lcyI6WyJyZXF1aXJlJCQwIiwiY3J5cHRvIiwiaXNEZXYiLCJmb3JtYXQiLCJwYXRoIiwiQnJvd3NlcldpbmRvdyIsIkJyb3dzZXJWaWV3Iiwic2NvcGVGYWN0b3J5IiwicmVxdWlyZSQkMSIsInJlcXVpcmUkJDIiLCJyZXF1aXJlJCQzIiwiYXBwIiwiYXV0b1VwZGF0ZXIiLCJkaWFsb2ciLCJpcGNNYWluIiwiZXhwcmVzcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxNQUFNLFdBQVdBLG9CQUFBQTtBQUVqQixJQUFJLE9BQU8sYUFBYSxVQUFVO0FBQ2pDLFFBQU0sSUFBSSxVQUFVO0FBQUE7QUFHckIsTUFBTSxNQUFNLFNBQVMsT0FBTyxTQUFTLE9BQU87QUFFNUMsTUFBTSxXQUFXLHFCQUFxQixRQUFRO0FBQzlDLE1BQU0sYUFBYSxZQUFxQixpQkFBaUIsUUFBUTtJQUVqRSxnQkFBaUIsV0FBVyxhQUFhLENBQUMsSUFBSTtBQ1o5QyxNQUFNLFVBQVUsUUFBUSxhQUFhO0FBT2QsZ0JBQUE7QUFDbkIsU0FBT0MsZ0JBQUFBLFdBQU87QUFBQTtBQ1VsQixJQUFJLGFBQWdDO0FBQ3BDLElBQUk7QUFDSixNQUFNLG1CQUFtQkMsZ0JBQ3JCLDBCQUNBQyxXQUFPO0FBQUEsRUFDUCxVQUFVQyxjQUFLLFdBQUEsS0FBSyxXQUFXO0FBQUEsRUFDL0IsVUFBVTtBQUFBLEVBQ1YsU0FBUztBQUFBO0FBR2IsTUFBTSxrQkFBa0JBLGNB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
