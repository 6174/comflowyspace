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
function _interopDefaultLegacy(e) {
  return e && typeof e === "object" && "default" in e ? e : { "default": e };
}
var path__default = /* @__PURE__ */ _interopDefaultLegacy(path);
var require$$0__default = /* @__PURE__ */ _interopDefaultLegacy(require$$0);
var crypto__default = /* @__PURE__ */ _interopDefaultLegacy(crypto);
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
      contextIsolation: false,
      nodeIntegration: false,
      preload: __dirname + "/preload.js",
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
      contextIsolation: false,
      nodeIntegration: false,
      preload: __dirname + "/preload.js",
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
const rendererPath = path__default["default"].join(__dirname, "../renderer");
console.log("started:", rendererPath);
require$$0.app.disableHardwareAcceleration();
require$$0.app.on("ready", async () => {
  await createMainWindow();
  startIPC();
  startAutoUpdater();
});
require$$0.app.on("window-all-closed", require$$0.app.quit);
require$$0.app.on("activate", restoreOrCreateWindow);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9lbGVjdHJvbi1pcy1kZXZAMS4yLjAvbm9kZV9tb2R1bGVzL2VsZWN0cm9uLWlzLWRldi9pbmRleC5qcyIsIi4uL3NyYy91dGlscy50cyIsIi4uL3NyYy93aW5kb3dzLW1hbmFnZXIudHMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZWxlY3Ryb24tbG9nQDUuMC4xL25vZGVfbW9kdWxlcy9lbGVjdHJvbi1sb2cvc3JjL2NvcmUvc2NvcGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZWxlY3Ryb24tbG9nQDUuMC4xL25vZGVfbW9kdWxlcy9lbGVjdHJvbi1sb2cvc3JjL2NvcmUvTG9nZ2VyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2VsZWN0cm9uLWxvZ0A1LjAuMS9ub2RlX21vZHVsZXMvZWxlY3Ryb24tbG9nL3NyYy9yZW5kZXJlci9saWIvUmVuZGVyZXJFcnJvckhhbmRsZXIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZWxlY3Ryb24tbG9nQDUuMC4xL25vZGVfbW9kdWxlcy9lbGVjdHJvbi1sb2cvc3JjL3JlbmRlcmVyL2xpYi90cmFuc3BvcnRzL2NvbnNvbGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZWxlY3Ryb24tbG9nQDUuMC4xL25vZGVfbW9kdWxlcy9lbGVjdHJvbi1sb2cvc3JjL3JlbmRlcmVyL2xpYi90cmFuc3BvcnRzL2lwYy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9lbGVjdHJvbi1sb2dANS4wLjEvbm9kZV9tb2R1bGVzL2VsZWN0cm9uLWxvZy9zcmMvcmVuZGVyZXIvaW5kZXguanMiLCIuLi9zcmMvcHJlbGF1bmNoLnRzIiwiLi4vc3JjL2F1dG8tdXBkYXRlLnRzIiwiLi4vc3JjL2lwYy50cyIsIi4uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5jb25zdCBlbGVjdHJvbiA9IHJlcXVpcmUoJ2VsZWN0cm9uJyk7XG5cbmlmICh0eXBlb2YgZWxlY3Ryb24gPT09ICdzdHJpbmcnKSB7XG5cdHRocm93IG5ldyBUeXBlRXJyb3IoJ05vdCBydW5uaW5nIGluIGFuIEVsZWN0cm9uIGVudmlyb25tZW50IScpO1xufVxuXG5jb25zdCBhcHAgPSBlbGVjdHJvbi5hcHAgfHwgZWxlY3Ryb24ucmVtb3RlLmFwcDtcblxuY29uc3QgaXNFbnZTZXQgPSAnRUxFQ1RST05fSVNfREVWJyBpbiBwcm9jZXNzLmVudjtcbmNvbnN0IGdldEZyb21FbnYgPSBwYXJzZUludChwcm9jZXNzLmVudi5FTEVDVFJPTl9JU19ERVYsIDEwKSA9PT0gMTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc0VudlNldCA/IGdldEZyb21FbnYgOiAhYXBwLmlzUGFja2FnZWQ7XG4iLCJjb25zdCBpc01hY09TID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2Rhcndpbic7XG5pbXBvcnQgaXNEZXYgZnJvbSAnZWxlY3Ryb24taXMtZGV2J1xuZXhwb3J0IHtcbiAgICBpc01hY09TLFxuICAgIGlzRGV2XG59XG5pbXBvcnQgY3J5cHRvIGZyb20gXCJjcnlwdG9cIjtcbmV4cG9ydCBmdW5jdGlvbiB1dWlkKCkge1xuICAgIHJldHVybiBjcnlwdG8ucmFuZG9tVVVJRCgpO1xufSIsImltcG9ydCB7IEJyb3dzZXJWaWV3LCBCcm93c2VyV2luZG93IH0gZnJvbSBcImVsZWN0cm9uXCI7XG5pbXBvcnQgaXNEZXYgZnJvbSBcImVsZWN0cm9uLWlzLWRldlwiO1xuXG5pbXBvcnQgeyBpc01hY09TLCB1dWlkIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBmb3JtYXQgfSBmcm9tIFwidXJsXCI7XG5cbi8vIHR5cGUgZGVmaW5lXG5leHBvcnQgaW50ZXJmYWNlIElXaW5kb3dJbnN0YW5jZSB7XG4gIHdpbmRvdzogQnJvd3NlclZpZXc7XG4gIG5hbWU6IHN0cmluZztcbn1cbmV4cG9ydCBpbnRlcmZhY2UgVGFiTGlzdCB7XG4gIHRhYnM6IHN0cmluZ1tdO1xuICBhY3RpdmU6IHN0cmluZztcbn1cblxuLy8gZ29sYmFsIGRhdGFcbmxldCBsaXN0V2luZG93OiBJV2luZG93SW5zdGFuY2VbXSA9IFtdO1xubGV0IG1haW5XaW5kb3c6IEJyb3dzZXJXaW5kb3c7XG5jb25zdCBkZWZhdWx0V2luZG93VXJsID0gaXNEZXZcbiAgPyAnaHR0cDovL2xvY2FsaG9zdDozMDAwJ1xuICA6IGZvcm1hdCh7XG4gICAgcGF0aG5hbWU6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9yZW5kZXJlci9vdXQvaW5kZXguaHRtbCcpLFxuICAgIHByb3RvY29sOiAnZmlsZTonLFxuICAgIHNsYXNoZXM6IHRydWUsXG4gIH0pO1xuXG4vKipcbiAqIGNyZWF0ZSBtYWluIHdpbmRvdyB0byBtYW5hZ2VyIHRhYiB3aW5kb3dzXG4gKiBodHRwczovL3d3dy5lbGVjdHJvbmpzLm9yZy9kb2NzL2xhdGVzdC9hcGkvYnJvd3Nlci12aWV3XG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZU1haW5XaW5kb3coKSB7XG4gIGlmIChtYWluV2luZG93KSB7XG4gICAgcmV0dXJuIG1haW5XaW5kb3c7XG4gIH1cbiAgY29uc3Qgd2luZG93ID0gbmV3IEJyb3dzZXJXaW5kb3coe1xuICAgIHNob3c6IGZhbHNlLFxuICAgIHdpZHRoOiA4MDAsXG4gICAgaGVpZ2h0OiA2MDAsXG4gICAgYmFja2dyb3VuZENvbG9yOiBpc01hY09TID8gXCIjRDFENURCXCIgOiBcIiM2QjcyODBcIixcbiAgICB0aXRsZUJhclN0eWxlOiBpc01hY09TID8gJ2hpZGRlbkluc2V0JyA6ICdkZWZhdWx0JyxcbiAgICBmcmFtZTogaXNNYWNPUyxcbiAgICB3ZWJQcmVmZXJlbmNlczoge1xuICAgICAgZGV2VG9vbHM6IGlzRGV2LFxuICAgICAgLy8gZW5hYmxlUmVtb3RlTW9kdWxlOiBmYWxzZSxcbiAgICAgIGNvbnRleHRJc29sYXRpb246IGZhbHNlLFxuICAgICAgbm9kZUludGVncmF0aW9uOiBmYWxzZSxcbiAgICAgIHByZWxvYWQ6IF9fZGlybmFtZSArIFwiL3ByZWxvYWQuanNcIixcbiAgICAgIGRpc2FibGVEaWFsb2dzOiBmYWxzZSxcbiAgICAgIHNhZmVEaWFsb2dzOiB0cnVlLFxuICAgICAgZW5hYmxlV2ViU1FMOiBmYWxzZSxcbiAgICB9LFxuICB9KTtcblxuICBtYWluV2luZG93ID0gd2luZG93O1xuXG4gIGlmIChpc0Rldikge1xuICAgIG1haW5XaW5kb3cud2ViQ29udGVudHMub3BlbkRldlRvb2xzKHsgbW9kZTogJ2RldGFjaCcgfSlcbiAgfVxuXG4gIHdpbmRvdy5vbignY2xvc2VkJywgKCkgPT4ge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBtYWluV2luZG93ID0gbnVsbDtcbiAgICBsaXN0V2luZG93LmZvckVhY2goaW5zdGFuY2UgPT4ge1xuICAgICAgKGluc3RhbmNlLndpbmRvdy53ZWJDb250ZW50cyBhcyBhbnkpPy5kZXN0cm95KCkgLy8gVE9ETzogZWxlY3Ryb24gaGF2ZW4ndCBtYWtlIGRvY3VtZW50IGZvciBpdC4gUmVmOiBodHRwczovL2dpdGh1Yi5jb20vZWxlY3Ryb24vZWxlY3Ryb24vaXNzdWVzLzI2OTI5XG4gICAgfSk7XG4gICAgbGlzdFdpbmRvdyA9IFtdO1xuICB9KVxuXG4gIGlmIChpc0Rldikge1xuICAgIHdpbmRvdy5sb2FkVVJMKGAke2RlZmF1bHRXaW5kb3dVcmx9L3RhYnNgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBUT0RPOiBXaGF0IGlmIEkgbmVlZCB0byBsb2FkIHRoZSB0YWJzLmh0bWwgZmlsZVxuICAgIHdpbmRvdy5sb2FkVVJMKFwiYXBwOi8vLS90YWJzXCIpO1xuICB9XG5cbiAgLy8gd2luZG93Lm1heGltaXplKCk7XG4gIHdpbmRvdy5zaG93KCk7XG5cbiAgY29uc3Qgd2luZG93VmlldyA9IGF3YWl0IGNyZWF0ZVdpbmRvdyhkZWZhdWx0V2luZG93VXJsK1wiL2FwcFwiKTtcbiAgc2V0VGFiKHdpbmRvd1ZpZXcpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlV2luZG93KGhyZWY6IHN0cmluZykge1xuICAvLyBDcmVhdGUgdGhlIGJyb3dzZXIgdmlldy5cbiAgY29uc3Qgd2luZG93ID0gbmV3IEJyb3dzZXJWaWV3KHtcbiAgICB3ZWJQcmVmZXJlbmNlczoge1xuICAgICAgZGV2VG9vbHM6IGlzRGV2LFxuICAgICAgY29udGV4dElzb2xhdGlvbjogZmFsc2UsXG4gICAgICBub2RlSW50ZWdyYXRpb246IGZhbHNlLFxuICAgICAgcHJlbG9hZDogX19kaXJuYW1lICsgXCIvcHJlbG9hZC5qc1wiLFxuICAgICAgZGlzYWJsZURpYWxvZ3M6IGZhbHNlLFxuICAgICAgc2FmZURpYWxvZ3M6IHRydWUsXG4gICAgICBlbmFibGVXZWJTUUw6IGZhbHNlLFxuICAgIH0sXG4gIH0pO1xuXG4gIHdpbmRvdy53ZWJDb250ZW50cy5sb2FkVVJMKGhyZWYpO1xuXG4gIGlmIChpc0Rldikge1xuICAgIHdpbmRvdy53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMoeyBtb2RlOiAnZGV0YWNoJyB9KVxuICB9XG5cbiAgd2luZG93LndlYkNvbnRlbnRzLm9uKFwiZGlkLWZpbmlzaC1sb2FkXCIsICgpID0+IHtcbiAgICAvLyB3aW5kb3cud2ViQ29udGVudHMuc2VuZChcInNldC1zb2NrZXRcIiwge30pO1xuICB9KTtcblxuICBsaXN0V2luZG93LnB1c2goe1xuICAgIHdpbmRvdyxcbiAgICBuYW1lOiBgVGFiLSR7dXVpZCgpfWBcbiAgfSk7XG5cbiAgbWFpbldpbmRvdyEud2ViQ29udGVudHMuc2VuZCgndGFiQ2hhbmdlJywgZ2V0VGFiRGF0YSgpKTtcbiAgcmV0dXJuIHdpbmRvdztcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUYWJEYXRhKCk6IFRhYkxpc3R7XG4gIHJldHVybiB7XG4gICAgdGFiczogbGlzdFdpbmRvdy5tYXAoKGluc3RhbmNlKSA9PiBpbnN0YW5jZS5uYW1lKSxcbiAgICBhY3RpdmU6IGxpc3RXaW5kb3cuZmluZCgoaW5zdGFuY2UpID0+IGluc3RhbmNlLndpbmRvdy53ZWJDb250ZW50cy5pZCA9PT0gbWFpbldpbmRvdyEuZ2V0QnJvd3NlclZpZXcoKT8ud2ViQ29udGVudHM/LmlkKT8ubmFtZSB8fCAnJ1xuICB9XG59XG5cbi8vIFNldCBhY3RpdmUgdGFiXG5leHBvcnQgZnVuY3Rpb24gc2V0VGFiKGluc3RhbmNlOiBCcm93c2VyVmlldykge1xuICBtYWluV2luZG93IS5zZXRCcm93c2VyVmlldyhpbnN0YW5jZSk7XG4gIGluc3RhbmNlLnNldEJvdW5kcyh7IHg6IDAsIHk6IDM2LCB3aWR0aDogbWFpbldpbmRvdyEuZ2V0Qm91bmRzKCkud2lkdGgsIGhlaWdodDogbWFpbldpbmRvdyEuZ2V0Qm91bmRzKCkuaGVpZ2h0IC0gMzYgfSlcbiAgaW5zdGFuY2Uuc2V0QXV0b1Jlc2l6ZSh7IHdpZHRoOiB0cnVlLCBoZWlnaHQ6IHRydWUsIGhvcml6b250YWw6IGZhbHNlLCB2ZXJ0aWNhbDogZmFsc2UgfSk7XG4gIG1haW5XaW5kb3chLndlYkNvbnRlbnRzLnNlbmQoJ3RhYkNoYW5nZScsIGdldFRhYkRhdGEoKSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBuZXdUYWIoKXtcbiAgY29uc3Qgd2luZG93ID0gYXdhaXQgY3JlYXRlV2luZG93KG1haW5XaW5kb3cuZ2V0QnJvd3NlclZpZXcoKT8ud2ViQ29udGVudHMuZ2V0VVJMKCkhKTtcbiAgc2V0VGFiKHdpbmRvdyk7XG59XG5cbi8qKlxuICogUmVzdG9yZSBleGlzdGluZyBCcm93c2VyV2luZG93IG9yIENyZWF0ZSBuZXcgQnJvd3NlcldpbmRvd1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzdG9yZU9yQ3JlYXRlV2luZG93KCkge1xuICBsZXQgd2luZG93ID0gbWFpbldpbmRvdztcblxuICBpZiAod2luZG93ID09PSB1bmRlZmluZWQpIHtcbiAgICBhd2FpdCBjcmVhdGVNYWluV2luZG93KCk7XG4gICAgd2luZG93ID0gbWFpbldpbmRvdztcbiAgfVxuXG4gIGlmICh3aW5kb3cuaXNNaW5pbWl6ZWQoKSkge1xuICAgIHdpbmRvdy5yZXN0b3JlKCk7XG4gIH1cblxuICB3aW5kb3cuZm9jdXMoKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBzY29wZUZhY3Rvcnk7XG5cbmZ1bmN0aW9uIHNjb3BlRmFjdG9yeShsb2dnZXIpIHtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHNjb3BlLCB7XG4gICAgZGVmYXVsdExhYmVsOiB7IHZhbHVlOiAnJywgd3JpdGFibGU6IHRydWUgfSxcbiAgICBsYWJlbFBhZGRpbmc6IHsgdmFsdWU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0sXG4gICAgbWF4TGFiZWxMZW5ndGg6IHsgdmFsdWU6IDAsIHdyaXRhYmxlOiB0cnVlIH0sXG4gICAgbGFiZWxMZW5ndGg6IHtcbiAgICAgIGdldCgpIHtcbiAgICAgICAgc3dpdGNoICh0eXBlb2Ygc2NvcGUubGFiZWxQYWRkaW5nKSB7XG4gICAgICAgICAgY2FzZSAnYm9vbGVhbic6IHJldHVybiBzY29wZS5sYWJlbFBhZGRpbmcgPyBzY29wZS5tYXhMYWJlbExlbmd0aCA6IDA7XG4gICAgICAgICAgY2FzZSAnbnVtYmVyJzogcmV0dXJuIHNjb3BlLmxhYmVsUGFkZGluZztcbiAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICBmdW5jdGlvbiBzY29wZShsYWJlbCkge1xuICAgIHNjb3BlLm1heExhYmVsTGVuZ3RoID0gTWF0aC5tYXgoc2NvcGUubWF4TGFiZWxMZW5ndGgsIGxhYmVsLmxlbmd0aCk7XG5cbiAgICBjb25zdCBuZXdTY29wZSA9IHt9O1xuICAgIGZvciAoY29uc3QgbGV2ZWwgb2YgWy4uLmxvZ2dlci5sZXZlbHMsICdsb2cnXSkge1xuICAgICAgbmV3U2NvcGVbbGV2ZWxdID0gKC4uLmQpID0+IGxvZ2dlci5sb2dEYXRhKGQsIHsgbGV2ZWwsIHNjb3BlOiBsYWJlbCB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld1Njb3BlO1xuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHNjb3BlRmFjdG9yeSA9IHJlcXVpcmUoJy4vc2NvcGUnKTtcblxuLyoqXG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBlcnJvclxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gd2FyblxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gaW5mb1xuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gdmVyYm9zZVxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gZGVidWdcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IHNpbGx5XG4gKi9cbmNsYXNzIExvZ2dlciB7XG4gIHN0YXRpYyBpbnN0YW5jZXMgPSB7fTtcblxuICBlcnJvckhhbmRsZXIgPSBudWxsO1xuICBldmVudExvZ2dlciA9IG51bGw7XG4gIGZ1bmN0aW9ucyA9IHt9O1xuICBob29rcyA9IFtdO1xuICBpc0RldiA9IGZhbHNlO1xuICBsZXZlbHMgPSBudWxsO1xuICBsb2dJZCA9IG51bGw7XG4gIHNjb3BlID0gbnVsbDtcbiAgdHJhbnNwb3J0cyA9IHt9O1xuICB2YXJpYWJsZXMgPSB7fTtcblxuICBjb25zdHJ1Y3Rvcih7XG4gICAgYWxsb3dVbmtub3duTGV2ZWwgPSBmYWxzZSxcbiAgICBlcnJvckhhbmRsZXIsXG4gICAgZXZlbnRMb2dnZXIsXG4gICAgaW5pdGlhbGl6ZUZuLFxuICAgIGlzRGV2ID0gZmFsc2UsXG4gICAgbGV2ZWxzID0gWydlcnJvcicsICd3YXJuJywgJ2luZm8nLCAndmVyYm9zZScsICdkZWJ1ZycsICdzaWxseSddLFxuICAgIGxvZ0lkLFxuICAgIHRyYW5zcG9ydEZhY3RvcmllcyA9IHt9LFxuICAgIHZhcmlhYmxlcyxcbiAgfSA9IHt9KSB7XG4gICAgdGhpcy5hZGRMZXZlbCA9IHRoaXMuYWRkTGV2ZWwuYmluZCh0aGlzKTtcbiAgICB0aGlzLmNyZWF0ZSA9IHRoaXMuY3JlYXRlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5sb2dEYXRhID0gdGhpcy5sb2dEYXRhLmJpbmQodGhpcyk7XG4gICAgdGhpcy5wcm9jZXNzTWVzc2FnZSA9IHRoaXMucHJvY2Vzc01lc3NhZ2UuYmluZCh0aGlzKTtcblxuICAgIHRoaXMuYWxsb3dVbmtub3duTGV2ZWwgPSBhbGxvd1Vua25vd25MZXZlbDtcbiAgICB0aGlzLmluaXRpYWxpemVGbiA9IGluaXRpYWxpemVGbjtcbiAgICB0aGlzLmlzRGV2ID0gaXNEZXY7XG4gICAgdGhpcy5sZXZlbHMgPSBsZXZlbHM7XG4gICAgdGhpcy5sb2dJZCA9IGxvZ0lkO1xuICAgIHRoaXMudHJhbnNwb3J0RmFjdG9yaWVzID0gdHJhbnNwb3J0RmFjdG9yaWVzO1xuICAgIHRoaXMudmFyaWFibGVzID0gdmFyaWFibGVzIHx8IHt9O1xuICAgIHRoaXMuc2NvcGUgPSBzY29wZUZhY3RvcnkodGhpcyk7XG5cbiAgICB0aGlzLmFkZExldmVsKCdsb2cnLCBmYWxzZSk7XG4gICAgZm9yIChjb25zdCBuYW1lIG9mIHRoaXMubGV2ZWxzKSB7XG4gICAgICB0aGlzLmFkZExldmVsKG5hbWUsIGZhbHNlKTtcbiAgICB9XG5cbiAgICB0aGlzLmVycm9ySGFuZGxlciA9IGVycm9ySGFuZGxlcjtcbiAgICBlcnJvckhhbmRsZXI/LnNldE9wdGlvbnMoeyBsb2dGbjogdGhpcy5lcnJvciB9KTtcblxuICAgIHRoaXMuZXZlbnRMb2dnZXIgPSBldmVudExvZ2dlcjtcbiAgICBldmVudExvZ2dlcj8uc2V0T3B0aW9ucyh7IGxvZ2dlcjogdGhpcyB9KTtcblxuICAgIGZvciAoY29uc3QgW25hbWUsIGZhY3RvcnldIG9mIE9iamVjdC5lbnRyaWVzKHRyYW5zcG9ydEZhY3RvcmllcykpIHtcbiAgICAgIHRoaXMudHJhbnNwb3J0c1tuYW1lXSA9IGZhY3RvcnkodGhpcyk7XG4gICAgfVxuXG4gICAgTG9nZ2VyLmluc3RhbmNlc1tsb2dJZF0gPSB0aGlzO1xuICB9XG5cbiAgc3RhdGljIGdldEluc3RhbmNlKHsgbG9nSWQgfSkge1xuICAgIHJldHVybiB0aGlzLmluc3RhbmNlc1tsb2dJZF0gfHwgdGhpcy5pbnN0YW5jZXMuZGVmYXVsdDtcbiAgfVxuXG4gIGFkZExldmVsKGxldmVsLCBpbmRleCA9IHRoaXMubGV2ZWxzLmxlbmd0aCkge1xuICAgIGlmIChpbmRleCAhPT0gZmFsc2UpIHtcbiAgICAgIHRoaXMubGV2ZWxzLnNwbGljZShpbmRleCwgMCwgbGV2ZWwpO1xuICAgIH1cblxuICAgIHRoaXNbbGV2ZWxdID0gKC4uLmFyZ3MpID0+IHRoaXMubG9nRGF0YShhcmdzLCB7IGxldmVsIH0pO1xuICAgIHRoaXMuZnVuY3Rpb25zW2xldmVsXSA9IHRoaXNbbGV2ZWxdO1xuICB9XG5cbiAgY2F0Y2hFcnJvcnMob3B0aW9ucykge1xuICAgIHRoaXMucHJvY2Vzc01lc3NhZ2UoXG4gICAgICB7XG4gICAgICAgIGRhdGE6IFsnbG9nLmNhdGNoRXJyb3JzIGlzIGRlcHJlY2F0ZWQuIFVzZSBsb2cuZXJyb3JIYW5kbGVyIGluc3RlYWQnXSxcbiAgICAgICAgbGV2ZWw6ICd3YXJuJyxcbiAgICAgIH0sXG4gICAgICB7IHRyYW5zcG9ydHM6IFsnY29uc29sZSddIH0sXG4gICAgKTtcbiAgICByZXR1cm4gdGhpcy5lcnJvckhhbmRsZXIuc3RhcnRDYXRjaGluZyhvcHRpb25zKTtcbiAgfVxuXG4gIGNyZWF0ZShvcHRpb25zKSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xuICAgICAgb3B0aW9ucyA9IHsgbG9nSWQ6IG9wdGlvbnMgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IExvZ2dlcih7XG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgZXJyb3JIYW5kbGVyOiB0aGlzLmVycm9ySGFuZGxlcixcbiAgICAgIGluaXRpYWxpemVGbjogdGhpcy5pbml0aWFsaXplRm4sXG4gICAgICBpc0RldjogdGhpcy5pc0RldixcbiAgICAgIHRyYW5zcG9ydEZhY3RvcmllczogdGhpcy50cmFuc3BvcnRGYWN0b3JpZXMsXG4gICAgICB2YXJpYWJsZXM6IHsgLi4udGhpcy52YXJpYWJsZXMgfSxcbiAgICB9KTtcbiAgfVxuXG4gIGNvbXBhcmVMZXZlbHMocGFzc0xldmVsLCBjaGVja0xldmVsLCBsZXZlbHMgPSB0aGlzLmxldmVscykge1xuICAgIGNvbnN0IHBhc3MgPSBsZXZlbHMuaW5kZXhPZihwYXNzTGV2ZWwpO1xuICAgIGNvbnN0IGNoZWNrID0gbGV2ZWxzLmluZGV4T2YoY2hlY2tMZXZlbCk7XG4gICAgaWYgKGNoZWNrID09PSAtMSB8fCBwYXNzID09PSAtMSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoZWNrIDw9IHBhc3M7XG4gIH1cblxuICBpbml0aWFsaXplKHsgcHJlbG9hZCA9IHRydWUsIHNweVJlbmRlcmVyQ29uc29sZSA9IGZhbHNlIH0gPSB7fSkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZUZuKHsgbG9nZ2VyOiB0aGlzLCBwcmVsb2FkLCBzcHlSZW5kZXJlckNvbnNvbGUgfSk7XG4gIH1cblxuICBsb2dEYXRhKGRhdGEsIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMucHJvY2Vzc01lc3NhZ2UoeyBkYXRhLCAuLi5vcHRpb25zIH0pO1xuICB9XG5cbiAgcHJvY2Vzc01lc3NhZ2UobWVzc2FnZSwgeyB0cmFuc3BvcnRzID0gdGhpcy50cmFuc3BvcnRzIH0gPSB7fSkge1xuICAgIGlmIChtZXNzYWdlLmNtZCA9PT0gJ2Vycm9ySGFuZGxlcicpIHtcbiAgICAgIHRoaXMuZXJyb3JIYW5kbGVyLmhhbmRsZShtZXNzYWdlLmVycm9yLCB7XG4gICAgICAgIGVycm9yTmFtZTogbWVzc2FnZS5lcnJvck5hbWUsXG4gICAgICAgIHByb2Nlc3NUeXBlOiAncmVuZGVyZXInLFxuICAgICAgICBzaG93RGlhbG9nOiBCb29sZWFuKG1lc3NhZ2Uuc2hvd0RpYWxvZyksXG4gICAgICB9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbGV2ZWwgPSBtZXNzYWdlLmxldmVsO1xuICAgIGlmICghdGhpcy5hbGxvd1Vua25vd25MZXZlbCkge1xuICAgICAgbGV2ZWwgPSB0aGlzLmxldmVscy5pbmNsdWRlcyhtZXNzYWdlLmxldmVsKSA/IG1lc3NhZ2UubGV2ZWwgOiAnaW5mbyc7XG4gICAgfVxuXG4gICAgY29uc3Qgbm9ybWFsaXplZE1lc3NhZ2UgPSB7XG4gICAgICBkYXRlOiBuZXcgRGF0ZSgpLFxuICAgICAgLi4ubWVzc2FnZSxcbiAgICAgIGxldmVsLFxuICAgICAgdmFyaWFibGVzOiB7XG4gICAgICAgIC4uLnRoaXMudmFyaWFibGVzLFxuICAgICAgICAuLi5tZXNzYWdlLnZhcmlhYmxlcyxcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIGZvciAoY29uc3QgW3RyYW5zTmFtZSwgdHJhbnNGbl0gb2YgdGhpcy50cmFuc3BvcnRFbnRyaWVzKHRyYW5zcG9ydHMpKSB7XG4gICAgICBpZiAodHlwZW9mIHRyYW5zRm4gIT09ICdmdW5jdGlvbicgfHwgdHJhbnNGbi5sZXZlbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5jb21wYXJlTGV2ZWxzKHRyYW5zRm4ubGV2ZWwsIG1lc3NhZ2UubGV2ZWwpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgYXJyb3ctYm9keS1zdHlsZVxuICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZE1zZyA9IHRoaXMuaG9va3MucmVkdWNlKChtc2csIGhvb2spID0+IHtcbiAgICAgICAgICByZXR1cm4gbXNnID8gaG9vayhtc2csIHRyYW5zRm4sIHRyYW5zTmFtZSkgOiBtc2c7XG4gICAgICAgIH0sIG5vcm1hbGl6ZWRNZXNzYWdlKTtcblxuICAgICAgICBpZiAodHJhbnNmb3JtZWRNc2cpIHtcbiAgICAgICAgICB0cmFuc0ZuKHsgLi4udHJhbnNmb3JtZWRNc2csIGRhdGE6IFsuLi50cmFuc2Zvcm1lZE1zZy5kYXRhXSB9KTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLnByb2Nlc3NJbnRlcm5hbEVycm9yRm4oZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJvY2Vzc0ludGVybmFsRXJyb3JGbihfZSkge1xuICAgIC8vIERvIG5vdGhpbmcgYnkgZGVmYXVsdFxuICB9XG5cbiAgdHJhbnNwb3J0RW50cmllcyh0cmFuc3BvcnRzID0gdGhpcy50cmFuc3BvcnRzKSB7XG4gICAgY29uc3QgdHJhbnNwb3J0QXJyYXkgPSBBcnJheS5pc0FycmF5KHRyYW5zcG9ydHMpXG4gICAgICA/IHRyYW5zcG9ydHNcbiAgICAgIDogT2JqZWN0LmVudHJpZXModHJhbnNwb3J0cyk7XG5cbiAgICByZXR1cm4gdHJhbnNwb3J0QXJyYXlcbiAgICAgIC5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgc3dpdGNoICh0eXBlb2YgaXRlbSkge1xuICAgICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy50cmFuc3BvcnRzW2l0ZW1dID8gW2l0ZW0sIHRoaXMudHJhbnNwb3J0c1tpdGVtXV0gOiBudWxsO1xuICAgICAgICAgIGNhc2UgJ2Z1bmN0aW9uJzpcbiAgICAgICAgICAgIHJldHVybiBbaXRlbS5uYW1lLCBpdGVtXTtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoaXRlbSkgPyBpdGVtIDogbnVsbDtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5maWx0ZXIoQm9vbGVhbik7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMb2dnZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG5jb25zdCBjb25zb2xlRXJyb3IgPSBjb25zb2xlLmVycm9yO1xuXG5jbGFzcyBSZW5kZXJlckVycm9ySGFuZGxlciB7XG4gIGxvZ0ZuID0gbnVsbDtcbiAgb25FcnJvciA9IG51bGw7XG4gIHNob3dEaWFsb2cgPSBmYWxzZTtcbiAgcHJldmVudERlZmF1bHQgPSB0cnVlO1xuXG4gIGNvbnN0cnVjdG9yKHsgbG9nRm4gPSBudWxsIH0gPSB7fSkge1xuICAgIHRoaXMuaGFuZGxlRXJyb3IgPSB0aGlzLmhhbmRsZUVycm9yLmJpbmQodGhpcyk7XG4gICAgdGhpcy5oYW5kbGVSZWplY3Rpb24gPSB0aGlzLmhhbmRsZVJlamVjdGlvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc3RhcnRDYXRjaGluZyA9IHRoaXMuc3RhcnRDYXRjaGluZy5iaW5kKHRoaXMpO1xuICAgIHRoaXMubG9nRm4gPSBsb2dGbjtcbiAgfVxuXG4gIGhhbmRsZShlcnJvciwge1xuICAgIGxvZ0ZuID0gdGhpcy5sb2dGbixcbiAgICBlcnJvck5hbWUgPSAnJyxcbiAgICBvbkVycm9yID0gdGhpcy5vbkVycm9yLFxuICAgIHNob3dEaWFsb2cgPSB0aGlzLnNob3dEaWFsb2csXG4gIH0gPSB7fSkge1xuICAgIHRyeSB7XG4gICAgICBpZiAob25FcnJvcj8uKHsgZXJyb3IsIGVycm9yTmFtZSwgcHJvY2Vzc1R5cGU6ICdyZW5kZXJlcicgfSkgIT09IGZhbHNlKSB7XG4gICAgICAgIGxvZ0ZuKHsgZXJyb3IsIGVycm9yTmFtZSwgc2hvd0RpYWxvZyB9KTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIGNvbnNvbGVFcnJvcihlcnJvcik7XG4gICAgfVxuICB9XG5cbiAgc2V0T3B0aW9ucyh7IGxvZ0ZuLCBvbkVycm9yLCBwcmV2ZW50RGVmYXVsdCwgc2hvd0RpYWxvZyB9KSB7XG4gICAgaWYgKHR5cGVvZiBsb2dGbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5sb2dGbiA9IGxvZ0ZuO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2Ygb25FcnJvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5vbkVycm9yID0gb25FcnJvcjtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHByZXZlbnREZWZhdWx0ID09PSAnYm9vbGVhbicpIHtcbiAgICAgIHRoaXMucHJldmVudERlZmF1bHQgPSBwcmV2ZW50RGVmYXVsdDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHNob3dEaWFsb2cgPT09ICdib29sZWFuJykge1xuICAgICAgdGhpcy5zaG93RGlhbG9nID0gc2hvd0RpYWxvZztcbiAgICB9XG4gIH1cblxuICBzdGFydENhdGNoaW5nKHsgb25FcnJvciwgc2hvd0RpYWxvZyB9ID0ge30pIHtcbiAgICBpZiAodGhpcy5pc0FjdGl2ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuaXNBY3RpdmUgPSB0cnVlO1xuICAgIHRoaXMuc2V0T3B0aW9ucyh7IG9uRXJyb3IsIHNob3dEaWFsb2cgfSk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCAoZXZlbnQpID0+IHtcbiAgICAgIHRoaXMucHJldmVudERlZmF1bHQgJiYgZXZlbnQucHJldmVudERlZmF1bHQ/LigpO1xuICAgICAgdGhpcy5oYW5kbGVFcnJvcihldmVudC5lcnJvciB8fCBldmVudCk7XG4gICAgfSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3VuaGFuZGxlZHJlamVjdGlvbicsIChldmVudCkgPT4ge1xuICAgICAgdGhpcy5wcmV2ZW50RGVmYXVsdCAmJiBldmVudC5wcmV2ZW50RGVmYXVsdD8uKCk7XG4gICAgICB0aGlzLmhhbmRsZVJlamVjdGlvbihldmVudC5yZWFzb24gfHwgZXZlbnQpO1xuICAgIH0pO1xuICB9XG5cbiAgaGFuZGxlRXJyb3IoZXJyb3IpIHtcbiAgICB0aGlzLmhhbmRsZShlcnJvciwgeyBlcnJvck5hbWU6ICdVbmhhbmRsZWQnIH0pO1xuICB9XG5cbiAgaGFuZGxlUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGNvbnN0IGVycm9yID0gcmVhc29uIGluc3RhbmNlb2YgRXJyb3JcbiAgICAgID8gcmVhc29uXG4gICAgICA6IG5ldyBFcnJvcihKU09OLnN0cmluZ2lmeShyZWFzb24pKTtcbiAgICB0aGlzLmhhbmRsZShlcnJvciwgeyBlcnJvck5hbWU6ICdVbmhhbmRsZWQgcmVqZWN0aW9uJyB9KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlbmRlcmVyRXJyb3JIYW5kbGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5cbm1vZHVsZS5leHBvcnRzID0gY29uc29sZVRyYW5zcG9ydFJlbmRlcmVyRmFjdG9yeTtcblxuY29uc3QgY29uc29sZU1ldGhvZHMgPSB7XG4gIGVycm9yOiBjb25zb2xlLmVycm9yLFxuICB3YXJuOiBjb25zb2xlLndhcm4sXG4gIGluZm86IGNvbnNvbGUuaW5mbyxcbiAgdmVyYm9zZTogY29uc29sZS5pbmZvLFxuICBkZWJ1ZzogY29uc29sZS5kZWJ1ZyxcbiAgc2lsbHk6IGNvbnNvbGUuZGVidWcsXG4gIGxvZzogY29uc29sZS5sb2csXG59O1xuXG5mdW5jdGlvbiBjb25zb2xlVHJhbnNwb3J0UmVuZGVyZXJGYWN0b3J5KGxvZ2dlcikge1xuICByZXR1cm4gT2JqZWN0LmFzc2lnbih0cmFuc3BvcnQsIHtcbiAgICBmb3JtYXQ6ICd7aH06e2l9OntzfS57bXN9e3Njb3BlfSDigLoge3RleHR9JyxcblxuICAgIGZvcm1hdERhdGFGbih7XG4gICAgICBkYXRhID0gW10sXG4gICAgICBkYXRlID0gbmV3IERhdGUoKSxcbiAgICAgIGZvcm1hdCA9IHRyYW5zcG9ydC5mb3JtYXQsXG4gICAgICBsb2dJZCA9IGxvZ2dlci5sb2dJZCxcbiAgICAgIHNjb3BlID0gbG9nZ2VyLnNjb3BlTmFtZSxcbiAgICAgIC4uLm1lc3NhZ2VcbiAgICB9KSB7XG4gICAgICBpZiAodHlwZW9mIGZvcm1hdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gZm9ybWF0KHsgLi4ubWVzc2FnZSwgZGF0YSwgZGF0ZSwgbG9nSWQsIHNjb3BlIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGZvcm1hdCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICB9XG5cbiAgICAgIGRhdGEudW5zaGlmdChmb3JtYXQpO1xuXG4gICAgICAvLyBDb25jYXRlbmF0ZSBmaXJzdCB0d28gZGF0YSBpdGVtcyB0byBzdXBwb3J0IHByaW50Zi1saWtlIHRlbXBsYXRlc1xuICAgICAgaWYgKHR5cGVvZiBkYXRhWzFdID09PSAnc3RyaW5nJyAmJiBkYXRhWzFdLm1hdGNoKC8lWzFjZGZpT29zXS8pKSB7XG4gICAgICAgIGRhdGEgPSBbYCR7ZGF0YVswXX0gJHtkYXRhWzFdfWAsIC4uLmRhdGEuc2xpY2UoMildO1xuICAgICAgfVxuXG4gICAgICBkYXRhWzBdID0gZGF0YVswXVxuICAgICAgICAucmVwbGFjZSgvXFx7KFxcdyspfS9nLCAoc3Vic3RyaW5nLCBuYW1lKSA9PiB7XG4gICAgICAgICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICAgICAgICBjYXNlICdsZXZlbCc6IHJldHVybiBtZXNzYWdlLmxldmVsO1xuICAgICAgICAgICAgY2FzZSAnbG9nSWQnOiByZXR1cm4gbG9nSWQ7XG4gICAgICAgICAgICBjYXNlICdzY29wZSc6IHJldHVybiBzY29wZSA/IGAgKCR7c2NvcGV9KWAgOiAnJztcbiAgICAgICAgICAgIGNhc2UgJ3RleHQnOiByZXR1cm4gJyc7XG5cbiAgICAgICAgICAgIGNhc2UgJ3knOiByZXR1cm4gZGF0ZS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKDEwKTtcbiAgICAgICAgICAgIGNhc2UgJ20nOiByZXR1cm4gKGRhdGUuZ2V0TW9udGgoKSArIDEpLnRvU3RyaW5nKDEwKVxuICAgICAgICAgICAgICAucGFkU3RhcnQoMiwgJzAnKTtcbiAgICAgICAgICAgIGNhc2UgJ2QnOiByZXR1cm4gZGF0ZS5nZXREYXRlKCkudG9TdHJpbmcoMTApLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgICAgICAgICBjYXNlICdoJzogcmV0dXJuIGRhdGUuZ2V0SG91cnMoKS50b1N0cmluZygxMCkucGFkU3RhcnQoMiwgJzAnKTtcbiAgICAgICAgICAgIGNhc2UgJ2knOiByZXR1cm4gZGF0ZS5nZXRNaW51dGVzKCkudG9TdHJpbmcoMTApLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgICAgICAgICBjYXNlICdzJzogcmV0dXJuIGRhdGUuZ2V0U2Vjb25kcygpLnRvU3RyaW5nKDEwKS5wYWRTdGFydCgyLCAnMCcpO1xuICAgICAgICAgICAgY2FzZSAnbXMnOiByZXR1cm4gZGF0ZS5nZXRNaWxsaXNlY29uZHMoKS50b1N0cmluZygxMClcbiAgICAgICAgICAgICAgLnBhZFN0YXJ0KDMsICcwJyk7XG4gICAgICAgICAgICBjYXNlICdpc28nOiByZXR1cm4gZGF0ZS50b0lTT1N0cmluZygpO1xuXG4gICAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgIHJldHVybiBtZXNzYWdlLnZhcmlhYmxlcz8uW25hbWVdIHx8IHN1YnN0cmluZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC50cmltKCk7XG5cbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sXG5cbiAgICB3cml0ZUZuKHsgbWVzc2FnZTogeyBsZXZlbCwgZGF0YSB9IH0pIHtcbiAgICAgIGNvbnN0IGNvbnNvbGVMb2dGbiA9IGNvbnNvbGVNZXRob2RzW2xldmVsXSB8fCBjb25zb2xlTWV0aG9kcy5pbmZvO1xuXG4gICAgICAvLyBtYWtlIGFuIGVtcHR5IGNhbGwgc3RhY2tcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gY29uc29sZUxvZ0ZuKC4uLmRhdGEpKTtcbiAgICB9LFxuXG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHRyYW5zcG9ydChtZXNzYWdlKSB7XG4gICAgdHJhbnNwb3J0LndyaXRlRm4oe1xuICAgICAgbWVzc2FnZTogeyAuLi5tZXNzYWdlLCBkYXRhOiB0cmFuc3BvcnQuZm9ybWF0RGF0YUZuKG1lc3NhZ2UpIH0sXG4gICAgfSk7XG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBpcGNUcmFuc3BvcnRSZW5kZXJlckZhY3Rvcnk7XG5cbmNvbnN0IFJFU1RSSUNURURfVFlQRVMgPSBuZXcgU2V0KFtQcm9taXNlLCBXZWFrTWFwLCBXZWFrU2V0XSk7XG5cbmZ1bmN0aW9uIGlwY1RyYW5zcG9ydFJlbmRlcmVyRmFjdG9yeShsb2dnZXIpIHtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24odHJhbnNwb3J0LCB7XG4gICAgZGVwdGg6IDUsXG5cbiAgICBzZXJpYWxpemVGbihkYXRhLCB7IGRlcHRoID0gNSwgc2VlbiA9IG5ldyBXZWFrU2V0KCkgfSA9IHt9KSB7XG4gICAgICBpZiAoZGVwdGggPCAxKSB7XG4gICAgICAgIHJldHVybiBgWyR7dHlwZW9mIGRhdGF9XWA7XG4gICAgICB9XG5cbiAgICAgIGlmIChzZWVuLmhhcyhkYXRhKSkge1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgIH1cblxuICAgICAgaWYgKFsnZnVuY3Rpb24nLCAnc3ltYm9sJ10uaW5jbHVkZXModHlwZW9mIGRhdGEpKSB7XG4gICAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFByaW1pdGl2ZSB0eXBlcyAoaW5jbHVkaW5nIG51bGwgYW5kIHVuZGVmaW5lZClcbiAgICAgIGlmIChPYmplY3QoZGF0YSkgIT09IGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICB9XG5cbiAgICAgIC8vIE9iamVjdCB0eXBlc1xuXG4gICAgICBpZiAoUkVTVFJJQ1RFRF9UWVBFUy5oYXMoZGF0YS5jb25zdHJ1Y3RvcikpIHtcbiAgICAgICAgcmV0dXJuIGBbJHtkYXRhLmNvbnN0cnVjdG9yLm5hbWV9XWA7XG4gICAgICB9XG5cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgIHJldHVybiBkYXRhLm1hcCgoaXRlbSkgPT4gdHJhbnNwb3J0LnNlcmlhbGl6ZUZuKFxuICAgICAgICAgIGl0ZW0sXG4gICAgICAgICAgeyBsZXZlbDogZGVwdGggLSAxLCBzZWVuIH0sXG4gICAgICAgICkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHJldHVybiBkYXRhLnN0YWNrO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICByZXR1cm4gbmV3IE1hcChcbiAgICAgICAgICBBcnJheVxuICAgICAgICAgICAgLmZyb20oZGF0YSlcbiAgICAgICAgICAgIC5tYXAoKFtrZXksIHZhbHVlXSkgPT4gW1xuICAgICAgICAgICAgICB0cmFuc3BvcnQuc2VyaWFsaXplRm4oa2V5LCB7IGxldmVsOiBkZXB0aCAtIDEsIHNlZW4gfSksXG4gICAgICAgICAgICAgIHRyYW5zcG9ydC5zZXJpYWxpemVGbih2YWx1ZSwgeyBsZXZlbDogZGVwdGggLSAxLCBzZWVuIH0pLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGlmIChkYXRhIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgIHJldHVybiBuZXcgU2V0KFxuICAgICAgICAgIEFycmF5LmZyb20oZGF0YSkubWFwKFxuICAgICAgICAgICAgKHZhbCkgPT4gdHJhbnNwb3J0LnNlcmlhbGl6ZUZuKHZhbCwgeyBsZXZlbDogZGVwdGggLSAxLCBzZWVuIH0pLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHNlZW4uYWRkKGRhdGEpO1xuXG4gICAgICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICBPYmplY3QuZW50cmllcyhkYXRhKS5tYXAoXG4gICAgICAgICAgKFtrZXksIHZhbHVlXSkgPT4gW1xuICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgdHJhbnNwb3J0LnNlcmlhbGl6ZUZuKHZhbHVlLCB7IGxldmVsOiBkZXB0aCAtIDEsIHNlZW4gfSksXG4gICAgICAgICAgXSxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfSxcbiAgfSk7XG5cbiAgZnVuY3Rpb24gdHJhbnNwb3J0KG1lc3NhZ2UpIHtcbiAgICBpZiAoIXdpbmRvdy5fX2VsZWN0cm9uTG9nKSB7XG4gICAgICBsb2dnZXIucHJvY2Vzc01lc3NhZ2UoXG4gICAgICAgIHtcbiAgICAgICAgICBkYXRhOiBbJ2VsZWN0cm9uLWxvZzogbG9nZ2VyIGlzblxcJ3QgaW5pdGlhbGl6ZWQgaW4gdGhlIG1haW4gcHJvY2VzcyddLFxuICAgICAgICAgIGxldmVsOiAnZXJyb3InLFxuICAgICAgICB9LFxuICAgICAgICB7IHRyYW5zcG9ydHM6IFsnY29uc29sZSddIH0sXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBfX2VsZWN0cm9uTG9nLnNlbmRUb01haW4odHJhbnNwb3J0LnNlcmlhbGl6ZUZuKG1lc3NhZ2UsIHtcbiAgICAgICAgZGVwdGg6IHRyYW5zcG9ydC5kZXB0aCxcbiAgICAgIH0pKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsb2dnZXIudHJhbnNwb3J0cy5jb25zb2xlKHtcbiAgICAgICAgZGF0YTogWydlbGVjdHJvbkxvZy50cmFuc3BvcnRzLmlwYycsIGUsICdkYXRhOicsIG1lc3NhZ2UuZGF0YV0sXG4gICAgICAgIGxldmVsOiAnZXJyb3InLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IExvZ2dlciA9IHJlcXVpcmUoJy4uL2NvcmUvTG9nZ2VyJyk7XG5jb25zdCBSZW5kZXJlckVycm9ySGFuZGxlciA9IHJlcXVpcmUoJy4vbGliL1JlbmRlcmVyRXJyb3JIYW5kbGVyJyk7XG5jb25zdCB0cmFuc3BvcnRDb25zb2xlID0gcmVxdWlyZSgnLi9saWIvdHJhbnNwb3J0cy9jb25zb2xlJyk7XG5jb25zdCB0cmFuc3BvcnRJcGMgPSByZXF1aXJlKCcuL2xpYi90cmFuc3BvcnRzL2lwYycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUxvZ2dlcigpO1xubW9kdWxlLmV4cG9ydHMuTG9nZ2VyID0gTG9nZ2VyO1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IG1vZHVsZS5leHBvcnRzO1xuXG5mdW5jdGlvbiBjcmVhdGVMb2dnZXIoKSB7XG4gIGNvbnN0IGxvZ2dlciA9IG5ldyBMb2dnZXIoe1xuICAgIGFsbG93VW5rbm93bkxldmVsOiB0cnVlLFxuICAgIGVycm9ySGFuZGxlcjogbmV3IFJlbmRlcmVyRXJyb3JIYW5kbGVyKCksXG4gICAgaW5pdGlhbGl6ZUZuOiAoKSA9PiB7fSxcbiAgICBsb2dJZDogJ2RlZmF1bHQnLFxuICAgIHRyYW5zcG9ydEZhY3Rvcmllczoge1xuICAgICAgY29uc29sZTogdHJhbnNwb3J0Q29uc29sZSxcbiAgICAgIGlwYzogdHJhbnNwb3J0SXBjLFxuICAgIH0sXG4gICAgdmFyaWFibGVzOiB7XG4gICAgICBwcm9jZXNzVHlwZTogJ3JlbmRlcmVyJyxcbiAgICB9LFxuICB9KTtcblxuICBsb2dnZXIuZXJyb3JIYW5kbGVyLnNldE9wdGlvbnMoe1xuICAgIGxvZ0ZuKHsgZXJyb3IsIGVycm9yTmFtZSwgc2hvd0RpYWxvZyB9KSB7XG4gICAgICBsb2dnZXIudHJhbnNwb3J0cy5jb25zb2xlKHtcbiAgICAgICAgZGF0YTogW2Vycm9yTmFtZSwgZXJyb3JdLmZpbHRlcihCb29sZWFuKSxcbiAgICAgICAgbGV2ZWw6ICdlcnJvcicsXG4gICAgICB9KTtcbiAgICAgIGxvZ2dlci50cmFuc3BvcnRzLmlwYyh7XG4gICAgICAgIGNtZDogJ2Vycm9ySGFuZGxlcicsXG4gICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgY2F1c2U6IGVycm9yPy5jYXVzZSxcbiAgICAgICAgICBjb2RlOiBlcnJvcj8uY29kZSxcbiAgICAgICAgICBuYW1lOiBlcnJvcj8ubmFtZSxcbiAgICAgICAgICBtZXNzYWdlOiBlcnJvcj8ubWVzc2FnZSxcbiAgICAgICAgICBzdGFjazogZXJyb3I/LnN0YWNrLFxuICAgICAgICB9LFxuICAgICAgICBlcnJvck5hbWUsXG4gICAgICAgIGxvZ0lkOiBsb2dnZXIubG9nSWQsXG4gICAgICAgIHNob3dEaWFsb2csXG4gICAgICB9KTtcbiAgICB9LFxuICB9KTtcblxuICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIChldmVudCkgPT4ge1xuICAgICAgY29uc3QgeyBjbWQsIGxvZ0lkLCAuLi5tZXNzYWdlIH0gPSBldmVudC5kYXRhIHx8IHt9O1xuICAgICAgY29uc3QgaW5zdGFuY2UgPSBMb2dnZXIuZ2V0SW5zdGFuY2UoeyBsb2dJZCB9KTtcblxuICAgICAgaWYgKGNtZCA9PT0gJ21lc3NhZ2UnKSB7XG4gICAgICAgIGluc3RhbmNlLnByb2Nlc3NNZXNzYWdlKG1lc3NhZ2UsIHsgdHJhbnNwb3J0czogWydjb25zb2xlJ10gfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvLyBUbyBzdXBwb3J0IGN1c3RvbSBsZXZlbHNcbiAgcmV0dXJuIG5ldyBQcm94eShsb2dnZXIsIHtcbiAgICBnZXQodGFyZ2V0LCBwcm9wKSB7XG4gICAgICBpZiAodHlwZW9mIHRhcmdldFtwcm9wXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wXTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuICguLi5kYXRhKSA9PiBsb2dnZXIubG9nRGF0YShkYXRhLCB7IGxldmVsOiBwcm9wIH0pO1xuICAgIH0sXG4gIH0pO1xufVxuIiwiaW1wb3J0IGxvZyBmcm9tICdlbGVjdHJvbi1sb2cnO1xuaW1wb3J0IHsgaXNEZXYgfSBmcm9tICcuL3V0aWxzJztcblxuLy8gbG9nc1xuaWYgKCFpc0Rldikge1xuICBsb2cudHJhbnNwb3J0cy5maWxlLmxldmVsID0gXCJ2ZXJib3NlXCI7XG59XG5cbi8vIGVyciBoYW5kbGVcbnByb2Nlc3Mub24oJ3VuaGFuZGxlZFJlamVjdGlvbicsIGxvZy5lcnJvcik7IiwiaW1wb3J0IHsgTWVzc2FnZUJveE9wdGlvbnMsIGFwcCwgYXV0b1VwZGF0ZXIsIGRpYWxvZyB9IGZyb20gXCJlbGVjdHJvblwiO1xuaW1wb3J0IGxvZyBmcm9tICdlbGVjdHJvbi1sb2cnO1xuXG4vLyBjb25zdCBpc01hY09TID0gZmFsc2U7XG5pbXBvcnQgaXNEZXYgZnJvbSBcImVsZWN0cm9uLWlzLWRldlwiO1xuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRBdXRvVXBkYXRlcigpIHtcbiAgICAvLyBIYW5kbGUgY3JlYXRpbmcvcmVtb3Zpbmcgc2hvcnRjdXRzIG9uIFdpbmRvd3Mgd2hlbiBpbnN0YWxsaW5nL3VuaW5zdGFsbGluZy5cbiAgICBpZiAocmVxdWlyZSgnZWxlY3Ryb24tc3F1aXJyZWwtc3RhcnR1cCcpKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZ2xvYmFsLXJlcXVpcmVcbiAgICAgICAgYXBwLnF1aXQoKTtcbiAgICB9XG4gICAgaWYgKCFpc0Rldikge1xuICAgICAgICBjb25zdCBzZXJ2ZXIgPSBcImh0dHBzOi8vcmVmaS11cGRhdGVyLnZlcmNlbC5hcHBcIjtcbiAgICAgICAgY29uc3QgZmVlZCA9IGAke3NlcnZlcn0vdXBkYXRlLyR7cHJvY2Vzcy5wbGF0Zm9ybX0vJHthcHAuZ2V0VmVyc2lvbigpfWBcbiAgICBcbiAgICAgICAgYXV0b1VwZGF0ZXIuc2V0RmVlZFVSTCh7IHVybDogZmVlZCwgc2VydmVyVHlwZTogXCJqc29uXCIgfSlcbiAgICBcbiAgICAgICAgc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgYXV0b1VwZGF0ZXIuY2hlY2tGb3JVcGRhdGVzKClcbiAgICAgICAgfSwgNjAwMDApO1xuICAgIFxuICAgICAgICBhdXRvVXBkYXRlci5vbigndXBkYXRlLWRvd25sb2FkZWQnLCAoXywgcmVsZWFzZU5vdGVzLCByZWxlYXNlTmFtZSkgPT4ge1xuICAgICAgICAgICAgbG9nLmRlYnVnKCdEb3dubG9hZGVkIG5ldyB1cGRhdGUnKTtcbiAgICAgICAgICAgIGNvbnN0IGRpYWxvZ09wdHM6IE1lc3NhZ2VCb3hPcHRpb25zID0ge1xuICAgICAgICAgICAgdHlwZTogJ2luZm8nLFxuICAgICAgICAgICAgYnV0dG9uczogWydSZXN0YXJ0JywgJ0xhdGVyJ10sXG4gICAgICAgICAgICB0aXRsZTogJ0FwcGxpY2F0aW9uIFVwZGF0ZScsXG4gICAgICAgICAgICBtZXNzYWdlOiBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInID8gcmVsZWFzZU5vdGVzIDogcmVsZWFzZU5hbWUsXG4gICAgICAgICAgICBkZXRhaWw6ICdBIG5ldyB2ZXJzaW9uIGhhcyBiZWVuIGRvd25sb2FkZWQuIFJlc3RhcnQgdGhlIGFwcGxpY2F0aW9uIHRvIGFwcGx5IHRoZSB1cGRhdGVzLidcbiAgICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICAgIGRpYWxvZy5zaG93TWVzc2FnZUJveChkaWFsb2dPcHRzKS50aGVuKChyZXR1cm5WYWx1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHJldHVyblZhbHVlLnJlc3BvbnNlID09PSAwKSBhdXRvVXBkYXRlci5xdWl0QW5kSW5zdGFsbCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgYXV0b1VwZGF0ZXIub24oJ2Vycm9yJywgbWVzc2FnZSA9PiB7XG4gICAgICAgICAgICBsb2cuZXJyb3IoJ1RoZXJlIHdhcyBhIHByb2JsZW0gdXBkYXRpbmcgdGhlIGFwcGxpY2F0aW9uJylcbiAgICAgICAgICAgIGxvZy5lcnJvcihtZXNzYWdlKVxuICAgICAgICB9KVxuICAgIH0gXG59XG5cblxuIiwiaW1wb3J0IHsgSXBjTWFpbkV2ZW50LCBpcGNNYWluIH0gZnJvbSBcImVsZWN0cm9uXCJcblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0SVBDKCkge1xuICAvLyBsaXN0ZW4gdGhlIGNoYW5uZWwgYG1lc3NhZ2VgIGFuZCByZXNlbmQgdGhlIHJlY2VpdmVkIG1lc3NhZ2UgdG8gdGhlIHJlbmRlcmVyIHByb2Nlc3NcbiAgaXBjTWFpbi5vbignbWVzc2FnZScsIChldmVudDogSXBjTWFpbkV2ZW50LCBtZXNzYWdlOiBhbnkpID0+IHtcbiAgICBjb25zb2xlLmxvZyhtZXNzYWdlKVxuICAgIHNldFRpbWVvdXQoKCkgPT4gZXZlbnQuc2VuZGVyLnNlbmQoJ21lc3NhZ2UnLCAnaGkgZnJvbSBlbGVjdHJvbicpLCA1MDApXG4gIH0pXG59XG4iLCJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgYXBwIH0gZnJvbSAnZWxlY3Ryb24nXG4vLyBpbXBvcnQgcHJlcGFyZU5leHQgZnJvbSAnZWxlY3Ryb24tbmV4dCdcbmltcG9ydCB7IGNyZWF0ZU1haW5XaW5kb3csIHJlc3RvcmVPckNyZWF0ZVdpbmRvdyB9IGZyb20gXCIuL3dpbmRvd3MtbWFuYWdlclwiO1xuaW1wb3J0IFwiLi9wcmVsYXVuY2hcIjtcbmltcG9ydCB7IHN0YXJ0QXV0b1VwZGF0ZXIgfSBmcm9tICcuL2F1dG8tdXBkYXRlJztcbmltcG9ydCB7IHN0YXJ0SVBDIH0gZnJvbSAnLi9pcGMnO1xuXG4vLyBQcmVwYXJlIHRoZSByZW5kZXJlciBvbmNlIHRoZSBhcHAgaXMgcmVhZHlcbmNvbnN0IHJlbmRlcmVyUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsIFwiLi4vcmVuZGVyZXJcIik7XG5jb25zb2xlLmxvZyhcInN0YXJ0ZWQ6XCIsIHJlbmRlcmVyUGF0aCk7XG5cbi8qKlxuICogRGlzYWJsZSBIYXJkd2FyZSBBY2NlbGVyYXRpb24gZm9yIG1vcmUgcG93ZXItc2F2ZVxuICovXG5hcHAuZGlzYWJsZUhhcmR3YXJlQWNjZWxlcmF0aW9uKCk7XG5cbmFwcC5vbigncmVhZHknLCBhc3luYyAoKSA9PiB7XG4gIC8vIHJ1biBuZXh0IGZyb250ZW5kIHNlcnZpY2VcbiAgLy8gYXdhaXQgcHJlcGFyZU5leHQocmVuZGVyZXJQYXRoKVxuXG4gIC8vIHN0YXJ0IGRlc2t0b3Agd2luZG93XG4gIGF3YWl0IGNyZWF0ZU1haW5XaW5kb3coKTtcblxuICAvLyBtZXNzYWdlIGh1YlxuICBzdGFydElQQygpO1xuXG4gIC8vIGF1dG8gdXBkYXRlIGxpc3RlbmVyXG4gIHN0YXJ0QXV0b1VwZGF0ZXIoKVxufSlcblxuLy8gUXVpdCB0aGUgYXBwIG9uY2UgYWxsIHdpbmRvd3MgYXJlIGNsb3NlZFxuYXBwLm9uKCd3aW5kb3ctYWxsLWNsb3NlZCcsIGFwcC5xdWl0KVxuXG5hcHAub24oXCJhY3RpdmF0ZVwiLCByZXN0b3JlT3JDcmVhdGVXaW5kb3cpO1xuXG4iXSwibmFtZXMiOlsicmVxdWlyZSQkMCIsImNyeXB0byIsImlzRGV2IiwiZm9ybWF0IiwicGF0aCIsIkJyb3dzZXJXaW5kb3ciLCJCcm93c2VyVmlldyIsInNjb3BlRmFjdG9yeSIsInJlcXVpcmUkJDEiLCJyZXF1aXJlJCQyIiwicmVxdWlyZSQkMyIsImFwcCIsImF1dG9VcGRhdGVyIiwiZGlhbG9nIiwiaXBjTWFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsTUFBTSxXQUFXQSxvQkFBQUE7QUFFakIsSUFBSSxPQUFPLGFBQWEsVUFBVTtBQUNqQyxRQUFNLElBQUksVUFBVTtBQUFBO0FBR3JCLE1BQU0sTUFBTSxTQUFTLE9BQU8sU0FBUyxPQUFPO0FBRTVDLE1BQU0sV0FBVyxxQkFBcUIsUUFBUTtBQUM5QyxNQUFNLGFBQWEsWUFBcUIsaUJBQWlCLFFBQVE7SUFFakUsZ0JBQWlCLFdBQVcsYUFBYSxDQUFDLElBQUk7QUNaOUMsTUFBTSxVQUFVLFFBQVEsYUFBYTtBQU9kLGdCQUFBO0FBQ25CLFNBQU9DLGdCQUFBQSxXQUFPO0FBQUE7QUNVbEIsSUFBSSxhQUFnQztBQUNwQyxJQUFJO0FBQ0osTUFBTSxtQkFBbUJDLGdC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
