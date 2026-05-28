/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { Terminal, Shield, RefreshCw, Trash2, Check, CloudOff } from 'lucide-react';
import { ScanLog } from '../types';

interface SystemLogsPanelProps {
  logs: ScanLog[];
  onClearLogs: () => void;
}

export function SystemLogsPanel({ logs, onClearLogs }: SystemLogsPanelProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden font-mono shadow-2xl relative select-text">
      
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800 text-left">
        <div className="flex items-center gap-2.5 text-xs text-slate-300 font-bold">
          <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Biometric System Terminal — powershell.exe</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Action indicator */}
          <span className="text-[10px] text-blue-400 font-bold bg-blue-950/40 border border-blue-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" />
            ENGINE_ONLINE
          </span>
          <button
            onClick={onClearLogs}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
            title="Clear Console Output"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal lines stream list */}
      <div className="flex-1 overflow-y-auto p-5 space-y-2.5 text-left text-xs leading-relaxed max-h-[400px]">
        
        {/* Boot sector introduction */}
        <div className="text-slate-500 border-b border-slate-900 pb-3 mb-4">
          <div>Microsoft Windows AI Platform [Version 10.0.22631]</div>
          <div>(c) Microsoft Corporation. All rights reserved.</div>
          <div className="mt-2 text-blue-400">Loading Biometric Face Catalog Modules... (gemini-3.5-flash)</div>
          <div className="text-emerald-400 font-bold mt-1">Status: Cluster Registry Initialized successfully.</div>
        </div>

        {logs.length === 0 ? (
          <div className="text-slate-600 text-center py-12 italic">
            Console prompt ready. No transaction pipelines executed.
          </div>
        ) : (
          logs.map((log) => {
            let color = 'text-slate-300';
            let prefix = '>>';

            switch (log.type) {
              case 'success':
                color = 'text-emerald-400';
                prefix = '[SUCCESS]';
                break;
              case 'warn':
                color = 'text-amber-400';
                prefix = '[WARNING]';
                break;
              case 'error':
                color = 'text-rose-400 font-semibold';
                prefix = '[FAIL]';
                break;
              case 'info':
                color = 'text-sky-400';
                prefix = '[INFO]';
                break;
              case 'system':
                color = 'text-indigo-400';
                prefix = '[SYS_REG]';
                break;
            }

            return (
              <div key={log.id} className="flex gap-2.5 items-start">
                <span className="text-slate-600 select-none flex-shrink-0">
                  [{log.timestamp}]
                </span>
                <span className={`${color} flex-shrink-0 select-none`}>
                  {prefix}
                </span>
                <span className={`text-slate-100 font-medium whitespace-pre-wrap flex-1`}>
                  {log.message}
                </span>
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Interactive Terminal Line input prompt placeholder */}
      <div className="p-3 bg-slate-950 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5 font-mono">
          <Shield className="w-3.5 h-3.5 text-indigo-500" />
          <span>Secure biometric hashing active. API transactions proxied server-side.</span>
        </div>
        <div className="flex items-center gap-1">
          <RefreshCw className="w-3 h-3 text-slate-600 animate-[spin_4s_infinite]" />
          <span>Vite Hot Module Layered</span>
        </div>
      </div>

    </div>
  );
}
