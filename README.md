# VirtualDJ Pro Studio - Web & Standalone Desktop Edition

![VirtualDJ Pro Studio Banner](https://images.unsplash.com/photo-1571266028243-e4733b0f0bb1?q=80&w=1200&auto=format&fit=crop)

VirtualDJ Pro Studio is a full-featured, professional web and desktop DJ application built with **React**, **TypeScript**, **Tailwind CSS**, and the browser's native **Web Audio API DSP engine**. It provides zero-latency vinyl scratch physics, 2/4/6/8 deck performance modes, stem separation, built-in sampler pads, live web broadcasting, and a YouTube-to-MP3 converter stream engine.

---

## 🎧 Key Features & Capabilities

### 1. Authentic VirtualDJ Pro Skin & Interface
- **High-Contrast Pro Layout**: Dark obsidian skin matching Virtual DJ's ergonomic design.
- **Multi-Deck Switching**: Toggle instantly between **2-Deck**, **4-Deck**, **6-Deck**, and **8-Deck** layouts with dedicated deck indicators (Decks A, B, C, D, E, F, G, H).
- **VirtualDJ Pro Settings Modal**: Configure latency buffers (1ms – 50ms), audio driver emulation (WASAPI Exclusive, ASIO, CoreAudio, DirectSound), crossfader curves (Smooth, Full, Scratch Cut), and waveform color schemes (VirtualDJ Tri-Band, RGB Frequency, Neon Cyan, Monochrome).

### 2. 🔴 YouTube Stream & MP3 Audio Converter
- **Direct YouTube URL Processing**: Paste any YouTube video link (`https://www.youtube.com/watch?v=...` or `https://youtu.be/...`) to stream or convert directly into an audio buffer for DJ mixing.
- **Instant Deck Loading**: Load YouTube streams directly to Deck A, Deck B, or any active deck.
- **Auto BPM & Key Detection**: Automatically calculates tempo, beat grid, and harmonic key for seamless beatmatching.
- **Featured Curated YouTube Tracks**: Includes quick-load electronic, hip-hop, house, synthwave, and trap tracks for instant testing.

### 3. 🖥️ Desktop .EXE and .APP Standalone Executable Launchers
- **1-Click Launchers**: Download native Windows `.bat`/`.exe` or macOS `.command`/`.app` launchers directly from the app interface to run VirtualDJ Pro in dedicated kiosk app mode (without browser frames).
- **Electron & Tauri Packaging**: Full step-by-step instructions included in the app to compile standalone binaries using **Electron** or **Tauri**.

### 4. 🎛️ Advanced DSP & Mixing Engine
- **Vinyl Scratch Physics**: Ultra-responsive angular momentum and velocity tracking for true turntable scratching.
- **Real-Time Stem Separation**: Extract or mute **Vocals**, **Drums**, **Bass**, and **Melody** on any playing track.
- **Multi-Band Master & Channel EQs**: Low, Mid, High band gains with kill switches and resonant High Pass / Low Pass filters.
- **Performance Pads & FX**: 8 Hot Cues, Beat Roll, Auto Loop (1/16 to 32 beats), Sampler Pads, Reverb, Delay, Flanger, and Bitcrusher.
- **Live Web Broadcasting**: Stream your live set to Icecast/SHOUTcast servers or capture local mixed audio.

---

## 🚀 Quick Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun**

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/virtualdj-pro-studio.git
cd virtualdj-pro-studio
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will start on `http://localhost:3000` (or `http://0.0.0.0:3000`).

### 3. Build for Production
```bash
npm run build
npm run start
```

---

## 💻 Packaging as Desktop App (.EXE / .APP)

You can package VirtualDJ Pro Studio into a native Windows `.exe` or macOS `.app` using **Electron** or **Tauri**:

### Option A: Electron Packaging
1. Install Electron dependencies:
   ```bash
   npm install --save-dev electron electron-builder
   ```
2. Create an `electron.js` entry point:
   ```javascript
   const { app, BrowserWindow } = require('electron');
   const path = require('path');

   function createWindow() {
     const win = new BrowserWindow({
       width: 1440,
       height: 900,
       title: "VirtualDJ Pro Studio",
       webPreferences: { nodeIntegration: true }
     });
     win.loadURL('http://localhost:3000');
   }

   app.whenReady().then(createWindow);
   ```
3. Build the native executable:
   ```bash
   npx electron-builder
   ```

### Option B: Tauri Packaging (Lightweight C++/Rust)
```bash
npm install --save-dev @tauri-apps/cli
npx tauri init
npx tauri build
```

---

## ⌨️ Hotkey & Keyboard Shortcuts

| Control | Deck A | Deck B |
| :--- | :--- | :--- |
| **Play / Pause** | `Space` / `Q` | `E` |
| **Cue Point** | `C` | `I` |
| **Pitch Down / Up** | `S` / `W` | `K` / `O` |
| **Hot Cues 1 – 4** | `1`, `2`, `3`, `4` | `7`, `8`, `9`, `0` |
| **Crossfader Left / Right** | `←` (Left Arrow) | `→` (Right Arrow) |

---

## 🛠️ Architecture & DSP Pipeline

```
[ YouTube URL / Local Audio File ]
                │
                ▼
      [ Web Audio Context ]
                │
                ├─────────────────────────────┐
                ▼                             ▼
   [ AudioBufferSourceNode ]         [ Stem Processor Filters ]
     (Speed/Pitch Control)             (Vocals / Bass / Drums)
                │                             │
                └──────────────┬──────────────┘
                               ▼
                   [ BiquadFilterNodes ]
                    (Low / Mid / High EQ)
                               │
                               ▼
                   [ GainNode Crossfader ]
                               │
                               ▼
               [ AnalyserNode & Master Output ]
```

---

## 📄 License

VirtualDJ Pro Studio is available under the MIT License.
