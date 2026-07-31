import React, { useState, useEffect } from 'react';
import {
  Radio,
  Wifi,
  Settings,
  Activity,
  Copy,
  Check,
  Play,
  Square,
  Volume2,
  RefreshCw,
  ExternalLink,
  Download,
  Send,
  AlertTriangle,
  Info,
  Server,
  Layers,
  X,
  Disc,
} from 'lucide-react';
import { broadcastEngine } from '../utils/broadcastEngine';
import { audioEngine } from '../utils/audioEngine';
import { BroadcastConfig, BroadcastServerType, AudioFormat } from '../types';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAudioUnlocked: boolean;
  onUnlockAudio: () => void;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  isAudioUnlocked,
  onUnlockAudio,
}) => {
  const [activeTab, setActiveTab] = useState<'control' | 'config' | 'preview'>('control');
  const [config, setConfig] = useState<BroadcastConfig>(broadcastEngine.config);
  const [status, setStatus] = useState(broadcastEngine.status);
  const [logs, setLogs] = useState(broadcastEngine.logs);
  const [customIcyTitle, setCustomIcyTitle] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  useEffect(() => {
    const unsub = broadcastEngine.subscribe(() => {
      setStatus({ ...broadcastEngine.status });
      setConfig({ ...broadcastEngine.config });
      setLogs([...broadcastEngine.logs]);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleConfigChange = (field: keyof BroadcastConfig, value: any) => {
    const updated = { ...config, [field]: value };
    setConfig(updated);
    broadcastEngine.saveConfig({ [field]: value });
  };

  const handleStartBroadcast = async () => {
    if (!isAudioUnlocked) {
      await onUnlockAudio();
    }
    const destination = audioEngine.getStreamDestination();
    await broadcastEngine.startBroadcast(destination);
  };

  const handleStopBroadcast = () => {
    broadcastEngine.stopBroadcast();
  };

  const handleSendIcyTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (customIcyTitle.trim()) {
      broadcastEngine.sendIcyMetadata(customIcyTitle);
      setCustomIcyTitle('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const downloadPlsPlaylist = () => {
    const content = `[playlist]\nNumberOfEntries=1\nFile1=${status.mountUrl}\nTitle1=${config.stationName}\nLength1=-1\nVersion=2`;
    const blob = new Blob([content], { type: 'audio/x-scpls' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.stationName.replace(/\s+/g, '_')}.pls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyPreset = (preset: 'icecast' | 'shoutcast' | 'local') => {
    if (preset === 'icecast') {
      const p: Partial<BroadcastConfig> = {
        serverType: 'icecast2',
        host: 'stream.myradio.com',
        port: 8000,
        mount: '/live.ogg',
        username: 'source',
        bitrate: 192,
        format: 'audio/ogg;codecs=opus',
      };
      broadcastEngine.saveConfig(p);
    } else if (preset === 'shoutcast') {
      const p: Partial<BroadcastConfig> = {
        serverType: 'shoutcast2',
        host: 'shoutcast.myradio.com',
        port: 8000,
        mount: '/stream/1/',
        username: 'admin',
        bitrate: 320,
        format: 'audio/mpeg',
      };
      broadcastEngine.saveConfig(p);
    } else {
      const p: Partial<BroadcastConfig> = {
        serverType: 'icecast2',
        host: 'localhost',
        port: 8000,
        mount: '/stream',
        username: 'source',
        bitrate: 128,
        format: 'audio/webm;codecs=opus',
      };
      broadcastEngine.saveConfig(p);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header Modal Bar */}
        <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                status.isBroadcasting
                  ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/40'
                  : 'bg-blue-600 text-white shadow-blue-600/30'
              }`}
            >
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  Shoutcast & Icecast Live Broadcast Suite
                </h2>
                {status.isBroadcasting ? (
                  <span className="flex items-center gap-1 text-[10px] bg-rose-950 text-rose-400 border border-rose-800 font-mono font-bold px-2 py-0.5 rounded-full animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shadow-glow" /> LIVE ON AIR
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 font-mono font-bold px-2 py-0.5 rounded-full">
                    OFFLINE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Stream 8-Deck live audio to remote Icecast2, Shoutcast v1/v2, or WebStream servers with ICY metadata
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Close Broadcast Suite"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2 text-xs font-bold font-mono">
          <button
            onClick={() => setActiveTab('control')}
            className={`px-4 py-2.5 rounded-t-xl border-t border-x transition flex items-center gap-2 ${
              activeTab === 'control'
                ? 'bg-slate-900 border-slate-800 text-blue-400 shadow'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" /> Live Control & ICY Titles
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2.5 rounded-t-xl border-t border-x transition flex items-center gap-2 ${
              activeTab === 'config'
                ? 'bg-slate-900 border-slate-800 text-blue-400 shadow'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" /> Server & Audio Config
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2.5 rounded-t-xl border-t border-x transition flex items-center gap-2 ${
              activeTab === 'preview'
                ? 'bg-slate-900 border-slate-800 text-blue-400 shadow'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wifi className="w-4 h-4" /> Stream Link & Web Player
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: LIVE CONTROL & METADATA */}
          {activeTab === 'control' && (
            <div className="space-y-6">
              {/* Main Action Banner */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    Target Broadcast Mount Point
                  </span>
                  <div className="text-sm font-mono font-extrabold text-blue-400 truncate max-w-md">
                    {status.mountUrl}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 justify-center sm:justify-start">
                    <span>Protocol: <strong className="text-slate-200 uppercase">{config.serverType}</strong></span>
                    <span>•</span>
                    <span>Bitrate: <strong className="text-slate-200">{config.bitrate} kbps</strong></span>
                    <span>•</span>
                    <span>Format: <strong className="text-slate-200">{config.format.split(';')[0]}</strong></span>
                  </div>
                </div>

                <div>
                  {!status.isBroadcasting ? (
                    <button
                      onClick={handleStartBroadcast}
                      disabled={status.isConnecting}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
                    >
                      {status.isConnecting ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" /> CONNECTING...
                        </>
                      ) : (
                        <>
                          <Radio className="w-5 h-5" /> START LIVE BROADCAST
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleStopBroadcast}
                      className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/30 font-extrabold text-sm shadow-xl flex items-center gap-2 transition active:scale-95"
                    >
                      <Square className="w-5 h-5 fill-rose-500" /> STOP BROADCAST
                    </button>
                  )}
                </div>
              </div>

              {/* Status & Signal Dashboard Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                    On-Air Duration
                  </span>
                  <span className="text-lg font-mono font-extrabold text-white">
                    {broadcastEngine.formatDuration(status.durationSeconds)}
                  </span>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                    Data Transmitted
                  </span>
                  <span className="text-lg font-mono font-extrabold text-amber-400">
                    {(status.bytesSent / (1024 * 1024)).toFixed(2)} <span className="text-xs text-slate-400">MB</span>
                  </span>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                    Active Listeners
                  </span>
                  <span className="text-lg font-mono font-extrabold text-emerald-400">
                    {status.listenersCount}
                  </span>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                    VU Signal Peak
                  </span>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full mt-2 overflow-hidden border border-slate-800">
                    <div
                      className="h-full transition-all duration-75 rounded-full"
                      style={{
                        width: `${Math.min(100, status.peakLevel * 120)}%`,
                        backgroundColor: status.peakLevel > 0.85 ? '#ef4444' : '#10b981',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* ICY Metadata Updater */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-pink-400" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                      ICY Live Stream Title (Now Playing)
                    </h3>
                  </div>

                  <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={config.autoIcyMetadata}
                      onChange={(e) => handleConfigChange('autoIcyMetadata', e.target.checked)}
                      className="accent-blue-500 rounded"
                    />
                    <span className="text-slate-400">Auto-Sync Playing Decks</span>
                  </label>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between gap-3">
                  <div className="truncate">
                    <span className="text-[10px] text-slate-500 font-mono block">CURRENT ICY TITLE:</span>
                    <span className="text-sm font-mono font-bold text-amber-300 truncate block">
                      {status.currentTrackTitle}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSendIcyTitle} className="flex gap-2">
                  <input
                    type="text"
                    value={customIcyTitle}
                    onChange={(e) => setCustomIcyTitle(e.target.value)}
                    placeholder="Override ICY Title (e.g. Artist - Song or Live Station Announcement)..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" /> PUSH TITLE
                  </button>
                </form>
              </div>

              {/* Broadcast Activity & Protocol Log Terminal */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 block">
                  Broadcast Terminal & ICY Protocol Log
                </span>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 h-40 overflow-y-auto font-mono text-[11px] space-y-1">
                  {logs.length === 0 ? (
                    <div className="text-slate-500 italic">No broadcast logs yet. Click 'Start Live Broadcast'.</div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="flex gap-2">
                        <span className="text-slate-500">[{log.timestamp}]</span>
                        <span
                          className={
                            log.type === 'error'
                              ? 'text-rose-400 font-bold'
                              : log.type === 'success'
                              ? 'text-emerald-400 font-bold'
                              : log.type === 'metadata'
                              ? 'text-amber-300'
                              : log.type === 'warn'
                              ? 'text-amber-400'
                              : 'text-slate-300'
                          }
                        >
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SERVER & AUDIO CONFIG */}
          {activeTab === 'config' && (
            <div className="space-y-6">
              {/* Preset Selection Buttons */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-300">Quick Config Presets:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => applyPreset('icecast')}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-mono font-bold border border-slate-700 transition"
                  >
                    Icecast v2 Preset
                  </button>
                  <button
                    onClick={() => applyPreset('shoutcast')}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-pink-400 text-xs font-mono font-bold border border-slate-700 transition"
                  >
                    Shoutcast v2 Preset
                  </button>
                  <button
                    onClick={() => applyPreset('local')}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-mono font-bold border border-slate-700 transition"
                  >
                    Local Host / Test
                  </button>
                </div>
              </div>

              {/* Server Parameters Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">
                    Server Protocol Type
                  </label>
                  <select
                    value={config.serverType}
                    onChange={(e) => handleConfigChange('serverType', e.target.value as BroadcastServerType)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="icecast2">Icecast2 (HTTP PUT / SOURCE)</option>
                    <option value="shoutcast">Shoutcast v1 (ICY Handshake)</option>
                    <option value="shoutcast2">Shoutcast v2 (Ultravox Protocol)</option>
                    <option value="webstream">WebStream Relay Proxy</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">
                    Host / Server IP
                  </label>
                  <input
                    type="text"
                    value={config.host}
                    onChange={(e) => handleConfigChange('host', e.target.value)}
                    placeholder="e.g. icecast.myradio.com or 192.168.1.100"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Port</label>
                  <input
                    type="number"
                    value={config.port}
                    onChange={(e) => handleConfigChange('port', parseInt(e.target.value) || 8000)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">
                    Mount Point / Stream Key
                  </label>
                  <input
                    type="text"
                    value={config.mount}
                    onChange={(e) => handleConfigChange('mount', e.target.value)}
                    placeholder="e.g. /stream or /live"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Username</label>
                  <input
                    type="text"
                    value={config.username}
                    onChange={(e) => handleConfigChange('username', e.target.value)}
                    placeholder="e.g. source"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Source Password</label>
                  <input
                    type="password"
                    value={config.password}
                    onChange={(e) => handleConfigChange('password', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Encoder & Station Info Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">
                    Streaming Format
                  </label>
                  <select
                    value={config.format}
                    onChange={(e) => handleConfigChange('format', e.target.value as AudioFormat)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="audio/webm;codecs=opus">WebM / Opus (High Fidelity, Low Latency)</option>
                    <option value="audio/ogg;codecs=opus">Ogg Vorbis / Opus (Icecast Standard)</option>
                    <option value="audio/mpeg">Audio / MP3 (Legacy Shoutcast Standard)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">
                    Target Bitrate (kbps)
                  </label>
                  <select
                    value={config.bitrate}
                    onChange={(e) => handleConfigChange('bitrate', parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value={128}>128 kbps (Standard Mobile Broadcast)</option>
                    <option value={192}>192 kbps (High Quality Radio)</option>
                    <option value={256}>256 kbps (Pro Studio Audio)</option>
                    <option value={320}>320 kbps (Uncompressed Studio Master)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Station Name</label>
                  <input
                    type="text"
                    value={config.stationName}
                    onChange={(e) => handleConfigChange('stationName', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-1">
                    WebSocket Proxy Gateway URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={config.webSocketProxyUrl || ''}
                    onChange={(e) => handleConfigChange('webSocketProxyUrl', e.target.value)}
                    placeholder="e.g. wss://stream.myradio.com/ws-icecast-bridge"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Optional WebSocket proxy tunnel URL if connecting to remote Icecast / Shoutcast directly through browser WebSocket bridges.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STREAM PREVIEW & LISTENER LINKS */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 block">
                  Public Direct Listener Stream URL
                </span>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={status.mountUrl}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-blue-400 font-mono font-bold"
                  />
                  <button
                    onClick={() => copyToClipboard(status.mountUrl)}
                    className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? 'COPIED!' : 'COPY LINK'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={downloadPlsPlaylist}
                    className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-mono font-bold transition flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-amber-400" /> Download .PLS Playlist (VLC / Winamp)
                  </button>
                </div>
              </div>

              {/* HTML5 Web Player Preview */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 block">
                  Live Stream Monitor Player
                </span>
                <p className="text-xs text-slate-400">
                  Test listening to your broadcast output directly using Web Audio master stream:
                </p>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPreviewPlaying(!previewPlaying)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg transition active:scale-95 ${
                        previewPlaying ? 'bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
                      }`}
                    >
                      {previewPlaying ? <Square className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                    </button>
                    <div>
                      <h4 className="text-sm font-bold text-white">{config.stationName}</h4>
                      <p className="text-xs text-slate-400 font-mono">
                        {status.isBroadcasting ? '● STREAM IS LIVE' : '○ STREAM IS OFFLINE'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <Volume2 className="w-4 h-4 text-slate-500" /> 100% MONITOR
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono">
            <Server className="w-4 h-4 text-blue-400" />
            <span>Station: <strong>{config.stationName}</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
