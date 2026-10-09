import React, { useState } from 'react';
import { useLogisticsStore } from '../store/logisticsStore';
import { 
  History, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  CheckCircle, 
  RotateCcw,
  Clock,
  Activity
} from 'lucide-react';

export default function ActivityLog() {
  const { activityLog } = useLogisticsStore();
  const [isOpen, setIsOpen] = useState(false);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'DISRUPTION':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'RECOVERY':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'UNDO':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm mt-3">
      {/* Collapsible Trigger Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 bg-slate-950/90 flex items-center justify-between text-left hover:bg-slate-900/90 transition cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-300 font-mono">
            Control Room Incident & Event Audit Log
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
            {activityLog.length} events logged
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>{isOpen ? 'Collapse Log' : 'Expand Timeline'}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Expanded Timeline Content */}
      {isOpen && (
        <div className="p-3 border-t border-slate-800 overflow-x-auto max-h-[260px] overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800 bg-slate-950/60">
              <tr>
                <th className="py-2 px-3">Time</th>
                <th className="py-2 px-2">Type</th>
                <th className="py-2 px-3">Event / Disruption</th>
                <th className="py-2 px-3">Details</th>
                <th className="py-2 px-2">Action Taken</th>
                <th className="py-2 px-3 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {activityLog.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-mono font-bold text-slate-400">
                    {log.timestamp}
                  </td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${getTypeBadge(log.type)}`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-semibold text-white">
                    {log.title}
                  </td>
                  <td className="py-2 px-3 text-slate-300 text-[11px] max-w-[280px] truncate">
                    {log.details}
                  </td>
                  <td className="py-2 px-2 font-mono text-[11px] text-slate-400">
                    {log.actionTaken}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-400 text-[11px]">
                    {log.result}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
