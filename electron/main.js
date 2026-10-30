const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { fork, execFile } = require("child_process");
const http = require("http");

let mainWindow = null;
let nextServerProcess = null;
const PORT = 34567; // Internal localhost port for standalone Next.js server

function getUserDataPaths() {
  const userDataDir = app.getPath("userData");
  const dbDir = path.join(userDataDir, "database");
  const uploadsDir = path.join(userDataDir, "uploads");

  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const dbPath = path.join(dbDir, "office.db");

  // Copy template DB if first launch
  const initialDbPath = path.join(__dirname, "..", "prisma", "dev.db");
  const rootDbPath = path.join(__dirname, "..", "dev.db");

  if (!fs.existsSync(dbPath)) {
    if (fs.existsSync(initialDbPath)) {
      fs.copyFileSync(initialDbPath, dbPath);
    } else if (fs.existsSync(rootDbPath)) {
      fs.copyFileSync(rootDbPath, dbPath);
    }
  }

  return {
    userDataDir,
    dbPath,
    uploadsDir,
  };
}

// Check if localhost port is ready
function waitForServer(port, timeout = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(`http://127.0.0.1:${port}`, (res) => {
        resolve();
      });
      req.on("error", () => {
        if (Date.now() - start > timeout) {
          reject(new Error("Timeout waiting for internal server"));
        } else {
          setTimeout(check, 300);
        }
      });
    };
    check();
  });
}

function startNextServer({ dbPath, uploadsDir }) {
  const standaloneServer = path.join(__dirname, "..", ".next", "standalone", "server.js");

  const env = {
    ...process.env,
    PORT: PORT.toString(),
    HOSTNAME: "127.0.0.1",
    DATABASE_URL: `file:${dbPath}`,
    UPLOADS_DIR: uploadsDir,
    NODE_ENV: "production",
  };

  console.log("Starting Next.js standalone process with SQLite at:", dbPath);
  nextServerProcess = fork(standaloneServer, [], { env, stdio: "inherit" });
}

async function createWindow() {
  const { dbPath, uploadsDir } = getUserDataPaths();

  // Start internal Next.js standalone server
  startNextServer({ dbPath, uploadsDir });

  // Wait until server starts responding
  await waitForServer(PORT);

  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: "نظام إدارة مكتب المحاماة",
    icon: path.join(__dirname, "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
  });

  mainWindow.loadURL(`http://127.0.0.1:${PORT}`);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// IPC: Scanner integration via NAPS2 CLI
ipcMain.handle("scan-document", async (event, options = {}) => {
  const { uploadsDir } = getUserDataPaths();
  const format = options.format || "pdf";
  const outputFileName = `scan_${Date.now()}.${format}`;
  const outputPath = path.join(uploadsDir, outputFileName);

  // Path to bundled or installed naps2.console.exe
  const naps2Path =
    options.customNaps2Path ||
    "C:\\Program Files\\NAPS2\\naps2.console.exe";

  if (!fs.existsSync(naps2Path)) {
    throw new Error(
      "برنامج المسح الضوئي NAPS2 غير مثبت في المسار الافتراضي. يرجى تثبيت NAPS2 من الموقع الرسمي: naps2.com"
    );
  }

  // CLI Arguments: naps2.console.exe -o "outputPath" --dpi 300
  const args = ["-o", outputPath, "--dpi", (options.dpi || 300).toString()];
  if (options.grayscale) args.push("--profile", "Grayscale");

  return new Promise((resolve, reject) => {
    execFile(naps2Path, args, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`فشل المسح الضوئي: ${stderr || error.message}`));
      } else {
        const stats = fs.statSync(outputPath);
        resolve({
          success: true,
          fileName: outputFileName,
          filePath: outputPath,
          fileSize: stats.size,
          mimeType: format === "pdf" ? "application/pdf" : "image/jpeg",
        });
      }
    });
  });
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (nextServerProcess) {
    nextServerProcess.kill();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

