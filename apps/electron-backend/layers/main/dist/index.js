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
var require$$0$2 = require("path");
var require$$0 = require("electron");
var crypto = require("crypto");
var require$$0$1 = require("url");
var express = require("express");
var require$$0$3 = require("util");
var require$$0$4 = require("http");
var require$$1 = require("https");
var require$$3 = require("stream");
var require$$4 = require("assert");
var require$$0$5 = require("zlib");
var require$$0$6 = require("querystring");
function _interopDefaultLegacy(e) {
  return e && typeof e === "object" && "default" in e ? e : { "default": e };
}
var require$$0__default$1 = /* @__PURE__ */ _interopDefaultLegacy(require$$0$2);
var require$$0__default = /* @__PURE__ */ _interopDefaultLegacy(require$$0);
var crypto__default = /* @__PURE__ */ _interopDefaultLegacy(crypto);
var require$$0__default$3 = /* @__PURE__ */ _interopDefaultLegacy(require$$0$1);
var express__default = /* @__PURE__ */ _interopDefaultLegacy(express);
var require$$0__default$2 = /* @__PURE__ */ _interopDefaultLegacy(require$$0$3);
var require$$0__default$4 = /* @__PURE__ */ _interopDefaultLegacy(require$$0$4);
var require$$1__default = /* @__PURE__ */ _interopDefaultLegacy(require$$1);
var require$$3__default = /* @__PURE__ */ _interopDefaultLegacy(require$$3);
var require$$4__default = /* @__PURE__ */ _interopDefaultLegacy(require$$4);
var require$$0__default$5 = /* @__PURE__ */ _interopDefaultLegacy(require$$0$5);
var require$$0__default$6 = /* @__PURE__ */ _interopDefaultLegacy(require$$0$6);
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
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
const defaultWindowUrl = electronIsDev ? "http://localhost:3000" : require$$0$1.format({
  pathname: require$$0__default$1["default"].join(__dirname, "../renderer/out/index.html"),
  protocol: "file:",
  slashes: true
});
const preload_js_path = require$$0__default$1["default"].resolve(__dirname, "../../preload/dist/", "index.js");
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
  const windowView = await createWindow(defaultWindowUrl + "/");
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
function scopeFactory$1(logger2) {
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
    for (const level of [...logger2.levels, "log"]) {
      newScope[level] = (...d) => logger2.logData(d, { level, scope: label });
    }
    return newScope;
  }
}
const scopeFactory = scope;
class Logger$1 {
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
    Logger$1.instances[logId] = this;
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
    return new Logger$1(__spreadProps(__spreadValues({}, options), {
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
var Logger_1 = Logger$1;
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
function consoleTransportRendererFactory(logger2) {
  return Object.assign(transport, {
    format: "{h}:{i}:{s}.{ms}{scope} \u203A {text}",
    formatDataFn(_a) {
      var _b = _a, {
        data = [],
        date = new Date(),
        format = transport.format,
        logId = logger2.logId,
        scope: scope2 = logger2.scopeName
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
function ipcTransportRendererFactory(logger2) {
  return Object.assign(transport, {
    depth: 5,
    serializeFn(data, { depth: depth2 = 5, seen = new WeakSet() } = {}) {
      if (depth2 < 1) {
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
        return data.map((item) => transport.serializeFn(item, { level: depth2 - 1, seen }));
      }
      if (data instanceof Error) {
        return data.stack;
      }
      if (data instanceof Map) {
        return new Map(Array.from(data).map(([key, value]) => [
          transport.serializeFn(key, { level: depth2 - 1, seen }),
          transport.serializeFn(value, { level: depth2 - 1, seen })
        ]));
      }
      if (data instanceof Set) {
        return new Set(Array.from(data).map((val) => transport.serializeFn(val, { level: depth2 - 1, seen })));
      }
      seen.add(data);
      return Object.fromEntries(Object.entries(data).map(([key, value]) => [
        key,
        transport.serializeFn(value, { level: depth2 - 1, seen })
      ]));
    }
  });
  function transport(message) {
    if (!window.__electronLog) {
      logger2.processMessage({
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
      logger2.transports.console({
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
    const logger2 = new Logger2({
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
    logger2.errorHandler.setOptions({
      logFn({ error, errorName, showDialog }) {
        logger2.transports.console({
          data: [errorName, error].filter(Boolean),
          level: "error"
        });
        logger2.transports.ipc({
          cmd: "errorHandler",
          error: {
            cause: error == null ? void 0 : error.cause,
            code: error == null ? void 0 : error.code,
            name: error == null ? void 0 : error.name,
            message: error == null ? void 0 : error.message,
            stack: error == null ? void 0 : error.stack
          },
          errorName,
          logId: logger2.logId,
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
    return new Proxy(logger2, {
      get(target, prop) {
        if (typeof target[prop] !== "undefined") {
          return target[prop];
        }
        return (...data) => logger2.logData(data, { level: prop });
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
var dist = {};
var httpProxyMiddleware = {};
var httpProxy$3 = { exports: {} };
var eventemitter3 = { exports: {} };
(function(module) {
  var has = Object.prototype.hasOwnProperty, prefix = "~";
  function Events() {
  }
  if (Object.create) {
    Events.prototype = Object.create(null);
    if (!new Events().__proto__)
      prefix = false;
  }
  function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
  }
  function addListener(emitter, event, fn, context, once) {
    if (typeof fn !== "function") {
      throw new TypeError("The listener must be a function");
    }
    var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
    if (!emitter._events[evt])
      emitter._events[evt] = listener, emitter._eventsCount++;
    else if (!emitter._events[evt].fn)
      emitter._events[evt].push(listener);
    else
      emitter._events[evt] = [emitter._events[evt], listener];
    return emitter;
  }
  function clearEvent(emitter, evt) {
    if (--emitter._eventsCount === 0)
      emitter._events = new Events();
    else
      delete emitter._events[evt];
  }
  function EventEmitter() {
    this._events = new Events();
    this._eventsCount = 0;
  }
  EventEmitter.prototype.eventNames = function eventNames() {
    var names = [], events2, name;
    if (this._eventsCount === 0)
      return names;
    for (name in events2 = this._events) {
      if (has.call(events2, name))
        names.push(prefix ? name.slice(1) : name);
    }
    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events2));
    }
    return names;
  };
  EventEmitter.prototype.listeners = function listeners(event) {
    var evt = prefix ? prefix + event : event, handlers2 = this._events[evt];
    if (!handlers2)
      return [];
    if (handlers2.fn)
      return [handlers2.fn];
    for (var i = 0, l = handlers2.length, ee = new Array(l); i < l; i++) {
      ee[i] = handlers2[i].fn;
    }
    return ee;
  };
  EventEmitter.prototype.listenerCount = function listenerCount(event) {
    var evt = prefix ? prefix + event : event, listeners = this._events[evt];
    if (!listeners)
      return 0;
    if (listeners.fn)
      return 1;
    return listeners.length;
  };
  EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt])
      return false;
    var listeners = this._events[evt], len = arguments.length, args, i;
    if (listeners.fn) {
      if (listeners.once)
        this.removeListener(event, listeners.fn, void 0, true);
      switch (len) {
        case 1:
          return listeners.fn.call(listeners.context), true;
        case 2:
          return listeners.fn.call(listeners.context, a1), true;
        case 3:
          return listeners.fn.call(listeners.context, a1, a2), true;
        case 4:
          return listeners.fn.call(listeners.context, a1, a2, a3), true;
        case 5:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
        case 6:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
      }
      for (i = 1, args = new Array(len - 1); i < len; i++) {
        args[i - 1] = arguments[i];
      }
      listeners.fn.apply(listeners.context, args);
    } else {
      var length = listeners.length, j;
      for (i = 0; i < length; i++) {
        if (listeners[i].once)
          this.removeListener(event, listeners[i].fn, void 0, true);
        switch (len) {
          case 1:
            listeners[i].fn.call(listeners[i].context);
            break;
          case 2:
            listeners[i].fn.call(listeners[i].context, a1);
            break;
          case 3:
            listeners[i].fn.call(listeners[i].context, a1, a2);
            break;
          case 4:
            listeners[i].fn.call(listeners[i].context, a1, a2, a3);
            break;
          default:
            if (!args)
              for (j = 1, args = new Array(len - 1); j < len; j++) {
                args[j - 1] = arguments[j];
              }
            listeners[i].fn.apply(listeners[i].context, args);
        }
      }
    }
    return true;
  };
  EventEmitter.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false);
  };
  EventEmitter.prototype.once = function once(event, fn, context) {
    return addListener(this, event, fn, context, true);
  };
  EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt])
      return this;
    if (!fn) {
      clearEvent(this, evt);
      return this;
    }
    var listeners = this._events[evt];
    if (listeners.fn) {
      if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
        clearEvent(this, evt);
      }
    } else {
      for (var i = 0, events2 = [], length = listeners.length; i < length; i++) {
        if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
          events2.push(listeners[i]);
        }
      }
      if (events2.length)
        this._events[evt] = events2.length === 1 ? events2[0] : events2;
      else
        clearEvent(this, evt);
    }
    return this;
  };
  EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
    var evt;
    if (event) {
      evt = prefix ? prefix + event : event;
      if (this._events[evt])
        clearEvent(this, evt);
    } else {
      this._events = new Events();
      this._eventsCount = 0;
    }
    return this;
  };
  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
  EventEmitter.prototype.addListener = EventEmitter.prototype.on;
  EventEmitter.prefixed = prefix;
  EventEmitter.EventEmitter = EventEmitter;
  {
    module.exports = EventEmitter;
  }
})(eventemitter3);
var common$3 = {};
var requiresPort = function required(port, protocol) {
  protocol = protocol.split(":")[0];
  port = +port;
  if (!port)
    return false;
  switch (protocol) {
    case "http":
    case "ws":
      return port !== 80;
    case "https":
    case "wss":
      return port !== 443;
    case "ftp":
      return port !== 21;
    case "gopher":
      return port !== 70;
    case "file":
      return false;
  }
  return port !== 0;
};
(function(exports) {
  var common2 = exports, url2 = require$$0__default$3["default"], extend = require$$0__default$2["default"]._extend, required2 = requiresPort;
  var upgradeHeader = /(^|,)\s*upgrade\s*($|,)/i, isSSL = /^https|wss/;
  common2.isSSL = isSSL;
  common2.setupOutgoing = function(outgoing, options, req, forward) {
    outgoing.port = options[forward || "target"].port || (isSSL.test(options[forward || "target"].protocol) ? 443 : 80);
    [
      "host",
      "hostname",
      "socketPath",
      "pfx",
      "key",
      "passphrase",
      "cert",
      "ca",
      "ciphers",
      "secureProtocol"
    ].forEach(function(e) {
      outgoing[e] = options[forward || "target"][e];
    });
    outgoing.method = options.method || req.method;
    outgoing.headers = extend({}, req.headers);
    if (options.headers) {
      extend(outgoing.headers, options.headers);
    }
    if (options.auth) {
      outgoing.auth = options.auth;
    }
    if (options.ca) {
      outgoing.ca = options.ca;
    }
    if (isSSL.test(options[forward || "target"].protocol)) {
      outgoing.rejectUnauthorized = typeof options.secure === "undefined" ? true : options.secure;
    }
    outgoing.agent = options.agent || false;
    outgoing.localAddress = options.localAddress;
    if (!outgoing.agent) {
      outgoing.headers = outgoing.headers || {};
      if (typeof outgoing.headers.connection !== "string" || !upgradeHeader.test(outgoing.headers.connection)) {
        outgoing.headers.connection = "close";
      }
    }
    var target = options[forward || "target"];
    var targetPath = target && options.prependPath !== false ? target.path || "" : "";
    var outgoingPath = !options.toProxy ? url2.parse(req.url).path || "" : req.url;
    outgoingPath = !options.ignorePath ? outgoingPath : "";
    outgoing.path = common2.urlJoin(targetPath, outgoingPath);
    if (options.changeOrigin) {
      outgoing.headers.host = required2(outgoing.port, options[forward || "target"].protocol) && !hasPort(outgoing.host) ? outgoing.host + ":" + outgoing.port : outgoing.host;
    }
    return outgoing;
  };
  common2.setupSocket = function(socket) {
    socket.setTimeout(0);
    socket.setNoDelay(true);
    socket.setKeepAlive(true, 0);
    return socket;
  };
  common2.getPort = function(req) {
    var res = req.headers.host ? req.headers.host.match(/:(\d+)/) : "";
    return res ? res[1] : common2.hasEncryptedConnection(req) ? "443" : "80";
  };
  common2.hasEncryptedConnection = function(req) {
    return Boolean(req.connection.encrypted || req.connection.pair);
  };
  common2.urlJoin = function() {
    var args = Array.prototype.slice.call(arguments), lastIndex = args.length - 1, last = args[lastIndex], lastSegs = last.split("?"), retSegs;
    args[lastIndex] = lastSegs.shift();
    retSegs = [
      args.filter(Boolean).join("/").replace(/\/+/g, "/").replace("http:/", "http://").replace("https:/", "https://")
    ];
    retSegs.push.apply(retSegs, lastSegs);
    return retSegs.join("?");
  };
  common2.rewriteCookieProperty = function rewriteCookieProperty(header, config, property) {
    if (Array.isArray(header)) {
      return header.map(function(headerElement) {
        return rewriteCookieProperty(headerElement, config, property);
      });
    }
    return header.replace(new RegExp("(;\\s*" + property + "=)([^;]+)", "i"), function(match2, prefix, previousValue) {
      var newValue;
      if (previousValue in config) {
        newValue = config[previousValue];
      } else if ("*" in config) {
        newValue = config["*"];
      } else {
        return match2;
      }
      if (newValue) {
        return prefix + newValue;
      } else {
        return "";
      }
    });
  };
  function hasPort(host) {
    return !!~host.indexOf(":");
  }
})(common$3);
var url$3 = require$$0__default$3["default"], common$2 = common$3;
var redirectRegex = /^201|30(1|2|7|8)$/;
/*!
 * Array of passes.
 *
 * A `pass` is just a function that is executed on `req, res, options`
 * so that you can easily add new checks while still keeping the base
 * flexible.
 */
var webOutgoing = {
  removeChunked: function removeChunked(req, res, proxyRes) {
    if (req.httpVersion === "1.0") {
      delete proxyRes.headers["transfer-encoding"];
    }
  },
  setConnection: function setConnection(req, res, proxyRes) {
    if (req.httpVersion === "1.0") {
      proxyRes.headers.connection = req.headers.connection || "close";
    } else if (req.httpVersion !== "2.0" && !proxyRes.headers.connection) {
      proxyRes.headers.connection = req.headers.connection || "keep-alive";
    }
  },
  setRedirectHostRewrite: function setRedirectHostRewrite(req, res, proxyRes, options) {
    if ((options.hostRewrite || options.autoRewrite || options.protocolRewrite) && proxyRes.headers["location"] && redirectRegex.test(proxyRes.statusCode)) {
      var target = url$3.parse(options.target);
      var u = url$3.parse(proxyRes.headers["location"]);
      if (target.host != u.host) {
        return;
      }
      if (options.hostRewrite) {
        u.host = options.hostRewrite;
      } else if (options.autoRewrite) {
        u.host = req.headers["host"];
      }
      if (options.protocolRewrite) {
        u.protocol = options.protocolRewrite;
      }
      proxyRes.headers["location"] = u.format();
    }
  },
  writeHeaders: function writeHeaders(req, res, proxyRes, options) {
    var rewriteCookieDomainConfig = options.cookieDomainRewrite, rewriteCookiePathConfig = options.cookiePathRewrite, preserveHeaderKeyCase = options.preserveHeaderKeyCase, rawHeaderKeyMap, setHeader = function(key2, header) {
      if (header == void 0)
        return;
      if (rewriteCookieDomainConfig && key2.toLowerCase() === "set-cookie") {
        header = common$2.rewriteCookieProperty(header, rewriteCookieDomainConfig, "domain");
      }
      if (rewriteCookiePathConfig && key2.toLowerCase() === "set-cookie") {
        header = common$2.rewriteCookieProperty(header, rewriteCookiePathConfig, "path");
      }
      res.setHeader(String(key2).trim(), header);
    };
    if (typeof rewriteCookieDomainConfig === "string") {
      rewriteCookieDomainConfig = { "*": rewriteCookieDomainConfig };
    }
    if (typeof rewriteCookiePathConfig === "string") {
      rewriteCookiePathConfig = { "*": rewriteCookiePathConfig };
    }
    if (preserveHeaderKeyCase && proxyRes.rawHeaders != void 0) {
      rawHeaderKeyMap = {};
      for (var i = 0; i < proxyRes.rawHeaders.length; i += 2) {
        var key = proxyRes.rawHeaders[i];
        rawHeaderKeyMap[key.toLowerCase()] = key;
      }
    }
    Object.keys(proxyRes.headers).forEach(function(key2) {
      var header = proxyRes.headers[key2];
      if (preserveHeaderKeyCase && rawHeaderKeyMap) {
        key2 = rawHeaderKeyMap[key2] || key2;
      }
      setHeader(key2, header);
    });
  },
  writeStatusCode: function writeStatusCode(req, res, proxyRes) {
    if (proxyRes.statusMessage) {
      res.statusCode = proxyRes.statusCode;
      res.statusMessage = proxyRes.statusMessage;
    } else {
      res.statusCode = proxyRes.statusCode;
    }
  }
};
var followRedirects$1 = { exports: {} };
var debug$1;
var debug_1 = function() {
  if (!debug$1) {
    try {
      debug$1 = require("debug")("follow-redirects");
    } catch (error) {
    }
    if (typeof debug$1 !== "function") {
      debug$1 = function() {
      };
    }
  }
  debug$1.apply(null, arguments);
};
var url$2 = require$$0__default$3["default"];
var URL = url$2.URL;
var http$1 = require$$0__default$4["default"];
var https$1 = require$$1__default["default"];
var Writable = require$$3__default["default"].Writable;
var assert = require$$4__default["default"];
var debug = debug_1;
var events = ["abort", "aborted", "connect", "error", "socket", "timeout"];
var eventHandlers = Object.create(null);
events.forEach(function(event) {
  eventHandlers[event] = function(arg1, arg2, arg3) {
    this._redirectable.emit(event, arg1, arg2, arg3);
  };
});
var InvalidUrlError = createErrorType("ERR_INVALID_URL", "Invalid URL", TypeError);
var RedirectionError = createErrorType("ERR_FR_REDIRECTION_FAILURE", "Redirected request failed");
var TooManyRedirectsError = createErrorType("ERR_FR_TOO_MANY_REDIRECTS", "Maximum number of redirects exceeded");
var MaxBodyLengthExceededError = createErrorType("ERR_FR_MAX_BODY_LENGTH_EXCEEDED", "Request body larger than maxBodyLength limit");
var WriteAfterEndError = createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");
var destroy = Writable.prototype.destroy || noop;
function RedirectableRequest(options, responseCallback) {
  Writable.call(this);
  this._sanitizeOptions(options);
  this._options = options;
  this._ended = false;
  this._ending = false;
  this._redirectCount = 0;
  this._redirects = [];
  this._requestBodyLength = 0;
  this._requestBodyBuffers = [];
  if (responseCallback) {
    this.on("response", responseCallback);
  }
  var self2 = this;
  this._onNativeResponse = function(response) {
    self2._processResponse(response);
  };
  this._performRequest();
}
RedirectableRequest.prototype = Object.create(Writable.prototype);
RedirectableRequest.prototype.abort = function() {
  destroyRequest(this._currentRequest);
  this._currentRequest.abort();
  this.emit("abort");
};
RedirectableRequest.prototype.destroy = function(error) {
  destroyRequest(this._currentRequest, error);
  destroy.call(this, error);
  return this;
};
RedirectableRequest.prototype.write = function(data, encoding, callback) {
  if (this._ending) {
    throw new WriteAfterEndError();
  }
  if (!isString(data) && !isBuffer(data)) {
    throw new TypeError("data should be a string, Buffer or Uint8Array");
  }
  if (isFunction(encoding)) {
    callback = encoding;
    encoding = null;
  }
  if (data.length === 0) {
    if (callback) {
      callback();
    }
    return;
  }
  if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
    this._requestBodyLength += data.length;
    this._requestBodyBuffers.push({ data, encoding });
    this._currentRequest.write(data, encoding, callback);
  } else {
    this.emit("error", new MaxBodyLengthExceededError());
    this.abort();
  }
};
RedirectableRequest.prototype.end = function(data, encoding, callback) {
  if (isFunction(data)) {
    callback = data;
    data = encoding = null;
  } else if (isFunction(encoding)) {
    callback = encoding;
    encoding = null;
  }
  if (!data) {
    this._ended = this._ending = true;
    this._currentRequest.end(null, null, callback);
  } else {
    var self2 = this;
    var currentRequest = this._currentRequest;
    this.write(data, encoding, function() {
      self2._ended = true;
      currentRequest.end(null, null, callback);
    });
    this._ending = true;
  }
};
RedirectableRequest.prototype.setHeader = function(name, value) {
  this._options.headers[name] = value;
  this._currentRequest.setHeader(name, value);
};
RedirectableRequest.prototype.removeHeader = function(name) {
  delete this._options.headers[name];
  this._currentRequest.removeHeader(name);
};
RedirectableRequest.prototype.setTimeout = function(msecs, callback) {
  var self2 = this;
  function destroyOnTimeout(socket) {
    socket.setTimeout(msecs);
    socket.removeListener("timeout", socket.destroy);
    socket.addListener("timeout", socket.destroy);
  }
  function startTimer(socket) {
    if (self2._timeout) {
      clearTimeout(self2._timeout);
    }
    self2._timeout = setTimeout(function() {
      self2.emit("timeout");
      clearTimer();
    }, msecs);
    destroyOnTimeout(socket);
  }
  function clearTimer() {
    if (self2._timeout) {
      clearTimeout(self2._timeout);
      self2._timeout = null;
    }
    self2.removeListener("abort", clearTimer);
    self2.removeListener("error", clearTimer);
    self2.removeListener("response", clearTimer);
    self2.removeListener("close", clearTimer);
    if (callback) {
      self2.removeListener("timeout", callback);
    }
    if (!self2.socket) {
      self2._currentRequest.removeListener("socket", startTimer);
    }
  }
  if (callback) {
    this.on("timeout", callback);
  }
  if (this.socket) {
    startTimer(this.socket);
  } else {
    this._currentRequest.once("socket", startTimer);
  }
  this.on("socket", destroyOnTimeout);
  this.on("abort", clearTimer);
  this.on("error", clearTimer);
  this.on("response", clearTimer);
  this.on("close", clearTimer);
  return this;
};
[
  "flushHeaders",
  "getHeader",
  "setNoDelay",
  "setSocketKeepAlive"
].forEach(function(method) {
  RedirectableRequest.prototype[method] = function(a, b) {
    return this._currentRequest[method](a, b);
  };
});
["aborted", "connection", "socket"].forEach(function(property) {
  Object.defineProperty(RedirectableRequest.prototype, property, {
    get: function() {
      return this._currentRequest[property];
    }
  });
});
RedirectableRequest.prototype._sanitizeOptions = function(options) {
  if (!options.headers) {
    options.headers = {};
  }
  if (options.host) {
    if (!options.hostname) {
      options.hostname = options.host;
    }
    delete options.host;
  }
  if (!options.pathname && options.path) {
    var searchPos = options.path.indexOf("?");
    if (searchPos < 0) {
      options.pathname = options.path;
    } else {
      options.pathname = options.path.substring(0, searchPos);
      options.search = options.path.substring(searchPos);
    }
  }
};
RedirectableRequest.prototype._performRequest = function() {
  var protocol = this._options.protocol;
  var nativeProtocol = this._options.nativeProtocols[protocol];
  if (!nativeProtocol) {
    this.emit("error", new TypeError("Unsupported protocol " + protocol));
    return;
  }
  if (this._options.agents) {
    var scheme = protocol.slice(0, -1);
    this._options.agent = this._options.agents[scheme];
  }
  var request = this._currentRequest = nativeProtocol.request(this._options, this._onNativeResponse);
  request._redirectable = this;
  for (var event of events) {
    request.on(event, eventHandlers[event]);
  }
  this._currentUrl = /^\//.test(this._options.path) ? url$2.format(this._options) : this._options.path;
  if (this._isRedirect) {
    var i = 0;
    var self2 = this;
    var buffers = this._requestBodyBuffers;
    (function writeNext(error) {
      if (request === self2._currentRequest) {
        if (error) {
          self2.emit("error", error);
        } else if (i < buffers.length) {
          var buffer = buffers[i++];
          if (!request.finished) {
            request.write(buffer.data, buffer.encoding, writeNext);
          }
        } else if (self2._ended) {
          request.end();
        }
      }
    })();
  }
};
RedirectableRequest.prototype._processResponse = function(response) {
  var statusCode = response.statusCode;
  if (this._options.trackRedirects) {
    this._redirects.push({
      url: this._currentUrl,
      headers: response.headers,
      statusCode
    });
  }
  var location = response.headers.location;
  if (!location || this._options.followRedirects === false || statusCode < 300 || statusCode >= 400) {
    response.responseUrl = this._currentUrl;
    response.redirects = this._redirects;
    this.emit("response", response);
    this._requestBodyBuffers = [];
    return;
  }
  destroyRequest(this._currentRequest);
  response.destroy();
  if (++this._redirectCount > this._options.maxRedirects) {
    this.emit("error", new TooManyRedirectsError());
    return;
  }
  var requestHeaders;
  var beforeRedirect = this._options.beforeRedirect;
  if (beforeRedirect) {
    requestHeaders = Object.assign({
      Host: response.req.getHeader("host")
    }, this._options.headers);
  }
  var method = this._options.method;
  if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" || statusCode === 303 && !/^(?:GET|HEAD)$/.test(this._options.method)) {
    this._options.method = "GET";
    this._requestBodyBuffers = [];
    removeMatchingHeaders(/^content-/i, this._options.headers);
  }
  var currentHostHeader = removeMatchingHeaders(/^host$/i, this._options.headers);
  var currentUrlParts = url$2.parse(this._currentUrl);
  var currentHost = currentHostHeader || currentUrlParts.host;
  var currentUrl = /^\w+:/.test(location) ? this._currentUrl : url$2.format(Object.assign(currentUrlParts, { host: currentHost }));
  var redirectUrl;
  try {
    redirectUrl = url$2.resolve(currentUrl, location);
  } catch (cause) {
    this.emit("error", new RedirectionError({ cause }));
    return;
  }
  debug("redirecting to", redirectUrl);
  this._isRedirect = true;
  var redirectUrlParts = url$2.parse(redirectUrl);
  Object.assign(this._options, redirectUrlParts);
  if (redirectUrlParts.protocol !== currentUrlParts.protocol && redirectUrlParts.protocol !== "https:" || redirectUrlParts.host !== currentHost && !isSubdomain(redirectUrlParts.host, currentHost)) {
    removeMatchingHeaders(/^(?:authorization|cookie)$/i, this._options.headers);
  }
  if (isFunction(beforeRedirect)) {
    var responseDetails = {
      headers: response.headers,
      statusCode
    };
    var requestDetails = {
      url: currentUrl,
      method,
      headers: requestHeaders
    };
    try {
      beforeRedirect(this._options, responseDetails, requestDetails);
    } catch (err) {
      this.emit("error", err);
      return;
    }
    this._sanitizeOptions(this._options);
  }
  try {
    this._performRequest();
  } catch (cause) {
    this.emit("error", new RedirectionError({ cause }));
  }
};
function wrap(protocols) {
  var exports = {
    maxRedirects: 21,
    maxBodyLength: 10 * 1024 * 1024
  };
  var nativeProtocols = {};
  Object.keys(protocols).forEach(function(scheme) {
    var protocol = scheme + ":";
    var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
    var wrappedProtocol = exports[scheme] = Object.create(nativeProtocol);
    function request(input, options, callback) {
      if (isString(input)) {
        var parsed;
        try {
          parsed = urlToOptions(new URL(input));
        } catch (err) {
          parsed = url$2.parse(input);
        }
        if (!isString(parsed.protocol)) {
          throw new InvalidUrlError({ input });
        }
        input = parsed;
      } else if (URL && input instanceof URL) {
        input = urlToOptions(input);
      } else {
        callback = options;
        options = input;
        input = { protocol };
      }
      if (isFunction(options)) {
        callback = options;
        options = null;
      }
      options = Object.assign({
        maxRedirects: exports.maxRedirects,
        maxBodyLength: exports.maxBodyLength
      }, input, options);
      options.nativeProtocols = nativeProtocols;
      if (!isString(options.host) && !isString(options.hostname)) {
        options.hostname = "::1";
      }
      assert.equal(options.protocol, protocol, "protocol mismatch");
      debug("options", options);
      return new RedirectableRequest(options, callback);
    }
    function get(input, options, callback) {
      var wrappedRequest = wrappedProtocol.request(input, options, callback);
      wrappedRequest.end();
      return wrappedRequest;
    }
    Object.defineProperties(wrappedProtocol, {
      request: { value: request, configurable: true, enumerable: true, writable: true },
      get: { value: get, configurable: true, enumerable: true, writable: true }
    });
  });
  return exports;
}
function noop() {
}
function urlToOptions(urlObject) {
  var options = {
    protocol: urlObject.protocol,
    hostname: urlObject.hostname.startsWith("[") ? urlObject.hostname.slice(1, -1) : urlObject.hostname,
    hash: urlObject.hash,
    search: urlObject.search,
    pathname: urlObject.pathname,
    path: urlObject.pathname + urlObject.search,
    href: urlObject.href
  };
  if (urlObject.port !== "") {
    options.port = Number(urlObject.port);
  }
  return options;
}
function removeMatchingHeaders(regex, headers) {
  var lastValue;
  for (var header in headers) {
    if (regex.test(header)) {
      lastValue = headers[header];
      delete headers[header];
    }
  }
  return lastValue === null || typeof lastValue === "undefined" ? void 0 : String(lastValue).trim();
}
function createErrorType(code, message, baseClass) {
  function CustomError(properties) {
    Error.captureStackTrace(this, this.constructor);
    Object.assign(this, properties || {});
    this.code = code;
    this.message = this.cause ? message + ": " + this.cause.message : message;
  }
  CustomError.prototype = new (baseClass || Error)();
  CustomError.prototype.constructor = CustomError;
  CustomError.prototype.name = "Error [" + code + "]";
  return CustomError;
}
function destroyRequest(request, error) {
  for (var event of events) {
    request.removeListener(event, eventHandlers[event]);
  }
  request.on("error", noop);
  request.destroy(error);
}
function isSubdomain(subdomain, domain) {
  assert(isString(subdomain) && isString(domain));
  var dot = subdomain.length - domain.length - 1;
  return dot > 0 && subdomain[dot] === "." && subdomain.endsWith(domain);
}
function isString(value) {
  return typeof value === "string" || value instanceof String;
}
function isFunction(value) {
  return typeof value === "function";
}
function isBuffer(value) {
  return typeof value === "object" && "length" in value;
}
followRedirects$1.exports = wrap({ http: http$1, https: https$1 });
followRedirects$1.exports.wrap = wrap;
var httpNative = require$$0__default$4["default"], httpsNative = require$$1__default["default"], web_o = webOutgoing, common$1 = common$3, followRedirects = followRedirects$1.exports;
web_o = Object.keys(web_o).map(function(pass) {
  return web_o[pass];
});
var nativeAgents = { http: httpNative, https: httpsNative };
/*!
 * Array of passes.
 *
 * A `pass` is just a function that is executed on `req, res, options`
 * so that you can easily add new checks while still keeping the base
 * flexible.
 */
var webIncoming = {
  deleteLength: function deleteLength(req, res, options) {
    if ((req.method === "DELETE" || req.method === "OPTIONS") && !req.headers["content-length"]) {
      req.headers["content-length"] = "0";
      delete req.headers["transfer-encoding"];
    }
  },
  timeout: function timeout(req, res, options) {
    if (options.timeout) {
      req.socket.setTimeout(options.timeout);
    }
  },
  XHeaders: function XHeaders(req, res, options) {
    if (!options.xfwd)
      return;
    var encrypted = req.isSpdy || common$1.hasEncryptedConnection(req);
    var values = {
      for: req.connection.remoteAddress || req.socket.remoteAddress,
      port: common$1.getPort(req),
      proto: encrypted ? "https" : "http"
    };
    ["for", "port", "proto"].forEach(function(header) {
      req.headers["x-forwarded-" + header] = (req.headers["x-forwarded-" + header] || "") + (req.headers["x-forwarded-" + header] ? "," : "") + values[header];
    });
    req.headers["x-forwarded-host"] = req.headers["x-forwarded-host"] || req.headers["host"] || "";
  },
  stream: function stream(req, res, options, _, server, clb) {
    server.emit("start", req, res, options.target || options.forward);
    var agents = options.followRedirects ? followRedirects : nativeAgents;
    var http2 = agents.http;
    var https2 = agents.https;
    if (options.forward) {
      var forwardReq = (options.forward.protocol === "https:" ? https2 : http2).request(common$1.setupOutgoing(options.ssl || {}, options, req, "forward"));
      var forwardError = createErrorHandler(forwardReq, options.forward);
      req.on("error", forwardError);
      forwardReq.on("error", forwardError);
      (options.buffer || req).pipe(forwardReq);
      if (!options.target) {
        return res.end();
      }
    }
    var proxyReq = (options.target.protocol === "https:" ? https2 : http2).request(common$1.setupOutgoing(options.ssl || {}, options, req));
    proxyReq.on("socket", function(socket) {
      if (server && !proxyReq.getHeader("expect")) {
        server.emit("proxyReq", proxyReq, req, res, options);
      }
    });
    if (options.proxyTimeout) {
      proxyReq.setTimeout(options.proxyTimeout, function() {
        proxyReq.abort();
      });
    }
    req.on("aborted", function() {
      proxyReq.abort();
    });
    var proxyError = createErrorHandler(proxyReq, options.target);
    req.on("error", proxyError);
    proxyReq.on("error", proxyError);
    function createErrorHandler(proxyReq2, url2) {
      return function proxyError2(err) {
        if (req.socket.destroyed && err.code === "ECONNRESET") {
          server.emit("econnreset", err, req, res, url2);
          return proxyReq2.abort();
        }
        if (clb) {
          clb(err, req, res, url2);
        } else {
          server.emit("error", err, req, res, url2);
        }
      };
    }
    (options.buffer || req).pipe(proxyReq);
    proxyReq.on("response", function(proxyRes) {
      if (server) {
        server.emit("proxyRes", proxyRes, req, res);
      }
      if (!res.headersSent && !options.selfHandleResponse) {
        for (var i = 0; i < web_o.length; i++) {
          if (web_o[i](req, res, proxyRes, options)) {
            break;
          }
        }
      }
      if (!res.finished) {
        proxyRes.on("end", function() {
          if (server)
            server.emit("end", req, res, proxyRes);
        });
        if (!options.selfHandleResponse)
          proxyRes.pipe(res);
      } else {
        if (server)
          server.emit("end", req, res, proxyRes);
      }
    });
  }
};
var http = require$$0__default$4["default"], https = require$$1__default["default"], common = common$3;
/*!
 * Array of passes.
 *
 * A `pass` is just a function that is executed on `req, socket, options`
 * so that you can easily add new checks while still keeping the base
 * flexible.
 */
var wsIncoming = {
  checkMethodAndHeader: function checkMethodAndHeader(req, socket) {
    if (req.method !== "GET" || !req.headers.upgrade) {
      socket.destroy();
      return true;
    }
    if (req.headers.upgrade.toLowerCase() !== "websocket") {
      socket.destroy();
      return true;
    }
  },
  XHeaders: function XHeaders2(req, socket, options) {
    if (!options.xfwd)
      return;
    var values = {
      for: req.connection.remoteAddress || req.socket.remoteAddress,
      port: common.getPort(req),
      proto: common.hasEncryptedConnection(req) ? "wss" : "ws"
    };
    ["for", "port", "proto"].forEach(function(header) {
      req.headers["x-forwarded-" + header] = (req.headers["x-forwarded-" + header] || "") + (req.headers["x-forwarded-" + header] ? "," : "") + values[header];
    });
  },
  stream: function stream2(req, socket, options, head, server, clb) {
    var createHttpHeader = function(line, headers) {
      return Object.keys(headers).reduce(function(head2, key) {
        var value = headers[key];
        if (!Array.isArray(value)) {
          head2.push(key + ": " + value);
          return head2;
        }
        for (var i = 0; i < value.length; i++) {
          head2.push(key + ": " + value[i]);
        }
        return head2;
      }, [line]).join("\r\n") + "\r\n\r\n";
    };
    common.setupSocket(socket);
    if (head && head.length)
      socket.unshift(head);
    var proxyReq = (common.isSSL.test(options.target.protocol) ? https : http).request(common.setupOutgoing(options.ssl || {}, options, req));
    if (server) {
      server.emit("proxyReqWs", proxyReq, req, socket, options, head);
    }
    proxyReq.on("error", onOutgoingError);
    proxyReq.on("response", function(res) {
      if (!res.upgrade) {
        socket.write(createHttpHeader("HTTP/" + res.httpVersion + " " + res.statusCode + " " + res.statusMessage, res.headers));
        res.pipe(socket);
      }
    });
    proxyReq.on("upgrade", function(proxyRes, proxySocket, proxyHead) {
      proxySocket.on("error", onOutgoingError);
      proxySocket.on("end", function() {
        server.emit("close", proxyRes, proxySocket, proxyHead);
      });
      socket.on("error", function() {
        proxySocket.end();
      });
      common.setupSocket(proxySocket);
      if (proxyHead && proxyHead.length)
        proxySocket.unshift(proxyHead);
      socket.write(createHttpHeader("HTTP/1.1 101 Switching Protocols", proxyRes.headers));
      proxySocket.pipe(socket).pipe(proxySocket);
      server.emit("open", proxySocket);
      server.emit("proxySocket", proxySocket);
    });
    return proxyReq.end();
    function onOutgoingError(err) {
      if (clb) {
        clb(err, req, socket);
      } else {
        server.emit("error", err, req, socket);
      }
      socket.end();
    }
  }
};
(function(module) {
  var httpProxy2 = module.exports, extend = require$$0__default$2["default"]._extend, parse_url = require$$0__default$3["default"].parse, EE3 = eventemitter3.exports, http2 = require$$0__default$4["default"], https2 = require$$1__default["default"], web = webIncoming, ws = wsIncoming;
  httpProxy2.Server = ProxyServer2;
  function createRightProxy(type) {
    return function(options) {
      return function(req, res) {
        var passes = type === "ws" ? this.wsPasses : this.webPasses, args = [].slice.call(arguments), cntr = args.length - 1, head, cbl;
        if (typeof args[cntr] === "function") {
          cbl = args[cntr];
          cntr--;
        }
        var requestOptions = options;
        if (!(args[cntr] instanceof Buffer) && args[cntr] !== res) {
          requestOptions = extend({}, options);
          extend(requestOptions, args[cntr]);
          cntr--;
        }
        if (args[cntr] instanceof Buffer) {
          head = args[cntr];
        }
        ["target", "forward"].forEach(function(e) {
          if (typeof requestOptions[e] === "string")
            requestOptions[e] = parse_url(requestOptions[e]);
        });
        if (!requestOptions.target && !requestOptions.forward) {
          return this.emit("error", new Error("Must provide a proper URL as target"));
        }
        for (var i = 0; i < passes.length; i++) {
          if (passes[i](req, res, requestOptions, head, this, cbl)) {
            break;
          }
        }
      };
    };
  }
  httpProxy2.createRightProxy = createRightProxy;
  function ProxyServer2(options) {
    EE3.call(this);
    options = options || {};
    options.prependPath = options.prependPath === false ? false : true;
    this.web = this.proxyRequest = createRightProxy("web")(options);
    this.ws = this.proxyWebsocketRequest = createRightProxy("ws")(options);
    this.options = options;
    this.webPasses = Object.keys(web).map(function(pass) {
      return web[pass];
    });
    this.wsPasses = Object.keys(ws).map(function(pass) {
      return ws[pass];
    });
    this.on("error", this.onError, this);
  }
  require$$0__default$2["default"].inherits(ProxyServer2, EE3);
  ProxyServer2.prototype.onError = function(err) {
    if (this.listeners("error").length === 1) {
      throw err;
    }
  };
  ProxyServer2.prototype.listen = function(port, hostname) {
    var self2 = this, closure = function(req, res) {
      self2.web(req, res);
    };
    this._server = this.options.ssl ? https2.createServer(this.options.ssl, closure) : http2.createServer(closure);
    if (this.options.ws) {
      this._server.on("upgrade", function(req, socket, head) {
        self2.ws(req, socket, head);
      });
    }
    this._server.listen(port, hostname);
    return this;
  };
  ProxyServer2.prototype.close = function(callback) {
    var self2 = this;
    if (this._server) {
      this._server.close(done);
    }
    function done() {
      self2._server = null;
      if (callback) {
        callback.apply(null, arguments);
      }
    }
  };
  ProxyServer2.prototype.before = function(type, passName, callback) {
    if (type !== "ws" && type !== "web") {
      throw new Error("type must be `web` or `ws`");
    }
    var passes = type === "ws" ? this.wsPasses : this.webPasses, i = false;
    passes.forEach(function(v, idx) {
      if (v.name === passName)
        i = idx;
    });
    if (i === false)
      throw new Error("No such pass");
    passes.splice(i, 0, callback);
  };
  ProxyServer2.prototype.after = function(type, passName, callback) {
    if (type !== "ws" && type !== "web") {
      throw new Error("type must be `web` or `ws`");
    }
    var passes = type === "ws" ? this.wsPasses : this.webPasses, i = false;
    passes.forEach(function(v, idx) {
      if (v.name === passName)
        i = idx;
    });
    if (i === false)
      throw new Error("No such pass");
    passes.splice(i++, 0, callback);
  };
})(httpProxy$3);
var ProxyServer = httpProxy$3.exports.Server;
function createProxyServer(options) {
  return new ProxyServer(options);
}
ProxyServer.createProxyServer = createProxyServer;
ProxyServer.createServer = createProxyServer;
ProxyServer.createProxy = createProxyServer;
var httpProxy$2 = ProxyServer;
/*!
 * Caron dimonio, con occhi di bragia
 * loro accennando, tutte le raccoglie;
 * batte col remo qualunque s’adagia 
 *
 * Charon the demon, with the eyes of glede,
 * Beckoning to them, collects them all together,
 * Beats with his oar whoever lags behind
 *          
 *          Dante - The Divine Comedy (Canto III)
 */
var httpProxy$1 = httpProxy$2;
var configFactory = {};
var isPlainObj$3 = (value) => {
  if (Object.prototype.toString.call(value) !== "[object Object]") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
};
var errors = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.ERRORS = void 0;
  (function(ERRORS) {
    ERRORS["ERR_CONFIG_FACTORY_TARGET_MISSING"] = '[HPM] Missing "target" option. Example: {target: "http://www.example.org"}';
    ERRORS["ERR_CONTEXT_MATCHER_GENERIC"] = '[HPM] Invalid context. Expecting something like: "/api" or ["/api", "/ajax"]';
    ERRORS["ERR_CONTEXT_MATCHER_INVALID_ARRAY"] = '[HPM] Invalid context. Expecting something like: ["/api", "/ajax"] or ["/api/**", "!**.html"]';
    ERRORS["ERR_PATH_REWRITER_CONFIG"] = "[HPM] Invalid pathRewrite config. Expecting object with pathRewrite config or a rewrite function";
  })(exports.ERRORS || (exports.ERRORS = {}));
})(errors);
var logger$4 = {};
Object.defineProperty(logger$4, "__esModule", { value: true });
logger$4.getArrow = logger$4.getInstance = void 0;
const util$2 = require$$0__default$2["default"];
let loggerInstance;
const defaultProvider = {
  log: console.log,
  debug: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error
};
var LEVELS;
(function(LEVELS2) {
  LEVELS2[LEVELS2["debug"] = 10] = "debug";
  LEVELS2[LEVELS2["info"] = 20] = "info";
  LEVELS2[LEVELS2["warn"] = 30] = "warn";
  LEVELS2[LEVELS2["error"] = 50] = "error";
  LEVELS2[LEVELS2["silent"] = 80] = "silent";
})(LEVELS || (LEVELS = {}));
function getInstance() {
  if (!loggerInstance) {
    loggerInstance = new Logger();
  }
  return loggerInstance;
}
logger$4.getInstance = getInstance;
class Logger {
  constructor() {
    this.setLevel("info");
    this.setProvider(() => defaultProvider);
  }
  log() {
    this.provider.log(this._interpolate.apply(null, arguments));
  }
  debug() {
    if (this._showLevel("debug")) {
      this.provider.debug(this._interpolate.apply(null, arguments));
    }
  }
  info() {
    if (this._showLevel("info")) {
      this.provider.info(this._interpolate.apply(null, arguments));
    }
  }
  warn() {
    if (this._showLevel("warn")) {
      this.provider.warn(this._interpolate.apply(null, arguments));
    }
  }
  error() {
    if (this._showLevel("error")) {
      this.provider.error(this._interpolate.apply(null, arguments));
    }
  }
  setLevel(v) {
    if (this.isValidLevel(v)) {
      this.logLevel = v;
    }
  }
  setProvider(fn) {
    if (fn && this.isValidProvider(fn)) {
      this.provider = fn(defaultProvider);
    }
  }
  isValidProvider(fnProvider) {
    const result = true;
    if (fnProvider && typeof fnProvider !== "function") {
      throw new Error("[HPM] Log provider config error. Expecting a function.");
    }
    return result;
  }
  isValidLevel(levelName) {
    const validLevels = Object.keys(LEVELS);
    const isValid = validLevels.includes(levelName);
    if (!isValid) {
      throw new Error("[HPM] Log level error. Invalid logLevel.");
    }
    return isValid;
  }
  _showLevel(showLevel) {
    let result = false;
    const currentLogLevel = LEVELS[this.logLevel];
    if (currentLogLevel && currentLogLevel <= LEVELS[showLevel]) {
      result = true;
    }
    return result;
  }
  _interpolate(format, ...args) {
    const result = util$2.format(format, ...args);
    return result;
  }
}
function getArrow(originalPath, newPath, originalTarget, newTarget) {
  const arrow = [">"];
  const isNewTarget = originalTarget !== newTarget;
  const isNewPath = originalPath !== newPath;
  if (isNewPath && !isNewTarget) {
    arrow.unshift("~");
  } else if (!isNewPath && isNewTarget) {
    arrow.unshift("=");
  } else if (isNewPath && isNewTarget) {
    arrow.unshift("\u2248");
  } else {
    arrow.unshift("-");
  }
  return arrow.join("");
}
logger$4.getArrow = getArrow;
Object.defineProperty(configFactory, "__esModule", { value: true });
configFactory.createConfig = void 0;
const isPlainObj$2 = isPlainObj$3;
const url$1 = require$$0__default$3["default"];
const errors_1$2 = errors;
const logger_1$4 = logger$4;
const logger$3 = (0, logger_1$4.getInstance)();
function createConfig(context, opts) {
  const config = {
    context: void 0,
    options: {}
  };
  if (isContextless(context, opts)) {
    config.context = "/";
    config.options = Object.assign(config.options, context);
  } else if (isStringShortHand(context)) {
    const oUrl = url$1.parse(context);
    const target = [oUrl.protocol, "//", oUrl.host].join("");
    config.context = oUrl.pathname || "/";
    config.options = Object.assign(config.options, { target }, opts);
    if (oUrl.protocol === "ws:" || oUrl.protocol === "wss:") {
      config.options.ws = true;
    }
  } else {
    config.context = context;
    config.options = Object.assign(config.options, opts);
  }
  configureLogger(config.options);
  if (!config.options.target && !config.options.router) {
    throw new Error(errors_1$2.ERRORS.ERR_CONFIG_FACTORY_TARGET_MISSING);
  }
  return config;
}
configFactory.createConfig = createConfig;
function isStringShortHand(context) {
  if (typeof context === "string") {
    return !!url$1.parse(context).host;
  }
}
function isContextless(context, opts) {
  return isPlainObj$2(context) && (opts == null || Object.keys(opts).length === 0);
}
function configureLogger(options) {
  if (options.logLevel) {
    logger$3.setLevel(options.logLevel);
  }
  if (options.logProvider) {
    logger$3.setProvider(options.logProvider);
  }
}
var contextMatcher$1 = {};
/*!
 * is-extglob <https://github.com/jonschlinkert/is-extglob>
 *
 * Copyright (c) 2014-2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */
var isExtglob$1 = function isExtglob2(str) {
  if (typeof str !== "string" || str === "") {
    return false;
  }
  var match2;
  while (match2 = /(\\).|([@?!+*]\(.*\))/g.exec(str)) {
    if (match2[2])
      return true;
    str = str.slice(match2.index + match2[0].length);
  }
  return false;
};
/*!
 * is-glob <https://github.com/jonschlinkert/is-glob>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */
var isExtglob = isExtglob$1;
var chars = { "{": "}", "(": ")", "[": "]" };
var strictCheck = function(str) {
  if (str[0] === "!") {
    return true;
  }
  var index = 0;
  var pipeIndex = -2;
  var closeSquareIndex = -2;
  var closeCurlyIndex = -2;
  var closeParenIndex = -2;
  var backSlashIndex = -2;
  while (index < str.length) {
    if (str[index] === "*") {
      return true;
    }
    if (str[index + 1] === "?" && /[\].+)]/.test(str[index])) {
      return true;
    }
    if (closeSquareIndex !== -1 && str[index] === "[" && str[index + 1] !== "]") {
      if (closeSquareIndex < index) {
        closeSquareIndex = str.indexOf("]", index);
      }
      if (closeSquareIndex > index) {
        if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) {
          return true;
        }
        backSlashIndex = str.indexOf("\\", index);
        if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) {
          return true;
        }
      }
    }
    if (closeCurlyIndex !== -1 && str[index] === "{" && str[index + 1] !== "}") {
      closeCurlyIndex = str.indexOf("}", index);
      if (closeCurlyIndex > index) {
        backSlashIndex = str.indexOf("\\", index);
        if (backSlashIndex === -1 || backSlashIndex > closeCurlyIndex) {
          return true;
        }
      }
    }
    if (closeParenIndex !== -1 && str[index] === "(" && str[index + 1] === "?" && /[:!=]/.test(str[index + 2]) && str[index + 3] !== ")") {
      closeParenIndex = str.indexOf(")", index);
      if (closeParenIndex > index) {
        backSlashIndex = str.indexOf("\\", index);
        if (backSlashIndex === -1 || backSlashIndex > closeParenIndex) {
          return true;
        }
      }
    }
    if (pipeIndex !== -1 && str[index] === "(" && str[index + 1] !== "|") {
      if (pipeIndex < index) {
        pipeIndex = str.indexOf("|", index);
      }
      if (pipeIndex !== -1 && str[pipeIndex + 1] !== ")") {
        closeParenIndex = str.indexOf(")", pipeIndex);
        if (closeParenIndex > pipeIndex) {
          backSlashIndex = str.indexOf("\\", pipeIndex);
          if (backSlashIndex === -1 || backSlashIndex > closeParenIndex) {
            return true;
          }
        }
      }
    }
    if (str[index] === "\\") {
      var open = str[index + 1];
      index += 2;
      var close = chars[open];
      if (close) {
        var n = str.indexOf(close, index);
        if (n !== -1) {
          index = n + 1;
        }
      }
      if (str[index] === "!") {
        return true;
      }
    } else {
      index++;
    }
  }
  return false;
};
var relaxedCheck = function(str) {
  if (str[0] === "!") {
    return true;
  }
  var index = 0;
  while (index < str.length) {
    if (/[*?{}()[\]]/.test(str[index])) {
      return true;
    }
    if (str[index] === "\\") {
      var open = str[index + 1];
      index += 2;
      var close = chars[open];
      if (close) {
        var n = str.indexOf(close, index);
        if (n !== -1) {
          index = n + 1;
        }
      }
      if (str[index] === "!") {
        return true;
      }
    } else {
      index++;
    }
  }
  return false;
};
var isGlob$1 = function isGlob2(str, options) {
  if (typeof str !== "string" || str === "") {
    return false;
  }
  if (isExtglob(str)) {
    return true;
  }
  var check = strictCheck;
  if (options && options.strict === false) {
    check = relaxedCheck;
  }
  return check(str);
};
var utils$8 = {};
(function(exports) {
  exports.isInteger = (num) => {
    if (typeof num === "number") {
      return Number.isInteger(num);
    }
    if (typeof num === "string" && num.trim() !== "") {
      return Number.isInteger(Number(num));
    }
    return false;
  };
  exports.find = (node, type) => node.nodes.find((node2) => node2.type === type);
  exports.exceedsLimit = (min, max, step = 1, limit) => {
    if (limit === false)
      return false;
    if (!exports.isInteger(min) || !exports.isInteger(max))
      return false;
    return (Number(max) - Number(min)) / Number(step) >= limit;
  };
  exports.escapeNode = (block, n = 0, type) => {
    let node = block.nodes[n];
    if (!node)
      return;
    if (type && node.type === type || node.type === "open" || node.type === "close") {
      if (node.escaped !== true) {
        node.value = "\\" + node.value;
        node.escaped = true;
      }
    }
  };
  exports.encloseBrace = (node) => {
    if (node.type !== "brace")
      return false;
    if (node.commas >> 0 + node.ranges >> 0 === 0) {
      node.invalid = true;
      return true;
    }
    return false;
  };
  exports.isInvalidBrace = (block) => {
    if (block.type !== "brace")
      return false;
    if (block.invalid === true || block.dollar)
      return true;
    if (block.commas >> 0 + block.ranges >> 0 === 0) {
      block.invalid = true;
      return true;
    }
    if (block.open !== true || block.close !== true) {
      block.invalid = true;
      return true;
    }
    return false;
  };
  exports.isOpenOrClose = (node) => {
    if (node.type === "open" || node.type === "close") {
      return true;
    }
    return node.open === true || node.close === true;
  };
  exports.reduce = (nodes) => nodes.reduce((acc, node) => {
    if (node.type === "text")
      acc.push(node.value);
    if (node.type === "range")
      node.type = "text";
    return acc;
  }, []);
  exports.flatten = (...args) => {
    const result = [];
    const flat = (arr) => {
      for (let i = 0; i < arr.length; i++) {
        let ele = arr[i];
        Array.isArray(ele) ? flat(ele) : ele !== void 0 && result.push(ele);
      }
      return result;
    };
    flat(args);
    return result;
  };
})(utils$8);
const utils$7 = utils$8;
var stringify$4 = (ast, options = {}) => {
  let stringify2 = (node, parent = {}) => {
    let invalidBlock = options.escapeInvalid && utils$7.isInvalidBrace(parent);
    let invalidNode = node.invalid === true && options.escapeInvalid === true;
    let output = "";
    if (node.value) {
      if ((invalidBlock || invalidNode) && utils$7.isOpenOrClose(node)) {
        return "\\" + node.value;
      }
      return node.value;
    }
    if (node.value) {
      return node.value;
    }
    if (node.nodes) {
      for (let child of node.nodes) {
        output += stringify2(child);
      }
    }
    return output;
  };
  return stringify2(ast);
};
/*!
 * is-number <https://github.com/jonschlinkert/is-number>
 *
 * Copyright (c) 2014-present, Jon Schlinkert.
 * Released under the MIT License.
 */
var isNumber$2 = function(num) {
  if (typeof num === "number") {
    return num - num === 0;
  }
  if (typeof num === "string" && num.trim() !== "") {
    return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
  }
  return false;
};
/*!
 * to-regex-range <https://github.com/micromatch/to-regex-range>
 *
 * Copyright (c) 2015-present, Jon Schlinkert.
 * Released under the MIT License.
 */
const isNumber$1 = isNumber$2;
const toRegexRange$1 = (min, max, options) => {
  if (isNumber$1(min) === false) {
    throw new TypeError("toRegexRange: expected the first argument to be a number");
  }
  if (max === void 0 || min === max) {
    return String(min);
  }
  if (isNumber$1(max) === false) {
    throw new TypeError("toRegexRange: expected the second argument to be a number.");
  }
  let opts = __spreadValues({ relaxZeros: true }, options);
  if (typeof opts.strictZeros === "boolean") {
    opts.relaxZeros = opts.strictZeros === false;
  }
  let relax = String(opts.relaxZeros);
  let shorthand = String(opts.shorthand);
  let capture = String(opts.capture);
  let wrap2 = String(opts.wrap);
  let cacheKey = min + ":" + max + "=" + relax + shorthand + capture + wrap2;
  if (toRegexRange$1.cache.hasOwnProperty(cacheKey)) {
    return toRegexRange$1.cache[cacheKey].result;
  }
  let a = Math.min(min, max);
  let b = Math.max(min, max);
  if (Math.abs(a - b) === 1) {
    let result = min + "|" + max;
    if (opts.capture) {
      return `(${result})`;
    }
    if (opts.wrap === false) {
      return result;
    }
    return `(?:${result})`;
  }
  let isPadded = hasPadding(min) || hasPadding(max);
  let state = { min, max, a, b };
  let positives = [];
  let negatives = [];
  if (isPadded) {
    state.isPadded = isPadded;
    state.maxLen = String(state.max).length;
  }
  if (a < 0) {
    let newMin = b < 0 ? Math.abs(b) : 1;
    negatives = splitToPatterns(newMin, Math.abs(a), state, opts);
    a = state.a = 0;
  }
  if (b >= 0) {
    positives = splitToPatterns(a, b, state, opts);
  }
  state.negatives = negatives;
  state.positives = positives;
  state.result = collatePatterns(negatives, positives);
  if (opts.capture === true) {
    state.result = `(${state.result})`;
  } else if (opts.wrap !== false && positives.length + negatives.length > 1) {
    state.result = `(?:${state.result})`;
  }
  toRegexRange$1.cache[cacheKey] = state;
  return state.result;
};
function collatePatterns(neg, pos, options) {
  let onlyNegative = filterPatterns(neg, pos, "-", false) || [];
  let onlyPositive = filterPatterns(pos, neg, "", false) || [];
  let intersected = filterPatterns(neg, pos, "-?", true) || [];
  let subpatterns = onlyNegative.concat(intersected).concat(onlyPositive);
  return subpatterns.join("|");
}
function splitToRanges(min, max) {
  let nines = 1;
  let zeros2 = 1;
  let stop = countNines(min, nines);
  let stops = new Set([max]);
  while (min <= stop && stop <= max) {
    stops.add(stop);
    nines += 1;
    stop = countNines(min, nines);
  }
  stop = countZeros(max + 1, zeros2) - 1;
  while (min < stop && stop <= max) {
    stops.add(stop);
    zeros2 += 1;
    stop = countZeros(max + 1, zeros2) - 1;
  }
  stops = [...stops];
  stops.sort(compare);
  return stops;
}
function rangeToPattern(start, stop, options) {
  if (start === stop) {
    return { pattern: start, count: [], digits: 0 };
  }
  let zipped = zip(start, stop);
  let digits = zipped.length;
  let pattern = "";
  let count = 0;
  for (let i = 0; i < digits; i++) {
    let [startDigit, stopDigit] = zipped[i];
    if (startDigit === stopDigit) {
      pattern += startDigit;
    } else if (startDigit !== "0" || stopDigit !== "9") {
      pattern += toCharacterClass(startDigit, stopDigit);
    } else {
      count++;
    }
  }
  if (count) {
    pattern += options.shorthand === true ? "\\d" : "[0-9]";
  }
  return { pattern, count: [count], digits };
}
function splitToPatterns(min, max, tok, options) {
  let ranges = splitToRanges(min, max);
  let tokens = [];
  let start = min;
  let prev;
  for (let i = 0; i < ranges.length; i++) {
    let max2 = ranges[i];
    let obj = rangeToPattern(String(start), String(max2), options);
    let zeros2 = "";
    if (!tok.isPadded && prev && prev.pattern === obj.pattern) {
      if (prev.count.length > 1) {
        prev.count.pop();
      }
      prev.count.push(obj.count[0]);
      prev.string = prev.pattern + toQuantifier(prev.count);
      start = max2 + 1;
      continue;
    }
    if (tok.isPadded) {
      zeros2 = padZeros(max2, tok, options);
    }
    obj.string = zeros2 + obj.pattern + toQuantifier(obj.count);
    tokens.push(obj);
    start = max2 + 1;
    prev = obj;
  }
  return tokens;
}
function filterPatterns(arr, comparison, prefix, intersection, options) {
  let result = [];
  for (let ele of arr) {
    let { string } = ele;
    if (!intersection && !contains(comparison, "string", string)) {
      result.push(prefix + string);
    }
    if (intersection && contains(comparison, "string", string)) {
      result.push(prefix + string);
    }
  }
  return result;
}
function zip(a, b) {
  let arr = [];
  for (let i = 0; i < a.length; i++)
    arr.push([a[i], b[i]]);
  return arr;
}
function compare(a, b) {
  return a > b ? 1 : b > a ? -1 : 0;
}
function contains(arr, key, val) {
  return arr.some((ele) => ele[key] === val);
}
function countNines(min, len) {
  return Number(String(min).slice(0, -len) + "9".repeat(len));
}
function countZeros(integer, zeros2) {
  return integer - integer % Math.pow(10, zeros2);
}
function toQuantifier(digits) {
  let [start = 0, stop = ""] = digits;
  if (stop || start > 1) {
    return `{${start + (stop ? "," + stop : "")}}`;
  }
  return "";
}
function toCharacterClass(a, b, options) {
  return `[${a}${b - a === 1 ? "" : "-"}${b}]`;
}
function hasPadding(str) {
  return /^-?(0+)\d/.test(str);
}
function padZeros(value, tok, options) {
  if (!tok.isPadded) {
    return value;
  }
  let diff = Math.abs(tok.maxLen - String(value).length);
  let relax = options.relaxZeros !== false;
  switch (diff) {
    case 0:
      return "";
    case 1:
      return relax ? "0?" : "0";
    case 2:
      return relax ? "0{0,2}" : "00";
    default: {
      return relax ? `0{0,${diff}}` : `0{${diff}}`;
    }
  }
}
toRegexRange$1.cache = {};
toRegexRange$1.clearCache = () => toRegexRange$1.cache = {};
var toRegexRange_1 = toRegexRange$1;
/*!
 * fill-range <https://github.com/jonschlinkert/fill-range>
 *
 * Copyright (c) 2014-present, Jon Schlinkert.
 * Licensed under the MIT License.
 */
const util$1 = require$$0__default$2["default"];
const toRegexRange = toRegexRange_1;
const isObject$1 = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
const transform = (toNumber) => {
  return (value) => toNumber === true ? Number(value) : String(value);
};
const isValidValue = (value) => {
  return typeof value === "number" || typeof value === "string" && value !== "";
};
const isNumber = (num) => Number.isInteger(+num);
const zeros = (input) => {
  let value = `${input}`;
  let index = -1;
  if (value[0] === "-")
    value = value.slice(1);
  if (value === "0")
    return false;
  while (value[++index] === "0")
    ;
  return index > 0;
};
const stringify$3 = (start, end, options) => {
  if (typeof start === "string" || typeof end === "string") {
    return true;
  }
  return options.stringify === true;
};
const pad = (input, maxLength, toNumber) => {
  if (maxLength > 0) {
    let dash = input[0] === "-" ? "-" : "";
    if (dash)
      input = input.slice(1);
    input = dash + input.padStart(dash ? maxLength - 1 : maxLength, "0");
  }
  if (toNumber === false) {
    return String(input);
  }
  return input;
};
const toMaxLen = (input, maxLength) => {
  let negative = input[0] === "-" ? "-" : "";
  if (negative) {
    input = input.slice(1);
    maxLength--;
  }
  while (input.length < maxLength)
    input = "0" + input;
  return negative ? "-" + input : input;
};
const toSequence = (parts, options) => {
  parts.negatives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
  parts.positives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
  let prefix = options.capture ? "" : "?:";
  let positives = "";
  let negatives = "";
  let result;
  if (parts.positives.length) {
    positives = parts.positives.join("|");
  }
  if (parts.negatives.length) {
    negatives = `-(${prefix}${parts.negatives.join("|")})`;
  }
  if (positives && negatives) {
    result = `${positives}|${negatives}`;
  } else {
    result = positives || negatives;
  }
  if (options.wrap) {
    return `(${prefix}${result})`;
  }
  return result;
};
const toRange = (a, b, isNumbers, options) => {
  if (isNumbers) {
    return toRegexRange(a, b, __spreadValues({ wrap: false }, options));
  }
  let start = String.fromCharCode(a);
  if (a === b)
    return start;
  let stop = String.fromCharCode(b);
  return `[${start}-${stop}]`;
};
const toRegex = (start, end, options) => {
  if (Array.isArray(start)) {
    let wrap2 = options.wrap === true;
    let prefix = options.capture ? "" : "?:";
    return wrap2 ? `(${prefix}${start.join("|")})` : start.join("|");
  }
  return toRegexRange(start, end, options);
};
const rangeError = (...args) => {
  return new RangeError("Invalid range arguments: " + util$1.inspect(...args));
};
const invalidRange = (start, end, options) => {
  if (options.strictRanges === true)
    throw rangeError([start, end]);
  return [];
};
const invalidStep = (step, options) => {
  if (options.strictRanges === true) {
    throw new TypeError(`Expected step "${step}" to be a number`);
  }
  return [];
};
const fillNumbers = (start, end, step = 1, options = {}) => {
  let a = Number(start);
  let b = Number(end);
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    if (options.strictRanges === true)
      throw rangeError([start, end]);
    return [];
  }
  if (a === 0)
    a = 0;
  if (b === 0)
    b = 0;
  let descending = a > b;
  let startString = String(start);
  let endString = String(end);
  let stepString = String(step);
  step = Math.max(Math.abs(step), 1);
  let padded = zeros(startString) || zeros(endString) || zeros(stepString);
  let maxLen = padded ? Math.max(startString.length, endString.length, stepString.length) : 0;
  let toNumber = padded === false && stringify$3(start, end, options) === false;
  let format = options.transform || transform(toNumber);
  if (options.toRegex && step === 1) {
    return toRange(toMaxLen(start, maxLen), toMaxLen(end, maxLen), true, options);
  }
  let parts = { negatives: [], positives: [] };
  let push = (num) => parts[num < 0 ? "negatives" : "positives"].push(Math.abs(num));
  let range = [];
  let index = 0;
  while (descending ? a >= b : a <= b) {
    if (options.toRegex === true && step > 1) {
      push(a);
    } else {
      range.push(pad(format(a, index), maxLen, toNumber));
    }
    a = descending ? a - step : a + step;
    index++;
  }
  if (options.toRegex === true) {
    return step > 1 ? toSequence(parts, options) : toRegex(range, null, __spreadValues({ wrap: false }, options));
  }
  return range;
};
const fillLetters = (start, end, step = 1, options = {}) => {
  if (!isNumber(start) && start.length > 1 || !isNumber(end) && end.length > 1) {
    return invalidRange(start, end, options);
  }
  let format = options.transform || ((val) => String.fromCharCode(val));
  let a = `${start}`.charCodeAt(0);
  let b = `${end}`.charCodeAt(0);
  let descending = a > b;
  let min = Math.min(a, b);
  let max = Math.max(a, b);
  if (options.toRegex && step === 1) {
    return toRange(min, max, false, options);
  }
  let range = [];
  let index = 0;
  while (descending ? a >= b : a <= b) {
    range.push(format(a, index));
    a = descending ? a - step : a + step;
    index++;
  }
  if (options.toRegex === true) {
    return toRegex(range, null, { wrap: false, options });
  }
  return range;
};
const fill$2 = (start, end, step, options = {}) => {
  if (end == null && isValidValue(start)) {
    return [start];
  }
  if (!isValidValue(start) || !isValidValue(end)) {
    return invalidRange(start, end, options);
  }
  if (typeof step === "function") {
    return fill$2(start, end, 1, { transform: step });
  }
  if (isObject$1(step)) {
    return fill$2(start, end, 0, step);
  }
  let opts = __spreadValues({}, options);
  if (opts.capture === true)
    opts.wrap = true;
  step = step || opts.step || 1;
  if (!isNumber(step)) {
    if (step != null && !isObject$1(step))
      return invalidStep(step, opts);
    return fill$2(start, end, 1, step);
  }
  if (isNumber(start) && isNumber(end)) {
    return fillNumbers(start, end, step, opts);
  }
  return fillLetters(start, end, Math.max(Math.abs(step), 1), opts);
};
var fillRange = fill$2;
const fill$1 = fillRange;
const utils$6 = utils$8;
const compile$1 = (ast, options = {}) => {
  let walk = (node, parent = {}) => {
    let invalidBlock = utils$6.isInvalidBrace(parent);
    let invalidNode = node.invalid === true && options.escapeInvalid === true;
    let invalid = invalidBlock === true || invalidNode === true;
    let prefix = options.escapeInvalid === true ? "\\" : "";
    let output = "";
    if (node.isOpen === true) {
      return prefix + node.value;
    }
    if (node.isClose === true) {
      return prefix + node.value;
    }
    if (node.type === "open") {
      return invalid ? prefix + node.value : "(";
    }
    if (node.type === "close") {
      return invalid ? prefix + node.value : ")";
    }
    if (node.type === "comma") {
      return node.prev.type === "comma" ? "" : invalid ? node.value : "|";
    }
    if (node.value) {
      return node.value;
    }
    if (node.nodes && node.ranges > 0) {
      let args = utils$6.reduce(node.nodes);
      let range = fill$1(...args, __spreadProps(__spreadValues({}, options), { wrap: false, toRegex: true }));
      if (range.length !== 0) {
        return args.length > 1 && range.length > 1 ? `(${range})` : range;
      }
    }
    if (node.nodes) {
      for (let child of node.nodes) {
        output += walk(child, node);
      }
    }
    return output;
  };
  return walk(ast);
};
var compile_1 = compile$1;
const fill = fillRange;
const stringify$2 = stringify$4;
const utils$5 = utils$8;
const append$1 = (queue = "", stash = "", enclose = false) => {
  let result = [];
  queue = [].concat(queue);
  stash = [].concat(stash);
  if (!stash.length)
    return queue;
  if (!queue.length) {
    return enclose ? utils$5.flatten(stash).map((ele) => `{${ele}}`) : stash;
  }
  for (let item of queue) {
    if (Array.isArray(item)) {
      for (let value of item) {
        result.push(append$1(value, stash, enclose));
      }
    } else {
      for (let ele of stash) {
        if (enclose === true && typeof ele === "string")
          ele = `{${ele}}`;
        result.push(Array.isArray(ele) ? append$1(item, ele, enclose) : item + ele);
      }
    }
  }
  return utils$5.flatten(result);
};
const expand$1 = (ast, options = {}) => {
  let rangeLimit = options.rangeLimit === void 0 ? 1e3 : options.rangeLimit;
  let walk = (node, parent = {}) => {
    node.queue = [];
    let p = parent;
    let q = parent.queue;
    while (p.type !== "brace" && p.type !== "root" && p.parent) {
      p = p.parent;
      q = p.queue;
    }
    if (node.invalid || node.dollar) {
      q.push(append$1(q.pop(), stringify$2(node, options)));
      return;
    }
    if (node.type === "brace" && node.invalid !== true && node.nodes.length === 2) {
      q.push(append$1(q.pop(), ["{}"]));
      return;
    }
    if (node.nodes && node.ranges > 0) {
      let args = utils$5.reduce(node.nodes);
      if (utils$5.exceedsLimit(...args, options.step, rangeLimit)) {
        throw new RangeError("expanded array length exceeds range limit. Use options.rangeLimit to increase or disable the limit.");
      }
      let range = fill(...args, options);
      if (range.length === 0) {
        range = stringify$2(node, options);
      }
      q.push(append$1(q.pop(), range));
      node.nodes = [];
      return;
    }
    let enclose = utils$5.encloseBrace(node);
    let queue = node.queue;
    let block = node;
    while (block.type !== "brace" && block.type !== "root" && block.parent) {
      block = block.parent;
      queue = block.queue;
    }
    for (let i = 0; i < node.nodes.length; i++) {
      let child = node.nodes[i];
      if (child.type === "comma" && node.type === "brace") {
        if (i === 1)
          queue.push("");
        queue.push("");
        continue;
      }
      if (child.type === "close") {
        q.push(append$1(q.pop(), queue, enclose));
        continue;
      }
      if (child.value && child.type !== "open") {
        queue.push(append$1(queue.pop(), child.value));
        continue;
      }
      if (child.nodes) {
        walk(child, node);
      }
    }
    return queue;
  };
  return utils$5.flatten(walk(ast));
};
var expand_1 = expand$1;
var constants$3 = {
  MAX_LENGTH: 1024 * 64,
  CHAR_0: "0",
  CHAR_9: "9",
  CHAR_UPPERCASE_A: "A",
  CHAR_LOWERCASE_A: "a",
  CHAR_UPPERCASE_Z: "Z",
  CHAR_LOWERCASE_Z: "z",
  CHAR_LEFT_PARENTHESES: "(",
  CHAR_RIGHT_PARENTHESES: ")",
  CHAR_ASTERISK: "*",
  CHAR_AMPERSAND: "&",
  CHAR_AT: "@",
  CHAR_BACKSLASH: "\\",
  CHAR_BACKTICK: "`",
  CHAR_CARRIAGE_RETURN: "\r",
  CHAR_CIRCUMFLEX_ACCENT: "^",
  CHAR_COLON: ":",
  CHAR_COMMA: ",",
  CHAR_DOLLAR: "$",
  CHAR_DOT: ".",
  CHAR_DOUBLE_QUOTE: '"',
  CHAR_EQUAL: "=",
  CHAR_EXCLAMATION_MARK: "!",
  CHAR_FORM_FEED: "\f",
  CHAR_FORWARD_SLASH: "/",
  CHAR_HASH: "#",
  CHAR_HYPHEN_MINUS: "-",
  CHAR_LEFT_ANGLE_BRACKET: "<",
  CHAR_LEFT_CURLY_BRACE: "{",
  CHAR_LEFT_SQUARE_BRACKET: "[",
  CHAR_LINE_FEED: "\n",
  CHAR_NO_BREAK_SPACE: "\xA0",
  CHAR_PERCENT: "%",
  CHAR_PLUS: "+",
  CHAR_QUESTION_MARK: "?",
  CHAR_RIGHT_ANGLE_BRACKET: ">",
  CHAR_RIGHT_CURLY_BRACE: "}",
  CHAR_RIGHT_SQUARE_BRACKET: "]",
  CHAR_SEMICOLON: ";",
  CHAR_SINGLE_QUOTE: "'",
  CHAR_SPACE: " ",
  CHAR_TAB: "	",
  CHAR_UNDERSCORE: "_",
  CHAR_VERTICAL_LINE: "|",
  CHAR_ZERO_WIDTH_NOBREAK_SPACE: "\uFEFF"
};
const stringify$1 = stringify$4;
const {
  MAX_LENGTH: MAX_LENGTH$1,
  CHAR_BACKSLASH,
  CHAR_BACKTICK,
  CHAR_COMMA: CHAR_COMMA$1,
  CHAR_DOT: CHAR_DOT$1,
  CHAR_LEFT_PARENTHESES: CHAR_LEFT_PARENTHESES$1,
  CHAR_RIGHT_PARENTHESES: CHAR_RIGHT_PARENTHESES$1,
  CHAR_LEFT_CURLY_BRACE: CHAR_LEFT_CURLY_BRACE$1,
  CHAR_RIGHT_CURLY_BRACE: CHAR_RIGHT_CURLY_BRACE$1,
  CHAR_LEFT_SQUARE_BRACKET: CHAR_LEFT_SQUARE_BRACKET$1,
  CHAR_RIGHT_SQUARE_BRACKET: CHAR_RIGHT_SQUARE_BRACKET$1,
  CHAR_DOUBLE_QUOTE,
  CHAR_SINGLE_QUOTE,
  CHAR_NO_BREAK_SPACE,
  CHAR_ZERO_WIDTH_NOBREAK_SPACE
} = constants$3;
const parse$4 = (input, options = {}) => {
  if (typeof input !== "string") {
    throw new TypeError("Expected a string");
  }
  let opts = options || {};
  let max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH$1, opts.maxLength) : MAX_LENGTH$1;
  if (input.length > max) {
    throw new SyntaxError(`Input length (${input.length}), exceeds max characters (${max})`);
  }
  let ast = { type: "root", input, nodes: [] };
  let stack = [ast];
  let block = ast;
  let prev = ast;
  let brackets = 0;
  let length = input.length;
  let index = 0;
  let depth2 = 0;
  let value;
  const advance = () => input[index++];
  const push = (node) => {
    if (node.type === "text" && prev.type === "dot") {
      prev.type = "text";
    }
    if (prev && prev.type === "text" && node.type === "text") {
      prev.value += node.value;
      return;
    }
    block.nodes.push(node);
    node.parent = block;
    node.prev = prev;
    prev = node;
    return node;
  };
  push({ type: "bos" });
  while (index < length) {
    block = stack[stack.length - 1];
    value = advance();
    if (value === CHAR_ZERO_WIDTH_NOBREAK_SPACE || value === CHAR_NO_BREAK_SPACE) {
      continue;
    }
    if (value === CHAR_BACKSLASH) {
      push({ type: "text", value: (options.keepEscaping ? value : "") + advance() });
      continue;
    }
    if (value === CHAR_RIGHT_SQUARE_BRACKET$1) {
      push({ type: "text", value: "\\" + value });
      continue;
    }
    if (value === CHAR_LEFT_SQUARE_BRACKET$1) {
      brackets++;
      let next;
      while (index < length && (next = advance())) {
        value += next;
        if (next === CHAR_LEFT_SQUARE_BRACKET$1) {
          brackets++;
          continue;
        }
        if (next === CHAR_BACKSLASH) {
          value += advance();
          continue;
        }
        if (next === CHAR_RIGHT_SQUARE_BRACKET$1) {
          brackets--;
          if (brackets === 0) {
            break;
          }
        }
      }
      push({ type: "text", value });
      continue;
    }
    if (value === CHAR_LEFT_PARENTHESES$1) {
      block = push({ type: "paren", nodes: [] });
      stack.push(block);
      push({ type: "text", value });
      continue;
    }
    if (value === CHAR_RIGHT_PARENTHESES$1) {
      if (block.type !== "paren") {
        push({ type: "text", value });
        continue;
      }
      block = stack.pop();
      push({ type: "text", value });
      block = stack[stack.length - 1];
      continue;
    }
    if (value === CHAR_DOUBLE_QUOTE || value === CHAR_SINGLE_QUOTE || value === CHAR_BACKTICK) {
      let open = value;
      let next;
      if (options.keepQuotes !== true) {
        value = "";
      }
      while (index < length && (next = advance())) {
        if (next === CHAR_BACKSLASH) {
          value += next + advance();
          continue;
        }
        if (next === open) {
          if (options.keepQuotes === true)
            value += next;
          break;
        }
        value += next;
      }
      push({ type: "text", value });
      continue;
    }
    if (value === CHAR_LEFT_CURLY_BRACE$1) {
      depth2++;
      let dollar = prev.value && prev.value.slice(-1) === "$" || block.dollar === true;
      let brace = {
        type: "brace",
        open: true,
        close: false,
        dollar,
        depth: depth2,
        commas: 0,
        ranges: 0,
        nodes: []
      };
      block = push(brace);
      stack.push(block);
      push({ type: "open", value });
      continue;
    }
    if (value === CHAR_RIGHT_CURLY_BRACE$1) {
      if (block.type !== "brace") {
        push({ type: "text", value });
        continue;
      }
      let type = "close";
      block = stack.pop();
      block.close = true;
      push({ type, value });
      depth2--;
      block = stack[stack.length - 1];
      continue;
    }
    if (value === CHAR_COMMA$1 && depth2 > 0) {
      if (block.ranges > 0) {
        block.ranges = 0;
        let open = block.nodes.shift();
        block.nodes = [open, { type: "text", value: stringify$1(block) }];
      }
      push({ type: "comma", value });
      block.commas++;
      continue;
    }
    if (value === CHAR_DOT$1 && depth2 > 0 && block.commas === 0) {
      let siblings = block.nodes;
      if (depth2 === 0 || siblings.length === 0) {
        push({ type: "text", value });
        continue;
      }
      if (prev.type === "dot") {
        block.range = [];
        prev.value += value;
        prev.type = "range";
        if (block.nodes.length !== 3 && block.nodes.length !== 5) {
          block.invalid = true;
          block.ranges = 0;
          prev.type = "text";
          continue;
        }
        block.ranges++;
        block.args = [];
        continue;
      }
      if (prev.type === "range") {
        siblings.pop();
        let before = siblings[siblings.length - 1];
        before.value += prev.value + value;
        prev = before;
        block.ranges--;
        continue;
      }
      push({ type: "dot", value });
      continue;
    }
    push({ type: "text", value });
  }
  do {
    block = stack.pop();
    if (block.type !== "root") {
      block.nodes.forEach((node) => {
        if (!node.nodes) {
          if (node.type === "open")
            node.isOpen = true;
          if (node.type === "close")
            node.isClose = true;
          if (!node.nodes)
            node.type = "text";
          node.invalid = true;
        }
      });
      let parent = stack[stack.length - 1];
      let index2 = parent.nodes.indexOf(block);
      parent.nodes.splice(index2, 1, ...block.nodes);
    }
  } while (stack.length > 0);
  push({ type: "eos" });
  return ast;
};
var parse_1$1 = parse$4;
const stringify = stringify$4;
const compile = compile_1;
const expand = expand_1;
const parse$3 = parse_1$1;
const braces$1 = (input, options = {}) => {
  let output = [];
  if (Array.isArray(input)) {
    for (let pattern of input) {
      let result = braces$1.create(pattern, options);
      if (Array.isArray(result)) {
        output.push(...result);
      } else {
        output.push(result);
      }
    }
  } else {
    output = [].concat(braces$1.create(input, options));
  }
  if (options && options.expand === true && options.nodupes === true) {
    output = [...new Set(output)];
  }
  return output;
};
braces$1.parse = (input, options = {}) => parse$3(input, options);
braces$1.stringify = (input, options = {}) => {
  if (typeof input === "string") {
    return stringify(braces$1.parse(input, options), options);
  }
  return stringify(input, options);
};
braces$1.compile = (input, options = {}) => {
  if (typeof input === "string") {
    input = braces$1.parse(input, options);
  }
  return compile(input, options);
};
braces$1.expand = (input, options = {}) => {
  if (typeof input === "string") {
    input = braces$1.parse(input, options);
  }
  let result = expand(input, options);
  if (options.noempty === true) {
    result = result.filter(Boolean);
  }
  if (options.nodupes === true) {
    result = [...new Set(result)];
  }
  return result;
};
braces$1.create = (input, options = {}) => {
  if (input === "" || input.length < 3) {
    return [input];
  }
  return options.expand !== true ? braces$1.compile(input, options) : braces$1.expand(input, options);
};
var braces_1 = braces$1;
var utils$4 = {};
const path$1 = require$$0__default$1["default"];
const WIN_SLASH = "\\\\/";
const WIN_NO_SLASH = `[^${WIN_SLASH}]`;
const DOT_LITERAL = "\\.";
const PLUS_LITERAL = "\\+";
const QMARK_LITERAL = "\\?";
const SLASH_LITERAL = "\\/";
const ONE_CHAR = "(?=.)";
const QMARK = "[^/]";
const END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
const START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
const DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
const NO_DOT = `(?!${DOT_LITERAL})`;
const NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
const NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
const NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
const QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
const STAR = `${QMARK}*?`;
const POSIX_CHARS = {
  DOT_LITERAL,
  PLUS_LITERAL,
  QMARK_LITERAL,
  SLASH_LITERAL,
  ONE_CHAR,
  QMARK,
  END_ANCHOR,
  DOTS_SLASH,
  NO_DOT,
  NO_DOTS,
  NO_DOT_SLASH,
  NO_DOTS_SLASH,
  QMARK_NO_DOT,
  STAR,
  START_ANCHOR
};
const WINDOWS_CHARS = __spreadProps(__spreadValues({}, POSIX_CHARS), {
  SLASH_LITERAL: `[${WIN_SLASH}]`,
  QMARK: WIN_NO_SLASH,
  STAR: `${WIN_NO_SLASH}*?`,
  DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
  NO_DOT: `(?!${DOT_LITERAL})`,
  NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
  NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
  NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
  QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
  START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
  END_ANCHOR: `(?:[${WIN_SLASH}]|$)`
});
const POSIX_REGEX_SOURCE$1 = {
  alnum: "a-zA-Z0-9",
  alpha: "a-zA-Z",
  ascii: "\\x00-\\x7F",
  blank: " \\t",
  cntrl: "\\x00-\\x1F\\x7F",
  digit: "0-9",
  graph: "\\x21-\\x7E",
  lower: "a-z",
  print: "\\x20-\\x7E ",
  punct: "\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~",
  space: " \\t\\r\\n\\v\\f",
  upper: "A-Z",
  word: "A-Za-z0-9_",
  xdigit: "A-Fa-f0-9"
};
var constants$2 = {
  MAX_LENGTH: 1024 * 64,
  POSIX_REGEX_SOURCE: POSIX_REGEX_SOURCE$1,
  REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
  REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
  REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
  REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
  REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
  REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
  REPLACEMENTS: {
    "***": "*",
    "**/**": "**",
    "**/**/**": "**"
  },
  CHAR_0: 48,
  CHAR_9: 57,
  CHAR_UPPERCASE_A: 65,
  CHAR_LOWERCASE_A: 97,
  CHAR_UPPERCASE_Z: 90,
  CHAR_LOWERCASE_Z: 122,
  CHAR_LEFT_PARENTHESES: 40,
  CHAR_RIGHT_PARENTHESES: 41,
  CHAR_ASTERISK: 42,
  CHAR_AMPERSAND: 38,
  CHAR_AT: 64,
  CHAR_BACKWARD_SLASH: 92,
  CHAR_CARRIAGE_RETURN: 13,
  CHAR_CIRCUMFLEX_ACCENT: 94,
  CHAR_COLON: 58,
  CHAR_COMMA: 44,
  CHAR_DOT: 46,
  CHAR_DOUBLE_QUOTE: 34,
  CHAR_EQUAL: 61,
  CHAR_EXCLAMATION_MARK: 33,
  CHAR_FORM_FEED: 12,
  CHAR_FORWARD_SLASH: 47,
  CHAR_GRAVE_ACCENT: 96,
  CHAR_HASH: 35,
  CHAR_HYPHEN_MINUS: 45,
  CHAR_LEFT_ANGLE_BRACKET: 60,
  CHAR_LEFT_CURLY_BRACE: 123,
  CHAR_LEFT_SQUARE_BRACKET: 91,
  CHAR_LINE_FEED: 10,
  CHAR_NO_BREAK_SPACE: 160,
  CHAR_PERCENT: 37,
  CHAR_PLUS: 43,
  CHAR_QUESTION_MARK: 63,
  CHAR_RIGHT_ANGLE_BRACKET: 62,
  CHAR_RIGHT_CURLY_BRACE: 125,
  CHAR_RIGHT_SQUARE_BRACKET: 93,
  CHAR_SEMICOLON: 59,
  CHAR_SINGLE_QUOTE: 39,
  CHAR_SPACE: 32,
  CHAR_TAB: 9,
  CHAR_UNDERSCORE: 95,
  CHAR_VERTICAL_LINE: 124,
  CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,
  SEP: path$1.sep,
  extglobChars(chars2) {
    return {
      "!": { type: "negate", open: "(?:(?!(?:", close: `))${chars2.STAR})` },
      "?": { type: "qmark", open: "(?:", close: ")?" },
      "+": { type: "plus", open: "(?:", close: ")+" },
      "*": { type: "star", open: "(?:", close: ")*" },
      "@": { type: "at", open: "(?:", close: ")" }
    };
  },
  globChars(win32) {
    return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
  }
};
(function(exports) {
  const path2 = require$$0__default$1["default"];
  const win32 = process.platform === "win32";
  const {
    REGEX_BACKSLASH,
    REGEX_REMOVE_BACKSLASH,
    REGEX_SPECIAL_CHARS,
    REGEX_SPECIAL_CHARS_GLOBAL
  } = constants$2;
  exports.isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
  exports.hasRegexChars = (str) => REGEX_SPECIAL_CHARS.test(str);
  exports.isRegexChar = (str) => str.length === 1 && exports.hasRegexChars(str);
  exports.escapeRegex = (str) => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, "\\$1");
  exports.toPosixSlashes = (str) => str.replace(REGEX_BACKSLASH, "/");
  exports.removeBackslashes = (str) => {
    return str.replace(REGEX_REMOVE_BACKSLASH, (match2) => {
      return match2 === "\\" ? "" : match2;
    });
  };
  exports.supportsLookbehinds = () => {
    const segs = process.version.slice(1).split(".").map(Number);
    if (segs.length === 3 && segs[0] >= 9 || segs[0] === 8 && segs[1] >= 10) {
      return true;
    }
    return false;
  };
  exports.isWindows = (options) => {
    if (options && typeof options.windows === "boolean") {
      return options.windows;
    }
    return win32 === true || path2.sep === "\\";
  };
  exports.escapeLast = (input, char, lastIdx) => {
    const idx = input.lastIndexOf(char, lastIdx);
    if (idx === -1)
      return input;
    if (input[idx - 1] === "\\")
      return exports.escapeLast(input, char, idx - 1);
    return `${input.slice(0, idx)}\\${input.slice(idx)}`;
  };
  exports.removePrefix = (input, state = {}) => {
    let output = input;
    if (output.startsWith("./")) {
      output = output.slice(2);
      state.prefix = "./";
    }
    return output;
  };
  exports.wrapOutput = (input, state = {}, options = {}) => {
    const prepend = options.contains ? "" : "^";
    const append2 = options.contains ? "" : "$";
    let output = `${prepend}(?:${input})${append2}`;
    if (state.negated === true) {
      output = `(?:^(?!${output}).*$)`;
    }
    return output;
  };
})(utils$4);
const utils$3 = utils$4;
const {
  CHAR_ASTERISK,
  CHAR_AT,
  CHAR_BACKWARD_SLASH,
  CHAR_COMMA,
  CHAR_DOT,
  CHAR_EXCLAMATION_MARK,
  CHAR_FORWARD_SLASH,
  CHAR_LEFT_CURLY_BRACE,
  CHAR_LEFT_PARENTHESES,
  CHAR_LEFT_SQUARE_BRACKET,
  CHAR_PLUS,
  CHAR_QUESTION_MARK,
  CHAR_RIGHT_CURLY_BRACE,
  CHAR_RIGHT_PARENTHESES,
  CHAR_RIGHT_SQUARE_BRACKET
} = constants$2;
const isPathSeparator = (code) => {
  return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
};
const depth = (token) => {
  if (token.isPrefix !== true) {
    token.depth = token.isGlobstar ? Infinity : 1;
  }
};
const scan$1 = (input, options) => {
  const opts = options || {};
  const length = input.length - 1;
  const scanToEnd = opts.parts === true || opts.scanToEnd === true;
  const slashes = [];
  const tokens = [];
  const parts = [];
  let str = input;
  let index = -1;
  let start = 0;
  let lastIndex = 0;
  let isBrace = false;
  let isBracket = false;
  let isGlob3 = false;
  let isExtglob3 = false;
  let isGlobstar = false;
  let braceEscaped = false;
  let backslashes = false;
  let negated = false;
  let negatedExtglob = false;
  let finished = false;
  let braces2 = 0;
  let prev;
  let code;
  let token = { value: "", depth: 0, isGlob: false };
  const eos = () => index >= length;
  const peek = () => str.charCodeAt(index + 1);
  const advance = () => {
    prev = code;
    return str.charCodeAt(++index);
  };
  while (index < length) {
    code = advance();
    let next;
    if (code === CHAR_BACKWARD_SLASH) {
      backslashes = token.backslashes = true;
      code = advance();
      if (code === CHAR_LEFT_CURLY_BRACE) {
        braceEscaped = true;
      }
      continue;
    }
    if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
      braces2++;
      while (eos() !== true && (code = advance())) {
        if (code === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          advance();
          continue;
        }
        if (code === CHAR_LEFT_CURLY_BRACE) {
          braces2++;
          continue;
        }
        if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
          isBrace = token.isBrace = true;
          isGlob3 = token.isGlob = true;
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (braceEscaped !== true && code === CHAR_COMMA) {
          isBrace = token.isBrace = true;
          isGlob3 = token.isGlob = true;
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_RIGHT_CURLY_BRACE) {
          braces2--;
          if (braces2 === 0) {
            braceEscaped = false;
            isBrace = token.isBrace = true;
            finished = true;
            break;
          }
        }
      }
      if (scanToEnd === true) {
        continue;
      }
      break;
    }
    if (code === CHAR_FORWARD_SLASH) {
      slashes.push(index);
      tokens.push(token);
      token = { value: "", depth: 0, isGlob: false };
      if (finished === true)
        continue;
      if (prev === CHAR_DOT && index === start + 1) {
        start += 2;
        continue;
      }
      lastIndex = index + 1;
      continue;
    }
    if (opts.noext !== true) {
      const isExtglobChar = code === CHAR_PLUS || code === CHAR_AT || code === CHAR_ASTERISK || code === CHAR_QUESTION_MARK || code === CHAR_EXCLAMATION_MARK;
      if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
        isGlob3 = token.isGlob = true;
        isExtglob3 = token.isExtglob = true;
        finished = true;
        if (code === CHAR_EXCLAMATION_MARK && index === start) {
          negatedExtglob = true;
        }
        if (scanToEnd === true) {
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              code = advance();
              continue;
            }
            if (code === CHAR_RIGHT_PARENTHESES) {
              isGlob3 = token.isGlob = true;
              finished = true;
              break;
            }
          }
          continue;
        }
        break;
      }
    }
    if (code === CHAR_ASTERISK) {
      if (prev === CHAR_ASTERISK)
        isGlobstar = token.isGlobstar = true;
      isGlob3 = token.isGlob = true;
      finished = true;
      if (scanToEnd === true) {
        continue;
      }
      break;
    }
    if (code === CHAR_QUESTION_MARK) {
      isGlob3 = token.isGlob = true;
      finished = true;
      if (scanToEnd === true) {
        continue;
      }
      break;
    }
    if (code === CHAR_LEFT_SQUARE_BRACKET) {
      while (eos() !== true && (next = advance())) {
        if (next === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          advance();
          continue;
        }
        if (next === CHAR_RIGHT_SQUARE_BRACKET) {
          isBracket = token.isBracket = true;
          isGlob3 = token.isGlob = true;
          finished = true;
          break;
        }
      }
      if (scanToEnd === true) {
        continue;
      }
      break;
    }
    if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
      negated = token.negated = true;
      start++;
      continue;
    }
    if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
      isGlob3 = token.isGlob = true;
      if (scanToEnd === true) {
        while (eos() !== true && (code = advance())) {
          if (code === CHAR_LEFT_PARENTHESES) {
            backslashes = token.backslashes = true;
            code = advance();
            continue;
          }
          if (code === CHAR_RIGHT_PARENTHESES) {
            finished = true;
            break;
          }
        }
        continue;
      }
      break;
    }
    if (isGlob3 === true) {
      finished = true;
      if (scanToEnd === true) {
        continue;
      }
      break;
    }
  }
  if (opts.noext === true) {
    isExtglob3 = false;
    isGlob3 = false;
  }
  let base = str;
  let prefix = "";
  let glob = "";
  if (start > 0) {
    prefix = str.slice(0, start);
    str = str.slice(start);
    lastIndex -= start;
  }
  if (base && isGlob3 === true && lastIndex > 0) {
    base = str.slice(0, lastIndex);
    glob = str.slice(lastIndex);
  } else if (isGlob3 === true) {
    base = "";
    glob = str;
  } else {
    base = str;
  }
  if (base && base !== "" && base !== "/" && base !== str) {
    if (isPathSeparator(base.charCodeAt(base.length - 1))) {
      base = base.slice(0, -1);
    }
  }
  if (opts.unescape === true) {
    if (glob)
      glob = utils$3.removeBackslashes(glob);
    if (base && backslashes === true) {
      base = utils$3.removeBackslashes(base);
    }
  }
  const state = {
    prefix,
    input,
    start,
    base,
    glob,
    isBrace,
    isBracket,
    isGlob: isGlob3,
    isExtglob: isExtglob3,
    isGlobstar,
    negated,
    negatedExtglob
  };
  if (opts.tokens === true) {
    state.maxDepth = 0;
    if (!isPathSeparator(code)) {
      tokens.push(token);
    }
    state.tokens = tokens;
  }
  if (opts.parts === true || opts.tokens === true) {
    let prevIndex;
    for (let idx = 0; idx < slashes.length; idx++) {
      const n = prevIndex ? prevIndex + 1 : start;
      const i = slashes[idx];
      const value = input.slice(n, i);
      if (opts.tokens) {
        if (idx === 0 && start !== 0) {
          tokens[idx].isPrefix = true;
          tokens[idx].value = prefix;
        } else {
          tokens[idx].value = value;
        }
        depth(tokens[idx]);
        state.maxDepth += tokens[idx].depth;
      }
      if (idx !== 0 || value !== "") {
        parts.push(value);
      }
      prevIndex = i;
    }
    if (prevIndex && prevIndex + 1 < input.length) {
      const value = input.slice(prevIndex + 1);
      parts.push(value);
      if (opts.tokens) {
        tokens[tokens.length - 1].value = value;
        depth(tokens[tokens.length - 1]);
        state.maxDepth += tokens[tokens.length - 1].depth;
      }
    }
    state.slashes = slashes;
    state.parts = parts;
  }
  return state;
};
var scan_1 = scan$1;
const constants$1 = constants$2;
const utils$2 = utils$4;
const {
  MAX_LENGTH,
  POSIX_REGEX_SOURCE,
  REGEX_NON_SPECIAL_CHARS,
  REGEX_SPECIAL_CHARS_BACKREF,
  REPLACEMENTS
} = constants$1;
const expandRange = (args, options) => {
  if (typeof options.expandRange === "function") {
    return options.expandRange(...args, options);
  }
  args.sort();
  const value = `[${args.join("-")}]`;
  try {
    new RegExp(value);
  } catch (ex) {
    return args.map((v) => utils$2.escapeRegex(v)).join("..");
  }
  return value;
};
const syntaxError = (type, char) => {
  return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
};
const parse$2 = (input, options) => {
  if (typeof input !== "string") {
    throw new TypeError("Expected a string");
  }
  input = REPLACEMENTS[input] || input;
  const opts = __spreadValues({}, options);
  const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
  let len = input.length;
  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }
  const bos = { type: "bos", value: "", output: opts.prepend || "" };
  const tokens = [bos];
  const capture = opts.capture ? "" : "?:";
  const win32 = utils$2.isWindows(options);
  const PLATFORM_CHARS = constants$1.globChars(win32);
  const EXTGLOB_CHARS = constants$1.extglobChars(PLATFORM_CHARS);
  const {
    DOT_LITERAL: DOT_LITERAL2,
    PLUS_LITERAL: PLUS_LITERAL2,
    SLASH_LITERAL: SLASH_LITERAL2,
    ONE_CHAR: ONE_CHAR2,
    DOTS_SLASH: DOTS_SLASH2,
    NO_DOT: NO_DOT2,
    NO_DOT_SLASH: NO_DOT_SLASH2,
    NO_DOTS_SLASH: NO_DOTS_SLASH2,
    QMARK: QMARK2,
    QMARK_NO_DOT: QMARK_NO_DOT2,
    STAR: STAR2,
    START_ANCHOR: START_ANCHOR2
  } = PLATFORM_CHARS;
  const globstar = (opts2) => {
    return `(${capture}(?:(?!${START_ANCHOR2}${opts2.dot ? DOTS_SLASH2 : DOT_LITERAL2}).)*?)`;
  };
  const nodot = opts.dot ? "" : NO_DOT2;
  const qmarkNoDot = opts.dot ? QMARK2 : QMARK_NO_DOT2;
  let star = opts.bash === true ? globstar(opts) : STAR2;
  if (opts.capture) {
    star = `(${star})`;
  }
  if (typeof opts.noext === "boolean") {
    opts.noextglob = opts.noext;
  }
  const state = {
    input,
    index: -1,
    start: 0,
    dot: opts.dot === true,
    consumed: "",
    output: "",
    prefix: "",
    backtrack: false,
    negated: false,
    brackets: 0,
    braces: 0,
    parens: 0,
    quotes: 0,
    globstar: false,
    tokens
  };
  input = utils$2.removePrefix(input, state);
  len = input.length;
  const extglobs = [];
  const braces2 = [];
  const stack = [];
  let prev = bos;
  let value;
  const eos = () => state.index === len - 1;
  const peek = state.peek = (n = 1) => input[state.index + n];
  const advance = state.advance = () => input[++state.index] || "";
  const remaining = () => input.slice(state.index + 1);
  const consume = (value2 = "", num = 0) => {
    state.consumed += value2;
    state.index += num;
  };
  const append2 = (token) => {
    state.output += token.output != null ? token.output : token.value;
    consume(token.value);
  };
  const negate = () => {
    let count = 1;
    while (peek() === "!" && (peek(2) !== "(" || peek(3) === "?")) {
      advance();
      state.start++;
      count++;
    }
    if (count % 2 === 0) {
      return false;
    }
    state.negated = true;
    state.start++;
    return true;
  };
  const increment = (type) => {
    state[type]++;
    stack.push(type);
  };
  const decrement = (type) => {
    state[type]--;
    stack.pop();
  };
  const push = (tok) => {
    if (prev.type === "globstar") {
      const isBrace = state.braces > 0 && (tok.type === "comma" || tok.type === "brace");
      const isExtglob3 = tok.extglob === true || extglobs.length && (tok.type === "pipe" || tok.type === "paren");
      if (tok.type !== "slash" && tok.type !== "paren" && !isBrace && !isExtglob3) {
        state.output = state.output.slice(0, -prev.output.length);
        prev.type = "star";
        prev.value = "*";
        prev.output = star;
        state.output += prev.output;
      }
    }
    if (extglobs.length && tok.type !== "paren") {
      extglobs[extglobs.length - 1].inner += tok.value;
    }
    if (tok.value || tok.output)
      append2(tok);
    if (prev && prev.type === "text" && tok.type === "text") {
      prev.value += tok.value;
      prev.output = (prev.output || "") + tok.value;
      return;
    }
    tok.prev = prev;
    tokens.push(tok);
    prev = tok;
  };
  const extglobOpen = (type, value2) => {
    const token = __spreadProps(__spreadValues({}, EXTGLOB_CHARS[value2]), { conditions: 1, inner: "" });
    token.prev = prev;
    token.parens = state.parens;
    token.output = state.output;
    const output = (opts.capture ? "(" : "") + token.open;
    increment("parens");
    push({ type, value: value2, output: state.output ? "" : ONE_CHAR2 });
    push({ type: "paren", extglob: true, value: advance(), output });
    extglobs.push(token);
  };
  const extglobClose = (token) => {
    let output = token.close + (opts.capture ? ")" : "");
    let rest;
    if (token.type === "negate") {
      let extglobStar = star;
      if (token.inner && token.inner.length > 1 && token.inner.includes("/")) {
        extglobStar = globstar(opts);
      }
      if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
        output = token.close = `)$))${extglobStar}`;
      }
      if (token.inner.includes("*") && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
        const expression = parse$2(rest, __spreadProps(__spreadValues({}, options), { fastpaths: false })).output;
        output = token.close = `)${expression})${extglobStar})`;
      }
      if (token.prev.type === "bos") {
        state.negatedExtglob = true;
      }
    }
    push({ type: "paren", extglob: true, value, output });
    decrement("parens");
  };
  if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
    let backslashes = false;
    let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars2, first, rest, index) => {
      if (first === "\\") {
        backslashes = true;
        return m;
      }
      if (first === "?") {
        if (esc) {
          return esc + first + (rest ? QMARK2.repeat(rest.length) : "");
        }
        if (index === 0) {
          return qmarkNoDot + (rest ? QMARK2.repeat(rest.length) : "");
        }
        return QMARK2.repeat(chars2.length);
      }
      if (first === ".") {
        return DOT_LITERAL2.repeat(chars2.length);
      }
      if (first === "*") {
        if (esc) {
          return esc + first + (rest ? star : "");
        }
        return star;
      }
      return esc ? m : `\\${m}`;
    });
    if (backslashes === true) {
      if (opts.unescape === true) {
        output = output.replace(/\\/g, "");
      } else {
        output = output.replace(/\\+/g, (m) => {
          return m.length % 2 === 0 ? "\\\\" : m ? "\\" : "";
        });
      }
    }
    if (output === input && opts.contains === true) {
      state.output = input;
      return state;
    }
    state.output = utils$2.wrapOutput(output, state, options);
    return state;
  }
  while (!eos()) {
    value = advance();
    if (value === "\0") {
      continue;
    }
    if (value === "\\") {
      const next = peek();
      if (next === "/" && opts.bash !== true) {
        continue;
      }
      if (next === "." || next === ";") {
        continue;
      }
      if (!next) {
        value += "\\";
        push({ type: "text", value });
        continue;
      }
      const match2 = /^\\+/.exec(remaining());
      let slashes = 0;
      if (match2 && match2[0].length > 2) {
        slashes = match2[0].length;
        state.index += slashes;
        if (slashes % 2 !== 0) {
          value += "\\";
        }
      }
      if (opts.unescape === true) {
        value = advance();
      } else {
        value += advance();
      }
      if (state.brackets === 0) {
        push({ type: "text", value });
        continue;
      }
    }
    if (state.brackets > 0 && (value !== "]" || prev.value === "[" || prev.value === "[^")) {
      if (opts.posix !== false && value === ":") {
        const inner = prev.value.slice(1);
        if (inner.includes("[")) {
          prev.posix = true;
          if (inner.includes(":")) {
            const idx = prev.value.lastIndexOf("[");
            const pre = prev.value.slice(0, idx);
            const rest2 = prev.value.slice(idx + 2);
            const posix = POSIX_REGEX_SOURCE[rest2];
            if (posix) {
              prev.value = pre + posix;
              state.backtrack = true;
              advance();
              if (!bos.output && tokens.indexOf(prev) === 1) {
                bos.output = ONE_CHAR2;
              }
              continue;
            }
          }
        }
      }
      if (value === "[" && peek() !== ":" || value === "-" && peek() === "]") {
        value = `\\${value}`;
      }
      if (value === "]" && (prev.value === "[" || prev.value === "[^")) {
        value = `\\${value}`;
      }
      if (opts.posix === true && value === "!" && prev.value === "[") {
        value = "^";
      }
      prev.value += value;
      append2({ value });
      continue;
    }
    if (state.quotes === 1 && value !== '"') {
      value = utils$2.escapeRegex(value);
      prev.value += value;
      append2({ value });
      continue;
    }
    if (value === '"') {
      state.quotes = state.quotes === 1 ? 0 : 1;
      if (opts.keepQuotes === true) {
        push({ type: "text", value });
      }
      continue;
    }
    if (value === "(") {
      increment("parens");
      push({ type: "paren", value });
      continue;
    }
    if (value === ")") {
      if (state.parens === 0 && opts.strictBrackets === true) {
        throw new SyntaxError(syntaxError("opening", "("));
      }
      const extglob = extglobs[extglobs.length - 1];
      if (extglob && state.parens === extglob.parens + 1) {
        extglobClose(extglobs.pop());
        continue;
      }
      push({ type: "paren", value, output: state.parens ? ")" : "\\)" });
      decrement("parens");
      continue;
    }
    if (value === "[") {
      if (opts.nobracket === true || !remaining().includes("]")) {
        if (opts.nobracket !== true && opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError("closing", "]"));
        }
        value = `\\${value}`;
      } else {
        increment("brackets");
      }
      push({ type: "bracket", value });
      continue;
    }
    if (value === "]") {
      if (opts.nobracket === true || prev && prev.type === "bracket" && prev.value.length === 1) {
        push({ type: "text", value, output: `\\${value}` });
        continue;
      }
      if (state.brackets === 0) {
        if (opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError("opening", "["));
        }
        push({ type: "text", value, output: `\\${value}` });
        continue;
      }
      decrement("brackets");
      const prevValue = prev.value.slice(1);
      if (prev.posix !== true && prevValue[0] === "^" && !prevValue.includes("/")) {
        value = `/${value}`;
      }
      prev.value += value;
      append2({ value });
      if (opts.literalBrackets === false || utils$2.hasRegexChars(prevValue)) {
        continue;
      }
      const escaped = utils$2.escapeRegex(prev.value);
      state.output = state.output.slice(0, -prev.value.length);
      if (opts.literalBrackets === true) {
        state.output += escaped;
        prev.value = escaped;
        continue;
      }
      prev.value = `(${capture}${escaped}|${prev.value})`;
      state.output += prev.value;
      continue;
    }
    if (value === "{" && opts.nobrace !== true) {
      increment("braces");
      const open = {
        type: "brace",
        value,
        output: "(",
        outputIndex: state.output.length,
        tokensIndex: state.tokens.length
      };
      braces2.push(open);
      push(open);
      continue;
    }
    if (value === "}") {
      const brace = braces2[braces2.length - 1];
      if (opts.nobrace === true || !brace) {
        push({ type: "text", value, output: value });
        continue;
      }
      let output = ")";
      if (brace.dots === true) {
        const arr = tokens.slice();
        const range = [];
        for (let i = arr.length - 1; i >= 0; i--) {
          tokens.pop();
          if (arr[i].type === "brace") {
            break;
          }
          if (arr[i].type !== "dots") {
            range.unshift(arr[i].value);
          }
        }
        output = expandRange(range, opts);
        state.backtrack = true;
      }
      if (brace.comma !== true && brace.dots !== true) {
        const out = state.output.slice(0, brace.outputIndex);
        const toks = state.tokens.slice(brace.tokensIndex);
        brace.value = brace.output = "\\{";
        value = output = "\\}";
        state.output = out;
        for (const t of toks) {
          state.output += t.output || t.value;
        }
      }
      push({ type: "brace", value, output });
      decrement("braces");
      braces2.pop();
      continue;
    }
    if (value === "|") {
      if (extglobs.length > 0) {
        extglobs[extglobs.length - 1].conditions++;
      }
      push({ type: "text", value });
      continue;
    }
    if (value === ",") {
      let output = value;
      const brace = braces2[braces2.length - 1];
      if (brace && stack[stack.length - 1] === "braces") {
        brace.comma = true;
        output = "|";
      }
      push({ type: "comma", value, output });
      continue;
    }
    if (value === "/") {
      if (prev.type === "dot" && state.index === state.start + 1) {
        state.start = state.index + 1;
        state.consumed = "";
        state.output = "";
        tokens.pop();
        prev = bos;
        continue;
      }
      push({ type: "slash", value, output: SLASH_LITERAL2 });
      continue;
    }
    if (value === ".") {
      if (state.braces > 0 && prev.type === "dot") {
        if (prev.value === ".")
          prev.output = DOT_LITERAL2;
        const brace = braces2[braces2.length - 1];
        prev.type = "dots";
        prev.output += value;
        prev.value += value;
        brace.dots = true;
        continue;
      }
      if (state.braces + state.parens === 0 && prev.type !== "bos" && prev.type !== "slash") {
        push({ type: "text", value, output: DOT_LITERAL2 });
        continue;
      }
      push({ type: "dot", value, output: DOT_LITERAL2 });
      continue;
    }
    if (value === "?") {
      const isGroup = prev && prev.value === "(";
      if (!isGroup && opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
        extglobOpen("qmark", value);
        continue;
      }
      if (prev && prev.type === "paren") {
        const next = peek();
        let output = value;
        if (next === "<" && !utils$2.supportsLookbehinds()) {
          throw new Error("Node.js v10 or higher is required for regex lookbehinds");
        }
        if (prev.value === "(" && !/[!=<:]/.test(next) || next === "<" && !/<([!=]|\w+>)/.test(remaining())) {
          output = `\\${value}`;
        }
        push({ type: "text", value, output });
        continue;
      }
      if (opts.dot !== true && (prev.type === "slash" || prev.type === "bos")) {
        push({ type: "qmark", value, output: QMARK_NO_DOT2 });
        continue;
      }
      push({ type: "qmark", value, output: QMARK2 });
      continue;
    }
    if (value === "!") {
      if (opts.noextglob !== true && peek() === "(") {
        if (peek(2) !== "?" || !/[!=<:]/.test(peek(3))) {
          extglobOpen("negate", value);
          continue;
        }
      }
      if (opts.nonegate !== true && state.index === 0) {
        negate();
        continue;
      }
    }
    if (value === "+") {
      if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
        extglobOpen("plus", value);
        continue;
      }
      if (prev && prev.value === "(" || opts.regex === false) {
        push({ type: "plus", value, output: PLUS_LITERAL2 });
        continue;
      }
      if (prev && (prev.type === "bracket" || prev.type === "paren" || prev.type === "brace") || state.parens > 0) {
        push({ type: "plus", value });
        continue;
      }
      push({ type: "plus", value: PLUS_LITERAL2 });
      continue;
    }
    if (value === "@") {
      if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
        push({ type: "at", extglob: true, value, output: "" });
        continue;
      }
      push({ type: "text", value });
      continue;
    }
    if (value !== "*") {
      if (value === "$" || value === "^") {
        value = `\\${value}`;
      }
      const match2 = REGEX_NON_SPECIAL_CHARS.exec(remaining());
      if (match2) {
        value += match2[0];
        state.index += match2[0].length;
      }
      push({ type: "text", value });
      continue;
    }
    if (prev && (prev.type === "globstar" || prev.star === true)) {
      prev.type = "star";
      prev.star = true;
      prev.value += value;
      prev.output = star;
      state.backtrack = true;
      state.globstar = true;
      consume(value);
      continue;
    }
    let rest = remaining();
    if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
      extglobOpen("star", value);
      continue;
    }
    if (prev.type === "star") {
      if (opts.noglobstar === true) {
        consume(value);
        continue;
      }
      const prior = prev.prev;
      const before = prior.prev;
      const isStart = prior.type === "slash" || prior.type === "bos";
      const afterStar = before && (before.type === "star" || before.type === "globstar");
      if (opts.bash === true && (!isStart || rest[0] && rest[0] !== "/")) {
        push({ type: "star", value, output: "" });
        continue;
      }
      const isBrace = state.braces > 0 && (prior.type === "comma" || prior.type === "brace");
      const isExtglob3 = extglobs.length && (prior.type === "pipe" || prior.type === "paren");
      if (!isStart && prior.type !== "paren" && !isBrace && !isExtglob3) {
        push({ type: "star", value, output: "" });
        continue;
      }
      while (rest.slice(0, 3) === "/**") {
        const after = input[state.index + 4];
        if (after && after !== "/") {
          break;
        }
        rest = rest.slice(3);
        consume("/**", 3);
      }
      if (prior.type === "bos" && eos()) {
        prev.type = "globstar";
        prev.value += value;
        prev.output = globstar(opts);
        state.output = prev.output;
        state.globstar = true;
        consume(value);
        continue;
      }
      if (prior.type === "slash" && prior.prev.type !== "bos" && !afterStar && eos()) {
        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = `(?:${prior.output}`;
        prev.type = "globstar";
        prev.output = globstar(opts) + (opts.strictSlashes ? ")" : "|$)");
        prev.value += value;
        state.globstar = true;
        state.output += prior.output + prev.output;
        consume(value);
        continue;
      }
      if (prior.type === "slash" && prior.prev.type !== "bos" && rest[0] === "/") {
        const end = rest[1] !== void 0 ? "|$" : "";
        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = `(?:${prior.output}`;
        prev.type = "globstar";
        prev.output = `${globstar(opts)}${SLASH_LITERAL2}|${SLASH_LITERAL2}${end})`;
        prev.value += value;
        state.output += prior.output + prev.output;
        state.globstar = true;
        consume(value + advance());
        push({ type: "slash", value: "/", output: "" });
        continue;
      }
      if (prior.type === "bos" && rest[0] === "/") {
        prev.type = "globstar";
        prev.value += value;
        prev.output = `(?:^|${SLASH_LITERAL2}|${globstar(opts)}${SLASH_LITERAL2})`;
        state.output = prev.output;
        state.globstar = true;
        consume(value + advance());
        push({ type: "slash", value: "/", output: "" });
        continue;
      }
      state.output = state.output.slice(0, -prev.output.length);
      prev.type = "globstar";
      prev.output = globstar(opts);
      prev.value += value;
      state.output += prev.output;
      state.globstar = true;
      consume(value);
      continue;
    }
    const token = { type: "star", value, output: star };
    if (opts.bash === true) {
      token.output = ".*?";
      if (prev.type === "bos" || prev.type === "slash") {
        token.output = nodot + token.output;
      }
      push(token);
      continue;
    }
    if (prev && (prev.type === "bracket" || prev.type === "paren") && opts.regex === true) {
      token.output = value;
      push(token);
      continue;
    }
    if (state.index === state.start || prev.type === "slash" || prev.type === "dot") {
      if (prev.type === "dot") {
        state.output += NO_DOT_SLASH2;
        prev.output += NO_DOT_SLASH2;
      } else if (opts.dot === true) {
        state.output += NO_DOTS_SLASH2;
        prev.output += NO_DOTS_SLASH2;
      } else {
        state.output += nodot;
        prev.output += nodot;
      }
      if (peek() !== "*") {
        state.output += ONE_CHAR2;
        prev.output += ONE_CHAR2;
      }
    }
    push(token);
  }
  while (state.brackets > 0) {
    if (opts.strictBrackets === true)
      throw new SyntaxError(syntaxError("closing", "]"));
    state.output = utils$2.escapeLast(state.output, "[");
    decrement("brackets");
  }
  while (state.parens > 0) {
    if (opts.strictBrackets === true)
      throw new SyntaxError(syntaxError("closing", ")"));
    state.output = utils$2.escapeLast(state.output, "(");
    decrement("parens");
  }
  while (state.braces > 0) {
    if (opts.strictBrackets === true)
      throw new SyntaxError(syntaxError("closing", "}"));
    state.output = utils$2.escapeLast(state.output, "{");
    decrement("braces");
  }
  if (opts.strictSlashes !== true && (prev.type === "star" || prev.type === "bracket")) {
    push({ type: "maybe_slash", value: "", output: `${SLASH_LITERAL2}?` });
  }
  if (state.backtrack === true) {
    state.output = "";
    for (const token of state.tokens) {
      state.output += token.output != null ? token.output : token.value;
      if (token.suffix) {
        state.output += token.suffix;
      }
    }
  }
  return state;
};
parse$2.fastpaths = (input, options) => {
  const opts = __spreadValues({}, options);
  const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
  const len = input.length;
  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }
  input = REPLACEMENTS[input] || input;
  const win32 = utils$2.isWindows(options);
  const {
    DOT_LITERAL: DOT_LITERAL2,
    SLASH_LITERAL: SLASH_LITERAL2,
    ONE_CHAR: ONE_CHAR2,
    DOTS_SLASH: DOTS_SLASH2,
    NO_DOT: NO_DOT2,
    NO_DOTS: NO_DOTS2,
    NO_DOTS_SLASH: NO_DOTS_SLASH2,
    STAR: STAR2,
    START_ANCHOR: START_ANCHOR2
  } = constants$1.globChars(win32);
  const nodot = opts.dot ? NO_DOTS2 : NO_DOT2;
  const slashDot = opts.dot ? NO_DOTS_SLASH2 : NO_DOT2;
  const capture = opts.capture ? "" : "?:";
  const state = { negated: false, prefix: "" };
  let star = opts.bash === true ? ".*?" : STAR2;
  if (opts.capture) {
    star = `(${star})`;
  }
  const globstar = (opts2) => {
    if (opts2.noglobstar === true)
      return star;
    return `(${capture}(?:(?!${START_ANCHOR2}${opts2.dot ? DOTS_SLASH2 : DOT_LITERAL2}).)*?)`;
  };
  const create = (str) => {
    switch (str) {
      case "*":
        return `${nodot}${ONE_CHAR2}${star}`;
      case ".*":
        return `${DOT_LITERAL2}${ONE_CHAR2}${star}`;
      case "*.*":
        return `${nodot}${star}${DOT_LITERAL2}${ONE_CHAR2}${star}`;
      case "*/*":
        return `${nodot}${star}${SLASH_LITERAL2}${ONE_CHAR2}${slashDot}${star}`;
      case "**":
        return nodot + globstar(opts);
      case "**/*":
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL2})?${slashDot}${ONE_CHAR2}${star}`;
      case "**/*.*":
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL2})?${slashDot}${star}${DOT_LITERAL2}${ONE_CHAR2}${star}`;
      case "**/.*":
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL2})?${DOT_LITERAL2}${ONE_CHAR2}${star}`;
      default: {
        const match2 = /^(.*?)\.(\w+)$/.exec(str);
        if (!match2)
          return;
        const source2 = create(match2[1]);
        if (!source2)
          return;
        return source2 + DOT_LITERAL2 + match2[2];
      }
    }
  };
  const output = utils$2.removePrefix(input, state);
  let source = create(output);
  if (source && opts.strictSlashes !== true) {
    source += `${SLASH_LITERAL2}?`;
  }
  return source;
};
var parse_1 = parse$2;
const path = require$$0__default$1["default"];
const scan = scan_1;
const parse$1 = parse_1;
const utils$1 = utils$4;
const constants = constants$2;
const isObject = (val) => val && typeof val === "object" && !Array.isArray(val);
const picomatch$2 = (glob, options, returnState = false) => {
  if (Array.isArray(glob)) {
    const fns = glob.map((input) => picomatch$2(input, options, returnState));
    const arrayMatcher = (str) => {
      for (const isMatch of fns) {
        const state2 = isMatch(str);
        if (state2)
          return state2;
      }
      return false;
    };
    return arrayMatcher;
  }
  const isState = isObject(glob) && glob.tokens && glob.input;
  if (glob === "" || typeof glob !== "string" && !isState) {
    throw new TypeError("Expected pattern to be a non-empty string");
  }
  const opts = options || {};
  const posix = utils$1.isWindows(options);
  const regex = isState ? picomatch$2.compileRe(glob, options) : picomatch$2.makeRe(glob, options, false, true);
  const state = regex.state;
  delete regex.state;
  let isIgnored = () => false;
  if (opts.ignore) {
    const ignoreOpts = __spreadProps(__spreadValues({}, options), { ignore: null, onMatch: null, onResult: null });
    isIgnored = picomatch$2(opts.ignore, ignoreOpts, returnState);
  }
  const matcher = (input, returnObject = false) => {
    const { isMatch, match: match2, output } = picomatch$2.test(input, regex, options, { glob, posix });
    const result = { glob, state, regex, posix, input, output, match: match2, isMatch };
    if (typeof opts.onResult === "function") {
      opts.onResult(result);
    }
    if (isMatch === false) {
      result.isMatch = false;
      return returnObject ? result : false;
    }
    if (isIgnored(input)) {
      if (typeof opts.onIgnore === "function") {
        opts.onIgnore(result);
      }
      result.isMatch = false;
      return returnObject ? result : false;
    }
    if (typeof opts.onMatch === "function") {
      opts.onMatch(result);
    }
    return returnObject ? result : true;
  };
  if (returnState) {
    matcher.state = state;
  }
  return matcher;
};
picomatch$2.test = (input, regex, options, { glob, posix } = {}) => {
  if (typeof input !== "string") {
    throw new TypeError("Expected input to be a string");
  }
  if (input === "") {
    return { isMatch: false, output: "" };
  }
  const opts = options || {};
  const format = opts.format || (posix ? utils$1.toPosixSlashes : null);
  let match2 = input === glob;
  let output = match2 && format ? format(input) : input;
  if (match2 === false) {
    output = format ? format(input) : input;
    match2 = output === glob;
  }
  if (match2 === false || opts.capture === true) {
    if (opts.matchBase === true || opts.basename === true) {
      match2 = picomatch$2.matchBase(input, regex, options, posix);
    } else {
      match2 = regex.exec(output);
    }
  }
  return { isMatch: Boolean(match2), match: match2, output };
};
picomatch$2.matchBase = (input, glob, options, posix = utils$1.isWindows(options)) => {
  const regex = glob instanceof RegExp ? glob : picomatch$2.makeRe(glob, options);
  return regex.test(path.basename(input));
};
picomatch$2.isMatch = (str, patterns, options) => picomatch$2(patterns, options)(str);
picomatch$2.parse = (pattern, options) => {
  if (Array.isArray(pattern))
    return pattern.map((p) => picomatch$2.parse(p, options));
  return parse$1(pattern, __spreadProps(__spreadValues({}, options), { fastpaths: false }));
};
picomatch$2.scan = (input, options) => scan(input, options);
picomatch$2.compileRe = (state, options, returnOutput = false, returnState = false) => {
  if (returnOutput === true) {
    return state.output;
  }
  const opts = options || {};
  const prepend = opts.contains ? "" : "^";
  const append2 = opts.contains ? "" : "$";
  let source = `${prepend}(?:${state.output})${append2}`;
  if (state && state.negated === true) {
    source = `^(?!${source}).*$`;
  }
  const regex = picomatch$2.toRegex(source, options);
  if (returnState === true) {
    regex.state = state;
  }
  return regex;
};
picomatch$2.makeRe = (input, options = {}, returnOutput = false, returnState = false) => {
  if (!input || typeof input !== "string") {
    throw new TypeError("Expected a non-empty string");
  }
  let parsed = { negated: false, fastpaths: true };
  if (options.fastpaths !== false && (input[0] === "." || input[0] === "*")) {
    parsed.output = parse$1.fastpaths(input, options);
  }
  if (!parsed.output) {
    parsed = parse$1(input, options);
  }
  return picomatch$2.compileRe(parsed, options, returnOutput, returnState);
};
picomatch$2.toRegex = (source, options) => {
  try {
    const opts = options || {};
    return new RegExp(source, opts.flags || (opts.nocase ? "i" : ""));
  } catch (err) {
    if (options && options.debug === true)
      throw err;
    return /$^/;
  }
};
picomatch$2.constants = constants;
var picomatch_1 = picomatch$2;
var picomatch$1 = picomatch_1;
const util = require$$0__default$2["default"];
const braces = braces_1;
const picomatch = picomatch$1;
const utils = utils$4;
const isEmptyString = (val) => val === "" || val === "./";
const micromatch$1 = (list, patterns, options) => {
  patterns = [].concat(patterns);
  list = [].concat(list);
  let omit = new Set();
  let keep = new Set();
  let items = new Set();
  let negatives = 0;
  let onResult = (state) => {
    items.add(state.output);
    if (options && options.onResult) {
      options.onResult(state);
    }
  };
  for (let i = 0; i < patterns.length; i++) {
    let isMatch = picomatch(String(patterns[i]), __spreadProps(__spreadValues({}, options), { onResult }), true);
    let negated = isMatch.state.negated || isMatch.state.negatedExtglob;
    if (negated)
      negatives++;
    for (let item of list) {
      let matched = isMatch(item, true);
      let match2 = negated ? !matched.isMatch : matched.isMatch;
      if (!match2)
        continue;
      if (negated) {
        omit.add(matched.output);
      } else {
        omit.delete(matched.output);
        keep.add(matched.output);
      }
    }
  }
  let result = negatives === patterns.length ? [...items] : [...keep];
  let matches = result.filter((item) => !omit.has(item));
  if (options && matches.length === 0) {
    if (options.failglob === true) {
      throw new Error(`No matches found for "${patterns.join(", ")}"`);
    }
    if (options.nonull === true || options.nullglob === true) {
      return options.unescape ? patterns.map((p) => p.replace(/\\/g, "")) : patterns;
    }
  }
  return matches;
};
micromatch$1.match = micromatch$1;
micromatch$1.matcher = (pattern, options) => picomatch(pattern, options);
micromatch$1.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);
micromatch$1.any = micromatch$1.isMatch;
micromatch$1.not = (list, patterns, options = {}) => {
  patterns = [].concat(patterns).map(String);
  let result = new Set();
  let items = [];
  let onResult = (state) => {
    if (options.onResult)
      options.onResult(state);
    items.push(state.output);
  };
  let matches = new Set(micromatch$1(list, patterns, __spreadProps(__spreadValues({}, options), { onResult })));
  for (let item of items) {
    if (!matches.has(item)) {
      result.add(item);
    }
  }
  return [...result];
};
micromatch$1.contains = (str, pattern, options) => {
  if (typeof str !== "string") {
    throw new TypeError(`Expected a string: "${util.inspect(str)}"`);
  }
  if (Array.isArray(pattern)) {
    return pattern.some((p) => micromatch$1.contains(str, p, options));
  }
  if (typeof pattern === "string") {
    if (isEmptyString(str) || isEmptyString(pattern)) {
      return false;
    }
    if (str.includes(pattern) || str.startsWith("./") && str.slice(2).includes(pattern)) {
      return true;
    }
  }
  return micromatch$1.isMatch(str, pattern, __spreadProps(__spreadValues({}, options), { contains: true }));
};
micromatch$1.matchKeys = (obj, patterns, options) => {
  if (!utils.isObject(obj)) {
    throw new TypeError("Expected the first argument to be an object");
  }
  let keys = micromatch$1(Object.keys(obj), patterns, options);
  let res = {};
  for (let key of keys)
    res[key] = obj[key];
  return res;
};
micromatch$1.some = (list, patterns, options) => {
  let items = [].concat(list);
  for (let pattern of [].concat(patterns)) {
    let isMatch = picomatch(String(pattern), options);
    if (items.some((item) => isMatch(item))) {
      return true;
    }
  }
  return false;
};
micromatch$1.every = (list, patterns, options) => {
  let items = [].concat(list);
  for (let pattern of [].concat(patterns)) {
    let isMatch = picomatch(String(pattern), options);
    if (!items.every((item) => isMatch(item))) {
      return false;
    }
  }
  return true;
};
micromatch$1.all = (str, patterns, options) => {
  if (typeof str !== "string") {
    throw new TypeError(`Expected a string: "${util.inspect(str)}"`);
  }
  return [].concat(patterns).every((p) => picomatch(p, options)(str));
};
micromatch$1.capture = (glob, input, options) => {
  let posix = utils.isWindows(options);
  let regex = picomatch.makeRe(String(glob), __spreadProps(__spreadValues({}, options), { capture: true }));
  let match2 = regex.exec(posix ? utils.toPosixSlashes(input) : input);
  if (match2) {
    return match2.slice(1).map((v) => v === void 0 ? "" : v);
  }
};
micromatch$1.makeRe = (...args) => picomatch.makeRe(...args);
micromatch$1.scan = (...args) => picomatch.scan(...args);
micromatch$1.parse = (patterns, options) => {
  let res = [];
  for (let pattern of [].concat(patterns || [])) {
    for (let str of braces(String(pattern), options)) {
      res.push(picomatch.parse(str, options));
    }
  }
  return res;
};
micromatch$1.braces = (pattern, options) => {
  if (typeof pattern !== "string")
    throw new TypeError("Expected a string");
  if (options && options.nobrace === true || !/\{.*\}/.test(pattern)) {
    return [pattern];
  }
  return braces(pattern, options);
};
micromatch$1.braceExpand = (pattern, options) => {
  if (typeof pattern !== "string")
    throw new TypeError("Expected a string");
  return micromatch$1.braces(pattern, __spreadProps(__spreadValues({}, options), { expand: true }));
};
var micromatch_1 = micromatch$1;
Object.defineProperty(contextMatcher$1, "__esModule", { value: true });
contextMatcher$1.match = void 0;
const isGlob = isGlob$1;
const micromatch = micromatch_1;
const url = require$$0__default$3["default"];
const errors_1$1 = errors;
function match(context, uri, req) {
  if (isStringPath(context)) {
    return matchSingleStringPath(context, uri);
  }
  if (isGlobPath(context)) {
    return matchSingleGlobPath(context, uri);
  }
  if (Array.isArray(context)) {
    if (context.every(isStringPath)) {
      return matchMultiPath(context, uri);
    }
    if (context.every(isGlobPath)) {
      return matchMultiGlobPath(context, uri);
    }
    throw new Error(errors_1$1.ERRORS.ERR_CONTEXT_MATCHER_INVALID_ARRAY);
  }
  if (typeof context === "function") {
    const pathname = getUrlPathName(uri);
    return context(pathname, req);
  }
  throw new Error(errors_1$1.ERRORS.ERR_CONTEXT_MATCHER_GENERIC);
}
contextMatcher$1.match = match;
function matchSingleStringPath(context, uri) {
  const pathname = getUrlPathName(uri);
  return pathname.indexOf(context) === 0;
}
function matchSingleGlobPath(pattern, uri) {
  const pathname = getUrlPathName(uri);
  const matches = micromatch([pathname], pattern);
  return matches && matches.length > 0;
}
function matchMultiGlobPath(patternList, uri) {
  return matchSingleGlobPath(patternList, uri);
}
function matchMultiPath(contextList, uri) {
  let isMultiPath = false;
  for (const context of contextList) {
    if (matchSingleStringPath(context, uri)) {
      isMultiPath = true;
      break;
    }
  }
  return isMultiPath;
}
function getUrlPathName(uri) {
  return uri && url.parse(uri).pathname;
}
function isStringPath(context) {
  return typeof context === "string" && !isGlob(context);
}
function isGlobPath(context) {
  return isGlob(context);
}
var _handlers = {};
Object.defineProperty(_handlers, "__esModule", { value: true });
_handlers.getHandlers = _handlers.init = void 0;
const logger_1$3 = logger$4;
const logger$2 = (0, logger_1$3.getInstance)();
function init(proxy, option) {
  const handlers2 = getHandlers(option);
  for (const eventName of Object.keys(handlers2)) {
    proxy.on(eventName, handlers2[eventName]);
  }
  proxy.on("econnreset", (error, req, res, target) => {
    logger$2.error(`[HPM] ECONNRESET: %O`, error);
  });
  proxy.on("proxyReqWs", (proxyReq, req, socket, options, head) => {
    socket.on("error", (error) => {
      logger$2.error(`[HPM] WebSocket error: %O`, error);
    });
  });
  logger$2.debug("[HPM] Subscribed to http-proxy events:", Object.keys(handlers2));
}
_handlers.init = init;
function getHandlers(options) {
  const proxyEventsMap = {
    error: "onError",
    proxyReq: "onProxyReq",
    proxyReqWs: "onProxyReqWs",
    proxyRes: "onProxyRes",
    open: "onOpen",
    close: "onClose"
  };
  const handlers2 = {};
  for (const [eventName, onEventName] of Object.entries(proxyEventsMap)) {
    const fnHandler = options ? options[onEventName] : null;
    if (typeof fnHandler === "function") {
      handlers2[eventName] = fnHandler;
    }
  }
  if (typeof handlers2.error !== "function") {
    handlers2.error = defaultErrorHandler;
  }
  if (typeof handlers2.close !== "function") {
    handlers2.close = logClose;
  }
  return handlers2;
}
_handlers.getHandlers = getHandlers;
function defaultErrorHandler(err, req, res) {
  if (!req && !res) {
    throw err;
  }
  const host = req.headers && req.headers.host;
  const code = err.code;
  if (res.writeHead && !res.headersSent) {
    if (/HPE_INVALID/.test(code)) {
      res.writeHead(502);
    } else {
      switch (code) {
        case "ECONNRESET":
        case "ENOTFOUND":
        case "ECONNREFUSED":
        case "ETIMEDOUT":
          res.writeHead(504);
          break;
        default:
          res.writeHead(500);
      }
    }
  }
  res.end(`Error occurred while trying to proxy: ${host}${req.url}`);
}
function logClose(req, socket, head) {
  logger$2.info("[HPM] Client disconnected");
}
var pathRewriter = {};
Object.defineProperty(pathRewriter, "__esModule", { value: true });
pathRewriter.createPathRewriter = void 0;
const isPlainObj$1 = isPlainObj$3;
const errors_1 = errors;
const logger_1$2 = logger$4;
const logger$1 = (0, logger_1$2.getInstance)();
function createPathRewriter(rewriteConfig) {
  let rulesCache;
  if (!isValidRewriteConfig(rewriteConfig)) {
    return;
  }
  if (typeof rewriteConfig === "function") {
    const customRewriteFn = rewriteConfig;
    return customRewriteFn;
  } else {
    rulesCache = parsePathRewriteRules(rewriteConfig);
    return rewritePath;
  }
  function rewritePath(path2) {
    let result = path2;
    for (const rule of rulesCache) {
      if (rule.regex.test(path2)) {
        result = result.replace(rule.regex, rule.value);
        logger$1.debug('[HPM] Rewriting path from "%s" to "%s"', path2, result);
        break;
      }
    }
    return result;
  }
}
pathRewriter.createPathRewriter = createPathRewriter;
function isValidRewriteConfig(rewriteConfig) {
  if (typeof rewriteConfig === "function") {
    return true;
  } else if (isPlainObj$1(rewriteConfig)) {
    return Object.keys(rewriteConfig).length !== 0;
  } else if (rewriteConfig === void 0 || rewriteConfig === null) {
    return false;
  } else {
    throw new Error(errors_1.ERRORS.ERR_PATH_REWRITER_CONFIG);
  }
}
function parsePathRewriteRules(rewriteConfig) {
  const rules = [];
  if (isPlainObj$1(rewriteConfig)) {
    for (const [key] of Object.entries(rewriteConfig)) {
      rules.push({
        regex: new RegExp(key),
        value: rewriteConfig[key]
      });
      logger$1.info('[HPM] Proxy rewrite rule created: "%s" ~> "%s"', key, rewriteConfig[key]);
    }
  }
  return rules;
}
var router = {};
Object.defineProperty(router, "__esModule", { value: true });
router.getTarget = void 0;
const isPlainObj = isPlainObj$3;
const logger_1$1 = logger$4;
const logger = (0, logger_1$1.getInstance)();
async function getTarget(req, config) {
  let newTarget;
  const router2 = config.router;
  if (isPlainObj(router2)) {
    newTarget = getTargetFromProxyTable(req, router2);
  } else if (typeof router2 === "function") {
    newTarget = await router2(req);
  }
  return newTarget;
}
router.getTarget = getTarget;
function getTargetFromProxyTable(req, table) {
  let result;
  const host = req.headers.host;
  const path2 = req.url;
  const hostAndPath = host + path2;
  for (const [key] of Object.entries(table)) {
    if (containsPath(key)) {
      if (hostAndPath.indexOf(key) > -1) {
        result = table[key];
        logger.debug('[HPM] Router table match: "%s"', key);
        break;
      }
    } else {
      if (key === host) {
        result = table[key];
        logger.debug('[HPM] Router table match: "%s"', host);
        break;
      }
    }
  }
  return result;
}
function containsPath(v) {
  return v.indexOf("/") > -1;
}
Object.defineProperty(httpProxyMiddleware, "__esModule", { value: true });
httpProxyMiddleware.HttpProxyMiddleware = void 0;
const httpProxy = httpProxy$1;
const config_factory_1 = configFactory;
const contextMatcher = contextMatcher$1;
const handlers$1 = _handlers;
const logger_1 = logger$4;
const PathRewriter = pathRewriter;
const Router = router;
class HttpProxyMiddleware {
  constructor(context, opts) {
    this.logger = (0, logger_1.getInstance)();
    this.wsInternalSubscribed = false;
    this.serverOnCloseSubscribed = false;
    this.middleware = async (req, res, next) => {
      var _a, _b;
      if (this.shouldProxy(this.config.context, req)) {
        try {
          const activeProxyOptions = await this.prepareProxyRequest(req);
          this.proxy.web(req, res, activeProxyOptions);
        } catch (err) {
          next(err);
        }
      } else {
        next();
      }
      const server = (_b = (_a = req.socket) !== null && _a !== void 0 ? _a : req.connection) === null || _b === void 0 ? void 0 : _b.server;
      if (server && !this.serverOnCloseSubscribed) {
        server.on("close", () => {
          this.logger.info("[HPM] server close signal received: closing proxy server");
          this.proxy.close();
        });
        this.serverOnCloseSubscribed = true;
      }
      if (this.proxyOptions.ws === true) {
        this.catchUpgradeRequest(server);
      }
    };
    this.catchUpgradeRequest = (server) => {
      if (!this.wsInternalSubscribed) {
        server.on("upgrade", this.handleUpgrade);
        this.wsInternalSubscribed = true;
      }
    };
    this.handleUpgrade = async (req, socket, head) => {
      if (this.shouldProxy(this.config.context, req)) {
        const activeProxyOptions = await this.prepareProxyRequest(req);
        this.proxy.ws(req, socket, head, activeProxyOptions);
        this.logger.info("[HPM] Upgrading to WebSocket");
      }
    };
    this.shouldProxy = (context2, req) => {
      const path2 = req.originalUrl || req.url;
      return contextMatcher.match(context2, path2, req);
    };
    this.prepareProxyRequest = async (req) => {
      req.url = req.originalUrl || req.url;
      const originalPath = req.url;
      const newProxyOptions = Object.assign({}, this.proxyOptions);
      await this.applyRouter(req, newProxyOptions);
      await this.applyPathRewrite(req, this.pathRewriter);
      if (this.proxyOptions.logLevel === "debug") {
        const arrow = (0, logger_1.getArrow)(originalPath, req.url, this.proxyOptions.target, newProxyOptions.target);
        this.logger.debug("[HPM] %s %s %s %s", req.method, originalPath, arrow, newProxyOptions.target);
      }
      return newProxyOptions;
    };
    this.applyRouter = async (req, options) => {
      let newTarget;
      if (options.router) {
        newTarget = await Router.getTarget(req, options);
        if (newTarget) {
          this.logger.debug('[HPM] Router new target: %s -> "%s"', options.target, newTarget);
          options.target = newTarget;
        }
      }
    };
    this.applyPathRewrite = async (req, pathRewriter2) => {
      if (pathRewriter2) {
        const path2 = await pathRewriter2(req.url, req);
        if (typeof path2 === "string") {
          req.url = path2;
        } else {
          this.logger.info("[HPM] pathRewrite: No rewritten path found. (%s)", req.url);
        }
      }
    };
    this.logError = (err, req, res, target) => {
      var _a;
      const hostname = ((_a = req.headers) === null || _a === void 0 ? void 0 : _a.host) || req.hostname || req.host;
      const requestHref = `${hostname}${req.url}`;
      const targetHref = `${target === null || target === void 0 ? void 0 : target.href}`;
      const errorMessage = "[HPM] Error occurred while proxying request %s to %s [%s] (%s)";
      const errReference = "https://nodejs.org/api/errors.html#errors_common_system_errors";
      this.logger.error(errorMessage, requestHref, targetHref, err.code || err, errReference);
    };
    this.config = (0, config_factory_1.createConfig)(context, opts);
    this.proxyOptions = this.config.options;
    this.proxy = httpProxy.createProxyServer({});
    this.logger.info(`[HPM] Proxy created: ${this.config.context}  -> ${this.proxyOptions.target}`);
    this.pathRewriter = PathRewriter.createPathRewriter(this.proxyOptions.pathRewrite);
    handlers$1.init(this.proxy, this.proxyOptions);
    this.proxy.on("error", this.logError);
    this.middleware.upgrade = (req, socket, head) => {
      if (!this.wsInternalSubscribed) {
        this.handleUpgrade(req, socket, head);
      }
    };
  }
}
httpProxyMiddleware.HttpProxyMiddleware = HttpProxyMiddleware;
var handlers = {};
var _public = {};
var responseInterceptor$1 = {};
Object.defineProperty(responseInterceptor$1, "__esModule", { value: true });
responseInterceptor$1.responseInterceptor = void 0;
const zlib = require$$0__default$5["default"];
function responseInterceptor(interceptor) {
  return async function proxyRes(proxyRes, req, res) {
    const originalProxyRes = proxyRes;
    let buffer = Buffer.from("", "utf8");
    const _proxyRes = decompress(proxyRes, proxyRes.headers["content-encoding"]);
    _proxyRes.on("data", (chunk) => buffer = Buffer.concat([buffer, chunk]));
    _proxyRes.on("end", async () => {
      copyHeaders(proxyRes, res);
      const interceptedBuffer = Buffer.from(await interceptor(buffer, originalProxyRes, req, res));
      res.setHeader("content-length", Buffer.byteLength(interceptedBuffer, "utf8"));
      res.write(interceptedBuffer);
      res.end();
    });
    _proxyRes.on("error", (error) => {
      res.end(`Error fetching proxied request: ${error.message}`);
    });
  };
}
responseInterceptor$1.responseInterceptor = responseInterceptor;
function decompress(proxyRes, contentEncoding) {
  let _proxyRes = proxyRes;
  let decompress2;
  switch (contentEncoding) {
    case "gzip":
      decompress2 = zlib.createGunzip();
      break;
    case "br":
      decompress2 = zlib.createBrotliDecompress();
      break;
    case "deflate":
      decompress2 = zlib.createInflate();
      break;
  }
  if (decompress2) {
    _proxyRes.pipe(decompress2);
    _proxyRes = decompress2;
  }
  return _proxyRes;
}
function copyHeaders(originalResponse, response) {
  response.statusCode = originalResponse.statusCode;
  response.statusMessage = originalResponse.statusMessage;
  if (response.setHeader) {
    let keys = Object.keys(originalResponse.headers);
    keys = keys.filter((key) => !["content-encoding", "transfer-encoding"].includes(key));
    keys.forEach((key) => {
      let value = originalResponse.headers[key];
      if (key === "set-cookie") {
        value = Array.isArray(value) ? value : [value];
        value = value.map((x) => x.replace(/Domain=[^;]+?/i, ""));
      }
      response.setHeader(key, value);
    });
  } else {
    response.headers = originalResponse.headers;
  }
}
var fixRequestBody$1 = {};
Object.defineProperty(fixRequestBody$1, "__esModule", { value: true });
fixRequestBody$1.fixRequestBody = void 0;
const querystring = require$$0__default$6["default"];
function fixRequestBody(proxyReq, req) {
  const requestBody = req.body;
  if (!requestBody) {
    return;
  }
  const contentType = proxyReq.getHeader("Content-Type");
  const writeBody = (bodyData) => {
    proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  };
  if (contentType && contentType.includes("application/json")) {
    writeBody(JSON.stringify(requestBody));
  }
  if (contentType && contentType.includes("application/x-www-form-urlencoded")) {
    writeBody(querystring.stringify(requestBody));
  }
}
fixRequestBody$1.fixRequestBody = fixRequestBody;
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.fixRequestBody = exports.responseInterceptor = void 0;
  var response_interceptor_1 = responseInterceptor$1;
  Object.defineProperty(exports, "responseInterceptor", { enumerable: true, get: function() {
    return response_interceptor_1.responseInterceptor;
  } });
  var fix_request_body_1 = fixRequestBody$1;
  Object.defineProperty(exports, "fixRequestBody", { enumerable: true, get: function() {
    return fix_request_body_1.fixRequestBody;
  } });
})(_public);
(function(exports) {
  var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() {
      return m[k];
    } });
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
        __createBinding(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  __exportStar(_public, exports);
})(handlers);
(function(exports) {
  var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() {
      return m[k];
    } });
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
        __createBinding(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.createProxyMiddleware = void 0;
  const http_proxy_middleware_1 = httpProxyMiddleware;
  function createProxyMiddleware(context, options) {
    const { middleware } = new http_proxy_middleware_1.HttpProxyMiddleware(context, options);
    return middleware;
  }
  exports.createProxyMiddleware = createProxyMiddleware;
  __exportStar(handlers, exports);
})(dist);
var lib = { exports: {} };
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;
function toObject(val) {
  if (val === null || val === void 0) {
    throw new TypeError("Object.assign cannot be called with null or undefined");
  }
  return Object(val);
}
function shouldUseNative() {
  try {
    if (!Object.assign) {
      return false;
    }
    var test1 = new String("abc");
    test1[5] = "de";
    if (Object.getOwnPropertyNames(test1)[0] === "5") {
      return false;
    }
    var test2 = {};
    for (var i = 0; i < 10; i++) {
      test2["_" + String.fromCharCode(i)] = i;
    }
    var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
      return test2[n];
    });
    if (order2.join("") !== "0123456789") {
      return false;
    }
    var test3 = {};
    "abcdefghijklmnopqrst".split("").forEach(function(letter) {
      test3[letter] = letter;
    });
    if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}
var objectAssign = shouldUseNative() ? Object.assign : function(target, source) {
  var from;
  var to = toObject(target);
  var symbols;
  for (var s = 1; s < arguments.length; s++) {
    from = Object(arguments[s]);
    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }
    if (getOwnPropertySymbols) {
      symbols = getOwnPropertySymbols(from);
      for (var i = 0; i < symbols.length; i++) {
        if (propIsEnumerable.call(from, symbols[i])) {
          to[symbols[i]] = from[symbols[i]];
        }
      }
    }
  }
  return to;
};
var vary$1 = { exports: {} };
/*!
 * vary
 * Copyright(c) 2014-2017 Douglas Christopher Wilson
 * MIT Licensed
 */
vary$1.exports = vary;
vary$1.exports.append = append;
var FIELD_NAME_REGEXP = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
function append(header, field) {
  if (typeof header !== "string") {
    throw new TypeError("header argument is required");
  }
  if (!field) {
    throw new TypeError("field argument is required");
  }
  var fields = !Array.isArray(field) ? parse(String(field)) : field;
  for (var j = 0; j < fields.length; j++) {
    if (!FIELD_NAME_REGEXP.test(fields[j])) {
      throw new TypeError("field argument contains an invalid header name");
    }
  }
  if (header === "*") {
    return header;
  }
  var val = header;
  var vals = parse(header.toLowerCase());
  if (fields.indexOf("*") !== -1 || vals.indexOf("*") !== -1) {
    return "*";
  }
  for (var i = 0; i < fields.length; i++) {
    var fld = fields[i].toLowerCase();
    if (vals.indexOf(fld) === -1) {
      vals.push(fld);
      val = val ? val + ", " + fields[i] : fields[i];
    }
  }
  return val;
}
function parse(header) {
  var end = 0;
  var list = [];
  var start = 0;
  for (var i = 0, len = header.length; i < len; i++) {
    switch (header.charCodeAt(i)) {
      case 32:
        if (start === end) {
          start = end = i + 1;
        }
        break;
      case 44:
        list.push(header.substring(start, end));
        start = end = i + 1;
        break;
      default:
        end = i + 1;
        break;
    }
  }
  list.push(header.substring(start, end));
  return list;
}
function vary(res, field) {
  if (!res || !res.getHeader || !res.setHeader) {
    throw new TypeError("res argument is required");
  }
  var val = res.getHeader("Vary") || "";
  var header = Array.isArray(val) ? val.join(", ") : String(val);
  if (val = append(header, field)) {
    res.setHeader("Vary", val);
  }
}
(function() {
  var assign = objectAssign;
  var vary2 = vary$1.exports;
  var defaults = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204
  };
  function isString2(s) {
    return typeof s === "string" || s instanceof String;
  }
  function isOriginAllowed(origin, allowedOrigin) {
    if (Array.isArray(allowedOrigin)) {
      for (var i = 0; i < allowedOrigin.length; ++i) {
        if (isOriginAllowed(origin, allowedOrigin[i])) {
          return true;
        }
      }
      return false;
    } else if (isString2(allowedOrigin)) {
      return origin === allowedOrigin;
    } else if (allowedOrigin instanceof RegExp) {
      return allowedOrigin.test(origin);
    } else {
      return !!allowedOrigin;
    }
  }
  function configureOrigin(options, req) {
    var requestOrigin = req.headers.origin, headers = [], isAllowed;
    if (!options.origin || options.origin === "*") {
      headers.push([{
        key: "Access-Control-Allow-Origin",
        value: "*"
      }]);
    } else if (isString2(options.origin)) {
      headers.push([{
        key: "Access-Control-Allow-Origin",
        value: options.origin
      }]);
      headers.push([{
        key: "Vary",
        value: "Origin"
      }]);
    } else {
      isAllowed = isOriginAllowed(requestOrigin, options.origin);
      headers.push([{
        key: "Access-Control-Allow-Origin",
        value: isAllowed ? requestOrigin : false
      }]);
      headers.push([{
        key: "Vary",
        value: "Origin"
      }]);
    }
    return headers;
  }
  function configureMethods(options) {
    var methods = options.methods;
    if (methods.join) {
      methods = options.methods.join(",");
    }
    return {
      key: "Access-Control-Allow-Methods",
      value: methods
    };
  }
  function configureCredentials(options) {
    if (options.credentials === true) {
      return {
        key: "Access-Control-Allow-Credentials",
        value: "true"
      };
    }
    return null;
  }
  function configureAllowedHeaders(options, req) {
    var allowedHeaders = options.allowedHeaders || options.headers;
    var headers = [];
    if (!allowedHeaders) {
      allowedHeaders = req.headers["access-control-request-headers"];
      headers.push([{
        key: "Vary",
        value: "Access-Control-Request-Headers"
      }]);
    } else if (allowedHeaders.join) {
      allowedHeaders = allowedHeaders.join(",");
    }
    if (allowedHeaders && allowedHeaders.length) {
      headers.push([{
        key: "Access-Control-Allow-Headers",
        value: allowedHeaders
      }]);
    }
    return headers;
  }
  function configureExposedHeaders(options) {
    var headers = options.exposedHeaders;
    if (!headers) {
      return null;
    } else if (headers.join) {
      headers = headers.join(",");
    }
    if (headers && headers.length) {
      return {
        key: "Access-Control-Expose-Headers",
        value: headers
      };
    }
    return null;
  }
  function configureMaxAge(options) {
    var maxAge = (typeof options.maxAge === "number" || options.maxAge) && options.maxAge.toString();
    if (maxAge && maxAge.length) {
      return {
        key: "Access-Control-Max-Age",
        value: maxAge
      };
    }
    return null;
  }
  function applyHeaders(headers, res) {
    for (var i = 0, n = headers.length; i < n; i++) {
      var header = headers[i];
      if (header) {
        if (Array.isArray(header)) {
          applyHeaders(header, res);
        } else if (header.key === "Vary" && header.value) {
          vary2(res, header.value);
        } else if (header.value) {
          res.setHeader(header.key, header.value);
        }
      }
    }
  }
  function cors2(options, req, res, next) {
    var headers = [], method = req.method && req.method.toUpperCase && req.method.toUpperCase();
    if (method === "OPTIONS") {
      headers.push(configureOrigin(options, req));
      headers.push(configureCredentials(options));
      headers.push(configureMethods(options));
      headers.push(configureAllowedHeaders(options, req));
      headers.push(configureMaxAge(options));
      headers.push(configureExposedHeaders(options));
      applyHeaders(headers, res);
      if (options.preflightContinue) {
        next();
      } else {
        res.statusCode = options.optionsSuccessStatus;
        res.setHeader("Content-Length", "0");
        res.end();
      }
    } else {
      headers.push(configureOrigin(options, req));
      headers.push(configureCredentials(options));
      headers.push(configureExposedHeaders(options));
      applyHeaders(headers, res);
      next();
    }
  }
  function middlewareWrapper(o) {
    var optionsCallback = null;
    if (typeof o === "function") {
      optionsCallback = o;
    } else {
      optionsCallback = function(req, cb) {
        cb(null, o);
      };
    }
    return function corsMiddleware(req, res, next) {
      optionsCallback(req, function(err, options) {
        if (err) {
          next(err);
        } else {
          var corsOptions = assign({}, defaults, options);
          var originCallback = null;
          if (corsOptions.origin && typeof corsOptions.origin === "function") {
            originCallback = corsOptions.origin;
          } else if (corsOptions.origin) {
            originCallback = function(origin, cb) {
              cb(null, corsOptions.origin);
            };
          }
          if (originCallback) {
            originCallback(req.headers.origin, function(err2, origin) {
              if (err2 || !origin) {
                next(err2);
              } else {
                corsOptions.origin = origin;
                cors2(corsOptions, req, res, next);
              }
            });
          } else {
            next();
          }
        }
      });
    };
  }
  lib.exports = middlewareWrapper;
})();
var cors = lib.exports;
async function startAppServer() {
  console.log("start server sd");
  const app2 = express__default["default"]();
  const port = 3333;
  app2.use(express__default["default"].json());
  app2.use(cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
  }));
  const proxyMiddleware = dist.createProxyMiddleware("/comfyui", {
    target: "http://127.0.0.1:8188",
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      "^/comfyui": ""
    }
  });
  app2.use("/comfyui", proxyMiddleware);
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
const rendererPath = require$$0__default$1["default"].join(__dirname, "../renderer");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9lbGVjdHJvbi1pcy1kZXZAMS4yLjAvbm9kZV9tb2R1bGVzL2VsZWN0cm9uLWlzLWRldi9pbmRleC5qcyIsIi4uL3NyYy91dGlscy50cyIsIi4uL3NyYy93aW5kb3dzLW1hbmFnZXIudHMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZWxlY3Ryb24tbG9nQDUuMC4xL25vZGVfbW9kdWxlcy9lbGVjdHJvbi1sb2cvc3JjL2NvcmUvc2NvcGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZWxlY3Ryb24tbG9nQDUuMC4xL25vZGVfbW9kdWxlcy9lbGVjdHJvbi1sb2cvc3JjL2NvcmUvTG9nZ2VyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2VsZWN0cm9uLWxvZ0A1LjAuMS9ub2RlX21vZHVsZXMvZWxlY3Ryb24tbG9nL3NyYy9yZW5kZXJlci9saWIvUmVuZGVyZXJFcnJvckhhbmRsZXIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZWxlY3Ryb24tbG9nQDUuMC4xL25vZGVfbW9kdWxlcy9lbGVjdHJvbi1sb2cvc3JjL3JlbmRlcmVyL2xpYi90cmFuc3BvcnRzL2NvbnNvbGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZWxlY3Ryb24tbG9nQDUuMC4xL25vZGVfbW9kdWxlcy9lbGVjdHJvbi1sb2cvc3JjL3JlbmRlcmVyL2xpYi90cmFuc3BvcnRzL2lwYy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9lbGVjdHJvbi1sb2dANS4wLjEvbm9kZV9tb2R1bGVzL2VsZWN0cm9uLWxvZy9zcmMvcmVuZGVyZXIvaW5kZXguanMiLCIuLi9zcmMvcHJlbGF1bmNoLnRzIiwiLi4vc3JjL2F1dG8tdXBkYXRlLnRzIiwiLi4vc3JjL2lwYy50cyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9ldmVudGVtaXR0ZXIzQDQuMC43L25vZGVfbW9kdWxlcy9ldmVudGVtaXR0ZXIzL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3JlcXVpcmVzLXBvcnRAMS4wLjAvbm9kZV9tb2R1bGVzL3JlcXVpcmVzLXBvcnQvaW5kZXguanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vaHR0cC1wcm94eUAxLjE4LjEvbm9kZV9tb2R1bGVzL2h0dHAtcHJveHkvbGliL2h0dHAtcHJveHkvY29tbW9uLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2h0dHAtcHJveHlAMS4xOC4xL25vZGVfbW9kdWxlcy9odHRwLXByb3h5L2xpYi9odHRwLXByb3h5L3Bhc3Nlcy93ZWItb3V0Z29pbmcuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZm9sbG93LXJlZGlyZWN0c0AxLjE1LjMvbm9kZV9tb2R1bGVzL2ZvbGxvdy1yZWRpcmVjdHMvZGVidWcuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZm9sbG93LXJlZGlyZWN0c0AxLjE1LjMvbm9kZV9tb2R1bGVzL2ZvbGxvdy1yZWRpcmVjdHMvaW5kZXguanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vaHR0cC1wcm94eUAxLjE4LjEvbm9kZV9tb2R1bGVzL2h0dHAtcHJveHkvbGliL2h0dHAtcHJveHkvcGFzc2VzL3dlYi1pbmNvbWluZy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9odHRwLXByb3h5QDEuMTguMS9ub2RlX21vZHVsZXMvaHR0cC1wcm94eS9saWIvaHR0cC1wcm94eS9wYXNzZXMvd3MtaW5jb21pbmcuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vaHR0cC1wcm94eUAxLjE4LjEvbm9kZV9tb2R1bGVzL2h0dHAtcHJveHkvbGliL2h0dHAtcHJveHkvaW5kZXguanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vaHR0cC1wcm94eUAxLjE4LjEvbm9kZV9tb2R1bGVzL2h0dHAtcHJveHkvbGliL2h0dHAtcHJveHkuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vaHR0cC1wcm94eUAxLjE4LjEvbm9kZV9tb2R1bGVzL2h0dHAtcHJveHkvaW5kZXguanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vaXMtcGxhaW4tb2JqQDMuMC4wL25vZGVfbW9kdWxlcy9pcy1wbGFpbi1vYmovaW5kZXguanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vaHR0cC1wcm94eS1taWRkbGV3YXJlQDIuMC42X0B0eXBlcytleHByZXNzQDQuMTcuMjEvbm9kZV9tb2R1bGVzL2h0dHAtcHJveHktbWlkZGxld2FyZS9kaXN0L2Vycm9ycy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9odHRwLXByb3h5LW1pZGRsZXdhcmVAMi4wLjZfQHR5cGVzK2V4cHJlc3NANC4xNy4yMS9ub2RlX21vZHVsZXMvaHR0cC1wcm94eS1taWRkbGV3YXJlL2Rpc3QvbG9nZ2VyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2h0dHAtcHJveHktbWlkZGxld2FyZUAyLjAuNl9AdHlwZXMrZXhwcmVzc0A0LjE3LjIxL25vZGVfbW9kdWxlcy9odHRwLXByb3h5LW1pZGRsZXdhcmUvZGlzdC9jb25maWctZmFjdG9yeS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9pcy1leHRnbG9iQDIuMS4xL25vZGVfbW9kdWxlcy9pcy1leHRnbG9iL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2lzLWdsb2JANC4wLjMvbm9kZV9tb2R1bGVzL2lzLWdsb2IvaW5kZXguanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vYnJhY2VzQDMuMC4yL25vZGVfbW9kdWxlcy9icmFjZXMvbGliL3V0aWxzLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2JyYWNlc0AzLjAuMi9ub2RlX21vZHVsZXMvYnJhY2VzL2xpYi9zdHJpbmdpZnkuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vaXMtbnVtYmVyQDcuMC4wL25vZGVfbW9kdWxlcy9pcy1udW1iZXIvaW5kZXguanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vdG8tcmVnZXgtcmFuZ2VANS4wLjEvbm9kZV9tb2R1bGVzL3RvLXJlZ2V4LXJhbmdlL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2ZpbGwtcmFuZ2VANy4wLjEvbm9kZV9tb2R1bGVzL2ZpbGwtcmFuZ2UvaW5kZXguanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vYnJhY2VzQDMuMC4yL25vZGVfbW9kdWxlcy9icmFjZXMvbGliL2NvbXBpbGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vYnJhY2VzQDMuMC4yL25vZGVfbW9kdWxlcy9icmFjZXMvbGliL2V4cGFuZC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9icmFjZXNAMy4wLjIvbm9kZV9tb2R1bGVzL2JyYWNlcy9saWIvY29uc3RhbnRzLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2JyYWNlc0AzLjAuMi9ub2RlX21vZHVsZXMvYnJhY2VzL2xpYi9wYXJzZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9icmFjZXNAMy4wLjIvbm9kZV9tb2R1bGVzL2JyYWNlcy9pbmRleC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9waWNvbWF0Y2hAMi4zLjEvbm9kZV9tb2R1bGVzL3BpY29tYXRjaC9saWIvY29uc3RhbnRzLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3BpY29tYXRjaEAyLjMuMS9ub2RlX21vZHVsZXMvcGljb21hdGNoL2xpYi91dGlscy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9waWNvbWF0Y2hAMi4zLjEvbm9kZV9tb2R1bGVzL3BpY29tYXRjaC9saWIvc2Nhbi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9waWNvbWF0Y2hAMi4zLjEvbm9kZV9tb2R1bGVzL3BpY29tYXRjaC9saWIvcGFyc2UuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcGljb21hdGNoQDIuMy4xL25vZGVfbW9kdWxlcy9waWNvbWF0Y2gvbGliL3BpY29tYXRjaC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9waWNvbWF0Y2hAMi4zLjEvbm9kZV9tb2R1bGVzL3BpY29tYXRjaC9pbmRleC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9taWNyb21hdGNoQDQuMC41L25vZGVfbW9kdWxlcy9taWNyb21hdGNoL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2h0dHAtcHJveHktbWlkZGxld2FyZUAyLjAuNl9AdHlwZXMrZXhwcmVzc0A0LjE3LjIxL25vZGVfbW9kdWxlcy9odHRwLXByb3h5LW1pZGRsZXdhcmUvZGlzdC9jb250ZXh0LW1hdGNoZXIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vaHR0cC1wcm94eS1taWRkbGV3YXJlQDIuMC42X0B0eXBlcytleHByZXNzQDQuMTcuMjEvbm9kZV9tb2R1bGVzL2h0dHAtcHJveHktbWlkZGxld2FyZS9kaXN0L19oYW5kbGVycy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9odHRwLXByb3h5LW1pZGRsZXdhcmVAMi4wLjZfQHR5cGVzK2V4cHJlc3NANC4xNy4yMS9ub2RlX21vZHVsZXMvaHR0cC1wcm94eS1taWRkbGV3YXJlL2Rpc3QvcGF0aC1yZXdyaXRlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9odHRwLXByb3h5LW1pZGRsZXdhcmVAMi4wLjZfQHR5cGVzK2V4cHJlc3NANC4xNy4yMS9ub2RlX21vZHVsZXMvaHR0cC1wcm94eS1taWRkbGV3YXJlL2Rpc3Qvcm91dGVyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2h0dHAtcHJveHktbWlkZGxld2FyZUAyLjAuNl9AdHlwZXMrZXhwcmVzc0A0LjE3LjIxL25vZGVfbW9kdWxlcy9odHRwLXByb3h5LW1pZGRsZXdhcmUvZGlzdC9odHRwLXByb3h5LW1pZGRsZXdhcmUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vaHR0cC1wcm94eS1taWRkbGV3YXJlQDIuMC42X0B0eXBlcytleHByZXNzQDQuMTcuMjEvbm9kZV9tb2R1bGVzL2h0dHAtcHJveHktbWlkZGxld2FyZS9kaXN0L2hhbmRsZXJzL3Jlc3BvbnNlLWludGVyY2VwdG9yLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2h0dHAtcHJveHktbWlkZGxld2FyZUAyLjAuNl9AdHlwZXMrZXhwcmVzc0A0LjE3LjIxL25vZGVfbW9kdWxlcy9odHRwLXByb3h5LW1pZGRsZXdhcmUvZGlzdC9oYW5kbGVycy9maXgtcmVxdWVzdC1ib2R5LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2h0dHAtcHJveHktbWlkZGxld2FyZUAyLjAuNl9AdHlwZXMrZXhwcmVzc0A0LjE3LjIxL25vZGVfbW9kdWxlcy9odHRwLXByb3h5LW1pZGRsZXdhcmUvZGlzdC9oYW5kbGVycy9wdWJsaWMuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vaHR0cC1wcm94eS1taWRkbGV3YXJlQDIuMC42X0B0eXBlcytleHByZXNzQDQuMTcuMjEvbm9kZV9tb2R1bGVzL2h0dHAtcHJveHktbWlkZGxld2FyZS9kaXN0L2hhbmRsZXJzL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2h0dHAtcHJveHktbWlkZGxld2FyZUAyLjAuNl9AdHlwZXMrZXhwcmVzc0A0LjE3LjIxL25vZGVfbW9kdWxlcy9odHRwLXByb3h5LW1pZGRsZXdhcmUvZGlzdC9pbmRleC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9vYmplY3QtYXNzaWduQDQuMS4xL25vZGVfbW9kdWxlcy9vYmplY3QtYXNzaWduL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3ZhcnlAMS4xLjIvbm9kZV9tb2R1bGVzL3ZhcnkvaW5kZXguanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vY29yc0AyLjguNS9ub2RlX21vZHVsZXMvY29ycy9saWIvaW5kZXguanMiLCIuLi8uLi8uLi8uLi9ub2RlL3NyYy9hcHAudHMiLCIuLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuY29uc3QgZWxlY3Ryb24gPSByZXF1aXJlKCdlbGVjdHJvbicpO1xuXG5pZiAodHlwZW9mIGVsZWN0cm9uID09PSAnc3RyaW5nJykge1xuXHR0aHJvdyBuZXcgVHlwZUVycm9yKCdOb3QgcnVubmluZyBpbiBhbiBFbGVjdHJvbiBlbnZpcm9ubWVudCEnKTtcbn1cblxuY29uc3QgYXBwID0gZWxlY3Ryb24uYXBwIHx8IGVsZWN0cm9uLnJlbW90ZS5hcHA7XG5cbmNvbnN0IGlzRW52U2V0ID0gJ0VMRUNUUk9OX0lTX0RFVicgaW4gcHJvY2Vzcy5lbnY7XG5jb25zdCBnZXRGcm9tRW52ID0gcGFyc2VJbnQocHJvY2Vzcy5lbnYuRUxFQ1RST05fSVNfREVWLCAxMCkgPT09IDE7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNFbnZTZXQgPyBnZXRGcm9tRW52IDogIWFwcC5pc1BhY2thZ2VkO1xuIiwiY29uc3QgaXNNYWNPUyA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nO1xuaW1wb3J0IGlzRGV2IGZyb20gJ2VsZWN0cm9uLWlzLWRldidcbmV4cG9ydCB7XG4gICAgaXNNYWNPUyxcbiAgICBpc0RldlxufVxuaW1wb3J0IGNyeXB0byBmcm9tIFwiY3J5cHRvXCI7XG5leHBvcnQgZnVuY3Rpb24gdXVpZCgpIHtcbiAgICByZXR1cm4gY3J5cHRvLnJhbmRvbVVVSUQoKTtcbn0iLCJpbXBvcnQgeyBCcm93c2VyVmlldywgQnJvd3NlcldpbmRvdyB9IGZyb20gXCJlbGVjdHJvblwiO1xuaW1wb3J0IGlzRGV2IGZyb20gXCJlbGVjdHJvbi1pcy1kZXZcIjtcblxuaW1wb3J0IHsgaXNNYWNPUywgdXVpZCB9IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgZm9ybWF0IH0gZnJvbSBcInVybFwiO1xuXG4vLyB0eXBlIGRlZmluZVxuZXhwb3J0IGludGVyZmFjZSBJV2luZG93SW5zdGFuY2Uge1xuICB3aW5kb3c6IEJyb3dzZXJWaWV3O1xuICBuYW1lOiBzdHJpbmc7XG59XG5leHBvcnQgaW50ZXJmYWNlIFRhYkxpc3Qge1xuICB0YWJzOiBzdHJpbmdbXTtcbiAgYWN0aXZlOiBzdHJpbmc7XG59XG5cbi8vIGdvbGJhbCBkYXRhXG5sZXQgbGlzdFdpbmRvdzogSVdpbmRvd0luc3RhbmNlW10gPSBbXTtcbmxldCBtYWluV2luZG93OiBCcm93c2VyV2luZG93O1xuY29uc3QgZGVmYXVsdFdpbmRvd1VybCA9IGlzRGV2XG4gID8gJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCdcbiAgOiBmb3JtYXQoe1xuICAgIHBhdGhuYW1lOiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vcmVuZGVyZXIvb3V0L2luZGV4Lmh0bWwnKSxcbiAgICBwcm90b2NvbDogJ2ZpbGU6JyxcbiAgICBzbGFzaGVzOiB0cnVlLFxuICB9KTtcblxuY29uc3QgcHJlbG9hZF9qc19wYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi8uLi9wcmVsb2FkL2Rpc3QvXCIsIFwiaW5kZXguanNcIik7XG4vKipcbiAqIGNyZWF0ZSBtYWluIHdpbmRvdyB0byBtYW5hZ2VyIHRhYiB3aW5kb3dzXG4gKiBodHRwczovL3d3dy5lbGVjdHJvbmpzLm9yZy9kb2NzL2xhdGVzdC9hcGkvYnJvd3Nlci12aWV3XG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZU1haW5XaW5kb3coKSB7XG4gIGlmIChtYWluV2luZG93KSB7XG4gICAgcmV0dXJuIG1haW5XaW5kb3c7XG4gIH1cbiAgY29uc3Qgd2luZG93ID0gbmV3IEJyb3dzZXJXaW5kb3coe1xuICAgIHNob3c6IGZhbHNlLFxuICAgIHdpZHRoOiA4MDAsXG4gICAgaGVpZ2h0OiA2MDAsXG4gICAgYmFja2dyb3VuZENvbG9yOiBpc01hY09TID8gXCIjRDFENURCXCIgOiBcIiM2QjcyODBcIixcbiAgICB0aXRsZUJhclN0eWxlOiBpc01hY09TID8gJ2hpZGRlbkluc2V0JyA6ICdkZWZhdWx0JyxcbiAgICBmcmFtZTogaXNNYWNPUyxcbiAgICB3ZWJQcmVmZXJlbmNlczoge1xuICAgICAgZGV2VG9vbHM6IGlzRGV2LFxuICAgICAgLy8gZW5hYmxlUmVtb3RlTW9kdWxlOiBmYWxzZSxcbiAgICAgIGNvbnRleHRJc29sYXRpb246IHRydWUsXG4gICAgICBub2RlSW50ZWdyYXRpb246IGZhbHNlLFxuICAgICAgcHJlbG9hZDogcHJlbG9hZF9qc19wYXRoLFxuICAgICAgZGlzYWJsZURpYWxvZ3M6IGZhbHNlLFxuICAgICAgc2FmZURpYWxvZ3M6IHRydWUsXG4gICAgICBlbmFibGVXZWJTUUw6IGZhbHNlLFxuICAgIH0sXG4gIH0pO1xuXG4gIG1haW5XaW5kb3cgPSB3aW5kb3c7XG5cbiAgaWYgKGlzRGV2KSB7XG4gICAgbWFpbldpbmRvdy53ZWJDb250ZW50cy5vcGVuRGV2VG9vbHMoeyBtb2RlOiAnZGV0YWNoJyB9KVxuICB9XG5cbiAgd2luZG93Lm9uKCdjbG9zZWQnLCAoKSA9PiB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIG1haW5XaW5kb3cgPSBudWxsO1xuICAgIGxpc3RXaW5kb3cuZm9yRWFjaChpbnN0YW5jZSA9PiB7XG4gICAgICAoaW5zdGFuY2Uud2luZG93LndlYkNvbnRlbnRzIGFzIGFueSk/LmRlc3Ryb3koKSAvLyBUT0RPOiBlbGVjdHJvbiBoYXZlbid0IG1ha2UgZG9jdW1lbnQgZm9yIGl0LiBSZWY6IGh0dHBzOi8vZ2l0aHViLmNvbS9lbGVjdHJvbi9lbGVjdHJvbi9pc3N1ZXMvMjY5MjlcbiAgICB9KTtcbiAgICBsaXN0V2luZG93ID0gW107XG4gIH0pXG5cbiAgaWYgKGlzRGV2KSB7XG4gICAgd2luZG93LmxvYWRVUkwoYCR7ZGVmYXVsdFdpbmRvd1VybH0vdGFic2ApO1xuICB9IGVsc2Uge1xuICAgIC8vIFRPRE86IFdoYXQgaWYgSSBuZWVkIHRvIGxvYWQgdGhlIHRhYnMuaHRtbCBmaWxlXG4gICAgd2luZG93LmxvYWRVUkwoXCJhcHA6Ly8tL3RhYnNcIik7XG4gIH1cblxuICAvLyB3aW5kb3cubWF4aW1pemUoKTtcbiAgd2luZG93LnNob3coKTtcblxuICBjb25zdCB3aW5kb3dWaWV3ID0gYXdhaXQgY3JlYXRlV2luZG93KGRlZmF1bHRXaW5kb3dVcmwrXCIvXCIpO1xuICBzZXRUYWIod2luZG93Vmlldyk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVXaW5kb3coaHJlZjogc3RyaW5nKSB7XG4gIC8vIENyZWF0ZSB0aGUgYnJvd3NlciB2aWV3LlxuICBjb25zdCB3aW5kb3cgPSBuZXcgQnJvd3NlclZpZXcoe1xuICAgIHdlYlByZWZlcmVuY2VzOiB7XG4gICAgICBkZXZUb29sczogaXNEZXYsXG4gICAgICBjb250ZXh0SXNvbGF0aW9uOiB0cnVlLFxuICAgICAgbm9kZUludGVncmF0aW9uOiBmYWxzZSxcbiAgICAgIHByZWxvYWQ6IHByZWxvYWRfanNfcGF0aCxcbiAgICAgIGRpc2FibGVEaWFsb2dzOiBmYWxzZSxcbiAgICAgIHNhZmVEaWFsb2dzOiB0cnVlLFxuICAgICAgZW5hYmxlV2ViU1FMOiBmYWxzZSxcbiAgICB9LFxuICB9KTtcblxuICB3aW5kb3cud2ViQ29udGVudHMubG9hZFVSTChocmVmKTtcblxuICBpZiAoaXNEZXYpIHtcbiAgICB3aW5kb3cud2ViQ29udGVudHMub3BlbkRldlRvb2xzKHsgbW9kZTogJ2RldGFjaCcgfSlcbiAgfVxuXG4gIHdpbmRvdy53ZWJDb250ZW50cy5vbihcImRpZC1maW5pc2gtbG9hZFwiLCAoKSA9PiB7XG4gICAgLy8gd2luZG93LndlYkNvbnRlbnRzLnNlbmQoXCJzZXQtc29ja2V0XCIsIHt9KTtcbiAgfSk7XG5cbiAgbGlzdFdpbmRvdy5wdXNoKHtcbiAgICB3aW5kb3csXG4gICAgbmFtZTogYFRhYi0ke3V1aWQoKX1gXG4gIH0pO1xuXG4gIG1haW5XaW5kb3chLndlYkNvbnRlbnRzLnNlbmQoJ3RhYkNoYW5nZScsIGdldFRhYkRhdGEoKSk7XG4gIHJldHVybiB3aW5kb3c7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFiRGF0YSgpOiBUYWJMaXN0e1xuICByZXR1cm4ge1xuICAgIHRhYnM6IGxpc3RXaW5kb3cubWFwKChpbnN0YW5jZSkgPT4gaW5zdGFuY2UubmFtZSksXG4gICAgYWN0aXZlOiBsaXN0V2luZG93LmZpbmQoKGluc3RhbmNlKSA9PiBpbnN0YW5jZS53aW5kb3cud2ViQ29udGVudHMuaWQgPT09IG1haW5XaW5kb3chLmdldEJyb3dzZXJWaWV3KCk/LndlYkNvbnRlbnRzPy5pZCk/Lm5hbWUgfHwgJydcbiAgfVxufVxuXG4vLyBTZXQgYWN0aXZlIHRhYlxuZXhwb3J0IGZ1bmN0aW9uIHNldFRhYihpbnN0YW5jZTogQnJvd3NlclZpZXcpIHtcbiAgbWFpbldpbmRvdyEuc2V0QnJvd3NlclZpZXcoaW5zdGFuY2UpO1xuICBpbnN0YW5jZS5zZXRCb3VuZHMoeyB4OiAwLCB5OiAzNiwgd2lkdGg6IG1haW5XaW5kb3chLmdldEJvdW5kcygpLndpZHRoLCBoZWlnaHQ6IG1haW5XaW5kb3chLmdldEJvdW5kcygpLmhlaWdodCAtIDM2IH0pXG4gIGluc3RhbmNlLnNldEF1dG9SZXNpemUoeyB3aWR0aDogdHJ1ZSwgaGVpZ2h0OiB0cnVlLCBob3Jpem9udGFsOiBmYWxzZSwgdmVydGljYWw6IGZhbHNlIH0pO1xuICBtYWluV2luZG93IS53ZWJDb250ZW50cy5zZW5kKCd0YWJDaGFuZ2UnLCBnZXRUYWJEYXRhKCkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbmV3VGFiKCl7XG4gIGNvbnN0IHdpbmRvdyA9IGF3YWl0IGNyZWF0ZVdpbmRvdyhtYWluV2luZG93LmdldEJyb3dzZXJWaWV3KCk/LndlYkNvbnRlbnRzLmdldFVSTCgpISk7XG4gIHNldFRhYih3aW5kb3cpO1xufVxuXG4vKipcbiAqIFJlc3RvcmUgZXhpc3RpbmcgQnJvd3NlcldpbmRvdyBvciBDcmVhdGUgbmV3IEJyb3dzZXJXaW5kb3dcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc3RvcmVPckNyZWF0ZVdpbmRvdygpIHtcbiAgbGV0IHdpbmRvdyA9IG1haW5XaW5kb3c7XG5cbiAgaWYgKHdpbmRvdyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYXdhaXQgY3JlYXRlTWFpbldpbmRvdygpO1xuICAgIHdpbmRvdyA9IG1haW5XaW5kb3c7XG4gIH1cblxuICBpZiAod2luZG93LmlzTWluaW1pemVkKCkpIHtcbiAgICB3aW5kb3cucmVzdG9yZSgpO1xuICB9XG5cbiAgd2luZG93LmZvY3VzKCk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gc2NvcGVGYWN0b3J5O1xuXG5mdW5jdGlvbiBzY29wZUZhY3RvcnkobG9nZ2VyKSB7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhzY29wZSwge1xuICAgIGRlZmF1bHRMYWJlbDogeyB2YWx1ZTogJycsIHdyaXRhYmxlOiB0cnVlIH0sXG4gICAgbGFiZWxQYWRkaW5nOiB7IHZhbHVlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9LFxuICAgIG1heExhYmVsTGVuZ3RoOiB7IHZhbHVlOiAwLCB3cml0YWJsZTogdHJ1ZSB9LFxuICAgIGxhYmVsTGVuZ3RoOiB7XG4gICAgICBnZXQoKSB7XG4gICAgICAgIHN3aXRjaCAodHlwZW9mIHNjb3BlLmxhYmVsUGFkZGluZykge1xuICAgICAgICAgIGNhc2UgJ2Jvb2xlYW4nOiByZXR1cm4gc2NvcGUubGFiZWxQYWRkaW5nID8gc2NvcGUubWF4TGFiZWxMZW5ndGggOiAwO1xuICAgICAgICAgIGNhc2UgJ251bWJlcic6IHJldHVybiBzY29wZS5sYWJlbFBhZGRpbmc7XG4gICAgICAgICAgZGVmYXVsdDogcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgZnVuY3Rpb24gc2NvcGUobGFiZWwpIHtcbiAgICBzY29wZS5tYXhMYWJlbExlbmd0aCA9IE1hdGgubWF4KHNjb3BlLm1heExhYmVsTGVuZ3RoLCBsYWJlbC5sZW5ndGgpO1xuXG4gICAgY29uc3QgbmV3U2NvcGUgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGxldmVsIG9mIFsuLi5sb2dnZXIubGV2ZWxzLCAnbG9nJ10pIHtcbiAgICAgIG5ld1Njb3BlW2xldmVsXSA9ICguLi5kKSA9PiBsb2dnZXIubG9nRGF0YShkLCB7IGxldmVsLCBzY29wZTogbGFiZWwgfSk7XG4gICAgfVxuICAgIHJldHVybiBuZXdTY29wZTtcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBzY29wZUZhY3RvcnkgPSByZXF1aXJlKCcuL3Njb3BlJyk7XG5cbi8qKlxuICogQHByb3BlcnR5IHtGdW5jdGlvbn0gZXJyb3JcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IHdhcm5cbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGluZm9cbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IHZlcmJvc2VcbiAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGRlYnVnXG4gKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBzaWxseVxuICovXG5jbGFzcyBMb2dnZXIge1xuICBzdGF0aWMgaW5zdGFuY2VzID0ge307XG5cbiAgZXJyb3JIYW5kbGVyID0gbnVsbDtcbiAgZXZlbnRMb2dnZXIgPSBudWxsO1xuICBmdW5jdGlvbnMgPSB7fTtcbiAgaG9va3MgPSBbXTtcbiAgaXNEZXYgPSBmYWxzZTtcbiAgbGV2ZWxzID0gbnVsbDtcbiAgbG9nSWQgPSBudWxsO1xuICBzY29wZSA9IG51bGw7XG4gIHRyYW5zcG9ydHMgPSB7fTtcbiAgdmFyaWFibGVzID0ge307XG5cbiAgY29uc3RydWN0b3Ioe1xuICAgIGFsbG93VW5rbm93bkxldmVsID0gZmFsc2UsXG4gICAgZXJyb3JIYW5kbGVyLFxuICAgIGV2ZW50TG9nZ2VyLFxuICAgIGluaXRpYWxpemVGbixcbiAgICBpc0RldiA9IGZhbHNlLFxuICAgIGxldmVscyA9IFsnZXJyb3InLCAnd2FybicsICdpbmZvJywgJ3ZlcmJvc2UnLCAnZGVidWcnLCAnc2lsbHknXSxcbiAgICBsb2dJZCxcbiAgICB0cmFuc3BvcnRGYWN0b3JpZXMgPSB7fSxcbiAgICB2YXJpYWJsZXMsXG4gIH0gPSB7fSkge1xuICAgIHRoaXMuYWRkTGV2ZWwgPSB0aGlzLmFkZExldmVsLmJpbmQodGhpcyk7XG4gICAgdGhpcy5jcmVhdGUgPSB0aGlzLmNyZWF0ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMubG9nRGF0YSA9IHRoaXMubG9nRGF0YS5iaW5kKHRoaXMpO1xuICAgIHRoaXMucHJvY2Vzc01lc3NhZ2UgPSB0aGlzLnByb2Nlc3NNZXNzYWdlLmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLmFsbG93VW5rbm93bkxldmVsID0gYWxsb3dVbmtub3duTGV2ZWw7XG4gICAgdGhpcy5pbml0aWFsaXplRm4gPSBpbml0aWFsaXplRm47XG4gICAgdGhpcy5pc0RldiA9IGlzRGV2O1xuICAgIHRoaXMubGV2ZWxzID0gbGV2ZWxzO1xuICAgIHRoaXMubG9nSWQgPSBsb2dJZDtcbiAgICB0aGlzLnRyYW5zcG9ydEZhY3RvcmllcyA9IHRyYW5zcG9ydEZhY3RvcmllcztcbiAgICB0aGlzLnZhcmlhYmxlcyA9IHZhcmlhYmxlcyB8fCB7fTtcbiAgICB0aGlzLnNjb3BlID0gc2NvcGVGYWN0b3J5KHRoaXMpO1xuXG4gICAgdGhpcy5hZGRMZXZlbCgnbG9nJywgZmFsc2UpO1xuICAgIGZvciAoY29uc3QgbmFtZSBvZiB0aGlzLmxldmVscykge1xuICAgICAgdGhpcy5hZGRMZXZlbChuYW1lLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgdGhpcy5lcnJvckhhbmRsZXIgPSBlcnJvckhhbmRsZXI7XG4gICAgZXJyb3JIYW5kbGVyPy5zZXRPcHRpb25zKHsgbG9nRm46IHRoaXMuZXJyb3IgfSk7XG5cbiAgICB0aGlzLmV2ZW50TG9nZ2VyID0gZXZlbnRMb2dnZXI7XG4gICAgZXZlbnRMb2dnZXI/LnNldE9wdGlvbnMoeyBsb2dnZXI6IHRoaXMgfSk7XG5cbiAgICBmb3IgKGNvbnN0IFtuYW1lLCBmYWN0b3J5XSBvZiBPYmplY3QuZW50cmllcyh0cmFuc3BvcnRGYWN0b3JpZXMpKSB7XG4gICAgICB0aGlzLnRyYW5zcG9ydHNbbmFtZV0gPSBmYWN0b3J5KHRoaXMpO1xuICAgIH1cblxuICAgIExvZ2dlci5pbnN0YW5jZXNbbG9nSWRdID0gdGhpcztcbiAgfVxuXG4gIHN0YXRpYyBnZXRJbnN0YW5jZSh7IGxvZ0lkIH0pIHtcbiAgICByZXR1cm4gdGhpcy5pbnN0YW5jZXNbbG9nSWRdIHx8IHRoaXMuaW5zdGFuY2VzLmRlZmF1bHQ7XG4gIH1cblxuICBhZGRMZXZlbChsZXZlbCwgaW5kZXggPSB0aGlzLmxldmVscy5sZW5ndGgpIHtcbiAgICBpZiAoaW5kZXggIT09IGZhbHNlKSB7XG4gICAgICB0aGlzLmxldmVscy5zcGxpY2UoaW5kZXgsIDAsIGxldmVsKTtcbiAgICB9XG5cbiAgICB0aGlzW2xldmVsXSA9ICguLi5hcmdzKSA9PiB0aGlzLmxvZ0RhdGEoYXJncywgeyBsZXZlbCB9KTtcbiAgICB0aGlzLmZ1bmN0aW9uc1tsZXZlbF0gPSB0aGlzW2xldmVsXTtcbiAgfVxuXG4gIGNhdGNoRXJyb3JzKG9wdGlvbnMpIHtcbiAgICB0aGlzLnByb2Nlc3NNZXNzYWdlKFxuICAgICAge1xuICAgICAgICBkYXRhOiBbJ2xvZy5jYXRjaEVycm9ycyBpcyBkZXByZWNhdGVkLiBVc2UgbG9nLmVycm9ySGFuZGxlciBpbnN0ZWFkJ10sXG4gICAgICAgIGxldmVsOiAnd2FybicsXG4gICAgICB9LFxuICAgICAgeyB0cmFuc3BvcnRzOiBbJ2NvbnNvbGUnXSB9LFxuICAgICk7XG4gICAgcmV0dXJuIHRoaXMuZXJyb3JIYW5kbGVyLnN0YXJ0Q2F0Y2hpbmcob3B0aW9ucyk7XG4gIH1cblxuICBjcmVhdGUob3B0aW9ucykge1xuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIG9wdGlvbnMgPSB7IGxvZ0lkOiBvcHRpb25zIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBMb2dnZXIoe1xuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIGVycm9ySGFuZGxlcjogdGhpcy5lcnJvckhhbmRsZXIsXG4gICAgICBpbml0aWFsaXplRm46IHRoaXMuaW5pdGlhbGl6ZUZuLFxuICAgICAgaXNEZXY6IHRoaXMuaXNEZXYsXG4gICAgICB0cmFuc3BvcnRGYWN0b3JpZXM6IHRoaXMudHJhbnNwb3J0RmFjdG9yaWVzLFxuICAgICAgdmFyaWFibGVzOiB7IC4uLnRoaXMudmFyaWFibGVzIH0sXG4gICAgfSk7XG4gIH1cblxuICBjb21wYXJlTGV2ZWxzKHBhc3NMZXZlbCwgY2hlY2tMZXZlbCwgbGV2ZWxzID0gdGhpcy5sZXZlbHMpIHtcbiAgICBjb25zdCBwYXNzID0gbGV2ZWxzLmluZGV4T2YocGFzc0xldmVsKTtcbiAgICBjb25zdCBjaGVjayA9IGxldmVscy5pbmRleE9mKGNoZWNrTGV2ZWwpO1xuICAgIGlmIChjaGVjayA9PT0gLTEgfHwgcGFzcyA9PT0gLTEpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBjaGVjayA8PSBwYXNzO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSh7IHByZWxvYWQgPSB0cnVlLCBzcHlSZW5kZXJlckNvbnNvbGUgPSBmYWxzZSB9ID0ge30pIHtcbiAgICB0aGlzLmluaXRpYWxpemVGbih7IGxvZ2dlcjogdGhpcywgcHJlbG9hZCwgc3B5UmVuZGVyZXJDb25zb2xlIH0pO1xuICB9XG5cbiAgbG9nRGF0YShkYXRhLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLnByb2Nlc3NNZXNzYWdlKHsgZGF0YSwgLi4ub3B0aW9ucyB9KTtcbiAgfVxuXG4gIHByb2Nlc3NNZXNzYWdlKG1lc3NhZ2UsIHsgdHJhbnNwb3J0cyA9IHRoaXMudHJhbnNwb3J0cyB9ID0ge30pIHtcbiAgICBpZiAobWVzc2FnZS5jbWQgPT09ICdlcnJvckhhbmRsZXInKSB7XG4gICAgICB0aGlzLmVycm9ySGFuZGxlci5oYW5kbGUobWVzc2FnZS5lcnJvciwge1xuICAgICAgICBlcnJvck5hbWU6IG1lc3NhZ2UuZXJyb3JOYW1lLFxuICAgICAgICBwcm9jZXNzVHlwZTogJ3JlbmRlcmVyJyxcbiAgICAgICAgc2hvd0RpYWxvZzogQm9vbGVhbihtZXNzYWdlLnNob3dEaWFsb2cpLFxuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGxldmVsID0gbWVzc2FnZS5sZXZlbDtcbiAgICBpZiAoIXRoaXMuYWxsb3dVbmtub3duTGV2ZWwpIHtcbiAgICAgIGxldmVsID0gdGhpcy5sZXZlbHMuaW5jbHVkZXMobWVzc2FnZS5sZXZlbCkgPyBtZXNzYWdlLmxldmVsIDogJ2luZm8nO1xuICAgIH1cblxuICAgIGNvbnN0IG5vcm1hbGl6ZWRNZXNzYWdlID0ge1xuICAgICAgZGF0ZTogbmV3IERhdGUoKSxcbiAgICAgIC4uLm1lc3NhZ2UsXG4gICAgICBsZXZlbCxcbiAgICAgIHZhcmlhYmxlczoge1xuICAgICAgICAuLi50aGlzLnZhcmlhYmxlcyxcbiAgICAgICAgLi4ubWVzc2FnZS52YXJpYWJsZXMsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICBmb3IgKGNvbnN0IFt0cmFuc05hbWUsIHRyYW5zRm5dIG9mIHRoaXMudHJhbnNwb3J0RW50cmllcyh0cmFuc3BvcnRzKSkge1xuICAgICAgaWYgKHR5cGVvZiB0cmFuc0ZuICE9PSAnZnVuY3Rpb24nIHx8IHRyYW5zRm4ubGV2ZWwgPT09IGZhbHNlKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuY29tcGFyZUxldmVscyh0cmFuc0ZuLmxldmVsLCBtZXNzYWdlLmxldmVsKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGFycm93LWJvZHktc3R5bGVcbiAgICAgICAgY29uc3QgdHJhbnNmb3JtZWRNc2cgPSB0aGlzLmhvb2tzLnJlZHVjZSgobXNnLCBob29rKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG1zZyA/IGhvb2sobXNnLCB0cmFuc0ZuLCB0cmFuc05hbWUpIDogbXNnO1xuICAgICAgICB9LCBub3JtYWxpemVkTWVzc2FnZSk7XG5cbiAgICAgICAgaWYgKHRyYW5zZm9ybWVkTXNnKSB7XG4gICAgICAgICAgdHJhbnNGbih7IC4uLnRyYW5zZm9ybWVkTXNnLCBkYXRhOiBbLi4udHJhbnNmb3JtZWRNc2cuZGF0YV0gfSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdGhpcy5wcm9jZXNzSW50ZXJuYWxFcnJvckZuKGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByb2Nlc3NJbnRlcm5hbEVycm9yRm4oX2UpIHtcbiAgICAvLyBEbyBub3RoaW5nIGJ5IGRlZmF1bHRcbiAgfVxuXG4gIHRyYW5zcG9ydEVudHJpZXModHJhbnNwb3J0cyA9IHRoaXMudHJhbnNwb3J0cykge1xuICAgIGNvbnN0IHRyYW5zcG9ydEFycmF5ID0gQXJyYXkuaXNBcnJheSh0cmFuc3BvcnRzKVxuICAgICAgPyB0cmFuc3BvcnRzXG4gICAgICA6IE9iamVjdC5lbnRyaWVzKHRyYW5zcG9ydHMpO1xuXG4gICAgcmV0dXJuIHRyYW5zcG9ydEFycmF5XG4gICAgICAubWFwKChpdGVtKSA9PiB7XG4gICAgICAgIHN3aXRjaCAodHlwZW9mIGl0ZW0pIHtcbiAgICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0c1tpdGVtXSA/IFtpdGVtLCB0aGlzLnRyYW5zcG9ydHNbaXRlbV1dIDogbnVsbDtcbiAgICAgICAgICBjYXNlICdmdW5jdGlvbic6XG4gICAgICAgICAgICByZXR1cm4gW2l0ZW0ubmFtZSwgaXRlbV07XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KGl0ZW0pID8gaXRlbSA6IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuZmlsdGVyKEJvb2xlYW4pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTG9nZ2VyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuY29uc3QgY29uc29sZUVycm9yID0gY29uc29sZS5lcnJvcjtcblxuY2xhc3MgUmVuZGVyZXJFcnJvckhhbmRsZXIge1xuICBsb2dGbiA9IG51bGw7XG4gIG9uRXJyb3IgPSBudWxsO1xuICBzaG93RGlhbG9nID0gZmFsc2U7XG4gIHByZXZlbnREZWZhdWx0ID0gdHJ1ZTtcblxuICBjb25zdHJ1Y3Rvcih7IGxvZ0ZuID0gbnVsbCB9ID0ge30pIHtcbiAgICB0aGlzLmhhbmRsZUVycm9yID0gdGhpcy5oYW5kbGVFcnJvci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuaGFuZGxlUmVqZWN0aW9uID0gdGhpcy5oYW5kbGVSZWplY3Rpb24uYmluZCh0aGlzKTtcbiAgICB0aGlzLnN0YXJ0Q2F0Y2hpbmcgPSB0aGlzLnN0YXJ0Q2F0Y2hpbmcuYmluZCh0aGlzKTtcbiAgICB0aGlzLmxvZ0ZuID0gbG9nRm47XG4gIH1cblxuICBoYW5kbGUoZXJyb3IsIHtcbiAgICBsb2dGbiA9IHRoaXMubG9nRm4sXG4gICAgZXJyb3JOYW1lID0gJycsXG4gICAgb25FcnJvciA9IHRoaXMub25FcnJvcixcbiAgICBzaG93RGlhbG9nID0gdGhpcy5zaG93RGlhbG9nLFxuICB9ID0ge30pIHtcbiAgICB0cnkge1xuICAgICAgaWYgKG9uRXJyb3I/Lih7IGVycm9yLCBlcnJvck5hbWUsIHByb2Nlc3NUeXBlOiAncmVuZGVyZXInIH0pICE9PSBmYWxzZSkge1xuICAgICAgICBsb2dGbih7IGVycm9yLCBlcnJvck5hbWUsIHNob3dEaWFsb2cgfSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICBjb25zb2xlRXJyb3IoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIHNldE9wdGlvbnMoeyBsb2dGbiwgb25FcnJvciwgcHJldmVudERlZmF1bHQsIHNob3dEaWFsb2cgfSkge1xuICAgIGlmICh0eXBlb2YgbG9nRm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMubG9nRm4gPSBsb2dGbjtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG9uRXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMub25FcnJvciA9IG9uRXJyb3I7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBwcmV2ZW50RGVmYXVsdCA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICB0aGlzLnByZXZlbnREZWZhdWx0ID0gcHJldmVudERlZmF1bHQ7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBzaG93RGlhbG9nID09PSAnYm9vbGVhbicpIHtcbiAgICAgIHRoaXMuc2hvd0RpYWxvZyA9IHNob3dEaWFsb2c7XG4gICAgfVxuICB9XG5cbiAgc3RhcnRDYXRjaGluZyh7IG9uRXJyb3IsIHNob3dEaWFsb2cgfSA9IHt9KSB7XG4gICAgaWYgKHRoaXMuaXNBY3RpdmUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmlzQWN0aXZlID0gdHJ1ZTtcbiAgICB0aGlzLnNldE9wdGlvbnMoeyBvbkVycm9yLCBzaG93RGlhbG9nIH0pO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLnByZXZlbnREZWZhdWx0ICYmIGV2ZW50LnByZXZlbnREZWZhdWx0Py4oKTtcbiAgICAgIHRoaXMuaGFuZGxlRXJyb3IoZXZlbnQuZXJyb3IgfHwgZXZlbnQpO1xuICAgIH0pO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd1bmhhbmRsZWRyZWplY3Rpb24nLCAoZXZlbnQpID0+IHtcbiAgICAgIHRoaXMucHJldmVudERlZmF1bHQgJiYgZXZlbnQucHJldmVudERlZmF1bHQ/LigpO1xuICAgICAgdGhpcy5oYW5kbGVSZWplY3Rpb24oZXZlbnQucmVhc29uIHx8IGV2ZW50KTtcbiAgICB9KTtcbiAgfVxuXG4gIGhhbmRsZUVycm9yKGVycm9yKSB7XG4gICAgdGhpcy5oYW5kbGUoZXJyb3IsIHsgZXJyb3JOYW1lOiAnVW5oYW5kbGVkJyB9KTtcbiAgfVxuXG4gIGhhbmRsZVJlamVjdGlvbihyZWFzb24pIHtcbiAgICBjb25zdCBlcnJvciA9IHJlYXNvbiBpbnN0YW5jZW9mIEVycm9yXG4gICAgICA/IHJlYXNvblxuICAgICAgOiBuZXcgRXJyb3IoSlNPTi5zdHJpbmdpZnkocmVhc29uKSk7XG4gICAgdGhpcy5oYW5kbGUoZXJyb3IsIHsgZXJyb3JOYW1lOiAnVW5oYW5kbGVkIHJlamVjdGlvbicgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSZW5kZXJlckVycm9ySGFuZGxlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnNvbGVUcmFuc3BvcnRSZW5kZXJlckZhY3Rvcnk7XG5cbmNvbnN0IGNvbnNvbGVNZXRob2RzID0ge1xuICBlcnJvcjogY29uc29sZS5lcnJvcixcbiAgd2FybjogY29uc29sZS53YXJuLFxuICBpbmZvOiBjb25zb2xlLmluZm8sXG4gIHZlcmJvc2U6IGNvbnNvbGUuaW5mbyxcbiAgZGVidWc6IGNvbnNvbGUuZGVidWcsXG4gIHNpbGx5OiBjb25zb2xlLmRlYnVnLFxuICBsb2c6IGNvbnNvbGUubG9nLFxufTtcblxuZnVuY3Rpb24gY29uc29sZVRyYW5zcG9ydFJlbmRlcmVyRmFjdG9yeShsb2dnZXIpIHtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24odHJhbnNwb3J0LCB7XG4gICAgZm9ybWF0OiAne2h9OntpfTp7c30ue21zfXtzY29wZX0g4oC6IHt0ZXh0fScsXG5cbiAgICBmb3JtYXREYXRhRm4oe1xuICAgICAgZGF0YSA9IFtdLFxuICAgICAgZGF0ZSA9IG5ldyBEYXRlKCksXG4gICAgICBmb3JtYXQgPSB0cmFuc3BvcnQuZm9ybWF0LFxuICAgICAgbG9nSWQgPSBsb2dnZXIubG9nSWQsXG4gICAgICBzY29wZSA9IGxvZ2dlci5zY29wZU5hbWUsXG4gICAgICAuLi5tZXNzYWdlXG4gICAgfSkge1xuICAgICAgaWYgKHR5cGVvZiBmb3JtYXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdCh7IC4uLm1lc3NhZ2UsIGRhdGEsIGRhdGUsIGxvZ0lkLCBzY29wZSB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBmb3JtYXQgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgfVxuXG4gICAgICBkYXRhLnVuc2hpZnQoZm9ybWF0KTtcblxuICAgICAgLy8gQ29uY2F0ZW5hdGUgZmlyc3QgdHdvIGRhdGEgaXRlbXMgdG8gc3VwcG9ydCBwcmludGYtbGlrZSB0ZW1wbGF0ZXNcbiAgICAgIGlmICh0eXBlb2YgZGF0YVsxXSA9PT0gJ3N0cmluZycgJiYgZGF0YVsxXS5tYXRjaCgvJVsxY2RmaU9vc10vKSkge1xuICAgICAgICBkYXRhID0gW2Ake2RhdGFbMF19ICR7ZGF0YVsxXX1gLCAuLi5kYXRhLnNsaWNlKDIpXTtcbiAgICAgIH1cblxuICAgICAgZGF0YVswXSA9IGRhdGFbMF1cbiAgICAgICAgLnJlcGxhY2UoL1xceyhcXHcrKX0vZywgKHN1YnN0cmluZywgbmFtZSkgPT4ge1xuICAgICAgICAgIHN3aXRjaCAobmFtZSkge1xuICAgICAgICAgICAgY2FzZSAnbGV2ZWwnOiByZXR1cm4gbWVzc2FnZS5sZXZlbDtcbiAgICAgICAgICAgIGNhc2UgJ2xvZ0lkJzogcmV0dXJuIGxvZ0lkO1xuICAgICAgICAgICAgY2FzZSAnc2NvcGUnOiByZXR1cm4gc2NvcGUgPyBgICgke3Njb3BlfSlgIDogJyc7XG4gICAgICAgICAgICBjYXNlICd0ZXh0JzogcmV0dXJuICcnO1xuXG4gICAgICAgICAgICBjYXNlICd5JzogcmV0dXJuIGRhdGUuZ2V0RnVsbFllYXIoKS50b1N0cmluZygxMCk7XG4gICAgICAgICAgICBjYXNlICdtJzogcmV0dXJuIChkYXRlLmdldE1vbnRoKCkgKyAxKS50b1N0cmluZygxMClcbiAgICAgICAgICAgICAgLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgICAgICAgICBjYXNlICdkJzogcmV0dXJuIGRhdGUuZ2V0RGF0ZSgpLnRvU3RyaW5nKDEwKS5wYWRTdGFydCgyLCAnMCcpO1xuICAgICAgICAgICAgY2FzZSAnaCc6IHJldHVybiBkYXRlLmdldEhvdXJzKCkudG9TdHJpbmcoMTApLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgICAgICAgICBjYXNlICdpJzogcmV0dXJuIGRhdGUuZ2V0TWludXRlcygpLnRvU3RyaW5nKDEwKS5wYWRTdGFydCgyLCAnMCcpO1xuICAgICAgICAgICAgY2FzZSAncyc6IHJldHVybiBkYXRlLmdldFNlY29uZHMoKS50b1N0cmluZygxMCkucGFkU3RhcnQoMiwgJzAnKTtcbiAgICAgICAgICAgIGNhc2UgJ21zJzogcmV0dXJuIGRhdGUuZ2V0TWlsbGlzZWNvbmRzKCkudG9TdHJpbmcoMTApXG4gICAgICAgICAgICAgIC5wYWRTdGFydCgzLCAnMCcpO1xuICAgICAgICAgICAgY2FzZSAnaXNvJzogcmV0dXJuIGRhdGUudG9JU09TdHJpbmcoKTtcblxuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZS52YXJpYWJsZXM/LltuYW1lXSB8fCBzdWJzdHJpbmc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAudHJpbSgpO1xuXG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9LFxuXG4gICAgd3JpdGVGbih7IG1lc3NhZ2U6IHsgbGV2ZWwsIGRhdGEgfSB9KSB7XG4gICAgICBjb25zdCBjb25zb2xlTG9nRm4gPSBjb25zb2xlTWV0aG9kc1tsZXZlbF0gfHwgY29uc29sZU1ldGhvZHMuaW5mbztcblxuICAgICAgLy8gbWFrZSBhbiBlbXB0eSBjYWxsIHN0YWNrXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IGNvbnNvbGVMb2dGbiguLi5kYXRhKSk7XG4gICAgfSxcblxuICB9KTtcblxuICBmdW5jdGlvbiB0cmFuc3BvcnQobWVzc2FnZSkge1xuICAgIHRyYW5zcG9ydC53cml0ZUZuKHtcbiAgICAgIG1lc3NhZ2U6IHsgLi4ubWVzc2FnZSwgZGF0YTogdHJhbnNwb3J0LmZvcm1hdERhdGFGbihtZXNzYWdlKSB9LFxuICAgIH0pO1xuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gaXBjVHJhbnNwb3J0UmVuZGVyZXJGYWN0b3J5O1xuXG5jb25zdCBSRVNUUklDVEVEX1RZUEVTID0gbmV3IFNldChbUHJvbWlzZSwgV2Vha01hcCwgV2Vha1NldF0pO1xuXG5mdW5jdGlvbiBpcGNUcmFuc3BvcnRSZW5kZXJlckZhY3RvcnkobG9nZ2VyKSB7XG4gIHJldHVybiBPYmplY3QuYXNzaWduKHRyYW5zcG9ydCwge1xuICAgIGRlcHRoOiA1LFxuXG4gICAgc2VyaWFsaXplRm4oZGF0YSwgeyBkZXB0aCA9IDUsIHNlZW4gPSBuZXcgV2Vha1NldCgpIH0gPSB7fSkge1xuICAgICAgaWYgKGRlcHRoIDwgMSkge1xuICAgICAgICByZXR1cm4gYFske3R5cGVvZiBkYXRhfV1gO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2Vlbi5oYXMoZGF0YSkpIHtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICB9XG5cbiAgICAgIGlmIChbJ2Z1bmN0aW9uJywgJ3N5bWJvbCddLmluY2x1ZGVzKHR5cGVvZiBkYXRhKSkge1xuICAgICAgICByZXR1cm4gZGF0YS50b1N0cmluZygpO1xuICAgICAgfVxuXG4gICAgICAvLyBQcmltaXRpdmUgdHlwZXMgKGluY2x1ZGluZyBudWxsIGFuZCB1bmRlZmluZWQpXG4gICAgICBpZiAoT2JqZWN0KGRhdGEpICE9PSBkYXRhKSB7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgfVxuXG4gICAgICAvLyBPYmplY3QgdHlwZXNcblxuICAgICAgaWYgKFJFU1RSSUNURURfVFlQRVMuaGFzKGRhdGEuY29uc3RydWN0b3IpKSB7XG4gICAgICAgIHJldHVybiBgWyR7ZGF0YS5jb25zdHJ1Y3Rvci5uYW1lfV1gO1xuICAgICAgfVxuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgICByZXR1cm4gZGF0YS5tYXAoKGl0ZW0pID0+IHRyYW5zcG9ydC5zZXJpYWxpemVGbihcbiAgICAgICAgICBpdGVtLFxuICAgICAgICAgIHsgbGV2ZWw6IGRlcHRoIC0gMSwgc2VlbiB9LFxuICAgICAgICApKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICByZXR1cm4gZGF0YS5zdGFjaztcbiAgICAgIH1cblxuICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBNYXAoXG4gICAgICAgICAgQXJyYXlcbiAgICAgICAgICAgIC5mcm9tKGRhdGEpXG4gICAgICAgICAgICAubWFwKChba2V5LCB2YWx1ZV0pID0+IFtcbiAgICAgICAgICAgICAgdHJhbnNwb3J0LnNlcmlhbGl6ZUZuKGtleSwgeyBsZXZlbDogZGVwdGggLSAxLCBzZWVuIH0pLFxuICAgICAgICAgICAgICB0cmFuc3BvcnQuc2VyaWFsaXplRm4odmFsdWUsIHsgbGV2ZWw6IGRlcHRoIC0gMSwgc2VlbiB9KSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGF0YSBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICByZXR1cm4gbmV3IFNldChcbiAgICAgICAgICBBcnJheS5mcm9tKGRhdGEpLm1hcChcbiAgICAgICAgICAgICh2YWwpID0+IHRyYW5zcG9ydC5zZXJpYWxpemVGbih2YWwsIHsgbGV2ZWw6IGRlcHRoIC0gMSwgc2VlbiB9KSxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBzZWVuLmFkZChkYXRhKTtcblxuICAgICAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgT2JqZWN0LmVudHJpZXMoZGF0YSkubWFwKFxuICAgICAgICAgIChba2V5LCB2YWx1ZV0pID0+IFtcbiAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgIHRyYW5zcG9ydC5zZXJpYWxpemVGbih2YWx1ZSwgeyBsZXZlbDogZGVwdGggLSAxLCBzZWVuIH0pLFxuICAgICAgICAgIF0sXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH0sXG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHRyYW5zcG9ydChtZXNzYWdlKSB7XG4gICAgaWYgKCF3aW5kb3cuX19lbGVjdHJvbkxvZykge1xuICAgICAgbG9nZ2VyLnByb2Nlc3NNZXNzYWdlKFxuICAgICAgICB7XG4gICAgICAgICAgZGF0YTogWydlbGVjdHJvbi1sb2c6IGxvZ2dlciBpc25cXCd0IGluaXRpYWxpemVkIGluIHRoZSBtYWluIHByb2Nlc3MnXSxcbiAgICAgICAgICBsZXZlbDogJ2Vycm9yJyxcbiAgICAgICAgfSxcbiAgICAgICAgeyB0cmFuc3BvcnRzOiBbJ2NvbnNvbGUnXSB9LFxuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgX19lbGVjdHJvbkxvZy5zZW5kVG9NYWluKHRyYW5zcG9ydC5zZXJpYWxpemVGbihtZXNzYWdlLCB7XG4gICAgICAgIGRlcHRoOiB0cmFuc3BvcnQuZGVwdGgsXG4gICAgICB9KSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nZ2VyLnRyYW5zcG9ydHMuY29uc29sZSh7XG4gICAgICAgIGRhdGE6IFsnZWxlY3Ryb25Mb2cudHJhbnNwb3J0cy5pcGMnLCBlLCAnZGF0YTonLCBtZXNzYWdlLmRhdGFdLFxuICAgICAgICBsZXZlbDogJ2Vycm9yJyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBMb2dnZXIgPSByZXF1aXJlKCcuLi9jb3JlL0xvZ2dlcicpO1xuY29uc3QgUmVuZGVyZXJFcnJvckhhbmRsZXIgPSByZXF1aXJlKCcuL2xpYi9SZW5kZXJlckVycm9ySGFuZGxlcicpO1xuY29uc3QgdHJhbnNwb3J0Q29uc29sZSA9IHJlcXVpcmUoJy4vbGliL3RyYW5zcG9ydHMvY29uc29sZScpO1xuY29uc3QgdHJhbnNwb3J0SXBjID0gcmVxdWlyZSgnLi9saWIvdHJhbnNwb3J0cy9pcGMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVMb2dnZXIoKTtcbm1vZHVsZS5leHBvcnRzLkxvZ2dlciA9IExvZ2dlcjtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBtb2R1bGUuZXhwb3J0cztcblxuZnVuY3Rpb24gY3JlYXRlTG9nZ2VyKCkge1xuICBjb25zdCBsb2dnZXIgPSBuZXcgTG9nZ2VyKHtcbiAgICBhbGxvd1Vua25vd25MZXZlbDogdHJ1ZSxcbiAgICBlcnJvckhhbmRsZXI6IG5ldyBSZW5kZXJlckVycm9ySGFuZGxlcigpLFxuICAgIGluaXRpYWxpemVGbjogKCkgPT4ge30sXG4gICAgbG9nSWQ6ICdkZWZhdWx0JyxcbiAgICB0cmFuc3BvcnRGYWN0b3JpZXM6IHtcbiAgICAgIGNvbnNvbGU6IHRyYW5zcG9ydENvbnNvbGUsXG4gICAgICBpcGM6IHRyYW5zcG9ydElwYyxcbiAgICB9LFxuICAgIHZhcmlhYmxlczoge1xuICAgICAgcHJvY2Vzc1R5cGU6ICdyZW5kZXJlcicsXG4gICAgfSxcbiAgfSk7XG5cbiAgbG9nZ2VyLmVycm9ySGFuZGxlci5zZXRPcHRpb25zKHtcbiAgICBsb2dGbih7IGVycm9yLCBlcnJvck5hbWUsIHNob3dEaWFsb2cgfSkge1xuICAgICAgbG9nZ2VyLnRyYW5zcG9ydHMuY29uc29sZSh7XG4gICAgICAgIGRhdGE6IFtlcnJvck5hbWUsIGVycm9yXS5maWx0ZXIoQm9vbGVhbiksXG4gICAgICAgIGxldmVsOiAnZXJyb3InLFxuICAgICAgfSk7XG4gICAgICBsb2dnZXIudHJhbnNwb3J0cy5pcGMoe1xuICAgICAgICBjbWQ6ICdlcnJvckhhbmRsZXInLFxuICAgICAgICBlcnJvcjoge1xuICAgICAgICAgIGNhdXNlOiBlcnJvcj8uY2F1c2UsXG4gICAgICAgICAgY29kZTogZXJyb3I/LmNvZGUsXG4gICAgICAgICAgbmFtZTogZXJyb3I/Lm5hbWUsXG4gICAgICAgICAgbWVzc2FnZTogZXJyb3I/Lm1lc3NhZ2UsXG4gICAgICAgICAgc3RhY2s6IGVycm9yPy5zdGFjayxcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3JOYW1lLFxuICAgICAgICBsb2dJZDogbG9nZ2VyLmxvZ0lkLFxuICAgICAgICBzaG93RGlhbG9nLFxuICAgICAgfSk7XG4gICAgfSxcbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnN0IHsgY21kLCBsb2dJZCwgLi4ubWVzc2FnZSB9ID0gZXZlbnQuZGF0YSB8fCB7fTtcbiAgICAgIGNvbnN0IGluc3RhbmNlID0gTG9nZ2VyLmdldEluc3RhbmNlKHsgbG9nSWQgfSk7XG5cbiAgICAgIGlmIChjbWQgPT09ICdtZXNzYWdlJykge1xuICAgICAgICBpbnN0YW5jZS5wcm9jZXNzTWVzc2FnZShtZXNzYWdlLCB7IHRyYW5zcG9ydHM6IFsnY29uc29sZSddIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy8gVG8gc3VwcG9ydCBjdXN0b20gbGV2ZWxzXG4gIHJldHVybiBuZXcgUHJveHkobG9nZ2VyLCB7XG4gICAgZ2V0KHRhcmdldCwgcHJvcCkge1xuICAgICAgaWYgKHR5cGVvZiB0YXJnZXRbcHJvcF0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoLi4uZGF0YSkgPT4gbG9nZ2VyLmxvZ0RhdGEoZGF0YSwgeyBsZXZlbDogcHJvcCB9KTtcbiAgICB9LFxuICB9KTtcbn1cbiIsImltcG9ydCBsb2cgZnJvbSAnZWxlY3Ryb24tbG9nJztcbmltcG9ydCB7IGlzRGV2IH0gZnJvbSAnLi91dGlscyc7XG5cbi8vIGxvZ3NcbmlmICghaXNEZXYpIHtcbiAgbG9nLnRyYW5zcG9ydHMuZmlsZS5sZXZlbCA9IFwidmVyYm9zZVwiO1xufVxuXG4vLyBlcnIgaGFuZGxlXG5wcm9jZXNzLm9uKCd1bmhhbmRsZWRSZWplY3Rpb24nLCBsb2cuZXJyb3IpOyIsImltcG9ydCB7IE1lc3NhZ2VCb3hPcHRpb25zLCBhcHAsIGF1dG9VcGRhdGVyLCBkaWFsb2cgfSBmcm9tIFwiZWxlY3Ryb25cIjtcbmltcG9ydCBsb2cgZnJvbSAnZWxlY3Ryb24tbG9nJztcblxuLy8gY29uc3QgaXNNYWNPUyA9IGZhbHNlO1xuaW1wb3J0IGlzRGV2IGZyb20gXCJlbGVjdHJvbi1pcy1kZXZcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0QXV0b1VwZGF0ZXIoKSB7XG4gICAgLy8gSGFuZGxlIGNyZWF0aW5nL3JlbW92aW5nIHNob3J0Y3V0cyBvbiBXaW5kb3dzIHdoZW4gaW5zdGFsbGluZy91bmluc3RhbGxpbmcuXG4gICAgaWYgKHJlcXVpcmUoJ2VsZWN0cm9uLXNxdWlycmVsLXN0YXJ0dXAnKSkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGdsb2JhbC1yZXF1aXJlXG4gICAgICAgIGFwcC5xdWl0KCk7XG4gICAgfVxuICAgIGlmICghaXNEZXYpIHtcbiAgICAgICAgY29uc3Qgc2VydmVyID0gXCJodHRwczovL3JlZmktdXBkYXRlci52ZXJjZWwuYXBwXCI7XG4gICAgICAgIGNvbnN0IGZlZWQgPSBgJHtzZXJ2ZXJ9L3VwZGF0ZS8ke3Byb2Nlc3MucGxhdGZvcm19LyR7YXBwLmdldFZlcnNpb24oKX1gXG4gICAgXG4gICAgICAgIGF1dG9VcGRhdGVyLnNldEZlZWRVUkwoeyB1cmw6IGZlZWQsIHNlcnZlclR5cGU6IFwianNvblwiIH0pXG4gICAgXG4gICAgICAgIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGF1dG9VcGRhdGVyLmNoZWNrRm9yVXBkYXRlcygpXG4gICAgICAgIH0sIDYwMDAwKTtcbiAgICBcbiAgICAgICAgYXV0b1VwZGF0ZXIub24oJ3VwZGF0ZS1kb3dubG9hZGVkJywgKF8sIHJlbGVhc2VOb3RlcywgcmVsZWFzZU5hbWUpID0+IHtcbiAgICAgICAgICAgIGxvZy5kZWJ1ZygnRG93bmxvYWRlZCBuZXcgdXBkYXRlJyk7XG4gICAgICAgICAgICBjb25zdCBkaWFsb2dPcHRzOiBNZXNzYWdlQm94T3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdpbmZvJyxcbiAgICAgICAgICAgIGJ1dHRvbnM6IFsnUmVzdGFydCcsICdMYXRlciddLFxuICAgICAgICAgICAgdGl0bGU6ICdBcHBsaWNhdGlvbiBVcGRhdGUnLFxuICAgICAgICAgICAgbWVzc2FnZTogcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyA/IHJlbGVhc2VOb3RlcyA6IHJlbGVhc2VOYW1lLFxuICAgICAgICAgICAgZGV0YWlsOiAnQSBuZXcgdmVyc2lvbiBoYXMgYmVlbiBkb3dubG9hZGVkLiBSZXN0YXJ0IHRoZSBhcHBsaWNhdGlvbiB0byBhcHBseSB0aGUgdXBkYXRlcy4nXG4gICAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgICBkaWFsb2cuc2hvd01lc3NhZ2VCb3goZGlhbG9nT3B0cykudGhlbigocmV0dXJuVmFsdWUpID0+IHtcbiAgICAgICAgICAgIGlmIChyZXR1cm5WYWx1ZS5yZXNwb25zZSA9PT0gMCkgYXV0b1VwZGF0ZXIucXVpdEFuZEluc3RhbGwoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgXG4gICAgICAgIGF1dG9VcGRhdGVyLm9uKCdlcnJvcicsIG1lc3NhZ2UgPT4ge1xuICAgICAgICAgICAgbG9nLmVycm9yKCdUaGVyZSB3YXMgYSBwcm9ibGVtIHVwZGF0aW5nIHRoZSBhcHBsaWNhdGlvbicpXG4gICAgICAgICAgICBsb2cuZXJyb3IobWVzc2FnZSlcbiAgICAgICAgfSlcbiAgICB9IFxufVxuXG5cbiIsImltcG9ydCB7IElwY01haW5FdmVudCwgaXBjTWFpbiB9IGZyb20gXCJlbGVjdHJvblwiXG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydElQQygpIHtcbiAgLy8gbGlzdGVuIHRoZSBjaGFubmVsIGBtZXNzYWdlYCBhbmQgcmVzZW5kIHRoZSByZWNlaXZlZCBtZXNzYWdlIHRvIHRoZSByZW5kZXJlciBwcm9jZXNzXG4gIGlwY01haW4ub24oJ21lc3NhZ2UnLCAoZXZlbnQ6IElwY01haW5FdmVudCwgbWVzc2FnZTogYW55KSA9PiB7XG4gICAgY29uc29sZS5sb2cobWVzc2FnZSlcbiAgICBzZXRUaW1lb3V0KCgpID0+IGV2ZW50LnNlbmRlci5zZW5kKCdtZXNzYWdlJywgJ2hpIGZyb20gZWxlY3Ryb24nKSwgNTAwKVxuICB9KVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxuICAsIHByZWZpeCA9ICd+JztcblxuLyoqXG4gKiBDb25zdHJ1Y3RvciB0byBjcmVhdGUgYSBzdG9yYWdlIGZvciBvdXIgYEVFYCBvYmplY3RzLlxuICogQW4gYEV2ZW50c2AgaW5zdGFuY2UgaXMgYSBwbGFpbiBvYmplY3Qgd2hvc2UgcHJvcGVydGllcyBhcmUgZXZlbnQgbmFtZXMuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBFdmVudHMoKSB7fVxuXG4vL1xuLy8gV2UgdHJ5IHRvIG5vdCBpbmhlcml0IGZyb20gYE9iamVjdC5wcm90b3R5cGVgLiBJbiBzb21lIGVuZ2luZXMgY3JlYXRpbmcgYW5cbi8vIGluc3RhbmNlIGluIHRoaXMgd2F5IGlzIGZhc3RlciB0aGFuIGNhbGxpbmcgYE9iamVjdC5jcmVhdGUobnVsbClgIGRpcmVjdGx5LlxuLy8gSWYgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIG5vdCBzdXBwb3J0ZWQgd2UgcHJlZml4IHRoZSBldmVudCBuYW1lcyB3aXRoIGFcbi8vIGNoYXJhY3RlciB0byBtYWtlIHN1cmUgdGhhdCB0aGUgYnVpbHQtaW4gb2JqZWN0IHByb3BlcnRpZXMgYXJlIG5vdFxuLy8gb3ZlcnJpZGRlbiBvciB1c2VkIGFzIGFuIGF0dGFjayB2ZWN0b3IuXG4vL1xuaWYgKE9iamVjdC5jcmVhdGUpIHtcbiAgRXZlbnRzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgLy9cbiAgLy8gVGhpcyBoYWNrIGlzIG5lZWRlZCBiZWNhdXNlIHRoZSBgX19wcm90b19fYCBwcm9wZXJ0eSBpcyBzdGlsbCBpbmhlcml0ZWQgaW5cbiAgLy8gc29tZSBvbGQgYnJvd3NlcnMgbGlrZSBBbmRyb2lkIDQsIGlQaG9uZSA1LjEsIE9wZXJhIDExIGFuZCBTYWZhcmkgNS5cbiAgLy9cbiAgaWYgKCFuZXcgRXZlbnRzKCkuX19wcm90b19fKSBwcmVmaXggPSBmYWxzZTtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIHNpbmdsZSBldmVudCBsaXN0ZW5lci5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgZnVuY3Rpb24uXG4gKiBAcGFyYW0geyp9IGNvbnRleHQgVGhlIGNvbnRleHQgdG8gaW52b2tlIHRoZSBsaXN0ZW5lciB3aXRoLlxuICogQHBhcmFtIHtCb29sZWFufSBbb25jZT1mYWxzZV0gU3BlY2lmeSBpZiB0aGUgbGlzdGVuZXIgaXMgYSBvbmUtdGltZSBsaXN0ZW5lci5cbiAqIEBjb25zdHJ1Y3RvclxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gRUUoZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdGhpcy5mbiA9IGZuO1xuICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLm9uY2UgPSBvbmNlIHx8IGZhbHNlO1xufVxuXG4vKipcbiAqIEFkZCBhIGxpc3RlbmVyIGZvciBhIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7RXZlbnRFbWl0dGVyfSBlbWl0dGVyIFJlZmVyZW5jZSB0byB0aGUgYEV2ZW50RW1pdHRlcmAgaW5zdGFuY2UuXG4gKiBAcGFyYW0geyhTdHJpbmd8U3ltYm9sKX0gZXZlbnQgVGhlIGV2ZW50IG5hbWUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgZnVuY3Rpb24uXG4gKiBAcGFyYW0geyp9IGNvbnRleHQgVGhlIGNvbnRleHQgdG8gaW52b2tlIHRoZSBsaXN0ZW5lciB3aXRoLlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIFNwZWNpZnkgaWYgdGhlIGxpc3RlbmVyIGlzIGEgb25lLXRpbWUgbGlzdGVuZXIuXG4gKiBAcmV0dXJucyB7RXZlbnRFbWl0dGVyfVxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gYWRkTGlzdGVuZXIoZW1pdHRlciwgZXZlbnQsIGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gIH1cblxuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgZW1pdHRlciwgb25jZSlcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCFlbWl0dGVyLl9ldmVudHNbZXZ0XSkgZW1pdHRlci5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lciwgZW1pdHRlci5fZXZlbnRzQ291bnQrKztcbiAgZWxzZSBpZiAoIWVtaXR0ZXIuX2V2ZW50c1tldnRdLmZuKSBlbWl0dGVyLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZSBlbWl0dGVyLl9ldmVudHNbZXZ0XSA9IFtlbWl0dGVyLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJdO1xuXG4gIHJldHVybiBlbWl0dGVyO1xufVxuXG4vKipcbiAqIENsZWFyIGV2ZW50IGJ5IG5hbWUuXG4gKlxuICogQHBhcmFtIHtFdmVudEVtaXR0ZXJ9IGVtaXR0ZXIgUmVmZXJlbmNlIHRvIHRoZSBgRXZlbnRFbWl0dGVyYCBpbnN0YW5jZS5cbiAqIEBwYXJhbSB7KFN0cmluZ3xTeW1ib2wpfSBldnQgVGhlIEV2ZW50IG5hbWUuXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBjbGVhckV2ZW50KGVtaXR0ZXIsIGV2dCkge1xuICBpZiAoLS1lbWl0dGVyLl9ldmVudHNDb3VudCA9PT0gMCkgZW1pdHRlci5fZXZlbnRzID0gbmV3IEV2ZW50cygpO1xuICBlbHNlIGRlbGV0ZSBlbWl0dGVyLl9ldmVudHNbZXZ0XTtcbn1cblxuLyoqXG4gKiBNaW5pbWFsIGBFdmVudEVtaXR0ZXJgIGludGVyZmFjZSB0aGF0IGlzIG1vbGRlZCBhZ2FpbnN0IHRoZSBOb2RlLmpzXG4gKiBgRXZlbnRFbWl0dGVyYCBpbnRlcmZhY2UuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcHVibGljXG4gKi9cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gbmV3IEV2ZW50cygpO1xuICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG59XG5cbi8qKlxuICogUmV0dXJuIGFuIGFycmF5IGxpc3RpbmcgdGhlIGV2ZW50cyBmb3Igd2hpY2ggdGhlIGVtaXR0ZXIgaGFzIHJlZ2lzdGVyZWRcbiAqIGxpc3RlbmVycy5cbiAqXG4gKiBAcmV0dXJucyB7QXJyYXl9XG4gKiBAcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZXZlbnROYW1lcyA9IGZ1bmN0aW9uIGV2ZW50TmFtZXMoKSB7XG4gIHZhciBuYW1lcyA9IFtdXG4gICAgLCBldmVudHNcbiAgICAsIG5hbWU7XG5cbiAgaWYgKHRoaXMuX2V2ZW50c0NvdW50ID09PSAwKSByZXR1cm4gbmFtZXM7XG5cbiAgZm9yIChuYW1lIGluIChldmVudHMgPSB0aGlzLl9ldmVudHMpKSB7XG4gICAgaWYgKGhhcy5jYWxsKGV2ZW50cywgbmFtZSkpIG5hbWVzLnB1c2gocHJlZml4ID8gbmFtZS5zbGljZSgxKSA6IG5hbWUpO1xuICB9XG5cbiAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcbiAgICByZXR1cm4gbmFtZXMuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZXZlbnRzKSk7XG4gIH1cblxuICByZXR1cm4gbmFtZXM7XG59O1xuXG4vKipcbiAqIFJldHVybiB0aGUgbGlzdGVuZXJzIHJlZ2lzdGVyZWQgZm9yIGEgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHsoU3RyaW5nfFN5bWJvbCl9IGV2ZW50IFRoZSBldmVudCBuYW1lLlxuICogQHJldHVybnMge0FycmF5fSBUaGUgcmVnaXN0ZXJlZCBsaXN0ZW5lcnMuXG4gKiBAcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKGV2ZW50KSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XG4gICAgLCBoYW5kbGVycyA9IHRoaXMuX2V2ZW50c1tldnRdO1xuXG4gIGlmICghaGFuZGxlcnMpIHJldHVybiBbXTtcbiAgaWYgKGhhbmRsZXJzLmZuKSByZXR1cm4gW2hhbmRsZXJzLmZuXTtcblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGhhbmRsZXJzLmxlbmd0aCwgZWUgPSBuZXcgQXJyYXkobCk7IGkgPCBsOyBpKyspIHtcbiAgICBlZVtpXSA9IGhhbmRsZXJzW2ldLmZuO1xuICB9XG5cbiAgcmV0dXJuIGVlO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIG51bWJlciBvZiBsaXN0ZW5lcnMgbGlzdGVuaW5nIHRvIGEgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHsoU3RyaW5nfFN5bWJvbCl9IGV2ZW50IFRoZSBldmVudCBuYW1lLlxuICogQHJldHVybnMge051bWJlcn0gVGhlIG51bWJlciBvZiBsaXN0ZW5lcnMuXG4gKiBAcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uIGxpc3RlbmVyQ291bnQoZXZlbnQpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRcbiAgICAsIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdO1xuXG4gIGlmICghbGlzdGVuZXJzKSByZXR1cm4gMDtcbiAgaWYgKGxpc3RlbmVycy5mbikgcmV0dXJuIDE7XG4gIHJldHVybiBsaXN0ZW5lcnMubGVuZ3RoO1xufTtcblxuLyoqXG4gKiBDYWxscyBlYWNoIG9mIHRoZSBsaXN0ZW5lcnMgcmVnaXN0ZXJlZCBmb3IgYSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0geyhTdHJpbmd8U3ltYm9sKX0gZXZlbnQgVGhlIGV2ZW50IG5hbWUuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCBlbHNlIGBmYWxzZWAuXG4gKiBAcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXG4gICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgLCBhcmdzXG4gICAgLCBpO1xuXG4gIGlmIChsaXN0ZW5lcnMuZm4pIHtcbiAgICBpZiAobGlzdGVuZXJzLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVycy5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCksIHRydWU7XG4gICAgICBjYXNlIDI6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEpLCB0cnVlO1xuICAgICAgY2FzZSAzOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiksIHRydWU7XG4gICAgICBjYXNlIDQ6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMyksIHRydWU7XG4gICAgICBjYXNlIDU6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQpLCB0cnVlO1xuICAgICAgY2FzZSA2OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0LCBhNSksIHRydWU7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGxpc3RlbmVycy5mbi5hcHBseShsaXN0ZW5lcnMuY29udGV4dCwgYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGhcbiAgICAgICwgajtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGxpc3RlbmVyc1tpXS5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnNbaV0uZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICAgIGNhc2UgMTogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQpOyBicmVhaztcbiAgICAgICAgY2FzZSAyOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEpOyBicmVhaztcbiAgICAgICAgY2FzZSAzOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEsIGEyKTsgYnJlYWs7XG4gICAgICAgIGNhc2UgNDogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMiwgYTMpOyBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpZiAoIWFyZ3MpIGZvciAoaiA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgICAgICBhcmdzW2ogLSAxXSA9IGFyZ3VtZW50c1tqXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4uYXBwbHkobGlzdGVuZXJzW2ldLmNvbnRleHQsIGFyZ3MpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBBZGQgYSBsaXN0ZW5lciBmb3IgYSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0geyhTdHJpbmd8U3ltYm9sKX0gZXZlbnQgVGhlIGV2ZW50IG5hbWUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgZnVuY3Rpb24uXG4gKiBAcGFyYW0geyp9IFtjb250ZXh0PXRoaXNdIFRoZSBjb250ZXh0IHRvIGludm9rZSB0aGUgbGlzdGVuZXIgd2l0aC5cbiAqIEByZXR1cm5zIHtFdmVudEVtaXR0ZXJ9IGB0aGlzYC5cbiAqIEBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICByZXR1cm4gYWRkTGlzdGVuZXIodGhpcywgZXZlbnQsIGZuLCBjb250ZXh0LCBmYWxzZSk7XG59O1xuXG4vKipcbiAqIEFkZCBhIG9uZS10aW1lIGxpc3RlbmVyIGZvciBhIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7KFN0cmluZ3xTeW1ib2wpfSBldmVudCBUaGUgZXZlbnQgbmFtZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7Kn0gW2NvbnRleHQ9dGhpc10gVGhlIGNvbnRleHQgdG8gaW52b2tlIHRoZSBsaXN0ZW5lciB3aXRoLlxuICogQHJldHVybnMge0V2ZW50RW1pdHRlcn0gYHRoaXNgLlxuICogQHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICByZXR1cm4gYWRkTGlzdGVuZXIodGhpcywgZXZlbnQsIGZuLCBjb250ZXh0LCB0cnVlKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBsaXN0ZW5lcnMgb2YgYSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0geyhTdHJpbmd8U3ltYm9sKX0gZXZlbnQgVGhlIGV2ZW50IG5hbWUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBPbmx5IHJlbW92ZSB0aGUgbGlzdGVuZXJzIHRoYXQgbWF0Y2ggdGhpcyBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7Kn0gY29udGV4dCBPbmx5IHJlbW92ZSB0aGUgbGlzdGVuZXJzIHRoYXQgaGF2ZSB0aGlzIGNvbnRleHQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSByZW1vdmUgb25lLXRpbWUgbGlzdGVuZXJzLlxuICogQHJldHVybnMge0V2ZW50RW1pdHRlcn0gYHRoaXNgLlxuICogQHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiB0aGlzO1xuICBpZiAoIWZuKSB7XG4gICAgY2xlYXJFdmVudCh0aGlzLCBldnQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdO1xuXG4gIGlmIChsaXN0ZW5lcnMuZm4pIHtcbiAgICBpZiAoXG4gICAgICBsaXN0ZW5lcnMuZm4gPT09IGZuICYmXG4gICAgICAoIW9uY2UgfHwgbGlzdGVuZXJzLm9uY2UpICYmXG4gICAgICAoIWNvbnRleHQgfHwgbGlzdGVuZXJzLmNvbnRleHQgPT09IGNvbnRleHQpXG4gICAgKSB7XG4gICAgICBjbGVhckV2ZW50KHRoaXMsIGV2dCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZvciAodmFyIGkgPSAwLCBldmVudHMgPSBbXSwgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoXG4gICAgICAgIGxpc3RlbmVyc1tpXS5mbiAhPT0gZm4gfHxcbiAgICAgICAgKG9uY2UgJiYgIWxpc3RlbmVyc1tpXS5vbmNlKSB8fFxuICAgICAgICAoY29udGV4dCAmJiBsaXN0ZW5lcnNbaV0uY29udGV4dCAhPT0gY29udGV4dClcbiAgICAgICkge1xuICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnNbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vXG4gICAgLy8gUmVzZXQgdGhlIGFycmF5LCBvciByZW1vdmUgaXQgY29tcGxldGVseSBpZiB3ZSBoYXZlIG5vIG1vcmUgbGlzdGVuZXJzLlxuICAgIC8vXG4gICAgaWYgKGV2ZW50cy5sZW5ndGgpIHRoaXMuX2V2ZW50c1tldnRdID0gZXZlbnRzLmxlbmd0aCA9PT0gMSA/IGV2ZW50c1swXSA6IGV2ZW50cztcbiAgICBlbHNlIGNsZWFyRXZlbnQodGhpcywgZXZ0KTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYWxsIGxpc3RlbmVycywgb3IgdGhvc2Ugb2YgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBAcGFyYW0geyhTdHJpbmd8U3ltYm9sKX0gW2V2ZW50XSBUaGUgZXZlbnQgbmFtZS5cbiAqIEByZXR1cm5zIHtFdmVudEVtaXR0ZXJ9IGB0aGlzYC5cbiAqIEBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcbiAgdmFyIGV2dDtcblxuICBpZiAoZXZlbnQpIHtcbiAgICBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuICAgIGlmICh0aGlzLl9ldmVudHNbZXZ0XSkgY2xlYXJFdmVudCh0aGlzLCBldnQpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX2V2ZW50cyA9IG5ldyBFdmVudHMoKTtcbiAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBBbGlhcyBtZXRob2RzIG5hbWVzIGJlY2F1c2UgcGVvcGxlIHJvbGwgbGlrZSB0aGF0LlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBwcmVmaXguXG4vL1xuRXZlbnRFbWl0dGVyLnByZWZpeGVkID0gcHJlZml4O1xuXG4vL1xuLy8gQWxsb3cgYEV2ZW50RW1pdHRlcmAgdG8gYmUgaW1wb3J0ZWQgYXMgbW9kdWxlIG5hbWVzcGFjZS5cbi8vXG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBtb2R1bGUuXG4vL1xuaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgbW9kdWxlKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENoZWNrIGlmIHdlJ3JlIHJlcXVpcmVkIHRvIGFkZCBhIHBvcnQgbnVtYmVyLlxuICpcbiAqIEBzZWUgaHR0cHM6Ly91cmwuc3BlYy53aGF0d2cub3JnLyNkZWZhdWx0LXBvcnRcbiAqIEBwYXJhbSB7TnVtYmVyfFN0cmluZ30gcG9ydCBQb3J0IG51bWJlciB3ZSBuZWVkIHRvIGNoZWNrXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvdG9jb2wgUHJvdG9jb2wgd2UgbmVlZCB0byBjaGVjayBhZ2FpbnN0LlxuICogQHJldHVybnMge0Jvb2xlYW59IElzIGl0IGEgZGVmYXVsdCBwb3J0IGZvciB0aGUgZ2l2ZW4gcHJvdG9jb2xcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHJlcXVpcmVkKHBvcnQsIHByb3RvY29sKSB7XG4gIHByb3RvY29sID0gcHJvdG9jb2wuc3BsaXQoJzonKVswXTtcbiAgcG9ydCA9ICtwb3J0O1xuXG4gIGlmICghcG9ydCkgcmV0dXJuIGZhbHNlO1xuXG4gIHN3aXRjaCAocHJvdG9jb2wpIHtcbiAgICBjYXNlICdodHRwJzpcbiAgICBjYXNlICd3cyc6XG4gICAgcmV0dXJuIHBvcnQgIT09IDgwO1xuXG4gICAgY2FzZSAnaHR0cHMnOlxuICAgIGNhc2UgJ3dzcyc6XG4gICAgcmV0dXJuIHBvcnQgIT09IDQ0MztcblxuICAgIGNhc2UgJ2Z0cCc6XG4gICAgcmV0dXJuIHBvcnQgIT09IDIxO1xuXG4gICAgY2FzZSAnZ29waGVyJzpcbiAgICByZXR1cm4gcG9ydCAhPT0gNzA7XG5cbiAgICBjYXNlICdmaWxlJzpcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gcG9ydCAhPT0gMDtcbn07XG4iLCJ2YXIgY29tbW9uICAgPSBleHBvcnRzLFxuICAgIHVybCAgICAgID0gcmVxdWlyZSgndXJsJyksXG4gICAgZXh0ZW5kICAgPSByZXF1aXJlKCd1dGlsJykuX2V4dGVuZCxcbiAgICByZXF1aXJlZCA9IHJlcXVpcmUoJ3JlcXVpcmVzLXBvcnQnKTtcblxudmFyIHVwZ3JhZGVIZWFkZXIgPSAvKF58LClcXHMqdXBncmFkZVxccyooJHwsKS9pLFxuICAgIGlzU1NMID0gL15odHRwc3x3c3MvO1xuXG4vKipcbiAqIFNpbXBsZSBSZWdleCBmb3IgdGVzdGluZyBpZiBwcm90b2NvbCBpcyBodHRwc1xuICovXG5jb21tb24uaXNTU0wgPSBpc1NTTDtcbi8qKlxuICogQ29waWVzIHRoZSByaWdodCBoZWFkZXJzIGZyb20gYG9wdGlvbnNgIGFuZCBgcmVxYCB0b1xuICogYG91dGdvaW5nYCB3aGljaCBpcyB0aGVuIHVzZWQgdG8gZmlyZSB0aGUgcHJveGllZFxuICogcmVxdWVzdC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICBjb21tb24uc2V0dXBPdXRnb2luZyhvdXRnb2luZywgb3B0aW9ucywgcmVxKVxuICogICAgLy8gPT4geyBob3N0OiAuLi4sIGhvc3RuYW1lOiAuLi59XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IE91dGdvaW5nIEJhc2Ugb2JqZWN0IHRvIGJlIGZpbGxlZCB3aXRoIHJlcXVpcmVkIHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBPcHRpb25zIENvbmZpZyBvYmplY3QgcGFzc2VkIHRvIHRoZSBwcm94eVxuICogQHBhcmFtIHtDbGllbnRSZXF1ZXN0fSBSZXEgUmVxdWVzdCBPYmplY3RcbiAqIEBwYXJhbSB7U3RyaW5nfSBGb3J3YXJkIFN0cmluZyB0byBzZWxlY3QgZm9yd2FyZCBvciB0YXJnZXRcbiAqwqBcbiAqIEByZXR1cm4ge09iamVjdH0gT3V0Z29pbmcgT2JqZWN0IHdpdGggYWxsIHJlcXVpcmVkIHByb3BlcnRpZXMgc2V0XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuY29tbW9uLnNldHVwT3V0Z29pbmcgPSBmdW5jdGlvbihvdXRnb2luZywgb3B0aW9ucywgcmVxLCBmb3J3YXJkKSB7XG4gIG91dGdvaW5nLnBvcnQgPSBvcHRpb25zW2ZvcndhcmQgfHwgJ3RhcmdldCddLnBvcnQgfHxcbiAgICAgICAgICAgICAgICAgIChpc1NTTC50ZXN0KG9wdGlvbnNbZm9yd2FyZCB8fCAndGFyZ2V0J10ucHJvdG9jb2wpID8gNDQzIDogODApO1xuXG4gIFsnaG9zdCcsICdob3N0bmFtZScsICdzb2NrZXRQYXRoJywgJ3BmeCcsICdrZXknLFxuICAgICdwYXNzcGhyYXNlJywgJ2NlcnQnLCAnY2EnLCAnY2lwaGVycycsICdzZWN1cmVQcm90b2NvbCddLmZvckVhY2goXG4gICAgZnVuY3Rpb24oZSkgeyBvdXRnb2luZ1tlXSA9IG9wdGlvbnNbZm9yd2FyZCB8fCAndGFyZ2V0J11bZV07IH1cbiAgKTtcblxuICBvdXRnb2luZy5tZXRob2QgPSBvcHRpb25zLm1ldGhvZCB8fCByZXEubWV0aG9kO1xuICBvdXRnb2luZy5oZWFkZXJzID0gZXh0ZW5kKHt9LCByZXEuaGVhZGVycyk7XG5cbiAgaWYgKG9wdGlvbnMuaGVhZGVycyl7XG4gICAgZXh0ZW5kKG91dGdvaW5nLmhlYWRlcnMsIG9wdGlvbnMuaGVhZGVycyk7XG4gIH1cblxuICBpZiAob3B0aW9ucy5hdXRoKSB7XG4gICAgb3V0Z29pbmcuYXV0aCA9IG9wdGlvbnMuYXV0aDtcbiAgfVxuICBcbiAgaWYgKG9wdGlvbnMuY2EpIHtcbiAgICAgIG91dGdvaW5nLmNhID0gb3B0aW9ucy5jYTtcbiAgfVxuXG4gIGlmIChpc1NTTC50ZXN0KG9wdGlvbnNbZm9yd2FyZCB8fCAndGFyZ2V0J10ucHJvdG9jb2wpKSB7XG4gICAgb3V0Z29pbmcucmVqZWN0VW5hdXRob3JpemVkID0gKHR5cGVvZiBvcHRpb25zLnNlY3VyZSA9PT0gXCJ1bmRlZmluZWRcIikgPyB0cnVlIDogb3B0aW9ucy5zZWN1cmU7XG4gIH1cblxuXG4gIG91dGdvaW5nLmFnZW50ID0gb3B0aW9ucy5hZ2VudCB8fCBmYWxzZTtcbiAgb3V0Z29pbmcubG9jYWxBZGRyZXNzID0gb3B0aW9ucy5sb2NhbEFkZHJlc3M7XG5cbiAgLy9cbiAgLy8gUmVtYXJrOiBJZiB3ZSBhcmUgZmFsc2UgYW5kIG5vdCB1cGdyYWRpbmcsIHNldCB0aGUgY29ubmVjdGlvbjogY2xvc2UuIFRoaXMgaXMgdGhlIHJpZ2h0IHRoaW5nIHRvIGRvXG4gIC8vIGFzIG5vZGUgY29yZSBkb2Vzbid0IGhhbmRsZSB0aGlzIENPTVBMRVRFTFkgcHJvcGVybHkgeWV0LlxuICAvL1xuICBpZiAoIW91dGdvaW5nLmFnZW50KSB7XG4gICAgb3V0Z29pbmcuaGVhZGVycyA9IG91dGdvaW5nLmhlYWRlcnMgfHwge307XG4gICAgaWYgKHR5cGVvZiBvdXRnb2luZy5oZWFkZXJzLmNvbm5lY3Rpb24gIT09ICdzdHJpbmcnXG4gICAgICAgIHx8ICF1cGdyYWRlSGVhZGVyLnRlc3Qob3V0Z29pbmcuaGVhZGVycy5jb25uZWN0aW9uKVxuICAgICAgICkgeyBvdXRnb2luZy5oZWFkZXJzLmNvbm5lY3Rpb24gPSAnY2xvc2UnOyB9XG4gIH1cblxuXG4gIC8vIHRoZSBmaW5hbCBwYXRoIGlzIHRhcmdldCBwYXRoICsgcmVsYXRpdmUgcGF0aCByZXF1ZXN0ZWQgYnkgdXNlcjpcbiAgdmFyIHRhcmdldCA9IG9wdGlvbnNbZm9yd2FyZCB8fCAndGFyZ2V0J107XG4gIHZhciB0YXJnZXRQYXRoID0gdGFyZ2V0ICYmIG9wdGlvbnMucHJlcGVuZFBhdGggIT09IGZhbHNlXG4gICAgPyAodGFyZ2V0LnBhdGggfHwgJycpXG4gICAgOiAnJztcblxuICAvL1xuICAvLyBSZW1hcms6IENhbiB3ZSBzb21laG93IG5vdCB1c2UgdXJsLnBhcnNlIGFzIGEgcGVyZiBvcHRpbWl6YXRpb24/XG4gIC8vXG4gIHZhciBvdXRnb2luZ1BhdGggPSAhb3B0aW9ucy50b1Byb3h5XG4gICAgPyAodXJsLnBhcnNlKHJlcS51cmwpLnBhdGggfHwgJycpXG4gICAgOiByZXEudXJsO1xuXG4gIC8vXG4gIC8vIFJlbWFyazogaWdub3JlUGF0aCB3aWxsIGp1c3Qgc3RyYWlnaHQgdXAgaWdub3JlIHdoYXRldmVyIHRoZSByZXF1ZXN0J3NcbiAgLy8gcGF0aCBpcy4gVGhpcyBjYW4gYmUgbGFiZWxlZCBhcyBGT09ULUdVTiBtYXRlcmlhbCBpZiB5b3UgZG8gbm90IGtub3cgd2hhdFxuICAvLyB5b3UgYXJlIGRvaW5nIGFuZCBhcmUgdXNpbmcgY29uZmxpY3Rpbmcgb3B0aW9ucy5cbiAgLy9cbiAgb3V0Z29pbmdQYXRoID0gIW9wdGlvbnMuaWdub3JlUGF0aCA/IG91dGdvaW5nUGF0aCA6ICcnO1xuXG4gIG91dGdvaW5nLnBhdGggPSBjb21tb24udXJsSm9pbih0YXJnZXRQYXRoLCBvdXRnb2luZ1BhdGgpO1xuXG4gIGlmIChvcHRpb25zLmNoYW5nZU9yaWdpbikge1xuICAgIG91dGdvaW5nLmhlYWRlcnMuaG9zdCA9XG4gICAgICByZXF1aXJlZChvdXRnb2luZy5wb3J0LCBvcHRpb25zW2ZvcndhcmQgfHwgJ3RhcmdldCddLnByb3RvY29sKSAmJiAhaGFzUG9ydChvdXRnb2luZy5ob3N0KVxuICAgICAgICA/IG91dGdvaW5nLmhvc3QgKyAnOicgKyBvdXRnb2luZy5wb3J0XG4gICAgICAgIDogb3V0Z29pbmcuaG9zdDtcbiAgfVxuICByZXR1cm4gb3V0Z29pbmc7XG59O1xuXG4vKipcbiAqIFNldCB0aGUgcHJvcGVyIGNvbmZpZ3VyYXRpb24gZm9yIHNvY2tldHMsXG4gKiBzZXQgbm8gZGVsYXkgYW5kIHNldCBrZWVwIGFsaXZlLCBhbHNvIHNldFxuICogdGhlIHRpbWVvdXQgdG8gMC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICBjb21tb24uc2V0dXBTb2NrZXQoc29ja2V0KVxuICogICAgLy8gPT4gU29ja2V0XG4gKlxuICogQHBhcmFtIHtTb2NrZXR9IFNvY2tldCBpbnN0YW5jZSB0byBzZXR1cFxuICrCoFxuICogQHJldHVybiB7U29ja2V0fSBSZXR1cm4gdGhlIGNvbmZpZ3VyZWQgc29ja2V0LlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmNvbW1vbi5zZXR1cFNvY2tldCA9IGZ1bmN0aW9uKHNvY2tldCkge1xuICBzb2NrZXQuc2V0VGltZW91dCgwKTtcbiAgc29ja2V0LnNldE5vRGVsYXkodHJ1ZSk7XG5cbiAgc29ja2V0LnNldEtlZXBBbGl2ZSh0cnVlLCAwKTtcblxuICByZXR1cm4gc29ja2V0O1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIHBvcnQgbnVtYmVyIGZyb20gdGhlIGhvc3QuIE9yIGd1ZXNzIGl0IGJhc2VkIG9uIHRoZSBjb25uZWN0aW9uIHR5cGUuXG4gKlxuICogQHBhcmFtIHtSZXF1ZXN0fSByZXEgSW5jb21pbmcgSFRUUCByZXF1ZXN0LlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ30gVGhlIHBvcnQgbnVtYmVyLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5jb21tb24uZ2V0UG9ydCA9IGZ1bmN0aW9uKHJlcSkge1xuICB2YXIgcmVzID0gcmVxLmhlYWRlcnMuaG9zdCA/IHJlcS5oZWFkZXJzLmhvc3QubWF0Y2goLzooXFxkKykvKSA6ICcnO1xuXG4gIHJldHVybiByZXMgP1xuICAgIHJlc1sxXSA6XG4gICAgY29tbW9uLmhhc0VuY3J5cHRlZENvbm5lY3Rpb24ocmVxKSA/ICc0NDMnIDogJzgwJztcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIHJlcXVlc3QgaGFzIGFuIGVuY3J5cHRlZCBjb25uZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7UmVxdWVzdH0gcmVxIEluY29taW5nIEhUVFAgcmVxdWVzdC5cbiAqXG4gKiBAcmV0dXJuIHtCb29sZWFufSBXaGV0aGVyIHRoZSBjb25uZWN0aW9uIGlzIGVuY3J5cHRlZCBvciBub3QuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmNvbW1vbi5oYXNFbmNyeXB0ZWRDb25uZWN0aW9uID0gZnVuY3Rpb24ocmVxKSB7XG4gIHJldHVybiBCb29sZWFuKHJlcS5jb25uZWN0aW9uLmVuY3J5cHRlZCB8fCByZXEuY29ubmVjdGlvbi5wYWlyKTtcbn07XG5cbi8qKlxuICogT1MtYWdub3N0aWMgam9pbiAoZG9lc24ndCBicmVhayBvbiBVUkxzIGxpa2UgcGF0aC5qb2luIGRvZXMgb24gV2luZG93cyk+XG4gKlxuICogQHJldHVybiB7U3RyaW5nfSBUaGUgZ2VuZXJhdGVkIHBhdGguXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuY29tbW9uLnVybEpvaW4gPSBmdW5jdGlvbigpIHtcbiAgICAvL1xuICAgIC8vIFdlIGRvIG5vdCB3YW50IHRvIG1lc3Mgd2l0aCB0aGUgcXVlcnkgc3RyaW5nLiBBbGwgd2Ugd2FudCB0byB0b3VjaCBpcyB0aGUgcGF0aC5cbiAgICAvL1xuICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyksXG4gICAgICBsYXN0SW5kZXggPSBhcmdzLmxlbmd0aCAtIDEsXG4gICAgICBsYXN0ID0gYXJnc1tsYXN0SW5kZXhdLFxuICAgICAgbGFzdFNlZ3MgPSBsYXN0LnNwbGl0KCc/JyksXG4gICAgICByZXRTZWdzO1xuXG4gIGFyZ3NbbGFzdEluZGV4XSA9IGxhc3RTZWdzLnNoaWZ0KCk7XG5cbiAgLy9cbiAgLy8gSm9pbiBhbGwgc3RyaW5ncywgYnV0IHJlbW92ZSBlbXB0eSBzdHJpbmdzIHNvIHdlIGRvbid0IGdldCBleHRyYSBzbGFzaGVzIGZyb21cbiAgLy8gam9pbmluZyBlLmcuIFsnJywgJ2FtJ11cbiAgLy9cbiAgcmV0U2VncyA9IFtcbiAgICBhcmdzLmZpbHRlcihCb29sZWFuKS5qb2luKCcvJylcbiAgICAgICAgLnJlcGxhY2UoL1xcLysvZywgJy8nKVxuICAgICAgICAucmVwbGFjZSgnaHR0cDovJywgJ2h0dHA6Ly8nKVxuICAgICAgICAucmVwbGFjZSgnaHR0cHM6LycsICdodHRwczovLycpXG4gIF07XG5cbiAgLy8gT25seSBqb2luIHRoZSBxdWVyeSBzdHJpbmcgaWYgaXQgZXhpc3RzIHNvIHdlIGRvbid0IGhhdmUgdHJhaWxpbmcgYSAnPydcbiAgLy8gb24gZXZlcnkgcmVxdWVzdFxuXG4gIC8vIEhhbmRsZSBjYXNlIHdoZXJlIHRoZXJlIGNvdWxkIGJlIG11bHRpcGxlID8gaW4gdGhlIFVSTC5cbiAgcmV0U2Vncy5wdXNoLmFwcGx5KHJldFNlZ3MsIGxhc3RTZWdzKTtcblxuICByZXR1cm4gcmV0U2Vncy5qb2luKCc/Jylcbn07XG5cbi8qKlxuICogUmV3cml0ZXMgb3IgcmVtb3ZlcyB0aGUgZG9tYWluIG9mIGEgY29va2llIGhlYWRlclxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBIZWFkZXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBDb25maWcsIG1hcHBpbmcgb2YgZG9tYWluIHRvIHJld3JpdHRlbiBkb21haW4uXG4gKiAgICAgICAgICAgICAgICAgJyonIGtleSB0byBtYXRjaCBhbnkgZG9tYWluLCBudWxsIHZhbHVlIHRvIHJlbW92ZSB0aGUgZG9tYWluLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5jb21tb24ucmV3cml0ZUNvb2tpZVByb3BlcnR5ID0gZnVuY3Rpb24gcmV3cml0ZUNvb2tpZVByb3BlcnR5KGhlYWRlciwgY29uZmlnLCBwcm9wZXJ0eSkge1xuICBpZiAoQXJyYXkuaXNBcnJheShoZWFkZXIpKSB7XG4gICAgcmV0dXJuIGhlYWRlci5tYXAoZnVuY3Rpb24gKGhlYWRlckVsZW1lbnQpIHtcbiAgICAgIHJldHVybiByZXdyaXRlQ29va2llUHJvcGVydHkoaGVhZGVyRWxlbWVudCwgY29uZmlnLCBwcm9wZXJ0eSk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGhlYWRlci5yZXBsYWNlKG5ldyBSZWdFeHAoXCIoO1xcXFxzKlwiICsgcHJvcGVydHkgKyBcIj0pKFteO10rKVwiLCAnaScpLCBmdW5jdGlvbihtYXRjaCwgcHJlZml4LCBwcmV2aW91c1ZhbHVlKSB7XG4gICAgdmFyIG5ld1ZhbHVlO1xuICAgIGlmIChwcmV2aW91c1ZhbHVlIGluIGNvbmZpZykge1xuICAgICAgbmV3VmFsdWUgPSBjb25maWdbcHJldmlvdXNWYWx1ZV07XG4gICAgfSBlbHNlIGlmICgnKicgaW4gY29uZmlnKSB7XG4gICAgICBuZXdWYWx1ZSA9IGNvbmZpZ1snKiddO1xuICAgIH0gZWxzZSB7XG4gICAgICAvL25vIG1hdGNoLCByZXR1cm4gcHJldmlvdXMgdmFsdWVcbiAgICAgIHJldHVybiBtYXRjaDtcbiAgICB9XG4gICAgaWYgKG5ld1ZhbHVlKSB7XG4gICAgICAvL3JlcGxhY2UgdmFsdWVcbiAgICAgIHJldHVybiBwcmVmaXggKyBuZXdWYWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy9yZW1vdmUgdmFsdWVcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gIH0pO1xufTtcblxuLyoqXG4gKiBDaGVjayB0aGUgaG9zdCBhbmQgc2VlIGlmIGl0IHBvdGVudGlhbGx5IGhhcyBhIHBvcnQgaW4gaXQgKGtlZXAgaXQgc2ltcGxlKVxuICpcbiAqIEByZXR1cm5zIHtCb29sZWFufSBXaGV0aGVyIHdlIGhhdmUgb25lIG9yIG5vdFxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBoYXNQb3J0KGhvc3QpIHtcbiAgcmV0dXJuICEhfmhvc3QuaW5kZXhPZignOicpO1xufTtcbiIsInZhciB1cmwgICAgPSByZXF1aXJlKCd1cmwnKSxcbiAgICBjb21tb24gPSByZXF1aXJlKCcuLi9jb21tb24nKTtcblxuXG52YXIgcmVkaXJlY3RSZWdleCA9IC9eMjAxfDMwKDF8Mnw3fDgpJC87XG5cbi8qIVxuICogQXJyYXkgb2YgcGFzc2VzLlxuICpcbiAqIEEgYHBhc3NgIGlzIGp1c3QgYSBmdW5jdGlvbiB0aGF0IGlzIGV4ZWN1dGVkIG9uIGByZXEsIHJlcywgb3B0aW9uc2BcbiAqIHNvIHRoYXQgeW91IGNhbiBlYXNpbHkgYWRkIG5ldyBjaGVja3Mgd2hpbGUgc3RpbGwga2VlcGluZyB0aGUgYmFzZVxuICogZmxleGlibGUuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7IC8vIDwtLVxuXG4gIC8qKlxuICAgKiBJZiBpcyBhIEhUVFAgMS4wIHJlcXVlc3QsIHJlbW92ZSBjaHVuayBoZWFkZXJzXG4gICAqXG4gICAqIEBwYXJhbSB7Q2xpZW50UmVxdWVzdH0gUmVxIFJlcXVlc3Qgb2JqZWN0XG4gICAqwqBAcGFyYW0ge0luY29taW5nTWVzc2FnZX0gUmVzIFJlc3BvbnNlIG9iamVjdFxuICAgKiBAcGFyYW0ge3Byb3h5UmVzcG9uc2V9IFJlcyBSZXNwb25zZSBvYmplY3QgZnJvbSB0aGUgcHJveHkgcmVxdWVzdFxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG4gIHJlbW92ZUNodW5rZWQ6IGZ1bmN0aW9uIHJlbW92ZUNodW5rZWQocmVxLCByZXMsIHByb3h5UmVzKSB7XG4gICAgaWYgKHJlcS5odHRwVmVyc2lvbiA9PT0gJzEuMCcpIHtcbiAgICAgIGRlbGV0ZSBwcm94eVJlcy5oZWFkZXJzWyd0cmFuc2Zlci1lbmNvZGluZyddO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogSWYgaXMgYSBIVFRQIDEuMCByZXF1ZXN0LCBzZXQgdGhlIGNvcnJlY3QgY29ubmVjdGlvbiBoZWFkZXJcbiAgICogb3IgaWYgY29ubmVjdGlvbiBoZWFkZXIgbm90IHByZXNlbnQsIHRoZW4gdXNlIGBrZWVwLWFsaXZlYFxuICAgKlxuICAgKiBAcGFyYW0ge0NsaWVudFJlcXVlc3R9IFJlcSBSZXF1ZXN0IG9iamVjdFxuICAgKsKgQHBhcmFtIHtJbmNvbWluZ01lc3NhZ2V9IFJlcyBSZXNwb25zZSBvYmplY3RcbiAgICogQHBhcmFtIHtwcm94eVJlc3BvbnNlfSBSZXMgUmVzcG9uc2Ugb2JqZWN0IGZyb20gdGhlIHByb3h5IHJlcXVlc3RcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuICBzZXRDb25uZWN0aW9uOiBmdW5jdGlvbiBzZXRDb25uZWN0aW9uKHJlcSwgcmVzLCBwcm94eVJlcykge1xuICAgIGlmIChyZXEuaHR0cFZlcnNpb24gPT09ICcxLjAnKSB7XG4gICAgICBwcm94eVJlcy5oZWFkZXJzLmNvbm5lY3Rpb24gPSByZXEuaGVhZGVycy5jb25uZWN0aW9uIHx8ICdjbG9zZSc7XG4gICAgfSBlbHNlIGlmIChyZXEuaHR0cFZlcnNpb24gIT09ICcyLjAnICYmICFwcm94eVJlcy5oZWFkZXJzLmNvbm5lY3Rpb24pIHtcbiAgICAgIHByb3h5UmVzLmhlYWRlcnMuY29ubmVjdGlvbiA9IHJlcS5oZWFkZXJzLmNvbm5lY3Rpb24gfHwgJ2tlZXAtYWxpdmUnO1xuICAgIH1cbiAgfSxcblxuICBzZXRSZWRpcmVjdEhvc3RSZXdyaXRlOiBmdW5jdGlvbiBzZXRSZWRpcmVjdEhvc3RSZXdyaXRlKHJlcSwgcmVzLCBwcm94eVJlcywgb3B0aW9ucykge1xuICAgIGlmICgob3B0aW9ucy5ob3N0UmV3cml0ZSB8fCBvcHRpb25zLmF1dG9SZXdyaXRlIHx8IG9wdGlvbnMucHJvdG9jb2xSZXdyaXRlKVxuICAgICAgICAmJiBwcm94eVJlcy5oZWFkZXJzWydsb2NhdGlvbiddXG4gICAgICAgICYmIHJlZGlyZWN0UmVnZXgudGVzdChwcm94eVJlcy5zdGF0dXNDb2RlKSkge1xuICAgICAgdmFyIHRhcmdldCA9IHVybC5wYXJzZShvcHRpb25zLnRhcmdldCk7XG4gICAgICB2YXIgdSA9IHVybC5wYXJzZShwcm94eVJlcy5oZWFkZXJzWydsb2NhdGlvbiddKTtcblxuICAgICAgLy8gbWFrZSBzdXJlIHRoZSByZWRpcmVjdGVkIGhvc3QgbWF0Y2hlcyB0aGUgdGFyZ2V0IGhvc3QgYmVmb3JlIHJld3JpdGluZ1xuICAgICAgaWYgKHRhcmdldC5ob3N0ICE9IHUuaG9zdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLmhvc3RSZXdyaXRlKSB7XG4gICAgICAgIHUuaG9zdCA9IG9wdGlvbnMuaG9zdFJld3JpdGU7XG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuYXV0b1Jld3JpdGUpIHtcbiAgICAgICAgdS5ob3N0ID0gcmVxLmhlYWRlcnNbJ2hvc3QnXTtcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zLnByb3RvY29sUmV3cml0ZSkge1xuICAgICAgICB1LnByb3RvY29sID0gb3B0aW9ucy5wcm90b2NvbFJld3JpdGU7XG4gICAgICB9XG5cbiAgICAgIHByb3h5UmVzLmhlYWRlcnNbJ2xvY2F0aW9uJ10gPSB1LmZvcm1hdCgpO1xuICAgIH1cbiAgfSxcbiAgLyoqXG4gICAqIENvcHkgaGVhZGVycyBmcm9tIHByb3h5UmVzcG9uc2UgdG8gcmVzcG9uc2VcbiAgICogc2V0IGVhY2ggaGVhZGVyIGluIHJlc3BvbnNlIG9iamVjdC5cbiAgICpcbiAgICogQHBhcmFtIHtDbGllbnRSZXF1ZXN0fSBSZXEgUmVxdWVzdCBvYmplY3RcbiAgICrCoEBwYXJhbSB7SW5jb21pbmdNZXNzYWdlfSBSZXMgUmVzcG9uc2Ugb2JqZWN0XG4gICAqIEBwYXJhbSB7cHJveHlSZXNwb25zZX0gUmVzIFJlc3BvbnNlIG9iamVjdCBmcm9tIHRoZSBwcm94eSByZXF1ZXN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBPcHRpb25zIG9wdGlvbnMuY29va2llRG9tYWluUmV3cml0ZTogQ29uZmlnIHRvIHJld3JpdGUgY29va2llIGRvbWFpblxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG4gIHdyaXRlSGVhZGVyczogZnVuY3Rpb24gd3JpdGVIZWFkZXJzKHJlcSwgcmVzLCBwcm94eVJlcywgb3B0aW9ucykge1xuICAgIHZhciByZXdyaXRlQ29va2llRG9tYWluQ29uZmlnID0gb3B0aW9ucy5jb29raWVEb21haW5SZXdyaXRlLFxuICAgICAgICByZXdyaXRlQ29va2llUGF0aENvbmZpZyA9IG9wdGlvbnMuY29va2llUGF0aFJld3JpdGUsXG4gICAgICAgIHByZXNlcnZlSGVhZGVyS2V5Q2FzZSA9IG9wdGlvbnMucHJlc2VydmVIZWFkZXJLZXlDYXNlLFxuICAgICAgICByYXdIZWFkZXJLZXlNYXAsXG4gICAgICAgIHNldEhlYWRlciA9IGZ1bmN0aW9uKGtleSwgaGVhZGVyKSB7XG4gICAgICAgICAgaWYgKGhlYWRlciA9PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICAgICAgICBpZiAocmV3cml0ZUNvb2tpZURvbWFpbkNvbmZpZyAmJiBrZXkudG9Mb3dlckNhc2UoKSA9PT0gJ3NldC1jb29raWUnKSB7XG4gICAgICAgICAgICBoZWFkZXIgPSBjb21tb24ucmV3cml0ZUNvb2tpZVByb3BlcnR5KGhlYWRlciwgcmV3cml0ZUNvb2tpZURvbWFpbkNvbmZpZywgJ2RvbWFpbicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocmV3cml0ZUNvb2tpZVBhdGhDb25maWcgJiYga2V5LnRvTG93ZXJDYXNlKCkgPT09ICdzZXQtY29va2llJykge1xuICAgICAgICAgICAgaGVhZGVyID0gY29tbW9uLnJld3JpdGVDb29raWVQcm9wZXJ0eShoZWFkZXIsIHJld3JpdGVDb29raWVQYXRoQ29uZmlnLCAncGF0aCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXMuc2V0SGVhZGVyKFN0cmluZyhrZXkpLnRyaW0oKSwgaGVhZGVyKTtcbiAgICAgICAgfTtcblxuICAgIGlmICh0eXBlb2YgcmV3cml0ZUNvb2tpZURvbWFpbkNvbmZpZyA9PT0gJ3N0cmluZycpIHsgLy9hbHNvIHRlc3QgZm9yICcnXG4gICAgICByZXdyaXRlQ29va2llRG9tYWluQ29uZmlnID0geyAnKic6IHJld3JpdGVDb29raWVEb21haW5Db25maWcgfTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHJld3JpdGVDb29raWVQYXRoQ29uZmlnID09PSAnc3RyaW5nJykgeyAvL2Fsc28gdGVzdCBmb3IgJydcbiAgICAgIHJld3JpdGVDb29raWVQYXRoQ29uZmlnID0geyAnKic6IHJld3JpdGVDb29raWVQYXRoQ29uZmlnIH07XG4gICAgfVxuXG4gICAgLy8gbWVzc2FnZS5yYXdIZWFkZXJzIGlzIGFkZGVkIGluOiB2MC4xMS42XG4gICAgLy8gaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9odHRwLmh0bWwjaHR0cF9tZXNzYWdlX3Jhd2hlYWRlcnNcbiAgICBpZiAocHJlc2VydmVIZWFkZXJLZXlDYXNlICYmIHByb3h5UmVzLnJhd0hlYWRlcnMgIT0gdW5kZWZpbmVkKSB7XG4gICAgICByYXdIZWFkZXJLZXlNYXAgPSB7fTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJveHlSZXMucmF3SGVhZGVycy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICB2YXIga2V5ID0gcHJveHlSZXMucmF3SGVhZGVyc1tpXTtcbiAgICAgICAgcmF3SGVhZGVyS2V5TWFwW2tleS50b0xvd2VyQ2FzZSgpXSA9IGtleTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBPYmplY3Qua2V5cyhwcm94eVJlcy5oZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgdmFyIGhlYWRlciA9IHByb3h5UmVzLmhlYWRlcnNba2V5XTtcbiAgICAgIGlmIChwcmVzZXJ2ZUhlYWRlcktleUNhc2UgJiYgcmF3SGVhZGVyS2V5TWFwKSB7XG4gICAgICAgIGtleSA9IHJhd0hlYWRlcktleU1hcFtrZXldIHx8IGtleTtcbiAgICAgIH1cbiAgICAgIHNldEhlYWRlcihrZXksIGhlYWRlcik7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFNldCB0aGUgc3RhdHVzQ29kZSBmcm9tIHRoZSBwcm94eVJlc3BvbnNlXG4gICAqXG4gICAqIEBwYXJhbSB7Q2xpZW50UmVxdWVzdH0gUmVxIFJlcXVlc3Qgb2JqZWN0XG4gICAqwqBAcGFyYW0ge0luY29taW5nTWVzc2FnZX0gUmVzIFJlc3BvbnNlIG9iamVjdFxuICAgKiBAcGFyYW0ge3Byb3h5UmVzcG9uc2V9IFJlcyBSZXNwb25zZSBvYmplY3QgZnJvbSB0aGUgcHJveHkgcmVxdWVzdFxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG4gIHdyaXRlU3RhdHVzQ29kZTogZnVuY3Rpb24gd3JpdGVTdGF0dXNDb2RlKHJlcSwgcmVzLCBwcm94eVJlcykge1xuICAgIC8vIEZyb20gTm9kZS5qcyBkb2NzOiByZXNwb25zZS53cml0ZUhlYWQoc3RhdHVzQ29kZVssIHN0YXR1c01lc3NhZ2VdWywgaGVhZGVyc10pXG4gICAgaWYocHJveHlSZXMuc3RhdHVzTWVzc2FnZSkge1xuICAgICAgcmVzLnN0YXR1c0NvZGUgPSBwcm94eVJlcy5zdGF0dXNDb2RlO1xuICAgICAgcmVzLnN0YXR1c01lc3NhZ2UgPSBwcm94eVJlcy5zdGF0dXNNZXNzYWdlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXMuc3RhdHVzQ29kZSA9IHByb3h5UmVzLnN0YXR1c0NvZGU7XG4gICAgfVxuICB9XG5cbn07XG4iLCJ2YXIgZGVidWc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIWRlYnVnKSB7XG4gICAgdHJ5IHtcbiAgICAgIC8qIGVzbGludCBnbG9iYWwtcmVxdWlyZTogb2ZmICovXG4gICAgICBkZWJ1ZyA9IHJlcXVpcmUoXCJkZWJ1Z1wiKShcImZvbGxvdy1yZWRpcmVjdHNcIik7XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikgeyAvKiAqLyB9XG4gICAgaWYgKHR5cGVvZiBkZWJ1ZyAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBkZWJ1ZyA9IGZ1bmN0aW9uICgpIHsgLyogKi8gfTtcbiAgICB9XG4gIH1cbiAgZGVidWcuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbn07XG4iLCJ2YXIgdXJsID0gcmVxdWlyZShcInVybFwiKTtcbnZhciBVUkwgPSB1cmwuVVJMO1xudmFyIGh0dHAgPSByZXF1aXJlKFwiaHR0cFwiKTtcbnZhciBodHRwcyA9IHJlcXVpcmUoXCJodHRwc1wiKTtcbnZhciBXcml0YWJsZSA9IHJlcXVpcmUoXCJzdHJlYW1cIikuV3JpdGFibGU7XG52YXIgYXNzZXJ0ID0gcmVxdWlyZShcImFzc2VydFwiKTtcbnZhciBkZWJ1ZyA9IHJlcXVpcmUoXCIuL2RlYnVnXCIpO1xuXG4vLyBDcmVhdGUgaGFuZGxlcnMgdGhhdCBwYXNzIGV2ZW50cyBmcm9tIG5hdGl2ZSByZXF1ZXN0c1xudmFyIGV2ZW50cyA9IFtcImFib3J0XCIsIFwiYWJvcnRlZFwiLCBcImNvbm5lY3RcIiwgXCJlcnJvclwiLCBcInNvY2tldFwiLCBcInRpbWVvdXRcIl07XG52YXIgZXZlbnRIYW5kbGVycyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5ldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcbiAgZXZlbnRIYW5kbGVyc1tldmVudF0gPSBmdW5jdGlvbiAoYXJnMSwgYXJnMiwgYXJnMykge1xuICAgIHRoaXMuX3JlZGlyZWN0YWJsZS5lbWl0KGV2ZW50LCBhcmcxLCBhcmcyLCBhcmczKTtcbiAgfTtcbn0pO1xuXG52YXIgSW52YWxpZFVybEVycm9yID0gY3JlYXRlRXJyb3JUeXBlKFxuICBcIkVSUl9JTlZBTElEX1VSTFwiLFxuICBcIkludmFsaWQgVVJMXCIsXG4gIFR5cGVFcnJvclxuKTtcbi8vIEVycm9yIHR5cGVzIHdpdGggY29kZXNcbnZhciBSZWRpcmVjdGlvbkVycm9yID0gY3JlYXRlRXJyb3JUeXBlKFxuICBcIkVSUl9GUl9SRURJUkVDVElPTl9GQUlMVVJFXCIsXG4gIFwiUmVkaXJlY3RlZCByZXF1ZXN0IGZhaWxlZFwiXG4pO1xudmFyIFRvb01hbnlSZWRpcmVjdHNFcnJvciA9IGNyZWF0ZUVycm9yVHlwZShcbiAgXCJFUlJfRlJfVE9PX01BTllfUkVESVJFQ1RTXCIsXG4gIFwiTWF4aW11bSBudW1iZXIgb2YgcmVkaXJlY3RzIGV4Y2VlZGVkXCJcbik7XG52YXIgTWF4Qm9keUxlbmd0aEV4Y2VlZGVkRXJyb3IgPSBjcmVhdGVFcnJvclR5cGUoXG4gIFwiRVJSX0ZSX01BWF9CT0RZX0xFTkdUSF9FWENFRURFRFwiLFxuICBcIlJlcXVlc3QgYm9keSBsYXJnZXIgdGhhbiBtYXhCb2R5TGVuZ3RoIGxpbWl0XCJcbik7XG52YXIgV3JpdGVBZnRlckVuZEVycm9yID0gY3JlYXRlRXJyb3JUeXBlKFxuICBcIkVSUl9TVFJFQU1fV1JJVEVfQUZURVJfRU5EXCIsXG4gIFwid3JpdGUgYWZ0ZXIgZW5kXCJcbik7XG5cbi8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG52YXIgZGVzdHJveSA9IFdyaXRhYmxlLnByb3RvdHlwZS5kZXN0cm95IHx8IG5vb3A7XG5cbi8vIEFuIEhUVFAoUykgcmVxdWVzdCB0aGF0IGNhbiBiZSByZWRpcmVjdGVkXG5mdW5jdGlvbiBSZWRpcmVjdGFibGVSZXF1ZXN0KG9wdGlvbnMsIHJlc3BvbnNlQ2FsbGJhY2spIHtcbiAgLy8gSW5pdGlhbGl6ZSB0aGUgcmVxdWVzdFxuICBXcml0YWJsZS5jYWxsKHRoaXMpO1xuICB0aGlzLl9zYW5pdGl6ZU9wdGlvbnMob3B0aW9ucyk7XG4gIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zO1xuICB0aGlzLl9lbmRlZCA9IGZhbHNlO1xuICB0aGlzLl9lbmRpbmcgPSBmYWxzZTtcbiAgdGhpcy5fcmVkaXJlY3RDb3VudCA9IDA7XG4gIHRoaXMuX3JlZGlyZWN0cyA9IFtdO1xuICB0aGlzLl9yZXF1ZXN0Qm9keUxlbmd0aCA9IDA7XG4gIHRoaXMuX3JlcXVlc3RCb2R5QnVmZmVycyA9IFtdO1xuXG4gIC8vIEF0dGFjaCBhIGNhbGxiYWNrIGlmIHBhc3NlZFxuICBpZiAocmVzcG9uc2VDYWxsYmFjaykge1xuICAgIHRoaXMub24oXCJyZXNwb25zZVwiLCByZXNwb25zZUNhbGxiYWNrKTtcbiAgfVxuXG4gIC8vIFJlYWN0IHRvIHJlc3BvbnNlcyBvZiBuYXRpdmUgcmVxdWVzdHNcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLl9vbk5hdGl2ZVJlc3BvbnNlID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgc2VsZi5fcHJvY2Vzc1Jlc3BvbnNlKHJlc3BvbnNlKTtcbiAgfTtcblxuICAvLyBQZXJmb3JtIHRoZSBmaXJzdCByZXF1ZXN0XG4gIHRoaXMuX3BlcmZvcm1SZXF1ZXN0KCk7XG59XG5SZWRpcmVjdGFibGVSZXF1ZXN0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoV3JpdGFibGUucHJvdG90eXBlKTtcblxuUmVkaXJlY3RhYmxlUmVxdWVzdC5wcm90b3R5cGUuYWJvcnQgPSBmdW5jdGlvbiAoKSB7XG4gIGRlc3Ryb3lSZXF1ZXN0KHRoaXMuX2N1cnJlbnRSZXF1ZXN0KTtcbiAgdGhpcy5fY3VycmVudFJlcXVlc3QuYWJvcnQoKTtcbiAgdGhpcy5lbWl0KFwiYWJvcnRcIik7XG59O1xuXG5SZWRpcmVjdGFibGVSZXF1ZXN0LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKGVycm9yKSB7XG4gIGRlc3Ryb3lSZXF1ZXN0KHRoaXMuX2N1cnJlbnRSZXF1ZXN0LCBlcnJvcik7XG4gIGRlc3Ryb3kuY2FsbCh0aGlzLCBlcnJvcik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gV3JpdGVzIGJ1ZmZlcmVkIGRhdGEgdG8gdGhlIGN1cnJlbnQgbmF0aXZlIHJlcXVlc3RcblJlZGlyZWN0YWJsZVJlcXVlc3QucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKGRhdGEsIGVuY29kaW5nLCBjYWxsYmFjaykge1xuICAvLyBXcml0aW5nIGlzIG5vdCBhbGxvd2VkIGlmIGVuZCBoYXMgYmVlbiBjYWxsZWRcbiAgaWYgKHRoaXMuX2VuZGluZykge1xuICAgIHRocm93IG5ldyBXcml0ZUFmdGVyRW5kRXJyb3IoKTtcbiAgfVxuXG4gIC8vIFZhbGlkYXRlIGlucHV0IGFuZCBzaGlmdCBwYXJhbWV0ZXJzIGlmIG5lY2Vzc2FyeVxuICBpZiAoIWlzU3RyaW5nKGRhdGEpICYmICFpc0J1ZmZlcihkYXRhKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJkYXRhIHNob3VsZCBiZSBhIHN0cmluZywgQnVmZmVyIG9yIFVpbnQ4QXJyYXlcIik7XG4gIH1cbiAgaWYgKGlzRnVuY3Rpb24oZW5jb2RpbmcpKSB7XG4gICAgY2FsbGJhY2sgPSBlbmNvZGluZztcbiAgICBlbmNvZGluZyA9IG51bGw7XG4gIH1cblxuICAvLyBJZ25vcmUgZW1wdHkgYnVmZmVycywgc2luY2Ugd3JpdGluZyB0aGVtIGRvZXNuJ3QgaW52b2tlIHRoZSBjYWxsYmFja1xuICAvLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvaXNzdWVzLzIyMDY2XG4gIGlmIChkYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIE9ubHkgd3JpdGUgd2hlbiB3ZSBkb24ndCBleGNlZWQgdGhlIG1heGltdW0gYm9keSBsZW5ndGhcbiAgaWYgKHRoaXMuX3JlcXVlc3RCb2R5TGVuZ3RoICsgZGF0YS5sZW5ndGggPD0gdGhpcy5fb3B0aW9ucy5tYXhCb2R5TGVuZ3RoKSB7XG4gICAgdGhpcy5fcmVxdWVzdEJvZHlMZW5ndGggKz0gZGF0YS5sZW5ndGg7XG4gICAgdGhpcy5fcmVxdWVzdEJvZHlCdWZmZXJzLnB1c2goeyBkYXRhOiBkYXRhLCBlbmNvZGluZzogZW5jb2RpbmcgfSk7XG4gICAgdGhpcy5fY3VycmVudFJlcXVlc3Qud3JpdGUoZGF0YSwgZW5jb2RpbmcsIGNhbGxiYWNrKTtcbiAgfVxuICAvLyBFcnJvciB3aGVuIHdlIGV4Y2VlZCB0aGUgbWF4aW11bSBib2R5IGxlbmd0aFxuICBlbHNlIHtcbiAgICB0aGlzLmVtaXQoXCJlcnJvclwiLCBuZXcgTWF4Qm9keUxlbmd0aEV4Y2VlZGVkRXJyb3IoKSk7XG4gICAgdGhpcy5hYm9ydCgpO1xuICB9XG59O1xuXG4vLyBFbmRzIHRoZSBjdXJyZW50IG5hdGl2ZSByZXF1ZXN0XG5SZWRpcmVjdGFibGVSZXF1ZXN0LnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbiAoZGF0YSwgZW5jb2RpbmcsIGNhbGxiYWNrKSB7XG4gIC8vIFNoaWZ0IHBhcmFtZXRlcnMgaWYgbmVjZXNzYXJ5XG4gIGlmIChpc0Z1bmN0aW9uKGRhdGEpKSB7XG4gICAgY2FsbGJhY2sgPSBkYXRhO1xuICAgIGRhdGEgPSBlbmNvZGluZyA9IG51bGw7XG4gIH1cbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbmNvZGluZykpIHtcbiAgICBjYWxsYmFjayA9IGVuY29kaW5nO1xuICAgIGVuY29kaW5nID0gbnVsbDtcbiAgfVxuXG4gIC8vIFdyaXRlIGRhdGEgaWYgbmVlZGVkIGFuZCBlbmRcbiAgaWYgKCFkYXRhKSB7XG4gICAgdGhpcy5fZW5kZWQgPSB0aGlzLl9lbmRpbmcgPSB0cnVlO1xuICAgIHRoaXMuX2N1cnJlbnRSZXF1ZXN0LmVuZChudWxsLCBudWxsLCBjYWxsYmFjayk7XG4gIH1cbiAgZWxzZSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBjdXJyZW50UmVxdWVzdCA9IHRoaXMuX2N1cnJlbnRSZXF1ZXN0O1xuICAgIHRoaXMud3JpdGUoZGF0YSwgZW5jb2RpbmcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYuX2VuZGVkID0gdHJ1ZTtcbiAgICAgIGN1cnJlbnRSZXF1ZXN0LmVuZChudWxsLCBudWxsLCBjYWxsYmFjayk7XG4gICAgfSk7XG4gICAgdGhpcy5fZW5kaW5nID0gdHJ1ZTtcbiAgfVxufTtcblxuLy8gU2V0cyBhIGhlYWRlciB2YWx1ZSBvbiB0aGUgY3VycmVudCBuYXRpdmUgcmVxdWVzdFxuUmVkaXJlY3RhYmxlUmVxdWVzdC5wcm90b3R5cGUuc2V0SGVhZGVyID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gIHRoaXMuX29wdGlvbnMuaGVhZGVyc1tuYW1lXSA9IHZhbHVlO1xuICB0aGlzLl9jdXJyZW50UmVxdWVzdC5zZXRIZWFkZXIobmFtZSwgdmFsdWUpO1xufTtcblxuLy8gQ2xlYXJzIGEgaGVhZGVyIHZhbHVlIG9uIHRoZSBjdXJyZW50IG5hdGl2ZSByZXF1ZXN0XG5SZWRpcmVjdGFibGVSZXF1ZXN0LnByb3RvdHlwZS5yZW1vdmVIZWFkZXIgPSBmdW5jdGlvbiAobmFtZSkge1xuICBkZWxldGUgdGhpcy5fb3B0aW9ucy5oZWFkZXJzW25hbWVdO1xuICB0aGlzLl9jdXJyZW50UmVxdWVzdC5yZW1vdmVIZWFkZXIobmFtZSk7XG59O1xuXG4vLyBHbG9iYWwgdGltZW91dCBmb3IgYWxsIHVuZGVybHlpbmcgcmVxdWVzdHNcblJlZGlyZWN0YWJsZVJlcXVlc3QucHJvdG90eXBlLnNldFRpbWVvdXQgPSBmdW5jdGlvbiAobXNlY3MsIGNhbGxiYWNrKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICAvLyBEZXN0cm95cyB0aGUgc29ja2V0IG9uIHRpbWVvdXRcbiAgZnVuY3Rpb24gZGVzdHJveU9uVGltZW91dChzb2NrZXQpIHtcbiAgICBzb2NrZXQuc2V0VGltZW91dChtc2Vjcyk7XG4gICAgc29ja2V0LnJlbW92ZUxpc3RlbmVyKFwidGltZW91dFwiLCBzb2NrZXQuZGVzdHJveSk7XG4gICAgc29ja2V0LmFkZExpc3RlbmVyKFwidGltZW91dFwiLCBzb2NrZXQuZGVzdHJveSk7XG4gIH1cblxuICAvLyBTZXRzIHVwIGEgdGltZXIgdG8gdHJpZ2dlciBhIHRpbWVvdXQgZXZlbnRcbiAgZnVuY3Rpb24gc3RhcnRUaW1lcihzb2NrZXQpIHtcbiAgICBpZiAoc2VsZi5fdGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuX3RpbWVvdXQpO1xuICAgIH1cbiAgICBzZWxmLl90aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLmVtaXQoXCJ0aW1lb3V0XCIpO1xuICAgICAgY2xlYXJUaW1lcigpO1xuICAgIH0sIG1zZWNzKTtcbiAgICBkZXN0cm95T25UaW1lb3V0KHNvY2tldCk7XG4gIH1cblxuICAvLyBTdG9wcyBhIHRpbWVvdXQgZnJvbSB0cmlnZ2VyaW5nXG4gIGZ1bmN0aW9uIGNsZWFyVGltZXIoKSB7XG4gICAgLy8gQ2xlYXIgdGhlIHRpbWVvdXRcbiAgICBpZiAoc2VsZi5fdGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuX3RpbWVvdXQpO1xuICAgICAgc2VsZi5fdGltZW91dCA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gQ2xlYW4gdXAgYWxsIGF0dGFjaGVkIGxpc3RlbmVyc1xuICAgIHNlbGYucmVtb3ZlTGlzdGVuZXIoXCJhYm9ydFwiLCBjbGVhclRpbWVyKTtcbiAgICBzZWxmLnJlbW92ZUxpc3RlbmVyKFwiZXJyb3JcIiwgY2xlYXJUaW1lcik7XG4gICAgc2VsZi5yZW1vdmVMaXN0ZW5lcihcInJlc3BvbnNlXCIsIGNsZWFyVGltZXIpO1xuICAgIHNlbGYucmVtb3ZlTGlzdGVuZXIoXCJjbG9zZVwiLCBjbGVhclRpbWVyKTtcbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgIHNlbGYucmVtb3ZlTGlzdGVuZXIoXCJ0aW1lb3V0XCIsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgaWYgKCFzZWxmLnNvY2tldCkge1xuICAgICAgc2VsZi5fY3VycmVudFJlcXVlc3QucmVtb3ZlTGlzdGVuZXIoXCJzb2NrZXRcIiwgc3RhcnRUaW1lcik7XG4gICAgfVxuICB9XG5cbiAgLy8gQXR0YWNoIGNhbGxiYWNrIGlmIHBhc3NlZFxuICBpZiAoY2FsbGJhY2spIHtcbiAgICB0aGlzLm9uKFwidGltZW91dFwiLCBjYWxsYmFjayk7XG4gIH1cblxuICAvLyBTdGFydCB0aGUgdGltZXIgaWYgb3Igd2hlbiB0aGUgc29ja2V0IGlzIG9wZW5lZFxuICBpZiAodGhpcy5zb2NrZXQpIHtcbiAgICBzdGFydFRpbWVyKHRoaXMuc29ja2V0KTtcbiAgfVxuICBlbHNlIHtcbiAgICB0aGlzLl9jdXJyZW50UmVxdWVzdC5vbmNlKFwic29ja2V0XCIsIHN0YXJ0VGltZXIpO1xuICB9XG5cbiAgLy8gQ2xlYW4gdXAgb24gZXZlbnRzXG4gIHRoaXMub24oXCJzb2NrZXRcIiwgZGVzdHJveU9uVGltZW91dCk7XG4gIHRoaXMub24oXCJhYm9ydFwiLCBjbGVhclRpbWVyKTtcbiAgdGhpcy5vbihcImVycm9yXCIsIGNsZWFyVGltZXIpO1xuICB0aGlzLm9uKFwicmVzcG9uc2VcIiwgY2xlYXJUaW1lcik7XG4gIHRoaXMub24oXCJjbG9zZVwiLCBjbGVhclRpbWVyKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIFByb3h5IGFsbCBvdGhlciBwdWJsaWMgQ2xpZW50UmVxdWVzdCBtZXRob2RzXG5bXG4gIFwiZmx1c2hIZWFkZXJzXCIsIFwiZ2V0SGVhZGVyXCIsXG4gIFwic2V0Tm9EZWxheVwiLCBcInNldFNvY2tldEtlZXBBbGl2ZVwiLFxuXS5mb3JFYWNoKGZ1bmN0aW9uIChtZXRob2QpIHtcbiAgUmVkaXJlY3RhYmxlUmVxdWVzdC5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRSZXF1ZXN0W21ldGhvZF0oYSwgYik7XG4gIH07XG59KTtcblxuLy8gUHJveHkgYWxsIHB1YmxpYyBDbGllbnRSZXF1ZXN0IHByb3BlcnRpZXNcbltcImFib3J0ZWRcIiwgXCJjb25uZWN0aW9uXCIsIFwic29ja2V0XCJdLmZvckVhY2goZnVuY3Rpb24gKHByb3BlcnR5KSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZWRpcmVjdGFibGVSZXF1ZXN0LnByb3RvdHlwZSwgcHJvcGVydHksIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuX2N1cnJlbnRSZXF1ZXN0W3Byb3BlcnR5XTsgfSxcbiAgfSk7XG59KTtcblxuUmVkaXJlY3RhYmxlUmVxdWVzdC5wcm90b3R5cGUuX3Nhbml0aXplT3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIC8vIEVuc3VyZSBoZWFkZXJzIGFyZSBhbHdheXMgcHJlc2VudFxuICBpZiAoIW9wdGlvbnMuaGVhZGVycykge1xuICAgIG9wdGlvbnMuaGVhZGVycyA9IHt9O1xuICB9XG5cbiAgLy8gU2luY2UgaHR0cC5yZXF1ZXN0IHRyZWF0cyBob3N0IGFzIGFuIGFsaWFzIG9mIGhvc3RuYW1lLFxuICAvLyBidXQgdGhlIHVybCBtb2R1bGUgaW50ZXJwcmV0cyBob3N0IGFzIGhvc3RuYW1lIHBsdXMgcG9ydCxcbiAgLy8gZWxpbWluYXRlIHRoZSBob3N0IHByb3BlcnR5IHRvIGF2b2lkIGNvbmZ1c2lvbi5cbiAgaWYgKG9wdGlvbnMuaG9zdCkge1xuICAgIC8vIFVzZSBob3N0bmFtZSBpZiBzZXQsIGJlY2F1c2UgaXQgaGFzIHByZWNlZGVuY2VcbiAgICBpZiAoIW9wdGlvbnMuaG9zdG5hbWUpIHtcbiAgICAgIG9wdGlvbnMuaG9zdG5hbWUgPSBvcHRpb25zLmhvc3Q7XG4gICAgfVxuICAgIGRlbGV0ZSBvcHRpb25zLmhvc3Q7XG4gIH1cblxuICAvLyBDb21wbGV0ZSB0aGUgVVJMIG9iamVjdCB3aGVuIG5lY2Vzc2FyeVxuICBpZiAoIW9wdGlvbnMucGF0aG5hbWUgJiYgb3B0aW9ucy5wYXRoKSB7XG4gICAgdmFyIHNlYXJjaFBvcyA9IG9wdGlvbnMucGF0aC5pbmRleE9mKFwiP1wiKTtcbiAgICBpZiAoc2VhcmNoUG9zIDwgMCkge1xuICAgICAgb3B0aW9ucy5wYXRobmFtZSA9IG9wdGlvbnMucGF0aDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBvcHRpb25zLnBhdGhuYW1lID0gb3B0aW9ucy5wYXRoLnN1YnN0cmluZygwLCBzZWFyY2hQb3MpO1xuICAgICAgb3B0aW9ucy5zZWFyY2ggPSBvcHRpb25zLnBhdGguc3Vic3RyaW5nKHNlYXJjaFBvcyk7XG4gICAgfVxuICB9XG59O1xuXG5cbi8vIEV4ZWN1dGVzIHRoZSBuZXh0IG5hdGl2ZSByZXF1ZXN0IChpbml0aWFsIG9yIHJlZGlyZWN0KVxuUmVkaXJlY3RhYmxlUmVxdWVzdC5wcm90b3R5cGUuX3BlcmZvcm1SZXF1ZXN0ID0gZnVuY3Rpb24gKCkge1xuICAvLyBMb2FkIHRoZSBuYXRpdmUgcHJvdG9jb2xcbiAgdmFyIHByb3RvY29sID0gdGhpcy5fb3B0aW9ucy5wcm90b2NvbDtcbiAgdmFyIG5hdGl2ZVByb3RvY29sID0gdGhpcy5fb3B0aW9ucy5uYXRpdmVQcm90b2NvbHNbcHJvdG9jb2xdO1xuICBpZiAoIW5hdGl2ZVByb3RvY29sKSB7XG4gICAgdGhpcy5lbWl0KFwiZXJyb3JcIiwgbmV3IFR5cGVFcnJvcihcIlVuc3VwcG9ydGVkIHByb3RvY29sIFwiICsgcHJvdG9jb2wpKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBJZiBzcGVjaWZpZWQsIHVzZSB0aGUgYWdlbnQgY29ycmVzcG9uZGluZyB0byB0aGUgcHJvdG9jb2xcbiAgLy8gKEhUVFAgYW5kIEhUVFBTIHVzZSBkaWZmZXJlbnQgdHlwZXMgb2YgYWdlbnRzKVxuICBpZiAodGhpcy5fb3B0aW9ucy5hZ2VudHMpIHtcbiAgICB2YXIgc2NoZW1lID0gcHJvdG9jb2wuc2xpY2UoMCwgLTEpO1xuICAgIHRoaXMuX29wdGlvbnMuYWdlbnQgPSB0aGlzLl9vcHRpb25zLmFnZW50c1tzY2hlbWVdO1xuICB9XG5cbiAgLy8gQ3JlYXRlIHRoZSBuYXRpdmUgcmVxdWVzdCBhbmQgc2V0IHVwIGl0cyBldmVudCBoYW5kbGVyc1xuICB2YXIgcmVxdWVzdCA9IHRoaXMuX2N1cnJlbnRSZXF1ZXN0ID1cbiAgICAgICAgbmF0aXZlUHJvdG9jb2wucmVxdWVzdCh0aGlzLl9vcHRpb25zLCB0aGlzLl9vbk5hdGl2ZVJlc3BvbnNlKTtcbiAgcmVxdWVzdC5fcmVkaXJlY3RhYmxlID0gdGhpcztcbiAgZm9yICh2YXIgZXZlbnQgb2YgZXZlbnRzKSB7XG4gICAgcmVxdWVzdC5vbihldmVudCwgZXZlbnRIYW5kbGVyc1tldmVudF0pO1xuICB9XG5cbiAgLy8gUkZDNzIzMMKnNS4zLjE6IFdoZW4gbWFraW5nIGEgcmVxdWVzdCBkaXJlY3RseSB0byBhbiBvcmlnaW4gc2VydmVyLCBb4oCmXVxuICAvLyBhIGNsaWVudCBNVVNUIHNlbmQgb25seSB0aGUgYWJzb2x1dGUgcGF0aCBb4oCmXSBhcyB0aGUgcmVxdWVzdC10YXJnZXQuXG4gIHRoaXMuX2N1cnJlbnRVcmwgPSAvXlxcLy8udGVzdCh0aGlzLl9vcHRpb25zLnBhdGgpID9cbiAgICB1cmwuZm9ybWF0KHRoaXMuX29wdGlvbnMpIDpcbiAgICAvLyBXaGVuIG1ha2luZyBhIHJlcXVlc3QgdG8gYSBwcm94eSwgW+KApl1cbiAgICAvLyBhIGNsaWVudCBNVVNUIHNlbmQgdGhlIHRhcmdldCBVUkkgaW4gYWJzb2x1dGUtZm9ybSBb4oCmXS5cbiAgICB0aGlzLl9vcHRpb25zLnBhdGg7XG5cbiAgLy8gRW5kIGEgcmVkaXJlY3RlZCByZXF1ZXN0XG4gIC8vIChUaGUgZmlyc3QgcmVxdWVzdCBtdXN0IGJlIGVuZGVkIGV4cGxpY2l0bHkgd2l0aCBSZWRpcmVjdGFibGVSZXF1ZXN0I2VuZClcbiAgaWYgKHRoaXMuX2lzUmVkaXJlY3QpIHtcbiAgICAvLyBXcml0ZSB0aGUgcmVxdWVzdCBlbnRpdHkgYW5kIGVuZFxuICAgIHZhciBpID0gMDtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGJ1ZmZlcnMgPSB0aGlzLl9yZXF1ZXN0Qm9keUJ1ZmZlcnM7XG4gICAgKGZ1bmN0aW9uIHdyaXRlTmV4dChlcnJvcikge1xuICAgICAgLy8gT25seSB3cml0ZSBpZiB0aGlzIHJlcXVlc3QgaGFzIG5vdCBiZWVuIHJlZGlyZWN0ZWQgeWV0XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgICAgaWYgKHJlcXVlc3QgPT09IHNlbGYuX2N1cnJlbnRSZXF1ZXN0KSB7XG4gICAgICAgIC8vIFJlcG9ydCBhbnkgd3JpdGUgZXJyb3JzXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICBzZWxmLmVtaXQoXCJlcnJvclwiLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gV3JpdGUgdGhlIG5leHQgYnVmZmVyIGlmIHRoZXJlIGFyZSBzdGlsbCBsZWZ0XG4gICAgICAgIGVsc2UgaWYgKGkgPCBidWZmZXJzLmxlbmd0aCkge1xuICAgICAgICAgIHZhciBidWZmZXIgPSBidWZmZXJzW2krK107XG4gICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgICAgICBpZiAoIXJlcXVlc3QuZmluaXNoZWQpIHtcbiAgICAgICAgICAgIHJlcXVlc3Qud3JpdGUoYnVmZmVyLmRhdGEsIGJ1ZmZlci5lbmNvZGluZywgd3JpdGVOZXh0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gRW5kIHRoZSByZXF1ZXN0IGlmIGBlbmRgIGhhcyBiZWVuIGNhbGxlZCBvbiB1c1xuICAgICAgICBlbHNlIGlmIChzZWxmLl9lbmRlZCkge1xuICAgICAgICAgIHJlcXVlc3QuZW5kKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KCkpO1xuICB9XG59O1xuXG4vLyBQcm9jZXNzZXMgYSByZXNwb25zZSBmcm9tIHRoZSBjdXJyZW50IG5hdGl2ZSByZXF1ZXN0XG5SZWRpcmVjdGFibGVSZXF1ZXN0LnByb3RvdHlwZS5fcHJvY2Vzc1Jlc3BvbnNlID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gIC8vIFN0b3JlIHRoZSByZWRpcmVjdGVkIHJlc3BvbnNlXG4gIHZhciBzdGF0dXNDb2RlID0gcmVzcG9uc2Uuc3RhdHVzQ29kZTtcbiAgaWYgKHRoaXMuX29wdGlvbnMudHJhY2tSZWRpcmVjdHMpIHtcbiAgICB0aGlzLl9yZWRpcmVjdHMucHVzaCh7XG4gICAgICB1cmw6IHRoaXMuX2N1cnJlbnRVcmwsXG4gICAgICBoZWFkZXJzOiByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgc3RhdHVzQ29kZTogc3RhdHVzQ29kZSxcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFJGQzcyMzHCpzYuNDogVGhlIDN4eCAoUmVkaXJlY3Rpb24pIGNsYXNzIG9mIHN0YXR1cyBjb2RlIGluZGljYXRlc1xuICAvLyB0aGF0IGZ1cnRoZXIgYWN0aW9uIG5lZWRzIHRvIGJlIHRha2VuIGJ5IHRoZSB1c2VyIGFnZW50IGluIG9yZGVyIHRvXG4gIC8vIGZ1bGZpbGwgdGhlIHJlcXVlc3QuIElmIGEgTG9jYXRpb24gaGVhZGVyIGZpZWxkIGlzIHByb3ZpZGVkLFxuICAvLyB0aGUgdXNlciBhZ2VudCBNQVkgYXV0b21hdGljYWxseSByZWRpcmVjdCBpdHMgcmVxdWVzdCB0byB0aGUgVVJJXG4gIC8vIHJlZmVyZW5jZWQgYnkgdGhlIExvY2F0aW9uIGZpZWxkIHZhbHVlLFxuICAvLyBldmVuIGlmIHRoZSBzcGVjaWZpYyBzdGF0dXMgY29kZSBpcyBub3QgdW5kZXJzdG9vZC5cblxuICAvLyBJZiB0aGUgcmVzcG9uc2UgaXMgbm90IGEgcmVkaXJlY3Q7IHJldHVybiBpdCBhcy1pc1xuICB2YXIgbG9jYXRpb24gPSByZXNwb25zZS5oZWFkZXJzLmxvY2F0aW9uO1xuICBpZiAoIWxvY2F0aW9uIHx8IHRoaXMuX29wdGlvbnMuZm9sbG93UmVkaXJlY3RzID09PSBmYWxzZSB8fFxuICAgICAgc3RhdHVzQ29kZSA8IDMwMCB8fCBzdGF0dXNDb2RlID49IDQwMCkge1xuICAgIHJlc3BvbnNlLnJlc3BvbnNlVXJsID0gdGhpcy5fY3VycmVudFVybDtcbiAgICByZXNwb25zZS5yZWRpcmVjdHMgPSB0aGlzLl9yZWRpcmVjdHM7XG4gICAgdGhpcy5lbWl0KFwicmVzcG9uc2VcIiwgcmVzcG9uc2UpO1xuXG4gICAgLy8gQ2xlYW4gdXBcbiAgICB0aGlzLl9yZXF1ZXN0Qm9keUJ1ZmZlcnMgPSBbXTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBUaGUgcmVzcG9uc2UgaXMgYSByZWRpcmVjdCwgc28gYWJvcnQgdGhlIGN1cnJlbnQgcmVxdWVzdFxuICBkZXN0cm95UmVxdWVzdCh0aGlzLl9jdXJyZW50UmVxdWVzdCk7XG4gIC8vIERpc2NhcmQgdGhlIHJlbWFpbmRlciBvZiB0aGUgcmVzcG9uc2UgdG8gYXZvaWQgd2FpdGluZyBmb3IgZGF0YVxuICByZXNwb25zZS5kZXN0cm95KCk7XG5cbiAgLy8gUkZDNzIzMcKnNi40OiBBIGNsaWVudCBTSE9VTEQgZGV0ZWN0IGFuZCBpbnRlcnZlbmVcbiAgLy8gaW4gY3ljbGljYWwgcmVkaXJlY3Rpb25zIChpLmUuLCBcImluZmluaXRlXCIgcmVkaXJlY3Rpb24gbG9vcHMpLlxuICBpZiAoKyt0aGlzLl9yZWRpcmVjdENvdW50ID4gdGhpcy5fb3B0aW9ucy5tYXhSZWRpcmVjdHMpIHtcbiAgICB0aGlzLmVtaXQoXCJlcnJvclwiLCBuZXcgVG9vTWFueVJlZGlyZWN0c0Vycm9yKCkpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIFN0b3JlIHRoZSByZXF1ZXN0IGhlYWRlcnMgaWYgYXBwbGljYWJsZVxuICB2YXIgcmVxdWVzdEhlYWRlcnM7XG4gIHZhciBiZWZvcmVSZWRpcmVjdCA9IHRoaXMuX29wdGlvbnMuYmVmb3JlUmVkaXJlY3Q7XG4gIGlmIChiZWZvcmVSZWRpcmVjdCkge1xuICAgIHJlcXVlc3RIZWFkZXJzID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAvLyBUaGUgSG9zdCBoZWFkZXIgd2FzIHNldCBieSBuYXRpdmVQcm90b2NvbC5yZXF1ZXN0XG4gICAgICBIb3N0OiByZXNwb25zZS5yZXEuZ2V0SGVhZGVyKFwiaG9zdFwiKSxcbiAgICB9LCB0aGlzLl9vcHRpb25zLmhlYWRlcnMpO1xuICB9XG5cbiAgLy8gUkZDNzIzMcKnNi40OiBBdXRvbWF0aWMgcmVkaXJlY3Rpb24gbmVlZHMgdG8gZG9uZSB3aXRoXG4gIC8vIGNhcmUgZm9yIG1ldGhvZHMgbm90IGtub3duIHRvIGJlIHNhZmUsIFvigKZdXG4gIC8vIFJGQzcyMzHCpzYuNC4y4oCTMzogRm9yIGhpc3RvcmljYWwgcmVhc29ucywgYSB1c2VyIGFnZW50IE1BWSBjaGFuZ2VcbiAgLy8gdGhlIHJlcXVlc3QgbWV0aG9kIGZyb20gUE9TVCB0byBHRVQgZm9yIHRoZSBzdWJzZXF1ZW50IHJlcXVlc3QuXG4gIHZhciBtZXRob2QgPSB0aGlzLl9vcHRpb25zLm1ldGhvZDtcbiAgaWYgKChzdGF0dXNDb2RlID09PSAzMDEgfHwgc3RhdHVzQ29kZSA9PT0gMzAyKSAmJiB0aGlzLl9vcHRpb25zLm1ldGhvZCA9PT0gXCJQT1NUXCIgfHxcbiAgICAgIC8vIFJGQzcyMzHCpzYuNC40OiBUaGUgMzAzIChTZWUgT3RoZXIpIHN0YXR1cyBjb2RlIGluZGljYXRlcyB0aGF0XG4gICAgICAvLyB0aGUgc2VydmVyIGlzIHJlZGlyZWN0aW5nIHRoZSB1c2VyIGFnZW50IHRvIGEgZGlmZmVyZW50IHJlc291cmNlIFvigKZdXG4gICAgICAvLyBBIHVzZXIgYWdlbnQgY2FuIHBlcmZvcm0gYSByZXRyaWV2YWwgcmVxdWVzdCB0YXJnZXRpbmcgdGhhdCBVUklcbiAgICAgIC8vIChhIEdFVCBvciBIRUFEIHJlcXVlc3QgaWYgdXNpbmcgSFRUUCkgW+KApl1cbiAgICAgIChzdGF0dXNDb2RlID09PSAzMDMpICYmICEvXig/OkdFVHxIRUFEKSQvLnRlc3QodGhpcy5fb3B0aW9ucy5tZXRob2QpKSB7XG4gICAgdGhpcy5fb3B0aW9ucy5tZXRob2QgPSBcIkdFVFwiO1xuICAgIC8vIERyb3AgYSBwb3NzaWJsZSBlbnRpdHkgYW5kIGhlYWRlcnMgcmVsYXRlZCB0byBpdFxuICAgIHRoaXMuX3JlcXVlc3RCb2R5QnVmZmVycyA9IFtdO1xuICAgIHJlbW92ZU1hdGNoaW5nSGVhZGVycygvXmNvbnRlbnQtL2ksIHRoaXMuX29wdGlvbnMuaGVhZGVycyk7XG4gIH1cblxuICAvLyBEcm9wIHRoZSBIb3N0IGhlYWRlciwgYXMgdGhlIHJlZGlyZWN0IG1pZ2h0IGxlYWQgdG8gYSBkaWZmZXJlbnQgaG9zdFxuICB2YXIgY3VycmVudEhvc3RIZWFkZXIgPSByZW1vdmVNYXRjaGluZ0hlYWRlcnMoL15ob3N0JC9pLCB0aGlzLl9vcHRpb25zLmhlYWRlcnMpO1xuXG4gIC8vIElmIHRoZSByZWRpcmVjdCBpcyByZWxhdGl2ZSwgY2Fycnkgb3ZlciB0aGUgaG9zdCBvZiB0aGUgbGFzdCByZXF1ZXN0XG4gIHZhciBjdXJyZW50VXJsUGFydHMgPSB1cmwucGFyc2UodGhpcy5fY3VycmVudFVybCk7XG4gIHZhciBjdXJyZW50SG9zdCA9IGN1cnJlbnRIb3N0SGVhZGVyIHx8IGN1cnJlbnRVcmxQYXJ0cy5ob3N0O1xuICB2YXIgY3VycmVudFVybCA9IC9eXFx3KzovLnRlc3QobG9jYXRpb24pID8gdGhpcy5fY3VycmVudFVybCA6XG4gICAgdXJsLmZvcm1hdChPYmplY3QuYXNzaWduKGN1cnJlbnRVcmxQYXJ0cywgeyBob3N0OiBjdXJyZW50SG9zdCB9KSk7XG5cbiAgLy8gRGV0ZXJtaW5lIHRoZSBVUkwgb2YgdGhlIHJlZGlyZWN0aW9uXG4gIHZhciByZWRpcmVjdFVybDtcbiAgdHJ5IHtcbiAgICByZWRpcmVjdFVybCA9IHVybC5yZXNvbHZlKGN1cnJlbnRVcmwsIGxvY2F0aW9uKTtcbiAgfVxuICBjYXRjaCAoY2F1c2UpIHtcbiAgICB0aGlzLmVtaXQoXCJlcnJvclwiLCBuZXcgUmVkaXJlY3Rpb25FcnJvcih7IGNhdXNlOiBjYXVzZSB9KSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gQ3JlYXRlIHRoZSByZWRpcmVjdGVkIHJlcXVlc3RcbiAgZGVidWcoXCJyZWRpcmVjdGluZyB0b1wiLCByZWRpcmVjdFVybCk7XG4gIHRoaXMuX2lzUmVkaXJlY3QgPSB0cnVlO1xuICB2YXIgcmVkaXJlY3RVcmxQYXJ0cyA9IHVybC5wYXJzZShyZWRpcmVjdFVybCk7XG4gIE9iamVjdC5hc3NpZ24odGhpcy5fb3B0aW9ucywgcmVkaXJlY3RVcmxQYXJ0cyk7XG5cbiAgLy8gRHJvcCBjb25maWRlbnRpYWwgaGVhZGVycyB3aGVuIHJlZGlyZWN0aW5nIHRvIGEgbGVzcyBzZWN1cmUgcHJvdG9jb2xcbiAgLy8gb3IgdG8gYSBkaWZmZXJlbnQgZG9tYWluIHRoYXQgaXMgbm90IGEgc3VwZXJkb21haW5cbiAgaWYgKHJlZGlyZWN0VXJsUGFydHMucHJvdG9jb2wgIT09IGN1cnJlbnRVcmxQYXJ0cy5wcm90b2NvbCAmJlxuICAgICByZWRpcmVjdFVybFBhcnRzLnByb3RvY29sICE9PSBcImh0dHBzOlwiIHx8XG4gICAgIHJlZGlyZWN0VXJsUGFydHMuaG9zdCAhPT0gY3VycmVudEhvc3QgJiZcbiAgICAgIWlzU3ViZG9tYWluKHJlZGlyZWN0VXJsUGFydHMuaG9zdCwgY3VycmVudEhvc3QpKSB7XG4gICAgcmVtb3ZlTWF0Y2hpbmdIZWFkZXJzKC9eKD86YXV0aG9yaXphdGlvbnxjb29raWUpJC9pLCB0aGlzLl9vcHRpb25zLmhlYWRlcnMpO1xuICB9XG5cbiAgLy8gRXZhbHVhdGUgdGhlIGJlZm9yZVJlZGlyZWN0IGNhbGxiYWNrXG4gIGlmIChpc0Z1bmN0aW9uKGJlZm9yZVJlZGlyZWN0KSkge1xuICAgIHZhciByZXNwb25zZURldGFpbHMgPSB7XG4gICAgICBoZWFkZXJzOiByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgc3RhdHVzQ29kZTogc3RhdHVzQ29kZSxcbiAgICB9O1xuICAgIHZhciByZXF1ZXN0RGV0YWlscyA9IHtcbiAgICAgIHVybDogY3VycmVudFVybCxcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgaGVhZGVyczogcmVxdWVzdEhlYWRlcnMsXG4gICAgfTtcbiAgICB0cnkge1xuICAgICAgYmVmb3JlUmVkaXJlY3QodGhpcy5fb3B0aW9ucywgcmVzcG9uc2VEZXRhaWxzLCByZXF1ZXN0RGV0YWlscyk7XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgIHRoaXMuZW1pdChcImVycm9yXCIsIGVycik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3Nhbml0aXplT3B0aW9ucyh0aGlzLl9vcHRpb25zKTtcbiAgfVxuXG4gIC8vIFBlcmZvcm0gdGhlIHJlZGlyZWN0ZWQgcmVxdWVzdFxuICB0cnkge1xuICAgIHRoaXMuX3BlcmZvcm1SZXF1ZXN0KCk7XG4gIH1cbiAgY2F0Y2ggKGNhdXNlKSB7XG4gICAgdGhpcy5lbWl0KFwiZXJyb3JcIiwgbmV3IFJlZGlyZWN0aW9uRXJyb3IoeyBjYXVzZTogY2F1c2UgfSkpO1xuICB9XG59O1xuXG4vLyBXcmFwcyB0aGUga2V5L3ZhbHVlIG9iamVjdCBvZiBwcm90b2NvbHMgd2l0aCByZWRpcmVjdCBmdW5jdGlvbmFsaXR5XG5mdW5jdGlvbiB3cmFwKHByb3RvY29scykge1xuICAvLyBEZWZhdWx0IHNldHRpbmdzXG4gIHZhciBleHBvcnRzID0ge1xuICAgIG1heFJlZGlyZWN0czogMjEsXG4gICAgbWF4Qm9keUxlbmd0aDogMTAgKiAxMDI0ICogMTAyNCxcbiAgfTtcblxuICAvLyBXcmFwIGVhY2ggcHJvdG9jb2xcbiAgdmFyIG5hdGl2ZVByb3RvY29scyA9IHt9O1xuICBPYmplY3Qua2V5cyhwcm90b2NvbHMpLmZvckVhY2goZnVuY3Rpb24gKHNjaGVtZSkge1xuICAgIHZhciBwcm90b2NvbCA9IHNjaGVtZSArIFwiOlwiO1xuICAgIHZhciBuYXRpdmVQcm90b2NvbCA9IG5hdGl2ZVByb3RvY29sc1twcm90b2NvbF0gPSBwcm90b2NvbHNbc2NoZW1lXTtcbiAgICB2YXIgd3JhcHBlZFByb3RvY29sID0gZXhwb3J0c1tzY2hlbWVdID0gT2JqZWN0LmNyZWF0ZShuYXRpdmVQcm90b2NvbCk7XG5cbiAgICAvLyBFeGVjdXRlcyBhIHJlcXVlc3QsIGZvbGxvd2luZyByZWRpcmVjdHNcbiAgICBmdW5jdGlvbiByZXF1ZXN0KGlucHV0LCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgICAgLy8gUGFyc2UgcGFyYW1ldGVyc1xuICAgICAgaWYgKGlzU3RyaW5nKGlucHV0KSkge1xuICAgICAgICB2YXIgcGFyc2VkO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHBhcnNlZCA9IHVybFRvT3B0aW9ucyhuZXcgVVJMKGlucHV0KSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgcGFyc2VkID0gdXJsLnBhcnNlKGlucHV0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzU3RyaW5nKHBhcnNlZC5wcm90b2NvbCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFVybEVycm9yKHsgaW5wdXQgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaW5wdXQgPSBwYXJzZWQ7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChVUkwgJiYgKGlucHV0IGluc3RhbmNlb2YgVVJMKSkge1xuICAgICAgICBpbnB1dCA9IHVybFRvT3B0aW9ucyhpbnB1dCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xuICAgICAgICBvcHRpb25zID0gaW5wdXQ7XG4gICAgICAgIGlucHV0ID0geyBwcm90b2NvbDogcHJvdG9jb2wgfTtcbiAgICAgIH1cbiAgICAgIGlmIChpc0Z1bmN0aW9uKG9wdGlvbnMpKSB7XG4gICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcbiAgICAgICAgb3B0aW9ucyA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIFNldCBkZWZhdWx0c1xuICAgICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICBtYXhSZWRpcmVjdHM6IGV4cG9ydHMubWF4UmVkaXJlY3RzLFxuICAgICAgICBtYXhCb2R5TGVuZ3RoOiBleHBvcnRzLm1heEJvZHlMZW5ndGgsXG4gICAgICB9LCBpbnB1dCwgb3B0aW9ucyk7XG4gICAgICBvcHRpb25zLm5hdGl2ZVByb3RvY29scyA9IG5hdGl2ZVByb3RvY29scztcbiAgICAgIGlmICghaXNTdHJpbmcob3B0aW9ucy5ob3N0KSAmJiAhaXNTdHJpbmcob3B0aW9ucy5ob3N0bmFtZSkpIHtcbiAgICAgICAgb3B0aW9ucy5ob3N0bmFtZSA9IFwiOjoxXCI7XG4gICAgICB9XG5cbiAgICAgIGFzc2VydC5lcXVhbChvcHRpb25zLnByb3RvY29sLCBwcm90b2NvbCwgXCJwcm90b2NvbCBtaXNtYXRjaFwiKTtcbiAgICAgIGRlYnVnKFwib3B0aW9uc1wiLCBvcHRpb25zKTtcbiAgICAgIHJldHVybiBuZXcgUmVkaXJlY3RhYmxlUmVxdWVzdChvcHRpb25zLCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgLy8gRXhlY3V0ZXMgYSBHRVQgcmVxdWVzdCwgZm9sbG93aW5nIHJlZGlyZWN0c1xuICAgIGZ1bmN0aW9uIGdldChpbnB1dCwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICAgIHZhciB3cmFwcGVkUmVxdWVzdCA9IHdyYXBwZWRQcm90b2NvbC5yZXF1ZXN0KGlucHV0LCBvcHRpb25zLCBjYWxsYmFjayk7XG4gICAgICB3cmFwcGVkUmVxdWVzdC5lbmQoKTtcbiAgICAgIHJldHVybiB3cmFwcGVkUmVxdWVzdDtcbiAgICB9XG5cbiAgICAvLyBFeHBvc2UgdGhlIHByb3BlcnRpZXMgb24gdGhlIHdyYXBwZWQgcHJvdG9jb2xcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh3cmFwcGVkUHJvdG9jb2wsIHtcbiAgICAgIHJlcXVlc3Q6IHsgdmFsdWU6IHJlcXVlc3QsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSxcbiAgICAgIGdldDogeyB2YWx1ZTogZ2V0LCBjb25maWd1cmFibGU6IHRydWUsIGVudW1lcmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0sXG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gZXhwb3J0cztcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmZ1bmN0aW9uIG5vb3AoKSB7IC8qIGVtcHR5ICovIH1cblxuLy8gZnJvbSBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvYmxvYi9tYXN0ZXIvbGliL2ludGVybmFsL3VybC5qc1xuZnVuY3Rpb24gdXJsVG9PcHRpb25zKHVybE9iamVjdCkge1xuICB2YXIgb3B0aW9ucyA9IHtcbiAgICBwcm90b2NvbDogdXJsT2JqZWN0LnByb3RvY29sLFxuICAgIGhvc3RuYW1lOiB1cmxPYmplY3QuaG9zdG5hbWUuc3RhcnRzV2l0aChcIltcIikgP1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHVybE9iamVjdC5ob3N0bmFtZS5zbGljZSgxLCAtMSkgOlxuICAgICAgdXJsT2JqZWN0Lmhvc3RuYW1lLFxuICAgIGhhc2g6IHVybE9iamVjdC5oYXNoLFxuICAgIHNlYXJjaDogdXJsT2JqZWN0LnNlYXJjaCxcbiAgICBwYXRobmFtZTogdXJsT2JqZWN0LnBhdGhuYW1lLFxuICAgIHBhdGg6IHVybE9iamVjdC5wYXRobmFtZSArIHVybE9iamVjdC5zZWFyY2gsXG4gICAgaHJlZjogdXJsT2JqZWN0LmhyZWYsXG4gIH07XG4gIGlmICh1cmxPYmplY3QucG9ydCAhPT0gXCJcIikge1xuICAgIG9wdGlvbnMucG9ydCA9IE51bWJlcih1cmxPYmplY3QucG9ydCk7XG4gIH1cbiAgcmV0dXJuIG9wdGlvbnM7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZU1hdGNoaW5nSGVhZGVycyhyZWdleCwgaGVhZGVycykge1xuICB2YXIgbGFzdFZhbHVlO1xuICBmb3IgKHZhciBoZWFkZXIgaW4gaGVhZGVycykge1xuICAgIGlmIChyZWdleC50ZXN0KGhlYWRlcikpIHtcbiAgICAgIGxhc3RWYWx1ZSA9IGhlYWRlcnNbaGVhZGVyXTtcbiAgICAgIGRlbGV0ZSBoZWFkZXJzW2hlYWRlcl07XG4gICAgfVxuICB9XG4gIHJldHVybiAobGFzdFZhbHVlID09PSBudWxsIHx8IHR5cGVvZiBsYXN0VmFsdWUgPT09IFwidW5kZWZpbmVkXCIpID9cbiAgICB1bmRlZmluZWQgOiBTdHJpbmcobGFzdFZhbHVlKS50cmltKCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVycm9yVHlwZShjb2RlLCBtZXNzYWdlLCBiYXNlQ2xhc3MpIHtcbiAgLy8gQ3JlYXRlIGNvbnN0cnVjdG9yXG4gIGZ1bmN0aW9uIEN1c3RvbUVycm9yKHByb3BlcnRpZXMpIHtcbiAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCB0aGlzLmNvbnN0cnVjdG9yKTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMsIHByb3BlcnRpZXMgfHwge30pO1xuICAgIHRoaXMuY29kZSA9IGNvZGU7XG4gICAgdGhpcy5tZXNzYWdlID0gdGhpcy5jYXVzZSA/IG1lc3NhZ2UgKyBcIjogXCIgKyB0aGlzLmNhdXNlLm1lc3NhZ2UgOiBtZXNzYWdlO1xuICB9XG5cbiAgLy8gQXR0YWNoIGNvbnN0cnVjdG9yIGFuZCBzZXQgZGVmYXVsdCBwcm9wZXJ0aWVzXG4gIEN1c3RvbUVycm9yLnByb3RvdHlwZSA9IG5ldyAoYmFzZUNsYXNzIHx8IEVycm9yKSgpO1xuICBDdXN0b21FcnJvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDdXN0b21FcnJvcjtcbiAgQ3VzdG9tRXJyb3IucHJvdG90eXBlLm5hbWUgPSBcIkVycm9yIFtcIiArIGNvZGUgKyBcIl1cIjtcbiAgcmV0dXJuIEN1c3RvbUVycm9yO1xufVxuXG5mdW5jdGlvbiBkZXN0cm95UmVxdWVzdChyZXF1ZXN0LCBlcnJvcikge1xuICBmb3IgKHZhciBldmVudCBvZiBldmVudHMpIHtcbiAgICByZXF1ZXN0LnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBldmVudEhhbmRsZXJzW2V2ZW50XSk7XG4gIH1cbiAgcmVxdWVzdC5vbihcImVycm9yXCIsIG5vb3ApO1xuICByZXF1ZXN0LmRlc3Ryb3koZXJyb3IpO1xufVxuXG5mdW5jdGlvbiBpc1N1YmRvbWFpbihzdWJkb21haW4sIGRvbWFpbikge1xuICBhc3NlcnQoaXNTdHJpbmcoc3ViZG9tYWluKSAmJiBpc1N0cmluZyhkb21haW4pKTtcbiAgdmFyIGRvdCA9IHN1YmRvbWFpbi5sZW5ndGggLSBkb21haW4ubGVuZ3RoIC0gMTtcbiAgcmV0dXJuIGRvdCA+IDAgJiYgc3ViZG9tYWluW2RvdF0gPT09IFwiLlwiICYmIHN1YmRvbWFpbi5lbmRzV2l0aChkb21haW4pO1xufVxuXG5mdW5jdGlvbiBpc1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiIHx8IHZhbHVlIGluc3RhbmNlb2YgU3RyaW5nO1xufVxuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIjtcbn1cblxuZnVuY3Rpb24gaXNCdWZmZXIodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiAoXCJsZW5ndGhcIiBpbiB2YWx1ZSk7XG59XG5cbi8vIEV4cG9ydHNcbm1vZHVsZS5leHBvcnRzID0gd3JhcCh7IGh0dHA6IGh0dHAsIGh0dHBzOiBodHRwcyB9KTtcbm1vZHVsZS5leHBvcnRzLndyYXAgPSB3cmFwO1xuIiwidmFyIGh0dHBOYXRpdmUgICA9IHJlcXVpcmUoJ2h0dHAnKSxcbiAgICBodHRwc05hdGl2ZSAgPSByZXF1aXJlKCdodHRwcycpLFxuICAgIHdlYl9vICA9IHJlcXVpcmUoJy4vd2ViLW91dGdvaW5nJyksXG4gICAgY29tbW9uID0gcmVxdWlyZSgnLi4vY29tbW9uJyksXG4gICAgZm9sbG93UmVkaXJlY3RzID0gcmVxdWlyZSgnZm9sbG93LXJlZGlyZWN0cycpO1xuXG53ZWJfbyA9IE9iamVjdC5rZXlzKHdlYl9vKS5tYXAoZnVuY3Rpb24ocGFzcykge1xuICByZXR1cm4gd2ViX29bcGFzc107XG59KTtcblxudmFyIG5hdGl2ZUFnZW50cyA9IHsgaHR0cDogaHR0cE5hdGl2ZSwgaHR0cHM6IGh0dHBzTmF0aXZlIH07XG5cbi8qIVxuICogQXJyYXkgb2YgcGFzc2VzLlxuICpcbiAqIEEgYHBhc3NgIGlzIGp1c3QgYSBmdW5jdGlvbiB0aGF0IGlzIGV4ZWN1dGVkIG9uIGByZXEsIHJlcywgb3B0aW9uc2BcbiAqIHNvIHRoYXQgeW91IGNhbiBlYXNpbHkgYWRkIG5ldyBjaGVja3Mgd2hpbGUgc3RpbGwga2VlcGluZyB0aGUgYmFzZVxuICogZmxleGlibGUuXG4gKi9cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAvKipcbiAgICogU2V0cyBgY29udGVudC1sZW5ndGhgIHRvICcwJyBpZiByZXF1ZXN0IGlzIG9mIERFTEVURSB0eXBlLlxuICAgKlxuICAgKiBAcGFyYW0ge0NsaWVudFJlcXVlc3R9IFJlcSBSZXF1ZXN0IG9iamVjdFxuICAgKsKgQHBhcmFtIHtJbmNvbWluZ01lc3NhZ2V9IFJlcyBSZXNwb25zZSBvYmplY3RcbiAgICogQHBhcmFtIHtPYmplY3R9IE9wdGlvbnMgQ29uZmlnIG9iamVjdCBwYXNzZWQgdG8gdGhlIHByb3h5XG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBkZWxldGVMZW5ndGg6IGZ1bmN0aW9uIGRlbGV0ZUxlbmd0aChyZXEsIHJlcywgb3B0aW9ucykge1xuICAgIGlmKChyZXEubWV0aG9kID09PSAnREVMRVRFJyB8fCByZXEubWV0aG9kID09PSAnT1BUSU9OUycpXG4gICAgICAgJiYgIXJlcS5oZWFkZXJzWydjb250ZW50LWxlbmd0aCddKSB7XG4gICAgICByZXEuaGVhZGVyc1snY29udGVudC1sZW5ndGgnXSA9ICcwJztcbiAgICAgIGRlbGV0ZSByZXEuaGVhZGVyc1sndHJhbnNmZXItZW5jb2RpbmcnXTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFNldHMgdGltZW91dCBpbiByZXF1ZXN0IHNvY2tldCBpZiBpdCB3YXMgc3BlY2lmaWVkIGluIG9wdGlvbnMuXG4gICAqXG4gICAqIEBwYXJhbSB7Q2xpZW50UmVxdWVzdH0gUmVxIFJlcXVlc3Qgb2JqZWN0XG4gICAqwqBAcGFyYW0ge0luY29taW5nTWVzc2FnZX0gUmVzIFJlc3BvbnNlIG9iamVjdFxuICAgKiBAcGFyYW0ge09iamVjdH0gT3B0aW9ucyBDb25maWcgb2JqZWN0IHBhc3NlZCB0byB0aGUgcHJveHlcbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIHRpbWVvdXQ6IGZ1bmN0aW9uIHRpbWVvdXQocmVxLCByZXMsIG9wdGlvbnMpIHtcbiAgICBpZihvcHRpb25zLnRpbWVvdXQpIHtcbiAgICAgIHJlcS5zb2NrZXQuc2V0VGltZW91dChvcHRpb25zLnRpbWVvdXQpO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogU2V0cyBgeC1mb3J3YXJkZWQtKmAgaGVhZGVycyBpZiBzcGVjaWZpZWQgaW4gY29uZmlnLlxuICAgKlxuICAgKiBAcGFyYW0ge0NsaWVudFJlcXVlc3R9IFJlcSBSZXF1ZXN0IG9iamVjdFxuICAgKsKgQHBhcmFtIHtJbmNvbWluZ01lc3NhZ2V9IFJlcyBSZXNwb25zZSBvYmplY3RcbiAgICogQHBhcmFtIHtPYmplY3R9IE9wdGlvbnMgQ29uZmlnIG9iamVjdCBwYXNzZWQgdG8gdGhlIHByb3h5XG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBYSGVhZGVyczogZnVuY3Rpb24gWEhlYWRlcnMocmVxLCByZXMsIG9wdGlvbnMpIHtcbiAgICBpZighb3B0aW9ucy54ZndkKSByZXR1cm47XG5cbiAgICB2YXIgZW5jcnlwdGVkID0gcmVxLmlzU3BkeSB8fCBjb21tb24uaGFzRW5jcnlwdGVkQ29ubmVjdGlvbihyZXEpO1xuICAgIHZhciB2YWx1ZXMgPSB7XG4gICAgICBmb3IgIDogcmVxLmNvbm5lY3Rpb24ucmVtb3RlQWRkcmVzcyB8fCByZXEuc29ja2V0LnJlbW90ZUFkZHJlc3MsXG4gICAgICBwb3J0IDogY29tbW9uLmdldFBvcnQocmVxKSxcbiAgICAgIHByb3RvOiBlbmNyeXB0ZWQgPyAnaHR0cHMnIDogJ2h0dHAnXG4gICAgfTtcblxuICAgIFsnZm9yJywgJ3BvcnQnLCAncHJvdG8nXS5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcikge1xuICAgICAgcmVxLmhlYWRlcnNbJ3gtZm9yd2FyZGVkLScgKyBoZWFkZXJdID1cbiAgICAgICAgKHJlcS5oZWFkZXJzWyd4LWZvcndhcmRlZC0nICsgaGVhZGVyXSB8fCAnJykgK1xuICAgICAgICAocmVxLmhlYWRlcnNbJ3gtZm9yd2FyZGVkLScgKyBoZWFkZXJdID8gJywnIDogJycpICtcbiAgICAgICAgdmFsdWVzW2hlYWRlcl07XG4gICAgfSk7XG5cbiAgICByZXEuaGVhZGVyc1sneC1mb3J3YXJkZWQtaG9zdCddID0gcmVxLmhlYWRlcnNbJ3gtZm9yd2FyZGVkLWhvc3QnXSB8fCByZXEuaGVhZGVyc1snaG9zdCddIHx8ICcnO1xuICB9LFxuXG4gIC8qKlxuICAgKiBEb2VzIHRoZSBhY3R1YWwgcHJveHlpbmcuIElmIGBmb3J3YXJkYCBpcyBlbmFibGVkIGZpcmVzIHVwXG4gICAqIGEgRm9yd2FyZFN0cmVhbSwgc2FtZSBoYXBwZW5zIGZvciBQcm94eVN0cmVhbS4gVGhlIHJlcXVlc3RcbiAgICoganVzdCBkaWVzIG90aGVyd2lzZS5cbiAgICpcbiAgICogQHBhcmFtIHtDbGllbnRSZXF1ZXN0fSBSZXEgUmVxdWVzdCBvYmplY3RcbiAgICrCoEBwYXJhbSB7SW5jb21pbmdNZXNzYWdlfSBSZXMgUmVzcG9uc2Ugb2JqZWN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBPcHRpb25zIENvbmZpZyBvYmplY3QgcGFzc2VkIHRvIHRoZSBwcm94eVxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgc3RyZWFtOiBmdW5jdGlvbiBzdHJlYW0ocmVxLCByZXMsIG9wdGlvbnMsIF8sIHNlcnZlciwgY2xiKSB7XG5cbiAgICAvLyBBbmQgd2UgYmVnaW4hXG4gICAgc2VydmVyLmVtaXQoJ3N0YXJ0JywgcmVxLCByZXMsIG9wdGlvbnMudGFyZ2V0IHx8IG9wdGlvbnMuZm9yd2FyZCk7XG5cbiAgICB2YXIgYWdlbnRzID0gb3B0aW9ucy5mb2xsb3dSZWRpcmVjdHMgPyBmb2xsb3dSZWRpcmVjdHMgOiBuYXRpdmVBZ2VudHM7XG4gICAgdmFyIGh0dHAgPSBhZ2VudHMuaHR0cDtcbiAgICB2YXIgaHR0cHMgPSBhZ2VudHMuaHR0cHM7XG5cbiAgICBpZihvcHRpb25zLmZvcndhcmQpIHtcbiAgICAgIC8vIElmIGZvcndhcmQgZW5hYmxlLCBzbyBqdXN0IHBpcGUgdGhlIHJlcXVlc3RcbiAgICAgIHZhciBmb3J3YXJkUmVxID0gKG9wdGlvbnMuZm9yd2FyZC5wcm90b2NvbCA9PT0gJ2h0dHBzOicgPyBodHRwcyA6IGh0dHApLnJlcXVlc3QoXG4gICAgICAgIGNvbW1vbi5zZXR1cE91dGdvaW5nKG9wdGlvbnMuc3NsIHx8IHt9LCBvcHRpb25zLCByZXEsICdmb3J3YXJkJylcbiAgICAgICk7XG5cbiAgICAgIC8vIGVycm9yIGhhbmRsZXIgKGUuZy4gRUNPTk5SRVNFVCwgRUNPTk5SRUZVU0VEKVxuICAgICAgLy8gSGFuZGxlIGVycm9ycyBvbiBpbmNvbWluZyByZXF1ZXN0IGFzIHdlbGwgYXMgaXQgbWFrZXMgc2Vuc2UgdG9cbiAgICAgIHZhciBmb3J3YXJkRXJyb3IgPSBjcmVhdGVFcnJvckhhbmRsZXIoZm9yd2FyZFJlcSwgb3B0aW9ucy5mb3J3YXJkKTtcbiAgICAgIHJlcS5vbignZXJyb3InLCBmb3J3YXJkRXJyb3IpO1xuICAgICAgZm9yd2FyZFJlcS5vbignZXJyb3InLCBmb3J3YXJkRXJyb3IpO1xuXG4gICAgICAob3B0aW9ucy5idWZmZXIgfHwgcmVxKS5waXBlKGZvcndhcmRSZXEpO1xuICAgICAgaWYoIW9wdGlvbnMudGFyZ2V0KSB7IHJldHVybiByZXMuZW5kKCk7IH1cbiAgICB9XG5cbiAgICAvLyBSZXF1ZXN0IGluaXRhbGl6YXRpb25cbiAgICB2YXIgcHJveHlSZXEgPSAob3B0aW9ucy50YXJnZXQucHJvdG9jb2wgPT09ICdodHRwczonID8gaHR0cHMgOiBodHRwKS5yZXF1ZXN0KFxuICAgICAgY29tbW9uLnNldHVwT3V0Z29pbmcob3B0aW9ucy5zc2wgfHwge30sIG9wdGlvbnMsIHJlcSlcbiAgICApO1xuXG4gICAgLy8gRW5hYmxlIGRldmVsb3BlcnMgdG8gbW9kaWZ5IHRoZSBwcm94eVJlcSBiZWZvcmUgaGVhZGVycyBhcmUgc2VudFxuICAgIHByb3h5UmVxLm9uKCdzb2NrZXQnLCBmdW5jdGlvbihzb2NrZXQpIHtcbiAgICAgIGlmKHNlcnZlciAmJiAhcHJveHlSZXEuZ2V0SGVhZGVyKCdleHBlY3QnKSkge1xuICAgICAgICBzZXJ2ZXIuZW1pdCgncHJveHlSZXEnLCBwcm94eVJlcSwgcmVxLCByZXMsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gYWxsb3cgb3V0Z29pbmcgc29ja2V0IHRvIHRpbWVvdXQgc28gdGhhdCB3ZSBjb3VsZFxuICAgIC8vIHNob3cgYW4gZXJyb3IgcGFnZSBhdCB0aGUgaW5pdGlhbCByZXF1ZXN0XG4gICAgaWYob3B0aW9ucy5wcm94eVRpbWVvdXQpIHtcbiAgICAgIHByb3h5UmVxLnNldFRpbWVvdXQob3B0aW9ucy5wcm94eVRpbWVvdXQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgcHJveHlSZXEuYWJvcnQoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSB3ZSBhYm9ydCBwcm94eSBpZiByZXF1ZXN0IGlzIGFib3J0ZWRcbiAgICByZXEub24oJ2Fib3J0ZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBwcm94eVJlcS5hYm9ydCgpO1xuICAgIH0pO1xuXG4gICAgLy8gaGFuZGxlIGVycm9ycyBpbiBwcm94eSBhbmQgaW5jb21pbmcgcmVxdWVzdCwganVzdCBsaWtlIGZvciBmb3J3YXJkIHByb3h5XG4gICAgdmFyIHByb3h5RXJyb3IgPSBjcmVhdGVFcnJvckhhbmRsZXIocHJveHlSZXEsIG9wdGlvbnMudGFyZ2V0KTtcbiAgICByZXEub24oJ2Vycm9yJywgcHJveHlFcnJvcik7XG4gICAgcHJveHlSZXEub24oJ2Vycm9yJywgcHJveHlFcnJvcik7XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVFcnJvckhhbmRsZXIocHJveHlSZXEsIHVybCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIHByb3h5RXJyb3IoZXJyKSB7XG4gICAgICAgIGlmIChyZXEuc29ja2V0LmRlc3Ryb3llZCAmJiBlcnIuY29kZSA9PT0gJ0VDT05OUkVTRVQnKSB7XG4gICAgICAgICAgc2VydmVyLmVtaXQoJ2Vjb25ucmVzZXQnLCBlcnIsIHJlcSwgcmVzLCB1cmwpO1xuICAgICAgICAgIHJldHVybiBwcm94eVJlcS5hYm9ydCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNsYikge1xuICAgICAgICAgIGNsYihlcnIsIHJlcSwgcmVzLCB1cmwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlcnZlci5lbWl0KCdlcnJvcicsIGVyciwgcmVxLCByZXMsIHVybCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAob3B0aW9ucy5idWZmZXIgfHwgcmVxKS5waXBlKHByb3h5UmVxKTtcblxuICAgIHByb3h5UmVxLm9uKCdyZXNwb25zZScsIGZ1bmN0aW9uKHByb3h5UmVzKSB7XG4gICAgICBpZihzZXJ2ZXIpIHsgc2VydmVyLmVtaXQoJ3Byb3h5UmVzJywgcHJveHlSZXMsIHJlcSwgcmVzKTsgfVxuXG4gICAgICBpZighcmVzLmhlYWRlcnNTZW50ICYmICFvcHRpb25zLnNlbGZIYW5kbGVSZXNwb25zZSkge1xuICAgICAgICBmb3IodmFyIGk9MDsgaSA8IHdlYl9vLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYod2ViX29baV0ocmVxLCByZXMsIHByb3h5UmVzLCBvcHRpb25zKSkgeyBicmVhazsgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghcmVzLmZpbmlzaGVkKSB7XG4gICAgICAgIC8vIEFsbG93IHVzIHRvIGxpc3RlbiB3aGVuIHRoZSBwcm94eSBoYXMgY29tcGxldGVkXG4gICAgICAgIHByb3h5UmVzLm9uKCdlbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKHNlcnZlcikgc2VydmVyLmVtaXQoJ2VuZCcsIHJlcSwgcmVzLCBwcm94eVJlcyk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBXZSBwaXBlIHRvIHRoZSByZXNwb25zZSB1bmxlc3MgaXRzIGV4cGVjdGVkIHRvIGJlIGhhbmRsZWQgYnkgdGhlIHVzZXJcbiAgICAgICAgaWYgKCFvcHRpb25zLnNlbGZIYW5kbGVSZXNwb25zZSkgcHJveHlSZXMucGlwZShyZXMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHNlcnZlcikgc2VydmVyLmVtaXQoJ2VuZCcsIHJlcSwgcmVzLCBwcm94eVJlcyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxufTtcbiIsInZhciBodHRwICAgPSByZXF1aXJlKCdodHRwJyksXG4gICAgaHR0cHMgID0gcmVxdWlyZSgnaHR0cHMnKSxcbiAgICBjb21tb24gPSByZXF1aXJlKCcuLi9jb21tb24nKTtcblxuLyohXG4gKiBBcnJheSBvZiBwYXNzZXMuXG4gKlxuICogQSBgcGFzc2AgaXMganVzdCBhIGZ1bmN0aW9uIHRoYXQgaXMgZXhlY3V0ZWQgb24gYHJlcSwgc29ja2V0LCBvcHRpb25zYFxuICogc28gdGhhdCB5b3UgY2FuIGVhc2lseSBhZGQgbmV3IGNoZWNrcyB3aGlsZSBzdGlsbCBrZWVwaW5nIHRoZSBiYXNlXG4gKiBmbGV4aWJsZS5cbiAqL1xuXG4vKlxuICogV2Vic29ja2V0cyBQYXNzZXNcbiAqXG4gKi9cblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgLyoqXG4gICAqIFdlYlNvY2tldCByZXF1ZXN0cyBtdXN0IGhhdmUgdGhlIGBHRVRgIG1ldGhvZCBhbmRcbiAgICogdGhlIGB1cGdyYWRlOndlYnNvY2tldGAgaGVhZGVyXG4gICAqXG4gICAqIEBwYXJhbSB7Q2xpZW50UmVxdWVzdH0gUmVxIFJlcXVlc3Qgb2JqZWN0XG4gICAqwqBAcGFyYW0ge1NvY2tldH0gV2Vic29ja2V0XG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBjaGVja01ldGhvZEFuZEhlYWRlciA6IGZ1bmN0aW9uIGNoZWNrTWV0aG9kQW5kSGVhZGVyKHJlcSwgc29ja2V0KSB7XG4gICAgaWYgKHJlcS5tZXRob2QgIT09ICdHRVQnIHx8ICFyZXEuaGVhZGVycy51cGdyYWRlKSB7XG4gICAgICBzb2NrZXQuZGVzdHJveSgpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaWYgKHJlcS5oZWFkZXJzLnVwZ3JhZGUudG9Mb3dlckNhc2UoKSAhPT0gJ3dlYnNvY2tldCcpIHtcbiAgICAgIHNvY2tldC5kZXN0cm95KCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFNldHMgYHgtZm9yd2FyZGVkLSpgIGhlYWRlcnMgaWYgc3BlY2lmaWVkIGluIGNvbmZpZy5cbiAgICpcbiAgICogQHBhcmFtIHtDbGllbnRSZXF1ZXN0fSBSZXEgUmVxdWVzdCBvYmplY3RcbiAgICrCoEBwYXJhbSB7U29ja2V0fSBXZWJzb2NrZXRcbiAgICogQHBhcmFtIHtPYmplY3R9IE9wdGlvbnMgQ29uZmlnIG9iamVjdCBwYXNzZWQgdG8gdGhlIHByb3h5XG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBYSGVhZGVycyA6IGZ1bmN0aW9uIFhIZWFkZXJzKHJlcSwgc29ja2V0LCBvcHRpb25zKSB7XG4gICAgaWYoIW9wdGlvbnMueGZ3ZCkgcmV0dXJuO1xuXG4gICAgdmFyIHZhbHVlcyA9IHtcbiAgICAgIGZvciAgOiByZXEuY29ubmVjdGlvbi5yZW1vdGVBZGRyZXNzIHx8IHJlcS5zb2NrZXQucmVtb3RlQWRkcmVzcyxcbiAgICAgIHBvcnQgOiBjb21tb24uZ2V0UG9ydChyZXEpLFxuICAgICAgcHJvdG86IGNvbW1vbi5oYXNFbmNyeXB0ZWRDb25uZWN0aW9uKHJlcSkgPyAnd3NzJyA6ICd3cydcbiAgICB9O1xuXG4gICAgWydmb3InLCAncG9ydCcsICdwcm90byddLmZvckVhY2goZnVuY3Rpb24oaGVhZGVyKSB7XG4gICAgICByZXEuaGVhZGVyc1sneC1mb3J3YXJkZWQtJyArIGhlYWRlcl0gPVxuICAgICAgICAocmVxLmhlYWRlcnNbJ3gtZm9yd2FyZGVkLScgKyBoZWFkZXJdIHx8ICcnKSArXG4gICAgICAgIChyZXEuaGVhZGVyc1sneC1mb3J3YXJkZWQtJyArIGhlYWRlcl0gPyAnLCcgOiAnJykgK1xuICAgICAgICB2YWx1ZXNbaGVhZGVyXTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogRG9lcyB0aGUgYWN0dWFsIHByb3h5aW5nLiBNYWtlIHRoZSByZXF1ZXN0IGFuZCB1cGdyYWRlIGl0XG4gICAqIHNlbmQgdGhlIFN3aXRjaGluZyBQcm90b2NvbHMgcmVxdWVzdCBhbmQgcGlwZSB0aGUgc29ja2V0cy5cbiAgICpcbiAgICogQHBhcmFtIHtDbGllbnRSZXF1ZXN0fSBSZXEgUmVxdWVzdCBvYmplY3RcbiAgICrCoEBwYXJhbSB7U29ja2V0fSBXZWJzb2NrZXRcbiAgICogQHBhcmFtIHtPYmplY3R9IE9wdGlvbnMgQ29uZmlnIG9iamVjdCBwYXNzZWQgdG8gdGhlIHByb3h5XG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cbiAgc3RyZWFtIDogZnVuY3Rpb24gc3RyZWFtKHJlcSwgc29ja2V0LCBvcHRpb25zLCBoZWFkLCBzZXJ2ZXIsIGNsYikge1xuXG4gICAgdmFyIGNyZWF0ZUh0dHBIZWFkZXIgPSBmdW5jdGlvbihsaW5lLCBoZWFkZXJzKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMoaGVhZGVycykucmVkdWNlKGZ1bmN0aW9uIChoZWFkLCBrZXkpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gaGVhZGVyc1trZXldO1xuXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICBoZWFkLnB1c2goa2V5ICsgJzogJyArIHZhbHVlKTtcbiAgICAgICAgICByZXR1cm4gaGVhZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBoZWFkLnB1c2goa2V5ICsgJzogJyArIHZhbHVlW2ldKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGVhZDtcbiAgICAgIH0sIFtsaW5lXSlcbiAgICAgIC5qb2luKCdcXHJcXG4nKSArICdcXHJcXG5cXHJcXG4nO1xuICAgIH1cblxuICAgIGNvbW1vbi5zZXR1cFNvY2tldChzb2NrZXQpO1xuXG4gICAgaWYgKGhlYWQgJiYgaGVhZC5sZW5ndGgpIHNvY2tldC51bnNoaWZ0KGhlYWQpO1xuXG5cbiAgICB2YXIgcHJveHlSZXEgPSAoY29tbW9uLmlzU1NMLnRlc3Qob3B0aW9ucy50YXJnZXQucHJvdG9jb2wpID8gaHR0cHMgOiBodHRwKS5yZXF1ZXN0KFxuICAgICAgY29tbW9uLnNldHVwT3V0Z29pbmcob3B0aW9ucy5zc2wgfHwge30sIG9wdGlvbnMsIHJlcSlcbiAgICApO1xuXG4gICAgLy8gRW5hYmxlIGRldmVsb3BlcnMgdG8gbW9kaWZ5IHRoZSBwcm94eVJlcSBiZWZvcmUgaGVhZGVycyBhcmUgc2VudFxuICAgIGlmIChzZXJ2ZXIpIHsgc2VydmVyLmVtaXQoJ3Byb3h5UmVxV3MnLCBwcm94eVJlcSwgcmVxLCBzb2NrZXQsIG9wdGlvbnMsIGhlYWQpOyB9XG5cbiAgICAvLyBFcnJvciBIYW5kbGVyXG4gICAgcHJveHlSZXEub24oJ2Vycm9yJywgb25PdXRnb2luZ0Vycm9yKTtcbiAgICBwcm94eVJlcS5vbigncmVzcG9uc2UnLCBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAvLyBpZiB1cGdyYWRlIGV2ZW50IGlzbid0IGdvaW5nIHRvIGhhcHBlbiwgY2xvc2UgdGhlIHNvY2tldFxuICAgICAgaWYgKCFyZXMudXBncmFkZSkge1xuICAgICAgICBzb2NrZXQud3JpdGUoY3JlYXRlSHR0cEhlYWRlcignSFRUUC8nICsgcmVzLmh0dHBWZXJzaW9uICsgJyAnICsgcmVzLnN0YXR1c0NvZGUgKyAnICcgKyByZXMuc3RhdHVzTWVzc2FnZSwgcmVzLmhlYWRlcnMpKTtcbiAgICAgICAgcmVzLnBpcGUoc29ja2V0KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHByb3h5UmVxLm9uKCd1cGdyYWRlJywgZnVuY3Rpb24ocHJveHlSZXMsIHByb3h5U29ja2V0LCBwcm94eUhlYWQpIHtcbiAgICAgIHByb3h5U29ja2V0Lm9uKCdlcnJvcicsIG9uT3V0Z29pbmdFcnJvcik7XG5cbiAgICAgIC8vIEFsbG93IHVzIHRvIGxpc3RlbiB3aGVuIHRoZSB3ZWJzb2NrZXQgaGFzIGNvbXBsZXRlZFxuICAgICAgcHJveHlTb2NrZXQub24oJ2VuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VydmVyLmVtaXQoJ2Nsb3NlJywgcHJveHlSZXMsIHByb3h5U29ja2V0LCBwcm94eUhlYWQpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIFRoZSBwaXBlIGJlbG93IHdpbGwgZW5kIHByb3h5U29ja2V0IGlmIHNvY2tldCBjbG9zZXMgY2xlYW5seSwgYnV0IG5vdFxuICAgICAgLy8gaWYgaXQgZXJyb3JzIChlZywgdmFuaXNoZXMgZnJvbSB0aGUgbmV0IGFuZCBzdGFydHMgcmV0dXJuaW5nXG4gICAgICAvLyBFSE9TVFVOUkVBQ0gpLiBXZSBuZWVkIHRvIGRvIHRoYXQgZXhwbGljaXRseS5cbiAgICAgIHNvY2tldC5vbignZXJyb3InLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHByb3h5U29ja2V0LmVuZCgpO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbW1vbi5zZXR1cFNvY2tldChwcm94eVNvY2tldCk7XG5cbiAgICAgIGlmIChwcm94eUhlYWQgJiYgcHJveHlIZWFkLmxlbmd0aCkgcHJveHlTb2NrZXQudW5zaGlmdChwcm94eUhlYWQpO1xuXG4gICAgICAvL1xuICAgICAgLy8gUmVtYXJrOiBIYW5kbGUgd3JpdGluZyB0aGUgaGVhZGVycyB0byB0aGUgc29ja2V0IHdoZW4gc3dpdGNoaW5nIHByb3RvY29sc1xuICAgICAgLy8gQWxzbyBoYW5kbGVzIHdoZW4gYSBoZWFkZXIgaXMgYW4gYXJyYXlcbiAgICAgIC8vXG4gICAgICBzb2NrZXQud3JpdGUoY3JlYXRlSHR0cEhlYWRlcignSFRUUC8xLjEgMTAxIFN3aXRjaGluZyBQcm90b2NvbHMnLCBwcm94eVJlcy5oZWFkZXJzKSk7XG5cbiAgICAgIHByb3h5U29ja2V0LnBpcGUoc29ja2V0KS5waXBlKHByb3h5U29ja2V0KTtcblxuICAgICAgc2VydmVyLmVtaXQoJ29wZW4nLCBwcm94eVNvY2tldCk7XG4gICAgICBzZXJ2ZXIuZW1pdCgncHJveHlTb2NrZXQnLCBwcm94eVNvY2tldCk7ICAvL0RFUFJFQ0FURUQuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gcHJveHlSZXEuZW5kKCk7IC8vIFhYWDogQ0hFQ0sgSUYgVEhJUyBJUyBUSElTIENPUlJFQ1RcblxuICAgIGZ1bmN0aW9uIG9uT3V0Z29pbmdFcnJvcihlcnIpIHtcbiAgICAgIGlmIChjbGIpIHtcbiAgICAgICAgY2xiKGVyciwgcmVxLCBzb2NrZXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VydmVyLmVtaXQoJ2Vycm9yJywgZXJyLCByZXEsIHNvY2tldCk7XG4gICAgICB9XG4gICAgICBzb2NrZXQuZW5kKCk7XG4gICAgfVxuICB9XG59O1xuIiwidmFyIGh0dHBQcm94eSA9IG1vZHVsZS5leHBvcnRzLFxuICAgIGV4dGVuZCAgICA9IHJlcXVpcmUoJ3V0aWwnKS5fZXh0ZW5kLFxuICAgIHBhcnNlX3VybCA9IHJlcXVpcmUoJ3VybCcpLnBhcnNlLFxuICAgIEVFMyAgICAgICA9IHJlcXVpcmUoJ2V2ZW50ZW1pdHRlcjMnKSxcbiAgICBodHRwICAgICAgPSByZXF1aXJlKCdodHRwJyksXG4gICAgaHR0cHMgICAgID0gcmVxdWlyZSgnaHR0cHMnKSxcbiAgICB3ZWIgICAgICAgPSByZXF1aXJlKCcuL3Bhc3Nlcy93ZWItaW5jb21pbmcnKSxcbiAgICB3cyAgICAgICAgPSByZXF1aXJlKCcuL3Bhc3Nlcy93cy1pbmNvbWluZycpO1xuXG5odHRwUHJveHkuU2VydmVyID0gUHJveHlTZXJ2ZXI7XG5cbi8qKlxuICogUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgY3JlYXRlcyB0aGUgbG9hZGVyIGZvclxuICogZWl0aGVyIGB3c2Agb3IgYHdlYmAncyAgcGFzc2VzLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgIGh0dHBQcm94eS5jcmVhdGVSaWdodFByb3h5KCd3cycpXG4gKiAgICAvLyA9PiBbRnVuY3Rpb25dXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IFR5cGUgRWl0aGVyICd3cycgb3IgJ3dlYidcbiAqwqBcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBMb2FkZXIgRnVuY3Rpb24gdGhhdCB3aGVuIGNhbGxlZCByZXR1cm5zIGFuIGl0ZXJhdG9yIGZvciB0aGUgcmlnaHQgcGFzc2VzXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gY3JlYXRlUmlnaHRQcm94eSh0eXBlKSB7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ocmVxLCByZXMgLyosIFtoZWFkXSwgW29wdHNdICovKSB7XG4gICAgICB2YXIgcGFzc2VzID0gKHR5cGUgPT09ICd3cycpID8gdGhpcy53c1Bhc3NlcyA6IHRoaXMud2ViUGFzc2VzLFxuICAgICAgICAgIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cyksXG4gICAgICAgICAgY250ciA9IGFyZ3MubGVuZ3RoIC0gMSxcbiAgICAgICAgICBoZWFkLCBjYmw7XG5cbiAgICAgIC8qIG9wdGlvbmFsIGFyZ3MgcGFyc2UgYmVnaW4gKi9cbiAgICAgIGlmKHR5cGVvZiBhcmdzW2NudHJdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNibCA9IGFyZ3NbY250cl07XG5cbiAgICAgICAgY250ci0tO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVxdWVzdE9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgaWYoXG4gICAgICAgICEoYXJnc1tjbnRyXSBpbnN0YW5jZW9mIEJ1ZmZlcikgJiZcbiAgICAgICAgYXJnc1tjbnRyXSAhPT0gcmVzXG4gICAgICApIHtcbiAgICAgICAgLy9Db3B5IGdsb2JhbCBvcHRpb25zXG4gICAgICAgIHJlcXVlc3RPcHRpb25zID0gZXh0ZW5kKHt9LCBvcHRpb25zKTtcbiAgICAgICAgLy9PdmVyd3JpdGUgd2l0aCByZXF1ZXN0IG9wdGlvbnNcbiAgICAgICAgZXh0ZW5kKHJlcXVlc3RPcHRpb25zLCBhcmdzW2NudHJdKTtcblxuICAgICAgICBjbnRyLS07XG4gICAgICB9XG5cbiAgICAgIGlmKGFyZ3NbY250cl0gaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgICAgaGVhZCA9IGFyZ3NbY250cl07XG4gICAgICB9XG5cbiAgICAgIC8qIG9wdGlvbmFsIGFyZ3MgcGFyc2UgZW5kICovXG5cbiAgICAgIFsndGFyZ2V0JywgJ2ZvcndhcmQnXS5mb3JFYWNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0T3B0aW9uc1tlXSA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgcmVxdWVzdE9wdGlvbnNbZV0gPSBwYXJzZV91cmwocmVxdWVzdE9wdGlvbnNbZV0pO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICghcmVxdWVzdE9wdGlvbnMudGFyZ2V0ICYmICFyZXF1ZXN0T3B0aW9ucy5mb3J3YXJkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVtaXQoJ2Vycm9yJywgbmV3IEVycm9yKCdNdXN0IHByb3ZpZGUgYSBwcm9wZXIgVVJMIGFzIHRhcmdldCcpKTtcbiAgICAgIH1cblxuICAgICAgZm9yKHZhciBpPTA7IGkgPCBwYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbGwgb2YgcGFzc2VzIGZ1bmN0aW9uc1xuICAgICAgICAgKiBwYXNzKHJlcSwgcmVzLCBvcHRpb25zLCBoZWFkKVxuICAgICAgICAgKlxuICAgICAgICAgKiBJbiBXZWJTb2NrZXRzIGNhc2UgdGhlIGByZXNgIHZhcmlhYmxlXG4gICAgICAgICAqIHJlZmVyIHRvIHRoZSBjb25uZWN0aW9uIHNvY2tldFxuICAgICAgICAgKiBwYXNzKHJlcSwgc29ja2V0LCBvcHRpb25zLCBoZWFkKVxuICAgICAgICAgKi9cbiAgICAgICAgaWYocGFzc2VzW2ldKHJlcSwgcmVzLCByZXF1ZXN0T3B0aW9ucywgaGVhZCwgdGhpcywgY2JsKSkgeyAvLyBwYXNzZXMgY2FuIHJldHVybiBhIHRydXRoeSB2YWx1ZSB0byBoYWx0IHRoZSBsb29wXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9O1xufVxuaHR0cFByb3h5LmNyZWF0ZVJpZ2h0UHJveHkgPSBjcmVhdGVSaWdodFByb3h5O1xuXG5mdW5jdGlvbiBQcm94eVNlcnZlcihvcHRpb25zKSB7XG4gIEVFMy5jYWxsKHRoaXMpO1xuXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBvcHRpb25zLnByZXBlbmRQYXRoID0gb3B0aW9ucy5wcmVwZW5kUGF0aCA9PT0gZmFsc2UgPyBmYWxzZSA6IHRydWU7XG5cbiAgdGhpcy53ZWIgPSB0aGlzLnByb3h5UmVxdWVzdCAgICAgICAgICAgPSBjcmVhdGVSaWdodFByb3h5KCd3ZWInKShvcHRpb25zKTtcbiAgdGhpcy53cyAgPSB0aGlzLnByb3h5V2Vic29ja2V0UmVxdWVzdCAgPSBjcmVhdGVSaWdodFByb3h5KCd3cycpKG9wdGlvbnMpO1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuXG4gIHRoaXMud2ViUGFzc2VzID0gT2JqZWN0LmtleXMod2ViKS5tYXAoZnVuY3Rpb24ocGFzcykge1xuICAgIHJldHVybiB3ZWJbcGFzc107XG4gIH0pO1xuXG4gIHRoaXMud3NQYXNzZXMgPSBPYmplY3Qua2V5cyh3cykubWFwKGZ1bmN0aW9uKHBhc3MpIHtcbiAgICByZXR1cm4gd3NbcGFzc107XG4gIH0pO1xuXG4gIHRoaXMub24oJ2Vycm9yJywgdGhpcy5vbkVycm9yLCB0aGlzKTtcblxufVxuXG5yZXF1aXJlKCd1dGlsJykuaW5oZXJpdHMoUHJveHlTZXJ2ZXIsIEVFMyk7XG5cblByb3h5U2VydmVyLnByb3RvdHlwZS5vbkVycm9yID0gZnVuY3Rpb24gKGVycikge1xuICAvL1xuICAvLyBSZW1hcms6IFJlcGxpY2F0ZSBub2RlIGNvcmUgYmVoYXZpb3IgdXNpbmcgRUUzXG4gIC8vIHNvIHdlIGZvcmNlIHBlb3BsZSB0byBoYW5kbGUgdGhlaXIgb3duIGVycm9yc1xuICAvL1xuICBpZih0aGlzLmxpc3RlbmVycygnZXJyb3InKS5sZW5ndGggPT09IDEpIHtcbiAgICB0aHJvdyBlcnI7XG4gIH1cbn07XG5cblByb3h5U2VydmVyLnByb3RvdHlwZS5saXN0ZW4gPSBmdW5jdGlvbihwb3J0LCBob3N0bmFtZSkge1xuICB2YXIgc2VsZiAgICA9IHRoaXMsXG4gICAgICBjbG9zdXJlID0gZnVuY3Rpb24ocmVxLCByZXMpIHsgc2VsZi53ZWIocmVxLCByZXMpOyB9O1xuXG4gIHRoaXMuX3NlcnZlciAgPSB0aGlzLm9wdGlvbnMuc3NsID9cbiAgICBodHRwcy5jcmVhdGVTZXJ2ZXIodGhpcy5vcHRpb25zLnNzbCwgY2xvc3VyZSkgOlxuICAgIGh0dHAuY3JlYXRlU2VydmVyKGNsb3N1cmUpO1xuXG4gIGlmKHRoaXMub3B0aW9ucy53cykge1xuICAgIHRoaXMuX3NlcnZlci5vbigndXBncmFkZScsIGZ1bmN0aW9uKHJlcSwgc29ja2V0LCBoZWFkKSB7IHNlbGYud3MocmVxLCBzb2NrZXQsIGhlYWQpOyB9KTtcbiAgfVxuXG4gIHRoaXMuX3NlcnZlci5saXN0ZW4ocG9ydCwgaG9zdG5hbWUpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuUHJveHlTZXJ2ZXIucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBpZiAodGhpcy5fc2VydmVyKSB7XG4gICAgdGhpcy5fc2VydmVyLmNsb3NlKGRvbmUpO1xuICB9XG5cbiAgLy8gV3JhcCBjYWxsYmFjayB0byBudWxsaWZ5IHNlcnZlciBhZnRlciBhbGwgb3BlbiBjb25uZWN0aW9ucyBhcmUgY2xvc2VkLlxuICBmdW5jdGlvbiBkb25lKCkge1xuICAgIHNlbGYuX3NlcnZlciA9IG51bGw7XG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICBjYWxsYmFjay5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfTtcbn07XG5cblByb3h5U2VydmVyLnByb3RvdHlwZS5iZWZvcmUgPSBmdW5jdGlvbih0eXBlLCBwYXNzTmFtZSwgY2FsbGJhY2spIHtcbiAgaWYgKHR5cGUgIT09ICd3cycgJiYgdHlwZSAhPT0gJ3dlYicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3R5cGUgbXVzdCBiZSBgd2ViYCBvciBgd3NgJyk7XG4gIH1cbiAgdmFyIHBhc3NlcyA9ICh0eXBlID09PSAnd3MnKSA/IHRoaXMud3NQYXNzZXMgOiB0aGlzLndlYlBhc3NlcyxcbiAgICAgIGkgPSBmYWxzZTtcblxuICBwYXNzZXMuZm9yRWFjaChmdW5jdGlvbih2LCBpZHgpIHtcbiAgICBpZih2Lm5hbWUgPT09IHBhc3NOYW1lKSBpID0gaWR4O1xuICB9KVxuXG4gIGlmKGkgPT09IGZhbHNlKSB0aHJvdyBuZXcgRXJyb3IoJ05vIHN1Y2ggcGFzcycpO1xuXG4gIHBhc3Nlcy5zcGxpY2UoaSwgMCwgY2FsbGJhY2spO1xufTtcblByb3h5U2VydmVyLnByb3RvdHlwZS5hZnRlciA9IGZ1bmN0aW9uKHR5cGUsIHBhc3NOYW1lLCBjYWxsYmFjaykge1xuICBpZiAodHlwZSAhPT0gJ3dzJyAmJiB0eXBlICE9PSAnd2ViJykge1xuICAgIHRocm93IG5ldyBFcnJvcigndHlwZSBtdXN0IGJlIGB3ZWJgIG9yIGB3c2AnKTtcbiAgfVxuICB2YXIgcGFzc2VzID0gKHR5cGUgPT09ICd3cycpID8gdGhpcy53c1Bhc3NlcyA6IHRoaXMud2ViUGFzc2VzLFxuICAgICAgaSA9IGZhbHNlO1xuXG4gIHBhc3Nlcy5mb3JFYWNoKGZ1bmN0aW9uKHYsIGlkeCkge1xuICAgIGlmKHYubmFtZSA9PT0gcGFzc05hbWUpIGkgPSBpZHg7XG4gIH0pXG5cbiAgaWYoaSA9PT0gZmFsc2UpIHRocm93IG5ldyBFcnJvcignTm8gc3VjaCBwYXNzJyk7XG5cbiAgcGFzc2VzLnNwbGljZShpKyssIDAsIGNhbGxiYWNrKTtcbn07XG4iLCIgLy8gVXNlIGV4cGxpY2l0IC9pbmRleC5qcyB0byBoZWxwIGJyb3dzZXJpZnkgbmVnb2NpYXRpb24gaW4gcmVxdWlyZSAnL2xpYi9odHRwLXByb3h5JyAoISlcbnZhciBQcm94eVNlcnZlciA9IHJlcXVpcmUoJy4vaHR0cC1wcm94eS9pbmRleC5qcycpLlNlcnZlcjtcblxuXG4vKipcbiAqIENyZWF0ZXMgdGhlIHByb3h5IHNlcnZlci5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICBodHRwUHJveHkuY3JlYXRlUHJveHlTZXJ2ZXIoeyAuLiB9LCA4MDAwKVxuICogICAgLy8gPT4gJ3sgd2ViOiBbRnVuY3Rpb25dLCB3czogW0Z1bmN0aW9uXSAuLi4gfSdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gT3B0aW9ucyBDb25maWcgb2JqZWN0IHBhc3NlZCB0byB0aGUgcHJveHlcbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9IFByb3h5IFByb3h5IG9iamVjdCB3aXRoIGhhbmRsZXJzIGZvciBgd3NgIGFuZCBgd2ViYCByZXF1ZXN0c1xuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuXG5mdW5jdGlvbiBjcmVhdGVQcm94eVNlcnZlcihvcHRpb25zKSB7XG4gIC8qXG4gICAqICBgb3B0aW9uc2AgaXMgbmVlZGVkIGFuZCBpdCBtdXN0IGhhdmUgdGhlIGZvbGxvd2luZyBsYXlvdXQ6XG4gICAqXG4gICAqICB7XG4gICAqICAgIHRhcmdldCA6IDx1cmwgc3RyaW5nIHRvIGJlIHBhcnNlZCB3aXRoIHRoZSB1cmwgbW9kdWxlPlxuICAgKiAgICBmb3J3YXJkOiA8dXJsIHN0cmluZyB0byBiZSBwYXJzZWQgd2l0aCB0aGUgdXJsIG1vZHVsZT5cbiAgICogICAgYWdlbnQgIDogPG9iamVjdCB0byBiZSBwYXNzZWQgdG8gaHR0cChzKS5yZXF1ZXN0PlxuICAgKiAgICBzc2wgICAgOiA8b2JqZWN0IHRvIGJlIHBhc3NlZCB0byBodHRwcy5jcmVhdGVTZXJ2ZXIoKT5cbiAgICogICAgd3MgICAgIDogPHRydWUvZmFsc2UsIGlmIHlvdSB3YW50IHRvIHByb3h5IHdlYnNvY2tldHM+XG4gICAqICAgIHhmd2QgICA6IDx0cnVlL2ZhbHNlLCBhZGRzIHgtZm9yd2FyZCBoZWFkZXJzPlxuICAgKiAgICBzZWN1cmUgOiA8dHJ1ZS9mYWxzZSwgdmVyaWZ5IFNTTCBjZXJ0aWZpY2F0ZT5cbiAgICogICAgdG9Qcm94eTogPHRydWUvZmFsc2UsIGV4cGxpY2l0bHkgc3BlY2lmeSBpZiB3ZSBhcmUgcHJveHlpbmcgdG8gYW5vdGhlciBwcm94eT5cbiAgICogICAgcHJlcGVuZFBhdGg6IDx0cnVlL2ZhbHNlLCBEZWZhdWx0OiB0cnVlIC0gc3BlY2lmeSB3aGV0aGVyIHlvdSB3YW50IHRvIHByZXBlbmQgdGhlIHRhcmdldCdzIHBhdGggdG8gdGhlIHByb3h5IHBhdGg+XG4gICAqICAgIGlnbm9yZVBhdGg6IDx0cnVlL2ZhbHNlLCBEZWZhdWx0OiBmYWxzZSAtIHNwZWNpZnkgd2hldGhlciB5b3Ugd2FudCB0byBpZ25vcmUgdGhlIHByb3h5IHBhdGggb2YgdGhlIGluY29taW5nIHJlcXVlc3Q+XG4gICAqICAgIGxvY2FsQWRkcmVzcyA6IDxMb2NhbCBpbnRlcmZhY2Ugc3RyaW5nIHRvIGJpbmQgZm9yIG91dGdvaW5nIGNvbm5lY3Rpb25zPlxuICAgKiAgICBjaGFuZ2VPcmlnaW46IDx0cnVlL2ZhbHNlLCBEZWZhdWx0OiBmYWxzZSAtIGNoYW5nZXMgdGhlIG9yaWdpbiBvZiB0aGUgaG9zdCBoZWFkZXIgdG8gdGhlIHRhcmdldCBVUkw+XG4gICAqICAgIHByZXNlcnZlSGVhZGVyS2V5Q2FzZTogPHRydWUvZmFsc2UsIERlZmF1bHQ6IGZhbHNlIC0gc3BlY2lmeSB3aGV0aGVyIHlvdSB3YW50IHRvIGtlZXAgbGV0dGVyIGNhc2Ugb2YgcmVzcG9uc2UgaGVhZGVyIGtleSA+XG4gICAqICAgIGF1dGggICA6IEJhc2ljIGF1dGhlbnRpY2F0aW9uIGkuZS4gJ3VzZXI6cGFzc3dvcmQnIHRvIGNvbXB1dGUgYW4gQXV0aG9yaXphdGlvbiBoZWFkZXIuXG4gICAqICAgIGhvc3RSZXdyaXRlOiByZXdyaXRlcyB0aGUgbG9jYXRpb24gaG9zdG5hbWUgb24gKDIwMS8zMDEvMzAyLzMwNy8zMDgpIHJlZGlyZWN0cywgRGVmYXVsdDogbnVsbC5cbiAgICogICAgYXV0b1Jld3JpdGU6IHJld3JpdGVzIHRoZSBsb2NhdGlvbiBob3N0L3BvcnQgb24gKDIwMS8zMDEvMzAyLzMwNy8zMDgpIHJlZGlyZWN0cyBiYXNlZCBvbiByZXF1ZXN0ZWQgaG9zdC9wb3J0LiBEZWZhdWx0OiBmYWxzZS5cbiAgICogICAgcHJvdG9jb2xSZXdyaXRlOiByZXdyaXRlcyB0aGUgbG9jYXRpb24gcHJvdG9jb2wgb24gKDIwMS8zMDEvMzAyLzMwNy8zMDgpIHJlZGlyZWN0cyB0byAnaHR0cCcgb3IgJ2h0dHBzJy4gRGVmYXVsdDogbnVsbC5cbiAgICogIH1cbiAgICpcbiAgICogIE5PVEU6IGBvcHRpb25zLndzYCBhbmQgYG9wdGlvbnMuc3NsYCBhcmUgb3B0aW9uYWwuXG4gICAqICAgIGBvcHRpb25zLnRhcmdldCBhbmQgYG9wdGlvbnMuZm9yd2FyZGAgY2Fubm90IGJlXG4gICAqICAgIGJvdGggbWlzc2luZ1xuICAgKiAgfVxuICAgKi9cblxuICByZXR1cm4gbmV3IFByb3h5U2VydmVyKG9wdGlvbnMpO1xufVxuXG5cblByb3h5U2VydmVyLmNyZWF0ZVByb3h5U2VydmVyID0gY3JlYXRlUHJveHlTZXJ2ZXI7XG5Qcm94eVNlcnZlci5jcmVhdGVTZXJ2ZXIgICAgICA9IGNyZWF0ZVByb3h5U2VydmVyO1xuUHJveHlTZXJ2ZXIuY3JlYXRlUHJveHkgICAgICAgPSBjcmVhdGVQcm94eVNlcnZlcjtcblxuXG5cblxuLyoqXG4gKiBFeHBvcnQgdGhlIHByb3h5IFwiU2VydmVyXCIgYXMgdGhlIG1haW4gZXhwb3J0LlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IFByb3h5U2VydmVyO1xuXG4iLCIvKiFcbiAqIENhcm9uIGRpbW9uaW8sIGNvbiBvY2NoaSBkaSBicmFnaWFcbiAqIGxvcm8gYWNjZW5uYW5kbywgdHV0dGUgbGUgcmFjY29nbGllO1xuICogYmF0dGUgY29sIHJlbW8gcXVhbHVucXVlIHPigJlhZGFnaWEgXG4gKlxuICogQ2hhcm9uIHRoZSBkZW1vbiwgd2l0aCB0aGUgZXllcyBvZiBnbGVkZSxcbiAqIEJlY2tvbmluZyB0byB0aGVtLCBjb2xsZWN0cyB0aGVtIGFsbCB0b2dldGhlcixcbiAqIEJlYXRzIHdpdGggaGlzIG9hciB3aG9ldmVyIGxhZ3MgYmVoaW5kXG4gKiAgICAgICAgICBcbiAqICAgICAgICAgIERhbnRlIC0gVGhlIERpdmluZSBDb21lZHkgKENhbnRvIElJSSlcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2h0dHAtcHJveHknKTsiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gdmFsdWUgPT4ge1xuXHRpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRjb25zdCBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpO1xuXHRyZXR1cm4gcHJvdG90eXBlID09PSBudWxsIHx8IHByb3RvdHlwZSA9PT0gT2JqZWN0LnByb3RvdHlwZTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuRVJST1JTID0gdm9pZCAwO1xudmFyIEVSUk9SUztcbihmdW5jdGlvbiAoRVJST1JTKSB7XG4gICAgRVJST1JTW1wiRVJSX0NPTkZJR19GQUNUT1JZX1RBUkdFVF9NSVNTSU5HXCJdID0gXCJbSFBNXSBNaXNzaW5nIFxcXCJ0YXJnZXRcXFwiIG9wdGlvbi4gRXhhbXBsZToge3RhcmdldDogXFxcImh0dHA6Ly93d3cuZXhhbXBsZS5vcmdcXFwifVwiO1xuICAgIEVSUk9SU1tcIkVSUl9DT05URVhUX01BVENIRVJfR0VORVJJQ1wiXSA9IFwiW0hQTV0gSW52YWxpZCBjb250ZXh0LiBFeHBlY3Rpbmcgc29tZXRoaW5nIGxpa2U6IFxcXCIvYXBpXFxcIiBvciBbXFxcIi9hcGlcXFwiLCBcXFwiL2FqYXhcXFwiXVwiO1xuICAgIEVSUk9SU1tcIkVSUl9DT05URVhUX01BVENIRVJfSU5WQUxJRF9BUlJBWVwiXSA9IFwiW0hQTV0gSW52YWxpZCBjb250ZXh0LiBFeHBlY3Rpbmcgc29tZXRoaW5nIGxpa2U6IFtcXFwiL2FwaVxcXCIsIFxcXCIvYWpheFxcXCJdIG9yIFtcXFwiL2FwaS8qKlxcXCIsIFxcXCIhKiouaHRtbFxcXCJdXCI7XG4gICAgRVJST1JTW1wiRVJSX1BBVEhfUkVXUklURVJfQ09ORklHXCJdID0gXCJbSFBNXSBJbnZhbGlkIHBhdGhSZXdyaXRlIGNvbmZpZy4gRXhwZWN0aW5nIG9iamVjdCB3aXRoIHBhdGhSZXdyaXRlIGNvbmZpZyBvciBhIHJld3JpdGUgZnVuY3Rpb25cIjtcbn0pKEVSUk9SUyA9IGV4cG9ydHMuRVJST1JTIHx8IChleHBvcnRzLkVSUk9SUyA9IHt9KSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIGVzbGludC1kaXNhYmxlIHByZWZlci1yZXN0LXBhcmFtcyAqL1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5nZXRBcnJvdyA9IGV4cG9ydHMuZ2V0SW5zdGFuY2UgPSB2b2lkIDA7XG5jb25zdCB1dGlsID0gcmVxdWlyZShcInV0aWxcIik7XG5sZXQgbG9nZ2VySW5zdGFuY2U7XG5jb25zdCBkZWZhdWx0UHJvdmlkZXIgPSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGU6IG5vLWNvbnNvbGVcbiAgICBsb2c6IGNvbnNvbGUubG9nLFxuICAgIGRlYnVnOiBjb25zb2xlLmxvZyxcbiAgICBpbmZvOiBjb25zb2xlLmluZm8sXG4gICAgd2FybjogY29uc29sZS53YXJuLFxuICAgIGVycm9yOiBjb25zb2xlLmVycm9yLFxufTtcbi8vIGxvZyBsZXZlbCAnd2VpZ2h0J1xudmFyIExFVkVMUztcbihmdW5jdGlvbiAoTEVWRUxTKSB7XG4gICAgTEVWRUxTW0xFVkVMU1tcImRlYnVnXCJdID0gMTBdID0gXCJkZWJ1Z1wiO1xuICAgIExFVkVMU1tMRVZFTFNbXCJpbmZvXCJdID0gMjBdID0gXCJpbmZvXCI7XG4gICAgTEVWRUxTW0xFVkVMU1tcIndhcm5cIl0gPSAzMF0gPSBcIndhcm5cIjtcbiAgICBMRVZFTFNbTEVWRUxTW1wiZXJyb3JcIl0gPSA1MF0gPSBcImVycm9yXCI7XG4gICAgTEVWRUxTW0xFVkVMU1tcInNpbGVudFwiXSA9IDgwXSA9IFwic2lsZW50XCI7XG59KShMRVZFTFMgfHwgKExFVkVMUyA9IHt9KSk7XG5mdW5jdGlvbiBnZXRJbnN0YW5jZSgpIHtcbiAgICBpZiAoIWxvZ2dlckluc3RhbmNlKSB7XG4gICAgICAgIGxvZ2dlckluc3RhbmNlID0gbmV3IExvZ2dlcigpO1xuICAgIH1cbiAgICByZXR1cm4gbG9nZ2VySW5zdGFuY2U7XG59XG5leHBvcnRzLmdldEluc3RhbmNlID0gZ2V0SW5zdGFuY2U7XG5jbGFzcyBMb2dnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnNldExldmVsKCdpbmZvJyk7XG4gICAgICAgIHRoaXMuc2V0UHJvdmlkZXIoKCkgPT4gZGVmYXVsdFByb3ZpZGVyKTtcbiAgICB9XG4gICAgLy8gbG9nIHdpbGwgbG9nIG1lc3NhZ2VzLCByZWdhcmRsZXNzIG9mIGxvZ0xldmVsc1xuICAgIGxvZygpIHtcbiAgICAgICAgdGhpcy5wcm92aWRlci5sb2codGhpcy5faW50ZXJwb2xhdGUuYXBwbHkobnVsbCwgYXJndW1lbnRzKSk7XG4gICAgfVxuICAgIGRlYnVnKCkge1xuICAgICAgICBpZiAodGhpcy5fc2hvd0xldmVsKCdkZWJ1ZycpKSB7XG4gICAgICAgICAgICB0aGlzLnByb3ZpZGVyLmRlYnVnKHRoaXMuX2ludGVycG9sYXRlLmFwcGx5KG51bGwsIGFyZ3VtZW50cykpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGluZm8oKSB7XG4gICAgICAgIGlmICh0aGlzLl9zaG93TGV2ZWwoJ2luZm8nKSkge1xuICAgICAgICAgICAgdGhpcy5wcm92aWRlci5pbmZvKHRoaXMuX2ludGVycG9sYXRlLmFwcGx5KG51bGwsIGFyZ3VtZW50cykpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHdhcm4oKSB7XG4gICAgICAgIGlmICh0aGlzLl9zaG93TGV2ZWwoJ3dhcm4nKSkge1xuICAgICAgICAgICAgdGhpcy5wcm92aWRlci53YXJuKHRoaXMuX2ludGVycG9sYXRlLmFwcGx5KG51bGwsIGFyZ3VtZW50cykpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVycm9yKCkge1xuICAgICAgICBpZiAodGhpcy5fc2hvd0xldmVsKCdlcnJvcicpKSB7XG4gICAgICAgICAgICB0aGlzLnByb3ZpZGVyLmVycm9yKHRoaXMuX2ludGVycG9sYXRlLmFwcGx5KG51bGwsIGFyZ3VtZW50cykpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHNldExldmVsKHYpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNWYWxpZExldmVsKHYpKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ0xldmVsID0gdjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzZXRQcm92aWRlcihmbikge1xuICAgICAgICBpZiAoZm4gJiYgdGhpcy5pc1ZhbGlkUHJvdmlkZXIoZm4pKSB7XG4gICAgICAgICAgICB0aGlzLnByb3ZpZGVyID0gZm4oZGVmYXVsdFByb3ZpZGVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpc1ZhbGlkUHJvdmlkZXIoZm5Qcm92aWRlcikge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0cnVlO1xuICAgICAgICBpZiAoZm5Qcm92aWRlciAmJiB0eXBlb2YgZm5Qcm92aWRlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdbSFBNXSBMb2cgcHJvdmlkZXIgY29uZmlnIGVycm9yLiBFeHBlY3RpbmcgYSBmdW5jdGlvbi4nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBpc1ZhbGlkTGV2ZWwobGV2ZWxOYW1lKSB7XG4gICAgICAgIGNvbnN0IHZhbGlkTGV2ZWxzID0gT2JqZWN0LmtleXMoTEVWRUxTKTtcbiAgICAgICAgY29uc3QgaXNWYWxpZCA9IHZhbGlkTGV2ZWxzLmluY2x1ZGVzKGxldmVsTmFtZSk7XG4gICAgICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdbSFBNXSBMb2cgbGV2ZWwgZXJyb3IuIEludmFsaWQgbG9nTGV2ZWwuJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlzVmFsaWQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlY2lkZSB0byBsb2cgb3Igbm90IHRvIGxvZywgYmFzZWQgb24gdGhlIGxvZyBsZXZlbHMgJ3dlaWdodCdcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9ICBzaG93TGV2ZWwgW2RlYnVnLCBpbmZvLCB3YXJuLCBlcnJvciwgc2lsZW50XVxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgX3Nob3dMZXZlbChzaG93TGV2ZWwpIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICBjb25zdCBjdXJyZW50TG9nTGV2ZWwgPSBMRVZFTFNbdGhpcy5sb2dMZXZlbF07XG4gICAgICAgIGlmIChjdXJyZW50TG9nTGV2ZWwgJiYgY3VycmVudExvZ0xldmVsIDw9IExFVkVMU1tzaG93TGV2ZWxdKSB7XG4gICAgICAgICAgICByZXN1bHQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIC8vIG1ha2Ugc3VyZSBsb2dnZWQgbWVzc2FnZXMgYW5kIGl0cyBkYXRhIGFyZSByZXR1cm4gaW50ZXJwb2xhdGVkXG4gICAgLy8gbWFrZSBpdCBwb3NzaWJsZSBmb3IgYWRkaXRpb25hbCBsb2cgZGF0YSwgc3VjaCBkYXRlL3RpbWUgb3IgY3VzdG9tIHByZWZpeC5cbiAgICBfaW50ZXJwb2xhdGUoZm9ybWF0LCAuLi5hcmdzKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHV0aWwuZm9ybWF0KGZvcm1hdCwgLi4uYXJncyk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufVxuLyoqXG4gKiAtPiBub3JtYWwgcHJveHlcbiAqID0+IHJvdXRlclxuICogfj4gcGF0aFJld3JpdGVcbiAqIOKJiD4gcm91dGVyICsgcGF0aFJld3JpdGVcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IG9yaWdpbmFsUGF0aFxuICogQHBhcmFtICB7U3RyaW5nfSBuZXdQYXRoXG4gKiBAcGFyYW0gIHtTdHJpbmd9IG9yaWdpbmFsVGFyZ2V0XG4gKiBAcGFyYW0gIHtTdHJpbmd9IG5ld1RhcmdldFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBnZXRBcnJvdyhvcmlnaW5hbFBhdGgsIG5ld1BhdGgsIG9yaWdpbmFsVGFyZ2V0LCBuZXdUYXJnZXQpIHtcbiAgICBjb25zdCBhcnJvdyA9IFsnPiddO1xuICAgIGNvbnN0IGlzTmV3VGFyZ2V0ID0gb3JpZ2luYWxUYXJnZXQgIT09IG5ld1RhcmdldDsgLy8gcm91dGVyXG4gICAgY29uc3QgaXNOZXdQYXRoID0gb3JpZ2luYWxQYXRoICE9PSBuZXdQYXRoOyAvLyBwYXRoUmV3cml0ZVxuICAgIGlmIChpc05ld1BhdGggJiYgIWlzTmV3VGFyZ2V0KSB7XG4gICAgICAgIGFycm93LnVuc2hpZnQoJ34nKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIWlzTmV3UGF0aCAmJiBpc05ld1RhcmdldCkge1xuICAgICAgICBhcnJvdy51bnNoaWZ0KCc9Jyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzTmV3UGF0aCAmJiBpc05ld1RhcmdldCkge1xuICAgICAgICBhcnJvdy51bnNoaWZ0KCfiiYgnKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGFycm93LnVuc2hpZnQoJy0nKTtcbiAgICB9XG4gICAgcmV0dXJuIGFycm93LmpvaW4oJycpO1xufVxuZXhwb3J0cy5nZXRBcnJvdyA9IGdldEFycm93O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmNyZWF0ZUNvbmZpZyA9IHZvaWQgMDtcbmNvbnN0IGlzUGxhaW5PYmogPSByZXF1aXJlKFwiaXMtcGxhaW4tb2JqXCIpO1xuY29uc3QgdXJsID0gcmVxdWlyZShcInVybFwiKTtcbmNvbnN0IGVycm9yc18xID0gcmVxdWlyZShcIi4vZXJyb3JzXCIpO1xuY29uc3QgbG9nZ2VyXzEgPSByZXF1aXJlKFwiLi9sb2dnZXJcIik7XG5jb25zdCBsb2dnZXIgPSAoMCwgbG9nZ2VyXzEuZ2V0SW5zdGFuY2UpKCk7XG5mdW5jdGlvbiBjcmVhdGVDb25maWcoY29udGV4dCwgb3B0cykge1xuICAgIC8vIHN0cnVjdHVyZSBvZiBjb25maWcgb2JqZWN0IHRvIGJlIHJldHVybmVkXG4gICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgIG9wdGlvbnM6IHt9LFxuICAgIH07XG4gICAgLy8gYXBwLnVzZSgnL2FwaScsIHByb3h5KHt0YXJnZXQ6J2h0dHA6Ly9sb2NhbGhvc3Q6OTAwMCd9KSk7XG4gICAgaWYgKGlzQ29udGV4dGxlc3MoY29udGV4dCwgb3B0cykpIHtcbiAgICAgICAgY29uZmlnLmNvbnRleHQgPSAnLyc7XG4gICAgICAgIGNvbmZpZy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbihjb25maWcub3B0aW9ucywgY29udGV4dCk7XG4gICAgICAgIC8vIGFwcC51c2UoJy9hcGknLCBwcm94eSgnaHR0cDovL2xvY2FsaG9zdDo5MDAwJykpO1xuICAgICAgICAvLyBhcHAudXNlKHByb3h5KCdodHRwOi8vbG9jYWxob3N0OjkwMDAvYXBpJykpO1xuICAgIH1cbiAgICBlbHNlIGlmIChpc1N0cmluZ1Nob3J0SGFuZChjb250ZXh0KSkge1xuICAgICAgICBjb25zdCBvVXJsID0gdXJsLnBhcnNlKGNvbnRleHQpO1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBbb1VybC5wcm90b2NvbCwgJy8vJywgb1VybC5ob3N0XS5qb2luKCcnKTtcbiAgICAgICAgY29uZmlnLmNvbnRleHQgPSBvVXJsLnBhdGhuYW1lIHx8ICcvJztcbiAgICAgICAgY29uZmlnLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKGNvbmZpZy5vcHRpb25zLCB7IHRhcmdldCB9LCBvcHRzKTtcbiAgICAgICAgaWYgKG9VcmwucHJvdG9jb2wgPT09ICd3czonIHx8IG9VcmwucHJvdG9jb2wgPT09ICd3c3M6Jykge1xuICAgICAgICAgICAgY29uZmlnLm9wdGlvbnMud3MgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFwcC51c2UoJy9hcGknLCBwcm94eSh7dGFyZ2V0OidodHRwOi8vbG9jYWxob3N0OjkwMDAnfSkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29uZmlnLmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICBjb25maWcub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oY29uZmlnLm9wdGlvbnMsIG9wdHMpO1xuICAgIH1cbiAgICBjb25maWd1cmVMb2dnZXIoY29uZmlnLm9wdGlvbnMpO1xuICAgIGlmICghY29uZmlnLm9wdGlvbnMudGFyZ2V0ICYmICFjb25maWcub3B0aW9ucy5yb3V0ZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yc18xLkVSUk9SUy5FUlJfQ09ORklHX0ZBQ1RPUllfVEFSR0VUX01JU1NJTkcpO1xuICAgIH1cbiAgICByZXR1cm4gY29uZmlnO1xufVxuZXhwb3J0cy5jcmVhdGVDb25maWcgPSBjcmVhdGVDb25maWc7XG4vKipcbiAqIENoZWNrcyBpZiBhIFN0cmluZyBvbmx5IHRhcmdldC9jb25maWcgaXMgcHJvdmlkZWQuXG4gKiBUaGlzIGNhbiBiZSBqdXN0IHRoZSBob3N0IG9yIHdpdGggdGhlIG9wdGlvbmFsIHBhdGguXG4gKlxuICogQGV4YW1wbGVcbiAqICAgICAgYXBwLnVzZSgnL2FwaScsIHByb3h5KCdodHRwOi8vbG9jYWxob3N0OjkwMDAnKSk7XG4gKiAgICAgIGFwcC51c2UocHJveHkoJ2h0dHA6Ly9sb2NhbGhvc3Q6OTAwMC9hcGknKSk7XG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSAgY29udGV4dCBbZGVzY3JpcHRpb25dXG4gKiBAcmV0dXJuIHtCb29sZWFufSAgICAgICAgIFtkZXNjcmlwdGlvbl1cbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmdTaG9ydEhhbmQoY29udGV4dCkge1xuICAgIGlmICh0eXBlb2YgY29udGV4dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuICEhdXJsLnBhcnNlKGNvbnRleHQpLmhvc3Q7XG4gICAgfVxufVxuLyoqXG4gKiBDaGVja3MgaWYgYSBPYmplY3Qgb25seSBjb25maWcgaXMgcHJvdmlkZWQsIHdpdGhvdXQgYSBjb250ZXh0LlxuICogSW4gdGhpcyBjYXNlIHRoZSBhbGwgcGF0aHMgd2lsbCBiZSBwcm94aWVkLlxuICpcbiAqIEBleGFtcGxlXG4gKiAgICAgYXBwLnVzZSgnL2FwaScsIHByb3h5KHt0YXJnZXQ6J2h0dHA6Ly9sb2NhbGhvc3Q6OTAwMCd9KSk7XG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSAgY29udGV4dCBbZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0gIHsqfSAgICAgICBvcHRzICAgIFtkZXNjcmlwdGlvbl1cbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgICAgW2Rlc2NyaXB0aW9uXVxuICovXG5mdW5jdGlvbiBpc0NvbnRleHRsZXNzKGNvbnRleHQsIG9wdHMpIHtcbiAgICByZXR1cm4gaXNQbGFpbk9iaihjb250ZXh0KSAmJiAob3B0cyA9PSBudWxsIHx8IE9iamVjdC5rZXlzKG9wdHMpLmxlbmd0aCA9PT0gMCk7XG59XG5mdW5jdGlvbiBjb25maWd1cmVMb2dnZXIob3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLmxvZ0xldmVsKSB7XG4gICAgICAgIGxvZ2dlci5zZXRMZXZlbChvcHRpb25zLmxvZ0xldmVsKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMubG9nUHJvdmlkZXIpIHtcbiAgICAgICAgbG9nZ2VyLnNldFByb3ZpZGVyKG9wdGlvbnMubG9nUHJvdmlkZXIpO1xuICAgIH1cbn1cbiIsIi8qIVxuICogaXMtZXh0Z2xvYiA8aHR0cHM6Ly9naXRodWIuY29tL2pvbnNjaGxpbmtlcnQvaXMtZXh0Z2xvYj5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNiwgSm9uIFNjaGxpbmtlcnQuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0V4dGdsb2Ioc3RyKSB7XG4gIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJyB8fCBzdHIgPT09ICcnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIG1hdGNoO1xuICB3aGlsZSAoKG1hdGNoID0gLyhcXFxcKS58KFtAPyErKl1cXCguKlxcKSkvZy5leGVjKHN0cikpKSB7XG4gICAgaWYgKG1hdGNoWzJdKSByZXR1cm4gdHJ1ZTtcbiAgICBzdHIgPSBzdHIuc2xpY2UobWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGgpO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcbiIsIi8qIVxuICogaXMtZ2xvYiA8aHR0cHM6Ly9naXRodWIuY29tL2pvbnNjaGxpbmtlcnQvaXMtZ2xvYj5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNywgSm9uIFNjaGxpbmtlcnQuXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gKi9cblxudmFyIGlzRXh0Z2xvYiA9IHJlcXVpcmUoJ2lzLWV4dGdsb2InKTtcbnZhciBjaGFycyA9IHsgJ3snOiAnfScsICcoJzogJyknLCAnWyc6ICddJ307XG52YXIgc3RyaWN0Q2hlY2sgPSBmdW5jdGlvbihzdHIpIHtcbiAgaWYgKHN0clswXSA9PT0gJyEnKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdmFyIGluZGV4ID0gMDtcbiAgdmFyIHBpcGVJbmRleCA9IC0yO1xuICB2YXIgY2xvc2VTcXVhcmVJbmRleCA9IC0yO1xuICB2YXIgY2xvc2VDdXJseUluZGV4ID0gLTI7XG4gIHZhciBjbG9zZVBhcmVuSW5kZXggPSAtMjtcbiAgdmFyIGJhY2tTbGFzaEluZGV4ID0gLTI7XG4gIHdoaWxlIChpbmRleCA8IHN0ci5sZW5ndGgpIHtcbiAgICBpZiAoc3RyW2luZGV4XSA9PT0gJyonKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoc3RyW2luZGV4ICsgMV0gPT09ICc/JyAmJiAvW1xcXS4rKV0vLnRlc3Qoc3RyW2luZGV4XSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmIChjbG9zZVNxdWFyZUluZGV4ICE9PSAtMSAmJiBzdHJbaW5kZXhdID09PSAnWycgJiYgc3RyW2luZGV4ICsgMV0gIT09ICddJykge1xuICAgICAgaWYgKGNsb3NlU3F1YXJlSW5kZXggPCBpbmRleCkge1xuICAgICAgICBjbG9zZVNxdWFyZUluZGV4ID0gc3RyLmluZGV4T2YoJ10nLCBpbmRleCk7XG4gICAgICB9XG4gICAgICBpZiAoY2xvc2VTcXVhcmVJbmRleCA+IGluZGV4KSB7XG4gICAgICAgIGlmIChiYWNrU2xhc2hJbmRleCA9PT0gLTEgfHwgYmFja1NsYXNoSW5kZXggPiBjbG9zZVNxdWFyZUluZGV4KSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgYmFja1NsYXNoSW5kZXggPSBzdHIuaW5kZXhPZignXFxcXCcsIGluZGV4KTtcbiAgICAgICAgaWYgKGJhY2tTbGFzaEluZGV4ID09PSAtMSB8fCBiYWNrU2xhc2hJbmRleCA+IGNsb3NlU3F1YXJlSW5kZXgpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjbG9zZUN1cmx5SW5kZXggIT09IC0xICYmIHN0cltpbmRleF0gPT09ICd7JyAmJiBzdHJbaW5kZXggKyAxXSAhPT0gJ30nKSB7XG4gICAgICBjbG9zZUN1cmx5SW5kZXggPSBzdHIuaW5kZXhPZignfScsIGluZGV4KTtcbiAgICAgIGlmIChjbG9zZUN1cmx5SW5kZXggPiBpbmRleCkge1xuICAgICAgICBiYWNrU2xhc2hJbmRleCA9IHN0ci5pbmRleE9mKCdcXFxcJywgaW5kZXgpO1xuICAgICAgICBpZiAoYmFja1NsYXNoSW5kZXggPT09IC0xIHx8IGJhY2tTbGFzaEluZGV4ID4gY2xvc2VDdXJseUluZGV4KSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY2xvc2VQYXJlbkluZGV4ICE9PSAtMSAmJiBzdHJbaW5kZXhdID09PSAnKCcgJiYgc3RyW2luZGV4ICsgMV0gPT09ICc/JyAmJiAvWzohPV0vLnRlc3Qoc3RyW2luZGV4ICsgMl0pICYmIHN0cltpbmRleCArIDNdICE9PSAnKScpIHtcbiAgICAgIGNsb3NlUGFyZW5JbmRleCA9IHN0ci5pbmRleE9mKCcpJywgaW5kZXgpO1xuICAgICAgaWYgKGNsb3NlUGFyZW5JbmRleCA+IGluZGV4KSB7XG4gICAgICAgIGJhY2tTbGFzaEluZGV4ID0gc3RyLmluZGV4T2YoJ1xcXFwnLCBpbmRleCk7XG4gICAgICAgIGlmIChiYWNrU2xhc2hJbmRleCA9PT0gLTEgfHwgYmFja1NsYXNoSW5kZXggPiBjbG9zZVBhcmVuSW5kZXgpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwaXBlSW5kZXggIT09IC0xICYmIHN0cltpbmRleF0gPT09ICcoJyAmJiBzdHJbaW5kZXggKyAxXSAhPT0gJ3wnKSB7XG4gICAgICBpZiAocGlwZUluZGV4IDwgaW5kZXgpIHtcbiAgICAgICAgcGlwZUluZGV4ID0gc3RyLmluZGV4T2YoJ3wnLCBpbmRleCk7XG4gICAgICB9XG4gICAgICBpZiAocGlwZUluZGV4ICE9PSAtMSAmJiBzdHJbcGlwZUluZGV4ICsgMV0gIT09ICcpJykge1xuICAgICAgICBjbG9zZVBhcmVuSW5kZXggPSBzdHIuaW5kZXhPZignKScsIHBpcGVJbmRleCk7XG4gICAgICAgIGlmIChjbG9zZVBhcmVuSW5kZXggPiBwaXBlSW5kZXgpIHtcbiAgICAgICAgICBiYWNrU2xhc2hJbmRleCA9IHN0ci5pbmRleE9mKCdcXFxcJywgcGlwZUluZGV4KTtcbiAgICAgICAgICBpZiAoYmFja1NsYXNoSW5kZXggPT09IC0xIHx8IGJhY2tTbGFzaEluZGV4ID4gY2xvc2VQYXJlbkluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3RyW2luZGV4XSA9PT0gJ1xcXFwnKSB7XG4gICAgICB2YXIgb3BlbiA9IHN0cltpbmRleCArIDFdO1xuICAgICAgaW5kZXggKz0gMjtcbiAgICAgIHZhciBjbG9zZSA9IGNoYXJzW29wZW5dO1xuXG4gICAgICBpZiAoY2xvc2UpIHtcbiAgICAgICAgdmFyIG4gPSBzdHIuaW5kZXhPZihjbG9zZSwgaW5kZXgpO1xuICAgICAgICBpZiAobiAhPT0gLTEpIHtcbiAgICAgICAgICBpbmRleCA9IG4gKyAxO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzdHJbaW5kZXhdID09PSAnIScpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGluZGV4Kys7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbnZhciByZWxheGVkQ2hlY2sgPSBmdW5jdGlvbihzdHIpIHtcbiAgaWYgKHN0clswXSA9PT0gJyEnKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdmFyIGluZGV4ID0gMDtcbiAgd2hpbGUgKGluZGV4IDwgc3RyLmxlbmd0aCkge1xuICAgIGlmICgvWyo/e30oKVtcXF1dLy50ZXN0KHN0cltpbmRleF0pKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoc3RyW2luZGV4XSA9PT0gJ1xcXFwnKSB7XG4gICAgICB2YXIgb3BlbiA9IHN0cltpbmRleCArIDFdO1xuICAgICAgaW5kZXggKz0gMjtcbiAgICAgIHZhciBjbG9zZSA9IGNoYXJzW29wZW5dO1xuXG4gICAgICBpZiAoY2xvc2UpIHtcbiAgICAgICAgdmFyIG4gPSBzdHIuaW5kZXhPZihjbG9zZSwgaW5kZXgpO1xuICAgICAgICBpZiAobiAhPT0gLTEpIHtcbiAgICAgICAgICBpbmRleCA9IG4gKyAxO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzdHJbaW5kZXhdID09PSAnIScpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGluZGV4Kys7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNHbG9iKHN0ciwgb3B0aW9ucykge1xuICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycgfHwgc3RyID09PSAnJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChpc0V4dGdsb2Ioc3RyKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgdmFyIGNoZWNrID0gc3RyaWN0Q2hlY2s7XG5cbiAgLy8gb3B0aW9uYWxseSByZWxheCBjaGVja1xuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnN0cmljdCA9PT0gZmFsc2UpIHtcbiAgICBjaGVjayA9IHJlbGF4ZWRDaGVjaztcbiAgfVxuXG4gIHJldHVybiBjaGVjayhzdHIpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5pc0ludGVnZXIgPSBudW0gPT4ge1xuICBpZiAodHlwZW9mIG51bSA9PT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gTnVtYmVyLmlzSW50ZWdlcihudW0pO1xuICB9XG4gIGlmICh0eXBlb2YgbnVtID09PSAnc3RyaW5nJyAmJiBudW0udHJpbSgpICE9PSAnJykge1xuICAgIHJldHVybiBOdW1iZXIuaXNJbnRlZ2VyKE51bWJlcihudW0pKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIEZpbmQgYSBub2RlIG9mIHRoZSBnaXZlbiB0eXBlXG4gKi9cblxuZXhwb3J0cy5maW5kID0gKG5vZGUsIHR5cGUpID0+IG5vZGUubm9kZXMuZmluZChub2RlID0+IG5vZGUudHlwZSA9PT0gdHlwZSk7XG5cbi8qKlxuICogRmluZCBhIG5vZGUgb2YgdGhlIGdpdmVuIHR5cGVcbiAqL1xuXG5leHBvcnRzLmV4Y2VlZHNMaW1pdCA9IChtaW4sIG1heCwgc3RlcCA9IDEsIGxpbWl0KSA9PiB7XG4gIGlmIChsaW1pdCA9PT0gZmFsc2UpIHJldHVybiBmYWxzZTtcbiAgaWYgKCFleHBvcnRzLmlzSW50ZWdlcihtaW4pIHx8ICFleHBvcnRzLmlzSW50ZWdlcihtYXgpKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiAoKE51bWJlcihtYXgpIC0gTnVtYmVyKG1pbikpIC8gTnVtYmVyKHN0ZXApKSA+PSBsaW1pdDtcbn07XG5cbi8qKlxuICogRXNjYXBlIHRoZSBnaXZlbiBub2RlIHdpdGggJ1xcXFwnIGJlZm9yZSBub2RlLnZhbHVlXG4gKi9cblxuZXhwb3J0cy5lc2NhcGVOb2RlID0gKGJsb2NrLCBuID0gMCwgdHlwZSkgPT4ge1xuICBsZXQgbm9kZSA9IGJsb2NrLm5vZGVzW25dO1xuICBpZiAoIW5vZGUpIHJldHVybjtcblxuICBpZiAoKHR5cGUgJiYgbm9kZS50eXBlID09PSB0eXBlKSB8fCBub2RlLnR5cGUgPT09ICdvcGVuJyB8fCBub2RlLnR5cGUgPT09ICdjbG9zZScpIHtcbiAgICBpZiAobm9kZS5lc2NhcGVkICE9PSB0cnVlKSB7XG4gICAgICBub2RlLnZhbHVlID0gJ1xcXFwnICsgbm9kZS52YWx1ZTtcbiAgICAgIG5vZGUuZXNjYXBlZCA9IHRydWU7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gYnJhY2Ugbm9kZSBzaG91bGQgYmUgZW5jbG9zZWQgaW4gbGl0ZXJhbCBicmFjZXNcbiAqL1xuXG5leHBvcnRzLmVuY2xvc2VCcmFjZSA9IG5vZGUgPT4ge1xuICBpZiAobm9kZS50eXBlICE9PSAnYnJhY2UnKSByZXR1cm4gZmFsc2U7XG4gIGlmICgobm9kZS5jb21tYXMgPj4gMCArIG5vZGUucmFuZ2VzID4+IDApID09PSAwKSB7XG4gICAgbm9kZS5pbnZhbGlkID0gdHJ1ZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiBhIGJyYWNlIG5vZGUgaXMgaW52YWxpZC5cbiAqL1xuXG5leHBvcnRzLmlzSW52YWxpZEJyYWNlID0gYmxvY2sgPT4ge1xuICBpZiAoYmxvY2sudHlwZSAhPT0gJ2JyYWNlJykgcmV0dXJuIGZhbHNlO1xuICBpZiAoYmxvY2suaW52YWxpZCA9PT0gdHJ1ZSB8fCBibG9jay5kb2xsYXIpIHJldHVybiB0cnVlO1xuICBpZiAoKGJsb2NrLmNvbW1hcyA+PiAwICsgYmxvY2sucmFuZ2VzID4+IDApID09PSAwKSB7XG4gICAgYmxvY2suaW52YWxpZCA9IHRydWU7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGJsb2NrLm9wZW4gIT09IHRydWUgfHwgYmxvY2suY2xvc2UgIT09IHRydWUpIHtcbiAgICBibG9jay5pbnZhbGlkID0gdHJ1ZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiBhIG5vZGUgaXMgYW4gb3BlbiBvciBjbG9zZSBub2RlXG4gKi9cblxuZXhwb3J0cy5pc09wZW5PckNsb3NlID0gbm9kZSA9PiB7XG4gIGlmIChub2RlLnR5cGUgPT09ICdvcGVuJyB8fCBub2RlLnR5cGUgPT09ICdjbG9zZScpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gbm9kZS5vcGVuID09PSB0cnVlIHx8IG5vZGUuY2xvc2UgPT09IHRydWU7XG59O1xuXG4vKipcbiAqIFJlZHVjZSBhbiBhcnJheSBvZiB0ZXh0IG5vZGVzLlxuICovXG5cbmV4cG9ydHMucmVkdWNlID0gbm9kZXMgPT4gbm9kZXMucmVkdWNlKChhY2MsIG5vZGUpID0+IHtcbiAgaWYgKG5vZGUudHlwZSA9PT0gJ3RleHQnKSBhY2MucHVzaChub2RlLnZhbHVlKTtcbiAgaWYgKG5vZGUudHlwZSA9PT0gJ3JhbmdlJykgbm9kZS50eXBlID0gJ3RleHQnO1xuICByZXR1cm4gYWNjO1xufSwgW10pO1xuXG4vKipcbiAqIEZsYXR0ZW4gYW4gYXJyYXlcbiAqL1xuXG5leHBvcnRzLmZsYXR0ZW4gPSAoLi4uYXJncykgPT4ge1xuICBjb25zdCByZXN1bHQgPSBbXTtcbiAgY29uc3QgZmxhdCA9IGFyciA9PiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBlbGUgPSBhcnJbaV07XG4gICAgICBBcnJheS5pc0FycmF5KGVsZSkgPyBmbGF0KGVsZSwgcmVzdWx0KSA6IGVsZSAhPT0gdm9pZCAwICYmIHJlc3VsdC5wdXNoKGVsZSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIGZsYXQoYXJncyk7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoYXN0LCBvcHRpb25zID0ge30pID0+IHtcbiAgbGV0IHN0cmluZ2lmeSA9IChub2RlLCBwYXJlbnQgPSB7fSkgPT4ge1xuICAgIGxldCBpbnZhbGlkQmxvY2sgPSBvcHRpb25zLmVzY2FwZUludmFsaWQgJiYgdXRpbHMuaXNJbnZhbGlkQnJhY2UocGFyZW50KTtcbiAgICBsZXQgaW52YWxpZE5vZGUgPSBub2RlLmludmFsaWQgPT09IHRydWUgJiYgb3B0aW9ucy5lc2NhcGVJbnZhbGlkID09PSB0cnVlO1xuICAgIGxldCBvdXRwdXQgPSAnJztcblxuICAgIGlmIChub2RlLnZhbHVlKSB7XG4gICAgICBpZiAoKGludmFsaWRCbG9jayB8fCBpbnZhbGlkTm9kZSkgJiYgdXRpbHMuaXNPcGVuT3JDbG9zZShub2RlKSkge1xuICAgICAgICByZXR1cm4gJ1xcXFwnICsgbm9kZS52YWx1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBub2RlLnZhbHVlO1xuICAgIH1cblxuICAgIGlmIChub2RlLnZhbHVlKSB7XG4gICAgICByZXR1cm4gbm9kZS52YWx1ZTtcbiAgICB9XG5cbiAgICBpZiAobm9kZS5ub2Rlcykge1xuICAgICAgZm9yIChsZXQgY2hpbGQgb2Ygbm9kZS5ub2Rlcykge1xuICAgICAgICBvdXRwdXQgKz0gc3RyaW5naWZ5KGNoaWxkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfTtcblxuICByZXR1cm4gc3RyaW5naWZ5KGFzdCk7XG59O1xuXG4iLCIvKiFcbiAqIGlzLW51bWJlciA8aHR0cHM6Ly9naXRodWIuY29tL2pvbnNjaGxpbmtlcnQvaXMtbnVtYmVyPlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNC1wcmVzZW50LCBKb24gU2NobGlua2VydC5cbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obnVtKSB7XG4gIGlmICh0eXBlb2YgbnVtID09PSAnbnVtYmVyJykge1xuICAgIHJldHVybiBudW0gLSBudW0gPT09IDA7XG4gIH1cbiAgaWYgKHR5cGVvZiBudW0gPT09ICdzdHJpbmcnICYmIG51bS50cmltKCkgIT09ICcnKSB7XG4gICAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZSA/IE51bWJlci5pc0Zpbml0ZSgrbnVtKSA6IGlzRmluaXRlKCtudW0pO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG4iLCIvKiFcbiAqIHRvLXJlZ2V4LXJhbmdlIDxodHRwczovL2dpdGh1Yi5jb20vbWljcm9tYXRjaC90by1yZWdleC1yYW5nZT5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgSm9uIFNjaGxpbmtlcnQuXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBpc051bWJlciA9IHJlcXVpcmUoJ2lzLW51bWJlcicpO1xuXG5jb25zdCB0b1JlZ2V4UmFuZ2UgPSAobWluLCBtYXgsIG9wdGlvbnMpID0+IHtcbiAgaWYgKGlzTnVtYmVyKG1pbikgPT09IGZhbHNlKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndG9SZWdleFJhbmdlOiBleHBlY3RlZCB0aGUgZmlyc3QgYXJndW1lbnQgdG8gYmUgYSBudW1iZXInKTtcbiAgfVxuXG4gIGlmIChtYXggPT09IHZvaWQgMCB8fCBtaW4gPT09IG1heCkge1xuICAgIHJldHVybiBTdHJpbmcobWluKTtcbiAgfVxuXG4gIGlmIChpc051bWJlcihtYXgpID09PSBmYWxzZSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3RvUmVnZXhSYW5nZTogZXhwZWN0ZWQgdGhlIHNlY29uZCBhcmd1bWVudCB0byBiZSBhIG51bWJlci4nKTtcbiAgfVxuXG4gIGxldCBvcHRzID0geyByZWxheFplcm9zOiB0cnVlLCAuLi5vcHRpb25zIH07XG4gIGlmICh0eXBlb2Ygb3B0cy5zdHJpY3RaZXJvcyA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgb3B0cy5yZWxheFplcm9zID0gb3B0cy5zdHJpY3RaZXJvcyA9PT0gZmFsc2U7XG4gIH1cblxuICBsZXQgcmVsYXggPSBTdHJpbmcob3B0cy5yZWxheFplcm9zKTtcbiAgbGV0IHNob3J0aGFuZCA9IFN0cmluZyhvcHRzLnNob3J0aGFuZCk7XG4gIGxldCBjYXB0dXJlID0gU3RyaW5nKG9wdHMuY2FwdHVyZSk7XG4gIGxldCB3cmFwID0gU3RyaW5nKG9wdHMud3JhcCk7XG4gIGxldCBjYWNoZUtleSA9IG1pbiArICc6JyArIG1heCArICc9JyArIHJlbGF4ICsgc2hvcnRoYW5kICsgY2FwdHVyZSArIHdyYXA7XG5cbiAgaWYgKHRvUmVnZXhSYW5nZS5jYWNoZS5oYXNPd25Qcm9wZXJ0eShjYWNoZUtleSkpIHtcbiAgICByZXR1cm4gdG9SZWdleFJhbmdlLmNhY2hlW2NhY2hlS2V5XS5yZXN1bHQ7XG4gIH1cblxuICBsZXQgYSA9IE1hdGgubWluKG1pbiwgbWF4KTtcbiAgbGV0IGIgPSBNYXRoLm1heChtaW4sIG1heCk7XG5cbiAgaWYgKE1hdGguYWJzKGEgLSBiKSA9PT0gMSkge1xuICAgIGxldCByZXN1bHQgPSBtaW4gKyAnfCcgKyBtYXg7XG4gICAgaWYgKG9wdHMuY2FwdHVyZSkge1xuICAgICAgcmV0dXJuIGAoJHtyZXN1bHR9KWA7XG4gICAgfVxuICAgIGlmIChvcHRzLndyYXAgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICByZXR1cm4gYCg/OiR7cmVzdWx0fSlgO1xuICB9XG5cbiAgbGV0IGlzUGFkZGVkID0gaGFzUGFkZGluZyhtaW4pIHx8IGhhc1BhZGRpbmcobWF4KTtcbiAgbGV0IHN0YXRlID0geyBtaW4sIG1heCwgYSwgYiB9O1xuICBsZXQgcG9zaXRpdmVzID0gW107XG4gIGxldCBuZWdhdGl2ZXMgPSBbXTtcblxuICBpZiAoaXNQYWRkZWQpIHtcbiAgICBzdGF0ZS5pc1BhZGRlZCA9IGlzUGFkZGVkO1xuICAgIHN0YXRlLm1heExlbiA9IFN0cmluZyhzdGF0ZS5tYXgpLmxlbmd0aDtcbiAgfVxuXG4gIGlmIChhIDwgMCkge1xuICAgIGxldCBuZXdNaW4gPSBiIDwgMCA/IE1hdGguYWJzKGIpIDogMTtcbiAgICBuZWdhdGl2ZXMgPSBzcGxpdFRvUGF0dGVybnMobmV3TWluLCBNYXRoLmFicyhhKSwgc3RhdGUsIG9wdHMpO1xuICAgIGEgPSBzdGF0ZS5hID0gMDtcbiAgfVxuXG4gIGlmIChiID49IDApIHtcbiAgICBwb3NpdGl2ZXMgPSBzcGxpdFRvUGF0dGVybnMoYSwgYiwgc3RhdGUsIG9wdHMpO1xuICB9XG5cbiAgc3RhdGUubmVnYXRpdmVzID0gbmVnYXRpdmVzO1xuICBzdGF0ZS5wb3NpdGl2ZXMgPSBwb3NpdGl2ZXM7XG4gIHN0YXRlLnJlc3VsdCA9IGNvbGxhdGVQYXR0ZXJucyhuZWdhdGl2ZXMsIHBvc2l0aXZlcywgb3B0cyk7XG5cbiAgaWYgKG9wdHMuY2FwdHVyZSA9PT0gdHJ1ZSkge1xuICAgIHN0YXRlLnJlc3VsdCA9IGAoJHtzdGF0ZS5yZXN1bHR9KWA7XG4gIH0gZWxzZSBpZiAob3B0cy53cmFwICE9PSBmYWxzZSAmJiAocG9zaXRpdmVzLmxlbmd0aCArIG5lZ2F0aXZlcy5sZW5ndGgpID4gMSkge1xuICAgIHN0YXRlLnJlc3VsdCA9IGAoPzoke3N0YXRlLnJlc3VsdH0pYDtcbiAgfVxuXG4gIHRvUmVnZXhSYW5nZS5jYWNoZVtjYWNoZUtleV0gPSBzdGF0ZTtcbiAgcmV0dXJuIHN0YXRlLnJlc3VsdDtcbn07XG5cbmZ1bmN0aW9uIGNvbGxhdGVQYXR0ZXJucyhuZWcsIHBvcywgb3B0aW9ucykge1xuICBsZXQgb25seU5lZ2F0aXZlID0gZmlsdGVyUGF0dGVybnMobmVnLCBwb3MsICctJywgZmFsc2UsIG9wdGlvbnMpIHx8IFtdO1xuICBsZXQgb25seVBvc2l0aXZlID0gZmlsdGVyUGF0dGVybnMocG9zLCBuZWcsICcnLCBmYWxzZSwgb3B0aW9ucykgfHwgW107XG4gIGxldCBpbnRlcnNlY3RlZCA9IGZpbHRlclBhdHRlcm5zKG5lZywgcG9zLCAnLT8nLCB0cnVlLCBvcHRpb25zKSB8fCBbXTtcbiAgbGV0IHN1YnBhdHRlcm5zID0gb25seU5lZ2F0aXZlLmNvbmNhdChpbnRlcnNlY3RlZCkuY29uY2F0KG9ubHlQb3NpdGl2ZSk7XG4gIHJldHVybiBzdWJwYXR0ZXJucy5qb2luKCd8Jyk7XG59XG5cbmZ1bmN0aW9uIHNwbGl0VG9SYW5nZXMobWluLCBtYXgpIHtcbiAgbGV0IG5pbmVzID0gMTtcbiAgbGV0IHplcm9zID0gMTtcblxuICBsZXQgc3RvcCA9IGNvdW50TmluZXMobWluLCBuaW5lcyk7XG4gIGxldCBzdG9wcyA9IG5ldyBTZXQoW21heF0pO1xuXG4gIHdoaWxlIChtaW4gPD0gc3RvcCAmJiBzdG9wIDw9IG1heCkge1xuICAgIHN0b3BzLmFkZChzdG9wKTtcbiAgICBuaW5lcyArPSAxO1xuICAgIHN0b3AgPSBjb3VudE5pbmVzKG1pbiwgbmluZXMpO1xuICB9XG5cbiAgc3RvcCA9IGNvdW50WmVyb3MobWF4ICsgMSwgemVyb3MpIC0gMTtcblxuICB3aGlsZSAobWluIDwgc3RvcCAmJiBzdG9wIDw9IG1heCkge1xuICAgIHN0b3BzLmFkZChzdG9wKTtcbiAgICB6ZXJvcyArPSAxO1xuICAgIHN0b3AgPSBjb3VudFplcm9zKG1heCArIDEsIHplcm9zKSAtIDE7XG4gIH1cblxuICBzdG9wcyA9IFsuLi5zdG9wc107XG4gIHN0b3BzLnNvcnQoY29tcGFyZSk7XG4gIHJldHVybiBzdG9wcztcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgcmFuZ2UgdG8gYSByZWdleCBwYXR0ZXJuXG4gKiBAcGFyYW0ge051bWJlcn0gYHN0YXJ0YFxuICogQHBhcmFtIHtOdW1iZXJ9IGBzdG9wYFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIHJhbmdlVG9QYXR0ZXJuKHN0YXJ0LCBzdG9wLCBvcHRpb25zKSB7XG4gIGlmIChzdGFydCA9PT0gc3RvcCkge1xuICAgIHJldHVybiB7IHBhdHRlcm46IHN0YXJ0LCBjb3VudDogW10sIGRpZ2l0czogMCB9O1xuICB9XG5cbiAgbGV0IHppcHBlZCA9IHppcChzdGFydCwgc3RvcCk7XG4gIGxldCBkaWdpdHMgPSB6aXBwZWQubGVuZ3RoO1xuICBsZXQgcGF0dGVybiA9ICcnO1xuICBsZXQgY291bnQgPSAwO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGlnaXRzOyBpKyspIHtcbiAgICBsZXQgW3N0YXJ0RGlnaXQsIHN0b3BEaWdpdF0gPSB6aXBwZWRbaV07XG5cbiAgICBpZiAoc3RhcnREaWdpdCA9PT0gc3RvcERpZ2l0KSB7XG4gICAgICBwYXR0ZXJuICs9IHN0YXJ0RGlnaXQ7XG5cbiAgICB9IGVsc2UgaWYgKHN0YXJ0RGlnaXQgIT09ICcwJyB8fCBzdG9wRGlnaXQgIT09ICc5Jykge1xuICAgICAgcGF0dGVybiArPSB0b0NoYXJhY3RlckNsYXNzKHN0YXJ0RGlnaXQsIHN0b3BEaWdpdCwgb3B0aW9ucyk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgY291bnQrKztcbiAgICB9XG4gIH1cblxuICBpZiAoY291bnQpIHtcbiAgICBwYXR0ZXJuICs9IG9wdGlvbnMuc2hvcnRoYW5kID09PSB0cnVlID8gJ1xcXFxkJyA6ICdbMC05XSc7XG4gIH1cblxuICByZXR1cm4geyBwYXR0ZXJuLCBjb3VudDogW2NvdW50XSwgZGlnaXRzIH07XG59XG5cbmZ1bmN0aW9uIHNwbGl0VG9QYXR0ZXJucyhtaW4sIG1heCwgdG9rLCBvcHRpb25zKSB7XG4gIGxldCByYW5nZXMgPSBzcGxpdFRvUmFuZ2VzKG1pbiwgbWF4KTtcbiAgbGV0IHRva2VucyA9IFtdO1xuICBsZXQgc3RhcnQgPSBtaW47XG4gIGxldCBwcmV2O1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IG1heCA9IHJhbmdlc1tpXTtcbiAgICBsZXQgb2JqID0gcmFuZ2VUb1BhdHRlcm4oU3RyaW5nKHN0YXJ0KSwgU3RyaW5nKG1heCksIG9wdGlvbnMpO1xuICAgIGxldCB6ZXJvcyA9ICcnO1xuXG4gICAgaWYgKCF0b2suaXNQYWRkZWQgJiYgcHJldiAmJiBwcmV2LnBhdHRlcm4gPT09IG9iai5wYXR0ZXJuKSB7XG4gICAgICBpZiAocHJldi5jb3VudC5sZW5ndGggPiAxKSB7XG4gICAgICAgIHByZXYuY291bnQucG9wKCk7XG4gICAgICB9XG5cbiAgICAgIHByZXYuY291bnQucHVzaChvYmouY291bnRbMF0pO1xuICAgICAgcHJldi5zdHJpbmcgPSBwcmV2LnBhdHRlcm4gKyB0b1F1YW50aWZpZXIocHJldi5jb3VudCk7XG4gICAgICBzdGFydCA9IG1heCArIDE7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAodG9rLmlzUGFkZGVkKSB7XG4gICAgICB6ZXJvcyA9IHBhZFplcm9zKG1heCwgdG9rLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICBvYmouc3RyaW5nID0gemVyb3MgKyBvYmoucGF0dGVybiArIHRvUXVhbnRpZmllcihvYmouY291bnQpO1xuICAgIHRva2Vucy5wdXNoKG9iaik7XG4gICAgc3RhcnQgPSBtYXggKyAxO1xuICAgIHByZXYgPSBvYmo7XG4gIH1cblxuICByZXR1cm4gdG9rZW5zO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXJQYXR0ZXJucyhhcnIsIGNvbXBhcmlzb24sIHByZWZpeCwgaW50ZXJzZWN0aW9uLCBvcHRpb25zKSB7XG4gIGxldCByZXN1bHQgPSBbXTtcblxuICBmb3IgKGxldCBlbGUgb2YgYXJyKSB7XG4gICAgbGV0IHsgc3RyaW5nIH0gPSBlbGU7XG5cbiAgICAvLyBvbmx5IHB1c2ggaWYgX2JvdGhfIGFyZSBuZWdhdGl2ZS4uLlxuICAgIGlmICghaW50ZXJzZWN0aW9uICYmICFjb250YWlucyhjb21wYXJpc29uLCAnc3RyaW5nJywgc3RyaW5nKSkge1xuICAgICAgcmVzdWx0LnB1c2gocHJlZml4ICsgc3RyaW5nKTtcbiAgICB9XG5cbiAgICAvLyBvciBfYm90aF8gYXJlIHBvc2l0aXZlXG4gICAgaWYgKGludGVyc2VjdGlvbiAmJiBjb250YWlucyhjb21wYXJpc29uLCAnc3RyaW5nJywgc3RyaW5nKSkge1xuICAgICAgcmVzdWx0LnB1c2gocHJlZml4ICsgc3RyaW5nKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBaaXAgc3RyaW5nc1xuICovXG5cbmZ1bmN0aW9uIHppcChhLCBiKSB7XG4gIGxldCBhcnIgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSBhcnIucHVzaChbYVtpXSwgYltpXV0pO1xuICByZXR1cm4gYXJyO1xufVxuXG5mdW5jdGlvbiBjb21wYXJlKGEsIGIpIHtcbiAgcmV0dXJuIGEgPiBiID8gMSA6IGIgPiBhID8gLTEgOiAwO1xufVxuXG5mdW5jdGlvbiBjb250YWlucyhhcnIsIGtleSwgdmFsKSB7XG4gIHJldHVybiBhcnIuc29tZShlbGUgPT4gZWxlW2tleV0gPT09IHZhbCk7XG59XG5cbmZ1bmN0aW9uIGNvdW50TmluZXMobWluLCBsZW4pIHtcbiAgcmV0dXJuIE51bWJlcihTdHJpbmcobWluKS5zbGljZSgwLCAtbGVuKSArICc5Jy5yZXBlYXQobGVuKSk7XG59XG5cbmZ1bmN0aW9uIGNvdW50WmVyb3MoaW50ZWdlciwgemVyb3MpIHtcbiAgcmV0dXJuIGludGVnZXIgLSAoaW50ZWdlciAlIE1hdGgucG93KDEwLCB6ZXJvcykpO1xufVxuXG5mdW5jdGlvbiB0b1F1YW50aWZpZXIoZGlnaXRzKSB7XG4gIGxldCBbc3RhcnQgPSAwLCBzdG9wID0gJyddID0gZGlnaXRzO1xuICBpZiAoc3RvcCB8fCBzdGFydCA+IDEpIHtcbiAgICByZXR1cm4gYHske3N0YXJ0ICsgKHN0b3AgPyAnLCcgKyBzdG9wIDogJycpfX1gO1xuICB9XG4gIHJldHVybiAnJztcbn1cblxuZnVuY3Rpb24gdG9DaGFyYWN0ZXJDbGFzcyhhLCBiLCBvcHRpb25zKSB7XG4gIHJldHVybiBgWyR7YX0keyhiIC0gYSA9PT0gMSkgPyAnJyA6ICctJ30ke2J9XWA7XG59XG5cbmZ1bmN0aW9uIGhhc1BhZGRpbmcoc3RyKSB7XG4gIHJldHVybiAvXi0/KDArKVxcZC8udGVzdChzdHIpO1xufVxuXG5mdW5jdGlvbiBwYWRaZXJvcyh2YWx1ZSwgdG9rLCBvcHRpb25zKSB7XG4gIGlmICghdG9rLmlzUGFkZGVkKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgbGV0IGRpZmYgPSBNYXRoLmFicyh0b2subWF4TGVuIC0gU3RyaW5nKHZhbHVlKS5sZW5ndGgpO1xuICBsZXQgcmVsYXggPSBvcHRpb25zLnJlbGF4WmVyb3MgIT09IGZhbHNlO1xuXG4gIHN3aXRjaCAoZGlmZikge1xuICAgIGNhc2UgMDpcbiAgICAgIHJldHVybiAnJztcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gcmVsYXggPyAnMD8nIDogJzAnO1xuICAgIGNhc2UgMjpcbiAgICAgIHJldHVybiByZWxheCA/ICcwezAsMn0nIDogJzAwJztcbiAgICBkZWZhdWx0OiB7XG4gICAgICByZXR1cm4gcmVsYXggPyBgMHswLCR7ZGlmZn19YCA6IGAweyR7ZGlmZn19YDtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDYWNoZVxuICovXG5cbnRvUmVnZXhSYW5nZS5jYWNoZSA9IHt9O1xudG9SZWdleFJhbmdlLmNsZWFyQ2FjaGUgPSAoKSA9PiAodG9SZWdleFJhbmdlLmNhY2hlID0ge30pO1xuXG4vKipcbiAqIEV4cG9zZSBgdG9SZWdleFJhbmdlYFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gdG9SZWdleFJhbmdlO1xuIiwiLyohXG4gKiBmaWxsLXJhbmdlIDxodHRwczovL2dpdGh1Yi5jb20vam9uc2NobGlua2VydC9maWxsLXJhbmdlPlxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNC1wcmVzZW50LCBKb24gU2NobGlua2VydC5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmNvbnN0IHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5jb25zdCB0b1JlZ2V4UmFuZ2UgPSByZXF1aXJlKCd0by1yZWdleC1yYW5nZScpO1xuXG5jb25zdCBpc09iamVjdCA9IHZhbCA9PiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkodmFsKTtcblxuY29uc3QgdHJhbnNmb3JtID0gdG9OdW1iZXIgPT4ge1xuICByZXR1cm4gdmFsdWUgPT4gdG9OdW1iZXIgPT09IHRydWUgPyBOdW1iZXIodmFsdWUpIDogU3RyaW5nKHZhbHVlKTtcbn07XG5cbmNvbnN0IGlzVmFsaWRWYWx1ZSA9IHZhbHVlID0+IHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgfHwgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUgIT09ICcnKTtcbn07XG5cbmNvbnN0IGlzTnVtYmVyID0gbnVtID0+IE51bWJlci5pc0ludGVnZXIoK251bSk7XG5cbmNvbnN0IHplcm9zID0gaW5wdXQgPT4ge1xuICBsZXQgdmFsdWUgPSBgJHtpbnB1dH1gO1xuICBsZXQgaW5kZXggPSAtMTtcbiAgaWYgKHZhbHVlWzBdID09PSAnLScpIHZhbHVlID0gdmFsdWUuc2xpY2UoMSk7XG4gIGlmICh2YWx1ZSA9PT0gJzAnKSByZXR1cm4gZmFsc2U7XG4gIHdoaWxlICh2YWx1ZVsrK2luZGV4XSA9PT0gJzAnKTtcbiAgcmV0dXJuIGluZGV4ID4gMDtcbn07XG5cbmNvbnN0IHN0cmluZ2lmeSA9IChzdGFydCwgZW5kLCBvcHRpb25zKSA9PiB7XG4gIGlmICh0eXBlb2Ygc3RhcnQgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBlbmQgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIG9wdGlvbnMuc3RyaW5naWZ5ID09PSB0cnVlO1xufTtcblxuY29uc3QgcGFkID0gKGlucHV0LCBtYXhMZW5ndGgsIHRvTnVtYmVyKSA9PiB7XG4gIGlmIChtYXhMZW5ndGggPiAwKSB7XG4gICAgbGV0IGRhc2ggPSBpbnB1dFswXSA9PT0gJy0nID8gJy0nIDogJyc7XG4gICAgaWYgKGRhc2gpIGlucHV0ID0gaW5wdXQuc2xpY2UoMSk7XG4gICAgaW5wdXQgPSAoZGFzaCArIGlucHV0LnBhZFN0YXJ0KGRhc2ggPyBtYXhMZW5ndGggLSAxIDogbWF4TGVuZ3RoLCAnMCcpKTtcbiAgfVxuICBpZiAodG9OdW1iZXIgPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuIFN0cmluZyhpbnB1dCk7XG4gIH1cbiAgcmV0dXJuIGlucHV0O1xufTtcblxuY29uc3QgdG9NYXhMZW4gPSAoaW5wdXQsIG1heExlbmd0aCkgPT4ge1xuICBsZXQgbmVnYXRpdmUgPSBpbnB1dFswXSA9PT0gJy0nID8gJy0nIDogJyc7XG4gIGlmIChuZWdhdGl2ZSkge1xuICAgIGlucHV0ID0gaW5wdXQuc2xpY2UoMSk7XG4gICAgbWF4TGVuZ3RoLS07XG4gIH1cbiAgd2hpbGUgKGlucHV0Lmxlbmd0aCA8IG1heExlbmd0aCkgaW5wdXQgPSAnMCcgKyBpbnB1dDtcbiAgcmV0dXJuIG5lZ2F0aXZlID8gKCctJyArIGlucHV0KSA6IGlucHV0O1xufTtcblxuY29uc3QgdG9TZXF1ZW5jZSA9IChwYXJ0cywgb3B0aW9ucykgPT4ge1xuICBwYXJ0cy5uZWdhdGl2ZXMuc29ydCgoYSwgYikgPT4gYSA8IGIgPyAtMSA6IGEgPiBiID8gMSA6IDApO1xuICBwYXJ0cy5wb3NpdGl2ZXMuc29ydCgoYSwgYikgPT4gYSA8IGIgPyAtMSA6IGEgPiBiID8gMSA6IDApO1xuXG4gIGxldCBwcmVmaXggPSBvcHRpb25zLmNhcHR1cmUgPyAnJyA6ICc/Oic7XG4gIGxldCBwb3NpdGl2ZXMgPSAnJztcbiAgbGV0IG5lZ2F0aXZlcyA9ICcnO1xuICBsZXQgcmVzdWx0O1xuXG4gIGlmIChwYXJ0cy5wb3NpdGl2ZXMubGVuZ3RoKSB7XG4gICAgcG9zaXRpdmVzID0gcGFydHMucG9zaXRpdmVzLmpvaW4oJ3wnKTtcbiAgfVxuXG4gIGlmIChwYXJ0cy5uZWdhdGl2ZXMubGVuZ3RoKSB7XG4gICAgbmVnYXRpdmVzID0gYC0oJHtwcmVmaXh9JHtwYXJ0cy5uZWdhdGl2ZXMuam9pbignfCcpfSlgO1xuICB9XG5cbiAgaWYgKHBvc2l0aXZlcyAmJiBuZWdhdGl2ZXMpIHtcbiAgICByZXN1bHQgPSBgJHtwb3NpdGl2ZXN9fCR7bmVnYXRpdmVzfWA7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gcG9zaXRpdmVzIHx8IG5lZ2F0aXZlcztcbiAgfVxuXG4gIGlmIChvcHRpb25zLndyYXApIHtcbiAgICByZXR1cm4gYCgke3ByZWZpeH0ke3Jlc3VsdH0pYDtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5jb25zdCB0b1JhbmdlID0gKGEsIGIsIGlzTnVtYmVycywgb3B0aW9ucykgPT4ge1xuICBpZiAoaXNOdW1iZXJzKSB7XG4gICAgcmV0dXJuIHRvUmVnZXhSYW5nZShhLCBiLCB7IHdyYXA6IGZhbHNlLCAuLi5vcHRpb25zIH0pO1xuICB9XG5cbiAgbGV0IHN0YXJ0ID0gU3RyaW5nLmZyb21DaGFyQ29kZShhKTtcbiAgaWYgKGEgPT09IGIpIHJldHVybiBzdGFydDtcblxuICBsZXQgc3RvcCA9IFN0cmluZy5mcm9tQ2hhckNvZGUoYik7XG4gIHJldHVybiBgWyR7c3RhcnR9LSR7c3RvcH1dYDtcbn07XG5cbmNvbnN0IHRvUmVnZXggPSAoc3RhcnQsIGVuZCwgb3B0aW9ucykgPT4ge1xuICBpZiAoQXJyYXkuaXNBcnJheShzdGFydCkpIHtcbiAgICBsZXQgd3JhcCA9IG9wdGlvbnMud3JhcCA9PT0gdHJ1ZTtcbiAgICBsZXQgcHJlZml4ID0gb3B0aW9ucy5jYXB0dXJlID8gJycgOiAnPzonO1xuICAgIHJldHVybiB3cmFwID8gYCgke3ByZWZpeH0ke3N0YXJ0LmpvaW4oJ3wnKX0pYCA6IHN0YXJ0LmpvaW4oJ3wnKTtcbiAgfVxuICByZXR1cm4gdG9SZWdleFJhbmdlKHN0YXJ0LCBlbmQsIG9wdGlvbnMpO1xufTtcblxuY29uc3QgcmFuZ2VFcnJvciA9ICguLi5hcmdzKSA9PiB7XG4gIHJldHVybiBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCByYW5nZSBhcmd1bWVudHM6ICcgKyB1dGlsLmluc3BlY3QoLi4uYXJncykpO1xufTtcblxuY29uc3QgaW52YWxpZFJhbmdlID0gKHN0YXJ0LCBlbmQsIG9wdGlvbnMpID0+IHtcbiAgaWYgKG9wdGlvbnMuc3RyaWN0UmFuZ2VzID09PSB0cnVlKSB0aHJvdyByYW5nZUVycm9yKFtzdGFydCwgZW5kXSk7XG4gIHJldHVybiBbXTtcbn07XG5cbmNvbnN0IGludmFsaWRTdGVwID0gKHN0ZXAsIG9wdGlvbnMpID0+IHtcbiAgaWYgKG9wdGlvbnMuc3RyaWN0UmFuZ2VzID09PSB0cnVlKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgc3RlcCBcIiR7c3RlcH1cIiB0byBiZSBhIG51bWJlcmApO1xuICB9XG4gIHJldHVybiBbXTtcbn07XG5cbmNvbnN0IGZpbGxOdW1iZXJzID0gKHN0YXJ0LCBlbmQsIHN0ZXAgPSAxLCBvcHRpb25zID0ge30pID0+IHtcbiAgbGV0IGEgPSBOdW1iZXIoc3RhcnQpO1xuICBsZXQgYiA9IE51bWJlcihlbmQpO1xuXG4gIGlmICghTnVtYmVyLmlzSW50ZWdlcihhKSB8fCAhTnVtYmVyLmlzSW50ZWdlcihiKSkge1xuICAgIGlmIChvcHRpb25zLnN0cmljdFJhbmdlcyA9PT0gdHJ1ZSkgdGhyb3cgcmFuZ2VFcnJvcihbc3RhcnQsIGVuZF0pO1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8vIGZpeCBuZWdhdGl2ZSB6ZXJvXG4gIGlmIChhID09PSAwKSBhID0gMDtcbiAgaWYgKGIgPT09IDApIGIgPSAwO1xuXG4gIGxldCBkZXNjZW5kaW5nID0gYSA+IGI7XG4gIGxldCBzdGFydFN0cmluZyA9IFN0cmluZyhzdGFydCk7XG4gIGxldCBlbmRTdHJpbmcgPSBTdHJpbmcoZW5kKTtcbiAgbGV0IHN0ZXBTdHJpbmcgPSBTdHJpbmcoc3RlcCk7XG4gIHN0ZXAgPSBNYXRoLm1heChNYXRoLmFicyhzdGVwKSwgMSk7XG5cbiAgbGV0IHBhZGRlZCA9IHplcm9zKHN0YXJ0U3RyaW5nKSB8fCB6ZXJvcyhlbmRTdHJpbmcpIHx8IHplcm9zKHN0ZXBTdHJpbmcpO1xuICBsZXQgbWF4TGVuID0gcGFkZGVkID8gTWF0aC5tYXgoc3RhcnRTdHJpbmcubGVuZ3RoLCBlbmRTdHJpbmcubGVuZ3RoLCBzdGVwU3RyaW5nLmxlbmd0aCkgOiAwO1xuICBsZXQgdG9OdW1iZXIgPSBwYWRkZWQgPT09IGZhbHNlICYmIHN0cmluZ2lmeShzdGFydCwgZW5kLCBvcHRpb25zKSA9PT0gZmFsc2U7XG4gIGxldCBmb3JtYXQgPSBvcHRpb25zLnRyYW5zZm9ybSB8fCB0cmFuc2Zvcm0odG9OdW1iZXIpO1xuXG4gIGlmIChvcHRpb25zLnRvUmVnZXggJiYgc3RlcCA9PT0gMSkge1xuICAgIHJldHVybiB0b1JhbmdlKHRvTWF4TGVuKHN0YXJ0LCBtYXhMZW4pLCB0b01heExlbihlbmQsIG1heExlbiksIHRydWUsIG9wdGlvbnMpO1xuICB9XG5cbiAgbGV0IHBhcnRzID0geyBuZWdhdGl2ZXM6IFtdLCBwb3NpdGl2ZXM6IFtdIH07XG4gIGxldCBwdXNoID0gbnVtID0+IHBhcnRzW251bSA8IDAgPyAnbmVnYXRpdmVzJyA6ICdwb3NpdGl2ZXMnXS5wdXNoKE1hdGguYWJzKG51bSkpO1xuICBsZXQgcmFuZ2UgPSBbXTtcbiAgbGV0IGluZGV4ID0gMDtcblxuICB3aGlsZSAoZGVzY2VuZGluZyA/IGEgPj0gYiA6IGEgPD0gYikge1xuICAgIGlmIChvcHRpb25zLnRvUmVnZXggPT09IHRydWUgJiYgc3RlcCA+IDEpIHtcbiAgICAgIHB1c2goYSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJhbmdlLnB1c2gocGFkKGZvcm1hdChhLCBpbmRleCksIG1heExlbiwgdG9OdW1iZXIpKTtcbiAgICB9XG4gICAgYSA9IGRlc2NlbmRpbmcgPyBhIC0gc3RlcCA6IGEgKyBzdGVwO1xuICAgIGluZGV4Kys7XG4gIH1cblxuICBpZiAob3B0aW9ucy50b1JlZ2V4ID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIHN0ZXAgPiAxXG4gICAgICA/IHRvU2VxdWVuY2UocGFydHMsIG9wdGlvbnMpXG4gICAgICA6IHRvUmVnZXgocmFuZ2UsIG51bGwsIHsgd3JhcDogZmFsc2UsIC4uLm9wdGlvbnMgfSk7XG4gIH1cblxuICByZXR1cm4gcmFuZ2U7XG59O1xuXG5jb25zdCBmaWxsTGV0dGVycyA9IChzdGFydCwgZW5kLCBzdGVwID0gMSwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGlmICgoIWlzTnVtYmVyKHN0YXJ0KSAmJiBzdGFydC5sZW5ndGggPiAxKSB8fCAoIWlzTnVtYmVyKGVuZCkgJiYgZW5kLmxlbmd0aCA+IDEpKSB7XG4gICAgcmV0dXJuIGludmFsaWRSYW5nZShzdGFydCwgZW5kLCBvcHRpb25zKTtcbiAgfVxuXG5cbiAgbGV0IGZvcm1hdCA9IG9wdGlvbnMudHJhbnNmb3JtIHx8ICh2YWwgPT4gU3RyaW5nLmZyb21DaGFyQ29kZSh2YWwpKTtcbiAgbGV0IGEgPSBgJHtzdGFydH1gLmNoYXJDb2RlQXQoMCk7XG4gIGxldCBiID0gYCR7ZW5kfWAuY2hhckNvZGVBdCgwKTtcblxuICBsZXQgZGVzY2VuZGluZyA9IGEgPiBiO1xuICBsZXQgbWluID0gTWF0aC5taW4oYSwgYik7XG4gIGxldCBtYXggPSBNYXRoLm1heChhLCBiKTtcblxuICBpZiAob3B0aW9ucy50b1JlZ2V4ICYmIHN0ZXAgPT09IDEpIHtcbiAgICByZXR1cm4gdG9SYW5nZShtaW4sIG1heCwgZmFsc2UsIG9wdGlvbnMpO1xuICB9XG5cbiAgbGV0IHJhbmdlID0gW107XG4gIGxldCBpbmRleCA9IDA7XG5cbiAgd2hpbGUgKGRlc2NlbmRpbmcgPyBhID49IGIgOiBhIDw9IGIpIHtcbiAgICByYW5nZS5wdXNoKGZvcm1hdChhLCBpbmRleCkpO1xuICAgIGEgPSBkZXNjZW5kaW5nID8gYSAtIHN0ZXAgOiBhICsgc3RlcDtcbiAgICBpbmRleCsrO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMudG9SZWdleCA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiB0b1JlZ2V4KHJhbmdlLCBudWxsLCB7IHdyYXA6IGZhbHNlLCBvcHRpb25zIH0pO1xuICB9XG5cbiAgcmV0dXJuIHJhbmdlO1xufTtcblxuY29uc3QgZmlsbCA9IChzdGFydCwgZW5kLCBzdGVwLCBvcHRpb25zID0ge30pID0+IHtcbiAgaWYgKGVuZCA9PSBudWxsICYmIGlzVmFsaWRWYWx1ZShzdGFydCkpIHtcbiAgICByZXR1cm4gW3N0YXJ0XTtcbiAgfVxuXG4gIGlmICghaXNWYWxpZFZhbHVlKHN0YXJ0KSB8fCAhaXNWYWxpZFZhbHVlKGVuZCkpIHtcbiAgICByZXR1cm4gaW52YWxpZFJhbmdlKHN0YXJ0LCBlbmQsIG9wdGlvbnMpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBzdGVwID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGZpbGwoc3RhcnQsIGVuZCwgMSwgeyB0cmFuc2Zvcm06IHN0ZXAgfSk7XG4gIH1cblxuICBpZiAoaXNPYmplY3Qoc3RlcCkpIHtcbiAgICByZXR1cm4gZmlsbChzdGFydCwgZW5kLCAwLCBzdGVwKTtcbiAgfVxuXG4gIGxldCBvcHRzID0geyAuLi5vcHRpb25zIH07XG4gIGlmIChvcHRzLmNhcHR1cmUgPT09IHRydWUpIG9wdHMud3JhcCA9IHRydWU7XG4gIHN0ZXAgPSBzdGVwIHx8IG9wdHMuc3RlcCB8fCAxO1xuXG4gIGlmICghaXNOdW1iZXIoc3RlcCkpIHtcbiAgICBpZiAoc3RlcCAhPSBudWxsICYmICFpc09iamVjdChzdGVwKSkgcmV0dXJuIGludmFsaWRTdGVwKHN0ZXAsIG9wdHMpO1xuICAgIHJldHVybiBmaWxsKHN0YXJ0LCBlbmQsIDEsIHN0ZXApO1xuICB9XG5cbiAgaWYgKGlzTnVtYmVyKHN0YXJ0KSAmJiBpc051bWJlcihlbmQpKSB7XG4gICAgcmV0dXJuIGZpbGxOdW1iZXJzKHN0YXJ0LCBlbmQsIHN0ZXAsIG9wdHMpO1xuICB9XG5cbiAgcmV0dXJuIGZpbGxMZXR0ZXJzKHN0YXJ0LCBlbmQsIE1hdGgubWF4KE1hdGguYWJzKHN0ZXApLCAxKSwgb3B0cyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZpbGw7XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGZpbGwgPSByZXF1aXJlKCdmaWxsLXJhbmdlJyk7XG5jb25zdCB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxuY29uc3QgY29tcGlsZSA9IChhc3QsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBsZXQgd2FsayA9IChub2RlLCBwYXJlbnQgPSB7fSkgPT4ge1xuICAgIGxldCBpbnZhbGlkQmxvY2sgPSB1dGlscy5pc0ludmFsaWRCcmFjZShwYXJlbnQpO1xuICAgIGxldCBpbnZhbGlkTm9kZSA9IG5vZGUuaW52YWxpZCA9PT0gdHJ1ZSAmJiBvcHRpb25zLmVzY2FwZUludmFsaWQgPT09IHRydWU7XG4gICAgbGV0IGludmFsaWQgPSBpbnZhbGlkQmxvY2sgPT09IHRydWUgfHwgaW52YWxpZE5vZGUgPT09IHRydWU7XG4gICAgbGV0IHByZWZpeCA9IG9wdGlvbnMuZXNjYXBlSW52YWxpZCA9PT0gdHJ1ZSA/ICdcXFxcJyA6ICcnO1xuICAgIGxldCBvdXRwdXQgPSAnJztcblxuICAgIGlmIChub2RlLmlzT3BlbiA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIHByZWZpeCArIG5vZGUudmFsdWU7XG4gICAgfVxuICAgIGlmIChub2RlLmlzQ2xvc2UgPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBwcmVmaXggKyBub2RlLnZhbHVlO1xuICAgIH1cblxuICAgIGlmIChub2RlLnR5cGUgPT09ICdvcGVuJykge1xuICAgICAgcmV0dXJuIGludmFsaWQgPyAocHJlZml4ICsgbm9kZS52YWx1ZSkgOiAnKCc7XG4gICAgfVxuXG4gICAgaWYgKG5vZGUudHlwZSA9PT0gJ2Nsb3NlJykge1xuICAgICAgcmV0dXJuIGludmFsaWQgPyAocHJlZml4ICsgbm9kZS52YWx1ZSkgOiAnKSc7XG4gICAgfVxuXG4gICAgaWYgKG5vZGUudHlwZSA9PT0gJ2NvbW1hJykge1xuICAgICAgcmV0dXJuIG5vZGUucHJldi50eXBlID09PSAnY29tbWEnID8gJycgOiAoaW52YWxpZCA/IG5vZGUudmFsdWUgOiAnfCcpO1xuICAgIH1cblxuICAgIGlmIChub2RlLnZhbHVlKSB7XG4gICAgICByZXR1cm4gbm9kZS52YWx1ZTtcbiAgICB9XG5cbiAgICBpZiAobm9kZS5ub2RlcyAmJiBub2RlLnJhbmdlcyA+IDApIHtcbiAgICAgIGxldCBhcmdzID0gdXRpbHMucmVkdWNlKG5vZGUubm9kZXMpO1xuICAgICAgbGV0IHJhbmdlID0gZmlsbCguLi5hcmdzLCB7IC4uLm9wdGlvbnMsIHdyYXA6IGZhbHNlLCB0b1JlZ2V4OiB0cnVlIH0pO1xuXG4gICAgICBpZiAocmFuZ2UubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIHJldHVybiBhcmdzLmxlbmd0aCA+IDEgJiYgcmFuZ2UubGVuZ3RoID4gMSA/IGAoJHtyYW5nZX0pYCA6IHJhbmdlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChub2RlLm5vZGVzKSB7XG4gICAgICBmb3IgKGxldCBjaGlsZCBvZiBub2RlLm5vZGVzKSB7XG4gICAgICAgIG91dHB1dCArPSB3YWxrKGNoaWxkLCBub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfTtcblxuICByZXR1cm4gd2Fsayhhc3QpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb21waWxlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBmaWxsID0gcmVxdWlyZSgnZmlsbC1yYW5nZScpO1xuY29uc3Qgc3RyaW5naWZ5ID0gcmVxdWlyZSgnLi9zdHJpbmdpZnknKTtcbmNvbnN0IHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG5jb25zdCBhcHBlbmQgPSAocXVldWUgPSAnJywgc3Rhc2ggPSAnJywgZW5jbG9zZSA9IGZhbHNlKSA9PiB7XG4gIGxldCByZXN1bHQgPSBbXTtcblxuICBxdWV1ZSA9IFtdLmNvbmNhdChxdWV1ZSk7XG4gIHN0YXNoID0gW10uY29uY2F0KHN0YXNoKTtcblxuICBpZiAoIXN0YXNoLmxlbmd0aCkgcmV0dXJuIHF1ZXVlO1xuICBpZiAoIXF1ZXVlLmxlbmd0aCkge1xuICAgIHJldHVybiBlbmNsb3NlID8gdXRpbHMuZmxhdHRlbihzdGFzaCkubWFwKGVsZSA9PiBgeyR7ZWxlfX1gKSA6IHN0YXNoO1xuICB9XG5cbiAgZm9yIChsZXQgaXRlbSBvZiBxdWV1ZSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGl0ZW0pKSB7XG4gICAgICBmb3IgKGxldCB2YWx1ZSBvZiBpdGVtKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKGFwcGVuZCh2YWx1ZSwgc3Rhc2gsIGVuY2xvc2UpKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgZWxlIG9mIHN0YXNoKSB7XG4gICAgICAgIGlmIChlbmNsb3NlID09PSB0cnVlICYmIHR5cGVvZiBlbGUgPT09ICdzdHJpbmcnKSBlbGUgPSBgeyR7ZWxlfX1gO1xuICAgICAgICByZXN1bHQucHVzaChBcnJheS5pc0FycmF5KGVsZSkgPyBhcHBlbmQoaXRlbSwgZWxlLCBlbmNsb3NlKSA6IChpdGVtICsgZWxlKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB1dGlscy5mbGF0dGVuKHJlc3VsdCk7XG59O1xuXG5jb25zdCBleHBhbmQgPSAoYXN0LCBvcHRpb25zID0ge30pID0+IHtcbiAgbGV0IHJhbmdlTGltaXQgPSBvcHRpb25zLnJhbmdlTGltaXQgPT09IHZvaWQgMCA/IDEwMDAgOiBvcHRpb25zLnJhbmdlTGltaXQ7XG5cbiAgbGV0IHdhbGsgPSAobm9kZSwgcGFyZW50ID0ge30pID0+IHtcbiAgICBub2RlLnF1ZXVlID0gW107XG5cbiAgICBsZXQgcCA9IHBhcmVudDtcbiAgICBsZXQgcSA9IHBhcmVudC5xdWV1ZTtcblxuICAgIHdoaWxlIChwLnR5cGUgIT09ICdicmFjZScgJiYgcC50eXBlICE9PSAncm9vdCcgJiYgcC5wYXJlbnQpIHtcbiAgICAgIHAgPSBwLnBhcmVudDtcbiAgICAgIHEgPSBwLnF1ZXVlO1xuICAgIH1cblxuICAgIGlmIChub2RlLmludmFsaWQgfHwgbm9kZS5kb2xsYXIpIHtcbiAgICAgIHEucHVzaChhcHBlbmQocS5wb3AoKSwgc3RyaW5naWZ5KG5vZGUsIG9wdGlvbnMpKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG5vZGUudHlwZSA9PT0gJ2JyYWNlJyAmJiBub2RlLmludmFsaWQgIT09IHRydWUgJiYgbm9kZS5ub2Rlcy5sZW5ndGggPT09IDIpIHtcbiAgICAgIHEucHVzaChhcHBlbmQocS5wb3AoKSwgWyd7fSddKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG5vZGUubm9kZXMgJiYgbm9kZS5yYW5nZXMgPiAwKSB7XG4gICAgICBsZXQgYXJncyA9IHV0aWxzLnJlZHVjZShub2RlLm5vZGVzKTtcblxuICAgICAgaWYgKHV0aWxzLmV4Y2VlZHNMaW1pdCguLi5hcmdzLCBvcHRpb25zLnN0ZXAsIHJhbmdlTGltaXQpKSB7XG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdleHBhbmRlZCBhcnJheSBsZW5ndGggZXhjZWVkcyByYW5nZSBsaW1pdC4gVXNlIG9wdGlvbnMucmFuZ2VMaW1pdCB0byBpbmNyZWFzZSBvciBkaXNhYmxlIHRoZSBsaW1pdC4nKTtcbiAgICAgIH1cblxuICAgICAgbGV0IHJhbmdlID0gZmlsbCguLi5hcmdzLCBvcHRpb25zKTtcbiAgICAgIGlmIChyYW5nZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmFuZ2UgPSBzdHJpbmdpZnkobm9kZSwgb3B0aW9ucyk7XG4gICAgICB9XG5cbiAgICAgIHEucHVzaChhcHBlbmQocS5wb3AoKSwgcmFuZ2UpKTtcbiAgICAgIG5vZGUubm9kZXMgPSBbXTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgZW5jbG9zZSA9IHV0aWxzLmVuY2xvc2VCcmFjZShub2RlKTtcbiAgICBsZXQgcXVldWUgPSBub2RlLnF1ZXVlO1xuICAgIGxldCBibG9jayA9IG5vZGU7XG5cbiAgICB3aGlsZSAoYmxvY2sudHlwZSAhPT0gJ2JyYWNlJyAmJiBibG9jay50eXBlICE9PSAncm9vdCcgJiYgYmxvY2sucGFyZW50KSB7XG4gICAgICBibG9jayA9IGJsb2NrLnBhcmVudDtcbiAgICAgIHF1ZXVlID0gYmxvY2sucXVldWU7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLm5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgY2hpbGQgPSBub2RlLm5vZGVzW2ldO1xuXG4gICAgICBpZiAoY2hpbGQudHlwZSA9PT0gJ2NvbW1hJyAmJiBub2RlLnR5cGUgPT09ICdicmFjZScpIHtcbiAgICAgICAgaWYgKGkgPT09IDEpIHF1ZXVlLnB1c2goJycpO1xuICAgICAgICBxdWV1ZS5wdXNoKCcnKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChjaGlsZC50eXBlID09PSAnY2xvc2UnKSB7XG4gICAgICAgIHEucHVzaChhcHBlbmQocS5wb3AoKSwgcXVldWUsIGVuY2xvc2UpKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChjaGlsZC52YWx1ZSAmJiBjaGlsZC50eXBlICE9PSAnb3BlbicpIHtcbiAgICAgICAgcXVldWUucHVzaChhcHBlbmQocXVldWUucG9wKCksIGNoaWxkLnZhbHVlKSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoY2hpbGQubm9kZXMpIHtcbiAgICAgICAgd2FsayhjaGlsZCwgbm9kZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHF1ZXVlO1xuICB9O1xuXG4gIHJldHVybiB1dGlscy5mbGF0dGVuKHdhbGsoYXN0KSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cGFuZDtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIE1BWF9MRU5HVEg6IDEwMjQgKiA2NCxcblxuICAvLyBEaWdpdHNcbiAgQ0hBUl8wOiAnMCcsIC8qIDAgKi9cbiAgQ0hBUl85OiAnOScsIC8qIDkgKi9cblxuICAvLyBBbHBoYWJldCBjaGFycy5cbiAgQ0hBUl9VUFBFUkNBU0VfQTogJ0EnLCAvKiBBICovXG4gIENIQVJfTE9XRVJDQVNFX0E6ICdhJywgLyogYSAqL1xuICBDSEFSX1VQUEVSQ0FTRV9aOiAnWicsIC8qIFogKi9cbiAgQ0hBUl9MT1dFUkNBU0VfWjogJ3onLCAvKiB6ICovXG5cbiAgQ0hBUl9MRUZUX1BBUkVOVEhFU0VTOiAnKCcsIC8qICggKi9cbiAgQ0hBUl9SSUdIVF9QQVJFTlRIRVNFUzogJyknLCAvKiApICovXG5cbiAgQ0hBUl9BU1RFUklTSzogJyonLCAvKiAqICovXG5cbiAgLy8gTm9uLWFscGhhYmV0aWMgY2hhcnMuXG4gIENIQVJfQU1QRVJTQU5EOiAnJicsIC8qICYgKi9cbiAgQ0hBUl9BVDogJ0AnLCAvKiBAICovXG4gIENIQVJfQkFDS1NMQVNIOiAnXFxcXCcsIC8qIFxcICovXG4gIENIQVJfQkFDS1RJQ0s6ICdgJywgLyogYCAqL1xuICBDSEFSX0NBUlJJQUdFX1JFVFVSTjogJ1xccicsIC8qIFxcciAqL1xuICBDSEFSX0NJUkNVTUZMRVhfQUNDRU5UOiAnXicsIC8qIF4gKi9cbiAgQ0hBUl9DT0xPTjogJzonLCAvKiA6ICovXG4gIENIQVJfQ09NTUE6ICcsJywgLyogLCAqL1xuICBDSEFSX0RPTExBUjogJyQnLCAvKiAuICovXG4gIENIQVJfRE9UOiAnLicsIC8qIC4gKi9cbiAgQ0hBUl9ET1VCTEVfUVVPVEU6ICdcIicsIC8qIFwiICovXG4gIENIQVJfRVFVQUw6ICc9JywgLyogPSAqL1xuICBDSEFSX0VYQ0xBTUFUSU9OX01BUks6ICchJywgLyogISAqL1xuICBDSEFSX0ZPUk1fRkVFRDogJ1xcZicsIC8qIFxcZiAqL1xuICBDSEFSX0ZPUldBUkRfU0xBU0g6ICcvJywgLyogLyAqL1xuICBDSEFSX0hBU0g6ICcjJywgLyogIyAqL1xuICBDSEFSX0hZUEhFTl9NSU5VUzogJy0nLCAvKiAtICovXG4gIENIQVJfTEVGVF9BTkdMRV9CUkFDS0VUOiAnPCcsIC8qIDwgKi9cbiAgQ0hBUl9MRUZUX0NVUkxZX0JSQUNFOiAneycsIC8qIHsgKi9cbiAgQ0hBUl9MRUZUX1NRVUFSRV9CUkFDS0VUOiAnWycsIC8qIFsgKi9cbiAgQ0hBUl9MSU5FX0ZFRUQ6ICdcXG4nLCAvKiBcXG4gKi9cbiAgQ0hBUl9OT19CUkVBS19TUEFDRTogJ1xcdTAwQTAnLCAvKiBcXHUwMEEwICovXG4gIENIQVJfUEVSQ0VOVDogJyUnLCAvKiAlICovXG4gIENIQVJfUExVUzogJysnLCAvKiArICovXG4gIENIQVJfUVVFU1RJT05fTUFSSzogJz8nLCAvKiA/ICovXG4gIENIQVJfUklHSFRfQU5HTEVfQlJBQ0tFVDogJz4nLCAvKiA+ICovXG4gIENIQVJfUklHSFRfQ1VSTFlfQlJBQ0U6ICd9JywgLyogfSAqL1xuICBDSEFSX1JJR0hUX1NRVUFSRV9CUkFDS0VUOiAnXScsIC8qIF0gKi9cbiAgQ0hBUl9TRU1JQ09MT046ICc7JywgLyogOyAqL1xuICBDSEFSX1NJTkdMRV9RVU9URTogJ1xcJycsIC8qICcgKi9cbiAgQ0hBUl9TUEFDRTogJyAnLCAvKiAgICovXG4gIENIQVJfVEFCOiAnXFx0JywgLyogXFx0ICovXG4gIENIQVJfVU5ERVJTQ09SRTogJ18nLCAvKiBfICovXG4gIENIQVJfVkVSVElDQUxfTElORTogJ3wnLCAvKiB8ICovXG4gIENIQVJfWkVST19XSURUSF9OT0JSRUFLX1NQQUNFOiAnXFx1RkVGRicgLyogXFx1RkVGRiAqL1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3Qgc3RyaW5naWZ5ID0gcmVxdWlyZSgnLi9zdHJpbmdpZnknKTtcblxuLyoqXG4gKiBDb25zdGFudHNcbiAqL1xuXG5jb25zdCB7XG4gIE1BWF9MRU5HVEgsXG4gIENIQVJfQkFDS1NMQVNILCAvKiBcXCAqL1xuICBDSEFSX0JBQ0tUSUNLLCAvKiBgICovXG4gIENIQVJfQ09NTUEsIC8qICwgKi9cbiAgQ0hBUl9ET1QsIC8qIC4gKi9cbiAgQ0hBUl9MRUZUX1BBUkVOVEhFU0VTLCAvKiAoICovXG4gIENIQVJfUklHSFRfUEFSRU5USEVTRVMsIC8qICkgKi9cbiAgQ0hBUl9MRUZUX0NVUkxZX0JSQUNFLCAvKiB7ICovXG4gIENIQVJfUklHSFRfQ1VSTFlfQlJBQ0UsIC8qIH0gKi9cbiAgQ0hBUl9MRUZUX1NRVUFSRV9CUkFDS0VULCAvKiBbICovXG4gIENIQVJfUklHSFRfU1FVQVJFX0JSQUNLRVQsIC8qIF0gKi9cbiAgQ0hBUl9ET1VCTEVfUVVPVEUsIC8qIFwiICovXG4gIENIQVJfU0lOR0xFX1FVT1RFLCAvKiAnICovXG4gIENIQVJfTk9fQlJFQUtfU1BBQ0UsXG4gIENIQVJfWkVST19XSURUSF9OT0JSRUFLX1NQQUNFXG59ID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcblxuLyoqXG4gKiBwYXJzZVxuICovXG5cbmNvbnN0IHBhcnNlID0gKGlucHV0LCBvcHRpb25zID0ge30pID0+IHtcbiAgaWYgKHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhIHN0cmluZycpO1xuICB9XG5cbiAgbGV0IG9wdHMgPSBvcHRpb25zIHx8IHt9O1xuICBsZXQgbWF4ID0gdHlwZW9mIG9wdHMubWF4TGVuZ3RoID09PSAnbnVtYmVyJyA/IE1hdGgubWluKE1BWF9MRU5HVEgsIG9wdHMubWF4TGVuZ3RoKSA6IE1BWF9MRU5HVEg7XG4gIGlmIChpbnB1dC5sZW5ndGggPiBtYXgpIHtcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYElucHV0IGxlbmd0aCAoJHtpbnB1dC5sZW5ndGh9KSwgZXhjZWVkcyBtYXggY2hhcmFjdGVycyAoJHttYXh9KWApO1xuICB9XG5cbiAgbGV0IGFzdCA9IHsgdHlwZTogJ3Jvb3QnLCBpbnB1dCwgbm9kZXM6IFtdIH07XG4gIGxldCBzdGFjayA9IFthc3RdO1xuICBsZXQgYmxvY2sgPSBhc3Q7XG4gIGxldCBwcmV2ID0gYXN0O1xuICBsZXQgYnJhY2tldHMgPSAwO1xuICBsZXQgbGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuICBsZXQgaW5kZXggPSAwO1xuICBsZXQgZGVwdGggPSAwO1xuICBsZXQgdmFsdWU7XG4gIGxldCBtZW1vID0ge307XG5cbiAgLyoqXG4gICAqIEhlbHBlcnNcbiAgICovXG5cbiAgY29uc3QgYWR2YW5jZSA9ICgpID0+IGlucHV0W2luZGV4KytdO1xuICBjb25zdCBwdXNoID0gbm9kZSA9PiB7XG4gICAgaWYgKG5vZGUudHlwZSA9PT0gJ3RleHQnICYmIHByZXYudHlwZSA9PT0gJ2RvdCcpIHtcbiAgICAgIHByZXYudHlwZSA9ICd0ZXh0JztcbiAgICB9XG5cbiAgICBpZiAocHJldiAmJiBwcmV2LnR5cGUgPT09ICd0ZXh0JyAmJiBub2RlLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgcHJldi52YWx1ZSArPSBub2RlLnZhbHVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGJsb2NrLm5vZGVzLnB1c2gobm9kZSk7XG4gICAgbm9kZS5wYXJlbnQgPSBibG9jaztcbiAgICBub2RlLnByZXYgPSBwcmV2O1xuICAgIHByZXYgPSBub2RlO1xuICAgIHJldHVybiBub2RlO1xuICB9O1xuXG4gIHB1c2goeyB0eXBlOiAnYm9zJyB9KTtcblxuICB3aGlsZSAoaW5kZXggPCBsZW5ndGgpIHtcbiAgICBibG9jayA9IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdO1xuICAgIHZhbHVlID0gYWR2YW5jZSgpO1xuXG4gICAgLyoqXG4gICAgICogSW52YWxpZCBjaGFyc1xuICAgICAqL1xuXG4gICAgaWYgKHZhbHVlID09PSBDSEFSX1pFUk9fV0lEVEhfTk9CUkVBS19TUEFDRSB8fCB2YWx1ZSA9PT0gQ0hBUl9OT19CUkVBS19TUEFDRSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXNjYXBlZCBjaGFyc1xuICAgICAqL1xuXG4gICAgaWYgKHZhbHVlID09PSBDSEFSX0JBQ0tTTEFTSCkge1xuICAgICAgcHVzaCh7IHR5cGU6ICd0ZXh0JywgdmFsdWU6IChvcHRpb25zLmtlZXBFc2NhcGluZyA/IHZhbHVlIDogJycpICsgYWR2YW5jZSgpIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmlnaHQgc3F1YXJlIGJyYWNrZXQgKGxpdGVyYWwpOiAnXSdcbiAgICAgKi9cblxuICAgIGlmICh2YWx1ZSA9PT0gQ0hBUl9SSUdIVF9TUVVBUkVfQlJBQ0tFVCkge1xuICAgICAgcHVzaCh7IHR5cGU6ICd0ZXh0JywgdmFsdWU6ICdcXFxcJyArIHZhbHVlIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTGVmdCBzcXVhcmUgYnJhY2tldDogJ1snXG4gICAgICovXG5cbiAgICBpZiAodmFsdWUgPT09IENIQVJfTEVGVF9TUVVBUkVfQlJBQ0tFVCkge1xuICAgICAgYnJhY2tldHMrKztcblxuICAgICAgbGV0IGNsb3NlZCA9IHRydWU7XG4gICAgICBsZXQgbmV4dDtcblxuICAgICAgd2hpbGUgKGluZGV4IDwgbGVuZ3RoICYmIChuZXh0ID0gYWR2YW5jZSgpKSkge1xuICAgICAgICB2YWx1ZSArPSBuZXh0O1xuXG4gICAgICAgIGlmIChuZXh0ID09PSBDSEFSX0xFRlRfU1FVQVJFX0JSQUNLRVQpIHtcbiAgICAgICAgICBicmFja2V0cysrO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5leHQgPT09IENIQVJfQkFDS1NMQVNIKSB7XG4gICAgICAgICAgdmFsdWUgKz0gYWR2YW5jZSgpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5leHQgPT09IENIQVJfUklHSFRfU1FVQVJFX0JSQUNLRVQpIHtcbiAgICAgICAgICBicmFja2V0cy0tO1xuXG4gICAgICAgICAgaWYgKGJyYWNrZXRzID09PSAwKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcHVzaCh7IHR5cGU6ICd0ZXh0JywgdmFsdWUgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQYXJlbnRoZXNlc1xuICAgICAqL1xuXG4gICAgaWYgKHZhbHVlID09PSBDSEFSX0xFRlRfUEFSRU5USEVTRVMpIHtcbiAgICAgIGJsb2NrID0gcHVzaCh7IHR5cGU6ICdwYXJlbicsIG5vZGVzOiBbXSB9KTtcbiAgICAgIHN0YWNrLnB1c2goYmxvY2spO1xuICAgICAgcHVzaCh7IHR5cGU6ICd0ZXh0JywgdmFsdWUgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAodmFsdWUgPT09IENIQVJfUklHSFRfUEFSRU5USEVTRVMpIHtcbiAgICAgIGlmIChibG9jay50eXBlICE9PSAncGFyZW4nKSB7XG4gICAgICAgIHB1c2goeyB0eXBlOiAndGV4dCcsIHZhbHVlIH0pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGJsb2NrID0gc3RhY2sucG9wKCk7XG4gICAgICBwdXNoKHsgdHlwZTogJ3RleHQnLCB2YWx1ZSB9KTtcbiAgICAgIGJsb2NrID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBRdW90ZXM6ICd8XCJ8YFxuICAgICAqL1xuXG4gICAgaWYgKHZhbHVlID09PSBDSEFSX0RPVUJMRV9RVU9URSB8fCB2YWx1ZSA9PT0gQ0hBUl9TSU5HTEVfUVVPVEUgfHwgdmFsdWUgPT09IENIQVJfQkFDS1RJQ0spIHtcbiAgICAgIGxldCBvcGVuID0gdmFsdWU7XG4gICAgICBsZXQgbmV4dDtcblxuICAgICAgaWYgKG9wdGlvbnMua2VlcFF1b3RlcyAhPT0gdHJ1ZSkge1xuICAgICAgICB2YWx1ZSA9ICcnO1xuICAgICAgfVxuXG4gICAgICB3aGlsZSAoaW5kZXggPCBsZW5ndGggJiYgKG5leHQgPSBhZHZhbmNlKCkpKSB7XG4gICAgICAgIGlmIChuZXh0ID09PSBDSEFSX0JBQ0tTTEFTSCkge1xuICAgICAgICAgIHZhbHVlICs9IG5leHQgKyBhZHZhbmNlKCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV4dCA9PT0gb3Blbikge1xuICAgICAgICAgIGlmIChvcHRpb25zLmtlZXBRdW90ZXMgPT09IHRydWUpIHZhbHVlICs9IG5leHQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICB2YWx1ZSArPSBuZXh0O1xuICAgICAgfVxuXG4gICAgICBwdXNoKHsgdHlwZTogJ3RleHQnLCB2YWx1ZSB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExlZnQgY3VybHkgYnJhY2U6ICd7J1xuICAgICAqL1xuXG4gICAgaWYgKHZhbHVlID09PSBDSEFSX0xFRlRfQ1VSTFlfQlJBQ0UpIHtcbiAgICAgIGRlcHRoKys7XG5cbiAgICAgIGxldCBkb2xsYXIgPSBwcmV2LnZhbHVlICYmIHByZXYudmFsdWUuc2xpY2UoLTEpID09PSAnJCcgfHwgYmxvY2suZG9sbGFyID09PSB0cnVlO1xuICAgICAgbGV0IGJyYWNlID0ge1xuICAgICAgICB0eXBlOiAnYnJhY2UnLFxuICAgICAgICBvcGVuOiB0cnVlLFxuICAgICAgICBjbG9zZTogZmFsc2UsXG4gICAgICAgIGRvbGxhcixcbiAgICAgICAgZGVwdGgsXG4gICAgICAgIGNvbW1hczogMCxcbiAgICAgICAgcmFuZ2VzOiAwLFxuICAgICAgICBub2RlczogW11cbiAgICAgIH07XG5cbiAgICAgIGJsb2NrID0gcHVzaChicmFjZSk7XG4gICAgICBzdGFjay5wdXNoKGJsb2NrKTtcbiAgICAgIHB1c2goeyB0eXBlOiAnb3BlbicsIHZhbHVlIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmlnaHQgY3VybHkgYnJhY2U6ICd9J1xuICAgICAqL1xuXG4gICAgaWYgKHZhbHVlID09PSBDSEFSX1JJR0hUX0NVUkxZX0JSQUNFKSB7XG4gICAgICBpZiAoYmxvY2sudHlwZSAhPT0gJ2JyYWNlJykge1xuICAgICAgICBwdXNoKHsgdHlwZTogJ3RleHQnLCB2YWx1ZSB9KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGxldCB0eXBlID0gJ2Nsb3NlJztcbiAgICAgIGJsb2NrID0gc3RhY2sucG9wKCk7XG4gICAgICBibG9jay5jbG9zZSA9IHRydWU7XG5cbiAgICAgIHB1c2goeyB0eXBlLCB2YWx1ZSB9KTtcbiAgICAgIGRlcHRoLS07XG5cbiAgICAgIGJsb2NrID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb21tYTogJywnXG4gICAgICovXG5cbiAgICBpZiAodmFsdWUgPT09IENIQVJfQ09NTUEgJiYgZGVwdGggPiAwKSB7XG4gICAgICBpZiAoYmxvY2sucmFuZ2VzID4gMCkge1xuICAgICAgICBibG9jay5yYW5nZXMgPSAwO1xuICAgICAgICBsZXQgb3BlbiA9IGJsb2NrLm5vZGVzLnNoaWZ0KCk7XG4gICAgICAgIGJsb2NrLm5vZGVzID0gW29wZW4sIHsgdHlwZTogJ3RleHQnLCB2YWx1ZTogc3RyaW5naWZ5KGJsb2NrKSB9XTtcbiAgICAgIH1cblxuICAgICAgcHVzaCh7IHR5cGU6ICdjb21tYScsIHZhbHVlIH0pO1xuICAgICAgYmxvY2suY29tbWFzKys7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEb3Q6ICcuJ1xuICAgICAqL1xuXG4gICAgaWYgKHZhbHVlID09PSBDSEFSX0RPVCAmJiBkZXB0aCA+IDAgJiYgYmxvY2suY29tbWFzID09PSAwKSB7XG4gICAgICBsZXQgc2libGluZ3MgPSBibG9jay5ub2RlcztcblxuICAgICAgaWYgKGRlcHRoID09PSAwIHx8IHNpYmxpbmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBwdXNoKHsgdHlwZTogJ3RleHQnLCB2YWx1ZSB9KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChwcmV2LnR5cGUgPT09ICdkb3QnKSB7XG4gICAgICAgIGJsb2NrLnJhbmdlID0gW107XG4gICAgICAgIHByZXYudmFsdWUgKz0gdmFsdWU7XG4gICAgICAgIHByZXYudHlwZSA9ICdyYW5nZSc7XG5cbiAgICAgICAgaWYgKGJsb2NrLm5vZGVzLmxlbmd0aCAhPT0gMyAmJiBibG9jay5ub2Rlcy5sZW5ndGggIT09IDUpIHtcbiAgICAgICAgICBibG9jay5pbnZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICBibG9jay5yYW5nZXMgPSAwO1xuICAgICAgICAgIHByZXYudHlwZSA9ICd0ZXh0JztcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGJsb2NrLnJhbmdlcysrO1xuICAgICAgICBibG9jay5hcmdzID0gW107XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAocHJldi50eXBlID09PSAncmFuZ2UnKSB7XG4gICAgICAgIHNpYmxpbmdzLnBvcCgpO1xuXG4gICAgICAgIGxldCBiZWZvcmUgPSBzaWJsaW5nc1tzaWJsaW5ncy5sZW5ndGggLSAxXTtcbiAgICAgICAgYmVmb3JlLnZhbHVlICs9IHByZXYudmFsdWUgKyB2YWx1ZTtcbiAgICAgICAgcHJldiA9IGJlZm9yZTtcbiAgICAgICAgYmxvY2sucmFuZ2VzLS07XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBwdXNoKHsgdHlwZTogJ2RvdCcsIHZhbHVlIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGV4dFxuICAgICAqL1xuXG4gICAgcHVzaCh7IHR5cGU6ICd0ZXh0JywgdmFsdWUgfSk7XG4gIH1cblxuICAvLyBNYXJrIGltYmFsYW5jZWQgYnJhY2VzIGFuZCBicmFja2V0cyBhcyBpbnZhbGlkXG4gIGRvIHtcbiAgICBibG9jayA9IHN0YWNrLnBvcCgpO1xuXG4gICAgaWYgKGJsb2NrLnR5cGUgIT09ICdyb290Jykge1xuICAgICAgYmxvY2subm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgaWYgKCFub2RlLm5vZGVzKSB7XG4gICAgICAgICAgaWYgKG5vZGUudHlwZSA9PT0gJ29wZW4nKSBub2RlLmlzT3BlbiA9IHRydWU7XG4gICAgICAgICAgaWYgKG5vZGUudHlwZSA9PT0gJ2Nsb3NlJykgbm9kZS5pc0Nsb3NlID0gdHJ1ZTtcbiAgICAgICAgICBpZiAoIW5vZGUubm9kZXMpIG5vZGUudHlwZSA9ICd0ZXh0JztcbiAgICAgICAgICBub2RlLmludmFsaWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gZ2V0IHRoZSBsb2NhdGlvbiBvZiB0aGUgYmxvY2sgb24gcGFyZW50Lm5vZGVzIChibG9jaydzIHNpYmxpbmdzKVxuICAgICAgbGV0IHBhcmVudCA9IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdO1xuICAgICAgbGV0IGluZGV4ID0gcGFyZW50Lm5vZGVzLmluZGV4T2YoYmxvY2spO1xuICAgICAgLy8gcmVwbGFjZSB0aGUgKGludmFsaWQpIGJsb2NrIHdpdGggaXQncyBub2Rlc1xuICAgICAgcGFyZW50Lm5vZGVzLnNwbGljZShpbmRleCwgMSwgLi4uYmxvY2subm9kZXMpO1xuICAgIH1cbiAgfSB3aGlsZSAoc3RhY2subGVuZ3RoID4gMCk7XG5cbiAgcHVzaCh7IHR5cGU6ICdlb3MnIH0pO1xuICByZXR1cm4gYXN0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3Qgc3RyaW5naWZ5ID0gcmVxdWlyZSgnLi9saWIvc3RyaW5naWZ5Jyk7XG5jb25zdCBjb21waWxlID0gcmVxdWlyZSgnLi9saWIvY29tcGlsZScpO1xuY29uc3QgZXhwYW5kID0gcmVxdWlyZSgnLi9saWIvZXhwYW5kJyk7XG5jb25zdCBwYXJzZSA9IHJlcXVpcmUoJy4vbGliL3BhcnNlJyk7XG5cbi8qKlxuICogRXhwYW5kIHRoZSBnaXZlbiBwYXR0ZXJuIG9yIGNyZWF0ZSBhIHJlZ2V4LWNvbXBhdGlibGUgc3RyaW5nLlxuICpcbiAqIGBgYGpzXG4gKiBjb25zdCBicmFjZXMgPSByZXF1aXJlKCdicmFjZXMnKTtcbiAqIGNvbnNvbGUubG9nKGJyYWNlcygne2EsYixjfScsIHsgY29tcGlsZTogdHJ1ZSB9KSk7IC8vPT4gWycoYXxifGMpJ11cbiAqIGNvbnNvbGUubG9nKGJyYWNlcygne2EsYixjfScpKTsgLy89PiBbJ2EnLCAnYicsICdjJ11cbiAqIGBgYFxuICogQHBhcmFtIHtTdHJpbmd9IGBzdHJgXG4gKiBAcGFyYW0ge09iamVjdH0gYG9wdGlvbnNgXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmNvbnN0IGJyYWNlcyA9IChpbnB1dCwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGxldCBvdXRwdXQgPSBbXTtcblxuICBpZiAoQXJyYXkuaXNBcnJheShpbnB1dCkpIHtcbiAgICBmb3IgKGxldCBwYXR0ZXJuIG9mIGlucHV0KSB7XG4gICAgICBsZXQgcmVzdWx0ID0gYnJhY2VzLmNyZWF0ZShwYXR0ZXJuLCBvcHRpb25zKTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHJlc3VsdCkpIHtcbiAgICAgICAgb3V0cHV0LnB1c2goLi4ucmVzdWx0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG91dHB1dC5wdXNoKHJlc3VsdCk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IFtdLmNvbmNhdChicmFjZXMuY3JlYXRlKGlucHV0LCBvcHRpb25zKSk7XG4gIH1cblxuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmV4cGFuZCA9PT0gdHJ1ZSAmJiBvcHRpb25zLm5vZHVwZXMgPT09IHRydWUpIHtcbiAgICBvdXRwdXQgPSBbLi4ubmV3IFNldChvdXRwdXQpXTtcbiAgfVxuICByZXR1cm4gb3V0cHV0O1xufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYHN0cmAgd2l0aCB0aGUgZ2l2ZW4gYG9wdGlvbnNgLlxuICpcbiAqIGBgYGpzXG4gKiAvLyBicmFjZXMucGFyc2UocGF0dGVybiwgWywgb3B0aW9uc10pO1xuICogY29uc3QgYXN0ID0gYnJhY2VzLnBhcnNlKCdhL3tiLGN9L2QnKTtcbiAqIGNvbnNvbGUubG9nKGFzdCk7XG4gKiBgYGBcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXR0ZXJuIEJyYWNlIHBhdHRlcm4gdG8gcGFyc2VcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtPYmplY3R9IFJldHVybnMgYW4gQVNUXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmJyYWNlcy5wYXJzZSA9IChpbnB1dCwgb3B0aW9ucyA9IHt9KSA9PiBwYXJzZShpbnB1dCwgb3B0aW9ucyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGJyYWNlcyBzdHJpbmcgZnJvbSBhbiBBU1QsIG9yIGFuIEFTVCBub2RlLlxuICpcbiAqIGBgYGpzXG4gKiBjb25zdCBicmFjZXMgPSByZXF1aXJlKCdicmFjZXMnKTtcbiAqIGxldCBhc3QgPSBicmFjZXMucGFyc2UoJ2Zvby97YSxifS9iYXInKTtcbiAqIGNvbnNvbGUubG9nKHN0cmluZ2lmeShhc3Qubm9kZXNbMl0pKTsgLy89PiAne2EsYn0nXG4gKiBgYGBcbiAqIEBwYXJhbSB7U3RyaW5nfSBgaW5wdXRgIEJyYWNlIHBhdHRlcm4gb3IgQVNULlxuICogQHBhcmFtIHtPYmplY3R9IGBvcHRpb25zYFxuICogQHJldHVybiB7QXJyYXl9IFJldHVybnMgYW4gYXJyYXkgb2YgZXhwYW5kZWQgdmFsdWVzLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5icmFjZXMuc3RyaW5naWZ5ID0gKGlucHV0LCBvcHRpb25zID0ge30pID0+IHtcbiAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc3RyaW5naWZ5KGJyYWNlcy5wYXJzZShpbnB1dCwgb3B0aW9ucyksIG9wdGlvbnMpO1xuICB9XG4gIHJldHVybiBzdHJpbmdpZnkoaW5wdXQsIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBDb21waWxlcyBhIGJyYWNlIHBhdHRlcm4gaW50byBhIHJlZ2V4LWNvbXBhdGlibGUsIG9wdGltaXplZCBzdHJpbmcuXG4gKiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgYnkgdGhlIG1haW4gW2JyYWNlc10oI2JyYWNlcykgZnVuY3Rpb24gYnkgZGVmYXVsdC5cbiAqXG4gKiBgYGBqc1xuICogY29uc3QgYnJhY2VzID0gcmVxdWlyZSgnYnJhY2VzJyk7XG4gKiBjb25zb2xlLmxvZyhicmFjZXMuY29tcGlsZSgnYS97YixjfS9kJykpO1xuICogLy89PiBbJ2EvKGJ8YykvZCddXG4gKiBgYGBcbiAqIEBwYXJhbSB7U3RyaW5nfSBgaW5wdXRgIEJyYWNlIHBhdHRlcm4gb3IgQVNULlxuICogQHBhcmFtIHtPYmplY3R9IGBvcHRpb25zYFxuICogQHJldHVybiB7QXJyYXl9IFJldHVybnMgYW4gYXJyYXkgb2YgZXhwYW5kZWQgdmFsdWVzLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5icmFjZXMuY29tcGlsZSA9IChpbnB1dCwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgaW5wdXQgPSBicmFjZXMucGFyc2UoaW5wdXQsIG9wdGlvbnMpO1xuICB9XG4gIHJldHVybiBjb21waWxlKGlucHV0LCBvcHRpb25zKTtcbn07XG5cbi8qKlxuICogRXhwYW5kcyBhIGJyYWNlIHBhdHRlcm4gaW50byBhbiBhcnJheS4gVGhpcyBtZXRob2QgaXMgY2FsbGVkIGJ5IHRoZVxuICogbWFpbiBbYnJhY2VzXSgjYnJhY2VzKSBmdW5jdGlvbiB3aGVuIGBvcHRpb25zLmV4cGFuZGAgaXMgdHJ1ZS4gQmVmb3JlXG4gKiB1c2luZyB0aGlzIG1ldGhvZCBpdCdzIHJlY29tbWVuZGVkIHRoYXQgeW91IHJlYWQgdGhlIFtwZXJmb3JtYW5jZSBub3Rlc10oI3BlcmZvcm1hbmNlKSlcbiAqIGFuZCBhZHZhbnRhZ2VzIG9mIHVzaW5nIFsuY29tcGlsZV0oI2NvbXBpbGUpIGluc3RlYWQuXG4gKlxuICogYGBganNcbiAqIGNvbnN0IGJyYWNlcyA9IHJlcXVpcmUoJ2JyYWNlcycpO1xuICogY29uc29sZS5sb2coYnJhY2VzLmV4cGFuZCgnYS97YixjfS9kJykpO1xuICogLy89PiBbJ2EvYi9kJywgJ2EvYy9kJ107XG4gKiBgYGBcbiAqIEBwYXJhbSB7U3RyaW5nfSBgcGF0dGVybmAgQnJhY2UgcGF0dGVyblxuICogQHBhcmFtIHtPYmplY3R9IGBvcHRpb25zYFxuICogQHJldHVybiB7QXJyYXl9IFJldHVybnMgYW4gYXJyYXkgb2YgZXhwYW5kZWQgdmFsdWVzLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5icmFjZXMuZXhwYW5kID0gKGlucHV0LCBvcHRpb25zID0ge30pID0+IHtcbiAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICBpbnB1dCA9IGJyYWNlcy5wYXJzZShpbnB1dCwgb3B0aW9ucyk7XG4gIH1cblxuICBsZXQgcmVzdWx0ID0gZXhwYW5kKGlucHV0LCBvcHRpb25zKTtcblxuICAvLyBmaWx0ZXIgb3V0IGVtcHR5IHN0cmluZ3MgaWYgc3BlY2lmaWVkXG4gIGlmIChvcHRpb25zLm5vZW1wdHkgPT09IHRydWUpIHtcbiAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKEJvb2xlYW4pO1xuICB9XG5cbiAgLy8gZmlsdGVyIG91dCBkdXBsaWNhdGVzIGlmIHNwZWNpZmllZFxuICBpZiAob3B0aW9ucy5ub2R1cGVzID09PSB0cnVlKSB7XG4gICAgcmVzdWx0ID0gWy4uLm5ldyBTZXQocmVzdWx0KV07XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBQcm9jZXNzZXMgYSBicmFjZSBwYXR0ZXJuIGFuZCByZXR1cm5zIGVpdGhlciBhbiBleHBhbmRlZCBhcnJheVxuICogKGlmIGBvcHRpb25zLmV4cGFuZGAgaXMgdHJ1ZSksIGEgaGlnaGx5IG9wdGltaXplZCByZWdleC1jb21wYXRpYmxlIHN0cmluZy5cbiAqIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCBieSB0aGUgbWFpbiBbYnJhY2VzXSgjYnJhY2VzKSBmdW5jdGlvbi5cbiAqXG4gKiBgYGBqc1xuICogY29uc3QgYnJhY2VzID0gcmVxdWlyZSgnYnJhY2VzJyk7XG4gKiBjb25zb2xlLmxvZyhicmFjZXMuY3JlYXRlKCd1c2VyLXsyMDAuLjMwMH0vcHJvamVjdC17YSxiLGN9LXsxLi4xMH0nKSlcbiAqIC8vPT4gJ3VzZXItKDIwWzAtOV18MlsxLTldWzAtOV18MzAwKS9wcm9qZWN0LShhfGJ8YyktKFsxLTldfDEwKSdcbiAqIGBgYFxuICogQHBhcmFtIHtTdHJpbmd9IGBwYXR0ZXJuYCBCcmFjZSBwYXR0ZXJuXG4gKiBAcGFyYW0ge09iamVjdH0gYG9wdGlvbnNgXG4gKiBAcmV0dXJuIHtBcnJheX0gUmV0dXJucyBhbiBhcnJheSBvZiBleHBhbmRlZCB2YWx1ZXMuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmJyYWNlcy5jcmVhdGUgPSAoaW5wdXQsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBpZiAoaW5wdXQgPT09ICcnIHx8IGlucHV0Lmxlbmd0aCA8IDMpIHtcbiAgICByZXR1cm4gW2lucHV0XTtcbiAgfVxuXG4gcmV0dXJuIG9wdGlvbnMuZXhwYW5kICE9PSB0cnVlXG4gICAgPyBicmFjZXMuY29tcGlsZShpbnB1dCwgb3B0aW9ucylcbiAgICA6IGJyYWNlcy5leHBhbmQoaW5wdXQsIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgXCJicmFjZXNcIlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gYnJhY2VzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgV0lOX1NMQVNIID0gJ1xcXFxcXFxcLyc7XG5jb25zdCBXSU5fTk9fU0xBU0ggPSBgW14ke1dJTl9TTEFTSH1dYDtcblxuLyoqXG4gKiBQb3NpeCBnbG9iIHJlZ2V4XG4gKi9cblxuY29uc3QgRE9UX0xJVEVSQUwgPSAnXFxcXC4nO1xuY29uc3QgUExVU19MSVRFUkFMID0gJ1xcXFwrJztcbmNvbnN0IFFNQVJLX0xJVEVSQUwgPSAnXFxcXD8nO1xuY29uc3QgU0xBU0hfTElURVJBTCA9ICdcXFxcLyc7XG5jb25zdCBPTkVfQ0hBUiA9ICcoPz0uKSc7XG5jb25zdCBRTUFSSyA9ICdbXi9dJztcbmNvbnN0IEVORF9BTkNIT1IgPSBgKD86JHtTTEFTSF9MSVRFUkFMfXwkKWA7XG5jb25zdCBTVEFSVF9BTkNIT1IgPSBgKD86Xnwke1NMQVNIX0xJVEVSQUx9KWA7XG5jb25zdCBET1RTX1NMQVNIID0gYCR7RE9UX0xJVEVSQUx9ezEsMn0ke0VORF9BTkNIT1J9YDtcbmNvbnN0IE5PX0RPVCA9IGAoPyEke0RPVF9MSVRFUkFMfSlgO1xuY29uc3QgTk9fRE9UUyA9IGAoPyEke1NUQVJUX0FOQ0hPUn0ke0RPVFNfU0xBU0h9KWA7XG5jb25zdCBOT19ET1RfU0xBU0ggPSBgKD8hJHtET1RfTElURVJBTH17MCwxfSR7RU5EX0FOQ0hPUn0pYDtcbmNvbnN0IE5PX0RPVFNfU0xBU0ggPSBgKD8hJHtET1RTX1NMQVNIfSlgO1xuY29uc3QgUU1BUktfTk9fRE9UID0gYFteLiR7U0xBU0hfTElURVJBTH1dYDtcbmNvbnN0IFNUQVIgPSBgJHtRTUFSS30qP2A7XG5cbmNvbnN0IFBPU0lYX0NIQVJTID0ge1xuICBET1RfTElURVJBTCxcbiAgUExVU19MSVRFUkFMLFxuICBRTUFSS19MSVRFUkFMLFxuICBTTEFTSF9MSVRFUkFMLFxuICBPTkVfQ0hBUixcbiAgUU1BUkssXG4gIEVORF9BTkNIT1IsXG4gIERPVFNfU0xBU0gsXG4gIE5PX0RPVCxcbiAgTk9fRE9UUyxcbiAgTk9fRE9UX1NMQVNILFxuICBOT19ET1RTX1NMQVNILFxuICBRTUFSS19OT19ET1QsXG4gIFNUQVIsXG4gIFNUQVJUX0FOQ0hPUlxufTtcblxuLyoqXG4gKiBXaW5kb3dzIGdsb2IgcmVnZXhcbiAqL1xuXG5jb25zdCBXSU5ET1dTX0NIQVJTID0ge1xuICAuLi5QT1NJWF9DSEFSUyxcblxuICBTTEFTSF9MSVRFUkFMOiBgWyR7V0lOX1NMQVNIfV1gLFxuICBRTUFSSzogV0lOX05PX1NMQVNILFxuICBTVEFSOiBgJHtXSU5fTk9fU0xBU0h9Kj9gLFxuICBET1RTX1NMQVNIOiBgJHtET1RfTElURVJBTH17MSwyfSg/Olske1dJTl9TTEFTSH1dfCQpYCxcbiAgTk9fRE9UOiBgKD8hJHtET1RfTElURVJBTH0pYCxcbiAgTk9fRE9UUzogYCg/ISg/Ol58WyR7V0lOX1NMQVNIfV0pJHtET1RfTElURVJBTH17MSwyfSg/Olske1dJTl9TTEFTSH1dfCQpKWAsXG4gIE5PX0RPVF9TTEFTSDogYCg/ISR7RE9UX0xJVEVSQUx9ezAsMX0oPzpbJHtXSU5fU0xBU0h9XXwkKSlgLFxuICBOT19ET1RTX1NMQVNIOiBgKD8hJHtET1RfTElURVJBTH17MSwyfSg/Olske1dJTl9TTEFTSH1dfCQpKWAsXG4gIFFNQVJLX05PX0RPVDogYFteLiR7V0lOX1NMQVNIfV1gLFxuICBTVEFSVF9BTkNIT1I6IGAoPzpefFske1dJTl9TTEFTSH1dKWAsXG4gIEVORF9BTkNIT1I6IGAoPzpbJHtXSU5fU0xBU0h9XXwkKWBcbn07XG5cbi8qKlxuICogUE9TSVggQnJhY2tldCBSZWdleFxuICovXG5cbmNvbnN0IFBPU0lYX1JFR0VYX1NPVVJDRSA9IHtcbiAgYWxudW06ICdhLXpBLVowLTknLFxuICBhbHBoYTogJ2EtekEtWicsXG4gIGFzY2lpOiAnXFxcXHgwMC1cXFxceDdGJyxcbiAgYmxhbms6ICcgXFxcXHQnLFxuICBjbnRybDogJ1xcXFx4MDAtXFxcXHgxRlxcXFx4N0YnLFxuICBkaWdpdDogJzAtOScsXG4gIGdyYXBoOiAnXFxcXHgyMS1cXFxceDdFJyxcbiAgbG93ZXI6ICdhLXonLFxuICBwcmludDogJ1xcXFx4MjAtXFxcXHg3RSAnLFxuICBwdW5jdDogJ1xcXFwtIVwiIyQlJlxcJygpXFxcXCorLC4vOjs8PT4/QFtcXFxcXV5fYHt8fX4nLFxuICBzcGFjZTogJyBcXFxcdFxcXFxyXFxcXG5cXFxcdlxcXFxmJyxcbiAgdXBwZXI6ICdBLVonLFxuICB3b3JkOiAnQS1aYS16MC05XycsXG4gIHhkaWdpdDogJ0EtRmEtZjAtOSdcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBNQVhfTEVOR1RIOiAxMDI0ICogNjQsXG4gIFBPU0lYX1JFR0VYX1NPVVJDRSxcblxuICAvLyByZWd1bGFyIGV4cHJlc3Npb25zXG4gIFJFR0VYX0JBQ0tTTEFTSDogL1xcXFwoPyFbKis/XiR7fSh8KVtcXF1dKS9nLFxuICBSRUdFWF9OT05fU1BFQ0lBTF9DSEFSUzogL15bXkAhW1xcXS4sJCorP157fSgpfFxcXFwvXSsvLFxuICBSRUdFWF9TUEVDSUFMX0NIQVJTOiAvWy0qKz8uXiR7fSh8KVtcXF1dLyxcbiAgUkVHRVhfU1BFQ0lBTF9DSEFSU19CQUNLUkVGOiAvKFxcXFw/KSgoXFxXKShcXDMqKSkvZyxcbiAgUkVHRVhfU1BFQ0lBTF9DSEFSU19HTE9CQUw6IC8oWy0qKz8uXiR7fSh8KVtcXF1dKS9nLFxuICBSRUdFWF9SRU1PVkVfQkFDS1NMQVNIOiAvKD86XFxbLio/W15cXFxcXVxcXXxcXFxcKD89LikpL2csXG5cbiAgLy8gUmVwbGFjZSBnbG9icyB3aXRoIGVxdWl2YWxlbnQgcGF0dGVybnMgdG8gcmVkdWNlIHBhcnNpbmcgdGltZS5cbiAgUkVQTEFDRU1FTlRTOiB7XG4gICAgJyoqKic6ICcqJyxcbiAgICAnKiovKionOiAnKionLFxuICAgICcqKi8qKi8qKic6ICcqKidcbiAgfSxcblxuICAvLyBEaWdpdHNcbiAgQ0hBUl8wOiA0OCwgLyogMCAqL1xuICBDSEFSXzk6IDU3LCAvKiA5ICovXG5cbiAgLy8gQWxwaGFiZXQgY2hhcnMuXG4gIENIQVJfVVBQRVJDQVNFX0E6IDY1LCAvKiBBICovXG4gIENIQVJfTE9XRVJDQVNFX0E6IDk3LCAvKiBhICovXG4gIENIQVJfVVBQRVJDQVNFX1o6IDkwLCAvKiBaICovXG4gIENIQVJfTE9XRVJDQVNFX1o6IDEyMiwgLyogeiAqL1xuXG4gIENIQVJfTEVGVF9QQVJFTlRIRVNFUzogNDAsIC8qICggKi9cbiAgQ0hBUl9SSUdIVF9QQVJFTlRIRVNFUzogNDEsIC8qICkgKi9cblxuICBDSEFSX0FTVEVSSVNLOiA0MiwgLyogKiAqL1xuXG4gIC8vIE5vbi1hbHBoYWJldGljIGNoYXJzLlxuICBDSEFSX0FNUEVSU0FORDogMzgsIC8qICYgKi9cbiAgQ0hBUl9BVDogNjQsIC8qIEAgKi9cbiAgQ0hBUl9CQUNLV0FSRF9TTEFTSDogOTIsIC8qIFxcICovXG4gIENIQVJfQ0FSUklBR0VfUkVUVVJOOiAxMywgLyogXFxyICovXG4gIENIQVJfQ0lSQ1VNRkxFWF9BQ0NFTlQ6IDk0LCAvKiBeICovXG4gIENIQVJfQ09MT046IDU4LCAvKiA6ICovXG4gIENIQVJfQ09NTUE6IDQ0LCAvKiAsICovXG4gIENIQVJfRE9UOiA0NiwgLyogLiAqL1xuICBDSEFSX0RPVUJMRV9RVU9URTogMzQsIC8qIFwiICovXG4gIENIQVJfRVFVQUw6IDYxLCAvKiA9ICovXG4gIENIQVJfRVhDTEFNQVRJT05fTUFSSzogMzMsIC8qICEgKi9cbiAgQ0hBUl9GT1JNX0ZFRUQ6IDEyLCAvKiBcXGYgKi9cbiAgQ0hBUl9GT1JXQVJEX1NMQVNIOiA0NywgLyogLyAqL1xuICBDSEFSX0dSQVZFX0FDQ0VOVDogOTYsIC8qIGAgKi9cbiAgQ0hBUl9IQVNIOiAzNSwgLyogIyAqL1xuICBDSEFSX0hZUEhFTl9NSU5VUzogNDUsIC8qIC0gKi9cbiAgQ0hBUl9MRUZUX0FOR0xFX0JSQUNLRVQ6IDYwLCAvKiA8ICovXG4gIENIQVJfTEVGVF9DVVJMWV9CUkFDRTogMTIzLCAvKiB7ICovXG4gIENIQVJfTEVGVF9TUVVBUkVfQlJBQ0tFVDogOTEsIC8qIFsgKi9cbiAgQ0hBUl9MSU5FX0ZFRUQ6IDEwLCAvKiBcXG4gKi9cbiAgQ0hBUl9OT19CUkVBS19TUEFDRTogMTYwLCAvKiBcXHUwMEEwICovXG4gIENIQVJfUEVSQ0VOVDogMzcsIC8qICUgKi9cbiAgQ0hBUl9QTFVTOiA0MywgLyogKyAqL1xuICBDSEFSX1FVRVNUSU9OX01BUks6IDYzLCAvKiA/ICovXG4gIENIQVJfUklHSFRfQU5HTEVfQlJBQ0tFVDogNjIsIC8qID4gKi9cbiAgQ0hBUl9SSUdIVF9DVVJMWV9CUkFDRTogMTI1LCAvKiB9ICovXG4gIENIQVJfUklHSFRfU1FVQVJFX0JSQUNLRVQ6IDkzLCAvKiBdICovXG4gIENIQVJfU0VNSUNPTE9OOiA1OSwgLyogOyAqL1xuICBDSEFSX1NJTkdMRV9RVU9URTogMzksIC8qICcgKi9cbiAgQ0hBUl9TUEFDRTogMzIsIC8qICAgKi9cbiAgQ0hBUl9UQUI6IDksIC8qIFxcdCAqL1xuICBDSEFSX1VOREVSU0NPUkU6IDk1LCAvKiBfICovXG4gIENIQVJfVkVSVElDQUxfTElORTogMTI0LCAvKiB8ICovXG4gIENIQVJfWkVST19XSURUSF9OT0JSRUFLX1NQQUNFOiA2NTI3OSwgLyogXFx1RkVGRiAqL1xuXG4gIFNFUDogcGF0aC5zZXAsXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBFWFRHTE9CX0NIQVJTXG4gICAqL1xuXG4gIGV4dGdsb2JDaGFycyhjaGFycykge1xuICAgIHJldHVybiB7XG4gICAgICAnISc6IHsgdHlwZTogJ25lZ2F0ZScsIG9wZW46ICcoPzooPyEoPzonLCBjbG9zZTogYCkpJHtjaGFycy5TVEFSfSlgIH0sXG4gICAgICAnPyc6IHsgdHlwZTogJ3FtYXJrJywgb3BlbjogJyg/OicsIGNsb3NlOiAnKT8nIH0sXG4gICAgICAnKyc6IHsgdHlwZTogJ3BsdXMnLCBvcGVuOiAnKD86JywgY2xvc2U6ICcpKycgfSxcbiAgICAgICcqJzogeyB0eXBlOiAnc3RhcicsIG9wZW46ICcoPzonLCBjbG9zZTogJykqJyB9LFxuICAgICAgJ0AnOiB7IHR5cGU6ICdhdCcsIG9wZW46ICcoPzonLCBjbG9zZTogJyknIH1cbiAgICB9O1xuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgR0xPQl9DSEFSU1xuICAgKi9cblxuICBnbG9iQ2hhcnMod2luMzIpIHtcbiAgICByZXR1cm4gd2luMzIgPT09IHRydWUgPyBXSU5ET1dTX0NIQVJTIDogUE9TSVhfQ0hBUlM7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCB3aW4zMiA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMic7XG5jb25zdCB7XG4gIFJFR0VYX0JBQ0tTTEFTSCxcbiAgUkVHRVhfUkVNT1ZFX0JBQ0tTTEFTSCxcbiAgUkVHRVhfU1BFQ0lBTF9DSEFSUyxcbiAgUkVHRVhfU1BFQ0lBTF9DSEFSU19HTE9CQUxcbn0gPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xuXG5leHBvcnRzLmlzT2JqZWN0ID0gdmFsID0+IHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheSh2YWwpO1xuZXhwb3J0cy5oYXNSZWdleENoYXJzID0gc3RyID0+IFJFR0VYX1NQRUNJQUxfQ0hBUlMudGVzdChzdHIpO1xuZXhwb3J0cy5pc1JlZ2V4Q2hhciA9IHN0ciA9PiBzdHIubGVuZ3RoID09PSAxICYmIGV4cG9ydHMuaGFzUmVnZXhDaGFycyhzdHIpO1xuZXhwb3J0cy5lc2NhcGVSZWdleCA9IHN0ciA9PiBzdHIucmVwbGFjZShSRUdFWF9TUEVDSUFMX0NIQVJTX0dMT0JBTCwgJ1xcXFwkMScpO1xuZXhwb3J0cy50b1Bvc2l4U2xhc2hlcyA9IHN0ciA9PiBzdHIucmVwbGFjZShSRUdFWF9CQUNLU0xBU0gsICcvJyk7XG5cbmV4cG9ydHMucmVtb3ZlQmFja3NsYXNoZXMgPSBzdHIgPT4ge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoUkVHRVhfUkVNT1ZFX0JBQ0tTTEFTSCwgbWF0Y2ggPT4ge1xuICAgIHJldHVybiBtYXRjaCA9PT0gJ1xcXFwnID8gJycgOiBtYXRjaDtcbiAgfSk7XG59O1xuXG5leHBvcnRzLnN1cHBvcnRzTG9va2JlaGluZHMgPSAoKSA9PiB7XG4gIGNvbnN0IHNlZ3MgPSBwcm9jZXNzLnZlcnNpb24uc2xpY2UoMSkuc3BsaXQoJy4nKS5tYXAoTnVtYmVyKTtcbiAgaWYgKHNlZ3MubGVuZ3RoID09PSAzICYmIHNlZ3NbMF0gPj0gOSB8fCAoc2Vnc1swXSA9PT0gOCAmJiBzZWdzWzFdID49IDEwKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmV4cG9ydHMuaXNXaW5kb3dzID0gb3B0aW9ucyA9PiB7XG4gIGlmIChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLndpbmRvd3MgPT09ICdib29sZWFuJykge1xuICAgIHJldHVybiBvcHRpb25zLndpbmRvd3M7XG4gIH1cbiAgcmV0dXJuIHdpbjMyID09PSB0cnVlIHx8IHBhdGguc2VwID09PSAnXFxcXCc7XG59O1xuXG5leHBvcnRzLmVzY2FwZUxhc3QgPSAoaW5wdXQsIGNoYXIsIGxhc3RJZHgpID0+IHtcbiAgY29uc3QgaWR4ID0gaW5wdXQubGFzdEluZGV4T2YoY2hhciwgbGFzdElkeCk7XG4gIGlmIChpZHggPT09IC0xKSByZXR1cm4gaW5wdXQ7XG4gIGlmIChpbnB1dFtpZHggLSAxXSA9PT0gJ1xcXFwnKSByZXR1cm4gZXhwb3J0cy5lc2NhcGVMYXN0KGlucHV0LCBjaGFyLCBpZHggLSAxKTtcbiAgcmV0dXJuIGAke2lucHV0LnNsaWNlKDAsIGlkeCl9XFxcXCR7aW5wdXQuc2xpY2UoaWR4KX1gO1xufTtcblxuZXhwb3J0cy5yZW1vdmVQcmVmaXggPSAoaW5wdXQsIHN0YXRlID0ge30pID0+IHtcbiAgbGV0IG91dHB1dCA9IGlucHV0O1xuICBpZiAob3V0cHV0LnN0YXJ0c1dpdGgoJy4vJykpIHtcbiAgICBvdXRwdXQgPSBvdXRwdXQuc2xpY2UoMik7XG4gICAgc3RhdGUucHJlZml4ID0gJy4vJztcbiAgfVxuICByZXR1cm4gb3V0cHV0O1xufTtcblxuZXhwb3J0cy53cmFwT3V0cHV0ID0gKGlucHV0LCBzdGF0ZSA9IHt9LCBvcHRpb25zID0ge30pID0+IHtcbiAgY29uc3QgcHJlcGVuZCA9IG9wdGlvbnMuY29udGFpbnMgPyAnJyA6ICdeJztcbiAgY29uc3QgYXBwZW5kID0gb3B0aW9ucy5jb250YWlucyA/ICcnIDogJyQnO1xuXG4gIGxldCBvdXRwdXQgPSBgJHtwcmVwZW5kfSg/OiR7aW5wdXR9KSR7YXBwZW5kfWA7XG4gIGlmIChzdGF0ZS5uZWdhdGVkID09PSB0cnVlKSB7XG4gICAgb3V0cHV0ID0gYCg/Ol4oPyEke291dHB1dH0pLiokKWA7XG4gIH1cbiAgcmV0dXJuIG91dHB1dDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuY29uc3Qge1xuICBDSEFSX0FTVEVSSVNLLCAgICAgICAgICAgICAvKiAqICovXG4gIENIQVJfQVQsICAgICAgICAgICAgICAgICAgIC8qIEAgKi9cbiAgQ0hBUl9CQUNLV0FSRF9TTEFTSCwgICAgICAgLyogXFwgKi9cbiAgQ0hBUl9DT01NQSwgICAgICAgICAgICAgICAgLyogLCAqL1xuICBDSEFSX0RPVCwgICAgICAgICAgICAgICAgICAvKiAuICovXG4gIENIQVJfRVhDTEFNQVRJT05fTUFSSywgICAgIC8qICEgKi9cbiAgQ0hBUl9GT1JXQVJEX1NMQVNILCAgICAgICAgLyogLyAqL1xuICBDSEFSX0xFRlRfQ1VSTFlfQlJBQ0UsICAgICAvKiB7ICovXG4gIENIQVJfTEVGVF9QQVJFTlRIRVNFUywgICAgIC8qICggKi9cbiAgQ0hBUl9MRUZUX1NRVUFSRV9CUkFDS0VULCAgLyogWyAqL1xuICBDSEFSX1BMVVMsICAgICAgICAgICAgICAgICAvKiArICovXG4gIENIQVJfUVVFU1RJT05fTUFSSywgICAgICAgIC8qID8gKi9cbiAgQ0hBUl9SSUdIVF9DVVJMWV9CUkFDRSwgICAgLyogfSAqL1xuICBDSEFSX1JJR0hUX1BBUkVOVEhFU0VTLCAgICAvKiApICovXG4gIENIQVJfUklHSFRfU1FVQVJFX0JSQUNLRVQgIC8qIF0gKi9cbn0gPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xuXG5jb25zdCBpc1BhdGhTZXBhcmF0b3IgPSBjb2RlID0+IHtcbiAgcmV0dXJuIGNvZGUgPT09IENIQVJfRk9SV0FSRF9TTEFTSCB8fCBjb2RlID09PSBDSEFSX0JBQ0tXQVJEX1NMQVNIO1xufTtcblxuY29uc3QgZGVwdGggPSB0b2tlbiA9PiB7XG4gIGlmICh0b2tlbi5pc1ByZWZpeCAhPT0gdHJ1ZSkge1xuICAgIHRva2VuLmRlcHRoID0gdG9rZW4uaXNHbG9ic3RhciA/IEluZmluaXR5IDogMTtcbiAgfVxufTtcblxuLyoqXG4gKiBRdWlja2x5IHNjYW5zIGEgZ2xvYiBwYXR0ZXJuIGFuZCByZXR1cm5zIGFuIG9iamVjdCB3aXRoIGEgaGFuZGZ1bCBvZlxuICogdXNlZnVsIHByb3BlcnRpZXMsIGxpa2UgYGlzR2xvYmAsIGBwYXRoYCAodGhlIGxlYWRpbmcgbm9uLWdsb2IsIGlmIGl0IGV4aXN0cyksXG4gKiBgZ2xvYmAgKHRoZSBhY3R1YWwgcGF0dGVybiksIGBuZWdhdGVkYCAodHJ1ZSBpZiB0aGUgcGF0aCBzdGFydHMgd2l0aCBgIWAgYnV0IG5vdFxuICogd2l0aCBgIShgKSBhbmQgYG5lZ2F0ZWRFeHRnbG9iYCAodHJ1ZSBpZiB0aGUgcGF0aCBzdGFydHMgd2l0aCBgIShgKS5cbiAqXG4gKiBgYGBqc1xuICogY29uc3QgcG0gPSByZXF1aXJlKCdwaWNvbWF0Y2gnKTtcbiAqIGNvbnNvbGUubG9nKHBtLnNjYW4oJ2Zvby9iYXIvKi5qcycpKTtcbiAqIHsgaXNHbG9iOiB0cnVlLCBpbnB1dDogJ2Zvby9iYXIvKi5qcycsIGJhc2U6ICdmb28vYmFyJywgZ2xvYjogJyouanMnIH1cbiAqIGBgYFxuICogQHBhcmFtIHtTdHJpbmd9IGBzdHJgXG4gKiBAcGFyYW0ge09iamVjdH0gYG9wdGlvbnNgXG4gKiBAcmV0dXJuIHtPYmplY3R9IFJldHVybnMgYW4gb2JqZWN0IHdpdGggdG9rZW5zIGFuZCByZWdleCBzb3VyY2Ugc3RyaW5nLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5jb25zdCBzY2FuID0gKGlucHV0LCBvcHRpb25zKSA9PiB7XG4gIGNvbnN0IG9wdHMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIGNvbnN0IGxlbmd0aCA9IGlucHV0Lmxlbmd0aCAtIDE7XG4gIGNvbnN0IHNjYW5Ub0VuZCA9IG9wdHMucGFydHMgPT09IHRydWUgfHwgb3B0cy5zY2FuVG9FbmQgPT09IHRydWU7XG4gIGNvbnN0IHNsYXNoZXMgPSBbXTtcbiAgY29uc3QgdG9rZW5zID0gW107XG4gIGNvbnN0IHBhcnRzID0gW107XG5cbiAgbGV0IHN0ciA9IGlucHV0O1xuICBsZXQgaW5kZXggPSAtMTtcbiAgbGV0IHN0YXJ0ID0gMDtcbiAgbGV0IGxhc3RJbmRleCA9IDA7XG4gIGxldCBpc0JyYWNlID0gZmFsc2U7XG4gIGxldCBpc0JyYWNrZXQgPSBmYWxzZTtcbiAgbGV0IGlzR2xvYiA9IGZhbHNlO1xuICBsZXQgaXNFeHRnbG9iID0gZmFsc2U7XG4gIGxldCBpc0dsb2JzdGFyID0gZmFsc2U7XG4gIGxldCBicmFjZUVzY2FwZWQgPSBmYWxzZTtcbiAgbGV0IGJhY2tzbGFzaGVzID0gZmFsc2U7XG4gIGxldCBuZWdhdGVkID0gZmFsc2U7XG4gIGxldCBuZWdhdGVkRXh0Z2xvYiA9IGZhbHNlO1xuICBsZXQgZmluaXNoZWQgPSBmYWxzZTtcbiAgbGV0IGJyYWNlcyA9IDA7XG4gIGxldCBwcmV2O1xuICBsZXQgY29kZTtcbiAgbGV0IHRva2VuID0geyB2YWx1ZTogJycsIGRlcHRoOiAwLCBpc0dsb2I6IGZhbHNlIH07XG5cbiAgY29uc3QgZW9zID0gKCkgPT4gaW5kZXggPj0gbGVuZ3RoO1xuICBjb25zdCBwZWVrID0gKCkgPT4gc3RyLmNoYXJDb2RlQXQoaW5kZXggKyAxKTtcbiAgY29uc3QgYWR2YW5jZSA9ICgpID0+IHtcbiAgICBwcmV2ID0gY29kZTtcbiAgICByZXR1cm4gc3RyLmNoYXJDb2RlQXQoKytpbmRleCk7XG4gIH07XG5cbiAgd2hpbGUgKGluZGV4IDwgbGVuZ3RoKSB7XG4gICAgY29kZSA9IGFkdmFuY2UoKTtcbiAgICBsZXQgbmV4dDtcblxuICAgIGlmIChjb2RlID09PSBDSEFSX0JBQ0tXQVJEX1NMQVNIKSB7XG4gICAgICBiYWNrc2xhc2hlcyA9IHRva2VuLmJhY2tzbGFzaGVzID0gdHJ1ZTtcbiAgICAgIGNvZGUgPSBhZHZhbmNlKCk7XG5cbiAgICAgIGlmIChjb2RlID09PSBDSEFSX0xFRlRfQ1VSTFlfQlJBQ0UpIHtcbiAgICAgICAgYnJhY2VFc2NhcGVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChicmFjZUVzY2FwZWQgPT09IHRydWUgfHwgY29kZSA9PT0gQ0hBUl9MRUZUX0NVUkxZX0JSQUNFKSB7XG4gICAgICBicmFjZXMrKztcblxuICAgICAgd2hpbGUgKGVvcygpICE9PSB0cnVlICYmIChjb2RlID0gYWR2YW5jZSgpKSkge1xuICAgICAgICBpZiAoY29kZSA9PT0gQ0hBUl9CQUNLV0FSRF9TTEFTSCkge1xuICAgICAgICAgIGJhY2tzbGFzaGVzID0gdG9rZW4uYmFja3NsYXNoZXMgPSB0cnVlO1xuICAgICAgICAgIGFkdmFuY2UoKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb2RlID09PSBDSEFSX0xFRlRfQ1VSTFlfQlJBQ0UpIHtcbiAgICAgICAgICBicmFjZXMrKztcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChicmFjZUVzY2FwZWQgIT09IHRydWUgJiYgY29kZSA9PT0gQ0hBUl9ET1QgJiYgKGNvZGUgPSBhZHZhbmNlKCkpID09PSBDSEFSX0RPVCkge1xuICAgICAgICAgIGlzQnJhY2UgPSB0b2tlbi5pc0JyYWNlID0gdHJ1ZTtcbiAgICAgICAgICBpc0dsb2IgPSB0b2tlbi5pc0dsb2IgPSB0cnVlO1xuICAgICAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcblxuICAgICAgICAgIGlmIChzY2FuVG9FbmQgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJyYWNlRXNjYXBlZCAhPT0gdHJ1ZSAmJiBjb2RlID09PSBDSEFSX0NPTU1BKSB7XG4gICAgICAgICAgaXNCcmFjZSA9IHRva2VuLmlzQnJhY2UgPSB0cnVlO1xuICAgICAgICAgIGlzR2xvYiA9IHRva2VuLmlzR2xvYiA9IHRydWU7XG4gICAgICAgICAgZmluaXNoZWQgPSB0cnVlO1xuXG4gICAgICAgICAgaWYgKHNjYW5Ub0VuZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29kZSA9PT0gQ0hBUl9SSUdIVF9DVVJMWV9CUkFDRSkge1xuICAgICAgICAgIGJyYWNlcy0tO1xuXG4gICAgICAgICAgaWYgKGJyYWNlcyA9PT0gMCkge1xuICAgICAgICAgICAgYnJhY2VFc2NhcGVkID0gZmFsc2U7XG4gICAgICAgICAgICBpc0JyYWNlID0gdG9rZW4uaXNCcmFjZSA9IHRydWU7XG4gICAgICAgICAgICBmaW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHNjYW5Ub0VuZCA9PT0gdHJ1ZSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKGNvZGUgPT09IENIQVJfRk9SV0FSRF9TTEFTSCkge1xuICAgICAgc2xhc2hlcy5wdXNoKGluZGV4KTtcbiAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgIHRva2VuID0geyB2YWx1ZTogJycsIGRlcHRoOiAwLCBpc0dsb2I6IGZhbHNlIH07XG5cbiAgICAgIGlmIChmaW5pc2hlZCA9PT0gdHJ1ZSkgY29udGludWU7XG4gICAgICBpZiAocHJldiA9PT0gQ0hBUl9ET1QgJiYgaW5kZXggPT09IChzdGFydCArIDEpKSB7XG4gICAgICAgIHN0YXJ0ICs9IDI7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBsYXN0SW5kZXggPSBpbmRleCArIDE7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAob3B0cy5ub2V4dCAhPT0gdHJ1ZSkge1xuICAgICAgY29uc3QgaXNFeHRnbG9iQ2hhciA9IGNvZGUgPT09IENIQVJfUExVU1xuICAgICAgICB8fCBjb2RlID09PSBDSEFSX0FUXG4gICAgICAgIHx8IGNvZGUgPT09IENIQVJfQVNURVJJU0tcbiAgICAgICAgfHwgY29kZSA9PT0gQ0hBUl9RVUVTVElPTl9NQVJLXG4gICAgICAgIHx8IGNvZGUgPT09IENIQVJfRVhDTEFNQVRJT05fTUFSSztcblxuICAgICAgaWYgKGlzRXh0Z2xvYkNoYXIgPT09IHRydWUgJiYgcGVlaygpID09PSBDSEFSX0xFRlRfUEFSRU5USEVTRVMpIHtcbiAgICAgICAgaXNHbG9iID0gdG9rZW4uaXNHbG9iID0gdHJ1ZTtcbiAgICAgICAgaXNFeHRnbG9iID0gdG9rZW4uaXNFeHRnbG9iID0gdHJ1ZTtcbiAgICAgICAgZmluaXNoZWQgPSB0cnVlO1xuICAgICAgICBpZiAoY29kZSA9PT0gQ0hBUl9FWENMQU1BVElPTl9NQVJLICYmIGluZGV4ID09PSBzdGFydCkge1xuICAgICAgICAgIG5lZ2F0ZWRFeHRnbG9iID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzY2FuVG9FbmQgPT09IHRydWUpIHtcbiAgICAgICAgICB3aGlsZSAoZW9zKCkgIT09IHRydWUgJiYgKGNvZGUgPSBhZHZhbmNlKCkpKSB7XG4gICAgICAgICAgICBpZiAoY29kZSA9PT0gQ0hBUl9CQUNLV0FSRF9TTEFTSCkge1xuICAgICAgICAgICAgICBiYWNrc2xhc2hlcyA9IHRva2VuLmJhY2tzbGFzaGVzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgY29kZSA9IGFkdmFuY2UoKTtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjb2RlID09PSBDSEFSX1JJR0hUX1BBUkVOVEhFU0VTKSB7XG4gICAgICAgICAgICAgIGlzR2xvYiA9IHRva2VuLmlzR2xvYiA9IHRydWU7XG4gICAgICAgICAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb2RlID09PSBDSEFSX0FTVEVSSVNLKSB7XG4gICAgICBpZiAocHJldiA9PT0gQ0hBUl9BU1RFUklTSykgaXNHbG9ic3RhciA9IHRva2VuLmlzR2xvYnN0YXIgPSB0cnVlO1xuICAgICAgaXNHbG9iID0gdG9rZW4uaXNHbG9iID0gdHJ1ZTtcbiAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcblxuICAgICAgaWYgKHNjYW5Ub0VuZCA9PT0gdHJ1ZSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChjb2RlID09PSBDSEFSX1FVRVNUSU9OX01BUkspIHtcbiAgICAgIGlzR2xvYiA9IHRva2VuLmlzR2xvYiA9IHRydWU7XG4gICAgICBmaW5pc2hlZCA9IHRydWU7XG5cbiAgICAgIGlmIChzY2FuVG9FbmQgPT09IHRydWUpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoY29kZSA9PT0gQ0hBUl9MRUZUX1NRVUFSRV9CUkFDS0VUKSB7XG4gICAgICB3aGlsZSAoZW9zKCkgIT09IHRydWUgJiYgKG5leHQgPSBhZHZhbmNlKCkpKSB7XG4gICAgICAgIGlmIChuZXh0ID09PSBDSEFSX0JBQ0tXQVJEX1NMQVNIKSB7XG4gICAgICAgICAgYmFja3NsYXNoZXMgPSB0b2tlbi5iYWNrc2xhc2hlcyA9IHRydWU7XG4gICAgICAgICAgYWR2YW5jZSgpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5leHQgPT09IENIQVJfUklHSFRfU1FVQVJFX0JSQUNLRVQpIHtcbiAgICAgICAgICBpc0JyYWNrZXQgPSB0b2tlbi5pc0JyYWNrZXQgPSB0cnVlO1xuICAgICAgICAgIGlzR2xvYiA9IHRva2VuLmlzR2xvYiA9IHRydWU7XG4gICAgICAgICAgZmluaXNoZWQgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzY2FuVG9FbmQgPT09IHRydWUpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChvcHRzLm5vbmVnYXRlICE9PSB0cnVlICYmIGNvZGUgPT09IENIQVJfRVhDTEFNQVRJT05fTUFSSyAmJiBpbmRleCA9PT0gc3RhcnQpIHtcbiAgICAgIG5lZ2F0ZWQgPSB0b2tlbi5uZWdhdGVkID0gdHJ1ZTtcbiAgICAgIHN0YXJ0Kys7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBpZiAob3B0cy5ub3BhcmVuICE9PSB0cnVlICYmIGNvZGUgPT09IENIQVJfTEVGVF9QQVJFTlRIRVNFUykge1xuICAgICAgaXNHbG9iID0gdG9rZW4uaXNHbG9iID0gdHJ1ZTtcblxuICAgICAgaWYgKHNjYW5Ub0VuZCA9PT0gdHJ1ZSkge1xuICAgICAgICB3aGlsZSAoZW9zKCkgIT09IHRydWUgJiYgKGNvZGUgPSBhZHZhbmNlKCkpKSB7XG4gICAgICAgICAgaWYgKGNvZGUgPT09IENIQVJfTEVGVF9QQVJFTlRIRVNFUykge1xuICAgICAgICAgICAgYmFja3NsYXNoZXMgPSB0b2tlbi5iYWNrc2xhc2hlcyA9IHRydWU7XG4gICAgICAgICAgICBjb2RlID0gYWR2YW5jZSgpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGNvZGUgPT09IENIQVJfUklHSFRfUEFSRU5USEVTRVMpIHtcbiAgICAgICAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChpc0dsb2IgPT09IHRydWUpIHtcbiAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcblxuICAgICAgaWYgKHNjYW5Ub0VuZCA9PT0gdHJ1ZSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgaWYgKG9wdHMubm9leHQgPT09IHRydWUpIHtcbiAgICBpc0V4dGdsb2IgPSBmYWxzZTtcbiAgICBpc0dsb2IgPSBmYWxzZTtcbiAgfVxuXG4gIGxldCBiYXNlID0gc3RyO1xuICBsZXQgcHJlZml4ID0gJyc7XG4gIGxldCBnbG9iID0gJyc7XG5cbiAgaWYgKHN0YXJ0ID4gMCkge1xuICAgIHByZWZpeCA9IHN0ci5zbGljZSgwLCBzdGFydCk7XG4gICAgc3RyID0gc3RyLnNsaWNlKHN0YXJ0KTtcbiAgICBsYXN0SW5kZXggLT0gc3RhcnQ7XG4gIH1cblxuICBpZiAoYmFzZSAmJiBpc0dsb2IgPT09IHRydWUgJiYgbGFzdEluZGV4ID4gMCkge1xuICAgIGJhc2UgPSBzdHIuc2xpY2UoMCwgbGFzdEluZGV4KTtcbiAgICBnbG9iID0gc3RyLnNsaWNlKGxhc3RJbmRleCk7XG4gIH0gZWxzZSBpZiAoaXNHbG9iID09PSB0cnVlKSB7XG4gICAgYmFzZSA9ICcnO1xuICAgIGdsb2IgPSBzdHI7XG4gIH0gZWxzZSB7XG4gICAgYmFzZSA9IHN0cjtcbiAgfVxuXG4gIGlmIChiYXNlICYmIGJhc2UgIT09ICcnICYmIGJhc2UgIT09ICcvJyAmJiBiYXNlICE9PSBzdHIpIHtcbiAgICBpZiAoaXNQYXRoU2VwYXJhdG9yKGJhc2UuY2hhckNvZGVBdChiYXNlLmxlbmd0aCAtIDEpKSkge1xuICAgICAgYmFzZSA9IGJhc2Uuc2xpY2UoMCwgLTEpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChvcHRzLnVuZXNjYXBlID09PSB0cnVlKSB7XG4gICAgaWYgKGdsb2IpIGdsb2IgPSB1dGlscy5yZW1vdmVCYWNrc2xhc2hlcyhnbG9iKTtcblxuICAgIGlmIChiYXNlICYmIGJhY2tzbGFzaGVzID09PSB0cnVlKSB7XG4gICAgICBiYXNlID0gdXRpbHMucmVtb3ZlQmFja3NsYXNoZXMoYmFzZSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc3RhdGUgPSB7XG4gICAgcHJlZml4LFxuICAgIGlucHV0LFxuICAgIHN0YXJ0LFxuICAgIGJhc2UsXG4gICAgZ2xvYixcbiAgICBpc0JyYWNlLFxuICAgIGlzQnJhY2tldCxcbiAgICBpc0dsb2IsXG4gICAgaXNFeHRnbG9iLFxuICAgIGlzR2xvYnN0YXIsXG4gICAgbmVnYXRlZCxcbiAgICBuZWdhdGVkRXh0Z2xvYlxuICB9O1xuXG4gIGlmIChvcHRzLnRva2VucyA9PT0gdHJ1ZSkge1xuICAgIHN0YXRlLm1heERlcHRoID0gMDtcbiAgICBpZiAoIWlzUGF0aFNlcGFyYXRvcihjb2RlKSkge1xuICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgIH1cbiAgICBzdGF0ZS50b2tlbnMgPSB0b2tlbnM7XG4gIH1cblxuICBpZiAob3B0cy5wYXJ0cyA9PT0gdHJ1ZSB8fCBvcHRzLnRva2VucyA9PT0gdHJ1ZSkge1xuICAgIGxldCBwcmV2SW5kZXg7XG5cbiAgICBmb3IgKGxldCBpZHggPSAwOyBpZHggPCBzbGFzaGVzLmxlbmd0aDsgaWR4KyspIHtcbiAgICAgIGNvbnN0IG4gPSBwcmV2SW5kZXggPyBwcmV2SW5kZXggKyAxIDogc3RhcnQ7XG4gICAgICBjb25zdCBpID0gc2xhc2hlc1tpZHhdO1xuICAgICAgY29uc3QgdmFsdWUgPSBpbnB1dC5zbGljZShuLCBpKTtcbiAgICAgIGlmIChvcHRzLnRva2Vucykge1xuICAgICAgICBpZiAoaWR4ID09PSAwICYmIHN0YXJ0ICE9PSAwKSB7XG4gICAgICAgICAgdG9rZW5zW2lkeF0uaXNQcmVmaXggPSB0cnVlO1xuICAgICAgICAgIHRva2Vuc1tpZHhdLnZhbHVlID0gcHJlZml4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2Vuc1tpZHhdLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZGVwdGgodG9rZW5zW2lkeF0pO1xuICAgICAgICBzdGF0ZS5tYXhEZXB0aCArPSB0b2tlbnNbaWR4XS5kZXB0aDtcbiAgICAgIH1cbiAgICAgIGlmIChpZHggIT09IDAgfHwgdmFsdWUgIT09ICcnKSB7XG4gICAgICAgIHBhcnRzLnB1c2godmFsdWUpO1xuICAgICAgfVxuICAgICAgcHJldkluZGV4ID0gaTtcbiAgICB9XG5cbiAgICBpZiAocHJldkluZGV4ICYmIHByZXZJbmRleCArIDEgPCBpbnB1dC5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gaW5wdXQuc2xpY2UocHJldkluZGV4ICsgMSk7XG4gICAgICBwYXJ0cy5wdXNoKHZhbHVlKTtcblxuICAgICAgaWYgKG9wdHMudG9rZW5zKSB7XG4gICAgICAgIHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV0udmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgZGVwdGgodG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXSk7XG4gICAgICAgIHN0YXRlLm1heERlcHRoICs9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV0uZGVwdGg7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGUuc2xhc2hlcyA9IHNsYXNoZXM7XG4gICAgc3RhdGUucGFydHMgPSBwYXJ0cztcbiAgfVxuXG4gIHJldHVybiBzdGF0ZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc2NhbjtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcbmNvbnN0IHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG4vKipcbiAqIENvbnN0YW50c1xuICovXG5cbmNvbnN0IHtcbiAgTUFYX0xFTkdUSCxcbiAgUE9TSVhfUkVHRVhfU09VUkNFLFxuICBSRUdFWF9OT05fU1BFQ0lBTF9DSEFSUyxcbiAgUkVHRVhfU1BFQ0lBTF9DSEFSU19CQUNLUkVGLFxuICBSRVBMQUNFTUVOVFNcbn0gPSBjb25zdGFudHM7XG5cbi8qKlxuICogSGVscGVyc1xuICovXG5cbmNvbnN0IGV4cGFuZFJhbmdlID0gKGFyZ3MsIG9wdGlvbnMpID0+IHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zLmV4cGFuZFJhbmdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMuZXhwYW5kUmFuZ2UoLi4uYXJncywgb3B0aW9ucyk7XG4gIH1cblxuICBhcmdzLnNvcnQoKTtcbiAgY29uc3QgdmFsdWUgPSBgWyR7YXJncy5qb2luKCctJyl9XWA7XG5cbiAgdHJ5IHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tbmV3ICovXG4gICAgbmV3IFJlZ0V4cCh2YWx1ZSk7XG4gIH0gY2F0Y2ggKGV4KSB7XG4gICAgcmV0dXJuIGFyZ3MubWFwKHYgPT4gdXRpbHMuZXNjYXBlUmVnZXgodikpLmpvaW4oJy4uJyk7XG4gIH1cblxuICByZXR1cm4gdmFsdWU7XG59O1xuXG4vKipcbiAqIENyZWF0ZSB0aGUgbWVzc2FnZSBmb3IgYSBzeW50YXggZXJyb3JcbiAqL1xuXG5jb25zdCBzeW50YXhFcnJvciA9ICh0eXBlLCBjaGFyKSA9PiB7XG4gIHJldHVybiBgTWlzc2luZyAke3R5cGV9OiBcIiR7Y2hhcn1cIiAtIHVzZSBcIlxcXFxcXFxcJHtjaGFyfVwiIHRvIG1hdGNoIGxpdGVyYWwgY2hhcmFjdGVyc2A7XG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBpbnB1dCBzdHJpbmcuXG4gKiBAcGFyYW0ge1N0cmluZ30gaW5wdXRcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuY29uc3QgcGFyc2UgPSAoaW5wdXQsIG9wdGlvbnMpID0+IHtcbiAgaWYgKHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhIHN0cmluZycpO1xuICB9XG5cbiAgaW5wdXQgPSBSRVBMQUNFTUVOVFNbaW5wdXRdIHx8IGlucHV0O1xuXG4gIGNvbnN0IG9wdHMgPSB7IC4uLm9wdGlvbnMgfTtcbiAgY29uc3QgbWF4ID0gdHlwZW9mIG9wdHMubWF4TGVuZ3RoID09PSAnbnVtYmVyJyA/IE1hdGgubWluKE1BWF9MRU5HVEgsIG9wdHMubWF4TGVuZ3RoKSA6IE1BWF9MRU5HVEg7XG5cbiAgbGV0IGxlbiA9IGlucHV0Lmxlbmd0aDtcbiAgaWYgKGxlbiA+IG1heCkge1xuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihgSW5wdXQgbGVuZ3RoOiAke2xlbn0sIGV4Y2VlZHMgbWF4aW11bSBhbGxvd2VkIGxlbmd0aDogJHttYXh9YCk7XG4gIH1cblxuICBjb25zdCBib3MgPSB7IHR5cGU6ICdib3MnLCB2YWx1ZTogJycsIG91dHB1dDogb3B0cy5wcmVwZW5kIHx8ICcnIH07XG4gIGNvbnN0IHRva2VucyA9IFtib3NdO1xuXG4gIGNvbnN0IGNhcHR1cmUgPSBvcHRzLmNhcHR1cmUgPyAnJyA6ICc/Oic7XG4gIGNvbnN0IHdpbjMyID0gdXRpbHMuaXNXaW5kb3dzKG9wdGlvbnMpO1xuXG4gIC8vIGNyZWF0ZSBjb25zdGFudHMgYmFzZWQgb24gcGxhdGZvcm0sIGZvciB3aW5kb3dzIG9yIHBvc2l4XG4gIGNvbnN0IFBMQVRGT1JNX0NIQVJTID0gY29uc3RhbnRzLmdsb2JDaGFycyh3aW4zMik7XG4gIGNvbnN0IEVYVEdMT0JfQ0hBUlMgPSBjb25zdGFudHMuZXh0Z2xvYkNoYXJzKFBMQVRGT1JNX0NIQVJTKTtcblxuICBjb25zdCB7XG4gICAgRE9UX0xJVEVSQUwsXG4gICAgUExVU19MSVRFUkFMLFxuICAgIFNMQVNIX0xJVEVSQUwsXG4gICAgT05FX0NIQVIsXG4gICAgRE9UU19TTEFTSCxcbiAgICBOT19ET1QsXG4gICAgTk9fRE9UX1NMQVNILFxuICAgIE5PX0RPVFNfU0xBU0gsXG4gICAgUU1BUkssXG4gICAgUU1BUktfTk9fRE9ULFxuICAgIFNUQVIsXG4gICAgU1RBUlRfQU5DSE9SXG4gIH0gPSBQTEFURk9STV9DSEFSUztcblxuICBjb25zdCBnbG9ic3RhciA9IG9wdHMgPT4ge1xuICAgIHJldHVybiBgKCR7Y2FwdHVyZX0oPzooPyEke1NUQVJUX0FOQ0hPUn0ke29wdHMuZG90ID8gRE9UU19TTEFTSCA6IERPVF9MSVRFUkFMfSkuKSo/KWA7XG4gIH07XG5cbiAgY29uc3Qgbm9kb3QgPSBvcHRzLmRvdCA/ICcnIDogTk9fRE9UO1xuICBjb25zdCBxbWFya05vRG90ID0gb3B0cy5kb3QgPyBRTUFSSyA6IFFNQVJLX05PX0RPVDtcbiAgbGV0IHN0YXIgPSBvcHRzLmJhc2ggPT09IHRydWUgPyBnbG9ic3RhcihvcHRzKSA6IFNUQVI7XG5cbiAgaWYgKG9wdHMuY2FwdHVyZSkge1xuICAgIHN0YXIgPSBgKCR7c3Rhcn0pYDtcbiAgfVxuXG4gIC8vIG1pbmltYXRjaCBvcHRpb25zIHN1cHBvcnRcbiAgaWYgKHR5cGVvZiBvcHRzLm5vZXh0ID09PSAnYm9vbGVhbicpIHtcbiAgICBvcHRzLm5vZXh0Z2xvYiA9IG9wdHMubm9leHQ7XG4gIH1cblxuICBjb25zdCBzdGF0ZSA9IHtcbiAgICBpbnB1dCxcbiAgICBpbmRleDogLTEsXG4gICAgc3RhcnQ6IDAsXG4gICAgZG90OiBvcHRzLmRvdCA9PT0gdHJ1ZSxcbiAgICBjb25zdW1lZDogJycsXG4gICAgb3V0cHV0OiAnJyxcbiAgICBwcmVmaXg6ICcnLFxuICAgIGJhY2t0cmFjazogZmFsc2UsXG4gICAgbmVnYXRlZDogZmFsc2UsXG4gICAgYnJhY2tldHM6IDAsXG4gICAgYnJhY2VzOiAwLFxuICAgIHBhcmVuczogMCxcbiAgICBxdW90ZXM6IDAsXG4gICAgZ2xvYnN0YXI6IGZhbHNlLFxuICAgIHRva2Vuc1xuICB9O1xuXG4gIGlucHV0ID0gdXRpbHMucmVtb3ZlUHJlZml4KGlucHV0LCBzdGF0ZSk7XG4gIGxlbiA9IGlucHV0Lmxlbmd0aDtcblxuICBjb25zdCBleHRnbG9icyA9IFtdO1xuICBjb25zdCBicmFjZXMgPSBbXTtcbiAgY29uc3Qgc3RhY2sgPSBbXTtcbiAgbGV0IHByZXYgPSBib3M7XG4gIGxldCB2YWx1ZTtcblxuICAvKipcbiAgICogVG9rZW5pemluZyBoZWxwZXJzXG4gICAqL1xuXG4gIGNvbnN0IGVvcyA9ICgpID0+IHN0YXRlLmluZGV4ID09PSBsZW4gLSAxO1xuICBjb25zdCBwZWVrID0gc3RhdGUucGVlayA9IChuID0gMSkgPT4gaW5wdXRbc3RhdGUuaW5kZXggKyBuXTtcbiAgY29uc3QgYWR2YW5jZSA9IHN0YXRlLmFkdmFuY2UgPSAoKSA9PiBpbnB1dFsrK3N0YXRlLmluZGV4XSB8fCAnJztcbiAgY29uc3QgcmVtYWluaW5nID0gKCkgPT4gaW5wdXQuc2xpY2Uoc3RhdGUuaW5kZXggKyAxKTtcbiAgY29uc3QgY29uc3VtZSA9ICh2YWx1ZSA9ICcnLCBudW0gPSAwKSA9PiB7XG4gICAgc3RhdGUuY29uc3VtZWQgKz0gdmFsdWU7XG4gICAgc3RhdGUuaW5kZXggKz0gbnVtO1xuICB9O1xuXG4gIGNvbnN0IGFwcGVuZCA9IHRva2VuID0+IHtcbiAgICBzdGF0ZS5vdXRwdXQgKz0gdG9rZW4ub3V0cHV0ICE9IG51bGwgPyB0b2tlbi5vdXRwdXQgOiB0b2tlbi52YWx1ZTtcbiAgICBjb25zdW1lKHRva2VuLnZhbHVlKTtcbiAgfTtcblxuICBjb25zdCBuZWdhdGUgPSAoKSA9PiB7XG4gICAgbGV0IGNvdW50ID0gMTtcblxuICAgIHdoaWxlIChwZWVrKCkgPT09ICchJyAmJiAocGVlaygyKSAhPT0gJygnIHx8IHBlZWsoMykgPT09ICc/JykpIHtcbiAgICAgIGFkdmFuY2UoKTtcbiAgICAgIHN0YXRlLnN0YXJ0Kys7XG4gICAgICBjb3VudCsrO1xuICAgIH1cblxuICAgIGlmIChjb3VudCAlIDIgPT09IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBzdGF0ZS5uZWdhdGVkID0gdHJ1ZTtcbiAgICBzdGF0ZS5zdGFydCsrO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIGNvbnN0IGluY3JlbWVudCA9IHR5cGUgPT4ge1xuICAgIHN0YXRlW3R5cGVdKys7XG4gICAgc3RhY2sucHVzaCh0eXBlKTtcbiAgfTtcblxuICBjb25zdCBkZWNyZW1lbnQgPSB0eXBlID0+IHtcbiAgICBzdGF0ZVt0eXBlXS0tO1xuICAgIHN0YWNrLnBvcCgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQdXNoIHRva2VucyBvbnRvIHRoZSB0b2tlbnMgYXJyYXkuIFRoaXMgaGVscGVyIHNwZWVkcyB1cFxuICAgKiB0b2tlbml6aW5nIGJ5IDEpIGhlbHBpbmcgdXMgYXZvaWQgYmFja3RyYWNraW5nIGFzIG11Y2ggYXMgcG9zc2libGUsXG4gICAqIGFuZCAyKSBoZWxwaW5nIHVzIGF2b2lkIGNyZWF0aW5nIGV4dHJhIHRva2VucyB3aGVuIGNvbnNlY3V0aXZlXG4gICAqIGNoYXJhY3RlcnMgYXJlIHBsYWluIHRleHQuIFRoaXMgaW1wcm92ZXMgcGVyZm9ybWFuY2UgYW5kIHNpbXBsaWZpZXNcbiAgICogbG9va2JlaGluZHMuXG4gICAqL1xuXG4gIGNvbnN0IHB1c2ggPSB0b2sgPT4ge1xuICAgIGlmIChwcmV2LnR5cGUgPT09ICdnbG9ic3RhcicpIHtcbiAgICAgIGNvbnN0IGlzQnJhY2UgPSBzdGF0ZS5icmFjZXMgPiAwICYmICh0b2sudHlwZSA9PT0gJ2NvbW1hJyB8fCB0b2sudHlwZSA9PT0gJ2JyYWNlJyk7XG4gICAgICBjb25zdCBpc0V4dGdsb2IgPSB0b2suZXh0Z2xvYiA9PT0gdHJ1ZSB8fCAoZXh0Z2xvYnMubGVuZ3RoICYmICh0b2sudHlwZSA9PT0gJ3BpcGUnIHx8IHRvay50eXBlID09PSAncGFyZW4nKSk7XG5cbiAgICAgIGlmICh0b2sudHlwZSAhPT0gJ3NsYXNoJyAmJiB0b2sudHlwZSAhPT0gJ3BhcmVuJyAmJiAhaXNCcmFjZSAmJiAhaXNFeHRnbG9iKSB7XG4gICAgICAgIHN0YXRlLm91dHB1dCA9IHN0YXRlLm91dHB1dC5zbGljZSgwLCAtcHJldi5vdXRwdXQubGVuZ3RoKTtcbiAgICAgICAgcHJldi50eXBlID0gJ3N0YXInO1xuICAgICAgICBwcmV2LnZhbHVlID0gJyonO1xuICAgICAgICBwcmV2Lm91dHB1dCA9IHN0YXI7XG4gICAgICAgIHN0YXRlLm91dHB1dCArPSBwcmV2Lm91dHB1dDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZXh0Z2xvYnMubGVuZ3RoICYmIHRvay50eXBlICE9PSAncGFyZW4nKSB7XG4gICAgICBleHRnbG9ic1tleHRnbG9icy5sZW5ndGggLSAxXS5pbm5lciArPSB0b2sudmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKHRvay52YWx1ZSB8fCB0b2sub3V0cHV0KSBhcHBlbmQodG9rKTtcbiAgICBpZiAocHJldiAmJiBwcmV2LnR5cGUgPT09ICd0ZXh0JyAmJiB0b2sudHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICBwcmV2LnZhbHVlICs9IHRvay52YWx1ZTtcbiAgICAgIHByZXYub3V0cHV0ID0gKHByZXYub3V0cHV0IHx8ICcnKSArIHRvay52YWx1ZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b2sucHJldiA9IHByZXY7XG4gICAgdG9rZW5zLnB1c2godG9rKTtcbiAgICBwcmV2ID0gdG9rO1xuICB9O1xuXG4gIGNvbnN0IGV4dGdsb2JPcGVuID0gKHR5cGUsIHZhbHVlKSA9PiB7XG4gICAgY29uc3QgdG9rZW4gPSB7IC4uLkVYVEdMT0JfQ0hBUlNbdmFsdWVdLCBjb25kaXRpb25zOiAxLCBpbm5lcjogJycgfTtcblxuICAgIHRva2VuLnByZXYgPSBwcmV2O1xuICAgIHRva2VuLnBhcmVucyA9IHN0YXRlLnBhcmVucztcbiAgICB0b2tlbi5vdXRwdXQgPSBzdGF0ZS5vdXRwdXQ7XG4gICAgY29uc3Qgb3V0cHV0ID0gKG9wdHMuY2FwdHVyZSA/ICcoJyA6ICcnKSArIHRva2VuLm9wZW47XG5cbiAgICBpbmNyZW1lbnQoJ3BhcmVucycpO1xuICAgIHB1c2goeyB0eXBlLCB2YWx1ZSwgb3V0cHV0OiBzdGF0ZS5vdXRwdXQgPyAnJyA6IE9ORV9DSEFSIH0pO1xuICAgIHB1c2goeyB0eXBlOiAncGFyZW4nLCBleHRnbG9iOiB0cnVlLCB2YWx1ZTogYWR2YW5jZSgpLCBvdXRwdXQgfSk7XG4gICAgZXh0Z2xvYnMucHVzaCh0b2tlbik7XG4gIH07XG5cbiAgY29uc3QgZXh0Z2xvYkNsb3NlID0gdG9rZW4gPT4ge1xuICAgIGxldCBvdXRwdXQgPSB0b2tlbi5jbG9zZSArIChvcHRzLmNhcHR1cmUgPyAnKScgOiAnJyk7XG4gICAgbGV0IHJlc3Q7XG5cbiAgICBpZiAodG9rZW4udHlwZSA9PT0gJ25lZ2F0ZScpIHtcbiAgICAgIGxldCBleHRnbG9iU3RhciA9IHN0YXI7XG5cbiAgICAgIGlmICh0b2tlbi5pbm5lciAmJiB0b2tlbi5pbm5lci5sZW5ndGggPiAxICYmIHRva2VuLmlubmVyLmluY2x1ZGVzKCcvJykpIHtcbiAgICAgICAgZXh0Z2xvYlN0YXIgPSBnbG9ic3RhcihvcHRzKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGV4dGdsb2JTdGFyICE9PSBzdGFyIHx8IGVvcygpIHx8IC9eXFwpKyQvLnRlc3QocmVtYWluaW5nKCkpKSB7XG4gICAgICAgIG91dHB1dCA9IHRva2VuLmNsb3NlID0gYCkkKSkke2V4dGdsb2JTdGFyfWA7XG4gICAgICB9XG5cbiAgICAgIGlmICh0b2tlbi5pbm5lci5pbmNsdWRlcygnKicpICYmIChyZXN0ID0gcmVtYWluaW5nKCkpICYmIC9eXFwuW15cXFxcLy5dKyQvLnRlc3QocmVzdCkpIHtcbiAgICAgICAgLy8gQW55IG5vbi1tYWdpY2FsIHN0cmluZyAoYC50c2ApIG9yIGV2ZW4gbmVzdGVkIGV4cHJlc3Npb24gKGAue3RzLHRzeH1gKSBjYW4gZm9sbG93IGFmdGVyIHRoZSBjbG9zaW5nIHBhcmVudGhlc2lzLlxuICAgICAgICAvLyBJbiB0aGlzIGNhc2UsIHdlIG5lZWQgdG8gcGFyc2UgdGhlIHN0cmluZyBhbmQgdXNlIGl0IGluIHRoZSBvdXRwdXQgb2YgdGhlIG9yaWdpbmFsIHBhdHRlcm4uXG4gICAgICAgIC8vIFN1aXRhYmxlIHBhdHRlcm5zOiBgLyEoKi5kKS50c2AsIGAvISgqLmQpLnt0cyx0c3h9YCwgYCoqLyEoKi1kYmcpLkAoanMpYC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gRGlzYWJsaW5nIHRoZSBgZmFzdHBhdGhzYCBvcHRpb24gZHVlIHRvIGEgcHJvYmxlbSB3aXRoIHBhcnNpbmcgc3RyaW5ncyBhcyBgLnRzYCBpbiB0aGUgcGF0dGVybiBsaWtlIGAqKi8hKCouZCkudHNgLlxuICAgICAgICBjb25zdCBleHByZXNzaW9uID0gcGFyc2UocmVzdCwgeyAuLi5vcHRpb25zLCBmYXN0cGF0aHM6IGZhbHNlIH0pLm91dHB1dDtcblxuICAgICAgICBvdXRwdXQgPSB0b2tlbi5jbG9zZSA9IGApJHtleHByZXNzaW9ufSkke2V4dGdsb2JTdGFyfSlgO1xuICAgICAgfVxuXG4gICAgICBpZiAodG9rZW4ucHJldi50eXBlID09PSAnYm9zJykge1xuICAgICAgICBzdGF0ZS5uZWdhdGVkRXh0Z2xvYiA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcHVzaCh7IHR5cGU6ICdwYXJlbicsIGV4dGdsb2I6IHRydWUsIHZhbHVlLCBvdXRwdXQgfSk7XG4gICAgZGVjcmVtZW50KCdwYXJlbnMnKTtcbiAgfTtcblxuICAvKipcbiAgICogRmFzdCBwYXRoc1xuICAgKi9cblxuICBpZiAob3B0cy5mYXN0cGF0aHMgIT09IGZhbHNlICYmICEvKF5bKiFdfFsvKClbXFxde31cIl0pLy50ZXN0KGlucHV0KSkge1xuICAgIGxldCBiYWNrc2xhc2hlcyA9IGZhbHNlO1xuXG4gICAgbGV0IG91dHB1dCA9IGlucHV0LnJlcGxhY2UoUkVHRVhfU1BFQ0lBTF9DSEFSU19CQUNLUkVGLCAobSwgZXNjLCBjaGFycywgZmlyc3QsIHJlc3QsIGluZGV4KSA9PiB7XG4gICAgICBpZiAoZmlyc3QgPT09ICdcXFxcJykge1xuICAgICAgICBiYWNrc2xhc2hlcyA9IHRydWU7XG4gICAgICAgIHJldHVybiBtO1xuICAgICAgfVxuXG4gICAgICBpZiAoZmlyc3QgPT09ICc/Jykge1xuICAgICAgICBpZiAoZXNjKSB7XG4gICAgICAgICAgcmV0dXJuIGVzYyArIGZpcnN0ICsgKHJlc3QgPyBRTUFSSy5yZXBlYXQocmVzdC5sZW5ndGgpIDogJycpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBxbWFya05vRG90ICsgKHJlc3QgPyBRTUFSSy5yZXBlYXQocmVzdC5sZW5ndGgpIDogJycpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBRTUFSSy5yZXBlYXQoY2hhcnMubGVuZ3RoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGZpcnN0ID09PSAnLicpIHtcbiAgICAgICAgcmV0dXJuIERPVF9MSVRFUkFMLnJlcGVhdChjaGFycy5sZW5ndGgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZmlyc3QgPT09ICcqJykge1xuICAgICAgICBpZiAoZXNjKSB7XG4gICAgICAgICAgcmV0dXJuIGVzYyArIGZpcnN0ICsgKHJlc3QgPyBzdGFyIDogJycpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdGFyO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVzYyA/IG0gOiBgXFxcXCR7bX1gO1xuICAgIH0pO1xuXG4gICAgaWYgKGJhY2tzbGFzaGVzID09PSB0cnVlKSB7XG4gICAgICBpZiAob3B0cy51bmVzY2FwZSA9PT0gdHJ1ZSkge1xuICAgICAgICBvdXRwdXQgPSBvdXRwdXQucmVwbGFjZSgvXFxcXC9nLCAnJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXRwdXQgPSBvdXRwdXQucmVwbGFjZSgvXFxcXCsvZywgbSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG0ubGVuZ3RoICUgMiA9PT0gMCA/ICdcXFxcXFxcXCcgOiAobSA/ICdcXFxcJyA6ICcnKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG91dHB1dCA9PT0gaW5wdXQgJiYgb3B0cy5jb250YWlucyA9PT0gdHJ1ZSkge1xuICAgICAgc3RhdGUub3V0cHV0ID0gaW5wdXQ7XG4gICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxuXG4gICAgc3RhdGUub3V0cHV0ID0gdXRpbHMud3JhcE91dHB1dChvdXRwdXQsIHN0YXRlLCBvcHRpb25zKTtcbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICAvKipcbiAgICogVG9rZW5pemUgaW5wdXQgdW50aWwgd2UgcmVhY2ggZW5kLW9mLXN0cmluZ1xuICAgKi9cblxuICB3aGlsZSAoIWVvcygpKSB7XG4gICAgdmFsdWUgPSBhZHZhbmNlKCk7XG5cbiAgICBpZiAodmFsdWUgPT09ICdcXHUwMDAwJykge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXNjYXBlZCBjaGFyYWN0ZXJzXG4gICAgICovXG5cbiAgICBpZiAodmFsdWUgPT09ICdcXFxcJykge1xuICAgICAgY29uc3QgbmV4dCA9IHBlZWsoKTtcblxuICAgICAgaWYgKG5leHQgPT09ICcvJyAmJiBvcHRzLmJhc2ggIT09IHRydWUpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChuZXh0ID09PSAnLicgfHwgbmV4dCA9PT0gJzsnKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIW5leHQpIHtcbiAgICAgICAgdmFsdWUgKz0gJ1xcXFwnO1xuICAgICAgICBwdXNoKHsgdHlwZTogJ3RleHQnLCB2YWx1ZSB9KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGNvbGxhcHNlIHNsYXNoZXMgdG8gcmVkdWNlIHBvdGVudGlhbCBmb3IgZXhwbG9pdHNcbiAgICAgIGNvbnN0IG1hdGNoID0gL15cXFxcKy8uZXhlYyhyZW1haW5pbmcoKSk7XG4gICAgICBsZXQgc2xhc2hlcyA9IDA7XG5cbiAgICAgIGlmIChtYXRjaCAmJiBtYXRjaFswXS5sZW5ndGggPiAyKSB7XG4gICAgICAgIHNsYXNoZXMgPSBtYXRjaFswXS5sZW5ndGg7XG4gICAgICAgIHN0YXRlLmluZGV4ICs9IHNsYXNoZXM7XG4gICAgICAgIGlmIChzbGFzaGVzICUgMiAhPT0gMCkge1xuICAgICAgICAgIHZhbHVlICs9ICdcXFxcJztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAob3B0cy51bmVzY2FwZSA9PT0gdHJ1ZSkge1xuICAgICAgICB2YWx1ZSA9IGFkdmFuY2UoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlICs9IGFkdmFuY2UoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlLmJyYWNrZXRzID09PSAwKSB7XG4gICAgICAgIHB1c2goeyB0eXBlOiAndGV4dCcsIHZhbHVlIH0pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJZiB3ZSdyZSBpbnNpZGUgYSByZWdleCBjaGFyYWN0ZXIgY2xhc3MsIGNvbnRpbnVlXG4gICAgICogdW50aWwgd2UgcmVhY2ggdGhlIGNsb3NpbmcgYnJhY2tldC5cbiAgICAgKi9cblxuICAgIGlmIChzdGF0ZS5icmFja2V0cyA+IDAgJiYgKHZhbHVlICE9PSAnXScgfHwgcHJldi52YWx1ZSA9PT0gJ1snIHx8IHByZXYudmFsdWUgPT09ICdbXicpKSB7XG4gICAgICBpZiAob3B0cy5wb3NpeCAhPT0gZmFsc2UgJiYgdmFsdWUgPT09ICc6Jykge1xuICAgICAgICBjb25zdCBpbm5lciA9IHByZXYudmFsdWUuc2xpY2UoMSk7XG4gICAgICAgIGlmIChpbm5lci5pbmNsdWRlcygnWycpKSB7XG4gICAgICAgICAgcHJldi5wb3NpeCA9IHRydWU7XG5cbiAgICAgICAgICBpZiAoaW5uZXIuaW5jbHVkZXMoJzonKSkge1xuICAgICAgICAgICAgY29uc3QgaWR4ID0gcHJldi52YWx1ZS5sYXN0SW5kZXhPZignWycpO1xuICAgICAgICAgICAgY29uc3QgcHJlID0gcHJldi52YWx1ZS5zbGljZSgwLCBpZHgpO1xuICAgICAgICAgICAgY29uc3QgcmVzdCA9IHByZXYudmFsdWUuc2xpY2UoaWR4ICsgMik7XG4gICAgICAgICAgICBjb25zdCBwb3NpeCA9IFBPU0lYX1JFR0VYX1NPVVJDRVtyZXN0XTtcbiAgICAgICAgICAgIGlmIChwb3NpeCkge1xuICAgICAgICAgICAgICBwcmV2LnZhbHVlID0gcHJlICsgcG9zaXg7XG4gICAgICAgICAgICAgIHN0YXRlLmJhY2t0cmFjayA9IHRydWU7XG4gICAgICAgICAgICAgIGFkdmFuY2UoKTtcblxuICAgICAgICAgICAgICBpZiAoIWJvcy5vdXRwdXQgJiYgdG9rZW5zLmluZGV4T2YocHJldikgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBib3Mub3V0cHV0ID0gT05FX0NIQVI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICgodmFsdWUgPT09ICdbJyAmJiBwZWVrKCkgIT09ICc6JykgfHwgKHZhbHVlID09PSAnLScgJiYgcGVlaygpID09PSAnXScpKSB7XG4gICAgICAgIHZhbHVlID0gYFxcXFwke3ZhbHVlfWA7XG4gICAgICB9XG5cbiAgICAgIGlmICh2YWx1ZSA9PT0gJ10nICYmIChwcmV2LnZhbHVlID09PSAnWycgfHwgcHJldi52YWx1ZSA9PT0gJ1teJykpIHtcbiAgICAgICAgdmFsdWUgPSBgXFxcXCR7dmFsdWV9YDtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdHMucG9zaXggPT09IHRydWUgJiYgdmFsdWUgPT09ICchJyAmJiBwcmV2LnZhbHVlID09PSAnWycpIHtcbiAgICAgICAgdmFsdWUgPSAnXic7XG4gICAgICB9XG5cbiAgICAgIHByZXYudmFsdWUgKz0gdmFsdWU7XG4gICAgICBhcHBlbmQoeyB2YWx1ZSB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIElmIHdlJ3JlIGluc2lkZSBhIHF1b3RlZCBzdHJpbmcsIGNvbnRpbnVlXG4gICAgICogdW50aWwgd2UgcmVhY2ggdGhlIGNsb3NpbmcgZG91YmxlIHF1b3RlLlxuICAgICAqL1xuXG4gICAgaWYgKHN0YXRlLnF1b3RlcyA9PT0gMSAmJiB2YWx1ZSAhPT0gJ1wiJykge1xuICAgICAgdmFsdWUgPSB1dGlscy5lc2NhcGVSZWdleCh2YWx1ZSk7XG4gICAgICBwcmV2LnZhbHVlICs9IHZhbHVlO1xuICAgICAgYXBwZW5kKHsgdmFsdWUgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEb3VibGUgcXVvdGVzXG4gICAgICovXG5cbiAgICBpZiAodmFsdWUgPT09ICdcIicpIHtcbiAgICAgIHN0YXRlLnF1b3RlcyA9IHN0YXRlLnF1b3RlcyA9PT0gMSA/IDAgOiAxO1xuICAgICAgaWYgKG9wdHMua2VlcFF1b3RlcyA9PT0gdHJ1ZSkge1xuICAgICAgICBwdXNoKHsgdHlwZTogJ3RleHQnLCB2YWx1ZSB9KTtcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBhcmVudGhlc2VzXG4gICAgICovXG5cbiAgICBpZiAodmFsdWUgPT09ICcoJykge1xuICAgICAgaW5jcmVtZW50KCdwYXJlbnMnKTtcbiAgICAgIHB1c2goeyB0eXBlOiAncGFyZW4nLCB2YWx1ZSB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZSA9PT0gJyknKSB7XG4gICAgICBpZiAoc3RhdGUucGFyZW5zID09PSAwICYmIG9wdHMuc3RyaWN0QnJhY2tldHMgPT09IHRydWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKHN5bnRheEVycm9yKCdvcGVuaW5nJywgJygnKSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGV4dGdsb2IgPSBleHRnbG9ic1tleHRnbG9icy5sZW5ndGggLSAxXTtcbiAgICAgIGlmIChleHRnbG9iICYmIHN0YXRlLnBhcmVucyA9PT0gZXh0Z2xvYi5wYXJlbnMgKyAxKSB7XG4gICAgICAgIGV4dGdsb2JDbG9zZShleHRnbG9icy5wb3AoKSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBwdXNoKHsgdHlwZTogJ3BhcmVuJywgdmFsdWUsIG91dHB1dDogc3RhdGUucGFyZW5zID8gJyknIDogJ1xcXFwpJyB9KTtcbiAgICAgIGRlY3JlbWVudCgncGFyZW5zJyk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTcXVhcmUgYnJhY2tldHNcbiAgICAgKi9cblxuICAgIGlmICh2YWx1ZSA9PT0gJ1snKSB7XG4gICAgICBpZiAob3B0cy5ub2JyYWNrZXQgPT09IHRydWUgfHwgIXJlbWFpbmluZygpLmluY2x1ZGVzKCddJykpIHtcbiAgICAgICAgaWYgKG9wdHMubm9icmFja2V0ICE9PSB0cnVlICYmIG9wdHMuc3RyaWN0QnJhY2tldHMgPT09IHRydWUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3Ioc3ludGF4RXJyb3IoJ2Nsb3NpbmcnLCAnXScpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhbHVlID0gYFxcXFwke3ZhbHVlfWA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmNyZW1lbnQoJ2JyYWNrZXRzJyk7XG4gICAgICB9XG5cbiAgICAgIHB1c2goeyB0eXBlOiAnYnJhY2tldCcsIHZhbHVlIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHZhbHVlID09PSAnXScpIHtcbiAgICAgIGlmIChvcHRzLm5vYnJhY2tldCA9PT0gdHJ1ZSB8fCAocHJldiAmJiBwcmV2LnR5cGUgPT09ICdicmFja2V0JyAmJiBwcmV2LnZhbHVlLmxlbmd0aCA9PT0gMSkpIHtcbiAgICAgICAgcHVzaCh7IHR5cGU6ICd0ZXh0JywgdmFsdWUsIG91dHB1dDogYFxcXFwke3ZhbHVlfWAgfSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUuYnJhY2tldHMgPT09IDApIHtcbiAgICAgICAgaWYgKG9wdHMuc3RyaWN0QnJhY2tldHMgPT09IHRydWUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3Ioc3ludGF4RXJyb3IoJ29wZW5pbmcnLCAnWycpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHB1c2goeyB0eXBlOiAndGV4dCcsIHZhbHVlLCBvdXRwdXQ6IGBcXFxcJHt2YWx1ZX1gIH0pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgZGVjcmVtZW50KCdicmFja2V0cycpO1xuXG4gICAgICBjb25zdCBwcmV2VmFsdWUgPSBwcmV2LnZhbHVlLnNsaWNlKDEpO1xuICAgICAgaWYgKHByZXYucG9zaXggIT09IHRydWUgJiYgcHJldlZhbHVlWzBdID09PSAnXicgJiYgIXByZXZWYWx1ZS5pbmNsdWRlcygnLycpKSB7XG4gICAgICAgIHZhbHVlID0gYC8ke3ZhbHVlfWA7XG4gICAgICB9XG5cbiAgICAgIHByZXYudmFsdWUgKz0gdmFsdWU7XG4gICAgICBhcHBlbmQoeyB2YWx1ZSB9KTtcblxuICAgICAgLy8gd2hlbiBsaXRlcmFsIGJyYWNrZXRzIGFyZSBleHBsaWNpdGx5IGRpc2FibGVkXG4gICAgICAvLyBhc3N1bWUgd2Ugc2hvdWxkIG1hdGNoIHdpdGggYSByZWdleCBjaGFyYWN0ZXIgY2xhc3NcbiAgICAgIGlmIChvcHRzLmxpdGVyYWxCcmFja2V0cyA9PT0gZmFsc2UgfHwgdXRpbHMuaGFzUmVnZXhDaGFycyhwcmV2VmFsdWUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBlc2NhcGVkID0gdXRpbHMuZXNjYXBlUmVnZXgocHJldi52YWx1ZSk7XG4gICAgICBzdGF0ZS5vdXRwdXQgPSBzdGF0ZS5vdXRwdXQuc2xpY2UoMCwgLXByZXYudmFsdWUubGVuZ3RoKTtcblxuICAgICAgLy8gd2hlbiBsaXRlcmFsIGJyYWNrZXRzIGFyZSBleHBsaWNpdGx5IGVuYWJsZWRcbiAgICAgIC8vIGFzc3VtZSB3ZSBzaG91bGQgZXNjYXBlIHRoZSBicmFja2V0cyB0byBtYXRjaCBsaXRlcmFsIGNoYXJhY3RlcnNcbiAgICAgIGlmIChvcHRzLmxpdGVyYWxCcmFja2V0cyA9PT0gdHJ1ZSkge1xuICAgICAgICBzdGF0ZS5vdXRwdXQgKz0gZXNjYXBlZDtcbiAgICAgICAgcHJldi52YWx1ZSA9IGVzY2FwZWQ7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyB3aGVuIHRoZSB1c2VyIHNwZWNpZmllcyBub3RoaW5nLCB0cnkgdG8gbWF0Y2ggYm90aFxuICAgICAgcHJldi52YWx1ZSA9IGAoJHtjYXB0dXJlfSR7ZXNjYXBlZH18JHtwcmV2LnZhbHVlfSlgO1xuICAgICAgc3RhdGUub3V0cHV0ICs9IHByZXYudmFsdWU7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCcmFjZXNcbiAgICAgKi9cblxuICAgIGlmICh2YWx1ZSA9PT0gJ3snICYmIG9wdHMubm9icmFjZSAhPT0gdHJ1ZSkge1xuICAgICAgaW5jcmVtZW50KCdicmFjZXMnKTtcblxuICAgICAgY29uc3Qgb3BlbiA9IHtcbiAgICAgICAgdHlwZTogJ2JyYWNlJyxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIG91dHB1dDogJygnLFxuICAgICAgICBvdXRwdXRJbmRleDogc3RhdGUub3V0cHV0Lmxlbmd0aCxcbiAgICAgICAgdG9rZW5zSW5kZXg6IHN0YXRlLnRva2Vucy5sZW5ndGhcbiAgICAgIH07XG5cbiAgICAgIGJyYWNlcy5wdXNoKG9wZW4pO1xuICAgICAgcHVzaChvcGVuKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZSA9PT0gJ30nKSB7XG4gICAgICBjb25zdCBicmFjZSA9IGJyYWNlc1ticmFjZXMubGVuZ3RoIC0gMV07XG5cbiAgICAgIGlmIChvcHRzLm5vYnJhY2UgPT09IHRydWUgfHwgIWJyYWNlKSB7XG4gICAgICAgIHB1c2goeyB0eXBlOiAndGV4dCcsIHZhbHVlLCBvdXRwdXQ6IHZhbHVlIH0pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgbGV0IG91dHB1dCA9ICcpJztcblxuICAgICAgaWYgKGJyYWNlLmRvdHMgPT09IHRydWUpIHtcbiAgICAgICAgY29uc3QgYXJyID0gdG9rZW5zLnNsaWNlKCk7XG4gICAgICAgIGNvbnN0IHJhbmdlID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IGFyci5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIHRva2Vucy5wb3AoKTtcbiAgICAgICAgICBpZiAoYXJyW2ldLnR5cGUgPT09ICdicmFjZScpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoYXJyW2ldLnR5cGUgIT09ICdkb3RzJykge1xuICAgICAgICAgICAgcmFuZ2UudW5zaGlmdChhcnJbaV0udmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIG91dHB1dCA9IGV4cGFuZFJhbmdlKHJhbmdlLCBvcHRzKTtcbiAgICAgICAgc3RhdGUuYmFja3RyYWNrID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGJyYWNlLmNvbW1hICE9PSB0cnVlICYmIGJyYWNlLmRvdHMgIT09IHRydWUpIHtcbiAgICAgICAgY29uc3Qgb3V0ID0gc3RhdGUub3V0cHV0LnNsaWNlKDAsIGJyYWNlLm91dHB1dEluZGV4KTtcbiAgICAgICAgY29uc3QgdG9rcyA9IHN0YXRlLnRva2Vucy5zbGljZShicmFjZS50b2tlbnNJbmRleCk7XG4gICAgICAgIGJyYWNlLnZhbHVlID0gYnJhY2Uub3V0cHV0ID0gJ1xcXFx7JztcbiAgICAgICAgdmFsdWUgPSBvdXRwdXQgPSAnXFxcXH0nO1xuICAgICAgICBzdGF0ZS5vdXRwdXQgPSBvdXQ7XG4gICAgICAgIGZvciAoY29uc3QgdCBvZiB0b2tzKSB7XG4gICAgICAgICAgc3RhdGUub3V0cHV0ICs9ICh0Lm91dHB1dCB8fCB0LnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBwdXNoKHsgdHlwZTogJ2JyYWNlJywgdmFsdWUsIG91dHB1dCB9KTtcbiAgICAgIGRlY3JlbWVudCgnYnJhY2VzJyk7XG4gICAgICBicmFjZXMucG9wKCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQaXBlc1xuICAgICAqL1xuXG4gICAgaWYgKHZhbHVlID09PSAnfCcpIHtcbiAgICAgIGlmIChleHRnbG9icy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGV4dGdsb2JzW2V4dGdsb2JzLmxlbmd0aCAtIDFdLmNvbmRpdGlvbnMrKztcbiAgICAgIH1cbiAgICAgIHB1c2goeyB0eXBlOiAndGV4dCcsIHZhbHVlIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tbWFzXG4gICAgICovXG5cbiAgICBpZiAodmFsdWUgPT09ICcsJykge1xuICAgICAgbGV0IG91dHB1dCA9IHZhbHVlO1xuXG4gICAgICBjb25zdCBicmFjZSA9IGJyYWNlc1ticmFjZXMubGVuZ3RoIC0gMV07XG4gICAgICBpZiAoYnJhY2UgJiYgc3RhY2tbc3RhY2subGVuZ3RoIC0gMV0gPT09ICdicmFjZXMnKSB7XG4gICAgICAgIGJyYWNlLmNvbW1hID0gdHJ1ZTtcbiAgICAgICAgb3V0cHV0ID0gJ3wnO1xuICAgICAgfVxuXG4gICAgICBwdXNoKHsgdHlwZTogJ2NvbW1hJywgdmFsdWUsIG91dHB1dCB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNsYXNoZXNcbiAgICAgKi9cblxuICAgIGlmICh2YWx1ZSA9PT0gJy8nKSB7XG4gICAgICAvLyBpZiB0aGUgYmVnaW5uaW5nIG9mIHRoZSBnbG9iIGlzIFwiLi9cIiwgYWR2YW5jZSB0aGUgc3RhcnRcbiAgICAgIC8vIHRvIHRoZSBjdXJyZW50IGluZGV4LCBhbmQgZG9uJ3QgYWRkIHRoZSBcIi4vXCIgY2hhcmFjdGVyc1xuICAgICAgLy8gdG8gdGhlIHN0YXRlLiBUaGlzIGdyZWF0bHkgc2ltcGxpZmllcyBsb29rYmVoaW5kcyB3aGVuXG4gICAgICAvLyBjaGVja2luZyBmb3IgQk9TIGNoYXJhY3RlcnMgbGlrZSBcIiFcIiBhbmQgXCIuXCIgKG5vdCBcIi4vXCIpXG4gICAgICBpZiAocHJldi50eXBlID09PSAnZG90JyAmJiBzdGF0ZS5pbmRleCA9PT0gc3RhdGUuc3RhcnQgKyAxKSB7XG4gICAgICAgIHN0YXRlLnN0YXJ0ID0gc3RhdGUuaW5kZXggKyAxO1xuICAgICAgICBzdGF0ZS5jb25zdW1lZCA9ICcnO1xuICAgICAgICBzdGF0ZS5vdXRwdXQgPSAnJztcbiAgICAgICAgdG9rZW5zLnBvcCgpO1xuICAgICAgICBwcmV2ID0gYm9zOyAvLyByZXNldCBcInByZXZcIiB0byB0aGUgZmlyc3QgdG9rZW5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHB1c2goeyB0eXBlOiAnc2xhc2gnLCB2YWx1ZSwgb3V0cHV0OiBTTEFTSF9MSVRFUkFMIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRG90c1xuICAgICAqL1xuXG4gICAgaWYgKHZhbHVlID09PSAnLicpIHtcbiAgICAgIGlmIChzdGF0ZS5icmFjZXMgPiAwICYmIHByZXYudHlwZSA9PT0gJ2RvdCcpIHtcbiAgICAgICAgaWYgKHByZXYudmFsdWUgPT09ICcuJykgcHJldi5vdXRwdXQgPSBET1RfTElURVJBTDtcbiAgICAgICAgY29uc3QgYnJhY2UgPSBicmFjZXNbYnJhY2VzLmxlbmd0aCAtIDFdO1xuICAgICAgICBwcmV2LnR5cGUgPSAnZG90cyc7XG4gICAgICAgIHByZXYub3V0cHV0ICs9IHZhbHVlO1xuICAgICAgICBwcmV2LnZhbHVlICs9IHZhbHVlO1xuICAgICAgICBicmFjZS5kb3RzID0gdHJ1ZTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmICgoc3RhdGUuYnJhY2VzICsgc3RhdGUucGFyZW5zKSA9PT0gMCAmJiBwcmV2LnR5cGUgIT09ICdib3MnICYmIHByZXYudHlwZSAhPT0gJ3NsYXNoJykge1xuICAgICAgICBwdXNoKHsgdHlwZTogJ3RleHQnLCB2YWx1ZSwgb3V0cHV0OiBET1RfTElURVJBTCB9KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHB1c2goeyB0eXBlOiAnZG90JywgdmFsdWUsIG91dHB1dDogRE9UX0xJVEVSQUwgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBRdWVzdGlvbiBtYXJrc1xuICAgICAqL1xuXG4gICAgaWYgKHZhbHVlID09PSAnPycpIHtcbiAgICAgIGNvbnN0IGlzR3JvdXAgPSBwcmV2ICYmIHByZXYudmFsdWUgPT09ICcoJztcbiAgICAgIGlmICghaXNHcm91cCAmJiBvcHRzLm5vZXh0Z2xvYiAhPT0gdHJ1ZSAmJiBwZWVrKCkgPT09ICcoJyAmJiBwZWVrKDIpICE9PSAnPycpIHtcbiAgICAgICAgZXh0Z2xvYk9wZW4oJ3FtYXJrJywgdmFsdWUpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHByZXYgJiYgcHJldi50eXBlID09PSAncGFyZW4nKSB7XG4gICAgICAgIGNvbnN0IG5leHQgPSBwZWVrKCk7XG4gICAgICAgIGxldCBvdXRwdXQgPSB2YWx1ZTtcblxuICAgICAgICBpZiAobmV4dCA9PT0gJzwnICYmICF1dGlscy5zdXBwb3J0c0xvb2tiZWhpbmRzKCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vZGUuanMgdjEwIG9yIGhpZ2hlciBpcyByZXF1aXJlZCBmb3IgcmVnZXggbG9va2JlaGluZHMnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgocHJldi52YWx1ZSA9PT0gJygnICYmICEvWyE9PDpdLy50ZXN0KG5leHQpKSB8fCAobmV4dCA9PT0gJzwnICYmICEvPChbIT1dfFxcdys+KS8udGVzdChyZW1haW5pbmcoKSkpKSB7XG4gICAgICAgICAgb3V0cHV0ID0gYFxcXFwke3ZhbHVlfWA7XG4gICAgICAgIH1cblxuICAgICAgICBwdXNoKHsgdHlwZTogJ3RleHQnLCB2YWx1ZSwgb3V0cHV0IH0pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdHMuZG90ICE9PSB0cnVlICYmIChwcmV2LnR5cGUgPT09ICdzbGFzaCcgfHwgcHJldi50eXBlID09PSAnYm9zJykpIHtcbiAgICAgICAgcHVzaCh7IHR5cGU6ICdxbWFyaycsIHZhbHVlLCBvdXRwdXQ6IFFNQVJLX05PX0RPVCB9KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHB1c2goeyB0eXBlOiAncW1hcmsnLCB2YWx1ZSwgb3V0cHV0OiBRTUFSSyB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4Y2xhbWF0aW9uXG4gICAgICovXG5cbiAgICBpZiAodmFsdWUgPT09ICchJykge1xuICAgICAgaWYgKG9wdHMubm9leHRnbG9iICE9PSB0cnVlICYmIHBlZWsoKSA9PT0gJygnKSB7XG4gICAgICAgIGlmIChwZWVrKDIpICE9PSAnPycgfHwgIS9bIT08Ol0vLnRlc3QocGVlaygzKSkpIHtcbiAgICAgICAgICBleHRnbG9iT3BlbignbmVnYXRlJywgdmFsdWUpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRzLm5vbmVnYXRlICE9PSB0cnVlICYmIHN0YXRlLmluZGV4ID09PSAwKSB7XG4gICAgICAgIG5lZ2F0ZSgpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQbHVzXG4gICAgICovXG5cbiAgICBpZiAodmFsdWUgPT09ICcrJykge1xuICAgICAgaWYgKG9wdHMubm9leHRnbG9iICE9PSB0cnVlICYmIHBlZWsoKSA9PT0gJygnICYmIHBlZWsoMikgIT09ICc/Jykge1xuICAgICAgICBleHRnbG9iT3BlbigncGx1cycsIHZhbHVlKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmICgocHJldiAmJiBwcmV2LnZhbHVlID09PSAnKCcpIHx8IG9wdHMucmVnZXggPT09IGZhbHNlKSB7XG4gICAgICAgIHB1c2goeyB0eXBlOiAncGx1cycsIHZhbHVlLCBvdXRwdXQ6IFBMVVNfTElURVJBTCB9KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmICgocHJldiAmJiAocHJldi50eXBlID09PSAnYnJhY2tldCcgfHwgcHJldi50eXBlID09PSAncGFyZW4nIHx8IHByZXYudHlwZSA9PT0gJ2JyYWNlJykpIHx8IHN0YXRlLnBhcmVucyA+IDApIHtcbiAgICAgICAgcHVzaCh7IHR5cGU6ICdwbHVzJywgdmFsdWUgfSk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBwdXNoKHsgdHlwZTogJ3BsdXMnLCB2YWx1ZTogUExVU19MSVRFUkFMIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGxhaW4gdGV4dFxuICAgICAqL1xuXG4gICAgaWYgKHZhbHVlID09PSAnQCcpIHtcbiAgICAgIGlmIChvcHRzLm5vZXh0Z2xvYiAhPT0gdHJ1ZSAmJiBwZWVrKCkgPT09ICcoJyAmJiBwZWVrKDIpICE9PSAnPycpIHtcbiAgICAgICAgcHVzaCh7IHR5cGU6ICdhdCcsIGV4dGdsb2I6IHRydWUsIHZhbHVlLCBvdXRwdXQ6ICcnIH0pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgcHVzaCh7IHR5cGU6ICd0ZXh0JywgdmFsdWUgfSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQbGFpbiB0ZXh0XG4gICAgICovXG5cbiAgICBpZiAodmFsdWUgIT09ICcqJykge1xuICAgICAgaWYgKHZhbHVlID09PSAnJCcgfHwgdmFsdWUgPT09ICdeJykge1xuICAgICAgICB2YWx1ZSA9IGBcXFxcJHt2YWx1ZX1gO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBtYXRjaCA9IFJFR0VYX05PTl9TUEVDSUFMX0NIQVJTLmV4ZWMocmVtYWluaW5nKCkpO1xuICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIHZhbHVlICs9IG1hdGNoWzBdO1xuICAgICAgICBzdGF0ZS5pbmRleCArPSBtYXRjaFswXS5sZW5ndGg7XG4gICAgICB9XG5cbiAgICAgIHB1c2goeyB0eXBlOiAndGV4dCcsIHZhbHVlIH0pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RhcnNcbiAgICAgKi9cblxuICAgIGlmIChwcmV2ICYmIChwcmV2LnR5cGUgPT09ICdnbG9ic3RhcicgfHwgcHJldi5zdGFyID09PSB0cnVlKSkge1xuICAgICAgcHJldi50eXBlID0gJ3N0YXInO1xuICAgICAgcHJldi5zdGFyID0gdHJ1ZTtcbiAgICAgIHByZXYudmFsdWUgKz0gdmFsdWU7XG4gICAgICBwcmV2Lm91dHB1dCA9IHN0YXI7XG4gICAgICBzdGF0ZS5iYWNrdHJhY2sgPSB0cnVlO1xuICAgICAgc3RhdGUuZ2xvYnN0YXIgPSB0cnVlO1xuICAgICAgY29uc3VtZSh2YWx1ZSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBsZXQgcmVzdCA9IHJlbWFpbmluZygpO1xuICAgIGlmIChvcHRzLm5vZXh0Z2xvYiAhPT0gdHJ1ZSAmJiAvXlxcKFteP10vLnRlc3QocmVzdCkpIHtcbiAgICAgIGV4dGdsb2JPcGVuKCdzdGFyJywgdmFsdWUpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHByZXYudHlwZSA9PT0gJ3N0YXInKSB7XG4gICAgICBpZiAob3B0cy5ub2dsb2JzdGFyID09PSB0cnVlKSB7XG4gICAgICAgIGNvbnN1bWUodmFsdWUpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcHJpb3IgPSBwcmV2LnByZXY7XG4gICAgICBjb25zdCBiZWZvcmUgPSBwcmlvci5wcmV2O1xuICAgICAgY29uc3QgaXNTdGFydCA9IHByaW9yLnR5cGUgPT09ICdzbGFzaCcgfHwgcHJpb3IudHlwZSA9PT0gJ2Jvcyc7XG4gICAgICBjb25zdCBhZnRlclN0YXIgPSBiZWZvcmUgJiYgKGJlZm9yZS50eXBlID09PSAnc3RhcicgfHwgYmVmb3JlLnR5cGUgPT09ICdnbG9ic3RhcicpO1xuXG4gICAgICBpZiAob3B0cy5iYXNoID09PSB0cnVlICYmICghaXNTdGFydCB8fCAocmVzdFswXSAmJiByZXN0WzBdICE9PSAnLycpKSkge1xuICAgICAgICBwdXNoKHsgdHlwZTogJ3N0YXInLCB2YWx1ZSwgb3V0cHV0OiAnJyB9KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGlzQnJhY2UgPSBzdGF0ZS5icmFjZXMgPiAwICYmIChwcmlvci50eXBlID09PSAnY29tbWEnIHx8IHByaW9yLnR5cGUgPT09ICdicmFjZScpO1xuICAgICAgY29uc3QgaXNFeHRnbG9iID0gZXh0Z2xvYnMubGVuZ3RoICYmIChwcmlvci50eXBlID09PSAncGlwZScgfHwgcHJpb3IudHlwZSA9PT0gJ3BhcmVuJyk7XG4gICAgICBpZiAoIWlzU3RhcnQgJiYgcHJpb3IudHlwZSAhPT0gJ3BhcmVuJyAmJiAhaXNCcmFjZSAmJiAhaXNFeHRnbG9iKSB7XG4gICAgICAgIHB1c2goeyB0eXBlOiAnc3RhcicsIHZhbHVlLCBvdXRwdXQ6ICcnIH0pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gc3RyaXAgY29uc2VjdXRpdmUgYC8qKi9gXG4gICAgICB3aGlsZSAocmVzdC5zbGljZSgwLCAzKSA9PT0gJy8qKicpIHtcbiAgICAgICAgY29uc3QgYWZ0ZXIgPSBpbnB1dFtzdGF0ZS5pbmRleCArIDRdO1xuICAgICAgICBpZiAoYWZ0ZXIgJiYgYWZ0ZXIgIT09ICcvJykge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJlc3QgPSByZXN0LnNsaWNlKDMpO1xuICAgICAgICBjb25zdW1lKCcvKionLCAzKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHByaW9yLnR5cGUgPT09ICdib3MnICYmIGVvcygpKSB7XG4gICAgICAgIHByZXYudHlwZSA9ICdnbG9ic3Rhcic7XG4gICAgICAgIHByZXYudmFsdWUgKz0gdmFsdWU7XG4gICAgICAgIHByZXYub3V0cHV0ID0gZ2xvYnN0YXIob3B0cyk7XG4gICAgICAgIHN0YXRlLm91dHB1dCA9IHByZXYub3V0cHV0O1xuICAgICAgICBzdGF0ZS5nbG9ic3RhciA9IHRydWU7XG4gICAgICAgIGNvbnN1bWUodmFsdWUpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHByaW9yLnR5cGUgPT09ICdzbGFzaCcgJiYgcHJpb3IucHJldi50eXBlICE9PSAnYm9zJyAmJiAhYWZ0ZXJTdGFyICYmIGVvcygpKSB7XG4gICAgICAgIHN0YXRlLm91dHB1dCA9IHN0YXRlLm91dHB1dC5zbGljZSgwLCAtKHByaW9yLm91dHB1dCArIHByZXYub3V0cHV0KS5sZW5ndGgpO1xuICAgICAgICBwcmlvci5vdXRwdXQgPSBgKD86JHtwcmlvci5vdXRwdXR9YDtcblxuICAgICAgICBwcmV2LnR5cGUgPSAnZ2xvYnN0YXInO1xuICAgICAgICBwcmV2Lm91dHB1dCA9IGdsb2JzdGFyKG9wdHMpICsgKG9wdHMuc3RyaWN0U2xhc2hlcyA/ICcpJyA6ICd8JCknKTtcbiAgICAgICAgcHJldi52YWx1ZSArPSB2YWx1ZTtcbiAgICAgICAgc3RhdGUuZ2xvYnN0YXIgPSB0cnVlO1xuICAgICAgICBzdGF0ZS5vdXRwdXQgKz0gcHJpb3Iub3V0cHV0ICsgcHJldi5vdXRwdXQ7XG4gICAgICAgIGNvbnN1bWUodmFsdWUpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHByaW9yLnR5cGUgPT09ICdzbGFzaCcgJiYgcHJpb3IucHJldi50eXBlICE9PSAnYm9zJyAmJiByZXN0WzBdID09PSAnLycpIHtcbiAgICAgICAgY29uc3QgZW5kID0gcmVzdFsxXSAhPT0gdm9pZCAwID8gJ3wkJyA6ICcnO1xuXG4gICAgICAgIHN0YXRlLm91dHB1dCA9IHN0YXRlLm91dHB1dC5zbGljZSgwLCAtKHByaW9yLm91dHB1dCArIHByZXYub3V0cHV0KS5sZW5ndGgpO1xuICAgICAgICBwcmlvci5vdXRwdXQgPSBgKD86JHtwcmlvci5vdXRwdXR9YDtcblxuICAgICAgICBwcmV2LnR5cGUgPSAnZ2xvYnN0YXInO1xuICAgICAgICBwcmV2Lm91dHB1dCA9IGAke2dsb2JzdGFyKG9wdHMpfSR7U0xBU0hfTElURVJBTH18JHtTTEFTSF9MSVRFUkFMfSR7ZW5kfSlgO1xuICAgICAgICBwcmV2LnZhbHVlICs9IHZhbHVlO1xuXG4gICAgICAgIHN0YXRlLm91dHB1dCArPSBwcmlvci5vdXRwdXQgKyBwcmV2Lm91dHB1dDtcbiAgICAgICAgc3RhdGUuZ2xvYnN0YXIgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN1bWUodmFsdWUgKyBhZHZhbmNlKCkpO1xuXG4gICAgICAgIHB1c2goeyB0eXBlOiAnc2xhc2gnLCB2YWx1ZTogJy8nLCBvdXRwdXQ6ICcnIH0pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHByaW9yLnR5cGUgPT09ICdib3MnICYmIHJlc3RbMF0gPT09ICcvJykge1xuICAgICAgICBwcmV2LnR5cGUgPSAnZ2xvYnN0YXInO1xuICAgICAgICBwcmV2LnZhbHVlICs9IHZhbHVlO1xuICAgICAgICBwcmV2Lm91dHB1dCA9IGAoPzpefCR7U0xBU0hfTElURVJBTH18JHtnbG9ic3RhcihvcHRzKX0ke1NMQVNIX0xJVEVSQUx9KWA7XG4gICAgICAgIHN0YXRlLm91dHB1dCA9IHByZXYub3V0cHV0O1xuICAgICAgICBzdGF0ZS5nbG9ic3RhciA9IHRydWU7XG4gICAgICAgIGNvbnN1bWUodmFsdWUgKyBhZHZhbmNlKCkpO1xuICAgICAgICBwdXNoKHsgdHlwZTogJ3NsYXNoJywgdmFsdWU6ICcvJywgb3V0cHV0OiAnJyB9KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHJlbW92ZSBzaW5nbGUgc3RhciBmcm9tIG91dHB1dFxuICAgICAgc3RhdGUub3V0cHV0ID0gc3RhdGUub3V0cHV0LnNsaWNlKDAsIC1wcmV2Lm91dHB1dC5sZW5ndGgpO1xuXG4gICAgICAvLyByZXNldCBwcmV2aW91cyB0b2tlbiB0byBnbG9ic3RhclxuICAgICAgcHJldi50eXBlID0gJ2dsb2JzdGFyJztcbiAgICAgIHByZXYub3V0cHV0ID0gZ2xvYnN0YXIob3B0cyk7XG4gICAgICBwcmV2LnZhbHVlICs9IHZhbHVlO1xuXG4gICAgICAvLyByZXNldCBvdXRwdXQgd2l0aCBnbG9ic3RhclxuICAgICAgc3RhdGUub3V0cHV0ICs9IHByZXYub3V0cHV0O1xuICAgICAgc3RhdGUuZ2xvYnN0YXIgPSB0cnVlO1xuICAgICAgY29uc3VtZSh2YWx1ZSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjb25zdCB0b2tlbiA9IHsgdHlwZTogJ3N0YXInLCB2YWx1ZSwgb3V0cHV0OiBzdGFyIH07XG5cbiAgICBpZiAob3B0cy5iYXNoID09PSB0cnVlKSB7XG4gICAgICB0b2tlbi5vdXRwdXQgPSAnLio/JztcbiAgICAgIGlmIChwcmV2LnR5cGUgPT09ICdib3MnIHx8IHByZXYudHlwZSA9PT0gJ3NsYXNoJykge1xuICAgICAgICB0b2tlbi5vdXRwdXQgPSBub2RvdCArIHRva2VuLm91dHB1dDtcbiAgICAgIH1cbiAgICAgIHB1c2godG9rZW4pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKHByZXYgJiYgKHByZXYudHlwZSA9PT0gJ2JyYWNrZXQnIHx8IHByZXYudHlwZSA9PT0gJ3BhcmVuJykgJiYgb3B0cy5yZWdleCA9PT0gdHJ1ZSkge1xuICAgICAgdG9rZW4ub3V0cHV0ID0gdmFsdWU7XG4gICAgICBwdXNoKHRva2VuKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChzdGF0ZS5pbmRleCA9PT0gc3RhdGUuc3RhcnQgfHwgcHJldi50eXBlID09PSAnc2xhc2gnIHx8IHByZXYudHlwZSA9PT0gJ2RvdCcpIHtcbiAgICAgIGlmIChwcmV2LnR5cGUgPT09ICdkb3QnKSB7XG4gICAgICAgIHN0YXRlLm91dHB1dCArPSBOT19ET1RfU0xBU0g7XG4gICAgICAgIHByZXYub3V0cHV0ICs9IE5PX0RPVF9TTEFTSDtcblxuICAgICAgfSBlbHNlIGlmIChvcHRzLmRvdCA9PT0gdHJ1ZSkge1xuICAgICAgICBzdGF0ZS5vdXRwdXQgKz0gTk9fRE9UU19TTEFTSDtcbiAgICAgICAgcHJldi5vdXRwdXQgKz0gTk9fRE9UU19TTEFTSDtcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhdGUub3V0cHV0ICs9IG5vZG90O1xuICAgICAgICBwcmV2Lm91dHB1dCArPSBub2RvdDtcbiAgICAgIH1cblxuICAgICAgaWYgKHBlZWsoKSAhPT0gJyonKSB7XG4gICAgICAgIHN0YXRlLm91dHB1dCArPSBPTkVfQ0hBUjtcbiAgICAgICAgcHJldi5vdXRwdXQgKz0gT05FX0NIQVI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcHVzaCh0b2tlbik7XG4gIH1cblxuICB3aGlsZSAoc3RhdGUuYnJhY2tldHMgPiAwKSB7XG4gICAgaWYgKG9wdHMuc3RyaWN0QnJhY2tldHMgPT09IHRydWUpIHRocm93IG5ldyBTeW50YXhFcnJvcihzeW50YXhFcnJvcignY2xvc2luZycsICddJykpO1xuICAgIHN0YXRlLm91dHB1dCA9IHV0aWxzLmVzY2FwZUxhc3Qoc3RhdGUub3V0cHV0LCAnWycpO1xuICAgIGRlY3JlbWVudCgnYnJhY2tldHMnKTtcbiAgfVxuXG4gIHdoaWxlIChzdGF0ZS5wYXJlbnMgPiAwKSB7XG4gICAgaWYgKG9wdHMuc3RyaWN0QnJhY2tldHMgPT09IHRydWUpIHRocm93IG5ldyBTeW50YXhFcnJvcihzeW50YXhFcnJvcignY2xvc2luZycsICcpJykpO1xuICAgIHN0YXRlLm91dHB1dCA9IHV0aWxzLmVzY2FwZUxhc3Qoc3RhdGUub3V0cHV0LCAnKCcpO1xuICAgIGRlY3JlbWVudCgncGFyZW5zJyk7XG4gIH1cblxuICB3aGlsZSAoc3RhdGUuYnJhY2VzID4gMCkge1xuICAgIGlmIChvcHRzLnN0cmljdEJyYWNrZXRzID09PSB0cnVlKSB0aHJvdyBuZXcgU3ludGF4RXJyb3Ioc3ludGF4RXJyb3IoJ2Nsb3NpbmcnLCAnfScpKTtcbiAgICBzdGF0ZS5vdXRwdXQgPSB1dGlscy5lc2NhcGVMYXN0KHN0YXRlLm91dHB1dCwgJ3snKTtcbiAgICBkZWNyZW1lbnQoJ2JyYWNlcycpO1xuICB9XG5cbiAgaWYgKG9wdHMuc3RyaWN0U2xhc2hlcyAhPT0gdHJ1ZSAmJiAocHJldi50eXBlID09PSAnc3RhcicgfHwgcHJldi50eXBlID09PSAnYnJhY2tldCcpKSB7XG4gICAgcHVzaCh7IHR5cGU6ICdtYXliZV9zbGFzaCcsIHZhbHVlOiAnJywgb3V0cHV0OiBgJHtTTEFTSF9MSVRFUkFMfT9gIH0pO1xuICB9XG5cbiAgLy8gcmVidWlsZCB0aGUgb3V0cHV0IGlmIHdlIGhhZCB0byBiYWNrdHJhY2sgYXQgYW55IHBvaW50XG4gIGlmIChzdGF0ZS5iYWNrdHJhY2sgPT09IHRydWUpIHtcbiAgICBzdGF0ZS5vdXRwdXQgPSAnJztcblxuICAgIGZvciAoY29uc3QgdG9rZW4gb2Ygc3RhdGUudG9rZW5zKSB7XG4gICAgICBzdGF0ZS5vdXRwdXQgKz0gdG9rZW4ub3V0cHV0ICE9IG51bGwgPyB0b2tlbi5vdXRwdXQgOiB0b2tlbi52YWx1ZTtcblxuICAgICAgaWYgKHRva2VuLnN1ZmZpeCkge1xuICAgICAgICBzdGF0ZS5vdXRwdXQgKz0gdG9rZW4uc3VmZml4O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdGF0ZTtcbn07XG5cbi8qKlxuICogRmFzdCBwYXRocyBmb3IgY3JlYXRpbmcgcmVndWxhciBleHByZXNzaW9ucyBmb3IgY29tbW9uIGdsb2IgcGF0dGVybnMuXG4gKiBUaGlzIGNhbiBzaWduaWZpY2FudGx5IHNwZWVkIHVwIHByb2Nlc3NpbmcgYW5kIGhhcyB2ZXJ5IGxpdHRsZSBkb3duc2lkZVxuICogaW1wYWN0IHdoZW4gbm9uZSBvZiB0aGUgZmFzdCBwYXRocyBtYXRjaC5cbiAqL1xuXG5wYXJzZS5mYXN0cGF0aHMgPSAoaW5wdXQsIG9wdGlvbnMpID0+IHtcbiAgY29uc3Qgb3B0cyA9IHsgLi4ub3B0aW9ucyB9O1xuICBjb25zdCBtYXggPSB0eXBlb2Ygb3B0cy5tYXhMZW5ndGggPT09ICdudW1iZXInID8gTWF0aC5taW4oTUFYX0xFTkdUSCwgb3B0cy5tYXhMZW5ndGgpIDogTUFYX0xFTkdUSDtcbiAgY29uc3QgbGVuID0gaW5wdXQubGVuZ3RoO1xuICBpZiAobGVuID4gbWF4KSB7XG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBJbnB1dCBsZW5ndGg6ICR7bGVufSwgZXhjZWVkcyBtYXhpbXVtIGFsbG93ZWQgbGVuZ3RoOiAke21heH1gKTtcbiAgfVxuXG4gIGlucHV0ID0gUkVQTEFDRU1FTlRTW2lucHV0XSB8fCBpbnB1dDtcbiAgY29uc3Qgd2luMzIgPSB1dGlscy5pc1dpbmRvd3Mob3B0aW9ucyk7XG5cbiAgLy8gY3JlYXRlIGNvbnN0YW50cyBiYXNlZCBvbiBwbGF0Zm9ybSwgZm9yIHdpbmRvd3Mgb3IgcG9zaXhcbiAgY29uc3Qge1xuICAgIERPVF9MSVRFUkFMLFxuICAgIFNMQVNIX0xJVEVSQUwsXG4gICAgT05FX0NIQVIsXG4gICAgRE9UU19TTEFTSCxcbiAgICBOT19ET1QsXG4gICAgTk9fRE9UUyxcbiAgICBOT19ET1RTX1NMQVNILFxuICAgIFNUQVIsXG4gICAgU1RBUlRfQU5DSE9SXG4gIH0gPSBjb25zdGFudHMuZ2xvYkNoYXJzKHdpbjMyKTtcblxuICBjb25zdCBub2RvdCA9IG9wdHMuZG90ID8gTk9fRE9UUyA6IE5PX0RPVDtcbiAgY29uc3Qgc2xhc2hEb3QgPSBvcHRzLmRvdCA/IE5PX0RPVFNfU0xBU0ggOiBOT19ET1Q7XG4gIGNvbnN0IGNhcHR1cmUgPSBvcHRzLmNhcHR1cmUgPyAnJyA6ICc/Oic7XG4gIGNvbnN0IHN0YXRlID0geyBuZWdhdGVkOiBmYWxzZSwgcHJlZml4OiAnJyB9O1xuICBsZXQgc3RhciA9IG9wdHMuYmFzaCA9PT0gdHJ1ZSA/ICcuKj8nIDogU1RBUjtcblxuICBpZiAob3B0cy5jYXB0dXJlKSB7XG4gICAgc3RhciA9IGAoJHtzdGFyfSlgO1xuICB9XG5cbiAgY29uc3QgZ2xvYnN0YXIgPSBvcHRzID0+IHtcbiAgICBpZiAob3B0cy5ub2dsb2JzdGFyID09PSB0cnVlKSByZXR1cm4gc3RhcjtcbiAgICByZXR1cm4gYCgke2NhcHR1cmV9KD86KD8hJHtTVEFSVF9BTkNIT1J9JHtvcHRzLmRvdCA/IERPVFNfU0xBU0ggOiBET1RfTElURVJBTH0pLikqPylgO1xuICB9O1xuXG4gIGNvbnN0IGNyZWF0ZSA9IHN0ciA9PiB7XG4gICAgc3dpdGNoIChzdHIpIHtcbiAgICAgIGNhc2UgJyonOlxuICAgICAgICByZXR1cm4gYCR7bm9kb3R9JHtPTkVfQ0hBUn0ke3N0YXJ9YDtcblxuICAgICAgY2FzZSAnLionOlxuICAgICAgICByZXR1cm4gYCR7RE9UX0xJVEVSQUx9JHtPTkVfQ0hBUn0ke3N0YXJ9YDtcblxuICAgICAgY2FzZSAnKi4qJzpcbiAgICAgICAgcmV0dXJuIGAke25vZG90fSR7c3Rhcn0ke0RPVF9MSVRFUkFMfSR7T05FX0NIQVJ9JHtzdGFyfWA7XG5cbiAgICAgIGNhc2UgJyovKic6XG4gICAgICAgIHJldHVybiBgJHtub2RvdH0ke3N0YXJ9JHtTTEFTSF9MSVRFUkFMfSR7T05FX0NIQVJ9JHtzbGFzaERvdH0ke3N0YXJ9YDtcblxuICAgICAgY2FzZSAnKionOlxuICAgICAgICByZXR1cm4gbm9kb3QgKyBnbG9ic3RhcihvcHRzKTtcblxuICAgICAgY2FzZSAnKiovKic6XG4gICAgICAgIHJldHVybiBgKD86JHtub2RvdH0ke2dsb2JzdGFyKG9wdHMpfSR7U0xBU0hfTElURVJBTH0pPyR7c2xhc2hEb3R9JHtPTkVfQ0hBUn0ke3N0YXJ9YDtcblxuICAgICAgY2FzZSAnKiovKi4qJzpcbiAgICAgICAgcmV0dXJuIGAoPzoke25vZG90fSR7Z2xvYnN0YXIob3B0cyl9JHtTTEFTSF9MSVRFUkFMfSk/JHtzbGFzaERvdH0ke3N0YXJ9JHtET1RfTElURVJBTH0ke09ORV9DSEFSfSR7c3Rhcn1gO1xuXG4gICAgICBjYXNlICcqKi8uKic6XG4gICAgICAgIHJldHVybiBgKD86JHtub2RvdH0ke2dsb2JzdGFyKG9wdHMpfSR7U0xBU0hfTElURVJBTH0pPyR7RE9UX0xJVEVSQUx9JHtPTkVfQ0hBUn0ke3N0YXJ9YDtcblxuICAgICAgZGVmYXVsdDoge1xuICAgICAgICBjb25zdCBtYXRjaCA9IC9eKC4qPylcXC4oXFx3KykkLy5leGVjKHN0cik7XG4gICAgICAgIGlmICghbWF0Y2gpIHJldHVybjtcblxuICAgICAgICBjb25zdCBzb3VyY2UgPSBjcmVhdGUobWF0Y2hbMV0pO1xuICAgICAgICBpZiAoIXNvdXJjZSkgcmV0dXJuO1xuXG4gICAgICAgIHJldHVybiBzb3VyY2UgKyBET1RfTElURVJBTCArIG1hdGNoWzJdO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBjb25zdCBvdXRwdXQgPSB1dGlscy5yZW1vdmVQcmVmaXgoaW5wdXQsIHN0YXRlKTtcbiAgbGV0IHNvdXJjZSA9IGNyZWF0ZShvdXRwdXQpO1xuXG4gIGlmIChzb3VyY2UgJiYgb3B0cy5zdHJpY3RTbGFzaGVzICE9PSB0cnVlKSB7XG4gICAgc291cmNlICs9IGAke1NMQVNIX0xJVEVSQUx9P2A7XG4gIH1cblxuICByZXR1cm4gc291cmNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHNjYW4gPSByZXF1aXJlKCcuL3NjYW4nKTtcbmNvbnN0IHBhcnNlID0gcmVxdWlyZSgnLi9wYXJzZScpO1xuY29uc3QgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5jb25zdCBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xuY29uc3QgaXNPYmplY3QgPSB2YWwgPT4gdmFsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHZhbCk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hdGNoZXIgZnVuY3Rpb24gZnJvbSBvbmUgb3IgbW9yZSBnbG9iIHBhdHRlcm5zLiBUaGVcbiAqIHJldHVybmVkIGZ1bmN0aW9uIHRha2VzIGEgc3RyaW5nIHRvIG1hdGNoIGFzIGl0cyBmaXJzdCBhcmd1bWVudCxcbiAqIGFuZCByZXR1cm5zIHRydWUgaWYgdGhlIHN0cmluZyBpcyBhIG1hdGNoLiBUaGUgcmV0dXJuZWQgbWF0Y2hlclxuICogZnVuY3Rpb24gYWxzbyB0YWtlcyBhIGJvb2xlYW4gYXMgdGhlIHNlY29uZCBhcmd1bWVudCB0aGF0LCB3aGVuIHRydWUsXG4gKiByZXR1cm5zIGFuIG9iamVjdCB3aXRoIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gKlxuICogYGBganNcbiAqIGNvbnN0IHBpY29tYXRjaCA9IHJlcXVpcmUoJ3BpY29tYXRjaCcpO1xuICogLy8gcGljb21hdGNoKGdsb2JbLCBvcHRpb25zXSk7XG4gKlxuICogY29uc3QgaXNNYXRjaCA9IHBpY29tYXRjaCgnKi4hKCphKScpO1xuICogY29uc29sZS5sb2coaXNNYXRjaCgnYS5hJykpOyAvLz0+IGZhbHNlXG4gKiBjb25zb2xlLmxvZyhpc01hdGNoKCdhLmInKSk7IC8vPT4gdHJ1ZVxuICogYGBgXG4gKiBAbmFtZSBwaWNvbWF0Y2hcbiAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBgZ2xvYnNgIE9uZSBvciBtb3JlIGdsb2IgcGF0dGVybnMuXG4gKiBAcGFyYW0ge09iamVjdD19IGBvcHRpb25zYFxuICogQHJldHVybiB7RnVuY3Rpb249fSBSZXR1cm5zIGEgbWF0Y2hlciBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuY29uc3QgcGljb21hdGNoID0gKGdsb2IsIG9wdGlvbnMsIHJldHVyblN0YXRlID0gZmFsc2UpID0+IHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoZ2xvYikpIHtcbiAgICBjb25zdCBmbnMgPSBnbG9iLm1hcChpbnB1dCA9PiBwaWNvbWF0Y2goaW5wdXQsIG9wdGlvbnMsIHJldHVyblN0YXRlKSk7XG4gICAgY29uc3QgYXJyYXlNYXRjaGVyID0gc3RyID0+IHtcbiAgICAgIGZvciAoY29uc3QgaXNNYXRjaCBvZiBmbnMpIHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBpc01hdGNoKHN0cik7XG4gICAgICAgIGlmIChzdGF0ZSkgcmV0dXJuIHN0YXRlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gICAgcmV0dXJuIGFycmF5TWF0Y2hlcjtcbiAgfVxuXG4gIGNvbnN0IGlzU3RhdGUgPSBpc09iamVjdChnbG9iKSAmJiBnbG9iLnRva2VucyAmJiBnbG9iLmlucHV0O1xuXG4gIGlmIChnbG9iID09PSAnJyB8fCAodHlwZW9mIGdsb2IgIT09ICdzdHJpbmcnICYmICFpc1N0YXRlKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIHBhdHRlcm4gdG8gYmUgYSBub24tZW1wdHkgc3RyaW5nJyk7XG4gIH1cblxuICBjb25zdCBvcHRzID0gb3B0aW9ucyB8fCB7fTtcbiAgY29uc3QgcG9zaXggPSB1dGlscy5pc1dpbmRvd3Mob3B0aW9ucyk7XG4gIGNvbnN0IHJlZ2V4ID0gaXNTdGF0ZVxuICAgID8gcGljb21hdGNoLmNvbXBpbGVSZShnbG9iLCBvcHRpb25zKVxuICAgIDogcGljb21hdGNoLm1ha2VSZShnbG9iLCBvcHRpb25zLCBmYWxzZSwgdHJ1ZSk7XG5cbiAgY29uc3Qgc3RhdGUgPSByZWdleC5zdGF0ZTtcbiAgZGVsZXRlIHJlZ2V4LnN0YXRlO1xuXG4gIGxldCBpc0lnbm9yZWQgPSAoKSA9PiBmYWxzZTtcbiAgaWYgKG9wdHMuaWdub3JlKSB7XG4gICAgY29uc3QgaWdub3JlT3B0cyA9IHsgLi4ub3B0aW9ucywgaWdub3JlOiBudWxsLCBvbk1hdGNoOiBudWxsLCBvblJlc3VsdDogbnVsbCB9O1xuICAgIGlzSWdub3JlZCA9IHBpY29tYXRjaChvcHRzLmlnbm9yZSwgaWdub3JlT3B0cywgcmV0dXJuU3RhdGUpO1xuICB9XG5cbiAgY29uc3QgbWF0Y2hlciA9IChpbnB1dCwgcmV0dXJuT2JqZWN0ID0gZmFsc2UpID0+IHtcbiAgICBjb25zdCB7IGlzTWF0Y2gsIG1hdGNoLCBvdXRwdXQgfSA9IHBpY29tYXRjaC50ZXN0KGlucHV0LCByZWdleCwgb3B0aW9ucywgeyBnbG9iLCBwb3NpeCB9KTtcbiAgICBjb25zdCByZXN1bHQgPSB7IGdsb2IsIHN0YXRlLCByZWdleCwgcG9zaXgsIGlucHV0LCBvdXRwdXQsIG1hdGNoLCBpc01hdGNoIH07XG5cbiAgICBpZiAodHlwZW9mIG9wdHMub25SZXN1bHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG9wdHMub25SZXN1bHQocmVzdWx0KTtcbiAgICB9XG5cbiAgICBpZiAoaXNNYXRjaCA9PT0gZmFsc2UpIHtcbiAgICAgIHJlc3VsdC5pc01hdGNoID0gZmFsc2U7XG4gICAgICByZXR1cm4gcmV0dXJuT2JqZWN0ID8gcmVzdWx0IDogZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGlzSWdub3JlZChpbnB1dCkpIHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0cy5vbklnbm9yZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBvcHRzLm9uSWdub3JlKHJlc3VsdCk7XG4gICAgICB9XG4gICAgICByZXN1bHQuaXNNYXRjaCA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHJldHVybk9iamVjdCA/IHJlc3VsdCA6IGZhbHNlO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2Ygb3B0cy5vbk1hdGNoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBvcHRzLm9uTWF0Y2gocmVzdWx0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJldHVybk9iamVjdCA/IHJlc3VsdCA6IHRydWU7XG4gIH07XG5cbiAgaWYgKHJldHVyblN0YXRlKSB7XG4gICAgbWF0Y2hlci5zdGF0ZSA9IHN0YXRlO1xuICB9XG5cbiAgcmV0dXJuIG1hdGNoZXI7XG59O1xuXG4vKipcbiAqIFRlc3QgYGlucHV0YCB3aXRoIHRoZSBnaXZlbiBgcmVnZXhgLiBUaGlzIGlzIHVzZWQgYnkgdGhlIG1haW5cbiAqIGBwaWNvbWF0Y2goKWAgZnVuY3Rpb24gdG8gdGVzdCB0aGUgaW5wdXQgc3RyaW5nLlxuICpcbiAqIGBgYGpzXG4gKiBjb25zdCBwaWNvbWF0Y2ggPSByZXF1aXJlKCdwaWNvbWF0Y2gnKTtcbiAqIC8vIHBpY29tYXRjaC50ZXN0KGlucHV0LCByZWdleFssIG9wdGlvbnNdKTtcbiAqXG4gKiBjb25zb2xlLmxvZyhwaWNvbWF0Y2gudGVzdCgnZm9vL2JhcicsIC9eKD86KFteL10qPylcXC8oW14vXSo/KSkkLykpO1xuICogLy8geyBpc01hdGNoOiB0cnVlLCBtYXRjaDogWyAnZm9vLycsICdmb28nLCAnYmFyJyBdLCBvdXRwdXQ6ICdmb28vYmFyJyB9XG4gKiBgYGBcbiAqIEBwYXJhbSB7U3RyaW5nfSBgaW5wdXRgIFN0cmluZyB0byB0ZXN0LlxuICogQHBhcmFtIHtSZWdFeHB9IGByZWdleGBcbiAqIEByZXR1cm4ge09iamVjdH0gUmV0dXJucyBhbiBvYmplY3Qgd2l0aCBtYXRjaGluZyBpbmZvLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5waWNvbWF0Y2gudGVzdCA9IChpbnB1dCwgcmVnZXgsIG9wdGlvbnMsIHsgZ2xvYiwgcG9zaXggfSA9IHt9KSA9PiB7XG4gIGlmICh0eXBlb2YgaW5wdXQgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgaW5wdXQgdG8gYmUgYSBzdHJpbmcnKTtcbiAgfVxuXG4gIGlmIChpbnB1dCA9PT0gJycpIHtcbiAgICByZXR1cm4geyBpc01hdGNoOiBmYWxzZSwgb3V0cHV0OiAnJyB9O1xuICB9XG5cbiAgY29uc3Qgb3B0cyA9IG9wdGlvbnMgfHwge307XG4gIGNvbnN0IGZvcm1hdCA9IG9wdHMuZm9ybWF0IHx8IChwb3NpeCA/IHV0aWxzLnRvUG9zaXhTbGFzaGVzIDogbnVsbCk7XG4gIGxldCBtYXRjaCA9IGlucHV0ID09PSBnbG9iO1xuICBsZXQgb3V0cHV0ID0gKG1hdGNoICYmIGZvcm1hdCkgPyBmb3JtYXQoaW5wdXQpIDogaW5wdXQ7XG5cbiAgaWYgKG1hdGNoID09PSBmYWxzZSkge1xuICAgIG91dHB1dCA9IGZvcm1hdCA/IGZvcm1hdChpbnB1dCkgOiBpbnB1dDtcbiAgICBtYXRjaCA9IG91dHB1dCA9PT0gZ2xvYjtcbiAgfVxuXG4gIGlmIChtYXRjaCA9PT0gZmFsc2UgfHwgb3B0cy5jYXB0dXJlID09PSB0cnVlKSB7XG4gICAgaWYgKG9wdHMubWF0Y2hCYXNlID09PSB0cnVlIHx8IG9wdHMuYmFzZW5hbWUgPT09IHRydWUpIHtcbiAgICAgIG1hdGNoID0gcGljb21hdGNoLm1hdGNoQmFzZShpbnB1dCwgcmVnZXgsIG9wdGlvbnMsIHBvc2l4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWF0Y2ggPSByZWdleC5leGVjKG91dHB1dCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHsgaXNNYXRjaDogQm9vbGVhbihtYXRjaCksIG1hdGNoLCBvdXRwdXQgfTtcbn07XG5cbi8qKlxuICogTWF0Y2ggdGhlIGJhc2VuYW1lIG9mIGEgZmlsZXBhdGguXG4gKlxuICogYGBganNcbiAqIGNvbnN0IHBpY29tYXRjaCA9IHJlcXVpcmUoJ3BpY29tYXRjaCcpO1xuICogLy8gcGljb21hdGNoLm1hdGNoQmFzZShpbnB1dCwgZ2xvYlssIG9wdGlvbnNdKTtcbiAqIGNvbnNvbGUubG9nKHBpY29tYXRjaC5tYXRjaEJhc2UoJ2Zvby9iYXIuanMnLCAnKi5qcycpOyAvLyB0cnVlXG4gKiBgYGBcbiAqIEBwYXJhbSB7U3RyaW5nfSBgaW5wdXRgIFN0cmluZyB0byB0ZXN0LlxuICogQHBhcmFtIHtSZWdFeHB8U3RyaW5nfSBgZ2xvYmAgR2xvYiBwYXR0ZXJuIG9yIHJlZ2V4IGNyZWF0ZWQgYnkgWy5tYWtlUmVdKCNtYWtlUmUpLlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucGljb21hdGNoLm1hdGNoQmFzZSA9IChpbnB1dCwgZ2xvYiwgb3B0aW9ucywgcG9zaXggPSB1dGlscy5pc1dpbmRvd3Mob3B0aW9ucykpID0+IHtcbiAgY29uc3QgcmVnZXggPSBnbG9iIGluc3RhbmNlb2YgUmVnRXhwID8gZ2xvYiA6IHBpY29tYXRjaC5tYWtlUmUoZ2xvYiwgb3B0aW9ucyk7XG4gIHJldHVybiByZWdleC50ZXN0KHBhdGguYmFzZW5hbWUoaW5wdXQpKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmICoqYW55Kiogb2YgdGhlIGdpdmVuIGdsb2IgYHBhdHRlcm5zYCBtYXRjaCB0aGUgc3BlY2lmaWVkIGBzdHJpbmdgLlxuICpcbiAqIGBgYGpzXG4gKiBjb25zdCBwaWNvbWF0Y2ggPSByZXF1aXJlKCdwaWNvbWF0Y2gnKTtcbiAqIC8vIHBpY29tYXRjaC5pc01hdGNoKHN0cmluZywgcGF0dGVybnNbLCBvcHRpb25zXSk7XG4gKlxuICogY29uc29sZS5sb2cocGljb21hdGNoLmlzTWF0Y2goJ2EuYScsIFsnYi4qJywgJyouYSddKSk7IC8vPT4gdHJ1ZVxuICogY29uc29sZS5sb2cocGljb21hdGNoLmlzTWF0Y2goJ2EuYScsICdiLionKSk7IC8vPT4gZmFsc2VcbiAqIGBgYFxuICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IHN0ciBUaGUgc3RyaW5nIHRvIHRlc3QuXG4gKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gcGF0dGVybnMgT25lIG9yIG1vcmUgZ2xvYiBwYXR0ZXJucyB0byB1c2UgZm9yIG1hdGNoaW5nLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBTZWUgYXZhaWxhYmxlIFtvcHRpb25zXSgjb3B0aW9ucykuXG4gKiBAcmV0dXJuIHtCb29sZWFufSBSZXR1cm5zIHRydWUgaWYgYW55IHBhdHRlcm5zIG1hdGNoIGBzdHJgXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnBpY29tYXRjaC5pc01hdGNoID0gKHN0ciwgcGF0dGVybnMsIG9wdGlvbnMpID0+IHBpY29tYXRjaChwYXR0ZXJucywgb3B0aW9ucykoc3RyKTtcblxuLyoqXG4gKiBQYXJzZSBhIGdsb2IgcGF0dGVybiB0byBjcmVhdGUgdGhlIHNvdXJjZSBzdHJpbmcgZm9yIGEgcmVndWxhclxuICogZXhwcmVzc2lvbi5cbiAqXG4gKiBgYGBqc1xuICogY29uc3QgcGljb21hdGNoID0gcmVxdWlyZSgncGljb21hdGNoJyk7XG4gKiBjb25zdCByZXN1bHQgPSBwaWNvbWF0Y2gucGFyc2UocGF0dGVyblssIG9wdGlvbnNdKTtcbiAqIGBgYFxuICogQHBhcmFtIHtTdHJpbmd9IGBwYXR0ZXJuYFxuICogQHBhcmFtIHtPYmplY3R9IGBvcHRpb25zYFxuICogQHJldHVybiB7T2JqZWN0fSBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIHVzZWZ1bCBwcm9wZXJ0aWVzIGFuZCBvdXRwdXQgdG8gYmUgdXNlZCBhcyBhIHJlZ2V4IHNvdXJjZSBzdHJpbmcuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnBpY29tYXRjaC5wYXJzZSA9IChwYXR0ZXJuLCBvcHRpb25zKSA9PiB7XG4gIGlmIChBcnJheS5pc0FycmF5KHBhdHRlcm4pKSByZXR1cm4gcGF0dGVybi5tYXAocCA9PiBwaWNvbWF0Y2gucGFyc2UocCwgb3B0aW9ucykpO1xuICByZXR1cm4gcGFyc2UocGF0dGVybiwgeyAuLi5vcHRpb25zLCBmYXN0cGF0aHM6IGZhbHNlIH0pO1xufTtcblxuLyoqXG4gKiBTY2FuIGEgZ2xvYiBwYXR0ZXJuIHRvIHNlcGFyYXRlIHRoZSBwYXR0ZXJuIGludG8gc2VnbWVudHMuXG4gKlxuICogYGBganNcbiAqIGNvbnN0IHBpY29tYXRjaCA9IHJlcXVpcmUoJ3BpY29tYXRjaCcpO1xuICogLy8gcGljb21hdGNoLnNjYW4oaW5wdXRbLCBvcHRpb25zXSk7XG4gKlxuICogY29uc3QgcmVzdWx0ID0gcGljb21hdGNoLnNjYW4oJyEuL2Zvby8qLmpzJyk7XG4gKiBjb25zb2xlLmxvZyhyZXN1bHQpO1xuICogeyBwcmVmaXg6ICchLi8nLFxuICogICBpbnB1dDogJyEuL2Zvby8qLmpzJyxcbiAqICAgc3RhcnQ6IDMsXG4gKiAgIGJhc2U6ICdmb28nLFxuICogICBnbG9iOiAnKi5qcycsXG4gKiAgIGlzQnJhY2U6IGZhbHNlLFxuICogICBpc0JyYWNrZXQ6IGZhbHNlLFxuICogICBpc0dsb2I6IHRydWUsXG4gKiAgIGlzRXh0Z2xvYjogZmFsc2UsXG4gKiAgIGlzR2xvYnN0YXI6IGZhbHNlLFxuICogICBuZWdhdGVkOiB0cnVlIH1cbiAqIGBgYFxuICogQHBhcmFtIHtTdHJpbmd9IGBpbnB1dGAgR2xvYiBwYXR0ZXJuIHRvIHNjYW4uXG4gKiBAcGFyYW0ge09iamVjdH0gYG9wdGlvbnNgXG4gKiBAcmV0dXJuIHtPYmplY3R9IFJldHVybnMgYW4gb2JqZWN0IHdpdGhcbiAqIEBhcGkgcHVibGljXG4gKi9cblxucGljb21hdGNoLnNjYW4gPSAoaW5wdXQsIG9wdGlvbnMpID0+IHNjYW4oaW5wdXQsIG9wdGlvbnMpO1xuXG4vKipcbiAqIENvbXBpbGUgYSByZWd1bGFyIGV4cHJlc3Npb24gZnJvbSB0aGUgYHN0YXRlYCBvYmplY3QgcmV0dXJuZWQgYnkgdGhlXG4gKiBbcGFyc2UoKV0oI3BhcnNlKSBtZXRob2QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGBzdGF0ZWBcbiAqIEBwYXJhbSB7T2JqZWN0fSBgb3B0aW9uc2BcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gYHJldHVybk91dHB1dGAgSW50ZW5kZWQgZm9yIGltcGxlbWVudG9ycywgdGhpcyBhcmd1bWVudCBhbGxvd3MgeW91IHRvIHJldHVybiB0aGUgcmF3IG91dHB1dCBmcm9tIHRoZSBwYXJzZXIuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGByZXR1cm5TdGF0ZWAgQWRkcyB0aGUgc3RhdGUgdG8gYSBgc3RhdGVgIHByb3BlcnR5IG9uIHRoZSByZXR1cm5lZCByZWdleC4gVXNlZnVsIGZvciBpbXBsZW1lbnRvcnMgYW5kIGRlYnVnZ2luZy5cbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucGljb21hdGNoLmNvbXBpbGVSZSA9IChzdGF0ZSwgb3B0aW9ucywgcmV0dXJuT3V0cHV0ID0gZmFsc2UsIHJldHVyblN0YXRlID0gZmFsc2UpID0+IHtcbiAgaWYgKHJldHVybk91dHB1dCA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiBzdGF0ZS5vdXRwdXQ7XG4gIH1cblxuICBjb25zdCBvcHRzID0gb3B0aW9ucyB8fCB7fTtcbiAgY29uc3QgcHJlcGVuZCA9IG9wdHMuY29udGFpbnMgPyAnJyA6ICdeJztcbiAgY29uc3QgYXBwZW5kID0gb3B0cy5jb250YWlucyA/ICcnIDogJyQnO1xuXG4gIGxldCBzb3VyY2UgPSBgJHtwcmVwZW5kfSg/OiR7c3RhdGUub3V0cHV0fSkke2FwcGVuZH1gO1xuICBpZiAoc3RhdGUgJiYgc3RhdGUubmVnYXRlZCA9PT0gdHJ1ZSkge1xuICAgIHNvdXJjZSA9IGBeKD8hJHtzb3VyY2V9KS4qJGA7XG4gIH1cblxuICBjb25zdCByZWdleCA9IHBpY29tYXRjaC50b1JlZ2V4KHNvdXJjZSwgb3B0aW9ucyk7XG4gIGlmIChyZXR1cm5TdGF0ZSA9PT0gdHJ1ZSkge1xuICAgIHJlZ2V4LnN0YXRlID0gc3RhdGU7XG4gIH1cblxuICByZXR1cm4gcmVnZXg7XG59O1xuXG4vKipcbiAqIENyZWF0ZSBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBmcm9tIGEgcGFyc2VkIGdsb2IgcGF0dGVybi5cbiAqXG4gKiBgYGBqc1xuICogY29uc3QgcGljb21hdGNoID0gcmVxdWlyZSgncGljb21hdGNoJyk7XG4gKiBjb25zdCBzdGF0ZSA9IHBpY29tYXRjaC5wYXJzZSgnKi5qcycpO1xuICogLy8gcGljb21hdGNoLmNvbXBpbGVSZShzdGF0ZVssIG9wdGlvbnNdKTtcbiAqXG4gKiBjb25zb2xlLmxvZyhwaWNvbWF0Y2guY29tcGlsZVJlKHN0YXRlKSk7XG4gKiAvLz0+IC9eKD86KD8hXFwuKSg/PS4pW14vXSo/XFwuanMpJC9cbiAqIGBgYFxuICogQHBhcmFtIHtTdHJpbmd9IGBzdGF0ZWAgVGhlIG9iamVjdCByZXR1cm5lZCBmcm9tIHRoZSBgLnBhcnNlYCBtZXRob2QuXG4gKiBAcGFyYW0ge09iamVjdH0gYG9wdGlvbnNgXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGByZXR1cm5PdXRwdXRgIEltcGxlbWVudG9ycyBtYXkgdXNlIHRoaXMgYXJndW1lbnQgdG8gcmV0dXJuIHRoZSBjb21waWxlZCBvdXRwdXQsIGluc3RlYWQgb2YgYSByZWd1bGFyIGV4cHJlc3Npb24uIFRoaXMgaXMgbm90IGV4cG9zZWQgb24gdGhlIG9wdGlvbnMgdG8gcHJldmVudCBlbmQtdXNlcnMgZnJvbSBtdXRhdGluZyB0aGUgcmVzdWx0LlxuICogQHBhcmFtIHtCb29sZWFufSBgcmV0dXJuU3RhdGVgIEltcGxlbWVudG9ycyBtYXkgdXNlIHRoaXMgYXJndW1lbnQgdG8gcmV0dXJuIHRoZSBzdGF0ZSBmcm9tIHRoZSBwYXJzZWQgZ2xvYiB3aXRoIHRoZSByZXR1cm5lZCByZWd1bGFyIGV4cHJlc3Npb24uXG4gKiBAcmV0dXJuIHtSZWdFeHB9IFJldHVybnMgYSByZWdleCBjcmVhdGVkIGZyb20gdGhlIGdpdmVuIHBhdHRlcm4uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnBpY29tYXRjaC5tYWtlUmUgPSAoaW5wdXQsIG9wdGlvbnMgPSB7fSwgcmV0dXJuT3V0cHV0ID0gZmFsc2UsIHJldHVyblN0YXRlID0gZmFsc2UpID0+IHtcbiAgaWYgKCFpbnB1dCB8fCB0eXBlb2YgaW5wdXQgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYSBub24tZW1wdHkgc3RyaW5nJyk7XG4gIH1cblxuICBsZXQgcGFyc2VkID0geyBuZWdhdGVkOiBmYWxzZSwgZmFzdHBhdGhzOiB0cnVlIH07XG5cbiAgaWYgKG9wdGlvbnMuZmFzdHBhdGhzICE9PSBmYWxzZSAmJiAoaW5wdXRbMF0gPT09ICcuJyB8fCBpbnB1dFswXSA9PT0gJyonKSkge1xuICAgIHBhcnNlZC5vdXRwdXQgPSBwYXJzZS5mYXN0cGF0aHMoaW5wdXQsIG9wdGlvbnMpO1xuICB9XG5cbiAgaWYgKCFwYXJzZWQub3V0cHV0KSB7XG4gICAgcGFyc2VkID0gcGFyc2UoaW5wdXQsIG9wdGlvbnMpO1xuICB9XG5cbiAgcmV0dXJuIHBpY29tYXRjaC5jb21waWxlUmUocGFyc2VkLCBvcHRpb25zLCByZXR1cm5PdXRwdXQsIHJldHVyblN0YXRlKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlIGEgcmVndWxhciBleHByZXNzaW9uIGZyb20gdGhlIGdpdmVuIHJlZ2V4IHNvdXJjZSBzdHJpbmcuXG4gKlxuICogYGBganNcbiAqIGNvbnN0IHBpY29tYXRjaCA9IHJlcXVpcmUoJ3BpY29tYXRjaCcpO1xuICogLy8gcGljb21hdGNoLnRvUmVnZXgoc291cmNlWywgb3B0aW9uc10pO1xuICpcbiAqIGNvbnN0IHsgb3V0cHV0IH0gPSBwaWNvbWF0Y2gucGFyc2UoJyouanMnKTtcbiAqIGNvbnNvbGUubG9nKHBpY29tYXRjaC50b1JlZ2V4KG91dHB1dCkpO1xuICogLy89PiAvXig/Oig/IVxcLikoPz0uKVteL10qP1xcLmpzKSQvXG4gKiBgYGBcbiAqIEBwYXJhbSB7U3RyaW5nfSBgc291cmNlYCBSZWd1bGFyIGV4cHJlc3Npb24gc291cmNlIHN0cmluZy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBgb3B0aW9uc2BcbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucGljb21hdGNoLnRvUmVnZXggPSAoc291cmNlLCBvcHRpb25zKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgb3B0cyA9IG9wdGlvbnMgfHwge307XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoc291cmNlLCBvcHRzLmZsYWdzIHx8IChvcHRzLm5vY2FzZSA/ICdpJyA6ICcnKSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZGVidWcgPT09IHRydWUpIHRocm93IGVycjtcbiAgICByZXR1cm4gLyReLztcbiAgfVxufTtcblxuLyoqXG4gKiBQaWNvbWF0Y2ggY29uc3RhbnRzLlxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbnBpY29tYXRjaC5jb25zdGFudHMgPSBjb25zdGFudHM7XG5cbi8qKlxuICogRXhwb3NlIFwicGljb21hdGNoXCJcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBpY29tYXRjaDtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9waWNvbWF0Y2gnKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcbmNvbnN0IGJyYWNlcyA9IHJlcXVpcmUoJ2JyYWNlcycpO1xuY29uc3QgcGljb21hdGNoID0gcmVxdWlyZSgncGljb21hdGNoJyk7XG5jb25zdCB1dGlscyA9IHJlcXVpcmUoJ3BpY29tYXRjaC9saWIvdXRpbHMnKTtcbmNvbnN0IGlzRW1wdHlTdHJpbmcgPSB2YWwgPT4gdmFsID09PSAnJyB8fCB2YWwgPT09ICcuLyc7XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBvZiBzdHJpbmdzIHRoYXQgbWF0Y2ggb25lIG9yIG1vcmUgZ2xvYiBwYXR0ZXJucy5cbiAqXG4gKiBgYGBqc1xuICogY29uc3QgbW0gPSByZXF1aXJlKCdtaWNyb21hdGNoJyk7XG4gKiAvLyBtbShsaXN0LCBwYXR0ZXJuc1ssIG9wdGlvbnNdKTtcbiAqXG4gKiBjb25zb2xlLmxvZyhtbShbJ2EuanMnLCAnYS50eHQnXSwgWycqLmpzJ10pKTtcbiAqIC8vPT4gWyAnYS5qcycgXVxuICogYGBgXG4gKiBAcGFyYW0ge1N0cmluZ3xBcnJheTxzdHJpbmc+fSBgbGlzdGAgTGlzdCBvZiBzdHJpbmdzIHRvIG1hdGNoLlxuICogQHBhcmFtIHtTdHJpbmd8QXJyYXk8c3RyaW5nPn0gYHBhdHRlcm5zYCBPbmUgb3IgbW9yZSBnbG9iIHBhdHRlcm5zIHRvIHVzZSBmb3IgbWF0Y2hpbmcuXG4gKiBAcGFyYW0ge09iamVjdH0gYG9wdGlvbnNgIFNlZSBhdmFpbGFibGUgW29wdGlvbnNdKCNvcHRpb25zKVxuICogQHJldHVybiB7QXJyYXl9IFJldHVybnMgYW4gYXJyYXkgb2YgbWF0Y2hlc1xuICogQHN1bW1hcnkgZmFsc2VcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuY29uc3QgbWljcm9tYXRjaCA9IChsaXN0LCBwYXR0ZXJucywgb3B0aW9ucykgPT4ge1xuICBwYXR0ZXJucyA9IFtdLmNvbmNhdChwYXR0ZXJucyk7XG4gIGxpc3QgPSBbXS5jb25jYXQobGlzdCk7XG5cbiAgbGV0IG9taXQgPSBuZXcgU2V0KCk7XG4gIGxldCBrZWVwID0gbmV3IFNldCgpO1xuICBsZXQgaXRlbXMgPSBuZXcgU2V0KCk7XG4gIGxldCBuZWdhdGl2ZXMgPSAwO1xuXG4gIGxldCBvblJlc3VsdCA9IHN0YXRlID0+IHtcbiAgICBpdGVtcy5hZGQoc3RhdGUub3V0cHV0KTtcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLm9uUmVzdWx0KSB7XG4gICAgICBvcHRpb25zLm9uUmVzdWx0KHN0YXRlKTtcbiAgICB9XG4gIH07XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXR0ZXJucy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBpc01hdGNoID0gcGljb21hdGNoKFN0cmluZyhwYXR0ZXJuc1tpXSksIHsgLi4ub3B0aW9ucywgb25SZXN1bHQgfSwgdHJ1ZSk7XG4gICAgbGV0IG5lZ2F0ZWQgPSBpc01hdGNoLnN0YXRlLm5lZ2F0ZWQgfHwgaXNNYXRjaC5zdGF0ZS5uZWdhdGVkRXh0Z2xvYjtcbiAgICBpZiAobmVnYXRlZCkgbmVnYXRpdmVzKys7XG5cbiAgICBmb3IgKGxldCBpdGVtIG9mIGxpc3QpIHtcbiAgICAgIGxldCBtYXRjaGVkID0gaXNNYXRjaChpdGVtLCB0cnVlKTtcblxuICAgICAgbGV0IG1hdGNoID0gbmVnYXRlZCA/ICFtYXRjaGVkLmlzTWF0Y2ggOiBtYXRjaGVkLmlzTWF0Y2g7XG4gICAgICBpZiAoIW1hdGNoKSBjb250aW51ZTtcblxuICAgICAgaWYgKG5lZ2F0ZWQpIHtcbiAgICAgICAgb21pdC5hZGQobWF0Y2hlZC5vdXRwdXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb21pdC5kZWxldGUobWF0Y2hlZC5vdXRwdXQpO1xuICAgICAgICBrZWVwLmFkZChtYXRjaGVkLm91dHB1dCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbGV0IHJlc3VsdCA9IG5lZ2F0aXZlcyA9PT0gcGF0dGVybnMubGVuZ3RoID8gWy4uLml0ZW1zXSA6IFsuLi5rZWVwXTtcbiAgbGV0IG1hdGNoZXMgPSByZXN1bHQuZmlsdGVyKGl0ZW0gPT4gIW9taXQuaGFzKGl0ZW0pKTtcblxuICBpZiAob3B0aW9ucyAmJiBtYXRjaGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChvcHRpb25zLmZhaWxnbG9iID09PSB0cnVlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIG1hdGNoZXMgZm91bmQgZm9yIFwiJHtwYXR0ZXJucy5qb2luKCcsICcpfVwiYCk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMubm9udWxsID09PSB0cnVlIHx8IG9wdGlvbnMubnVsbGdsb2IgPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBvcHRpb25zLnVuZXNjYXBlID8gcGF0dGVybnMubWFwKHAgPT4gcC5yZXBsYWNlKC9cXFxcL2csICcnKSkgOiBwYXR0ZXJucztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWF0Y2hlcztcbn07XG5cbi8qKlxuICogQmFja3dhcmRzIGNvbXBhdGliaWxpdHlcbiAqL1xuXG5taWNyb21hdGNoLm1hdGNoID0gbWljcm9tYXRjaDtcblxuLyoqXG4gKiBSZXR1cm5zIGEgbWF0Y2hlciBmdW5jdGlvbiBmcm9tIHRoZSBnaXZlbiBnbG9iIGBwYXR0ZXJuYCBhbmQgYG9wdGlvbnNgLlxuICogVGhlIHJldHVybmVkIGZ1bmN0aW9uIHRha2VzIGEgc3RyaW5nIHRvIG1hdGNoIGFzIGl0cyBvbmx5IGFyZ3VtZW50IGFuZCByZXR1cm5zXG4gKiB0cnVlIGlmIHRoZSBzdHJpbmcgaXMgYSBtYXRjaC5cbiAqXG4gKiBgYGBqc1xuICogY29uc3QgbW0gPSByZXF1aXJlKCdtaWNyb21hdGNoJyk7XG4gKiAvLyBtbS5tYXRjaGVyKHBhdHRlcm5bLCBvcHRpb25zXSk7XG4gKlxuICogY29uc3QgaXNNYXRjaCA9IG1tLm1hdGNoZXIoJyouISgqYSknKTtcbiAqIGNvbnNvbGUubG9nKGlzTWF0Y2goJ2EuYScpKTsgLy89PiBmYWxzZVxuICogY29uc29sZS5sb2coaXNNYXRjaCgnYS5iJykpOyAvLz0+IHRydWVcbiAqIGBgYFxuICogQHBhcmFtIHtTdHJpbmd9IGBwYXR0ZXJuYCBHbG9iIHBhdHRlcm5cbiAqIEBwYXJhbSB7T2JqZWN0fSBgb3B0aW9uc2BcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBSZXR1cm5zIGEgbWF0Y2hlciBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubWljcm9tYXRjaC5tYXRjaGVyID0gKHBhdHRlcm4sIG9wdGlvbnMpID0+IHBpY29tYXRjaChwYXR0ZXJuLCBvcHRpb25zKTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgKiphbnkqKiBvZiB0aGUgZ2l2ZW4gZ2xvYiBgcGF0dGVybnNgIG1hdGNoIHRoZSBzcGVjaWZpZWQgYHN0cmluZ2AuXG4gKlxuICogYGBganNcbiAqIGNvbnN0IG1tID0gcmVxdWlyZSgnbWljcm9tYXRjaCcpO1xuICogLy8gbW0uaXNNYXRjaChzdHJpbmcsIHBhdHRlcm5zWywgb3B0aW9uc10pO1xuICpcbiAqIGNvbnNvbGUubG9nKG1tLmlzTWF0Y2goJ2EuYScsIFsnYi4qJywgJyouYSddKSk7IC8vPT4gdHJ1ZVxuICogY29uc29sZS5sb2cobW0uaXNNYXRjaCgnYS5hJywgJ2IuKicpKTsgLy89PiBmYWxzZVxuICogYGBgXG4gKiBAcGFyYW0ge1N0cmluZ30gYHN0cmAgVGhlIHN0cmluZyB0byB0ZXN0LlxuICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IGBwYXR0ZXJuc2AgT25lIG9yIG1vcmUgZ2xvYiBwYXR0ZXJucyB0byB1c2UgZm9yIG1hdGNoaW5nLlxuICogQHBhcmFtIHtPYmplY3R9IGBbb3B0aW9uc11gIFNlZSBhdmFpbGFibGUgW29wdGlvbnNdKCNvcHRpb25zKS5cbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJldHVybnMgdHJ1ZSBpZiBhbnkgcGF0dGVybnMgbWF0Y2ggYHN0cmBcbiAqIEBhcGkgcHVibGljXG4gKi9cblxubWljcm9tYXRjaC5pc01hdGNoID0gKHN0ciwgcGF0dGVybnMsIG9wdGlvbnMpID0+IHBpY29tYXRjaChwYXR0ZXJucywgb3B0aW9ucykoc3RyKTtcblxuLyoqXG4gKiBCYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuICovXG5cbm1pY3JvbWF0Y2guYW55ID0gbWljcm9tYXRjaC5pc01hdGNoO1xuXG4vKipcbiAqIFJldHVybnMgYSBsaXN0IG9mIHN0cmluZ3MgdGhhdCBfKipkbyBub3QgbWF0Y2ggYW55KipfIG9mIHRoZSBnaXZlbiBgcGF0dGVybnNgLlxuICpcbiAqIGBgYGpzXG4gKiBjb25zdCBtbSA9IHJlcXVpcmUoJ21pY3JvbWF0Y2gnKTtcbiAqIC8vIG1tLm5vdChsaXN0LCBwYXR0ZXJuc1ssIG9wdGlvbnNdKTtcbiAqXG4gKiBjb25zb2xlLmxvZyhtbS5ub3QoWydhLmEnLCAnYi5iJywgJ2MuYyddLCAnKi5hJykpO1xuICogLy89PiBbJ2IuYicsICdjLmMnXVxuICogYGBgXG4gKiBAcGFyYW0ge0FycmF5fSBgbGlzdGAgQXJyYXkgb2Ygc3RyaW5ncyB0byBtYXRjaC5cbiAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBgcGF0dGVybnNgIE9uZSBvciBtb3JlIGdsb2IgcGF0dGVybiB0byB1c2UgZm9yIG1hdGNoaW5nLlxuICogQHBhcmFtIHtPYmplY3R9IGBvcHRpb25zYCBTZWUgYXZhaWxhYmxlIFtvcHRpb25zXSgjb3B0aW9ucykgZm9yIGNoYW5naW5nIGhvdyBtYXRjaGVzIGFyZSBwZXJmb3JtZWRcbiAqIEByZXR1cm4ge0FycmF5fSBSZXR1cm5zIGFuIGFycmF5IG9mIHN0cmluZ3MgdGhhdCAqKmRvIG5vdCBtYXRjaCoqIHRoZSBnaXZlbiBwYXR0ZXJucy5cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubWljcm9tYXRjaC5ub3QgPSAobGlzdCwgcGF0dGVybnMsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBwYXR0ZXJucyA9IFtdLmNvbmNhdChwYXR0ZXJucykubWFwKFN0cmluZyk7XG4gIGxldCByZXN1bHQgPSBuZXcgU2V0KCk7XG4gIGxldCBpdGVtcyA9IFtdO1xuXG4gIGxldCBvblJlc3VsdCA9IHN0YXRlID0+IHtcbiAgICBpZiAob3B0aW9ucy5vblJlc3VsdCkgb3B0aW9ucy5vblJlc3VsdChzdGF0ZSk7XG4gICAgaXRlbXMucHVzaChzdGF0ZS5vdXRwdXQpO1xuICB9O1xuXG4gIGxldCBtYXRjaGVzID0gbmV3IFNldChtaWNyb21hdGNoKGxpc3QsIHBhdHRlcm5zLCB7IC4uLm9wdGlvbnMsIG9uUmVzdWx0IH0pKTtcblxuICBmb3IgKGxldCBpdGVtIG9mIGl0ZW1zKSB7XG4gICAgaWYgKCFtYXRjaGVzLmhhcyhpdGVtKSkge1xuICAgICAgcmVzdWx0LmFkZChpdGVtKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIFsuLi5yZXN1bHRdO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIGBzdHJpbmdgIGNvbnRhaW5zIHRoZSBnaXZlbiBwYXR0ZXJuLiBTaW1pbGFyXG4gKiB0byBbLmlzTWF0Y2hdKCNpc01hdGNoKSBidXQgdGhlIHBhdHRlcm4gY2FuIG1hdGNoIGFueSBwYXJ0IG9mIHRoZSBzdHJpbmcuXG4gKlxuICogYGBganNcbiAqIHZhciBtbSA9IHJlcXVpcmUoJ21pY3JvbWF0Y2gnKTtcbiAqIC8vIG1tLmNvbnRhaW5zKHN0cmluZywgcGF0dGVyblssIG9wdGlvbnNdKTtcbiAqXG4gKiBjb25zb2xlLmxvZyhtbS5jb250YWlucygnYWEvYmIvY2MnLCAnKmInKSk7XG4gKiAvLz0+IHRydWVcbiAqIGNvbnNvbGUubG9nKG1tLmNvbnRhaW5zKCdhYS9iYi9jYycsICcqZCcpKTtcbiAqIC8vPT4gZmFsc2VcbiAqIGBgYFxuICogQHBhcmFtIHtTdHJpbmd9IGBzdHJgIFRoZSBzdHJpbmcgdG8gbWF0Y2guXG4gKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gYHBhdHRlcm5zYCBHbG9iIHBhdHRlcm4gdG8gdXNlIGZvciBtYXRjaGluZy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBgb3B0aW9uc2AgU2VlIGF2YWlsYWJsZSBbb3B0aW9uc10oI29wdGlvbnMpIGZvciBjaGFuZ2luZyBob3cgbWF0Y2hlcyBhcmUgcGVyZm9ybWVkXG4gKiBAcmV0dXJuIHtCb29sZWFufSBSZXR1cm5zIHRydWUgaWYgYW55IG9mIHRoZSBwYXR0ZXJucyBtYXRjaGVzIGFueSBwYXJ0IG9mIGBzdHJgLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5taWNyb21hdGNoLmNvbnRhaW5zID0gKHN0ciwgcGF0dGVybiwgb3B0aW9ucykgPT4ge1xuICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBhIHN0cmluZzogXCIke3V0aWwuaW5zcGVjdChzdHIpfVwiYCk7XG4gIH1cblxuICBpZiAoQXJyYXkuaXNBcnJheShwYXR0ZXJuKSkge1xuICAgIHJldHVybiBwYXR0ZXJuLnNvbWUocCA9PiBtaWNyb21hdGNoLmNvbnRhaW5zKHN0ciwgcCwgb3B0aW9ucykpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBwYXR0ZXJuID09PSAnc3RyaW5nJykge1xuICAgIGlmIChpc0VtcHR5U3RyaW5nKHN0cikgfHwgaXNFbXB0eVN0cmluZyhwYXR0ZXJuKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChzdHIuaW5jbHVkZXMocGF0dGVybikgfHwgKHN0ci5zdGFydHNXaXRoKCcuLycpICYmIHN0ci5zbGljZSgyKS5pbmNsdWRlcyhwYXR0ZXJuKSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtaWNyb21hdGNoLmlzTWF0Y2goc3RyLCBwYXR0ZXJuLCB7IC4uLm9wdGlvbnMsIGNvbnRhaW5zOiB0cnVlIH0pO1xufTtcblxuLyoqXG4gKiBGaWx0ZXIgdGhlIGtleXMgb2YgdGhlIGdpdmVuIG9iamVjdCB3aXRoIHRoZSBnaXZlbiBgZ2xvYmAgcGF0dGVyblxuICogYW5kIGBvcHRpb25zYC4gRG9lcyBub3QgYXR0ZW1wdCB0byBtYXRjaCBuZXN0ZWQga2V5cy4gSWYgeW91IG5lZWQgdGhpcyBmZWF0dXJlLFxuICogdXNlIFtnbG9iLW9iamVjdF1bXSBpbnN0ZWFkLlxuICpcbiAqIGBgYGpzXG4gKiBjb25zdCBtbSA9IHJlcXVpcmUoJ21pY3JvbWF0Y2gnKTtcbiAqIC8vIG1tLm1hdGNoS2V5cyhvYmplY3QsIHBhdHRlcm5zWywgb3B0aW9uc10pO1xuICpcbiAqIGNvbnN0IG9iaiA9IHsgYWE6ICdhJywgYWI6ICdiJywgYWM6ICdjJyB9O1xuICogY29uc29sZS5sb2cobW0ubWF0Y2hLZXlzKG9iaiwgJypiJykpO1xuICogLy89PiB7IGFiOiAnYicgfVxuICogYGBgXG4gKiBAcGFyYW0ge09iamVjdH0gYG9iamVjdGAgVGhlIG9iamVjdCB3aXRoIGtleXMgdG8gZmlsdGVyLlxuICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IGBwYXR0ZXJuc2AgT25lIG9yIG1vcmUgZ2xvYiBwYXR0ZXJucyB0byB1c2UgZm9yIG1hdGNoaW5nLlxuICogQHBhcmFtIHtPYmplY3R9IGBvcHRpb25zYCBTZWUgYXZhaWxhYmxlIFtvcHRpb25zXSgjb3B0aW9ucykgZm9yIGNoYW5naW5nIGhvdyBtYXRjaGVzIGFyZSBwZXJmb3JtZWRcbiAqIEByZXR1cm4ge09iamVjdH0gUmV0dXJucyBhbiBvYmplY3Qgd2l0aCBvbmx5IGtleXMgdGhhdCBtYXRjaCB0aGUgZ2l2ZW4gcGF0dGVybnMuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1pY3JvbWF0Y2gubWF0Y2hLZXlzID0gKG9iaiwgcGF0dGVybnMsIG9wdGlvbnMpID0+IHtcbiAgaWYgKCF1dGlscy5pc09iamVjdChvYmopKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCcpO1xuICB9XG4gIGxldCBrZXlzID0gbWljcm9tYXRjaChPYmplY3Qua2V5cyhvYmopLCBwYXR0ZXJucywgb3B0aW9ucyk7XG4gIGxldCByZXMgPSB7fTtcbiAgZm9yIChsZXQga2V5IG9mIGtleXMpIHJlc1trZXldID0gb2JqW2tleV07XG4gIHJldHVybiByZXM7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiBzb21lIG9mIHRoZSBzdHJpbmdzIGluIHRoZSBnaXZlbiBgbGlzdGAgbWF0Y2ggYW55IG9mIHRoZSBnaXZlbiBnbG9iIGBwYXR0ZXJuc2AuXG4gKlxuICogYGBganNcbiAqIGNvbnN0IG1tID0gcmVxdWlyZSgnbWljcm9tYXRjaCcpO1xuICogLy8gbW0uc29tZShsaXN0LCBwYXR0ZXJuc1ssIG9wdGlvbnNdKTtcbiAqXG4gKiBjb25zb2xlLmxvZyhtbS5zb21lKFsnZm9vLmpzJywgJ2Jhci5qcyddLCBbJyouanMnLCAnIWZvby5qcyddKSk7XG4gKiAvLyB0cnVlXG4gKiBjb25zb2xlLmxvZyhtbS5zb21lKFsnZm9vLmpzJ10sIFsnKi5qcycsICchZm9vLmpzJ10pKTtcbiAqIC8vIGZhbHNlXG4gKiBgYGBcbiAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBgbGlzdGAgVGhlIHN0cmluZyBvciBhcnJheSBvZiBzdHJpbmdzIHRvIHRlc3QuIFJldHVybnMgYXMgc29vbiBhcyB0aGUgZmlyc3QgbWF0Y2ggaXMgZm91bmQuXG4gKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gYHBhdHRlcm5zYCBPbmUgb3IgbW9yZSBnbG9iIHBhdHRlcm5zIHRvIHVzZSBmb3IgbWF0Y2hpbmcuXG4gKiBAcGFyYW0ge09iamVjdH0gYG9wdGlvbnNgIFNlZSBhdmFpbGFibGUgW29wdGlvbnNdKCNvcHRpb25zKSBmb3IgY2hhbmdpbmcgaG93IG1hdGNoZXMgYXJlIHBlcmZvcm1lZFxuICogQHJldHVybiB7Qm9vbGVhbn0gUmV0dXJucyB0cnVlIGlmIGFueSBgcGF0dGVybnNgIG1hdGNoZXMgYW55IG9mIHRoZSBzdHJpbmdzIGluIGBsaXN0YFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5taWNyb21hdGNoLnNvbWUgPSAobGlzdCwgcGF0dGVybnMsIG9wdGlvbnMpID0+IHtcbiAgbGV0IGl0ZW1zID0gW10uY29uY2F0KGxpc3QpO1xuXG4gIGZvciAobGV0IHBhdHRlcm4gb2YgW10uY29uY2F0KHBhdHRlcm5zKSkge1xuICAgIGxldCBpc01hdGNoID0gcGljb21hdGNoKFN0cmluZyhwYXR0ZXJuKSwgb3B0aW9ucyk7XG4gICAgaWYgKGl0ZW1zLnNvbWUoaXRlbSA9PiBpc01hdGNoKGl0ZW0pKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIGV2ZXJ5IHN0cmluZyBpbiB0aGUgZ2l2ZW4gYGxpc3RgIG1hdGNoZXNcbiAqIGFueSBvZiB0aGUgZ2l2ZW4gZ2xvYiBgcGF0dGVybnNgLlxuICpcbiAqIGBgYGpzXG4gKiBjb25zdCBtbSA9IHJlcXVpcmUoJ21pY3JvbWF0Y2gnKTtcbiAqIC8vIG1tLmV2ZXJ5KGxpc3QsIHBhdHRlcm5zWywgb3B0aW9uc10pO1xuICpcbiAqIGNvbnNvbGUubG9nKG1tLmV2ZXJ5KCdmb28uanMnLCBbJ2Zvby5qcyddKSk7XG4gKiAvLyB0cnVlXG4gKiBjb25zb2xlLmxvZyhtbS5ldmVyeShbJ2Zvby5qcycsICdiYXIuanMnXSwgWycqLmpzJ10pKTtcbiAqIC8vIHRydWVcbiAqIGNvbnNvbGUubG9nKG1tLmV2ZXJ5KFsnZm9vLmpzJywgJ2Jhci5qcyddLCBbJyouanMnLCAnIWZvby5qcyddKSk7XG4gKiAvLyBmYWxzZVxuICogY29uc29sZS5sb2cobW0uZXZlcnkoWydmb28uanMnXSwgWycqLmpzJywgJyFmb28uanMnXSkpO1xuICogLy8gZmFsc2VcbiAqIGBgYFxuICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IGBsaXN0YCBUaGUgc3RyaW5nIG9yIGFycmF5IG9mIHN0cmluZ3MgdG8gdGVzdC5cbiAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBgcGF0dGVybnNgIE9uZSBvciBtb3JlIGdsb2IgcGF0dGVybnMgdG8gdXNlIGZvciBtYXRjaGluZy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBgb3B0aW9uc2AgU2VlIGF2YWlsYWJsZSBbb3B0aW9uc10oI29wdGlvbnMpIGZvciBjaGFuZ2luZyBob3cgbWF0Y2hlcyBhcmUgcGVyZm9ybWVkXG4gKiBAcmV0dXJuIHtCb29sZWFufSBSZXR1cm5zIHRydWUgaWYgYWxsIGBwYXR0ZXJuc2AgbWF0Y2hlcyBhbGwgb2YgdGhlIHN0cmluZ3MgaW4gYGxpc3RgXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1pY3JvbWF0Y2guZXZlcnkgPSAobGlzdCwgcGF0dGVybnMsIG9wdGlvbnMpID0+IHtcbiAgbGV0IGl0ZW1zID0gW10uY29uY2F0KGxpc3QpO1xuXG4gIGZvciAobGV0IHBhdHRlcm4gb2YgW10uY29uY2F0KHBhdHRlcm5zKSkge1xuICAgIGxldCBpc01hdGNoID0gcGljb21hdGNoKFN0cmluZyhwYXR0ZXJuKSwgb3B0aW9ucyk7XG4gICAgaWYgKCFpdGVtcy5ldmVyeShpdGVtID0+IGlzTWF0Y2goaXRlbSkpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgKiphbGwqKiBvZiB0aGUgZ2l2ZW4gYHBhdHRlcm5zYCBtYXRjaFxuICogdGhlIHNwZWNpZmllZCBzdHJpbmcuXG4gKlxuICogYGBganNcbiAqIGNvbnN0IG1tID0gcmVxdWlyZSgnbWljcm9tYXRjaCcpO1xuICogLy8gbW0uYWxsKHN0cmluZywgcGF0dGVybnNbLCBvcHRpb25zXSk7XG4gKlxuICogY29uc29sZS5sb2cobW0uYWxsKCdmb28uanMnLCBbJ2Zvby5qcyddKSk7XG4gKiAvLyB0cnVlXG4gKlxuICogY29uc29sZS5sb2cobW0uYWxsKCdmb28uanMnLCBbJyouanMnLCAnIWZvby5qcyddKSk7XG4gKiAvLyBmYWxzZVxuICpcbiAqIGNvbnNvbGUubG9nKG1tLmFsbCgnZm9vLmpzJywgWycqLmpzJywgJ2Zvby5qcyddKSk7XG4gKiAvLyB0cnVlXG4gKlxuICogY29uc29sZS5sb2cobW0uYWxsKCdmb28uanMnLCBbJyouanMnLCAnZionLCAnKm8qJywgJypvLmpzJ10pKTtcbiAqIC8vIHRydWVcbiAqIGBgYFxuICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IGBzdHJgIFRoZSBzdHJpbmcgdG8gdGVzdC5cbiAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBgcGF0dGVybnNgIE9uZSBvciBtb3JlIGdsb2IgcGF0dGVybnMgdG8gdXNlIGZvciBtYXRjaGluZy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBgb3B0aW9uc2AgU2VlIGF2YWlsYWJsZSBbb3B0aW9uc10oI29wdGlvbnMpIGZvciBjaGFuZ2luZyBob3cgbWF0Y2hlcyBhcmUgcGVyZm9ybWVkXG4gKiBAcmV0dXJuIHtCb29sZWFufSBSZXR1cm5zIHRydWUgaWYgYW55IHBhdHRlcm5zIG1hdGNoIGBzdHJgXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1pY3JvbWF0Y2guYWxsID0gKHN0ciwgcGF0dGVybnMsIG9wdGlvbnMpID0+IHtcbiAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgYSBzdHJpbmc6IFwiJHt1dGlsLmluc3BlY3Qoc3RyKX1cImApO1xuICB9XG5cbiAgcmV0dXJuIFtdLmNvbmNhdChwYXR0ZXJucykuZXZlcnkocCA9PiBwaWNvbWF0Y2gocCwgb3B0aW9ucykoc3RyKSk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gYXJyYXkgb2YgbWF0Y2hlcyBjYXB0dXJlZCBieSBgcGF0dGVybmAgaW4gYHN0cmluZywgb3IgYG51bGxgIGlmIHRoZSBwYXR0ZXJuIGRpZCBub3QgbWF0Y2guXG4gKlxuICogYGBganNcbiAqIGNvbnN0IG1tID0gcmVxdWlyZSgnbWljcm9tYXRjaCcpO1xuICogLy8gbW0uY2FwdHVyZShwYXR0ZXJuLCBzdHJpbmdbLCBvcHRpb25zXSk7XG4gKlxuICogY29uc29sZS5sb2cobW0uY2FwdHVyZSgndGVzdC8qLmpzJywgJ3Rlc3QvZm9vLmpzJykpO1xuICogLy89PiBbJ2ZvbyddXG4gKiBjb25zb2xlLmxvZyhtbS5jYXB0dXJlKCd0ZXN0LyouanMnLCAnZm9vL2Jhci5jc3MnKSk7XG4gKiAvLz0+IG51bGxcbiAqIGBgYFxuICogQHBhcmFtIHtTdHJpbmd9IGBnbG9iYCBHbG9iIHBhdHRlcm4gdG8gdXNlIGZvciBtYXRjaGluZy5cbiAqIEBwYXJhbSB7U3RyaW5nfSBgaW5wdXRgIFN0cmluZyB0byBtYXRjaFxuICogQHBhcmFtIHtPYmplY3R9IGBvcHRpb25zYCBTZWUgYXZhaWxhYmxlIFtvcHRpb25zXSgjb3B0aW9ucykgZm9yIGNoYW5naW5nIGhvdyBtYXRjaGVzIGFyZSBwZXJmb3JtZWRcbiAqIEByZXR1cm4ge0FycmF5fG51bGx9IFJldHVybnMgYW4gYXJyYXkgb2YgY2FwdHVyZXMgaWYgdGhlIGlucHV0IG1hdGNoZXMgdGhlIGdsb2IgcGF0dGVybiwgb3RoZXJ3aXNlIGBudWxsYC5cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubWljcm9tYXRjaC5jYXB0dXJlID0gKGdsb2IsIGlucHV0LCBvcHRpb25zKSA9PiB7XG4gIGxldCBwb3NpeCA9IHV0aWxzLmlzV2luZG93cyhvcHRpb25zKTtcbiAgbGV0IHJlZ2V4ID0gcGljb21hdGNoLm1ha2VSZShTdHJpbmcoZ2xvYiksIHsgLi4ub3B0aW9ucywgY2FwdHVyZTogdHJ1ZSB9KTtcbiAgbGV0IG1hdGNoID0gcmVnZXguZXhlYyhwb3NpeCA/IHV0aWxzLnRvUG9zaXhTbGFzaGVzKGlucHV0KSA6IGlucHV0KTtcblxuICBpZiAobWF0Y2gpIHtcbiAgICByZXR1cm4gbWF0Y2guc2xpY2UoMSkubWFwKHYgPT4gdiA9PT0gdm9pZCAwID8gJycgOiB2KTtcbiAgfVxufTtcblxuLyoqXG4gKiBDcmVhdGUgYSByZWd1bGFyIGV4cHJlc3Npb24gZnJvbSB0aGUgZ2l2ZW4gZ2xvYiBgcGF0dGVybmAuXG4gKlxuICogYGBganNcbiAqIGNvbnN0IG1tID0gcmVxdWlyZSgnbWljcm9tYXRjaCcpO1xuICogLy8gbW0ubWFrZVJlKHBhdHRlcm5bLCBvcHRpb25zXSk7XG4gKlxuICogY29uc29sZS5sb2cobW0ubWFrZVJlKCcqLmpzJykpO1xuICogLy89PiAvXig/OihcXC5bXFxcXFxcL10pPyg/IVxcLikoPz0uKVteXFwvXSo/XFwuanMpJC9cbiAqIGBgYFxuICogQHBhcmFtIHtTdHJpbmd9IGBwYXR0ZXJuYCBBIGdsb2IgcGF0dGVybiB0byBjb252ZXJ0IHRvIHJlZ2V4LlxuICogQHBhcmFtIHtPYmplY3R9IGBvcHRpb25zYFxuICogQHJldHVybiB7UmVnRXhwfSBSZXR1cm5zIGEgcmVnZXggY3JlYXRlZCBmcm9tIHRoZSBnaXZlbiBwYXR0ZXJuLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5taWNyb21hdGNoLm1ha2VSZSA9ICguLi5hcmdzKSA9PiBwaWNvbWF0Y2gubWFrZVJlKC4uLmFyZ3MpO1xuXG4vKipcbiAqIFNjYW4gYSBnbG9iIHBhdHRlcm4gdG8gc2VwYXJhdGUgdGhlIHBhdHRlcm4gaW50byBzZWdtZW50cy4gVXNlZFxuICogYnkgdGhlIFtzcGxpdF0oI3NwbGl0KSBtZXRob2QuXG4gKlxuICogYGBganNcbiAqIGNvbnN0IG1tID0gcmVxdWlyZSgnbWljcm9tYXRjaCcpO1xuICogY29uc3Qgc3RhdGUgPSBtbS5zY2FuKHBhdHRlcm5bLCBvcHRpb25zXSk7XG4gKiBgYGBcbiAqIEBwYXJhbSB7U3RyaW5nfSBgcGF0dGVybmBcbiAqIEBwYXJhbSB7T2JqZWN0fSBgb3B0aW9uc2BcbiAqIEByZXR1cm4ge09iamVjdH0gUmV0dXJucyBhbiBvYmplY3Qgd2l0aFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5taWNyb21hdGNoLnNjYW4gPSAoLi4uYXJncykgPT4gcGljb21hdGNoLnNjYW4oLi4uYXJncyk7XG5cbi8qKlxuICogUGFyc2UgYSBnbG9iIHBhdHRlcm4gdG8gY3JlYXRlIHRoZSBzb3VyY2Ugc3RyaW5nIGZvciBhIHJlZ3VsYXJcbiAqIGV4cHJlc3Npb24uXG4gKlxuICogYGBganNcbiAqIGNvbnN0IG1tID0gcmVxdWlyZSgnbWljcm9tYXRjaCcpO1xuICogY29uc3Qgc3RhdGUgPSBtbS5wYXJzZShwYXR0ZXJuWywgb3B0aW9uc10pO1xuICogYGBgXG4gKiBAcGFyYW0ge1N0cmluZ30gYGdsb2JgXG4gKiBAcGFyYW0ge09iamVjdH0gYG9wdGlvbnNgXG4gKiBAcmV0dXJuIHtPYmplY3R9IFJldHVybnMgYW4gb2JqZWN0IHdpdGggdXNlZnVsIHByb3BlcnRpZXMgYW5kIG91dHB1dCB0byBiZSB1c2VkIGFzIHJlZ2V4IHNvdXJjZSBzdHJpbmcuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1pY3JvbWF0Y2gucGFyc2UgPSAocGF0dGVybnMsIG9wdGlvbnMpID0+IHtcbiAgbGV0IHJlcyA9IFtdO1xuICBmb3IgKGxldCBwYXR0ZXJuIG9mIFtdLmNvbmNhdChwYXR0ZXJucyB8fCBbXSkpIHtcbiAgICBmb3IgKGxldCBzdHIgb2YgYnJhY2VzKFN0cmluZyhwYXR0ZXJuKSwgb3B0aW9ucykpIHtcbiAgICAgIHJlcy5wdXNoKHBpY29tYXRjaC5wYXJzZShzdHIsIG9wdGlvbnMpKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlcztcbn07XG5cbi8qKlxuICogUHJvY2VzcyB0aGUgZ2l2ZW4gYnJhY2UgYHBhdHRlcm5gLlxuICpcbiAqIGBgYGpzXG4gKiBjb25zdCB7IGJyYWNlcyB9ID0gcmVxdWlyZSgnbWljcm9tYXRjaCcpO1xuICogY29uc29sZS5sb2coYnJhY2VzKCdmb28ve2EsYixjfS9iYXInKSk7XG4gKiAvLz0+IFsgJ2Zvby8oYXxifGMpL2JhcicgXVxuICpcbiAqIGNvbnNvbGUubG9nKGJyYWNlcygnZm9vL3thLGIsY30vYmFyJywgeyBleHBhbmQ6IHRydWUgfSkpO1xuICogLy89PiBbICdmb28vYS9iYXInLCAnZm9vL2IvYmFyJywgJ2Zvby9jL2JhcicgXVxuICogYGBgXG4gKiBAcGFyYW0ge1N0cmluZ30gYHBhdHRlcm5gIFN0cmluZyB3aXRoIGJyYWNlIHBhdHRlcm4gdG8gcHJvY2Vzcy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBgb3B0aW9uc2AgQW55IFtvcHRpb25zXSgjb3B0aW9ucykgdG8gY2hhbmdlIGhvdyBleHBhbnNpb24gaXMgcGVyZm9ybWVkLiBTZWUgdGhlIFticmFjZXNdW10gbGlicmFyeSBmb3IgYWxsIGF2YWlsYWJsZSBvcHRpb25zLlxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1pY3JvbWF0Y2guYnJhY2VzID0gKHBhdHRlcm4sIG9wdGlvbnMpID0+IHtcbiAgaWYgKHR5cGVvZiBwYXR0ZXJuICE9PSAnc3RyaW5nJykgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYSBzdHJpbmcnKTtcbiAgaWYgKChvcHRpb25zICYmIG9wdGlvbnMubm9icmFjZSA9PT0gdHJ1ZSkgfHwgIS9cXHsuKlxcfS8udGVzdChwYXR0ZXJuKSkge1xuICAgIHJldHVybiBbcGF0dGVybl07XG4gIH1cbiAgcmV0dXJuIGJyYWNlcyhwYXR0ZXJuLCBvcHRpb25zKTtcbn07XG5cbi8qKlxuICogRXhwYW5kIGJyYWNlc1xuICovXG5cbm1pY3JvbWF0Y2guYnJhY2VFeHBhbmQgPSAocGF0dGVybiwgb3B0aW9ucykgPT4ge1xuICBpZiAodHlwZW9mIHBhdHRlcm4gIT09ICdzdHJpbmcnKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhIHN0cmluZycpO1xuICByZXR1cm4gbWljcm9tYXRjaC5icmFjZXMocGF0dGVybiwgeyAuLi5vcHRpb25zLCBleHBhbmQ6IHRydWUgfSk7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBtaWNyb21hdGNoXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBtaWNyb21hdGNoO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLm1hdGNoID0gdm9pZCAwO1xuY29uc3QgaXNHbG9iID0gcmVxdWlyZShcImlzLWdsb2JcIik7XG5jb25zdCBtaWNyb21hdGNoID0gcmVxdWlyZShcIm1pY3JvbWF0Y2hcIik7XG5jb25zdCB1cmwgPSByZXF1aXJlKFwidXJsXCIpO1xuY29uc3QgZXJyb3JzXzEgPSByZXF1aXJlKFwiLi9lcnJvcnNcIik7XG5mdW5jdGlvbiBtYXRjaChjb250ZXh0LCB1cmksIHJlcSkge1xuICAgIC8vIHNpbmdsZSBwYXRoXG4gICAgaWYgKGlzU3RyaW5nUGF0aChjb250ZXh0KSkge1xuICAgICAgICByZXR1cm4gbWF0Y2hTaW5nbGVTdHJpbmdQYXRoKGNvbnRleHQsIHVyaSk7XG4gICAgfVxuICAgIC8vIHNpbmdsZSBnbG9iIHBhdGhcbiAgICBpZiAoaXNHbG9iUGF0aChjb250ZXh0KSkge1xuICAgICAgICByZXR1cm4gbWF0Y2hTaW5nbGVHbG9iUGF0aChjb250ZXh0LCB1cmkpO1xuICAgIH1cbiAgICAvLyBtdWx0aSBwYXRoXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY29udGV4dCkpIHtcbiAgICAgICAgaWYgKGNvbnRleHQuZXZlcnkoaXNTdHJpbmdQYXRoKSkge1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoTXVsdGlQYXRoKGNvbnRleHQsIHVyaSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbnRleHQuZXZlcnkoaXNHbG9iUGF0aCkpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXRjaE11bHRpR2xvYlBhdGgoY29udGV4dCwgdXJpKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JzXzEuRVJST1JTLkVSUl9DT05URVhUX01BVENIRVJfSU5WQUxJRF9BUlJBWSk7XG4gICAgfVxuICAgIC8vIGN1c3RvbSBtYXRjaGluZ1xuICAgIGlmICh0eXBlb2YgY29udGV4dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjb25zdCBwYXRobmFtZSA9IGdldFVybFBhdGhOYW1lKHVyaSk7XG4gICAgICAgIHJldHVybiBjb250ZXh0KHBhdGhuYW1lLCByZXEpO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JzXzEuRVJST1JTLkVSUl9DT05URVhUX01BVENIRVJfR0VORVJJQyk7XG59XG5leHBvcnRzLm1hdGNoID0gbWF0Y2g7XG4vKipcbiAqIEBwYXJhbSAge1N0cmluZ30gY29udGV4dCAnL2FwaSdcbiAqIEBwYXJhbSAge1N0cmluZ30gdXJpICAgICAnaHR0cDovL2V4YW1wbGUub3JnL2FwaS9iL2MvZC5odG1sJ1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gbWF0Y2hTaW5nbGVTdHJpbmdQYXRoKGNvbnRleHQsIHVyaSkge1xuICAgIGNvbnN0IHBhdGhuYW1lID0gZ2V0VXJsUGF0aE5hbWUodXJpKTtcbiAgICByZXR1cm4gcGF0aG5hbWUuaW5kZXhPZihjb250ZXh0KSA9PT0gMDtcbn1cbmZ1bmN0aW9uIG1hdGNoU2luZ2xlR2xvYlBhdGgocGF0dGVybiwgdXJpKSB7XG4gICAgY29uc3QgcGF0aG5hbWUgPSBnZXRVcmxQYXRoTmFtZSh1cmkpO1xuICAgIGNvbnN0IG1hdGNoZXMgPSBtaWNyb21hdGNoKFtwYXRobmFtZV0sIHBhdHRlcm4pO1xuICAgIHJldHVybiBtYXRjaGVzICYmIG1hdGNoZXMubGVuZ3RoID4gMDtcbn1cbmZ1bmN0aW9uIG1hdGNoTXVsdGlHbG9iUGF0aChwYXR0ZXJuTGlzdCwgdXJpKSB7XG4gICAgcmV0dXJuIG1hdGNoU2luZ2xlR2xvYlBhdGgocGF0dGVybkxpc3QsIHVyaSk7XG59XG4vKipcbiAqIEBwYXJhbSAge1N0cmluZ30gY29udGV4dExpc3QgWycvYXBpJywgJy9hamF4J11cbiAqIEBwYXJhbSAge1N0cmluZ30gdXJpICAgICAnaHR0cDovL2V4YW1wbGUub3JnL2FwaS9iL2MvZC5odG1sJ1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gbWF0Y2hNdWx0aVBhdGgoY29udGV4dExpc3QsIHVyaSkge1xuICAgIGxldCBpc011bHRpUGF0aCA9IGZhbHNlO1xuICAgIGZvciAoY29uc3QgY29udGV4dCBvZiBjb250ZXh0TGlzdCkge1xuICAgICAgICBpZiAobWF0Y2hTaW5nbGVTdHJpbmdQYXRoKGNvbnRleHQsIHVyaSkpIHtcbiAgICAgICAgICAgIGlzTXVsdGlQYXRoID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpc011bHRpUGF0aDtcbn1cbi8qKlxuICogUGFyc2VzIFVSSSBhbmQgcmV0dXJucyBSRkMgMzk4NiBwYXRoXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSB1cmkgZnJvbSByZXEudXJsXG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICBSRkMgMzk4NiBwYXRoXG4gKi9cbmZ1bmN0aW9uIGdldFVybFBhdGhOYW1lKHVyaSkge1xuICAgIHJldHVybiB1cmkgJiYgdXJsLnBhcnNlKHVyaSkucGF0aG5hbWU7XG59XG5mdW5jdGlvbiBpc1N0cmluZ1BhdGgoY29udGV4dCkge1xuICAgIHJldHVybiB0eXBlb2YgY29udGV4dCA9PT0gJ3N0cmluZycgJiYgIWlzR2xvYihjb250ZXh0KTtcbn1cbmZ1bmN0aW9uIGlzR2xvYlBhdGgoY29udGV4dCkge1xuICAgIHJldHVybiBpc0dsb2IoY29udGV4dCk7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZ2V0SGFuZGxlcnMgPSBleHBvcnRzLmluaXQgPSB2b2lkIDA7XG5jb25zdCBsb2dnZXJfMSA9IHJlcXVpcmUoXCIuL2xvZ2dlclwiKTtcbmNvbnN0IGxvZ2dlciA9ICgwLCBsb2dnZXJfMS5nZXRJbnN0YW5jZSkoKTtcbmZ1bmN0aW9uIGluaXQocHJveHksIG9wdGlvbikge1xuICAgIGNvbnN0IGhhbmRsZXJzID0gZ2V0SGFuZGxlcnMob3B0aW9uKTtcbiAgICBmb3IgKGNvbnN0IGV2ZW50TmFtZSBvZiBPYmplY3Qua2V5cyhoYW5kbGVycykpIHtcbiAgICAgICAgcHJveHkub24oZXZlbnROYW1lLCBoYW5kbGVyc1tldmVudE5hbWVdKTtcbiAgICB9XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2svd2VicGFjay1kZXYtc2VydmVyL2lzc3Vlcy8xNjQyXG4gICAgcHJveHkub24oJ2Vjb25ucmVzZXQnLCAoZXJyb3IsIHJlcSwgcmVzLCB0YXJnZXQpID0+IHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKGBbSFBNXSBFQ09OTlJFU0VUOiAlT2AsIGVycm9yKTtcbiAgICB9KTtcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vd2VicGFjay93ZWJwYWNrLWRldi1zZXJ2ZXIvaXNzdWVzLzE2NDIjaXNzdWVjb21tZW50LTExMDQzMjUxMjBcbiAgICBwcm94eS5vbigncHJveHlSZXFXcycsIChwcm94eVJlcSwgcmVxLCBzb2NrZXQsIG9wdGlvbnMsIGhlYWQpID0+IHtcbiAgICAgICAgc29ja2V0Lm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBbSFBNXSBXZWJTb2NrZXQgZXJyb3I6ICVPYCwgZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICBsb2dnZXIuZGVidWcoJ1tIUE1dIFN1YnNjcmliZWQgdG8gaHR0cC1wcm94eSBldmVudHM6JywgT2JqZWN0LmtleXMoaGFuZGxlcnMpKTtcbn1cbmV4cG9ydHMuaW5pdCA9IGluaXQ7XG5mdW5jdGlvbiBnZXRIYW5kbGVycyhvcHRpb25zKSB7XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqaXRzdS9ub2RlLWh0dHAtcHJveHkjbGlzdGVuaW5nLWZvci1wcm94eS1ldmVudHNcbiAgICBjb25zdCBwcm94eUV2ZW50c01hcCA9IHtcbiAgICAgICAgZXJyb3I6ICdvbkVycm9yJyxcbiAgICAgICAgcHJveHlSZXE6ICdvblByb3h5UmVxJyxcbiAgICAgICAgcHJveHlSZXFXczogJ29uUHJveHlSZXFXcycsXG4gICAgICAgIHByb3h5UmVzOiAnb25Qcm94eVJlcycsXG4gICAgICAgIG9wZW46ICdvbk9wZW4nLFxuICAgICAgICBjbG9zZTogJ29uQ2xvc2UnLFxuICAgIH07XG4gICAgY29uc3QgaGFuZGxlcnMgPSB7fTtcbiAgICBmb3IgKGNvbnN0IFtldmVudE5hbWUsIG9uRXZlbnROYW1lXSBvZiBPYmplY3QuZW50cmllcyhwcm94eUV2ZW50c01hcCkpIHtcbiAgICAgICAgLy8gYWxsIGhhbmRsZXJzIGZvciB0aGUgaHR0cC1wcm94eSBldmVudHMgYXJlIHByZWZpeGVkIHdpdGggJ29uJy5cbiAgICAgICAgLy8gbG9vcCB0aHJvdWdoIG9wdGlvbnMgYW5kIHRyeSB0byBmaW5kIHRoZXNlIGhhbmRsZXJzXG4gICAgICAgIC8vIGFuZCBhZGQgdGhlbSB0byB0aGUgaGFuZGxlcnMgb2JqZWN0IGZvciBzdWJzY3JpcHRpb24gaW4gaW5pdCgpLlxuICAgICAgICBjb25zdCBmbkhhbmRsZXIgPSBvcHRpb25zID8gb3B0aW9uc1tvbkV2ZW50TmFtZV0gOiBudWxsO1xuICAgICAgICBpZiAodHlwZW9mIGZuSGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgaGFuZGxlcnNbZXZlbnROYW1lXSA9IGZuSGFuZGxlcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBhZGQgZGVmYXVsdCBlcnJvciBoYW5kbGVyIGluIGFic2VuY2Ugb2YgZXJyb3IgaGFuZGxlclxuICAgIGlmICh0eXBlb2YgaGFuZGxlcnMuZXJyb3IgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgaGFuZGxlcnMuZXJyb3IgPSBkZWZhdWx0RXJyb3JIYW5kbGVyO1xuICAgIH1cbiAgICAvLyBhZGQgZGVmYXVsdCBjbG9zZSBoYW5kbGVyIGluIGFic2VuY2Ugb2YgY2xvc2UgaGFuZGxlclxuICAgIGlmICh0eXBlb2YgaGFuZGxlcnMuY2xvc2UgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgaGFuZGxlcnMuY2xvc2UgPSBsb2dDbG9zZTtcbiAgICB9XG4gICAgcmV0dXJuIGhhbmRsZXJzO1xufVxuZXhwb3J0cy5nZXRIYW5kbGVycyA9IGdldEhhbmRsZXJzO1xuZnVuY3Rpb24gZGVmYXVsdEVycm9ySGFuZGxlcihlcnIsIHJlcSwgcmVzKSB7XG4gICAgLy8gUmUtdGhyb3cgZXJyb3IuIE5vdCByZWNvdmVyYWJsZSBzaW5jZSByZXEgJiByZXMgYXJlIGVtcHR5LlxuICAgIGlmICghcmVxICYmICFyZXMpIHtcbiAgICAgICAgdGhyb3cgZXJyOyAvLyBcIkVycm9yOiBNdXN0IHByb3ZpZGUgYSBwcm9wZXIgVVJMIGFzIHRhcmdldFwiXG4gICAgfVxuICAgIGNvbnN0IGhvc3QgPSByZXEuaGVhZGVycyAmJiByZXEuaGVhZGVycy5ob3N0O1xuICAgIGNvbnN0IGNvZGUgPSBlcnIuY29kZTtcbiAgICBpZiAocmVzLndyaXRlSGVhZCAmJiAhcmVzLmhlYWRlcnNTZW50KSB7XG4gICAgICAgIGlmICgvSFBFX0lOVkFMSUQvLnRlc3QoY29kZSkpIHtcbiAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHN3aXRjaCAoY29kZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ0VDT05OUkVTRVQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ0VOT1RGT1VORCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnRUNPTk5SRUZVU0VEJzpcbiAgICAgICAgICAgICAgICBjYXNlICdFVElNRURPVVQnOlxuICAgICAgICAgICAgICAgICAgICByZXMud3JpdGVIZWFkKDUwNCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJlcy53cml0ZUhlYWQoNTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXMuZW5kKGBFcnJvciBvY2N1cnJlZCB3aGlsZSB0cnlpbmcgdG8gcHJveHk6ICR7aG9zdH0ke3JlcS51cmx9YCk7XG59XG5mdW5jdGlvbiBsb2dDbG9zZShyZXEsIHNvY2tldCwgaGVhZCkge1xuICAgIC8vIHZpZXcgZGlzY29ubmVjdGVkIHdlYnNvY2tldCBjb25uZWN0aW9uc1xuICAgIGxvZ2dlci5pbmZvKCdbSFBNXSBDbGllbnQgZGlzY29ubmVjdGVkJyk7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuY3JlYXRlUGF0aFJld3JpdGVyID0gdm9pZCAwO1xuY29uc3QgaXNQbGFpbk9iaiA9IHJlcXVpcmUoXCJpcy1wbGFpbi1vYmpcIik7XG5jb25zdCBlcnJvcnNfMSA9IHJlcXVpcmUoXCIuL2Vycm9yc1wiKTtcbmNvbnN0IGxvZ2dlcl8xID0gcmVxdWlyZShcIi4vbG9nZ2VyXCIpO1xuY29uc3QgbG9nZ2VyID0gKDAsIGxvZ2dlcl8xLmdldEluc3RhbmNlKSgpO1xuLyoqXG4gKiBDcmVhdGUgcmV3cml0ZSBmdW5jdGlvbiwgdG8gY2FjaGUgcGFyc2VkIHJld3JpdGUgcnVsZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHJld3JpdGVDb25maWdcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBGdW5jdGlvbiB0byByZXdyaXRlIHBhdGhzOyBUaGlzIGZ1bmN0aW9uIHNob3VsZCBhY2NlcHQgYHBhdGhgIChyZXF1ZXN0LnVybCkgYXMgcGFyYW1ldGVyXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVBhdGhSZXdyaXRlcihyZXdyaXRlQ29uZmlnKSB7XG4gICAgbGV0IHJ1bGVzQ2FjaGU7XG4gICAgaWYgKCFpc1ZhbGlkUmV3cml0ZUNvbmZpZyhyZXdyaXRlQ29uZmlnKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0eXBlb2YgcmV3cml0ZUNvbmZpZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjb25zdCBjdXN0b21SZXdyaXRlRm4gPSByZXdyaXRlQ29uZmlnO1xuICAgICAgICByZXR1cm4gY3VzdG9tUmV3cml0ZUZuO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcnVsZXNDYWNoZSA9IHBhcnNlUGF0aFJld3JpdGVSdWxlcyhyZXdyaXRlQ29uZmlnKTtcbiAgICAgICAgcmV0dXJuIHJld3JpdGVQYXRoO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZXdyaXRlUGF0aChwYXRoKSB7XG4gICAgICAgIGxldCByZXN1bHQgPSBwYXRoO1xuICAgICAgICBmb3IgKGNvbnN0IHJ1bGUgb2YgcnVsZXNDYWNoZSkge1xuICAgICAgICAgICAgaWYgKHJ1bGUucmVnZXgudGVzdChwYXRoKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKHJ1bGUucmVnZXgsIHJ1bGUudmFsdWUpO1xuICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnW0hQTV0gUmV3cml0aW5nIHBhdGggZnJvbSBcIiVzXCIgdG8gXCIlc1wiJywgcGF0aCwgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn1cbmV4cG9ydHMuY3JlYXRlUGF0aFJld3JpdGVyID0gY3JlYXRlUGF0aFJld3JpdGVyO1xuZnVuY3Rpb24gaXNWYWxpZFJld3JpdGVDb25maWcocmV3cml0ZUNvbmZpZykge1xuICAgIGlmICh0eXBlb2YgcmV3cml0ZUNvbmZpZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaXNQbGFpbk9iaihyZXdyaXRlQ29uZmlnKSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMocmV3cml0ZUNvbmZpZykubGVuZ3RoICE9PSAwO1xuICAgIH1cbiAgICBlbHNlIGlmIChyZXdyaXRlQ29uZmlnID09PSB1bmRlZmluZWQgfHwgcmV3cml0ZUNvbmZpZyA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JzXzEuRVJST1JTLkVSUl9QQVRIX1JFV1JJVEVSX0NPTkZJRyk7XG4gICAgfVxufVxuZnVuY3Rpb24gcGFyc2VQYXRoUmV3cml0ZVJ1bGVzKHJld3JpdGVDb25maWcpIHtcbiAgICBjb25zdCBydWxlcyA9IFtdO1xuICAgIGlmIChpc1BsYWluT2JqKHJld3JpdGVDb25maWcpKSB7XG4gICAgICAgIGZvciAoY29uc3QgW2tleV0gb2YgT2JqZWN0LmVudHJpZXMocmV3cml0ZUNvbmZpZykpIHtcbiAgICAgICAgICAgIHJ1bGVzLnB1c2goe1xuICAgICAgICAgICAgICAgIHJlZ2V4OiBuZXcgUmVnRXhwKGtleSksXG4gICAgICAgICAgICAgICAgdmFsdWU6IHJld3JpdGVDb25maWdba2V5XSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1tIUE1dIFByb3h5IHJld3JpdGUgcnVsZSBjcmVhdGVkOiBcIiVzXCIgfj4gXCIlc1wiJywga2V5LCByZXdyaXRlQ29uZmlnW2tleV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBydWxlcztcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5nZXRUYXJnZXQgPSB2b2lkIDA7XG5jb25zdCBpc1BsYWluT2JqID0gcmVxdWlyZShcImlzLXBsYWluLW9ialwiKTtcbmNvbnN0IGxvZ2dlcl8xID0gcmVxdWlyZShcIi4vbG9nZ2VyXCIpO1xuY29uc3QgbG9nZ2VyID0gKDAsIGxvZ2dlcl8xLmdldEluc3RhbmNlKSgpO1xuYXN5bmMgZnVuY3Rpb24gZ2V0VGFyZ2V0KHJlcSwgY29uZmlnKSB7XG4gICAgbGV0IG5ld1RhcmdldDtcbiAgICBjb25zdCByb3V0ZXIgPSBjb25maWcucm91dGVyO1xuICAgIGlmIChpc1BsYWluT2JqKHJvdXRlcikpIHtcbiAgICAgICAgbmV3VGFyZ2V0ID0gZ2V0VGFyZ2V0RnJvbVByb3h5VGFibGUocmVxLCByb3V0ZXIpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2Ygcm91dGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIG5ld1RhcmdldCA9IGF3YWl0IHJvdXRlcihyZXEpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3VGFyZ2V0O1xufVxuZXhwb3J0cy5nZXRUYXJnZXQgPSBnZXRUYXJnZXQ7XG5mdW5jdGlvbiBnZXRUYXJnZXRGcm9tUHJveHlUYWJsZShyZXEsIHRhYmxlKSB7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBjb25zdCBob3N0ID0gcmVxLmhlYWRlcnMuaG9zdDtcbiAgICBjb25zdCBwYXRoID0gcmVxLnVybDtcbiAgICBjb25zdCBob3N0QW5kUGF0aCA9IGhvc3QgKyBwYXRoO1xuICAgIGZvciAoY29uc3QgW2tleV0gb2YgT2JqZWN0LmVudHJpZXModGFibGUpKSB7XG4gICAgICAgIGlmIChjb250YWluc1BhdGgoa2V5KSkge1xuICAgICAgICAgICAgaWYgKGhvc3RBbmRQYXRoLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gbWF0Y2ggJ2xvY2FsaG9zdDozMDAwL2FwaSdcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0YWJsZVtrZXldO1xuICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnW0hQTV0gUm91dGVyIHRhYmxlIG1hdGNoOiBcIiVzXCInLCBrZXkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gaG9zdCkge1xuICAgICAgICAgICAgICAgIC8vIG1hdGNoICdsb2NhbGhvc3Q6MzAwMCdcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB0YWJsZVtrZXldO1xuICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnW0hQTV0gUm91dGVyIHRhYmxlIG1hdGNoOiBcIiVzXCInLCBob3N0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gY29udGFpbnNQYXRoKHYpIHtcbiAgICByZXR1cm4gdi5pbmRleE9mKCcvJykgPiAtMTtcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5IdHRwUHJveHlNaWRkbGV3YXJlID0gdm9pZCAwO1xuY29uc3QgaHR0cFByb3h5ID0gcmVxdWlyZShcImh0dHAtcHJveHlcIik7XG5jb25zdCBjb25maWdfZmFjdG9yeV8xID0gcmVxdWlyZShcIi4vY29uZmlnLWZhY3RvcnlcIik7XG5jb25zdCBjb250ZXh0TWF0Y2hlciA9IHJlcXVpcmUoXCIuL2NvbnRleHQtbWF0Y2hlclwiKTtcbmNvbnN0IGhhbmRsZXJzID0gcmVxdWlyZShcIi4vX2hhbmRsZXJzXCIpO1xuY29uc3QgbG9nZ2VyXzEgPSByZXF1aXJlKFwiLi9sb2dnZXJcIik7XG5jb25zdCBQYXRoUmV3cml0ZXIgPSByZXF1aXJlKFwiLi9wYXRoLXJld3JpdGVyXCIpO1xuY29uc3QgUm91dGVyID0gcmVxdWlyZShcIi4vcm91dGVyXCIpO1xuY2xhc3MgSHR0cFByb3h5TWlkZGxld2FyZSB7XG4gICAgY29uc3RydWN0b3IoY29udGV4dCwgb3B0cykge1xuICAgICAgICB0aGlzLmxvZ2dlciA9ICgwLCBsb2dnZXJfMS5nZXRJbnN0YW5jZSkoKTtcbiAgICAgICAgdGhpcy53c0ludGVybmFsU3Vic2NyaWJlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNlcnZlck9uQ2xvc2VTdWJzY3JpYmVkID0gZmFsc2U7XG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC93aWtpLyd0aGlzJy1pbi1UeXBlU2NyaXB0I3JlZC1mbGFncy1mb3ItdGhpc1xuICAgICAgICB0aGlzLm1pZGRsZXdhcmUgPSBhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgICAgIHZhciBfYSwgX2I7XG4gICAgICAgICAgICBpZiAodGhpcy5zaG91bGRQcm94eSh0aGlzLmNvbmZpZy5jb250ZXh0LCByZXEpKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWN0aXZlUHJveHlPcHRpb25zID0gYXdhaXQgdGhpcy5wcmVwYXJlUHJveHlSZXF1ZXN0KHJlcSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJveHkud2ViKHJlcSwgcmVzLCBhY3RpdmVQcm94eU9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHQoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEdldCB0aGUgc2VydmVyIG9iamVjdCB0byBzdWJzY3JpYmUgdG8gc2VydmVyIGV2ZW50cztcbiAgICAgICAgICAgICAqICd1cGdyYWRlJyBmb3Igd2Vic29ja2V0IGFuZCAnY2xvc2UnIGZvciBncmFjZWZ1bCBzaHV0ZG93blxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIE5PVEU6XG4gICAgICAgICAgICAgKiByZXEuc29ja2V0OiBub2RlID49IDEzXG4gICAgICAgICAgICAgKiByZXEuY29ubmVjdGlvbjogbm9kZSA8IDEzIChSZW1vdmUgdGhpcyB3aGVuIG5vZGUgMTIvMTMgc3VwcG9ydCBpcyBkcm9wcGVkKVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBzZXJ2ZXIgPSAoX2IgPSAoKF9hID0gcmVxLnNvY2tldCkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogcmVxLmNvbm5lY3Rpb24pKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Iuc2VydmVyO1xuICAgICAgICAgICAgaWYgKHNlcnZlciAmJiAhdGhpcy5zZXJ2ZXJPbkNsb3NlU3Vic2NyaWJlZCkge1xuICAgICAgICAgICAgICAgIHNlcnZlci5vbignY2xvc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmluZm8oJ1tIUE1dIHNlcnZlciBjbG9zZSBzaWduYWwgcmVjZWl2ZWQ6IGNsb3NpbmcgcHJveHkgc2VydmVyJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJveHkuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlcnZlck9uQ2xvc2VTdWJzY3JpYmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnByb3h5T3B0aW9ucy53cyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIC8vIHVzZSBpbml0aWFsIHJlcXVlc3QgdG8gYWNjZXNzIHRoZSBzZXJ2ZXIgb2JqZWN0IHRvIHN1YnNjcmliZSB0byBodHRwIHVwZ3JhZGUgZXZlbnRcbiAgICAgICAgICAgICAgICB0aGlzLmNhdGNoVXBncmFkZVJlcXVlc3Qoc2VydmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jYXRjaFVwZ3JhZGVSZXF1ZXN0ID0gKHNlcnZlcikgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLndzSW50ZXJuYWxTdWJzY3JpYmVkKSB7XG4gICAgICAgICAgICAgICAgc2VydmVyLm9uKCd1cGdyYWRlJywgdGhpcy5oYW5kbGVVcGdyYWRlKTtcbiAgICAgICAgICAgICAgICAvLyBwcmV2ZW50IGR1cGxpY2F0ZSB1cGdyYWRlIGhhbmRsaW5nO1xuICAgICAgICAgICAgICAgIC8vIGluIGNhc2UgZXh0ZXJuYWwgdXBncmFkZSBpcyBhbHNvIGNvbmZpZ3VyZWRcbiAgICAgICAgICAgICAgICB0aGlzLndzSW50ZXJuYWxTdWJzY3JpYmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5oYW5kbGVVcGdyYWRlID0gYXN5bmMgKHJlcSwgc29ja2V0LCBoZWFkKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5zaG91bGRQcm94eSh0aGlzLmNvbmZpZy5jb250ZXh0LCByZXEpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWN0aXZlUHJveHlPcHRpb25zID0gYXdhaXQgdGhpcy5wcmVwYXJlUHJveHlSZXF1ZXN0KHJlcSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm94eS53cyhyZXEsIHNvY2tldCwgaGVhZCwgYWN0aXZlUHJveHlPcHRpb25zKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5pbmZvKCdbSFBNXSBVcGdyYWRpbmcgdG8gV2ViU29ja2V0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZXRlcm1pbmUgd2hldGhlciByZXF1ZXN0IHNob3VsZCBiZSBwcm94aWVkLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IGNvbnRleHQgW2Rlc2NyaXB0aW9uXVxuICAgICAgICAgKiBAcGFyYW0gIHtPYmplY3R9IHJlcSAgICAgW2Rlc2NyaXB0aW9uXVxuICAgICAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zaG91bGRQcm94eSA9IChjb250ZXh0LCByZXEpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBhdGggPSByZXEub3JpZ2luYWxVcmwgfHwgcmVxLnVybDtcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0TWF0Y2hlci5tYXRjaChjb250ZXh0LCBwYXRoLCByZXEpO1xuICAgICAgICB9O1xuICAgICAgICAvKipcbiAgICAgICAgICogQXBwbHkgb3B0aW9uLnJvdXRlciBhbmQgb3B0aW9uLnBhdGhSZXdyaXRlXG4gICAgICAgICAqIE9yZGVyIG1hdHRlcnM6XG4gICAgICAgICAqICAgIFJvdXRlciB1c2VzIG9yaWdpbmFsIHBhdGggZm9yIHJvdXRpbmc7XG4gICAgICAgICAqICAgIE5PVCB0aGUgbW9kaWZpZWQgcGF0aCwgYWZ0ZXIgaXQgaGFzIGJlZW4gcmV3cml0dGVuIGJ5IHBhdGhSZXdyaXRlXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSByZXFcbiAgICAgICAgICogQHJldHVybiB7T2JqZWN0fSBwcm94eSBvcHRpb25zXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnByZXBhcmVQcm94eVJlcXVlc3QgPSBhc3luYyAocmVxKSA9PiB7XG4gICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vY2hpbXVyYWkvaHR0cC1wcm94eS1taWRkbGV3YXJlL2lzc3Vlcy8xN1xuICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2NoaW11cmFpL2h0dHAtcHJveHktbWlkZGxld2FyZS9pc3N1ZXMvOTRcbiAgICAgICAgICAgIHJlcS51cmwgPSByZXEub3JpZ2luYWxVcmwgfHwgcmVxLnVybDtcbiAgICAgICAgICAgIC8vIHN0b3JlIHVyaSBiZWZvcmUgaXQgZ2V0cyByZXdyaXR0ZW4gZm9yIGxvZ2dpbmdcbiAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsUGF0aCA9IHJlcS51cmw7XG4gICAgICAgICAgICBjb25zdCBuZXdQcm94eU9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb3h5T3B0aW9ucyk7XG4gICAgICAgICAgICAvLyBBcHBseSBpbiBvcmRlcjpcbiAgICAgICAgICAgIC8vIDEuIG9wdGlvbi5yb3V0ZXJcbiAgICAgICAgICAgIC8vIDIuIG9wdGlvbi5wYXRoUmV3cml0ZVxuICAgICAgICAgICAgYXdhaXQgdGhpcy5hcHBseVJvdXRlcihyZXEsIG5ld1Byb3h5T3B0aW9ucyk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmFwcGx5UGF0aFJld3JpdGUocmVxLCB0aGlzLnBhdGhSZXdyaXRlcik7XG4gICAgICAgICAgICAvLyBkZWJ1ZyBsb2dnaW5nIGZvciBib3RoIGh0dHAocykgYW5kIHdlYnNvY2tldHNcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3h5T3B0aW9ucy5sb2dMZXZlbCA9PT0gJ2RlYnVnJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFycm93ID0gKDAsIGxvZ2dlcl8xLmdldEFycm93KShvcmlnaW5hbFBhdGgsIHJlcS51cmwsIHRoaXMucHJveHlPcHRpb25zLnRhcmdldCwgbmV3UHJveHlPcHRpb25zLnRhcmdldCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoJ1tIUE1dICVzICVzICVzICVzJywgcmVxLm1ldGhvZCwgb3JpZ2luYWxQYXRoLCBhcnJvdywgbmV3UHJveHlPcHRpb25zLnRhcmdldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV3UHJveHlPcHRpb25zO1xuICAgICAgICB9O1xuICAgICAgICAvLyBNb2RpZnkgb3B0aW9uLnRhcmdldCB3aGVuIHJvdXRlciBwcmVzZW50LlxuICAgICAgICB0aGlzLmFwcGx5Um91dGVyID0gYXN5bmMgKHJlcSwgb3B0aW9ucykgPT4ge1xuICAgICAgICAgICAgbGV0IG5ld1RhcmdldDtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnJvdXRlcikge1xuICAgICAgICAgICAgICAgIG5ld1RhcmdldCA9IGF3YWl0IFJvdXRlci5nZXRUYXJnZXQocmVxLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBpZiAobmV3VGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdbSFBNXSBSb3V0ZXIgbmV3IHRhcmdldDogJXMgLT4gXCIlc1wiJywgb3B0aW9ucy50YXJnZXQsIG5ld1RhcmdldCk7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudGFyZ2V0ID0gbmV3VGFyZ2V0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgLy8gcmV3cml0ZSBwYXRoXG4gICAgICAgIHRoaXMuYXBwbHlQYXRoUmV3cml0ZSA9IGFzeW5jIChyZXEsIHBhdGhSZXdyaXRlcikgPT4ge1xuICAgICAgICAgICAgaWYgKHBhdGhSZXdyaXRlcikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGggPSBhd2FpdCBwYXRoUmV3cml0ZXIocmVxLnVybCwgcmVxKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcS51cmwgPSBwYXRoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuaW5mbygnW0hQTV0gcGF0aFJld3JpdGU6IE5vIHJld3JpdHRlbiBwYXRoIGZvdW5kLiAoJXMpJywgcmVxLnVybCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmxvZ0Vycm9yID0gKGVyciwgcmVxLCByZXMsIHRhcmdldCkgPT4ge1xuICAgICAgICAgICAgdmFyIF9hO1xuICAgICAgICAgICAgY29uc3QgaG9zdG5hbWUgPSAoKF9hID0gcmVxLmhlYWRlcnMpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5ob3N0KSB8fCByZXEuaG9zdG5hbWUgfHwgcmVxLmhvc3Q7IC8vICh3ZWJzb2NrZXQpIHx8IChub2RlMC4xMCB8fCBub2RlIDQvNSlcbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3RIcmVmID0gYCR7aG9zdG5hbWV9JHtyZXEudXJsfWA7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRIcmVmID0gYCR7dGFyZ2V0ID09PSBudWxsIHx8IHRhcmdldCA9PT0gdm9pZCAwID8gdm9pZCAwIDogdGFyZ2V0LmhyZWZ9YDsgLy8gdGFyZ2V0IGlzIHVuZGVmaW5lZCB3aGVuIHdlYnNvY2tldCBlcnJvcnNcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9ICdbSFBNXSBFcnJvciBvY2N1cnJlZCB3aGlsZSBwcm94eWluZyByZXF1ZXN0ICVzIHRvICVzIFslc10gKCVzKSc7XG4gICAgICAgICAgICBjb25zdCBlcnJSZWZlcmVuY2UgPSAnaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9lcnJvcnMuaHRtbCNlcnJvcnNfY29tbW9uX3N5c3RlbV9lcnJvcnMnOyAvLyBsaW5rIHRvIE5vZGUgQ29tbW9uIFN5c3RlbXMgRXJyb3JzIHBhZ2VcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKGVycm9yTWVzc2FnZSwgcmVxdWVzdEhyZWYsIHRhcmdldEhyZWYsIGVyci5jb2RlIHx8IGVyciwgZXJyUmVmZXJlbmNlKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jb25maWcgPSAoMCwgY29uZmlnX2ZhY3RvcnlfMS5jcmVhdGVDb25maWcpKGNvbnRleHQsIG9wdHMpO1xuICAgICAgICB0aGlzLnByb3h5T3B0aW9ucyA9IHRoaXMuY29uZmlnLm9wdGlvbnM7XG4gICAgICAgIC8vIGNyZWF0ZSBwcm94eVxuICAgICAgICB0aGlzLnByb3h5ID0gaHR0cFByb3h5LmNyZWF0ZVByb3h5U2VydmVyKHt9KTtcbiAgICAgICAgdGhpcy5sb2dnZXIuaW5mbyhgW0hQTV0gUHJveHkgY3JlYXRlZDogJHt0aGlzLmNvbmZpZy5jb250ZXh0fSAgLT4gJHt0aGlzLnByb3h5T3B0aW9ucy50YXJnZXR9YCk7XG4gICAgICAgIHRoaXMucGF0aFJld3JpdGVyID0gUGF0aFJld3JpdGVyLmNyZWF0ZVBhdGhSZXdyaXRlcih0aGlzLnByb3h5T3B0aW9ucy5wYXRoUmV3cml0ZSk7IC8vIHJldHVybnMgdW5kZWZpbmVkIHdoZW4gXCJwYXRoUmV3cml0ZVwiIGlzIG5vdCBwcm92aWRlZFxuICAgICAgICAvLyBhdHRhY2ggaGFuZGxlciB0byBodHRwLXByb3h5IGV2ZW50c1xuICAgICAgICBoYW5kbGVycy5pbml0KHRoaXMucHJveHksIHRoaXMucHJveHlPcHRpb25zKTtcbiAgICAgICAgLy8gbG9nIGVycm9ycyBmb3IgZGVidWcgcHVycG9zZVxuICAgICAgICB0aGlzLnByb3h5Lm9uKCdlcnJvcicsIHRoaXMubG9nRXJyb3IpO1xuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vY2hpbXVyYWkvaHR0cC1wcm94eS1taWRkbGV3YXJlL2lzc3Vlcy8xOVxuICAgICAgICAvLyBleHBvc2UgZnVuY3Rpb24gdG8gdXBncmFkZSBleHRlcm5hbGx5XG4gICAgICAgIHRoaXMubWlkZGxld2FyZS51cGdyYWRlID0gKHJlcSwgc29ja2V0LCBoZWFkKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMud3NJbnRlcm5hbFN1YnNjcmliZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVVwZ3JhZGUocmVxLCBzb2NrZXQsIGhlYWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbn1cbmV4cG9ydHMuSHR0cFByb3h5TWlkZGxld2FyZSA9IEh0dHBQcm94eU1pZGRsZXdhcmU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMucmVzcG9uc2VJbnRlcmNlcHRvciA9IHZvaWQgMDtcbmNvbnN0IHpsaWIgPSByZXF1aXJlKFwiemxpYlwiKTtcbi8qKlxuICogSW50ZXJjZXB0IHJlc3BvbnNlcyBmcm9tIHVwc3RyZWFtLlxuICogQXV0b21hdGljYWxseSBkZWNvbXByZXNzIChkZWZsYXRlLCBnemlwLCBicm90bGkpLlxuICogR2l2ZSBkZXZlbG9wZXIgdGhlIG9wcG9ydHVuaXR5IHRvIG1vZGlmeSBpbnRlcmNlcHRlZCBCdWZmZXIgYW5kIGh0dHAuU2VydmVyUmVzcG9uc2VcbiAqXG4gKiBOT1RFOiBtdXN0IHNldCBvcHRpb25zLnNlbGZIYW5kbGVSZXNwb25zZT10cnVlIChwcmV2ZW50IGF1dG9tYXRpYyBjYWxsIG9mIHJlcy5lbmQoKSlcbiAqL1xuZnVuY3Rpb24gcmVzcG9uc2VJbnRlcmNlcHRvcihpbnRlcmNlcHRvcikge1xuICAgIHJldHVybiBhc3luYyBmdW5jdGlvbiBwcm94eVJlcyhwcm94eVJlcywgcmVxLCByZXMpIHtcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxQcm94eVJlcyA9IHByb3h5UmVzO1xuICAgICAgICBsZXQgYnVmZmVyID0gQnVmZmVyLmZyb20oJycsICd1dGY4Jyk7XG4gICAgICAgIC8vIGRlY29tcHJlc3MgcHJveHkgcmVzcG9uc2VcbiAgICAgICAgY29uc3QgX3Byb3h5UmVzID0gZGVjb21wcmVzcyhwcm94eVJlcywgcHJveHlSZXMuaGVhZGVyc1snY29udGVudC1lbmNvZGluZyddKTtcbiAgICAgICAgLy8gY29uY2F0IGRhdGEgc3RyZWFtXG4gICAgICAgIF9wcm94eVJlcy5vbignZGF0YScsIChjaHVuaykgPT4gKGJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoW2J1ZmZlciwgY2h1bmtdKSkpO1xuICAgICAgICBfcHJveHlSZXMub24oJ2VuZCcsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIC8vIGNvcHkgb3JpZ2luYWwgaGVhZGVyc1xuICAgICAgICAgICAgY29weUhlYWRlcnMocHJveHlSZXMsIHJlcyk7XG4gICAgICAgICAgICAvLyBjYWxsIGludGVyY2VwdG9yIHdpdGggaW50ZXJjZXB0ZWQgcmVzcG9uc2UgKGJ1ZmZlcilcbiAgICAgICAgICAgIGNvbnN0IGludGVyY2VwdGVkQnVmZmVyID0gQnVmZmVyLmZyb20oYXdhaXQgaW50ZXJjZXB0b3IoYnVmZmVyLCBvcmlnaW5hbFByb3h5UmVzLCByZXEsIHJlcykpO1xuICAgICAgICAgICAgLy8gc2V0IGNvcnJlY3QgY29udGVudC1sZW5ndGggKHdpdGggZG91YmxlIGJ5dGUgY2hhcmFjdGVyIHN1cHBvcnQpXG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdjb250ZW50LWxlbmd0aCcsIEJ1ZmZlci5ieXRlTGVuZ3RoKGludGVyY2VwdGVkQnVmZmVyLCAndXRmOCcpKTtcbiAgICAgICAgICAgIHJlcy53cml0ZShpbnRlcmNlcHRlZEJ1ZmZlcik7XG4gICAgICAgICAgICByZXMuZW5kKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBfcHJveHlSZXMub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICByZXMuZW5kKGBFcnJvciBmZXRjaGluZyBwcm94aWVkIHJlcXVlc3Q6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cbmV4cG9ydHMucmVzcG9uc2VJbnRlcmNlcHRvciA9IHJlc3BvbnNlSW50ZXJjZXB0b3I7XG4vKipcbiAqIFN0cmVhbWluZyBkZWNvbXByZXNzaW9uIG9mIHByb3h5IHJlc3BvbnNlXG4gKiBzb3VyY2U6IGh0dHBzOi8vZ2l0aHViLmNvbS9hcGFjaGUvc3VwZXJzZXQvYmxvYi85NzczYWJhNTIyZTk1N2VkOTQyMzA0NWNhMTUzMjE5NjM4YTg1ZDJmL3N1cGVyc2V0LWZyb250ZW5kL3dlYnBhY2sucHJveHktY29uZmlnLmpzI0wxMTZcbiAqL1xuZnVuY3Rpb24gZGVjb21wcmVzcyhwcm94eVJlcywgY29udGVudEVuY29kaW5nKSB7XG4gICAgbGV0IF9wcm94eVJlcyA9IHByb3h5UmVzO1xuICAgIGxldCBkZWNvbXByZXNzO1xuICAgIHN3aXRjaCAoY29udGVudEVuY29kaW5nKSB7XG4gICAgICAgIGNhc2UgJ2d6aXAnOlxuICAgICAgICAgICAgZGVjb21wcmVzcyA9IHpsaWIuY3JlYXRlR3VuemlwKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYnInOlxuICAgICAgICAgICAgZGVjb21wcmVzcyA9IHpsaWIuY3JlYXRlQnJvdGxpRGVjb21wcmVzcygpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2RlZmxhdGUnOlxuICAgICAgICAgICAgZGVjb21wcmVzcyA9IHpsaWIuY3JlYXRlSW5mbGF0ZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKGRlY29tcHJlc3MpIHtcbiAgICAgICAgX3Byb3h5UmVzLnBpcGUoZGVjb21wcmVzcyk7XG4gICAgICAgIF9wcm94eVJlcyA9IGRlY29tcHJlc3M7XG4gICAgfVxuICAgIHJldHVybiBfcHJveHlSZXM7XG59XG4vKipcbiAqIENvcHkgb3JpZ2luYWwgaGVhZGVyc1xuICogaHR0cHM6Ly9naXRodWIuY29tL2FwYWNoZS9zdXBlcnNldC9ibG9iLzk3NzNhYmE1MjJlOTU3ZWQ5NDIzMDQ1Y2ExNTMyMTk2MzhhODVkMmYvc3VwZXJzZXQtZnJvbnRlbmQvd2VicGFjay5wcm94eS1jb25maWcuanMjTDc4XG4gKi9cbmZ1bmN0aW9uIGNvcHlIZWFkZXJzKG9yaWdpbmFsUmVzcG9uc2UsIHJlc3BvbnNlKSB7XG4gICAgcmVzcG9uc2Uuc3RhdHVzQ29kZSA9IG9yaWdpbmFsUmVzcG9uc2Uuc3RhdHVzQ29kZTtcbiAgICByZXNwb25zZS5zdGF0dXNNZXNzYWdlID0gb3JpZ2luYWxSZXNwb25zZS5zdGF0dXNNZXNzYWdlO1xuICAgIGlmIChyZXNwb25zZS5zZXRIZWFkZXIpIHtcbiAgICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhvcmlnaW5hbFJlc3BvbnNlLmhlYWRlcnMpO1xuICAgICAgICAvLyBpZ25vcmUgY2h1bmtlZCwgYnJvdGxpLCBnemlwLCBkZWZsYXRlIGhlYWRlcnNcbiAgICAgICAga2V5cyA9IGtleXMuZmlsdGVyKChrZXkpID0+ICFbJ2NvbnRlbnQtZW5jb2RpbmcnLCAndHJhbnNmZXItZW5jb2RpbmcnXS5pbmNsdWRlcyhrZXkpKTtcbiAgICAgICAga2V5cy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IG9yaWdpbmFsUmVzcG9uc2UuaGVhZGVyc1trZXldO1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3NldC1jb29raWUnKSB7XG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGNvb2tpZSBkb21haW5cbiAgICAgICAgICAgICAgICB2YWx1ZSA9IEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUgOiBbdmFsdWVdO1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUubWFwKCh4KSA9PiB4LnJlcGxhY2UoL0RvbWFpbj1bXjtdKz8vaSwgJycpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3BvbnNlLnNldEhlYWRlcihrZXksIHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXNwb25zZS5oZWFkZXJzID0gb3JpZ2luYWxSZXNwb25zZS5oZWFkZXJzO1xuICAgIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5maXhSZXF1ZXN0Qm9keSA9IHZvaWQgMDtcbmNvbnN0IHF1ZXJ5c3RyaW5nID0gcmVxdWlyZShcInF1ZXJ5c3RyaW5nXCIpO1xuLyoqXG4gKiBGaXggcHJveGllZCBib2R5IGlmIGJvZHlQYXJzZXIgaXMgaW52b2x2ZWQuXG4gKi9cbmZ1bmN0aW9uIGZpeFJlcXVlc3RCb2R5KHByb3h5UmVxLCByZXEpIHtcbiAgICBjb25zdCByZXF1ZXN0Qm9keSA9IHJlcS5ib2R5O1xuICAgIGlmICghcmVxdWVzdEJvZHkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBjb250ZW50VHlwZSA9IHByb3h5UmVxLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG4gICAgY29uc3Qgd3JpdGVCb2R5ID0gKGJvZHlEYXRhKSA9PiB7XG4gICAgICAgIC8vIGRlZXBjb2RlIGlnbm9yZSBDb250ZW50TGVuZ3RoSW5Db2RlOiBib2R5UGFyc2VyIGZpeFxuICAgICAgICBwcm94eVJlcS5zZXRIZWFkZXIoJ0NvbnRlbnQtTGVuZ3RoJywgQnVmZmVyLmJ5dGVMZW5ndGgoYm9keURhdGEpKTtcbiAgICAgICAgcHJveHlSZXEud3JpdGUoYm9keURhdGEpO1xuICAgIH07XG4gICAgaWYgKGNvbnRlbnRUeXBlICYmIGNvbnRlbnRUeXBlLmluY2x1ZGVzKCdhcHBsaWNhdGlvbi9qc29uJykpIHtcbiAgICAgICAgd3JpdGVCb2R5KEpTT04uc3RyaW5naWZ5KHJlcXVlc3RCb2R5KSk7XG4gICAgfVxuICAgIGlmIChjb250ZW50VHlwZSAmJiBjb250ZW50VHlwZS5pbmNsdWRlcygnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJykpIHtcbiAgICAgICAgd3JpdGVCb2R5KHF1ZXJ5c3RyaW5nLnN0cmluZ2lmeShyZXF1ZXN0Qm9keSkpO1xuICAgIH1cbn1cbmV4cG9ydHMuZml4UmVxdWVzdEJvZHkgPSBmaXhSZXF1ZXN0Qm9keTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5maXhSZXF1ZXN0Qm9keSA9IGV4cG9ydHMucmVzcG9uc2VJbnRlcmNlcHRvciA9IHZvaWQgMDtcbnZhciByZXNwb25zZV9pbnRlcmNlcHRvcl8xID0gcmVxdWlyZShcIi4vcmVzcG9uc2UtaW50ZXJjZXB0b3JcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJyZXNwb25zZUludGVyY2VwdG9yXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiByZXNwb25zZV9pbnRlcmNlcHRvcl8xLnJlc3BvbnNlSW50ZXJjZXB0b3I7IH0gfSk7XG52YXIgZml4X3JlcXVlc3RfYm9keV8xID0gcmVxdWlyZShcIi4vZml4LXJlcXVlc3QtYm9keVwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImZpeFJlcXVlc3RCb2R5XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBmaXhfcmVxdWVzdF9ib2R5XzEuZml4UmVxdWVzdEJvZHk7IH0gfSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9KTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19leHBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2V4cG9ydFN0YXIpIHx8IGZ1bmN0aW9uKG0sIGV4cG9ydHMpIHtcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGV4cG9ydHMsIHApKSBfX2NyZWF0ZUJpbmRpbmcoZXhwb3J0cywgbSwgcCk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL3B1YmxpY1wiKSwgZXhwb3J0cyk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9KTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19leHBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2V4cG9ydFN0YXIpIHx8IGZ1bmN0aW9uKG0sIGV4cG9ydHMpIHtcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGV4cG9ydHMsIHApKSBfX2NyZWF0ZUJpbmRpbmcoZXhwb3J0cywgbSwgcCk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5jcmVhdGVQcm94eU1pZGRsZXdhcmUgPSB2b2lkIDA7XG5jb25zdCBodHRwX3Byb3h5X21pZGRsZXdhcmVfMSA9IHJlcXVpcmUoXCIuL2h0dHAtcHJveHktbWlkZGxld2FyZVwiKTtcbmZ1bmN0aW9uIGNyZWF0ZVByb3h5TWlkZGxld2FyZShjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgY29uc3QgeyBtaWRkbGV3YXJlIH0gPSBuZXcgaHR0cF9wcm94eV9taWRkbGV3YXJlXzEuSHR0cFByb3h5TWlkZGxld2FyZShjb250ZXh0LCBvcHRpb25zKTtcbiAgICByZXR1cm4gbWlkZGxld2FyZTtcbn1cbmV4cG9ydHMuY3JlYXRlUHJveHlNaWRkbGV3YXJlID0gY3JlYXRlUHJveHlNaWRkbGV3YXJlO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL2hhbmRsZXJzXCIpLCBleHBvcnRzKTtcbiIsIi8qXG5vYmplY3QtYXNzaWduXG4oYykgU2luZHJlIFNvcmh1c1xuQGxpY2Vuc2UgTUlUXG4qL1xuXG4ndXNlIHN0cmljdCc7XG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xudmFyIGdldE93blByb3BlcnR5U3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHByb3BJc0VudW1lcmFibGUgPSBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG5mdW5jdGlvbiB0b09iamVjdCh2YWwpIHtcblx0aWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IHVuZGVmaW5lZCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5hc3NpZ24gY2Fubm90IGJlIGNhbGxlZCB3aXRoIG51bGwgb3IgdW5kZWZpbmVkJyk7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0KHZhbCk7XG59XG5cbmZ1bmN0aW9uIHNob3VsZFVzZU5hdGl2ZSgpIHtcblx0dHJ5IHtcblx0XHRpZiAoIU9iamVjdC5hc3NpZ24pIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBEZXRlY3QgYnVnZ3kgcHJvcGVydHkgZW51bWVyYXRpb24gb3JkZXIgaW4gb2xkZXIgVjggdmVyc2lvbnMuXG5cblx0XHQvLyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD00MTE4XG5cdFx0dmFyIHRlc3QxID0gbmV3IFN0cmluZygnYWJjJyk7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ldy13cmFwcGVyc1xuXHRcdHRlc3QxWzVdID0gJ2RlJztcblx0XHRpZiAoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGVzdDEpWzBdID09PSAnNScpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD0zMDU2XG5cdFx0dmFyIHRlc3QyID0ge307XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG5cdFx0XHR0ZXN0MlsnXycgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGkpXSA9IGk7XG5cdFx0fVxuXHRcdHZhciBvcmRlcjIgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0ZXN0MikubWFwKGZ1bmN0aW9uIChuKSB7XG5cdFx0XHRyZXR1cm4gdGVzdDJbbl07XG5cdFx0fSk7XG5cdFx0aWYgKG9yZGVyMi5qb2luKCcnKSAhPT0gJzAxMjM0NTY3ODknKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MzA1NlxuXHRcdHZhciB0ZXN0MyA9IHt9O1xuXHRcdCdhYmNkZWZnaGlqa2xtbm9wcXJzdCcuc3BsaXQoJycpLmZvckVhY2goZnVuY3Rpb24gKGxldHRlcikge1xuXHRcdFx0dGVzdDNbbGV0dGVyXSA9IGxldHRlcjtcblx0XHR9KTtcblx0XHRpZiAoT2JqZWN0LmtleXMoT2JqZWN0LmFzc2lnbih7fSwgdGVzdDMpKS5qb2luKCcnKSAhPT1cblx0XHRcdFx0J2FiY2RlZmdoaWprbG1ub3BxcnN0Jykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBXZSBkb24ndCBleHBlY3QgYW55IG9mIHRoZSBhYm92ZSB0byB0aHJvdywgYnV0IGJldHRlciB0byBiZSBzYWZlLlxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNob3VsZFVzZU5hdGl2ZSgpID8gT2JqZWN0LmFzc2lnbiA6IGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZSkge1xuXHR2YXIgZnJvbTtcblx0dmFyIHRvID0gdG9PYmplY3QodGFyZ2V0KTtcblx0dmFyIHN5bWJvbHM7XG5cblx0Zm9yICh2YXIgcyA9IDE7IHMgPCBhcmd1bWVudHMubGVuZ3RoOyBzKyspIHtcblx0XHRmcm9tID0gT2JqZWN0KGFyZ3VtZW50c1tzXSk7XG5cblx0XHRmb3IgKHZhciBrZXkgaW4gZnJvbSkge1xuXHRcdFx0aWYgKGhhc093blByb3BlcnR5LmNhbGwoZnJvbSwga2V5KSkge1xuXHRcdFx0XHR0b1trZXldID0gZnJvbVtrZXldO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChnZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcblx0XHRcdHN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZnJvbSk7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN5bWJvbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHByb3BJc0VudW1lcmFibGUuY2FsbChmcm9tLCBzeW1ib2xzW2ldKSkge1xuXHRcdFx0XHRcdHRvW3N5bWJvbHNbaV1dID0gZnJvbVtzeW1ib2xzW2ldXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0bztcbn07XG4iLCIvKiFcbiAqIHZhcnlcbiAqIENvcHlyaWdodChjKSAyMDE0LTIwMTcgRG91Z2xhcyBDaHJpc3RvcGhlciBXaWxzb25cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbid1c2Ugc3RyaWN0J1xuXG4vKipcbiAqIE1vZHVsZSBleHBvcnRzLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gdmFyeVxubW9kdWxlLmV4cG9ydHMuYXBwZW5kID0gYXBwZW5kXG5cbi8qKlxuICogUmVnRXhwIHRvIG1hdGNoIGZpZWxkLW5hbWUgaW4gUkZDIDcyMzAgc2VjIDMuMlxuICpcbiAqIGZpZWxkLW5hbWUgICAgPSB0b2tlblxuICogdG9rZW4gICAgICAgICA9IDEqdGNoYXJcbiAqIHRjaGFyICAgICAgICAgPSBcIiFcIiAvIFwiI1wiIC8gXCIkXCIgLyBcIiVcIiAvIFwiJlwiIC8gXCInXCIgLyBcIipcIlxuICogICAgICAgICAgICAgICAvIFwiK1wiIC8gXCItXCIgLyBcIi5cIiAvIFwiXlwiIC8gXCJfXCIgLyBcImBcIiAvIFwifFwiIC8gXCJ+XCJcbiAqICAgICAgICAgICAgICAgLyBESUdJVCAvIEFMUEhBXG4gKiAgICAgICAgICAgICAgIDsgYW55IFZDSEFSLCBleGNlcHQgZGVsaW1pdGVyc1xuICovXG5cbnZhciBGSUVMRF9OQU1FX1JFR0VYUCA9IC9eWyEjJCUmJyorXFwtLl5fYHx+MC05QS1aYS16XSskL1xuXG4vKipcbiAqIEFwcGVuZCBhIGZpZWxkIHRvIGEgdmFyeSBoZWFkZXIuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlclxuICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAcHVibGljXG4gKi9cblxuZnVuY3Rpb24gYXBwZW5kIChoZWFkZXIsIGZpZWxkKSB7XG4gIGlmICh0eXBlb2YgaGVhZGVyICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2hlYWRlciBhcmd1bWVudCBpcyByZXF1aXJlZCcpXG4gIH1cblxuICBpZiAoIWZpZWxkKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZmllbGQgYXJndW1lbnQgaXMgcmVxdWlyZWQnKVxuICB9XG5cbiAgLy8gZ2V0IGZpZWxkcyBhcnJheVxuICB2YXIgZmllbGRzID0gIUFycmF5LmlzQXJyYXkoZmllbGQpXG4gICAgPyBwYXJzZShTdHJpbmcoZmllbGQpKVxuICAgIDogZmllbGRcblxuICAvLyBhc3NlcnQgb24gaW52YWxpZCBmaWVsZCBuYW1lc1xuICBmb3IgKHZhciBqID0gMDsgaiA8IGZpZWxkcy5sZW5ndGg7IGorKykge1xuICAgIGlmICghRklFTERfTkFNRV9SRUdFWFAudGVzdChmaWVsZHNbal0pKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdmaWVsZCBhcmd1bWVudCBjb250YWlucyBhbiBpbnZhbGlkIGhlYWRlciBuYW1lJylcbiAgICB9XG4gIH1cblxuICAvLyBleGlzdGluZywgdW5zcGVjaWZpZWQgdmFyeVxuICBpZiAoaGVhZGVyID09PSAnKicpIHtcbiAgICByZXR1cm4gaGVhZGVyXG4gIH1cblxuICAvLyBlbnVtZXJhdGUgY3VycmVudCB2YWx1ZXNcbiAgdmFyIHZhbCA9IGhlYWRlclxuICB2YXIgdmFscyA9IHBhcnNlKGhlYWRlci50b0xvd2VyQ2FzZSgpKVxuXG4gIC8vIHVuc3BlY2lmaWVkIHZhcnlcbiAgaWYgKGZpZWxkcy5pbmRleE9mKCcqJykgIT09IC0xIHx8IHZhbHMuaW5kZXhPZignKicpICE9PSAtMSkge1xuICAgIHJldHVybiAnKidcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZmllbGRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGZsZCA9IGZpZWxkc1tpXS50b0xvd2VyQ2FzZSgpXG5cbiAgICAvLyBhcHBlbmQgdmFsdWUgKGNhc2UtcHJlc2VydmluZylcbiAgICBpZiAodmFscy5pbmRleE9mKGZsZCkgPT09IC0xKSB7XG4gICAgICB2YWxzLnB1c2goZmxkKVxuICAgICAgdmFsID0gdmFsXG4gICAgICAgID8gdmFsICsgJywgJyArIGZpZWxkc1tpXVxuICAgICAgICA6IGZpZWxkc1tpXVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuLyoqXG4gKiBQYXJzZSBhIHZhcnkgaGVhZGVyIGludG8gYW4gYXJyYXkuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlclxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlIChoZWFkZXIpIHtcbiAgdmFyIGVuZCA9IDBcbiAgdmFyIGxpc3QgPSBbXVxuICB2YXIgc3RhcnQgPSAwXG5cbiAgLy8gZ2F0aGVyIHRva2Vuc1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gaGVhZGVyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgc3dpdGNoIChoZWFkZXIuY2hhckNvZGVBdChpKSkge1xuICAgICAgY2FzZSAweDIwOiAvKiAgICovXG4gICAgICAgIGlmIChzdGFydCA9PT0gZW5kKSB7XG4gICAgICAgICAgc3RhcnQgPSBlbmQgPSBpICsgMVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIDB4MmM6IC8qICwgKi9cbiAgICAgICAgbGlzdC5wdXNoKGhlYWRlci5zdWJzdHJpbmcoc3RhcnQsIGVuZCkpXG4gICAgICAgIHN0YXJ0ID0gZW5kID0gaSArIDFcbiAgICAgICAgYnJlYWtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGVuZCA9IGkgKyAxXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgLy8gZmluYWwgdG9rZW5cbiAgbGlzdC5wdXNoKGhlYWRlci5zdWJzdHJpbmcoc3RhcnQsIGVuZCkpXG5cbiAgcmV0dXJuIGxpc3Rcbn1cblxuLyoqXG4gKiBNYXJrIHRoYXQgYSByZXF1ZXN0IGlzIHZhcmllZCBvbiBhIGhlYWRlciBmaWVsZC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcmVzXG4gKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gZmllbGRcbiAqIEBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiB2YXJ5IChyZXMsIGZpZWxkKSB7XG4gIGlmICghcmVzIHx8ICFyZXMuZ2V0SGVhZGVyIHx8ICFyZXMuc2V0SGVhZGVyKSB7XG4gICAgLy8gcXVhY2sgcXVhY2tcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdyZXMgYXJndW1lbnQgaXMgcmVxdWlyZWQnKVxuICB9XG5cbiAgLy8gZ2V0IGV4aXN0aW5nIGhlYWRlclxuICB2YXIgdmFsID0gcmVzLmdldEhlYWRlcignVmFyeScpIHx8ICcnXG4gIHZhciBoZWFkZXIgPSBBcnJheS5pc0FycmF5KHZhbClcbiAgICA/IHZhbC5qb2luKCcsICcpXG4gICAgOiBTdHJpbmcodmFsKVxuXG4gIC8vIHNldCBuZXcgaGVhZGVyXG4gIGlmICgodmFsID0gYXBwZW5kKGhlYWRlciwgZmllbGQpKSkge1xuICAgIHJlcy5zZXRIZWFkZXIoJ1ZhcnknLCB2YWwpXG4gIH1cbn1cbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBhc3NpZ24gPSByZXF1aXJlKCdvYmplY3QtYXNzaWduJyk7XG4gIHZhciB2YXJ5ID0gcmVxdWlyZSgndmFyeScpO1xuXG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICBvcmlnaW46ICcqJyxcbiAgICBtZXRob2RzOiAnR0VULEhFQUQsUFVULFBBVENILFBPU1QsREVMRVRFJyxcbiAgICBwcmVmbGlnaHRDb250aW51ZTogZmFsc2UsXG4gICAgb3B0aW9uc1N1Y2Nlc3NTdGF0dXM6IDIwNFxuICB9O1xuXG4gIGZ1bmN0aW9uIGlzU3RyaW5nKHMpIHtcbiAgICByZXR1cm4gdHlwZW9mIHMgPT09ICdzdHJpbmcnIHx8IHMgaW5zdGFuY2VvZiBTdHJpbmc7XG4gIH1cblxuICBmdW5jdGlvbiBpc09yaWdpbkFsbG93ZWQob3JpZ2luLCBhbGxvd2VkT3JpZ2luKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYWxsb3dlZE9yaWdpbikpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWxsb3dlZE9yaWdpbi5sZW5ndGg7ICsraSkge1xuICAgICAgICBpZiAoaXNPcmlnaW5BbGxvd2VkKG9yaWdpbiwgYWxsb3dlZE9yaWdpbltpXSkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoaXNTdHJpbmcoYWxsb3dlZE9yaWdpbikpIHtcbiAgICAgIHJldHVybiBvcmlnaW4gPT09IGFsbG93ZWRPcmlnaW47XG4gICAgfSBlbHNlIGlmIChhbGxvd2VkT3JpZ2luIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICByZXR1cm4gYWxsb3dlZE9yaWdpbi50ZXN0KG9yaWdpbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAhIWFsbG93ZWRPcmlnaW47XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY29uZmlndXJlT3JpZ2luKG9wdGlvbnMsIHJlcSkge1xuICAgIHZhciByZXF1ZXN0T3JpZ2luID0gcmVxLmhlYWRlcnMub3JpZ2luLFxuICAgICAgaGVhZGVycyA9IFtdLFxuICAgICAgaXNBbGxvd2VkO1xuXG4gICAgaWYgKCFvcHRpb25zLm9yaWdpbiB8fCBvcHRpb25zLm9yaWdpbiA9PT0gJyonKSB7XG4gICAgICAvLyBhbGxvdyBhbnkgb3JpZ2luXG4gICAgICBoZWFkZXJzLnB1c2goW3tcbiAgICAgICAga2V5OiAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJyxcbiAgICAgICAgdmFsdWU6ICcqJ1xuICAgICAgfV0pO1xuICAgIH0gZWxzZSBpZiAoaXNTdHJpbmcob3B0aW9ucy5vcmlnaW4pKSB7XG4gICAgICAvLyBmaXhlZCBvcmlnaW5cbiAgICAgIGhlYWRlcnMucHVzaChbe1xuICAgICAgICBrZXk6ICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLFxuICAgICAgICB2YWx1ZTogb3B0aW9ucy5vcmlnaW5cbiAgICAgIH1dKTtcbiAgICAgIGhlYWRlcnMucHVzaChbe1xuICAgICAgICBrZXk6ICdWYXJ5JyxcbiAgICAgICAgdmFsdWU6ICdPcmlnaW4nXG4gICAgICB9XSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlzQWxsb3dlZCA9IGlzT3JpZ2luQWxsb3dlZChyZXF1ZXN0T3JpZ2luLCBvcHRpb25zLm9yaWdpbik7XG4gICAgICAvLyByZWZsZWN0IG9yaWdpblxuICAgICAgaGVhZGVycy5wdXNoKFt7XG4gICAgICAgIGtleTogJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicsXG4gICAgICAgIHZhbHVlOiBpc0FsbG93ZWQgPyByZXF1ZXN0T3JpZ2luIDogZmFsc2VcbiAgICAgIH1dKTtcbiAgICAgIGhlYWRlcnMucHVzaChbe1xuICAgICAgICBrZXk6ICdWYXJ5JyxcbiAgICAgICAgdmFsdWU6ICdPcmlnaW4nXG4gICAgICB9XSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGhlYWRlcnM7XG4gIH1cblxuICBmdW5jdGlvbiBjb25maWd1cmVNZXRob2RzKG9wdGlvbnMpIHtcbiAgICB2YXIgbWV0aG9kcyA9IG9wdGlvbnMubWV0aG9kcztcbiAgICBpZiAobWV0aG9kcy5qb2luKSB7XG4gICAgICBtZXRob2RzID0gb3B0aW9ucy5tZXRob2RzLmpvaW4oJywnKTsgLy8gLm1ldGhvZHMgaXMgYW4gYXJyYXksIHNvIHR1cm4gaXQgaW50byBhIHN0cmluZ1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAga2V5OiAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsXG4gICAgICB2YWx1ZTogbWV0aG9kc1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjb25maWd1cmVDcmVkZW50aWFscyhvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMuY3JlZGVudGlhbHMgPT09IHRydWUpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGtleTogJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJyxcbiAgICAgICAgdmFsdWU6ICd0cnVlJ1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBmdW5jdGlvbiBjb25maWd1cmVBbGxvd2VkSGVhZGVycyhvcHRpb25zLCByZXEpIHtcbiAgICB2YXIgYWxsb3dlZEhlYWRlcnMgPSBvcHRpb25zLmFsbG93ZWRIZWFkZXJzIHx8IG9wdGlvbnMuaGVhZGVycztcbiAgICB2YXIgaGVhZGVycyA9IFtdO1xuXG4gICAgaWYgKCFhbGxvd2VkSGVhZGVycykge1xuICAgICAgYWxsb3dlZEhlYWRlcnMgPSByZXEuaGVhZGVyc1snYWNjZXNzLWNvbnRyb2wtcmVxdWVzdC1oZWFkZXJzJ107IC8vIC5oZWFkZXJzIHdhc24ndCBzcGVjaWZpZWQsIHNvIHJlZmxlY3QgdGhlIHJlcXVlc3QgaGVhZGVyc1xuICAgICAgaGVhZGVycy5wdXNoKFt7XG4gICAgICAgIGtleTogJ1ZhcnknLFxuICAgICAgICB2YWx1ZTogJ0FjY2Vzcy1Db250cm9sLVJlcXVlc3QtSGVhZGVycydcbiAgICAgIH1dKTtcbiAgICB9IGVsc2UgaWYgKGFsbG93ZWRIZWFkZXJzLmpvaW4pIHtcbiAgICAgIGFsbG93ZWRIZWFkZXJzID0gYWxsb3dlZEhlYWRlcnMuam9pbignLCcpOyAvLyAuaGVhZGVycyBpcyBhbiBhcnJheSwgc28gdHVybiBpdCBpbnRvIGEgc3RyaW5nXG4gICAgfVxuICAgIGlmIChhbGxvd2VkSGVhZGVycyAmJiBhbGxvd2VkSGVhZGVycy5sZW5ndGgpIHtcbiAgICAgIGhlYWRlcnMucHVzaChbe1xuICAgICAgICBrZXk6ICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJyxcbiAgICAgICAgdmFsdWU6IGFsbG93ZWRIZWFkZXJzXG4gICAgICB9XSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGhlYWRlcnM7XG4gIH1cblxuICBmdW5jdGlvbiBjb25maWd1cmVFeHBvc2VkSGVhZGVycyhvcHRpb25zKSB7XG4gICAgdmFyIGhlYWRlcnMgPSBvcHRpb25zLmV4cG9zZWRIZWFkZXJzO1xuICAgIGlmICghaGVhZGVycykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChoZWFkZXJzLmpvaW4pIHtcbiAgICAgIGhlYWRlcnMgPSBoZWFkZXJzLmpvaW4oJywnKTsgLy8gLmhlYWRlcnMgaXMgYW4gYXJyYXksIHNvIHR1cm4gaXQgaW50byBhIHN0cmluZ1xuICAgIH1cbiAgICBpZiAoaGVhZGVycyAmJiBoZWFkZXJzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAga2V5OiAnQWNjZXNzLUNvbnRyb2wtRXhwb3NlLUhlYWRlcnMnLFxuICAgICAgICB2YWx1ZTogaGVhZGVyc1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBmdW5jdGlvbiBjb25maWd1cmVNYXhBZ2Uob3B0aW9ucykge1xuICAgIHZhciBtYXhBZ2UgPSAodHlwZW9mIG9wdGlvbnMubWF4QWdlID09PSAnbnVtYmVyJyB8fCBvcHRpb25zLm1heEFnZSkgJiYgb3B0aW9ucy5tYXhBZ2UudG9TdHJpbmcoKVxuICAgIGlmIChtYXhBZ2UgJiYgbWF4QWdlLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAga2V5OiAnQWNjZXNzLUNvbnRyb2wtTWF4LUFnZScsXG4gICAgICAgIHZhbHVlOiBtYXhBZ2VcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZnVuY3Rpb24gYXBwbHlIZWFkZXJzKGhlYWRlcnMsIHJlcykge1xuICAgIGZvciAodmFyIGkgPSAwLCBuID0gaGVhZGVycy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgIHZhciBoZWFkZXIgPSBoZWFkZXJzW2ldO1xuICAgICAgaWYgKGhlYWRlcikge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShoZWFkZXIpKSB7XG4gICAgICAgICAgYXBwbHlIZWFkZXJzKGhlYWRlciwgcmVzKTtcbiAgICAgICAgfSBlbHNlIGlmIChoZWFkZXIua2V5ID09PSAnVmFyeScgJiYgaGVhZGVyLnZhbHVlKSB7XG4gICAgICAgICAgdmFyeShyZXMsIGhlYWRlci52YWx1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGVhZGVyLnZhbHVlKSB7XG4gICAgICAgICAgcmVzLnNldEhlYWRlcihoZWFkZXIua2V5LCBoZWFkZXIudmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY29ycyhvcHRpb25zLCByZXEsIHJlcywgbmV4dCkge1xuICAgIHZhciBoZWFkZXJzID0gW10sXG4gICAgICBtZXRob2QgPSByZXEubWV0aG9kICYmIHJlcS5tZXRob2QudG9VcHBlckNhc2UgJiYgcmVxLm1ldGhvZC50b1VwcGVyQ2FzZSgpO1xuXG4gICAgaWYgKG1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgICAvLyBwcmVmbGlnaHRcbiAgICAgIGhlYWRlcnMucHVzaChjb25maWd1cmVPcmlnaW4ob3B0aW9ucywgcmVxKSk7XG4gICAgICBoZWFkZXJzLnB1c2goY29uZmlndXJlQ3JlZGVudGlhbHMob3B0aW9ucywgcmVxKSk7XG4gICAgICBoZWFkZXJzLnB1c2goY29uZmlndXJlTWV0aG9kcyhvcHRpb25zLCByZXEpKTtcbiAgICAgIGhlYWRlcnMucHVzaChjb25maWd1cmVBbGxvd2VkSGVhZGVycyhvcHRpb25zLCByZXEpKTtcbiAgICAgIGhlYWRlcnMucHVzaChjb25maWd1cmVNYXhBZ2Uob3B0aW9ucywgcmVxKSk7XG4gICAgICBoZWFkZXJzLnB1c2goY29uZmlndXJlRXhwb3NlZEhlYWRlcnMob3B0aW9ucywgcmVxKSk7XG4gICAgICBhcHBseUhlYWRlcnMoaGVhZGVycywgcmVzKTtcblxuICAgICAgaWYgKG9wdGlvbnMucHJlZmxpZ2h0Q29udGludWUpIHtcbiAgICAgICAgbmV4dCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2FmYXJpIChhbmQgcG90ZW50aWFsbHkgb3RoZXIgYnJvd3NlcnMpIG5lZWQgY29udGVudC1sZW5ndGggMCxcbiAgICAgICAgLy8gICBmb3IgMjA0IG9yIHRoZXkganVzdCBoYW5nIHdhaXRpbmcgZm9yIGEgYm9keVxuICAgICAgICByZXMuc3RhdHVzQ29kZSA9IG9wdGlvbnMub3B0aW9uc1N1Y2Nlc3NTdGF0dXM7XG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtTGVuZ3RoJywgJzAnKTtcbiAgICAgICAgcmVzLmVuZCgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBhY3R1YWwgcmVzcG9uc2VcbiAgICAgIGhlYWRlcnMucHVzaChjb25maWd1cmVPcmlnaW4ob3B0aW9ucywgcmVxKSk7XG4gICAgICBoZWFkZXJzLnB1c2goY29uZmlndXJlQ3JlZGVudGlhbHMob3B0aW9ucywgcmVxKSk7XG4gICAgICBoZWFkZXJzLnB1c2goY29uZmlndXJlRXhwb3NlZEhlYWRlcnMob3B0aW9ucywgcmVxKSk7XG4gICAgICBhcHBseUhlYWRlcnMoaGVhZGVycywgcmVzKTtcbiAgICAgIG5leHQoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtaWRkbGV3YXJlV3JhcHBlcihvKSB7XG4gICAgLy8gaWYgb3B0aW9ucyBhcmUgc3RhdGljIChlaXRoZXIgdmlhIGRlZmF1bHRzIG9yIGN1c3RvbSBvcHRpb25zIHBhc3NlZCBpbiksIHdyYXAgaW4gYSBmdW5jdGlvblxuICAgIHZhciBvcHRpb25zQ2FsbGJhY2sgPSBudWxsO1xuICAgIGlmICh0eXBlb2YgbyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgb3B0aW9uc0NhbGxiYWNrID0gbztcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0aW9uc0NhbGxiYWNrID0gZnVuY3Rpb24gKHJlcSwgY2IpIHtcbiAgICAgICAgY2IobnVsbCwgbyk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBjb3JzTWlkZGxld2FyZShyZXEsIHJlcywgbmV4dCkge1xuICAgICAgb3B0aW9uc0NhbGxiYWNrKHJlcSwgZnVuY3Rpb24gKGVyciwgb3B0aW9ucykge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgbmV4dChlcnIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBjb3JzT3B0aW9ucyA9IGFzc2lnbih7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgICAgICAgIHZhciBvcmlnaW5DYWxsYmFjayA9IG51bGw7XG4gICAgICAgICAgaWYgKGNvcnNPcHRpb25zLm9yaWdpbiAmJiB0eXBlb2YgY29yc09wdGlvbnMub3JpZ2luID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBvcmlnaW5DYWxsYmFjayA9IGNvcnNPcHRpb25zLm9yaWdpbjtcbiAgICAgICAgICB9IGVsc2UgaWYgKGNvcnNPcHRpb25zLm9yaWdpbikge1xuICAgICAgICAgICAgb3JpZ2luQ2FsbGJhY2sgPSBmdW5jdGlvbiAob3JpZ2luLCBjYikge1xuICAgICAgICAgICAgICBjYihudWxsLCBjb3JzT3B0aW9ucy5vcmlnaW4pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAob3JpZ2luQ2FsbGJhY2spIHtcbiAgICAgICAgICAgIG9yaWdpbkNhbGxiYWNrKHJlcS5oZWFkZXJzLm9yaWdpbiwgZnVuY3Rpb24gKGVycjIsIG9yaWdpbikge1xuICAgICAgICAgICAgICBpZiAoZXJyMiB8fCAhb3JpZ2luKSB7XG4gICAgICAgICAgICAgICAgbmV4dChlcnIyKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb3JzT3B0aW9ucy5vcmlnaW4gPSBvcmlnaW47XG4gICAgICAgICAgICAgICAgY29ycyhjb3JzT3B0aW9ucywgcmVxLCByZXMsIG5leHQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIGNhbiBwYXNzIGVpdGhlciBhbiBvcHRpb25zIGhhc2gsIGFuIG9wdGlvbnMgZGVsZWdhdGUsIG9yIG5vdGhpbmdcbiAgbW9kdWxlLmV4cG9ydHMgPSBtaWRkbGV3YXJlV3JhcHBlcjtcblxufSgpKTtcbiIsImltcG9ydCBleHByZXNzLCB7IFJlcXVlc3QsIFJlc3BvbnNlIH0gZnJvbSAnZXhwcmVzcyc7XG5pbXBvcnQgeyBjcmVhdGVQcm94eU1pZGRsZXdhcmUgfSBmcm9tICdodHRwLXByb3h5LW1pZGRsZXdhcmUnO1xuaW1wb3J0IGNvcnMgZnJvbSAnY29ycyc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydEFwcFNlcnZlcigpIHtcbiAgY29uc29sZS5sb2coXCJzdGFydCBzZXJ2ZXIgc2RcIik7XG4gIGNvbnN0IGFwcCA9IGV4cHJlc3MoKTtcbiAgY29uc3QgcG9ydCA9IDMzMzM7XG5cbiAgYXBwLnVzZShleHByZXNzLmpzb24oKSk7XG5cbiAgYXBwLnVzZShjb3JzKHtcbiAgICBvcmlnaW46ICcqJywgIFxuICAgIG1ldGhvZHM6ICdHRVQsSEVBRCxQVVQsUEFUQ0gsUE9TVCxERUxFVEUnLFxuICAgIGNyZWRlbnRpYWxzOiB0cnVlLCAgXG4gIH0pKTtcblxuICBjb25zdCBwcm94eU1pZGRsZXdhcmUgPSBjcmVhdGVQcm94eU1pZGRsZXdhcmUoJy9jb21meXVpJywge1xuICAgIHRhcmdldDogJ2h0dHA6Ly8xMjcuMC4wLjE6ODE4OCcsXG4gICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgIHdzOiB0cnVlLCAgXG4gICAgcGF0aFJld3JpdGU6IHtcbiAgICAgICdeL2NvbWZ5dWknOiAnJywgIFxuICAgIH0sXG4gIH0pO1xuICBcbiAgYXBwLnVzZSgnL2NvbWZ5dWknLCBwcm94eU1pZGRsZXdhcmUpO1xuXG4gIGFwcC5nZXQoJy8nLCAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSA9PiB7XG4gICAgcmVzLnNlbmQoJ0hlbGxvLCBFeHByZXNzICsgVHlwZVNjcmlwdCEgYXNkZicpO1xuICB9KTtcblxuICBhcHAucG9zdCgnL2FwaS9kYXRhJywgKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkgPT4ge1xuICAgIGNvbnN0IHsgZGF0YSB9ID0gcmVxLmJvZHk7XG4gICAgcmVzLmpzb24oeyBtZXNzYWdlOiBgUmVjZWl2ZWQgZGF0YTogJHtkYXRhfWAgfSk7XG4gIH0pO1xuXG4gIGFwcC5saXN0ZW4ocG9ydCwgKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKGBTZXJ2ZXIgaXMgcnVubmluZyBhdCBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH1gKTtcbiAgfSk7XG59XG4iLCJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgYXBwIH0gZnJvbSAnZWxlY3Ryb24nXG4vLyBpbXBvcnQgcHJlcGFyZU5leHQgZnJvbSAnZWxlY3Ryb24tbmV4dCdcbmltcG9ydCB7IGNyZWF0ZU1haW5XaW5kb3csIHJlc3RvcmVPckNyZWF0ZVdpbmRvdyB9IGZyb20gXCIuL3dpbmRvd3MtbWFuYWdlclwiO1xuaW1wb3J0IFwiLi9wcmVsYXVuY2hcIjtcbmltcG9ydCB7IHN0YXJ0QXV0b1VwZGF0ZXIgfSBmcm9tICcuL2F1dG8tdXBkYXRlJztcbmltcG9ydCB7IHN0YXJ0SVBDIH0gZnJvbSAnLi9pcGMnO1xuXG4vLyBQcmVwYXJlIHRoZSByZW5kZXJlciBvbmNlIHRoZSBhcHAgaXMgcmVhZHlcbmNvbnN0IHJlbmRlcmVyUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsIFwiLi4vcmVuZGVyZXJcIik7XG5jb25zb2xlLmxvZyhcInN0YXJ0ZWQ6XCIsIHJlbmRlcmVyUGF0aCk7XG5cbmltcG9ydCB7IHN0YXJ0QXBwU2VydmVyIH0gZnJvbSAnQGNvbWZsb3d5L25vZGUvc3JjL2FwcCc7XG5cbi8qKlxuICogRGlzYWJsZSBIYXJkd2FyZSBBY2NlbGVyYXRpb24gZm9yIG1vcmUgcG93ZXItc2F2ZVxuICovXG5hcHAuZGlzYWJsZUhhcmR3YXJlQWNjZWxlcmF0aW9uKCk7XG5cbmFwcC5vbigncmVhZHknLCBhc3luYyAoKSA9PiB7XG4gIC8vIHJ1biBuZXh0IGZyb250ZW5kIHNlcnZpY2VcbiAgLy8gYXdhaXQgcHJlcGFyZU5leHQocmVuZGVyZXJQYXRoKVxuICBhd2FpdCBzdGFydEFwcFNlcnZlcigpO1xuXG4gIC8vIHN0YXJ0IGRlc2t0b3Agd2luZG93XG4gIGF3YWl0IGNyZWF0ZU1haW5XaW5kb3coKTtcblxuICAvLyBtZXNzYWdlIGh1YlxuICBzdGFydElQQygpO1xuXG4gIC8vIGF1dG8gdXBkYXRlIGxpc3RlbmVyXG4gIHN0YXJ0QXV0b1VwZGF0ZXIoKVxufSlcblxuLy8gUXVpdCB0aGUgYXBwIG9uY2UgYWxsIHdpbmRvd3MgYXJlIGNsb3NlZFxuYXBwLm9uKCd3aW5kb3ctYWxsLWNsb3NlZCcsIGFwcC5xdWl0KVxuXG5hcHAub24oXCJhY3RpdmF0ZVwiLCByZXN0b3JlT3JDcmVhdGVXaW5kb3cpO1xuXG4iXSwibmFtZXMiOlsicmVxdWlyZSQkMCIsImNyeXB0byIsImlzRGV2IiwiZm9ybWF0IiwicGF0aCIsIkJyb3dzZXJXaW5kb3ciLCJCcm93c2VyVmlldyIsInNjb3BlRmFjdG9yeSIsIkxvZ2dlciIsInJlcXVpcmUkJDEiLCJyZXF1aXJlJCQyIiwicmVxdWlyZSQkMyIsImFwcCIsImF1dG9VcGRhdGVyIiwiZGlhbG9nIiwiaXBjTWFpbiIsInVybCIsImNvbW1vbiIsImRlYnVnIiwiaHR0cCIsImh0dHBzIiwicmVxdWlyZSQkNCIsInJlcXVpcmUkJDUiLCJmb2xsb3dSZWRpcmVjdHNNb2R1bGUiLCJmb2xsb3dSZWRpcmVjdHMiLCJyZXF1aXJlJCQ2IiwiaHR0cFByb3h5IiwiaXNQbGFpbk9iaiIsImxvZ2dlciIsInV0aWwiLCJlcnJvcnNfMSIsImxvZ2dlcl8xIiwiaXNFeHRnbG9iIiwiaXNHbG9iIiwidXRpbHMiLCJzdHJpbmdpZnkiLCJpc051bWJlciIsInRvUmVnZXhSYW5nZSIsImlzT2JqZWN0IiwiZmlsbCIsImNvbXBpbGUiLCJhcHBlbmQiLCJleHBhbmQiLCJjb25zdGFudHMiLCJNQVhfTEVOR1RIIiwiQ0hBUl9DT01NQSIsIkNIQVJfRE9UIiwiQ0hBUl9MRUZUX1BBUkVOVEhFU0VTIiwiQ0hBUl9SSUdIVF9QQVJFTlRIRVNFUyIsIkNIQVJfTEVGVF9DVVJMWV9CUkFDRSIsIkNIQVJfUklHSFRfQ1VSTFlfQlJBQ0UiLCJDSEFSX0xFRlRfU1FVQVJFX0JSQUNLRVQiLCJDSEFSX1JJR0hUX1NRVUFSRV9CUkFDS0VUIiwicGFyc2UiLCJwYXJzZV8xIiwiYnJhY2VzIiwiUE9TSVhfUkVHRVhfU09VUkNFIiwic2NhbiIsInBpY29tYXRjaCIsIm1pY3JvbWF0Y2giLCJjb250ZXh0TWF0Y2hlciIsImhhbmRsZXJzIiwicmVzcG9uc2VJbnRlcmNlcHRvcl8xIiwiZml4UmVxdWVzdEJvZHlfMSIsInRoaXMiLCJ2YXJ5TW9kdWxlIiwidmFyeV8xIiwibGliTW9kdWxlIiwiZXhwcmVzcyIsImNyZWF0ZVByb3h5TWlkZGxld2FyZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsTUFBTSxXQUFXQSxvQkFBQUE7QUFFakIsSUFBSSxPQUFPLGFBQWEsVUFBVTtBQUNqQyxRQUFNLElBQUksVUFBVTtBQUFBO0FBR3JCLE1BQU0sTUFBTSxTQUFTLE9BQU8sU0FBUyxPQUFPO0FBRTVDLE1BQU0sV0FBVyxxQkFBcUIsUUFBUTtBQUM5QyxNQUFNLGFBQWEsWUFBcUIsaUJBQWlCLFFBQVE7SUFFakUsZ0JBQWlCLFdBQVcsYUFBYSxDQUFDLElBQUk7QUNaOUMsTUFBTSxVQUFVLFFBQVEsYUFBYTtBQU9kLGdCQUFBO0FBQ25CLFNBQU9DLGdCQUFBQSxXQUFPO0FBQUE7QUNVbEIsSUFBSSxhQUFnQztBQUNwQyxJQUFJ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
