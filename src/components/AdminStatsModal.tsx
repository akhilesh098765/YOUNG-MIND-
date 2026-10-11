import React, { useEffect, useState } from 'react';
import { Settings, X, Activity, DollarSign, Database, Server, AlertCircle } from 'lucide-react';
import { AiUsageStats } from '../types';

interface AdminStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminStatsModal: React.FC<AdminStatsModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<{
    aiStats: AiUsageStats;
    errorLogs: any[];
    system: any;
  } | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Settings className="w-4 h-4 text-indigo-600" />
            <span>AI Token Accounting &amp; System Health</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-400 font-medium">Total API Calls</div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {stats?.aiStats.totalRequests || 0}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-400 font-medium">Estimated Tokens</div>
              <div className="text-xl font-bold text-indigo-600 mt-1">
                {stats?.aiStats.totalTokensEstimated.toLocaleString() || 0}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-400 font-medium">Estimated Cost</div>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                ${stats?.aiStats.totalCostUsd.toFixed(4) || '0.0000'}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-400 font-medium">Heap Memory</div>
              <div className="text-xl font-bold text-slate-700 mt-1">
                {stats?.system.memoryMb || 32} MB
              </div>
            </div>
          </div>

          {/* System Specs */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-600" />
              <span>Runtime Specifications</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>Backend Runtime: <span className="font-mono text-slate-800">Node.js {stats?.system.nodeVersion}</span></div>
              <div>Platform: <span className="font-mono text-slate-800">{stats?.system.platform}</span></div>
              <div>Process Uptime: <span className="font-mono text-slate-800">{Math.round(stats?.system.uptimeSeconds || 0)}s</span></div>
              <div>Model: <span className="font-mono text-indigo-600">gemini-3.8-flash</span></div>
            </div>
          </div>

          {/* Failure & Error Logs */}
          <div className="space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Recent Diagnostic Logs (Max 10)</span>
            </div>
            {stats?.errorLogs && stats.errorLogs.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {stats.errorLogs.map((log: any, i: number) => (
                  <div key={i} className="p-2 bg-rose-50 border border-rose-100 rounded text-rose-900 font-mono text-[11px]">
                    <span className="font-bold">[{log.timestamp}]</span> {log.context}: {log.error}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg text-slate-400 text-[11px] italic">
                No system or API errors recorded. All operations running nominal.
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
