/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Users, Edit2, Check, Tag, ShieldCheck, HelpCircle } from 'lucide-react';
import { Photo, FaceProfile } from '../types';

interface FaceRegistryPanelProps {
  profiles: FaceProfile[];
  photos: Photo[];
  onRenameProfile: (id: string, newName: string) => void;
}

export function FaceRegistryPanel({
  profiles,
  photos,
  onRenameProfile,
}: FaceRegistryPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  const startEditing = (profile: FaceProfile) => {
    setEditingId(profile.id);
    setTempName(profile.name);
  };

  const saveName = (id: string) => {
    if (tempName.trim()) {
      onRenameProfile(id, tempName.trim());
    }
    setEditingId(null);
  };

  // Find a photo that represents this profile
  const getRepresentativePhoto = (profileId: string): string => {
    // Look if any face matches the profile
    const mappingPhoto = photos.find(p => p.faces.some(f => f.profileId === profileId));
    return mappingPhoto ? mappingPhoto.srcUrl : '';
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl text-left">
      {/* Panel Header */}
      <div className="border-b border-slate-800 p-5 bg-slate-950/65 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h2 className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
            <Users className="w-4 h-4 text-blue-400" />
            Biometric Face Registry
          </h2>
          <p className="text-xs text-slate-500 mt-1">Manage identified human facial profiles and customize their folder names inside your OS structure.</p>
        </div>
        <div className="text-[10px] uppercase tracking-wider px-3 py-1.5 bg-blue-950/40 border border-blue-500/20 text-blue-400 rounded-full font-bold">
          {profiles.length} Verified Identities
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 overflow-y-auto p-5">
        {profiles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 border border-dashed border-slate-800 rounded-2xl py-16">
            <User className="w-12 h-12 mb-3 text-slate-700" />
            <h3 className="text-sm text-slate-400 font-bold uppercase tracking-wider">No faces cataloged yet</h3>
            <p className="text-xs text-slate-500 mt-1.5 max-w-xs text-center leading-relaxed">
              Once you start scanning pictures, Gemini will catalog faces, cluster them by facial attributes, and present their bios here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {profiles.map((profile) => {
              const repPhoto = getRepresentativePhoto(profile.id);
              const totalMapped = photos.filter(p => p.faces.some(f => f.profileId === profile.id)).length;

              return (
                <div 
                  key={profile.id}
                  className="bg-slate-950/45 border border-slate-800 hover:border-slate-700/80 transition-all rounded-2xl p-4.5 flex flex-col gap-4 relative group shadow-sm"
                >
                  {/* Card Header with representative image */}
                  <div className="flex gap-4 items-start">
                    <div className="h-16 w-16 rounded-xl bg-blue-950/10 border border-slate-800 flex-shrink-0 overflow-hidden flex items-center justify-center relative">
                      {repPhoto ? (
                        <img 
                          src={repPhoto} 
                          alt="Face Thumbnail" 
                          className="h-full w-full object-cover scale-110 object-top"
                          onError={(e) => {
                            // fallback if source fails
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <User className="w-8 h-8 text-blue-400/40" />
                      )}
                      
                      {/* Count circle overlay */}
                      <span className="absolute bottom-1 right-1 px-1.5 rounded-md bg-slate-950/85 border border-slate-800 text-[10px] font-bold text-slate-300">
                        x{totalMapped}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name editing trigger or standard */}
                      {editingId === profile.id ? (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveName(profile.id)}
                            className="bg-slate-900 border border-blue-500 text-xs px-2 py-1 rounded-lg text-white font-semibold w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={() => saveName(profile.id)}
                            className="p-1 text-emerald-400 bg-emerald-950/30 hover:bg-emerald-950/60 rounded-lg border border-emerald-500/20 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 group/name">
                          <h3 className="text-sm font-bold text-slate-100 truncate">
                            {profile.name}
                          </h3>
                          <button
                            onClick={() => startEditing(profile)}
                            className="p-1 opacity-0 group-hover/name:opacity-100 hover:text-blue-400 text-slate-500 transition-opacity cursor-pointer rounded-md hover:bg-slate-850"
                            title="Rename folder category"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Unique Profile Hash */}
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-1">
                        <Tag className="w-2.5 h-2.5 text-slate-600" />
                        <span>CLUSTER: {profile.id}</span>
                      </div>

                      {/* Bio attributes summary */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-900 text-slate-400 rounded-md font-semibold border border-slate-800">
                          {profile.gender}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-900 text-slate-400 rounded-md font-semibold border border-slate-800">
                          {profile.ageGroup}
                        </span>
                        {profile.accessories && profile.accessories !== 'None' && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-blue-950/40 border border-blue-500/20 text-blue-400 rounded-md font-bold">
                            {profile.accessories}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gemini Biometric Analysis description breakdown */}
                  <div className="text-[11px] text-slate-400 italic bg-slate-950/35 border border-slate-900/60 p-3 rounded-xl leading-relaxed relative overflow-hidden">
                    {/* Tiny secure biometric background badge */}
                    <div className="absolute right-1 bottom-1 opacity-10 flex items-center font-mono text-[8px] text-blue-400 uppercase tracking-tighter">
                      <ShieldCheck className="w-3 h-3 justify-end" /> Verified
                    </div>
                    <span>"{profile.description}"</span>
                  </div>

                  {/* Attribute Matrix Drawer */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-slate-800/60 pt-2.5 text-slate-500">
                    <div className="flex justify-between px-1">
                      <span>Hair Color</span>
                      <span className="text-slate-300 font-semibold">{profile.hairColor}</span>
                    </div>
                    <div className="flex justify-between px-1">
                      <span>Expression</span>
                      <span className="text-slate-300 font-semibold">{profile.expression}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
