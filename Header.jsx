import React from 'react';
import { useLogisticsStore } from '../store/logisticsStore';
import { 
  Clock, 
  RotateCcw, 
  AlertTriangle, 
  Layers, 
  Copy, 
  Check,
  LogOut,
  Download,
  UserCheck,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { generatePlainEnglishSummary } from '../logic/summary';
import VoiceInputButton from './VoiceInputButton';

export default function Header({ onOpenDisruptionModal, currentUser, onLogout }) {
  const { 
    currentTime, 
    advanceClock, 
    resetDemo, 
    disruptions, 
    impactData, 
    recoveryOptions,
    undoAction,
    historyStack,
    deliveries,
    simpleMode,
    toggleSimpleMode
  } = useLogisticsStore();

  const [copied, setCopied] = React.useState(false);
  const [exported, setExported] = React.useState(false);

  const hasActiveDisruption = disruptions.some((d) => d.active !== false);
  const activeDisruption = disruptions.find((d) => d.active !== false);
  const recommended = recoveryOptions?.find((o) => o.isRecommended) || recoveryOptions?.[0];

  const handleCopySummary = () => {
    const summaryText = generatePlainEnglishSummary({
      disruption: activeDisruption,
      impactData,
      recommendedOption: recommended
    });
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Logistics Team Export Manifest (CSV)
  const handleExportManifest = () => {
    try {
      const csvHeader = "StopID,Customer,Area,Van,Window,ETA,Priority,Status\n";
      const csvRows = deliveries.map(d => 
        `"${d.id}","${d.customer}","${d.area}","${d.assignedVan}","${d.timeWindow}","${d.eta || ''}","${d.priority}","${d.status}"`
      ).join("\n");
      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `DisruptionDesk_Manifest_${currentTime.replace(':', '')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExported(true);
      setTimeout(() => setExported(false), 2000);
    } catch (err) {
      console.warn('[Export Error]', err);
    }
  };

  const isOperator = currentUser?.role === 'operator';
  const displayName = currentUser?.name || (isOperator ? 'Van Operator' : 'Logistics Planner');
  const roleTitle = isOperator 
    ? `Operator (${currentUser?.vanId || 'Van 1'})` 
    : 'Logistics Team';

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-3 sm:px-4 py-2.5 shadow-md">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Left: Brand & Signed-in User Info */}
        <div className="flex flex-wrap items-center justify-between lg:justify-start gap-3 w-full lg:w-auto">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                <Layers className="h-4.5 w-4.5 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white font-mono">
                  DISRUPTION<span className="text-blue-400">DESK</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  v1.0 Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${hasActiveDisruption ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></span>
                Coimbatore Hub • 4 Vans • 12 Stops
              </p>
            </div>
          </div>

          {/* Signed-in Name & Role Badge (High Contrast) */}
          <div className="flex items-center gap-2 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-800">
            <div className={`p-1.5 rounded-lg border ${
              isOperator 
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
                : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
            }`}>
              {isOperator ? <Truck className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white leading-tight">
                {displayName}
              </span>
              <span className={`text-[10px] font-mono font-semibold uppercase ${
                isOperator ? 'text-amber-400' : 'text-blue-400'
              }`}>
                {roleTitle}
              </span>
            </div>

            {/* Simple Mode indicator for Operator */}
            {isOperator && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Simple Mode
              </span>
            )}
          </div>
        </div>

        {/* Center: Simulated Clock Control */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 shadow-inner">
          <div className="flex items-center gap-2 pr-2 border-r border-slate-800">
            <Clock className="h-4 w-4 text-cyan-400" />
            <span className="text-xs text-slate-400 uppercase font-medium tracking-wider">Sim Clock</span>
            <span className="text-base font-mono font-bold text-white px-2 py-0.5 bg-slate-900 rounded border border-slate-700">
              {currentTime}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => advanceClock(15)}
              aria-label="Advance simulation by 15 minutes"
              className="min-h-[36px] px-2.5 py-1 rounded text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition active:scale-95 border border-slate-700 cursor-pointer"
              title="Advance simulation by 15 minutes"
            >
              +15m
            </button>
            <button
              type="button"
              onClick={() => advanceClock(30)}
              aria-label="Advance simulation by 30 minutes"
              className="min-h-[36px] px-2.5 py-1 rounded text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition active:scale-95 border border-slate-700 cursor-pointer"
              title="Advance simulation by 30 minutes"
            >
              +30m
            </button>
          </div>
        </div>

        {/* Right: Actions, Summary/Export, and Logout */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          {/* Logistics Team Only: Copy Summary */}
          {!isOperator && hasActiveDisruption && (
            <button
              type="button"
              onClick={handleCopySummary}
              aria-label="Copy incident summary to clipboard"
              className="min-h-[48px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Copy incident briefing for WhatsApp / Slack"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-slate-400" />
                  <span>Copy Summary</span>
                </>
              )}
            </button>
          )}

          {/* Logistics Team Only: Export Button */}
          {!isOperator && (
            <button
              type="button"
              onClick={handleExportManifest}
              aria-label="Export delivery manifest as CSV"
              className="min-h-[48px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              title="Download delivery manifest CSV"
            >
              {exported ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Exported</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 text-cyan-400" />
                  <span>Export</span>
                </>
              )}
            </button>
          )}

          {/* Undo Changes Button (Logistics Team only, visible if history exists) */}
          {!isOperator && historyStack?.length > 0 && (
            <button
              type="button"
              onClick={undoAction}
              aria-label="Undo applied recovery plan"
              className="min-h-[48px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 transition active:scale-95 shadow-sm cursor-pointer"
              title="Undo applied recovery plan and restore previous schedule"
            >
              <RotateCcw className="h-4 w-4 text-amber-400" />
              <span>Undo Changes</span>
            </button>
          )}

          {/* Reset Demo Button */}
          <button
            type="button"
            onClick={resetDemo}
            aria-label="Reset simulation to initial state"
            className="min-h-[48px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition active:scale-95 cursor-pointer"
            title="Reset to initial 09:15 schedule"
          >
            <RotateCcw className="h-4 w-4 text-slate-400" />
            <span>Reset Demo</span>
          </button>

          {/* Voice Input Button & Language Toggle (Operator only, min 64px, pulsing ring while listening) */}
          {isOperator && (
            <VoiceInputButton />
          )}

          {/* Report Disruption Button: Operator can report; Logistics disabled with tooltip */}
          {isOperator ? (
            <button
              type="button"
              onClick={onOpenDisruptionModal}
              aria-label="Report new operational disruption"
              className="min-h-[48px] flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-md shadow-rose-900/30 transition active:scale-95 cursor-pointer"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Report Disruption</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              title="Operators report disruptions"
              aria-label="Operators report disruptions"
              className="min-h-[48px] flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800/40 text-slate-500 border border-slate-700/40 cursor-not-allowed opacity-60"
            >
              <AlertTriangle className="h-4 w-4 text-slate-500" />
              <span>Report Disruption</span>
            </button>
          )}

          {/* Logout Button (Min 48px, high contrast) */}
          <button
            type="button"
            onClick={onLogout}
            aria-label="Sign out and return to login page"
            className="min-h-[48px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-950/70 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800/80 transition active:scale-95 cursor-pointer"
            title="Sign out of DisruptionDesk"
          >
            <LogOut className="h-4 w-4 text-rose-400" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
