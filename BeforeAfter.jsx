import React from 'react';
import { useLogisticsStore } from '../store/logisticsStore';
import { 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  IndianRupee, 
  ShieldCheck,
  Check
} from 'lucide-react';

export default function BeforeAfter() {
  const { appliedComparison, undoAction, historyStack } = useLogisticsStore();

  if (!appliedComparison) return null;

  const { before, after, saved, delayReduction } = appliedComparison;
  const canUndo = historyStack.length > 0;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 border border-blue-500/30 rounded-xl p-3.5 shadow-lg shadow-blue-950/20 mb-3 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white font-mono">
              Plan Execution Applied — Before vs. After Impact Audit
            </h4>
            <p className="text-[11px] text-slate-400">
              Recovered {saved} compromised deliveries • Transit delay reduced by {delayReduction}m
            </p>
          </div>
        </div>

        {canUndo && (
          <button
            onClick={undoAction}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95 cursor-pointer shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
            <span>Undo Plan (Restore Original)</span>
          </button>
        )}
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 pt-3 text-center">
        {/* On-Time Deliveries */}
        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-mono mb-1">On-Time Stops</div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-mono">
            <span className="text-slate-400 font-bold">{before.onTime}</span>
            <ArrowRight className="h-3 w-3 text-emerald-400" />
            <span className="text-emerald-400 font-extrabold text-sm">{after.onTime}</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">
            +{saved} recovered
          </div>
        </div>

        {/* Late Deliveries */}
        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-mono mb-1">At Risk / Late</div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-mono">
            <span className="text-rose-400 font-bold">{before.late}</span>
            <ArrowRight className="h-3 w-3 text-emerald-400" />
            <span className="text-emerald-400 font-extrabold text-sm">{after.late}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            -{saved} drop
          </div>
        </div>

        {/* Critical Compromised */}
        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-mono mb-1">Critical Failures</div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-mono">
            <span className="text-rose-400 font-bold">{before.criticalBlocked}</span>
            <ArrowRight className="h-3 w-3 text-emerald-400" />
            <span className="text-emerald-400 font-extrabold text-sm">{after.criticalBlocked}</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">
            100% Medical SLAs Met
          </div>
        </div>

        {/* Total Delay Mins */}
        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase font-mono mb-1">Total Fleet Delay</div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-mono">
            <span className="text-slate-400 font-bold">{before.totalDelay}m</span>
            <ArrowRight className="h-3 w-3 text-amber-400" />
            <span className="text-amber-400 font-extrabold text-sm">{after.totalDelay}m</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Balanced transit load
          </div>
        </div>

        {/* Marginal Cost */}
        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 col-span-2 md:col-span-1">
          <div className="text-[10px] text-slate-400 uppercase font-mono mb-1">Marginal Cost Delta</div>
          <div className="flex items-center justify-center gap-1 text-xs font-mono font-extrabold text-cyan-400 text-sm">
            <span>+₹{after.cost}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Re-route & dispatch fee
          </div>
        </div>
      </div>
    </div>
  );
}
