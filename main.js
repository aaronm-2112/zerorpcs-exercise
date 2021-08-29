const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");

//TODO: Handle integer overflow error. Make equals sign larger. Perhaps center the text in the top

let mainWindow = null;
const createWindow = () => {
  mainWindow = new BrowserWindow({ width: 800, height: 600 });
  mainWindow.loadURL(
    require("url").format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true,
    })
  );
  // mainWindow.webContents.openDevTools();
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.setTitle("Calculator");
  });
};
app.on("ready", createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// add these to the end or middle of main.js

let pyProc = null;
let pyPort = null;

const selectPort = () => {
  pyPort = 4242;
  return pyPort;
};

// const createPyProc = () => {
//   let port = "" + selectPort();
//   let script = path.join(__dirname, "pycalc", "api.py");
//   pyProc = require("child_process").spawn("python", [script, port]);
//   if (pyProc != null) {
//     console.log("child process success");
//   }
// };

// main.js
// the improved version
const createPyProc = () => {
  let script = getScriptPath();
  let port = "" + selectPort();

  if (guessPackaged()) {
    pyProc = require("child_process").execFile(script, [port]);
  } else {
    pyProc = require("child_process").spawn("/usr/bin/python3", [script, port]); // Set to system python make a note of this in the readme
  }

  if (pyProc != null) {
    //console.log(pyProc)
    console.log("child process success on port " + port);
  }
};

const exitPyProc = () => {
  pyProc.kill();
  pyProc = null;
  pyPort = null;
};

app.on("ready", createPyProc);
app.on("will-quit", exitPyProc);

// check for an executable
// main.js

const PY_DIST_FOLDER = "pycalcdist";
const PY_FOLDER = "pycalc";
const PY_MODULE = "api"; // without .py suffix

const guessPackaged = () => {
  const fullPath = path.join(__dirname, PY_DIST_FOLDER);
  return require("fs").existsSync(fullPath);
};

const getScriptPath = () => {
  if (!guessPackaged()) {
    return path.join(__dirname, PY_FOLDER, PY_MODULE + ".py");
  }
  if (process.platform === "win32") {
    return path.join(__dirname, PY_DIST_FOLDER, PY_MODULE, PY_MODULE + ".exe");
  }
  return path.join(__dirname, PY_DIST_FOLDER, PY_MODULE, PY_MODULE);
};
