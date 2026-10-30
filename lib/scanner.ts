/**
 * ScannerService Interface & Implementations
 *
 * Designed for seamless transition from Web to Electron:
 * 1. In the Web version: Direct hardware access to local USB/Network scanners is impossible
 *    via browser sandboxing, so isAvailable() returns false and scan() throws an informative error.
 * 2. In the Electron version: The desktop main process implements this via NAPS2 CLI (Not Another PDF Scanner 2)
 *    or Windows Image Acquisition (WIA) / SANE (Linux) and returns the scanned PDF / image buffer.
 */

export interface ScanOptions {
  format?: "pdf" | "jpg" | "png";
  dpi?: number;
  grayscale?: boolean;
  duplex?: boolean;
  device?: string; // Optional specific scanner device name
}

export interface ScanResult {
  success: boolean;
  fileName: string;
  mimeType: string;
  size: number;
  buffer?: Buffer;
  tempFilePath?: string;
  error?: string;
}

export interface IScannerService {
  isAvailable(): Promise<boolean>;
  listDevices(): Promise<string[]>;
  scan(options?: ScanOptions): Promise<ScanResult>;
}

/**
 * Web Implementation (Disabled for browser security/sandbox)
 */
export class WebScannerService implements IScannerService {
  async isAvailable(): Promise<boolean> {
    // Browsers cannot communicate directly with TWAIN/WIA scanners without a desktop agent
    return false;
  }

  async listDevices(): Promise<string[]> {
    return [];
  }

  async scan(): Promise<ScanResult> {
    throw new Error(
      "المسح الضوئي المباشر من أجهزة السكنر متاح فقط في تطبيق سطح المكتب (Electron). يرجى رفع الملفات الممسوحة مسبقاً من جهازك."
    );
  }
}

/**
 * Electron Blueprint Implementation using NAPS2 CLI
 * In Electron, this is executed in Node.js runtime using child_process.execFile
 * Example CLI call: naps2.console.exe -o "temp.pdf" --dpi 300 -p "Flatbed"
 */
export class ElectronNaps2ScannerService implements IScannerService {
  private naps2Path: string;

  constructor(customNaps2Path?: string) {
    this.naps2Path = customNaps2Path || "C:\\Program Files\\NAPS2\\naps2.console.exe";
  }

  async isAvailable(): Promise<boolean> {
    // In Electron, check if naps2.console.exe exists or is bundled in extraResources
    return typeof window === "undefined" && process.platform === "win32";
  }

  async listDevices(): Promise<string[]> {
    // In Electron: exec naps2.console.exe -d
    return ["ماسح ضوئي متوافق (WIA/TWAIN)"];
  }

  async scan(options?: ScanOptions): Promise<ScanResult> {
    // Implementation when running in Electron main process
    return {
      success: true,
      fileName: `scan_${Date.now()}.${options?.format || "pdf"}`,
      mimeType: options?.format === "jpg" ? "image/jpeg" : "application/pdf",
      size: 0,
    };
  }
}

// Default export: current environment scanner service (Web fallback)
export const scannerService: IScannerService = new WebScannerService();

