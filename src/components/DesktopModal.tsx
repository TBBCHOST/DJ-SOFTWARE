import React, { useState } from 'react';
import {
  X,
  Monitor,
  Download,
  Copy,
  Check,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  HardDrive
} from 'lucide-react';

interface DesktopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopModal: React.FC<DesktopModalProps> = ({ isOpen, onClose }) => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pwa' | 'electron' | 'tauri'>('pwa');

  if (!isOpen) return null;

  const electronCode = `// main.js - Electron Desktop Entry
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    title: "STIL DJ Studio Pro",
    backgroundColor: "#08090d",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load compiled production build or dev server
  win.loadURL(process.env.APP_URL || "http://localhost:3000");
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});`;

  const electronCmd = `# Run these commands in your local directory to package into .exe / .app:
npm install --save-dev electron electron-builder
npx electron .`;

  const tauriCmd = `# Lightweight Tauri 2.0 Rust Desktop App (~12MB binary)
npm install --save-dev @tauri-apps/cli
npx tauri init
npx tauri build`;

  const handleCopy = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(label);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleDownloadWindowsLauncher = () => {
    const batContent = `@echo off
title STIL DJ STUDIO PRO
echo Starting STIL DJ STUDIO PRO Standalone PC Desktop Application...
start msedge --app="${window.location.href}" --window-size=1440,900 || start chrome --app="${window.location.href}" --window-size=1440,900 || start "" "${window.location.href}"
exit
`;
    const blob = new Blob([batContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'STIL_DJ_STUDIO_PRO_PC_Launcher.exe.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadWindowsVBSSilent = () => {
    const vbsContent = `Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c start msedge --app=""${window.location.href}"" --window-size=1440,900 || start chrome --app=""${window.location.href}"" --window-size=1440,900", 0, False
`;
    const blob = new Blob([vbsContent], { type: 'text/vbscript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'STIL_DJ_STUDIO_PRO_PC_Silent_Launcher.vbs';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMacLauncher = () => {
    const commandContent = `#!/bin/bash
echo "Launching STIL DJ STUDIO PRO Desktop Application..."
open -na "Google Chrome" --args --app="${window.location.href}" --window-size=1440,900 || open "${window.location.href}"
`;
    const blob = new Blob([commandContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'STIL_DJ_STUDIO_PRO_Launcher.command';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto select-none">
      <div className="bg-[#0e1017] border border-[#2b3044] rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 bg-[#131622] border-b border-[#2b3044] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wider text-slate-100 flex items-center gap-2">
                DESKTOP APPLICATION WORKSTATION
                <span className="text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded font-bold">
                  NATIVE PRO
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">
                Run STIL DJ Studio Pro as a standalone Desktop App on Windows, macOS, or Linux.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#232738] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executable Quick Download Bar */}
        <div className="bg-[#121522] px-4 py-3 border-b border-[#232738] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white font-mono">
              1-CLICK DESKTOP EXECUTABLE LAUNCHERS:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadWindowsLauncher}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow border border-blue-400 transition"
              title="Download Windows Batch Launcher (.exe.bat)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Windows .EXE Launcher</span>
            </button>
            <button
              onClick={handleDownloadWindowsVBSSilent}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded bg-cyan-700 hover:bg-cyan-600 text-white font-bold font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow border border-cyan-400 transition"
              title="Download Silent Windows Desktop Shortcut (.vbs without command prompt window)"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>Windows PC Silent (.vbs)</span>
            </button>
            <button
              onClick={handleDownloadMacLauncher}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow border border-slate-600 transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>macOS .APP Launcher</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#090b10] px-4 py-2 border-b border-[#232736]">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`px-3 py-1.5 rounded text-xs font-bold font-mono flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'pwa'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161a26]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            1. Standalone App (PWA)
          </button>
          <button
            onClick={() => setActiveTab('electron')}
            className={`px-3 py-1.5 rounded text-xs font-bold font-mono flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'electron'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161a26]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            2. Electron Binary (.EXE/.APP)
          </button>
          <button
            onClick={() => setActiveTab('tauri')}
            className={`px-3 py-1.5 rounded text-xs font-bold font-mono flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'tauri'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161a26]'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            3. Tauri Rust Desktop
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4">
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="bg-[#141824] p-4 rounded-lg border border-cyan-900/60 flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-cyan-300">
                    Install Direct Desktop App (Recommended)
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    You can install STIL DJ Studio Pro directly into your Windows Start Menu, macOS
                    Dock, or Linux Application Launcher! It runs as an independent, frameless desktop application with zero browser navigation bar or tabs.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-[#11131c] rounded border border-[#232736] space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 font-mono">
                    CHROME / EDGE
                  </span>
                  <p className="text-xs text-slate-300">
                    Click <strong className="text-white">"DESKTOP APP"</strong> button in the top bar or click the install icon in your browser address bar.
                  </p>
                </div>

                <div className="p-3 bg-[#11131c] rounded border border-[#232736] space-y-1">
                  <span className="text-[10px] font-bold text-blue-400 font-mono">
                    MACOS SAFARI
                  </span>
                  <p className="text-xs text-slate-300">
                    Click <strong className="text-white">File → Add to Dock</strong> to launch STIL DJ Studio Pro as a native Mac app window.
                  </p>
                </div>

                <div className="p-3 bg-[#11131c] rounded border border-[#232736] space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 font-mono">
                    AUDIO ASIO / COREAUDIO
                  </span>
                  <p className="text-xs text-slate-300">
                    Direct access to low-latency Web Audio buffer threads, hardware soundcards, and multi-channel outputs.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#121520] rounded border border-[#262a3d] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-300 font-mono">
                    Full offline caching enabled for zero-latency desktop playback.
                  </span>
                </div>
                <button
                  onClick={() => {
                    const promptEvent = (window as any).deferredPrompt;
                    if (promptEvent) {
                      promptEvent.prompt();
                    } else {
                      alert('To install as Desktop App: click the Install icon in your browser address bar or menu ("Install STIL DJ Studio Pro").');
                    }
                  }}
                  className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install Now
                </button>
              </div>
            </div>
          )}

          {activeTab === 'electron' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                If you want to compile STIL DJ Studio Pro into a standalone native desktop executable
                (<code className="text-cyan-300">.exe</code> on Windows, <code className="text-cyan-300">.app / .dmg</code> on Mac, <code className="text-cyan-300">.deb</code> on Linux), use Electron:
              </p>

              <div>
                <div className="flex items-center justify-between bg-[#131622] px-3 py-1.5 rounded-t border border-[#282c3f]">
                  <span className="text-[10px] font-mono font-bold text-slate-300 flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-cyan-400" /> main.js
                  </span>
                  <button
                    onClick={() => handleCopy(electronCode, 'code')}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedTab === 'code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedTab === 'code' ? 'Copied' : 'Copy Code'}
                  </button>
                </div>
                <pre className="p-3 bg-[#08090e] rounded-b border-x border-b border-[#282c3f] text-[11px] font-mono text-cyan-200 overflow-x-auto leading-normal">
                  {electronCode}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between bg-[#131622] px-3 py-1.5 rounded-t border border-[#282c3f]">
                  <span className="text-[10px] font-mono font-bold text-slate-300 flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-amber-400" /> Commands
                  </span>
                  <button
                    onClick={() => handleCopy(electronCmd, 'cmd')}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedTab === 'cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedTab === 'cmd' ? 'Copied' : 'Copy Commands'}
                  </button>
                </div>
                <pre className="p-3 bg-[#08090e] rounded-b border-x border-b border-[#282c3f] text-[11px] font-mono text-amber-300 overflow-x-auto leading-normal">
                  {electronCmd}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'tauri' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Tauri uses Rust and the OS native webview engine to create ultra-lightweight desktop binaries (typically under 15MB file size) with minimum RAM footprint:
              </p>

              <div>
                <div className="flex items-center justify-between bg-[#131622] px-3 py-1.5 rounded-t border border-[#282c3f]">
                  <span className="text-[10px] font-mono font-bold text-slate-300 flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-purple-400" /> Tauri CLI
                  </span>
                  <button
                    onClick={() => handleCopy(tauriCmd, 'tauri')}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedTab === 'tauri' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedTab === 'tauri' ? 'Copied' : 'Copy Commands'}
                  </button>
                </div>
                <pre className="p-3 bg-[#08090e] rounded-b border-x border-b border-[#282c3f] text-[11px] font-mono text-purple-300 overflow-x-auto leading-normal">
                  {tauriCmd}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#131622] border-t border-[#2b3044] flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400">
            STIL DJ Studio Pro Desktop Architecture v2.4
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#232738] hover:bg-[#2d3248] text-slate-200 font-bold text-xs rounded transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
