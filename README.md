# 🎧 STIL DJ STUDIO PRO (v0.1 Dragon Edition)
### *The Ultimate "Dummy-Friendly" Step-by-Step Guide* 🚀

Welcome to **STIL DJ STUDIO PRO**! Whether you are a beginner DJ, a music enthusiast, or a developer, this guide will walk you through setting up and running the application in simple, easy-to-follow steps with zero confusion!

---

## ⚡ Method 1: The Easiest Way (No Coding Required!)

If the app is already open in your browser, you can turn it into a **standalone desktop application** on your PC or Mac in just 3 clicks:

1. Look at the **top right corner** of the app header and click the **`🖥️ DESKTOP APP`** button.
2. Click **`Windows .EXE Launcher`** (or **`Windows PC Silent (.vbs)`** if you don't want a black command window to show up).
   *(Mac users: click `Mac .COMMAND Launcher`)*.
3. Open your computer's `Downloads` folder and **double-click the downloaded file**.
4. **BOOM!** STIL DJ STUDIO PRO launches in its own dedicated, distraction-free desktop app window! 🎉

---

## 💻 Method 2: Step-by-Step Setup on Your Computer (For Windows & Mac)

Follow these simple steps to download and run the DJ Studio on your own computer.

---

### Step 1: Install Node.js (Only needed once!)

Node.js is the free software engine that runs web applications on your computer.

1. Go to [https://nodejs.org](https://nodejs.org) in your web browser.
2. Click the big green button that says **LTS (Recommended for Most Users)**.
3. Open the downloaded installer file and click **Next -> Next -> Install** until it finishes.
4. *(Restart your computer if prompted).*

---

### Step 2: Download the Project Code

1. Download or clone this project repository to your computer.
   - If using Git, run this in your terminal:
     ```bash
     git clone https://github.com/your-username/stil-dj-studio-pro.git
     ```
   - Or click **Code -> Download ZIP** on GitHub, then right-click the downloaded `.zip` file and choose **Extract All**.

---

### Step 3: Open Command Prompt or Terminal

- **On Windows:** Press `Windows Key + R`, type `cmd`, and press `Enter`.
- **On Mac:** Press `Cmd + Space`, type `Terminal`, and press `Enter`.

Navigate into your project folder by typing `cd` followed by a space, then drag and drop the folder into the terminal window and press `Enter`:
```bash
cd path/to/your/stil-dj-studio-pro
```

---

### Step 4: Install Dependencies (Just 1 Command!)

Type the following command in your terminal/command prompt and press `Enter`:

```bash
npm install
```

⏳ *Wait 10–30 seconds while your computer automatically downloads the required music and UI engines.*

---

### Step 5: Start STIL DJ STUDIO PRO!

Type this command and press `Enter`:

```bash
npm run dev
```

You will see output like this:
```
  VITE v5.x.x  ready in 300 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.x:3000/
```

---

### Step 6: Open the App in Your Browser

Open Chrome, Edge, Safari, or Firefox and go to:
👉 **`http://localhost:3000`**

**Congratulations! You are now running STIL DJ STUDIO PRO live on your PC or Mac!** 🎧🎛️🔥

---

## 🎵 How to Play Music & DJ Like a Pro

### 1. 🔴 Load YouTube Videos or Local MP3s
- Click the **`🔴 YOUTUBE MP3`** button at the top or in the sidebar.
- Paste any YouTube link (e.g., `https://www.youtube.com/watch?v=...`) or pick one of the curated sample songs.
- Select **Load to Deck A** or **Load to Deck B** — audio waveform renders instantly!
- You can also drag & drop your own local `.mp3` or `.wav` files directly onto any turntable deck!

### 2. 🎛️ Stem Isolation (Vocals, Drums, Bass, Synth)
- On each deck strip, use the **`VOCAL SOLO`**, **`DRUM SOLO`**, or individual stem switches to isolate vocals for acapellas or mute drums for seamless beat transitions.

### 3. 🎚️ Slip Mode
- Click **`SLIP`** on any deck. When you scratch the vinyl or jump to a hot cue, the track continues playing silently in the background and catches back up seamlessly when you release!

### 4. 🎨 Hot Cues with Custom Colors
- Click **`C1`**, **`C2`**, **`C3`**, or **`C4`** during playback to set jump points.
- Click the tiny color dots below the cue button to assign custom colors that appear directly on the progress bar scrubber!

### 5. 📊 Real-Time Audio Spectrum Visualizer
- The central mixer features a real-time Web Audio API frequency visualizer displaying Bass, Midrange, and Treble spectrum meters. Switch modes between **FFT**, **WAVE**, or **STEREO**.

---

## ⌨️ Easy Keyboard Shortcuts

| Action | Deck A (Left) | Deck B (Right) |
| :--- | :--- | :--- |
| **Play / Pause** | `Spacebar` or `Q` | `E` |
| **Set / Jump Cue** | `C` | `I` |
| **Pitch Bend Down / Up** | `S` / `W` | `K` / `O` |
| **Hot Cues 1, 2, 3, 4** | `1`, `2`, `3`, `4` | `7`, `8`, `9`, `0` |
| **Crossfader Left / Right** | `←` Left Arrow | `→` Right Arrow |

---

## ❓ Frequently Asked Questions & Troubleshooting

#### 🔇 Issue: I loaded a song and clicked play, but there is no sound!
> **Fix:** Web browsers block audio from playing automatically until you interact with the page. **Click anywhere on the screen** or click the **PLAY** button once to activate the Web Audio engine!

#### ⚠️ Issue: "Command 'npm' is not found"
> **Fix:** You need to install Node.js first. Download it from [https://nodejs.org](https://nodejs.org) and restart your command prompt/terminal window.

#### ⛔ Issue: "Port 3000 is already in use"
> **Fix:** Close any other open terminal windows running the app, or edit `package.json` to change `--port=3000` to `--port=3001`.

---

## 🎁 Bonus: How to Build an `.EXE` File for Windows

Want a real standalone `.exe` installer?

1. Install Electron by running:
   ```bash
   npm install --save-dev electron electron-builder
   ```
2. Run the build script:
   ```bash
   npx electron-builder
   ```
3. Look in the newly created `dist/` folder for your brand new `STIL_DJ_STUDIO_PRO.exe` file!

---

## 📄 License

STIL DJ STUDIO PRO is free and open-source under the MIT License. Happy DJing! 🎧✨
