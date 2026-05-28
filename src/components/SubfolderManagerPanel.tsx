/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Folder, HardDrive, Download, FileImage, Layers, ArrowRight, CornerDownRight, CheckCircle2 } from 'lucide-react';
import { Photo, FaceProfile } from '../types';
import { packageOrganizedZip, sanitizeFolderName } from '../utils/helpers';

interface SubfolderManagerPanelProps {
  photos: Photo[];
  profiles: FaceProfile[];
}

export function SubfolderManagerPanel({ photos, profiles }: SubfolderManagerPanelProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | 'uncategorized' | 'all'>('all');
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Uncategorized count
  const uncategorizedPhotos = photos.filter(p => p.faces.length === 0 && p.status === 'done');
  
  // Photos filtering by selected category
  const getFilteredPhotos = () => {
    if (selectedFolderId === 'all') {
      return photos.filter(p => p.status === 'done');
    }
    if (selectedFolderId === 'uncategorized') {
      return uncategorizedPhotos;
    }
    return photos.filter(p => p.faces.some(f => f.profileId === selectedFolderId));
  };

  const currentFolderPhotos = getFilteredPhotos();

  const handleDownloadZip = async () => {
    if (photos.length === 0 || downloadingZip) return;
    try {
      setDownloadingZip(true);
      setDownloadSuccess(false);
      
      const finishedScans = photos.filter(p => p.status === 'done');
      if (finishedScans.length === 0) {
        alert("There are no successfully analyzed photos to organize yet. Please complete a scan first!");
        setDownloadingZip(false);
        return;
      }

      const zipBlob = await packageOrganizedZip(finishedScans, profiles);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `organized_face_photos_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error("ZIP building failed:", err);
      alert("An error occurred while compiling your organized package.");
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl text-left">
      {/* Panel Header */}
      <div className="border-b border-slate-800 p-5 bg-slate-950/65 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
            <Folder className="w-4 h-4 text-blue-400" />
            File Explorer & Subfolders
          </h2>
          <p className="text-xs text-slate-500 mt-1">Inspect organized image directories or bundle all folders into structured PC output directories.</p>
        </div>

        <div>
          <button
            onClick={handleDownloadZip}
            disabled={photos.filter(p => p.status === 'done').length === 0 || downloadingZip}
            className="px-4 py-2 text-xs font-black bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-xl transition-all shadow-lg shadow-blue-900/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:text-slate-500 disabled:shadow-none"
          >
            {downloadingZip ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Packaging Folder Tree...
              </>
            ) : downloadSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                Bundle Downloaded!
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Download Organized ZIP
              </>
            )}
          </button>
        </div>
      </div>

      {/* Explorer Space Split */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-800">
        
        {/* Left Hand: Folders Sidebar Tree View */}
        <div className="w-full md:w-5/12 xl:w-4/12 bg-slate-950/20 p-4 overflow-y-auto space-y-4">
          
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider px-1">
            <HardDrive className="w-3.5 h-3.5 text-slate-600" /> Virtual Photo Drive (H:\)
          </div>

          <div className="space-y-1">
            {/* General "All Photos" Folder */}
            <button
              onClick={() => setSelectedFolderId('all')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                selectedFolderId === 'all'
                  ? 'bg-slate-800 text-white font-bold border border-slate-700'
                  : 'text-slate-400 hover:bg-slate-950 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-blue-400" />
                <span>All Classified Images</span>
              </div>
              <span className="text-[10px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md font-bold">
                {photos.filter(p => p.status === 'done').length}
              </span>
            </button>

            {/* Tree hierarchy drawing directories */}
            <div className="pl-3 border-l border-slate-800/80 space-y-1.5 pt-1.5">
              
              {/* Uncategorized Category folder */}
              {uncategorizedPhotos.length > 0 && (
                <div className="flex items-center">
                  <CornerDownRight className="w-3.5 h-3.5 text-slate-700 mr-1 flex-shrink-0" />
                  <button
                    onClick={() => setSelectedFolderId('uncategorized')}
                    className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer text-xs ${
                      selectedFolderId === 'uncategorized'
                        ? 'bg-amber-950/45 text-amber-300 font-bold border border-amber-900/30'
                        : 'text-slate-400 hover:bg-slate-950 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Folder className="w-3.5 h-3.5 text-amber-500/60" />
                      <span className="truncate">Uncategorized_Photos</span>
                    </div>
                    <span className="text-[9px] px-1.5 bg-slate-950 rounded text-slate-500 font-mono font-bold">
                      {uncategorizedPhotos.length}
                    </span>
                  </button>
                </div>
              )}

              {/* Each profile represents a directory */}
              {profiles.map((profile) => {
                const count = photos.filter(p => p.faces.some(f => f.profileId === profile.id)).length;
                const folderName = sanitizeFolderName(profile.name);

                return (
                  <div key={profile.id} className="flex items-center">
                    <CornerDownRight className="w-3.5 h-3.5 text-slate-700 mr-1 flex-shrink-0" />
                    <button
                      onClick={() => setSelectedFolderId(profile.id)}
                      className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer text-xs ${
                        selectedFolderId === profile.id
                          ? 'bg-blue-950/35 text-blue-400 font-bold border border-blue-900/30'
                          : 'text-slate-400 hover:bg-slate-950 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Folder className="w-3.5 h-3.5 text-blue-400/80" />
                        <span className="truncate font-semibold" title={folderName}>{folderName}</span>
                      </div>
                      <span className="text-[9px] px-1.5 bg-slate-950 rounded-md text-slate-400 font-mono font-bold border border-slate-900">
                        {count}
                      </span>
                    </button>
                  </div>
                );
              })}

              {profiles.length === 0 && (
                <div className="text-[10px] text-slate-600 pl-4 py-2 italic">
                  Tree is currently empty. Run scanner to seed.
                </div>
              )}

            </div>

          </div>

        </div>

        {/* Right Hand: Photos list in Selected Directory */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/5">
          {/* Breadcrumb path */}
          <div className="p-4 border-b border-slate-850 bg-slate-950/50 select-text flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <HardDrive className="w-3.5 h-3.5 text-slate-650" />
            <span>H:\</span>
            <ArrowRight className="w-3 h-3 text-slate-700" />
            <span className="text-blue-400 font-bold">
              {selectedFolderId === 'all' 
                ? 'All_Classified_Images' 
                : selectedFolderId === 'uncategorized'
                ? 'Uncategorized_Photos'
                : sanitizeFolderName(profiles.find(p => p.id === selectedFolderId)?.name || 'Unknown')}
            </span>
          </div>

          <div className="flex-1 p-5 overflow-y-auto">
            {currentFolderPhotos.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-605 border border-dashed border-slate-800 rounded-2xl py-12">
                <Layers className="w-8 h-8 mb-2 text-slate-700" />
                <span className="text-xs font-semibold text-slate-500">This physical directory folder is empty</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentFolderPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col p-2 transition-all hover:border-slate-705"
                  >
                    {/* Square Image preview */}
                    <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center relative">
                      <img
                        src={photo.srcUrl}
                        alt={photo.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Bounding Box Highlights overlay */}
                      {selectedFolderId !== 'all' && selectedFolderId !== 'uncategorized' && photo.faces.map((f, i) => {
                        if (f.profileId === selectedFolderId && f.boundingBox) {
                          const [ymin, xmin, ymax, xmax] = f.boundingBox;
                          return (
                            <div
                              key={i}
                              className="absolute border-2 border-dashed border-blue-400 bg-blue-500/10 rounded shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                              style={{
                                top: `${ymin / 10}%`,
                                left: `${xmin / 10}%`,
                                height: `${(ymax - ymin) / 10}%`,
                                width: `${(xmax - xmin) / 10}%`
                              }}
                            />
                          );
                        }
                        return null;
                      })}
                    </div>

                    {/* Metadata bottom row */}
                    <div className="mt-2.5 px-1.5 pb-0.5">
                      <div className="text-[11px] text-slate-300 font-bold truncate" title={photo.name}>
                        {photo.name}
                      </div>
                      <div className="text-[9px] text-slate-550 font-mono mt-1 flex items-center justify-between uppercase">
                        <span>{(photo.size / 1024).toFixed(1)} KB</span>
                        <span className="bg-slate-950/60 px-1 py-0.5 rounded border border-slate-850">{photo.name.split('.').pop()?.toUpperCase() || 'IMG'}</span>
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
