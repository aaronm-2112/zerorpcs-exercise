const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");

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

  mainWindow.webContents.openDevTools();
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

// code for spawning a process that runs the Python server
let pyProc = null;
let pyPort = null;

const selectPort = () => {
  pyPort = 4242;
  return pyPort;
};

// main.js
// the improved version
// checks if the python server has been packaged and executes the file if so
// otherwise it spawns a new child process using the system python to run the Python server
const createPyProc = () => {
  let script = getScriptPath();
  let port = "" + selectPort();
  console.log("Create py proc");

  if (guessPackaged()) {
    console.log("here");
    pyProc = require("child_process").execFile(script, [port]);
  } else {
    console.log("Here");
    pyProc = require("child_process").spawn("python", [script, port]); // Replace 'python' with the system path to your python directory here

    if (pyProc != null) {
      console.log("child process success on port " + port);
    }
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
