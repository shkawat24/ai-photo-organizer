/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Monitor, Grid, Wifi, Volume2, Battery, Calendar } from 'lucide-react';

interface WindowsBackgroundProps {
  children: React.ReactNode;
}

export function WindowsBackground({ children }: WindowsBackgroundProps) {
  const [time, setTime] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-slate-900 select-none font-sans text-white">
      {/* Fluent Bloom Ambient Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-900/60 via-slate-900 to-emerald-950/20" />
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Grid Pattern overlay for tech aesthetic */}
      <div className="absolute inset-x-0 top-0 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      {/* Main workspace container where the main window lives */}
      <div className="relative z-10 w-full h-[calc(100vh-48px)] flex items-center justify-center p-2 sm:p-4">
        {children}
      </div>

      {/* Win 11 Styled Taskbar */}
      <div className="absolute bottom-0 left-0 w-full h-12 bg-slate-950/75 backdrop-blur-xl border-t border-slate-800/50 flex justify-between items-center px-4 z-40 select-none">
        
        {/* Start Button & Left side */}
        <div className="flex items-center gap-3">
          <button className="h-8 w-8 rounded-md hover:bg-slate-800/60 flex items-center justify-center transition-all cursor-pointer">
            <Grid className="w-5 h-5 text-sky-400" />
          </button>
          
          <div className="hidden sm:flex text-xs text-slate-400 font-medium tracking-tight h-8 items-center border-l border-slate-800 pl-3">
            <Monitor className="w-3.5 h-3.5 mr-1 text-slate-500" />
            <span>Windows AI Environment</span>
          </div>
        </div>

        {/* Taskbar Shortcuts (Centered icons like Word / File Explorer / App logo) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1.5 bg-slate-900/40 px-3 py-1 rounded-full border border-slate-800/30">
          <div className="h-8 w-8 rounded bg-sky-500/20 border border-sky-500/40 flex items-center justify-center shadow-lg shadow-sky-500/10">
            <div className="w-3.5 h-3.5 rounded-full border border-sky-400 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-300 animate-pulse" />
            </div>
          </div>
          <div className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-md shadow-sky-400 self-end mb-[-4px]" />
        </div>

        {/* Systray / Status bar - Right side */}
        <div className="flex items-center gap-3">
          {/* Quick Settings icons */}
          <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-800/40 transition-colors text-slate-300">
            <Wifi className="w-4 h-4" />
            <Volume2 className="w-4 h-4" />
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>

          {/* Clock & Date */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800/80 text-right text-xs pr-1 font-mono tracking-tighter hover:bg-slate-800/40 py-1 px-2 rounded transition-colors cursor-default">
            <div>
              <div className="text-slate-100 font-medium">{time}</div>
              <div className="text-[10px] text-slate-400 font-sans">{dateStr}</div>
            </div>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
