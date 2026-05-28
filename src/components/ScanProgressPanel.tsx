/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Upload, FolderOpen, Play, CheckCircle, Flame, FileCode, Users, Layers, Cpu } from 'lucide-react';
import { Photo, FaceProfile, ScanLog } from '../types';

interface ScanProgressPanelProps {
  photos: Photo[];
  profiles: FaceProfile[];
  logs: ScanLog[];
  scanning: boolean;
  onSelectFiles: (files: FileList) => void;
  onSelectDirectory: (files: FileList) => void;
  onLoadDemo: () => void;
  onStartScan: () => void;
  onClear: () => void;
}

export function ScanProgressPanel({
  photos,
  profiles,
  logs,
  scanning,
  onSelectFiles,
  onSelectDirectory,
  onLoadDemo,
  onStartScan,
  onClear,
}: ScanProgressPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dirInputRef = useRef<HTMLInputElement>(null);

  const pendingPhotos = photos.filter((p) => p.status === 'pending');
  const finishedPhotos = photos.filter((p) => p.status === 'done');
  const errorPhotos = photos.filter((p) => p.status === 'error');
  const activePhoto = photos.find((p) => p.status === 'scanning');

  const progressPercent = photos.length > 0 
    ? Math.round((finishedPhotos.length / photos.length) * 100) 
    : 0;

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
      
      {/* Action Header -> Styled in Bento Pro theme */}
      <div className="border-b border-slate-800 p-5 bg-slate-950/65 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
            <Cpu className="w-4 h-4 text-blue-400 animate-pulse" />
            Scanner Commands
          </h2>
          <p className="text-xs text-slate-500 mt-1">Catalog local images, scan media drives, or load the biometric Demo dataset.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Input references */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && onSelectFiles(e.target.files)}
          />
          <input
            type="file"
            ref={dirInputRef}
            className="hidden"
            {...{
              webkitdirectory: "true",
              directory: "true",
              multiple: true
            } as any}
            onChange={(e) => e.target.files && onSelectDirectory(e.target.files)}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning}
            className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            Browse Files
          </button>

          <button
            onClick={() => dirInputRef.current?.click()}
            disabled={scanning}
            className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Mount Folder
          </button>

          <button
            onClick={onLoadDemo}
            disabled={scanning}
            className="px-4 py-2 text-xs font-bold bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            Load Demo Dataset
          </button>

          {photos.length > 0 && (
            <>
              <button
                onClick={onStartScan}
                disabled={scanning || pendingPhotos.length === 0}
                className="px-4 py-2 text-xs font-black bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Analyze Faces
              </button>
              
              <button
                onClick={onClear}
                disabled={scanning}
                className="px-4 py-2 text-xs font-bold bg-slate-850 hover:bg-slate-800 border border-slate-800 text-rose-400 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                Flush State
              </button>
            </>
          )}
        </div>
      </div>

      {/* Metrics Bar -> Styled as high-integrity Bento blocks */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-slate-800 text-xs p-5 bg-slate-950/30 gap-4">
          <div className="bg-slate-900/65 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider">
              <FileCode className="w-3.5 h-3.5 text-slate-400" /> Pending Queue
            </span>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-100">{photos.length}</span>
              <span className="text-[10px] text-slate-500 font-medium">loaded</span>
            </div>
          </div>

          <div className="bg-slate-900/65 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider">
              <Upload className="w-3.5 h-3.5 text-blue-400" /> Remainder
            </span>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-blue-400">{pendingPhotos.length}</span>
              <span className="text-[10px] text-slate-500 font-medium">unscanned</span>
            </div>
          </div>

          <div className="bg-slate-900/65 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Mapped Files
            </span>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-emerald-400">{finishedPhotos.length}</span>
              <span className="text-[10px] text-slate-500 font-semibold">/ {photos.length}</span>
            </div>
          </div>

          <div className="bg-slate-900/65 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider">
              <Users className="w-3.5 h-3.5 text-indigo-400" /> Face Clusters
            </span>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-indigo-300">{profiles.length}</span>
              <span className="text-[10px] text-slate-500 font-medium">identities</span>
            </div>
          </div>
        </div>
      )}

      {/* Progress Line -> Styled with gorgeous glowing neon laser line */}
      {scanning && (
        <div className="w-full h-1.5 bg-slate-950 relative overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-300 shadow-[0_0_10px_#2563eb]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Workspace Area split into main queue and active analysis detail */}
      <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-800/60 overflow-hidden">
        
        {/* Active Analysis Detail Panel */}
        <div className="w-full md:w-5/12 bg-slate-950/25 p-5 flex flex-col justify-center items-center overflow-y-auto">
          {activePhoto ? (
            <div className="flex flex-col items-center w-full max-w-xs text-center animate-pulse">
              <div className="text-blue-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 mb-3.5">
                <Flame className="w-4 h-4 text-orange-500 animate-[bounce_1.5s_infinite]" /> Biometric Scanner Active
              </div>
              
              {/* Photo Frame with bounding boxes mock */}
              <div className="relative rounded-2xl border-2 border-blue-500 bg-slate-950 overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.25)] group">
                <img
                  src={activePhoto.srcUrl}
                  alt={activePhoto.name}
                  className="max-h-64 object-contain mx-auto"
                />
                
                {/* Scanner Laser effect */}
                <div className="absolute inset-x-0 w-full h-1 bg-blue-400 opacity-90 top-0 animate-[bounce_2s_infinite] shadow-[0_0_15px_#2563eb]" />
              </div>

              <div className="mt-4 text-slate-100 text-xs font-semibold truncate w-full">
                {activePhoto.name}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-wider">
                {(activePhoto.size / 1024).toFixed(1)} KB — {activePhoto.type.split('/')[1] || 'Media'}
              </div>
            </div>
          ) : finishedPhotos.length > 0 && !scanning ? (
            <div className="text-center p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <CheckCircle className="w-14 h-14 mx-auto text-emerald-400 mb-3 drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]" />
              <h3 className="text-sm font-extrabold text-slate-100">Scanning Complete!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                Biometric scanner finished clustering your photos. Visit the **Face Registry** or **File Explorer** views to inspect or download organized ZIPs.
              </p>
            </div>
          ) : (
            <div className="text-center p-6 text-slate-500">
              <Upload className="w-12 h-12 mx-auto text-slate-800 mb-3" />
              <p className="text-xs max-w-xs leading-relaxed text-slate-400">
                Select some files, upload a directory folder, or click <span className="text-indigo-400 font-bold">Load Demo Dataset</span> to feed the scanner.
              </p>
            </div>
          )}
        </div>

        {/* Directory/Files Queue Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-2 border-b border-slate-800/40 bg-slate-950/20 flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Loaded Photos Grid / State Queue</span>
            <span>Count: {photos.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {photos.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 py-12 border border-dashed border-slate-800/50 rounded-lg">
                <Layers className="w-8 h-8 mb-2" />
                <span className="text-xs">No media files currently queued</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {photos.map((photo) => (
                  <div 
                    key={photo.id} 
                    className={`relative rounded-xl border aspect-square flex flex-col p-1 transition-all ${
                      photo.status === 'scanning'
                        ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500/30'
                        : photo.status === 'done'
                        ? 'border-emerald-500/40 bg-emerald-950/5'
                        : photo.status === 'error'
                        ? 'border-red-500/40 bg-red-950/10'
                        : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative flex-1 bg-slate-950/40 rounded overflow-hidden flex items-center justify-center">
                      <img
                        referrerPolicy="no-referrer"
                        src={photo.srcUrl}
                        alt={photo.name}
                        className="h-full w-full object-cover"
                      />

                      {/* Status indicator badge */}
                      <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider backdrop-blur-md">
                        {photo.status === 'scanning' && (
                          <span className="text-sky-400 bg-sky-950/70 animate-pulse">Scanning</span>
                        )}
                        {photo.status === 'done' && (
                          <span className="text-emerald-400 bg-emerald-950/70">OK</span>
                        )}
                        {photo.status === 'error' && (
                          <span className="text-red-400 bg-red-950/70">Error</span>
                        )}
                        {photo.status === 'pending' && (
                          <span className="text-slate-400 bg-slate-900/70">Queue</span>
                        )}
                      </div>

                      {/* Face recognition count pill */}
                      {photo.status === 'done' && photo.faces.length > 0 && (
                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-full bg-indigo-900/80 border border-indigo-400/30 text-indigo-300 text-[8px] font-bold flex items-center gap-0.5 shadow-sm">
                          <Users className="w-2.5 h-2.5" />
                          <span>{photo.faces.length} {photo.faces.length === 1 ? 'Face' : 'Faces'}</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata summary */}
                    <div className="mt-1 px-1 text-left">
                      <div className="text-[10px] font-medium text-slate-300 truncate" title={photo.name}>
                        {photo.name}
                      </div>
                      <div className="text-[8px] text-slate-500 font-mono truncate">
                        {photo.path.substring(0, 20)}...
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
