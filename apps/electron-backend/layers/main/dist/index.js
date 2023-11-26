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
var url = require("url");
function _interopDefaultLegacy(e) {
  return e && typeof e === "object" && "default" in e ? e : { "default": e };
}
var path__default = /* @__PURE__ */ _interopDefaultLegacy(path);
var require$$0__default = /* @__PURE__ */ _interopDefaultLegacy(require$$0);
const electron = require$$0__default["default"];
if (typeof electron === "string") {
  throw new TypeError("Not running in an Electron environment!");
}
const app = electron.app || electron.remote.app;
const isEnvSet = "ELECTRON_IS_DEV" in process.env;
const getFromEnv = parseInt({}.ELECTRON_IS_DEV, 10) === 1;
var electronIsDev = isEnvSet ? getFromEnv : !app.isPackaged;
const isMacOS = process.platform === "darwin";
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}
const byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}
const randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var native = {
  randomUUID
};
function v4(options, buf, offset) {
  if (native.randomUUID && !buf && !options) {
    return native.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
function uuid() {
  return v4();
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
  const windowView = await createWindow(defaultWindowUrl);
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
const rendererPath = path__default["default"].join(__dirname, "../renderer");
console.log("started:", rendererPath);
require$$0.app.disableHardwareAcceleration();
require$$0.app.on("ready", async () => {
  await createMainWindow();
  startAutoUpdater();
});
require$$0.app.on("window-all-closed", require$$0.app.quit);
require$$0.app.on("activate", restoreOrCreateWindow);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9lbGVjdHJvbi1pcy1kZXZAMS4yLjAvbm9kZV9tb2R1bGVzL2VsZWN0cm9uLWlzLWRldi9pbmRleC5qcyIsIi4uL3NyYy91dGlscy50cyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS91dWlkQDkuMC4xL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvcm5nLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3V1aWRAOS4wLjEvbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci9zdHJpbmdpZnkuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vdXVpZEA5LjAuMS9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL25hdGl2ZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS91dWlkQDkuMC4xL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvdjQuanMiLCIuLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vdXRpbHMvdXVpZC50cyIsIi4uL3NyYy93aW5kb3dzLW1hbmFnZXIudHMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZWxlY3Ryb24tbG9nQDUuMC4xL25vZGVfbW9kdWxlcy9lbGVjdHJvbi1sb2cvc3JjL2NvcmUvc2NvcGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZWxlY3Ryb24tbG9nQDUuMC4xL25vZGVfbW9kdWxlcy9lbGVjdHJvbi1sb2cvc3JjL2NvcmUvTG9nZ2VyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2VsZWN0cm9uLWxvZ0A1LjAuMS9ub2RlX21vZHVsZXMvZWxlY3Ryb24tbG9nL3NyYy9yZW5kZXJlci9saWIvUmVuZGVyZXJFcnJvckhhbmRsZXIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZWxlY3Ryb24tbG9nQDUuMC4xL25vZGVfbW9kdWxlcy9lbGVjdHJvbi1sb2cvc3JjL3JlbmRlcmVyL2xpYi90cmFuc3BvcnRzL2NvbnNvbGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZWxlY3Ryb24tbG9nQDUuMC4xL25vZGVfbW9kdWxlcy9lbGVjdHJvbi1sb2cvc3JjL3JlbmRlcmVyL2xpYi90cmFuc3BvcnRzL2lwYy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9lbGVjdHJvbi1sb2dANS4wLjEvbm9kZV9tb2R1bGVzL2VsZWN0cm9uLWxvZy9zcmMvcmVuZGVyZXIvaW5kZXguanMiLCIuLi9zcmMvcHJlbGF1bmNoLnRzIiwiLi4vc3JjL2F1dG8tdXBkYXRlLnRzIiwiLi4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbmNvbnN0IGVsZWN0cm9uID0gcmVxdWlyZSgnZWxlY3Ryb24nKTtcblxuaWYgKHR5cGVvZiBlbGVjdHJvbiA9PT0gJ3N0cmluZycpIHtcblx0dGhyb3cgbmV3IFR5cGVFcnJvcignTm90IHJ1bm5pbmcgaW4gYW4gRWxlY3Ryb24gZW52aXJvbm1lbnQhJyk7XG59XG5cbmNvbnN0IGFwcCA9IGVsZWN0cm9uLmFwcCB8fCBlbGVjdHJvbi5yZW1vdGUuYXBwO1xuXG5jb25zdCBpc0VudlNldCA9ICdFTEVDVFJPTl9JU19ERVYnIGluIHByb2Nlc3MuZW52O1xuY29uc3QgZ2V0RnJvbUVudiA9IHBhcnNlSW50KHByb2Nlc3MuZW52LkVMRUNUUk9OX0lTX0RFViwgMTApID09PSAxO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzRW52U2V0ID8gZ2V0RnJvbUVudiA6ICFhcHAuaXNQYWNrYWdlZDtcbiIsImNvbnN0IGlzTWFjT1MgPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJztcbmltcG9ydCBpc0RldiBmcm9tICdlbGVjdHJvbi1pcy1kZXYnXG5leHBvcnQge1xuICAgIGlzTWFjT1MsXG4gICAgaXNEZXZcbn0iLCIvLyBVbmlxdWUgSUQgY3JlYXRpb24gcmVxdWlyZXMgYSBoaWdoIHF1YWxpdHkgcmFuZG9tICMgZ2VuZXJhdG9yLiBJbiB0aGUgYnJvd3NlciB3ZSB0aGVyZWZvcmVcbi8vIHJlcXVpcmUgdGhlIGNyeXB0byBBUEkgYW5kIGRvIG5vdCBzdXBwb3J0IGJ1aWx0LWluIGZhbGxiYWNrIHRvIGxvd2VyIHF1YWxpdHkgcmFuZG9tIG51bWJlclxuLy8gZ2VuZXJhdG9ycyAobGlrZSBNYXRoLnJhbmRvbSgpKS5cbmxldCBnZXRSYW5kb21WYWx1ZXM7XG5jb25zdCBybmRzOCA9IG5ldyBVaW50OEFycmF5KDE2KTtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJuZygpIHtcbiAgLy8gbGF6eSBsb2FkIHNvIHRoYXQgZW52aXJvbm1lbnRzIHRoYXQgbmVlZCB0byBwb2x5ZmlsbCBoYXZlIGEgY2hhbmNlIHRvIGRvIHNvXG4gIGlmICghZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgLy8gZ2V0UmFuZG9tVmFsdWVzIG5lZWRzIHRvIGJlIGludm9rZWQgaW4gYSBjb250ZXh0IHdoZXJlIFwidGhpc1wiIGlzIGEgQ3J5cHRvIGltcGxlbWVudGF0aW9uLlxuICAgIGdldFJhbmRvbVZhbHVlcyA9IHR5cGVvZiBjcnlwdG8gIT09ICd1bmRlZmluZWQnICYmIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMgJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcy5iaW5kKGNyeXB0byk7XG5cbiAgICBpZiAoIWdldFJhbmRvbVZhbHVlcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKCkgbm90IHN1cHBvcnRlZC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS91dWlkanMvdXVpZCNnZXRyYW5kb212YWx1ZXMtbm90LXN1cHBvcnRlZCcpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBnZXRSYW5kb21WYWx1ZXMocm5kczgpO1xufSIsImltcG9ydCB2YWxpZGF0ZSBmcm9tICcuL3ZhbGlkYXRlLmpzJztcbi8qKlxuICogQ29udmVydCBhcnJheSBvZiAxNiBieXRlIHZhbHVlcyB0byBVVUlEIHN0cmluZyBmb3JtYXQgb2YgdGhlIGZvcm06XG4gKiBYWFhYWFhYWC1YWFhYLVhYWFgtWFhYWC1YWFhYWFhYWFhYWFhcbiAqL1xuXG5jb25zdCBieXRlVG9IZXggPSBbXTtcblxuZm9yIChsZXQgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICBieXRlVG9IZXgucHVzaCgoaSArIDB4MTAwKS50b1N0cmluZygxNikuc2xpY2UoMSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zYWZlU3RyaW5naWZ5KGFyciwgb2Zmc2V0ID0gMCkge1xuICAvLyBOb3RlOiBCZSBjYXJlZnVsIGVkaXRpbmcgdGhpcyBjb2RlISAgSXQncyBiZWVuIHR1bmVkIGZvciBwZXJmb3JtYW5jZVxuICAvLyBhbmQgd29ya3MgaW4gd2F5cyB5b3UgbWF5IG5vdCBleHBlY3QuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdXVpZGpzL3V1aWQvcHVsbC80MzRcbiAgcmV0dXJuIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDJdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgM11dICsgJy0nICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA0XV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDVdXSArICctJyArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgNl1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA3XV0gKyAnLScgKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDhdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgOV1dICsgJy0nICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxMF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxMV1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxMl1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxM11dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxNF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAxNV1dO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnkoYXJyLCBvZmZzZXQgPSAwKSB7XG4gIGNvbnN0IHV1aWQgPSB1bnNhZmVTdHJpbmdpZnkoYXJyLCBvZmZzZXQpOyAvLyBDb25zaXN0ZW5jeSBjaGVjayBmb3IgdmFsaWQgVVVJRC4gIElmIHRoaXMgdGhyb3dzLCBpdCdzIGxpa2VseSBkdWUgdG8gb25lXG4gIC8vIG9mIHRoZSBmb2xsb3dpbmc6XG4gIC8vIC0gT25lIG9yIG1vcmUgaW5wdXQgYXJyYXkgdmFsdWVzIGRvbid0IG1hcCB0byBhIGhleCBvY3RldCAobGVhZGluZyB0b1xuICAvLyBcInVuZGVmaW5lZFwiIGluIHRoZSB1dWlkKVxuICAvLyAtIEludmFsaWQgaW5wdXQgdmFsdWVzIGZvciB0aGUgUkZDIGB2ZXJzaW9uYCBvciBgdmFyaWFudGAgZmllbGRzXG5cbiAgaWYgKCF2YWxpZGF0ZSh1dWlkKSkge1xuICAgIHRocm93IFR5cGVFcnJvcignU3RyaW5naWZpZWQgVVVJRCBpcyBpbnZhbGlkJyk7XG4gIH1cblxuICByZXR1cm4gdXVpZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgc3RyaW5naWZ5OyIsImNvbnN0IHJhbmRvbVVVSUQgPSB0eXBlb2YgY3J5cHRvICE9PSAndW5kZWZpbmVkJyAmJiBjcnlwdG8ucmFuZG9tVVVJRCAmJiBjcnlwdG8ucmFuZG9tVVVJRC5iaW5kKGNyeXB0byk7XG5leHBvcnQgZGVmYXVsdCB7XG4gIHJhbmRvbVVVSURcbn07IiwiaW1wb3J0IG5hdGl2ZSBmcm9tICcuL25hdGl2ZS5qcyc7XG5pbXBvcnQgcm5nIGZyb20gJy4vcm5nLmpzJztcbmltcG9ydCB7IHVuc2FmZVN0cmluZ2lmeSB9IGZyb20gJy4vc3RyaW5naWZ5LmpzJztcblxuZnVuY3Rpb24gdjQob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgaWYgKG5hdGl2ZS5yYW5kb21VVUlEICYmICFidWYgJiYgIW9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmF0aXZlLnJhbmRvbVVVSUQoKTtcbiAgfVxuXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBjb25zdCBybmRzID0gb3B0aW9ucy5yYW5kb20gfHwgKG9wdGlvbnMucm5nIHx8IHJuZykoKTsgLy8gUGVyIDQuNCwgc2V0IGJpdHMgZm9yIHZlcnNpb24gYW5kIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYFxuXG4gIHJuZHNbNl0gPSBybmRzWzZdICYgMHgwZiB8IDB4NDA7XG4gIHJuZHNbOF0gPSBybmRzWzhdICYgMHgzZiB8IDB4ODA7IC8vIENvcHkgYnl0ZXMgdG8gYnVmZmVyLCBpZiBwcm92aWRlZFxuXG4gIGlmIChidWYpIHtcbiAgICBvZmZzZXQgPSBvZmZzZXQgfHwgMDtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTY7ICsraSkge1xuICAgICAgYnVmW29mZnNldCArIGldID0gcm5kc1tpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmO1xuICB9XG5cbiAgcmV0dXJuIHVuc2FmZVN0cmluZ2lmeShybmRzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdjQ7IiwiaW1wb3J0IHsgdjQgYXMgdXVpZHY0IH0gZnJvbSAndXVpZCc7XG5cbi8qKlxuICogVW5pcXVlIFRva2VuIGZvciB1c2VyIGlkXG4gKiBAcmV0dXJucyB7c3RyaW5nfSB1dWlkICDih6ggJzliMWRlYjRkLTNiN2QtNGJhZC05YmRkLTJiMGQ3YjNkY2I2ZCdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHV1VG9rZW5HZW5lcmF0b3IoKTogc3RyaW5nIHtcbiAgcmV0dXJuIHV1aWR2NCgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXVpZCgpOiBzdHJpbmcge1xuICByZXR1cm4gdXVpZHY0KCk7XG59XG4gIiwiaW1wb3J0IHsgQnJvd3NlclZpZXcsIEJyb3dzZXJXaW5kb3cgfSBmcm9tIFwiZWxlY3Ryb25cIjtcbmltcG9ydCBpc0RldiBmcm9tIFwiZWxlY3Ryb24taXMtZGV2XCI7XG5cbmltcG9ydCB7IGlzTWFjT1MgfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IHsgdXVpZCB9IGZyb20gXCJAY29tZmxvd3kvY29tbW9uXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgZm9ybWF0IH0gZnJvbSBcInVybFwiO1xuXG4vLyB0eXBlIGRlZmluZVxuZXhwb3J0IGludGVyZmFjZSBJV2luZG93SW5zdGFuY2Uge1xuICB3aW5kb3c6IEJyb3dzZXJWaWV3O1xuICBuYW1lOiBzdHJpbmc7XG59XG5leHBvcnQgaW50ZXJmYWNlIFRhYkxpc3Qge1xuICB0YWJzOiBzdHJpbmdbXTtcbiAgYWN0aXZlOiBzdHJpbmc7XG59XG5cbi8vIGdvbGJhbCBkYXRhXG5sZXQgbGlzdFdpbmRvdzogSVdpbmRvd0luc3RhbmNlW10gPSBbXTtcbmxldCBtYWluV2luZG93OiBCcm93c2VyV2luZG93O1xuY29uc3QgZGVmYXVsdFdpbmRvd1VybCA9IGlzRGV2XG4gID8gJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCdcbiAgOiBmb3JtYXQoe1xuICAgIHBhdGhuYW1lOiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vcmVuZGVyZXIvb3V0L2luZGV4Lmh0bWwnKSxcbiAgICBwcm90b2NvbDogJ2ZpbGU6JyxcbiAgICBzbGFzaGVzOiB0cnVlLFxuICB9KTtcblxuLyoqXG4gKiBjcmVhdGUgbWFpbiB3aW5kb3cgdG8gbWFuYWdlciB0YWIgd2luZG93c1xuICogaHR0cHM6Ly93d3cuZWxlY3Ryb25qcy5vcmcvZG9jcy9sYXRlc3QvYXBpL2Jyb3dzZXItdmlld1xuICogQHJldHVybnMgXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVNYWluV2luZG93KCkge1xuICBpZiAobWFpbldpbmRvdykge1xuICAgIHJldHVybiBtYWluV2luZG93O1xuICB9XG4gIGNvbnN0IHdpbmRvdyA9IG5ldyBCcm93c2VyV2luZG93KHtcbiAgICBzaG93OiBmYWxzZSxcbiAgICB3aWR0aDogODAwLFxuICAgIGhlaWdodDogNjAwLFxuICAgIGJhY2tncm91bmRDb2xvcjogaXNNYWNPUyA/IFwiI0QxRDVEQlwiIDogXCIjNkI3MjgwXCIsXG4gICAgdGl0bGVCYXJTdHlsZTogaXNNYWNPUyA/ICdoaWRkZW5JbnNldCcgOiAnZGVmYXVsdCcsXG4gICAgZnJhbWU6IGlzTWFjT1MsXG4gICAgd2ViUHJlZmVyZW5jZXM6IHtcbiAgICAgIGRldlRvb2xzOiBpc0RldixcbiAgICAgIC8vIGVuYWJsZVJlbW90ZU1vZHVsZTogZmFsc2UsXG4gICAgICBjb250ZXh0SXNvbGF0aW9uOiBmYWxzZSxcbiAgICAgIG5vZGVJbnRlZ3JhdGlvbjogZmFsc2UsXG4gICAgICBwcmVsb2FkOiBfX2Rpcm5hbWUgKyBcIi9wcmVsb2FkLmpzXCIsXG4gICAgICBkaXNhYmxlRGlhbG9nczogZmFsc2UsXG4gICAgICBzYWZlRGlhbG9nczogdHJ1ZSxcbiAgICAgIGVuYWJsZVdlYlNRTDogZmFsc2UsXG4gICAgfSxcbiAgfSk7XG5cbiAgbWFpbldpbmRvdyA9IHdpbmRvdztcblxuICBpZiAoaXNEZXYpIHtcbiAgICBtYWluV2luZG93LndlYkNvbnRlbnRzLm9wZW5EZXZUb29scyh7IG1vZGU6ICdkZXRhY2gnIH0pXG4gIH1cblxuICB3aW5kb3cub24oJ2Nsb3NlZCcsICgpID0+IHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgbWFpbldpbmRvdyA9IG51bGw7XG4gICAgbGlzdFdpbmRvdy5mb3JFYWNoKGluc3RhbmNlID0+IHtcbiAgICAgIChpbnN0YW5jZS53aW5kb3cud2ViQ29udGVudHMgYXMgYW55KT8uZGVzdHJveSgpIC8vIFRPRE86IGVsZWN0cm9uIGhhdmVuJ3QgbWFrZSBkb2N1bWVudCBmb3IgaXQuIFJlZjogaHR0cHM6Ly9naXRodWIuY29tL2VsZWN0cm9uL2VsZWN0cm9uL2lzc3Vlcy8yNjkyOVxuICAgIH0pO1xuICAgIGxpc3RXaW5kb3cgPSBbXTtcbiAgfSlcblxuICBpZiAoaXNEZXYpIHtcbiAgICB3aW5kb3cubG9hZFVSTChgJHtkZWZhdWx0V2luZG93VXJsfS90YWJzYCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gVE9ETzogV2hhdCBpZiBJIG5lZWQgdG8gbG9hZCB0aGUgdGFicy5odG1sIGZpbGVcbiAgICB3aW5kb3cubG9hZFVSTChcImFwcDovLy0vdGFic1wiKTtcbiAgfVxuXG4gIC8vIHdpbmRvdy5tYXhpbWl6ZSgpO1xuICB3aW5kb3cuc2hvdygpO1xuXG4gIGNvbnN0IHdpbmRvd1ZpZXcgPSBhd2FpdCBjcmVhdGVXaW5kb3coZGVmYXVsdFdpbmRvd1VybCk7XG4gIHNldFRhYih3aW5kb3dWaWV3KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVdpbmRvdyhocmVmOiBzdHJpbmcpIHtcbiAgLy8gQ3JlYXRlIHRoZSBicm93c2VyIHZpZXcuXG4gIGNvbnN0IHdpbmRvdyA9IG5ldyBCcm93c2VyVmlldyh7XG4gICAgd2ViUHJlZmVyZW5jZXM6IHtcbiAgICAgIGRldlRvb2xzOiBpc0RldixcbiAgICAgIGNvbnRleHRJc29sYXRpb246IGZhbHNlLFxuICAgICAgbm9kZUludGVncmF0aW9uOiBmYWxzZSxcbiAgICAgIHByZWxvYWQ6IF9fZGlybmFtZSArIFwiL3ByZWxvYWQuanNcIixcbiAgICAgIGRpc2FibGVEaWFsb2dzOiBmYWxzZSxcbiAgICAgIHNhZmVEaWFsb2dzOiB0cnVlLFxuICAgICAgZW5hYmxlV2ViU1FMOiBmYWxzZSxcbiAgICB9LFxuICB9KTtcblxuICB3aW5kb3cud2ViQ29udGVudHMubG9hZFVSTChocmVmKTtcblxuICBpZiAoaXNEZXYpIHtcbiAgICB3aW5kb3cud2ViQ29udGVudHMub3BlbkRldlRvb2xzKHsgbW9kZTogJ2RldGFjaCcgfSlcbiAgfVxuXG4gIHdpbmRvdy53ZWJDb250ZW50cy5vbihcImRpZC1maW5pc2gtbG9hZFwiLCAoKSA9PiB7XG4gICAgLy8gd2luZG93LndlYkNvbnRlbnRzLnNlbmQoXCJzZXQtc29ja2V0XCIsIHt9KTtcbiAgfSk7XG5cbiAgbGlzdFdpbmRvdy5wdXNoKHtcbiAgICB3aW5kb3csXG4gICAgbmFtZTogYFRhYi0ke3V1aWQoKX1gXG4gIH0pO1xuXG4gIG1haW5XaW5kb3chLndlYkNvbnRlbnRzLnNlbmQoJ3RhYkNoYW5nZScsIGdldFRhYkRhdGEoKSk7XG4gIHJldHVybiB3aW5kb3c7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFiRGF0YSgpOiBUYWJMaXN0e1xuICByZXR1cm4ge1xuICAgIHRhYnM6IGxpc3RXaW5kb3cubWFwKChpbnN0YW5jZSkgPT4gaW5zdGFuY2UubmFtZSksXG4gICAgYWN0aXZlOiBsaXN0V2luZG93LmZpbmQoKGluc3RhbmNlKSA9PiBpbnN0YW5jZS53aW5kb3cud2ViQ29udGVudHMuaWQgPT09IG1haW5XaW5kb3chLmdldEJyb3dzZXJWaWV3KCk/LndlYkNvbnRlbnRzPy5pZCk/Lm5hbWUgfHwgJydcbiAgfVxufVxuXG4vLyBTZXQgYWN0aXZlIHRhYlxuZXhwb3J0IGZ1bmN0aW9uIHNldFRhYihpbnN0YW5jZTogQnJvd3NlclZpZXcpIHtcbiAgbWFpbldpbmRvdyEuc2V0QnJvd3NlclZpZXcoaW5zdGFuY2UpO1xuICBpbnN0YW5jZS5zZXRCb3VuZHMoeyB4OiAwLCB5OiAzNiwgd2lkdGg6IG1haW5XaW5kb3chLmdldEJvdW5kcygpLndpZHRoLCBoZWlnaHQ6IG1haW5XaW5kb3chLmdldEJvdW5kcygpLmhlaWdodCAtIDM2IH0pXG4gIGluc3RhbmNlLnNldEF1dG9SZXNpemUoeyB3aWR0aDogdHJ1ZSwgaGVpZ2h0OiB0cnVlLCBob3Jpem9udGFsOiBmYWxzZSwgdmVydGljYWw6IGZhbHNlIH0pO1xuICBtYWluV2luZG93IS53ZWJDb250ZW50cy5zZW5kKCd0YWJDaGFuZ2UnLCBnZXRUYWJEYXRhKCkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbmV3VGFiKCl7XG4gIGNvbnN0IHdpbmRvdyA9IGF3YWl0IGNyZWF0ZVdpbmRvdyhtYWluV2luZG93LmdldEJyb3dzZXJWaWV3KCk/LndlYkNvbnRlbnRzLmdldFVSTCgpISk7XG4gIHNldFRhYih3aW5kb3cpO1xufVxuXG4vKipcbiAqIFJlc3RvcmUgZXhpc3RpbmcgQnJvd3NlcldpbmRvdyBvciBDcmVhdGUgbmV3IEJyb3dzZXJXaW5kb3dcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc3RvcmVPckNyZWF0ZVdpbmRvdygpIHtcbiAgbGV0IHdpbmRvdyA9IG1haW5XaW5kb3c7XG5cbiAgaWYgKHdpbmRvdyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYXdhaXQgY3JlYXRlTWFpbldpbmRvdygpO1xuICAgIHdpbmRvdyA9IG1haW5XaW5kb3c7XG4gIH1cblxuICBpZiAod2luZG93LmlzTWluaW1pemVkKCkpIHtcbiAgICB3aW5kb3cucmVzdG9yZSgpO1xuICB9XG5cbiAgd2luZG93LmZvY3VzKCk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gc2NvcGVGYWN0b3J5O1xuXG5mdW5jdGlvbiBzY29wZUZhY3RvcnkobG9nZ2VyKSB7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhzY29wZSwge1xuICAgIGRlZmF1bHRMYWJlbDogeyB2YWx1ZTogJycsIHdyaXRhYmxlOiB0cnVlIH0sXG4gICAgbGFiZWxQYWRkaW5nOiB7IHZhbHVlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9LFxuICAgIG1heExhYmVsTGVuZ3RoOiB7IHZhbHVlOiAwLCB3cml0YWJsZTogdHJ1ZSB9LFxuICAgIGxhYmVsTGVuZ3RoOiB7XG4gICAgICBnZXQoKSB7XG4gICAgICAgIHN3aXRjaCAodHlwZW9mIHNjb3BlLmxhYmVsUGFkZGluZykge1xuICAgICAgICAgIGNhc2UgJ2Jvb2xlYW4nOiByZXR1cm4gc2NvcGUubGFiZWxQYWRkaW5nID8gc2NvcGUubWF4TGFiZWxMZW5ndGggOiAwO1xuICAgICAgICAgIGNhc2UgJ251bWJlcic6IHJldHVybiBzY29wZS5sYWJlbFBhZGRpbmc7XG4gICAgICAgICAgZGVmYXVsdDogcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgZnVuY3Rpb24gc2NvcGUobGFiZWwpIHtcbiAgICBzY29wZS5tYXhMYWJlbExlbmd0aCA9IE1hdGgubWF4KHNjb3BlLm1heExhYmVsTGVuZ3RoLCBsYWJlbC5sZW5ndGgpO1xuXG4gICAgY29uc3QgbmV3U2NvcGUgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGxldmVsIG9mIFsuLi5sb2dnZXIubGV2ZWxzLCAnbG9nJ10pIHtcbiAgICAgIG5ld1Njb3BlW2xldmVsXSA9ICguLi5kKSA9PiBsb2dnZXIubG9nRGF0YShkLCB7IGxldmVsLCBzY29wZTogbGFiZWwgfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXdTY29wZTtcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBzY29wZUZhY3RvcnkgPSByZXF1aXJlKCcuL3Njb3BlJyk7XG5cbi8qKlxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gZXJyb3JcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IHdhcm5cbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGluZm9cbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IHZlcmJvc2VcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGRlYnVnXG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBzaWxseVxuICovXG5jbGFzcyBMb2dnZXIge1xuICBzdGF0aWMgaW5zdGFuY2VzID0ge307XG5cbiAgZXJyb3JIYW5kbGVyID0gbnVsbDtcbiAgZXZlbnRMb2dnZXIgPSBudWxsO1xuICBmdW5jdGlvbnMgPSB7fTtcbiAgaG9va3MgPSBbXTtcbiAgaXNEZXYgPSBmYWxzZTtcbiAgbGV2ZWxzID0gbnVsbDtcbiAgbG9nSWQgPSBudWxsO1xuICBzY29wZSA9IG51bGw7XG4gIHRyYW5zcG9ydHMgPSB7fTtcbiAgdmFyaWFibGVzID0ge307XG5cbiAgY29uc3RydWN0b3Ioe1xuICAgIGFsbG93VW5rbm93bkxldmVsID0gZmFsc2UsXG4gICAgZXJyb3JIYW5kbGVyLFxuICAgIGV2ZW50TG9nZ2VyLFxuICAgIGluaXRpYWxpemVGbixcbiAgICBpc0RldiA9IGZhbHNlLFxuICAgIGxldmVscyA9IFsnZXJyb3InLCAnd2FybicsICdpbmZvJywgJ3ZlcmJvc2UnLCAnZGVidWcnLCAnc2lsbHknXSxcbiAgICBsb2dJZCxcbiAgICB0cmFuc3BvcnRGYWN0b3JpZXMgPSB7fSxcbiAgICB2YXJpYWJsZXMsXG4gIH0gPSB7fSkge1xuICAgIHRoaXMuYWRkTGV2ZWwgPSB0aGlzLmFkZExldmVsLmJpbmQodGhpcyk7XG4gICAgdGhpcy5jcmVhdGUgPSB0aGlzLmNyZWF0ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMubG9nRGF0YSA9IHRoaXMubG9nRGF0YS5iaW5kKHRoaXMpO1xuICAgIHRoaXMucHJvY2Vzc01lc3NhZ2UgPSB0aGlzLnByb2Nlc3NNZXNzYWdlLmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLmFsbG93VW5rbm93bkxldmVsID0gYWxsb3dVbmtub3duTGV2ZWw7XG4gICAgdGhpcy5pbml0aWFsaXplRm4gPSBpbml0aWFsaXplRm47XG4gICAgdGhpcy5pc0RldiA9IGlzRGV2O1xuICAgIHRoaXMubGV2ZWxzID0gbGV2ZWxzO1xuICAgIHRoaXMubG9nSWQgPSBsb2dJZDtcbiAgICB0aGlzLnRyYW5zcG9ydEZhY3RvcmllcyA9IHRyYW5zcG9ydEZhY3RvcmllcztcbiAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcyB8fCB7fTtcbiAgICB0aGlzLnNjb3BlID0gc2NvcGVGYWN0b3J5KHRoaXMpO1xuXG4gICAgdGhpcy5hZGRMZXZlbCgnbG9nJywgZmFsc2UpO1xuICAgIGZvciAoY29uc3QgbmFtZSBvZiB0aGlzLmxldmVscykge1xuICAgICAgdGhpcy5hZGRMZXZlbChuYW1lLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgdGhpcy5lcnJvckhhbmRsZXIgPSBlcnJvckhhbmRsZXI7XG4gICAgZXJyb3JIYW5kbGVyPy5zZXRPcHRpb25zKHsgbG9nRm46IHRoaXMuZXJyb3IgfSk7XG5cbiAgICB0aGlzLmV2ZW50TG9nZ2VyID0gZXZlbnRMb2dnZXI7XG4gICAgZXZlbnRMb2dnZXI/LnNldE9wdGlvbnMoeyBsb2dnZXI6IHRoaXMgfSk7XG5cbiAgICBmb3IgKGNvbnN0IFtuYW1lLCBmYWN0b3J5XSBvZiBPYmplY3QuZW50cmllcyh0cmFuc3BvcnRGYWN0b3JpZXMpKSB7XG4gICAgICB0aGlzLnRyYW5zcG9ydHNbbmFtZV0gPSBmYWN0b3J5KHRoaXMpO1xuICAgIH1cblxuICAgIExvZ2dlci5pbnN0YW5jZXNbbG9nSWRdID0gdGhpcztcbiAgfVxuXG4gIHN0YXRpYyBnZXRJbnN0YW5jZSh7IGxvZ0lkIH0pIHtcbiAgICByZXR1cm4gdGhpcy5pbnN0YW5jZXNbbG9nSWRdIHx8IHRoaXMuaW5zdGFuY2VzLmRlZmF1bHQ7XG4gIH1cblxuICBhZGRMZXZlbChsZXZlbCwgaW5kZXggPSB0aGlzLmxldmVscy5sZW5ndGgpIHtcbiAgICBpZiAoaW5kZXggIT09IGZhbHNlKSB7XG4gICAgICB0aGlzLmxldmVscy5zcGxpY2UoaW5kZXgsIDAsIGxldmVsKTtcbiAgICB9XG5cbiAgICB0aGlzW2xldmVsXSA9ICguLi5hcmdzKSA9PiB0aGlzLmxvZ0RhdGEoYXJncywgeyBsZXZlbCB9KTtcbiAgICB0aGlzLmZ1bmN0aW9uc1tsZXZlbF0gPSB0aGlzW2xldmVsXTtcbiAgfVxuXG4gIGNhdGNoRXJyb3JzKG9wdGlvbnMpIHtcbiAgICB0aGlzLnByb2Nlc3NNZXNzYWdlKFxuICAgICAge1xuICAgICAgICBkYXRhOiBbJ2xvZy5jYXRjaEVycm9ycyBpcyBkZXByZWNhdGVkLiBVc2UgbG9nLmVycm9ySGFuZGxlciBpbnN0ZWFkJ10sXG4gICAgICAgIGxldmVsOiAnd2FybicsXG4gICAgICB9LFxuICAgICAgeyB0cmFuc3BvcnRzOiBbJ2NvbnNvbGUnXSB9LFxuICAgICk7XG4gICAgcmV0dXJuIHRoaXMuZXJyb3JIYW5kbGVyLnN0YXJ0Q2F0Y2hpbmcob3B0aW9ucyk7XG4gIH1cblxuICBjcmVhdGUob3B0aW9ucykge1xuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIG9wdGlvbnMgPSB7IGxvZ0lkOiBvcHRpb25zIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBMb2dnZXIoe1xuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIGVycm9ySGFuZGxlcjogdGhpcy5lcnJvckhhbmRsZXIsXG4gICAgICBpbml0aWFsaXplRm46IHRoaXMuaW5pdGlhbGl6ZUZuLFxuICAgICAgaXNEZXY6IHRoaXMuaXNEZXYsXG4gICAgICB0cmFuc3BvcnRGYWN0b3JpZXM6IHRoaXMudHJhbnNwb3J0RmFjdG9yaWVzLFxuICAgICAgdmFyaWFibGVzOiB7IC4uLnRoaXMudmFyaWFibGVzIH0sXG4gICAgfSk7XG4gIH1cblxuICBjb21wYXJlTGV2ZWxzKHBhc3NMZXZlbCwgY2hlY2tMZXZlbCwgbGV2ZWxzID0gdGhpcy5sZXZlbHMpIHtcbiAgICBjb25zdCBwYXNzID0gbGV2ZWxzLmluZGV4T2YocGFzc0xldmVsKTtcbiAgICBjb25zdCBjaGVjayA9IGxldmVscy5pbmRleE9mKGNoZWNrTGV2ZWwpO1xuICAgIGlmIChjaGVjayA9PT0gLTEgfHwgcGFzcyA9PT0gLTEpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBjaGVjayA8PSBwYXNzO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSh7IHByZWxvYWQgPSB0cnVlLCBzcHlSZW5kZXJlckNvbnNvbGUgPSBmYWxzZSB9ID0ge30pIHtcbiAgICB0aGlzLmluaXRpYWxpemVGbih7IGxvZ2dlcjogdGhpcywgcHJlbG9hZCwgc3B5UmVuZGVyZXJDb25zb2xlIH0pO1xuICB9XG5cbiAgbG9nRGF0YShkYXRhLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLnByb2Nlc3NNZXNzYWdlKHsgZGF0YSwgLi4ub3B0aW9ucyB9KTtcbiAgfVxuXG4gIHByb2Nlc3NNZXNzYWdlKG1lc3NhZ2UsIHsgdHJhbnNwb3J0cyA9IHRoaXMudHJhbnNwb3J0cyB9ID0ge30pIHtcbiAgICBpZiAobWVzc2FnZS5jbWQgPT09ICdlcnJvckhhbmRsZXInKSB7XG4gICAgICB0aGlzLmVycm9ySGFuZGxlci5oYW5kbGUobWVzc2FnZS5lcnJvciwge1xuICAgICAgICBlcnJvck5hbWU6IG1lc3NhZ2UuZXJyb3JOYW1lLFxuICAgICAgICBwcm9jZXNzVHlwZTogJ3JlbmRlcmVyJyxcbiAgICAgICAgc2hvd0RpYWxvZzogQm9vbGVhbihtZXNzYWdlLnNob3dEaWFsb2cpLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGxldmVsID0gbWVzc2FnZS5sZXZlbDtcbiAgICBpZiAoIXRoaXMuYWxsb3dVbmtub3duTGV2ZWwpIHtcbiAgICAgIGxldmVsID0gdGhpcy5sZXZlbHMuaW5jbHVkZXMobWVzc2FnZS5sZXZlbCkgPyBtZXNzYWdlLmxldmVsIDogJ2luZm8nO1xuICAgIH1cblxuICAgIGNvbnN0IG5vcm1hbGl6ZWRNZXNzYWdlID0ge1xuICAgICAgZGF0ZTogbmV3IERhdGUoKSxcbiAgICAgIC4uLm1lc3NhZ2UsXG4gICAgICBsZXZlbCxcbiAgICAgIHZhcmlhYmxlczoge1xuICAgICAgICAuLi50aGlzLnZhcmlhYmxlcyxcbiAgICAgICAgLi4ubWVzc2FnZS52YXJpYWJsZXMsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICBmb3IgKGNvbnN0IFt0cmFuc05hbWUsIHRyYW5zRm5dIG9mIHRoaXMudHJhbnNwb3J0RW50cmllcyh0cmFuc3BvcnRzKSkge1xuICAgICAgaWYgKHR5cGVvZiB0cmFuc0ZuICE9PSAnZnVuY3Rpb24nIHx8IHRyYW5zRm4ubGV2ZWwgPT09IGZhbHNlKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuY29tcGFyZUxldmVscyh0cmFuc0ZuLmxldmVsLCBtZXNzYWdlLmxldmVsKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGFycm93LWJvZHktc3R5bGVcbiAgICAgICAgY29uc3QgdHJhbnNmb3JtZWRNc2cgPSB0aGlzLmhvb2tzLnJlZHVjZSgobXNnLCBob29rKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG1zZyA/IGhvb2sobXNnLCB0cmFuc0ZuLCB0cmFuc05hbWUpIDogbXNnO1xuICAgICAgICB9LCBub3JtYWxpemVkTWVzc2FnZSk7XG5cbiAgICAgICAgaWYgKHRyYW5zZm9ybWVkTXNnKSB7XG4gICAgICAgICAgdHJhbnNGbih7IC4uLnRyYW5zZm9ybWVkTXNnLCBkYXRhOiBbLi4udHJhbnNmb3JtZWRNc2cuZGF0YV0gfSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5wcm9jZXNzSW50ZXJuYWxFcnJvckZuKGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByb2Nlc3NJbnRlcm5hbEVycm9yRm4oX2UpIHtcbiAgICAvLyBEbyBub3RoaW5nIGJ5IGRlZmF1bHRcbiAgfVxuXG4gIHRyYW5zcG9ydEVudHJpZXModHJhbnNwb3J0cyA9IHRoaXMudHJhbnNwb3J0cykge1xuICAgIGNvbnN0IHRyYW5zcG9ydEFycmF5ID0gQXJyYXkuaXNBcnJheSh0cmFuc3BvcnRzKVxuICAgICAgPyB0cmFuc3BvcnRzXG4gICAgICA6IE9iamVjdC5lbnRyaWVzKHRyYW5zcG9ydHMpO1xuXG4gICAgcmV0dXJuIHRyYW5zcG9ydEFycmF5XG4gICAgICAubWFwKChpdGVtKSA9PiB7XG4gICAgICAgIHN3aXRjaCAodHlwZW9mIGl0ZW0pIHtcbiAgICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0c1tpdGVtXSA/IFtpdGVtLCB0aGlzLnRyYW5zcG9ydHNbaXRlbV1dIDogbnVsbDtcbiAgICAgICAgICBjYXNlICdmdW5jdGlvbic6XG4gICAgICAgICAgICByZXR1cm4gW2l0ZW0ubmFtZSwgaXRlbV07XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KGl0ZW0pID8gaXRlbSA6IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuZmlsdGVyKEJvb2xlYW4pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTG9nZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuY29uc3QgY29uc29sZUVycm9yID0gY29uc29sZS5lcnJvcjtcblxuY2xhc3MgUmVuZGVyZXJFcnJvckhhbmRsZXIge1xuICBsb2dGbiA9IG51bGw7XG4gIG9uRXJyb3IgPSBudWxsO1xuICBzaG93RGlhbG9nID0gZmFsc2U7XG4gIHByZXZlbnREZWZhdWx0ID0gdHJ1ZTtcblxuICBjb25zdHJ1Y3Rvcih7IGxvZ0ZuID0gbnVsbCB9ID0ge30pIHtcbiAgICB0aGlzLmhhbmRsZUVycm9yID0gdGhpcy5oYW5kbGVFcnJvci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuaGFuZGxlUmVqZWN0aW9uID0gdGhpcy5oYW5kbGVSZWplY3Rpb24uYmluZCh0aGlzKTtcbiAgICB0aGlzLnN0YXJ0Q2F0Y2hpbmcgPSB0aGlzLnN0YXJ0Q2F0Y2hpbmcuYmluZCh0aGlzKTtcbiAgICB0aGlzLmxvZ0ZuID0gbG9nRm47XG4gIH1cblxuICBoYW5kbGUoZXJyb3IsIHtcbiAgICBsb2dGbiA9IHRoaXMubG9nRm4sXG4gICAgZXJyb3JOYW1lID0gJycsXG4gICAgb25FcnJvciA9IHRoaXMub25FcnJvcixcbiAgICBzaG93RGlhbG9nID0gdGhpcy5zaG93RGlhbG9nLFxuICB9ID0ge30pIHtcbiAgICB0cnkge1xuICAgICAgaWYgKG9uRXJyb3I/Lih7IGVycm9yLCBlcnJvck5hbWUsIHByb2Nlc3NUeXBlOiAncmVuZGVyZXInIH0pICE9PSBmYWxzZSkge1xuICAgICAgICBsb2dGbih7IGVycm9yLCBlcnJvck5hbWUsIHNob3dEaWFsb2cgfSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICBjb25zb2xlRXJyb3IoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIHNldE9wdGlvbnMoeyBsb2dGbiwgb25FcnJvciwgcHJldmVudERlZmF1bHQsIHNob3dEaWFsb2cgfSkge1xuICAgIGlmICh0eXBlb2YgbG9nRm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMubG9nRm4gPSBsb2dGbjtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG9uRXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMub25FcnJvciA9IG9uRXJyb3I7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBwcmV2ZW50RGVmYXVsdCA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICB0aGlzLnByZXZlbnREZWZhdWx0ID0gcHJldmVudERlZmF1bHQ7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBzaG93RGlhbG9nID09PSAnYm9vbGVhbicpIHtcbiAgICAgIHRoaXMuc2hvd0RpYWxvZyA9IHNob3dEaWFsb2c7XG4gICAgfVxuICB9XG5cbiAgc3RhcnRDYXRjaGluZyh7IG9uRXJyb3IsIHNob3dEaWFsb2cgfSA9IHt9KSB7XG4gICAgaWYgKHRoaXMuaXNBY3RpdmUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmlzQWN0aXZlID0gdHJ1ZTtcbiAgICB0aGlzLnNldE9wdGlvbnMoeyBvbkVycm9yLCBzaG93RGlhbG9nIH0pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLnByZXZlbnREZWZhdWx0ICYmIGV2ZW50LnByZXZlbnREZWZhdWx0Py4oKTtcbiAgICAgIHRoaXMuaGFuZGxlRXJyb3IoZXZlbnQuZXJyb3IgfHwgZXZlbnQpO1xuICAgIH0pO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd1bmhhbmRsZWRyZWplY3Rpb24nLCAoZXZlbnQpID0+IHtcbiAgICAgIHRoaXMucHJldmVudERlZmF1bHQgJiYgZXZlbnQucHJldmVudERlZmF1bHQ/LigpO1xuICAgICAgdGhpcy5oYW5kbGVSZWplY3Rpb24oZXZlbnQucmVhc29uIHx8IGV2ZW50KTtcbiAgICB9KTtcbiAgfVxuXG4gIGhhbmRsZUVycm9yKGVycm9yKSB7XG4gICAgdGhpcy5oYW5kbGUoZXJyb3IsIHsgZXJyb3JOYW1lOiAnVW5oYW5kbGVkJyB9KTtcbiAgfVxuXG4gIGhhbmRsZVJlamVjdGlvbihyZWFzb24pIHtcbiAgICBjb25zdCBlcnJvciA9IHJlYXNvbiBpbnN0YW5jZW9mIEVycm9yXG4gICAgICA/IHJlYXNvblxuICAgICAgOiBuZXcgRXJyb3IoSlNPTi5zdHJpbmdpZnkocmVhc29uKSk7XG4gICAgdGhpcy5oYW5kbGUoZXJyb3IsIHsgZXJyb3JOYW1lOiAnVW5oYW5kbGVkIHJlamVjdGlvbicgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZW5kZXJlckVycm9ySGFuZGxlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnNvbGVUcmFuc3BvcnRSZW5kZXJlckZhY3Rvcnk7XG5cbmNvbnN0IGNvbnNvbGVNZXRob2RzID0ge1xuICBlcnJvcjogY29uc29sZS5lcnJvcixcbiAgd2FybjogY29uc29sZS53YXJuLFxuICBpbmZvOiBjb25zb2xlLmluZm8sXG4gIHZlcmJvc2U6IGNvbnNvbGUuaW5mbyxcbiAgZGVidWc6IGNvbnNvbGUuZGVidWcsXG4gIHNpbGx5OiBjb25zb2xlLmRlYnVnLFxuICBsb2c6IGNvbnNvbGUubG9nLFxufTtcblxuZnVuY3Rpb24gY29uc29sZVRyYW5zcG9ydFJlbmRlcmVyRmFjdG9yeShsb2dnZXIpIHtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24odHJhbnNwb3J0LCB7XG4gICAgZm9ybWF0OiAne2h9OntpfTp7c30ue21zfXtzY29wZX0g4oC6IHt0ZXh0fScsXG5cbiAgICBmb3JtYXREYXRhRm4oe1xuICAgICAgZGF0YSA9IFtdLFxuICAgICAgZGF0ZSA9IG5ldyBEYXRlKCksXG4gICAgICBmb3JtYXQgPSB0cmFuc3BvcnQuZm9ybWF0LFxuICAgICAgbG9nSWQgPSBsb2dnZXIubG9nSWQsXG4gICAgICBzY29wZSA9IGxvZ2dlci5zY29wZU5hbWUsXG4gICAgICAuLi5tZXNzYWdlXG4gICAgfSkge1xuICAgICAgaWYgKHR5cGVvZiBmb3JtYXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdCh7IC4uLm1lc3NhZ2UsIGRhdGEsIGRhdGUsIGxvZ0lkLCBzY29wZSB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBmb3JtYXQgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgfVxuXG4gICAgICBkYXRhLnVuc2hpZnQoZm9ybWF0KTtcblxuICAgICAgLy8gQ29uY2F0ZW5hdGUgZmlyc3QgdHdvIGRhdGEgaXRlbXMgdG8gc3VwcG9ydCBwcmludGYtbGlrZSB0ZW1wbGF0ZXNcbiAgICAgIGlmICh0eXBlb2YgZGF0YVsxXSA9PT0gJ3N0cmluZycgJiYgZGF0YVsxXS5tYXRjaCgvJVsxY2RmaU9vc10vKSkge1xuICAgICAgICBkYXRhID0gW2Ake2RhdGFbMF19ICR7ZGF0YVsxXX1gLCAuLi5kYXRhLnNsaWNlKDIpXTtcbiAgICAgIH1cblxuICAgICAgZGF0YVswXSA9IGRhdGFbMF1cbiAgICAgICAgLnJlcGxhY2UoL1xceyhcXHcrKX0vZywgKHN1YnN0cmluZywgbmFtZSkgPT4ge1xuICAgICAgICAgIHN3aXRjaCAobmFtZSkge1xuICAgICAgICAgICAgY2FzZSAnbGV2ZWwnOiByZXR1cm4gbWVzc2FnZS5sZXZlbDtcbiAgICAgICAgICAgIGNhc2UgJ2xvZ0lkJzogcmV0dXJuIGxvZ0lkO1xuICAgICAgICAgICAgY2FzZSAnc2NvcGUnOiByZXR1cm4gc2NvcGUgPyBgICgke3Njb3BlfSlgIDogJyc7XG4gICAgICAgICAgICBjYXNlICd0ZXh0JzogcmV0dXJuICcnO1xuXG4gICAgICAgICAgICBjYXNlICd5JzogcmV0dXJuIGRhdGUuZ2V0RnVsbFllYXIoKS50b1N0cmluZygxMCk7XG4gICAgICAgICAgICBjYXNlICdtJzogcmV0dXJuIChkYXRlLmdldE1vbnRoKCkgKyAxKS50b1N0cmluZygxMClcbiAgICAgICAgICAgICAgLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgICAgICAgICBjYXNlICdkJzogcmV0dXJuIGRhdGUuZ2V0RGF0ZSgpLnRvU3RyaW5nKDEwKS5wYWRTdGFydCgyLCAnMCcpO1xuICAgICAgICAgICAgY2FzZSAnaCc6IHJldHVybiBkYXRlLmdldEhvdXJzKCkudG9TdHJpbmcoMTApLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgICAgICAgICBjYXNlICdpJzogcmV0dXJuIGRhdGUuZ2V0TWludXRlcygpLnRvU3RyaW5nKDEwKS5wYWRTdGFydCgyLCAnMCcpO1xuICAgICAgICAgICAgY2FzZSAncyc6IHJldHVybiBkYXRlLmdldFNlY29uZHMoKS50b1N0cmluZygxMCkucGFkU3RhcnQoMiwgJzAnKTtcbiAgICAgICAgICAgIGNhc2UgJ21zJzogcmV0dXJuIGRhdGUuZ2V0TWlsbGlzZWNvbmRzKCkudG9TdHJpbmcoMTApXG4gICAgICAgICAgICAgIC5wYWRTdGFydCgzLCAnMCcpO1xuICAgICAgICAgICAgY2FzZSAnaXNvJzogcmV0dXJuIGRhdGUudG9JU09TdHJpbmcoKTtcblxuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZS52YXJpYWJsZXM/LltuYW1lXSB8fCBzdWJzdHJpbmc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAudHJpbSgpO1xuXG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9LFxuXG4gICAgd3JpdGVGbih7IG1lc3NhZ2U6IHsgbGV2ZWwsIGRhdGEgfSB9KSB7XG4gICAgICBjb25zdCBjb25zb2xlTG9nRm4gPSBjb25zb2xlTWV0aG9kc1tsZXZlbF0gfHwgY29uc29sZU1ldGhvZHMuaW5mbztcblxuICAgICAgLy8gbWFrZSBhbiBlbXB0eSBjYWxsIHN0YWNrXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IGNvbnNvbGVMb2dGbiguLi5kYXRhKSk7XG4gICAgfSxcblxuICB9KTtcblxuICBmdW5jdGlvbiB0cmFuc3BvcnQobWVzc2FnZSkge1xuICAgIHRyYW5zcG9ydC53cml0ZUZuKHtcbiAgICAgIG1lc3NhZ2U6IHsgLi4ubWVzc2FnZSwgZGF0YTogdHJhbnNwb3J0LmZvcm1hdERhdGFGbihtZXNzYWdlKSB9LFxuICAgIH0pO1xuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gaXBjVHJhbnNwb3J0UmVuZGVyZXJGYWN0b3J5O1xuXG5jb25zdCBSRVNUUklDVEVEX1RZUEVTID0gbmV3IFNldChbUHJvbWlzZSwgV2Vha01hcCwgV2Vha1NldF0pO1xuXG5mdW5jdGlvbiBpcGNUcmFuc3BvcnRSZW5kZXJlckZhY3RvcnkobG9nZ2VyKSB7XG4gIHJldHVybiBPYmplY3QuYXNzaWduKHRyYW5zcG9ydCwge1xuICAgIGRlcHRoOiA1LFxuXG4gICAgc2VyaWFsaXplRm4oZGF0YSwgeyBkZXB0aCA9IDUsIHNlZW4gPSBuZXcgV2Vha1NldCgpIH0gPSB7fSkge1xuICAgICAgaWYgKGRlcHRoIDwgMSkge1xuICAgICAgICByZXR1cm4gYFske3R5cGVvZiBkYXRhfV1gO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2Vlbi5oYXMoZGF0YSkpIHtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICB9XG5cbiAgICAgIGlmIChbJ2Z1bmN0aW9uJywgJ3N5bWJvbCddLmluY2x1ZGVzKHR5cGVvZiBkYXRhKSkge1xuICAgICAgICByZXR1cm4gZGF0YS50b1N0cmluZygpO1xuICAgICAgfVxuXG4gICAgICAvLyBQcmltaXRpdmUgdHlwZXMgKGluY2x1ZGluZyBudWxsIGFuZCB1bmRlZmluZWQpXG4gICAgICBpZiAoT2JqZWN0KGRhdGEpICE9PSBkYXRhKSB7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgfVxuXG4gICAgICAvLyBPYmplY3QgdHlwZXNcblxuICAgICAgaWYgKFJFU1RSSUNURURfVFlQRVMuaGFzKGRhdGEuY29uc3RydWN0b3IpKSB7XG4gICAgICAgIHJldHVybiBgWyR7ZGF0YS5jb25zdHJ1Y3Rvci5uYW1lfV1gO1xuICAgICAgfVxuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgICByZXR1cm4gZGF0YS5tYXAoKGl0ZW0pID0+IHRyYW5zcG9ydC5zZXJpYWxpemVGbihcbiAgICAgICAgICBpdGVtLFxuICAgICAgICAgIHsgbGV2ZWw6IGRlcHRoIC0gMSwgc2VlbiB9LFxuICAgICAgICApKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICByZXR1cm4gZGF0YS5zdGFjaztcbiAgICAgIH1cblxuICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBNYXAoXG4gICAgICAgICAgQXJyYXlcbiAgICAgICAgICAgIC5mcm9tKGRhdGEpXG4gICAgICAgICAgICAubWFwKChba2V5LCB2YWx1ZV0pID0+IFtcbiAgICAgICAgICAgICAgdHJhbnNwb3J0LnNlcmlhbGl6ZUZuKGtleSwgeyBsZXZlbDogZGVwdGggLSAxLCBzZWVuIH0pLFxuICAgICAgICAgICAgICB0cmFuc3BvcnQuc2VyaWFsaXplRm4odmFsdWUsIHsgbGV2ZWw6IGRlcHRoIC0gMSwgc2VlbiB9KSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICByZXR1cm4gbmV3IFNldChcbiAgICAgICAgICBBcnJheS5mcm9tKGRhdGEpLm1hcChcbiAgICAgICAgICAgICh2YWwpID0+IHRyYW5zcG9ydC5zZXJpYWxpemVGbih2YWwsIHsgbGV2ZWw6IGRlcHRoIC0gMSwgc2VlbiB9KSxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBzZWVuLmFkZChkYXRhKTtcblxuICAgICAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgT2JqZWN0LmVudHJpZXMoZGF0YSkubWFwKFxuICAgICAgICAgIChba2V5LCB2YWx1ZV0pID0+IFtcbiAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgIHRyYW5zcG9ydC5zZXJpYWxpemVGbih2YWx1ZSwgeyBsZXZlbDogZGVwdGggLSAxLCBzZWVuIH0pLFxuICAgICAgICAgIF0sXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH0sXG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHRyYW5zcG9ydChtZXNzYWdlKSB7XG4gICAgaWYgKCF3aW5kb3cuX19lbGVjdHJvbkxvZykge1xuICAgICAgbG9nZ2VyLnByb2Nlc3NNZXNzYWdlKFxuICAgICAgICB7XG4gICAgICAgICAgZGF0YTogWydlbGVjdHJvbi1sb2c6IGxvZ2dlciBpc25cXCd0IGluaXRpYWxpemVkIGluIHRoZSBtYWluIHByb2Nlc3MnXSxcbiAgICAgICAgICBsZXZlbDogJ2Vycm9yJyxcbiAgICAgICAgfSxcbiAgICAgICAgeyB0cmFuc3BvcnRzOiBbJ2NvbnNvbGUnXSB9LFxuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgX19lbGVjdHJvbkxvZy5zZW5kVG9NYWluKHRyYW5zcG9ydC5zZXJpYWxpemVGbihtZXNzYWdlLCB7XG4gICAgICAgIGRlcHRoOiB0cmFuc3BvcnQuZGVwdGgsXG4gICAgICB9KSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nZ2VyLnRyYW5zcG9ydHMuY29uc29sZSh7XG4gICAgICAgIGRhdGE6IFsnZWxlY3Ryb25Mb2cudHJhbnNwb3J0cy5pcGMnLCBlLCAnZGF0YTonLCBtZXNzYWdlLmRhdGFdLFxuICAgICAgICBsZXZlbDogJ2Vycm9yJyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBMb2dnZXIgPSByZXF1aXJlKCcuLi9jb3JlL0xvZ2dlcicpO1xuY29uc3QgUmVuZGVyZXJFcnJvckhhbmRsZXIgPSByZXF1aXJlKCcuL2xpYi9SZW5kZXJlckVycm9ySGFuZGxlcicpO1xuY29uc3QgdHJhbnNwb3J0Q29uc29sZSA9IHJlcXVpcmUoJy4vbGliL3RyYW5zcG9ydHMvY29uc29sZScpO1xuY29uc3QgdHJhbnNwb3J0SXBjID0gcmVxdWlyZSgnLi9saWIvdHJhbnNwb3J0cy9pcGMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVMb2dnZXIoKTtcbm1vZHVsZS5leHBvcnRzLkxvZ2dlciA9IExvZ2dlcjtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBtb2R1bGUuZXhwb3J0cztcblxuZnVuY3Rpb24gY3JlYXRlTG9nZ2VyKCkge1xuICBjb25zdCBsb2dnZXIgPSBuZXcgTG9nZ2VyKHtcbiAgICBhbGxvd1Vua25vd25MZXZlbDogdHJ1ZSxcbiAgICBlcnJvckhhbmRsZXI6IG5ldyBSZW5kZXJlckVycm9ySGFuZGxlcigpLFxuICAgIGluaXRpYWxpemVGbjogKCkgPT4ge30sXG4gICAgbG9nSWQ6ICdkZWZhdWx0JyxcbiAgICB0cmFuc3BvcnRGYWN0b3JpZXM6IHtcbiAgICAgIGNvbnNvbGU6IHRyYW5zcG9ydENvbnNvbGUsXG4gICAgICBpcGM6IHRyYW5zcG9ydElwYyxcbiAgICB9LFxuICAgIHZhcmlhYmxlczoge1xuICAgICAgcHJvY2Vzc1R5cGU6ICdyZW5kZXJlcicsXG4gICAgfSxcbiAgfSk7XG5cbiAgbG9nZ2VyLmVycm9ySGFuZGxlci5zZXRPcHRpb25zKHtcbiAgICBsb2dGbih7IGVycm9yLCBlcnJvck5hbWUsIHNob3dEaWFsb2cgfSkge1xuICAgICAgbG9nZ2VyLnRyYW5zcG9ydHMuY29uc29sZSh7XG4gICAgICAgIGRhdGE6IFtlcnJvck5hbWUsIGVycm9yXS5maWx0ZXIoQm9vbGVhbiksXG4gICAgICAgIGxldmVsOiAnZXJyb3InLFxuICAgICAgfSk7XG4gICAgICBsb2dnZXIudHJhbnNwb3J0cy5pcGMoe1xuICAgICAgICBjbWQ6ICdlcnJvckhhbmRsZXInLFxuICAgICAgICBlcnJvcjoge1xuICAgICAgICAgIGNhdXNlOiBlcnJvcj8uY2F1c2UsXG4gICAgICAgICAgY29kZTogZXJyb3I/LmNvZGUsXG4gICAgICAgICAgbmFtZTogZXJyb3I/Lm5hbWUsXG4gICAgICAgICAgbWVzc2FnZTogZXJyb3I/Lm1lc3NhZ2UsXG4gICAgICAgICAgc3RhY2s6IGVycm9yPy5zdGFjayxcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3JOYW1lLFxuICAgICAgICBsb2dJZDogbG9nZ2VyLmxvZ0lkLFxuICAgICAgICBzaG93RGlhbG9nLFxuICAgICAgfSk7XG4gICAgfSxcbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHsgY21kLCBsb2dJZCwgLi4ubWVzc2FnZSB9ID0gZXZlbnQuZGF0YSB8fCB7fTtcbiAgICAgIGNvbnN0IGluc3RhbmNlID0gTG9nZ2VyLmdldEluc3RhbmNlKHsgbG9nSWQgfSk7XG5cbiAgICAgIGlmIChjbWQgPT09ICdtZXNzYWdlJykge1xuICAgICAgICBpbnN0YW5jZS5wcm9jZXNzTWVzc2FnZShtZXNzYWdlLCB7IHRyYW5zcG9ydHM6IFsnY29uc29sZSddIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy8gVG8gc3VwcG9ydCBjdXN0b20gbGV2ZWxzXG4gIHJldHVybiBuZXcgUHJveHkobG9nZ2VyLCB7XG4gICAgZ2V0KHRhcmdldCwgcHJvcCkge1xuICAgICAgaWYgKHR5cGVvZiB0YXJnZXRbcHJvcF0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoLi4uZGF0YSkgPT4gbG9nZ2VyLmxvZ0RhdGEoZGF0YSwgeyBsZXZlbDogcHJvcCB9KTtcbiAgICB9LFxuICB9KTtcbn1cbiIsImltcG9ydCBsb2cgZnJvbSAnZWxlY3Ryb24tbG9nJztcbmltcG9ydCB7IGlzRGV2IH0gZnJvbSAnLi91dGlscyc7XG5cbi8vIGxvZ3NcbmlmICghaXNEZXYpIHtcbiAgbG9nLnRyYW5zcG9ydHMuZmlsZS5sZXZlbCA9IFwidmVyYm9zZVwiO1xufVxuXG4vLyBlcnIgaGFuZGxlXG5wcm9jZXNzLm9uKCd1bmhhbmRsZWRSZWplY3Rpb24nLCBsb2cuZXJyb3IpOyIsImltcG9ydCB7IE1lc3NhZ2VCb3hPcHRpb25zLCBhcHAsIGF1dG9VcGRhdGVyLCBkaWFsb2cgfSBmcm9tIFwiZWxlY3Ryb25cIjtcbmltcG9ydCBsb2cgZnJvbSAnZWxlY3Ryb24tbG9nJztcblxuLy8gY29uc3QgaXNNYWNPUyA9IGZhbHNlO1xuaW1wb3J0IGlzRGV2IGZyb20gXCJlbGVjdHJvbi1pcy1kZXZcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0QXV0b1VwZGF0ZXIoKSB7XG4gICAgLy8gSGFuZGxlIGNyZWF0aW5nL3JlbW92aW5nIHNob3J0Y3V0cyBvbiBXaW5kb3dzIHdoZW4gaW5zdGFsbGluZy91bmluc3RhbGxpbmcuXG4gICAgaWYgKHJlcXVpcmUoJ2VsZWN0cm9uLXNxdWlycmVsLXN0YXJ0dXAnKSkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGdsb2JhbC1yZXF1aXJlXG4gICAgICAgIGFwcC5xdWl0KCk7XG4gICAgfVxuICAgIGlmICghaXNEZXYpIHtcbiAgICAgICAgY29uc3Qgc2VydmVyID0gXCJodHRwczovL3JlZmktdXBkYXRlci52ZXJjZWwuYXBwXCI7XG4gICAgICAgIGNvbnN0IGZlZWQgPSBgJHtzZXJ2ZXJ9L3VwZGF0ZS8ke3Byb2Nlc3MucGxhdGZvcm19LyR7YXBwLmdldFZlcnNpb24oKX1gXG4gICAgXG4gICAgICAgIGF1dG9VcGRhdGVyLnNldEZlZWRVUkwoeyB1cmw6IGZlZWQsIHNlcnZlclR5cGU6IFwianNvblwiIH0pXG4gICAgXG4gICAgICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGF1dG9VcGRhdGVyLmNoZWNrRm9yVXBkYXRlcygpXG4gICAgICAgIH0sIDYwMDAwKTtcbiAgICBcbiAgICAgICAgYXV0b1VwZGF0ZXIub24oJ3VwZGF0ZS1kb3dubG9hZGVkJywgKF8sIHJlbGVhc2VOb3RlcywgcmVsZWFzZU5hbWUpID0+IHtcbiAgICAgICAgICAgIGxvZy5kZWJ1ZygnRG93bmxvYWRlZCBuZXcgdXBkYXRlJyk7XG4gICAgICAgICAgICBjb25zdCBkaWFsb2dPcHRzOiBNZXNzYWdlQm94T3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdpbmZvJyxcbiAgICAgICAgICAgIGJ1dHRvbnM6IFsnUmVzdGFydCcsICdMYXRlciddLFxuICAgICAgICAgICAgdGl0bGU6ICdBcHBsaWNhdGlvbiBVcGRhdGUnLFxuICAgICAgICAgICAgbWVzc2FnZTogcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyA/IHJlbGVhc2VOb3RlcyA6IHJlbGVhc2VOYW1lLFxuICAgICAgICAgICAgZGV0YWlsOiAnQSBuZXcgdmVyc2lvbiBoYXMgYmVlbiBkb3dubG9hZGVkLiBSZXN0YXJ0IHRoZSBhcHBsaWNhdGlvbiB0byBhcHBseSB0aGUgdXBkYXRlcy4nXG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICBkaWFsb2cuc2hvd01lc3NhZ2VCb3goZGlhbG9nT3B0cykudGhlbigocmV0dXJuVmFsdWUpID0+IHtcbiAgICAgICAgICAgIGlmIChyZXR1cm5WYWx1ZS5yZXNwb25zZSA9PT0gMCkgYXV0b1VwZGF0ZXIucXVpdEFuZEluc3RhbGwoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgIGF1dG9VcGRhdGVyLm9uKCdlcnJvcicsIG1lc3NhZ2UgPT4ge1xuICAgICAgICAgICAgbG9nLmVycm9yKCdUaGVyZSB3YXMgYSBwcm9ibGVtIHVwZGF0aW5nIHRoZSBhcHBsaWNhdGlvbicpXG4gICAgICAgICAgICBsb2cuZXJyb3IobWVzc2FnZSlcbiAgICAgICAgfSlcbiAgICB9IFxufVxuXG5cbiIsImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBhcHAgfSBmcm9tICdlbGVjdHJvbidcbi8vIGltcG9ydCBwcmVwYXJlTmV4dCBmcm9tICdlbGVjdHJvbi1uZXh0J1xuaW1wb3J0IHsgY3JlYXRlTWFpbldpbmRvdywgcmVzdG9yZU9yQ3JlYXRlV2luZG93IH0gZnJvbSBcIi4vd2luZG93cy1tYW5hZ2VyXCI7XG5pbXBvcnQgXCIuL3ByZWxhdW5jaFwiO1xuaW1wb3J0IHsgc3RhcnRBdXRvVXBkYXRlciB9IGZyb20gJy4vYXV0by11cGRhdGUnO1xuXG4vLyBQcmVwYXJlIHRoZSByZW5kZXJlciBvbmNlIHRoZSBhcHAgaXMgcmVhZHlcbmNvbnN0IHJlbmRlcmVyUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsIFwiLi4vcmVuZGVyZXJcIik7XG5jb25zb2xlLmxvZyhcInN0YXJ0ZWQ6XCIsIHJlbmRlcmVyUGF0aCk7XG5cbi8qKlxuICogRGlzYWJsZSBIYXJkd2FyZSBBY2NlbGVyYXRpb24gZm9yIG1vcmUgcG93ZXItc2F2ZVxuICovXG5hcHAuZGlzYWJsZUhhcmR3YXJlQWNjZWxlcmF0aW9uKCk7XG5cbmFwcC5vbigncmVhZHknLCBhc3luYyAoKSA9PiB7XG4gIC8vIHJ1biBuZXh0IGZyb250ZW5kIHNlcnZpY2VcbiAgLy8gYXdhaXQgcHJlcGFyZU5leHQocmVuZGVyZXJQYXRoKVxuXG4gIC8vIHN0YXJ0IGRlc2t0b3Agd2luZG93XG4gIGF3YWl0IGNyZWF0ZU1haW5XaW5kb3coKTtcblxuICAvLyBhdXRvIHVwZGF0ZSBsaXN0ZW5lclxuICBzdGFydEF1dG9VcGRhdGVyKClcbn0pXG5cbi8vIFF1aXQgdGhlIGFwcCBvbmNlIGFsbCB3aW5kb3dzIGFyZSBjbG9zZWRcbmFwcC5vbignd2luZG93LWFsbC1jbG9zZWQnLCBhcHAucXVpdClcblxuYXBwLm9uKFwiYWN0aXZhdGVcIiwgcmVzdG9yZU9yQ3JlYXRlV2luZG93KTtcblxuIl0sIm5hbWVzIjpbInJlcXVpcmUkJDAiLCJ1dWlkdjQiLCJpc0RldiIsImZvcm1hdCIsInBhdGgiLCJCcm93c2VyV2luZG93IiwiQnJvd3NlclZpZXciLCJzY29wZUZhY3RvcnkiLCJyZXF1aXJlJCQxIiwicmVxdWlyZSQkMiIsInJlcXVpcmUkJDMiLCJhcHAiLCJhdXRvVXBkYXRlciIsImRpYWxvZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLE1BQU0sV0FBV0Esb0JBQUFBO0FBRWpCLElBQUksT0FBTyxhQUFhLFVBQVU7QUFDakMsUUFBTSxJQUFJLFVBQVU7QUFBQTtBQUdyQixNQUFNLE1BQU0sU0FBUyxPQUFPLFNBQVMsT0FBTztBQUU1QyxNQUFNLFdBQVcscUJBQXFCLFFBQVE7QUFDOUMsTUFBTSxhQUFhLFlBQXFCLGlCQUFpQixRQUFRO0lBRWpFLGdCQUFpQixXQUFXLGFBQWEsQ0FBQyxJQUFJO0FDWjlDLE1BQU0sVUFBVSxRQUFRLGFBQWE7QUNHckMsSUFBSTtBQUNKLE1BQU0sUUFBUSxJQUFJLFdBQVc7QUFDZCxlQUFlO0FBRTVCLE1BQUksQ0FBQyxpQkFBaUI7QUFFcEIsc0JBQWtCLE9BQU8sV0FBVyxlQUFlLE9BQU8sbUJBQW1CLE9BQU8sZ0JBQWdCLEtBQUs7QUFFekcsUUFBSSxDQUFDLGlCQUFpQjtBQUNwQixZQUFNLElBQUksTUFBTTtBQUFBO0FBQUE7QUFJcEIsU0FBTyxnQkFBZ0I7QUFBQTtBQ1Z6QixNQUFNLFlBQVk7QUFFbEIsU0FBUyxJQUFJLEdBQUcsSUFBSSxLQUFLLEVBQUUsR0FBRztBQUM1QixZQUFVLEtBQU0sS0FBSSxLQUFPLFNBQVMsSUFB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
