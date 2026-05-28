/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Monitor, Cpu, Users, Folder, Terminal, Download, FileImage, 
  Trash2, Play, Info, AlertTriangle, ShieldAlert 
} from 'lucide-react';
import { WindowsBackground } from './components/WindowsBackground';
import { ScanProgressPanel } from './components/ScanProgressPanel';
import { FaceRegistryPanel } from './components/FaceRegistryPanel';
import { SubfolderManagerPanel } from './components/SubfolderManagerPanel';
import { SystemLogsPanel } from './components/SystemLogsPanel';
import { Photo, FaceProfile, ScanLog } from './types';
import { resizeImageForGemini, resizeDemoImageForGemini } from './utils/helpers';
import { DEMO_PHOTOS } from './data/demoPhotos';

export default function App() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [profiles, setProfiles] = useState<FaceProfile[]>([]);
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'scan' | 'profiles' | 'folders' | 'logs'>('scan');

  const addLog = (message: string, type: ScanLog['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    const newLog: ScanLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      message,
      type,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  const handleSelectFiles = (filesList: FileList) => {
    const newPhotos: Photo[] = [];
    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      if (file.type.startsWith('image/')) {
        newPhotos.push({
          id: `file_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          path: file.webkitRelativePath || `C:\\Users\\Desktop\\Pictures\\${file.name}`,
          size: file.size,
          type: file.type,
          srcUrl: URL.createObjectURL(file),
          file: file,
          isDemo: false,
          faces: [],
          status: 'pending',
        });
      }
    }
    setPhotos((prev) => [...prev, ...newPhotos]);
    addLog(`Enqueued ${newPhotos.length} physical file(s) into scanner buffer. Ready for clustering analysis.`, 'info');
  };

  const handleSelectDirectory = (filesList: FileList) => {
    const newPhotos: Photo[] = [];
    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      if (file.type.startsWith('image/')) {
        // Capture Webkit relative path if loaded as directory
        const relativePath = file.webkitRelativePath 
          ? `C:\\Users\\Desktop\\Pictures\\${file.webkitRelativePath.replace(/\//g, '\\')}`
          : `C:\\Users\\Desktop\\Pictures\\${file.name}`;

        newPhotos.push({
          id: `file_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          path: relativePath,
          size: file.size,
          type: file.type,
          srcUrl: URL.createObjectURL(file),
          file: file,
          isDemo: false,
          faces: [],
          status: 'pending',
        });
      }
    }
    setPhotos((prev) => [...prev, ...newPhotos]);
    addLog(`Enqueued folder structure: cataloged ${newPhotos.length} images from relative paths.`, 'info');
  };

  const handleLoadDemo = () => {
    const newPhotos: Photo[] = DEMO_PHOTOS.map((dp, idx) => ({
      id: `demo_${idx}_${Math.random().toString(36).substr(2, 5)}`,
      name: dp.name,
      path: dp.path,
      size: dp.size,
      type: 'image/jpeg',
      srcUrl: dp.url,
      isDemo: true,
      faces: [],
      status: 'pending',
    }));

    setPhotos(newPhotos);
    setProfiles([]); // clear old registry records
    setLogs([]); // clear logs for standard demo pipeline
    setActiveTab('scan');
    addLog(`Demo Dataset loaded: seeded ${newPhotos.length} high-fidelity face portrait combinations relative to Uncle Marcus, Sarah, and Linda.`, 'system');
    addLog(`Ready. Click 'Analyze Faces' to run biometric facial clustering!`, 'info');
  };

  const handleClear = () => {
    // Revoke local URLs to avoid memory leaks
    photos.forEach((p) => {
      if (!p.isDemo && p.srcUrl.startsWith('blob:')) {
        URL.revokeObjectURL(p.srcUrl);
      }
    });
    setPhotos([]);
    setProfiles([]);
    setLogs([]);
    addLog(`System states completely flushed. Memory caches wiped clean.`, 'warn');
  };

  const handleStartScan = async () => {
    if (scanning || photos.length === 0) return;
    setScanning(true);
    addLog(`Batch visual face grouping starting...`, 'system');

    // Create shallow copies of state
    let currentPhotos = [...photos];
    let currentProfiles = [...profiles];

    for (let i = 0; i < currentPhotos.length; i++) {
      const photo = currentPhotos[i];
      if (photo.status !== 'pending') continue;

      photo.status = 'scanning';
      setPhotos([...currentPhotos]);
      addLog(`Analyzing facial grids in: ${photo.name}...`, 'info');

      try {
        // Fetch compressed base64 payload
        let payload: { base64Data: string; mimeType: string };
        if (photo.isDemo) {
          payload = await resizeDemoImageForGemini(photo.srcUrl);
        } else if (photo.file) {
          payload = await resizeImageForGemini(photo.file);
        } else {
          throw new Error('Image reference has been tainted or dereferenced.');
        }

        // Post to the backend Express proxy
        const response = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Data: payload.base64Data,
            mimeType: payload.mimeType,
            knownProfiles: currentProfiles,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `HTTP Error ${response.status}`);
        }

        const data = await response.json();
        const detectedFaces = data.faces || [];

        photo.faces = [];

        for (const face of detectedFaces) {
          let profileId = face.matchedProfileId;

          if (face.suggestNewProfile || !profileId) {
            // Suggest new face profile
            const profileNum = currentProfiles.length + 1;
            const ageGroup = face.guesstimatedAttributes?.ageGroup || 'Adult';
            const gender = face.guesstimatedAttributes?.gender || 'Person';
            const defaultName = `Person ${profileNum} (${ageGroup} ${gender})`;

            const newProf: FaceProfile = {
              id: `p_${Math.random().toString(36).substr(2, 9)}`,
              name: defaultName,
              description: face.newProfileDescription || `Identified attributes for Person ${profileNum}`,
              gender: face.guesstimatedAttributes?.gender || 'Unsure',
              ageGroup: face.guesstimatedAttributes?.ageGroup || 'Adult',
              hairColor: face.guesstimatedAttributes?.hairColor || 'Other',
              expression: face.guesstimatedAttributes?.expression || 'Neutral',
              accessories: face.guesstimatedAttributes?.accessories || 'None',
            };

            currentProfiles.push(newProf);
            profileId = newProf.id;
            addLog(`Gained biometric cluster: created '${newProf.name}'. Bio details: "${newProf.description.substring(0, 60)}..."`, 'system');
          } else {
            const matchedProf = currentProfiles.find(p => p.id === profileId);
            if (matchedProf) {
              addLog(`Biometric mapping confirmed: '${photo.name}' matches profile '${matchedProf.name}' (Confidence: ${face.confidence}%).`, 'success');
            }
          }

          photo.faces.push({
            profileId: profileId,
            confidence: face.confidence,
            boundingBox: face.boundingBox,
          });
        }

        if (detectedFaces.length === 0) {
          addLog(`Processed ${photo.name} — Frame clean. No biometric faces mapped.`, 'warn');
        } else {
          addLog(`Processed ${photo.name} — Visual analysis complete. Classified ${detectedFaces.length} profiles.`, 'success');
        }

        photo.status = 'done';
        setProfiles([...currentProfiles]);

      } catch (err: any) {
        console.error(`Scanner error on photo ${photo.name}:`, err);
        photo.status = 'error';
        photo.errorMessage = err.message || 'System error';
        addLog(`Biometric failure on image ${photo.name}: ${err.message}`, 'error');
      }

      setPhotos([...currentPhotos]);
    }

    setScanning(false);
    addLog(`Unified folder organization pipeline successfully concluded. Directory registries synced.`, 'success');
  };

  const handleRenameProfile = (id: string, newName: string) => {
    setProfiles((prev) =>
      prev.map((prof) => (prof.id === id ? { ...prof, name: newName } : prof))
    );
    addLog(`Profile category folder mapped update: '${id}' renamed to '${newName}'`, 'info');
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <WindowsBackground>
      {/* Floating OS application Window Fluent Design */}
      <div className="w-full max-w-6xl h-[85vh] sm:h-[80vh] min-h-[500px] bg-slate-950 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl shadow-blue-950/20 backdrop-blur-xl animate-fade-in text-white">
        
        {/* Mock OS Window Title Bar -> Bento Redesign */}
        <div className="h-11 border-b border-slate-800 px-4 bg-slate-900 flex justify-between items-center select-none shrink-0 text-slate-400">
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 bg-blue-600 rounded-sm shadow-sm shadow-blue-500/20" />
            <span className="text-xs font-semibold tracking-wide text-slate-200">FaceOrganizer Pro - PC Image Scanner</span>
          </div>

          {/* Elegant minimalist titlebar controls from Bento Design */}
          <div className="flex gap-4 items-center">
            <div className="w-3.5 h-[1.5px] bg-slate-500 hover:bg-slate-300 transition-colors cursor-pointer" />
            <div className="w-3 h-3 border border-slate-500 hover:border-slate-300 transition-colors cursor-pointer" />
            <div className="w-3 h-3 text-slate-500 hover:text-rose-400 text-xs font-semibold flex items-center justify-center cursor-pointer transition-colors leading-none">✕</div>
          </div>
        </div>

        {/* Informative Browser sandbox banner -> Accentuate with modern Electric Blue style */}
        <div className="bg-blue-950/30 border-b border-blue-900/30 py-2.5 px-4.5 flex items-start gap-2.5 text-xs text-blue-200/90 leading-relaxed shrink-0">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold text-blue-400">Local Sandbox Directory Area: </span>
            To catalog digital photos securely from your Windows storage drive, load files or directories. The computer-vision pipeline maps faces cloud-side via Gemini, clusters identified people into beautiful custom profiles, and packs organized physical layouts into subfolders as a structured ZIP hierarchy.
          </div>
        </div>

        {/* Main Application Body Split (Sidebar Tabs + Panel Content View) */}
        <div className="flex-1 flex overflow-hidden flex-col sm:flex-row">
          
          {/* Bento Styled Sidebar Toolbar */}
          <div className="w-full sm:w-56 bg-slate-900 border-b sm:border-b-0 sm:border-r border-slate-800 p-4 flex flex-nowrap sm:flex-col overflow-x-auto sm:overflow-x-visible justify-center sm:justify-start gap-4 shrink-0">
            
            <div className="hidden sm:block">
              <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 px-1">Library</h3>
              <nav className="flex flex-col gap-1.5">
                <button
                  onClick={() => setActiveTab('scan')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer shrink-0 transition-all ${
                    activeTab === 'scan'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                  <span>Biometric Scanner</span>
                </button>

                <button
                  onClick={() => setActiveTab('profiles')}
                  disabled={profiles.length === 0}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer shrink-0 transition-all ${
                    activeTab === 'profiles'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Face Registry ({profiles.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('folders')}
                  disabled={photos.filter(p => p.status === 'done').length === 0}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer shrink-0 transition-all ${
                    activeTab === 'folders'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  <span>File Explorer ({profiles.length + (photos.some(p => p.faces.length === 0 && p.status === 'done') ? 1 : 0)})</span>
                </button>
              </nav>
            </div>

            {/* Mobile Layout Fallback tabs */}
            <div className="flex sm:hidden gap-1 w-full justify-around">
              <button
                onClick={() => setActiveTab('scan')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold ${
                  activeTab === 'scan' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" /> Scan
              </button>
              <button
                onClick={() => setActiveTab('profiles')}
                disabled={profiles.length === 0}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold ${
                  activeTab === 'profiles' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Registry ({profiles.length})
              </button>
              <button
                onClick={() => setActiveTab('folders')}
                disabled={photos.filter(p => p.status === 'done').length === 0}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold ${
                  activeTab === 'folders' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                <Folder className="w-3.5 h-3.5" /> Files
              </button>
            </div>

            {/* Diagnostics Navigation section */}
            <div className="hidden sm:block mt-2">
              <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 px-1">Diagnostics</h3>
              <button
                onClick={() => setActiveTab('logs')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer shrink-0 transition-colors ${
                  activeTab === 'logs'
                    ? 'bg-slate-800 text-blue-400 border border-slate-700/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>Console Terminal</span>
              </button>
            </div>

            {/* Sources section tray in sidebar for high aesthetic fidelity */}
            <div className="hidden sm:flex flex-col gap-3 mt-auto p-3.5 bg-slate-950/45 border border-slate-800 rounded-2xl text-[11px] font-medium">
              <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Sources</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-300">Local Disk (C:)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-slate-300 font-semibold text-blue-400">Gemini Neural (v3.5)</span>
                </div>
              </div>
            </div>

          </div>

          {/* Active Worksite viewport with clean Bento Grid spacing padding */}
          <div className="flex-1 p-5 overflow-hidden">
            {activeTab === 'scan' && (
              <ScanProgressPanel
                photos={photos}
                profiles={profiles}
                logs={logs}
                scanning={scanning}
                onSelectFiles={handleSelectFiles}
                onSelectDirectory={handleSelectDirectory}
                onLoadDemo={handleLoadDemo}
                onStartScan={handleStartScan}
                onClear={handleClear}
              />
            )}

            {activeTab === 'profiles' && (
              <FaceRegistryPanel
                profiles={profiles}
                photos={photos}
                onRenameProfile={handleRenameProfile}
              />
            )}

            {activeTab === 'folders' && (
              <SubfolderManagerPanel
                photos={photos}
                profiles={profiles}
              />
            )}

            {activeTab === 'logs' && (
              <SystemLogsPanel
                logs={logs}
                onClearLogs={handleClearLogs}
              />
            )}
          </div>

        </div>

        {/* Elegant Bottom Info Bar with Brand Credit */}
        <div className="py-2 px-4 sm:px-6 bg-blue-600 flex flex-col sm:flex-row items-center justify-between shrink-0 text-[10px] text-blue-100 font-semibold select-none border-t border-blue-500 gap-1.5 sm:gap-4">
          <div className="flex gap-4 font-mono">
            <span>ENCRYPTION: AES-256</span>
            <span>DATABASE: SECURE LOCAL-ONLY</span>
          </div>
          
          <div className="text-[10px] font-extrabold text-white tracking-wider flex items-center gap-1.5 bg-blue-700/60 px-3 py-1 rounded-full border border-blue-500/30 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>App developed by <strong className="text-emerald-300 font-extrabold">Shkawat Hossain</strong> (Founder, <strong className="text-white font-extrabold">SSST Tech</strong>)</span>
          </div>

          <div className="flex gap-4 font-mono font-medium">
            <span>V2.4.1 SECURE STABLE</span>
          </div>
        </div>

      </div>
    </WindowsBackground>
  );
}
