import React from 'react';
import { useLogisticsStore } from '../store/logisticsStore';
import { 
  Sparkles, 
  CheckCircle, 
  Clock, 
  IndianRupee, 
  Users, 
  Eye, 
  ArrowRight, 
  ShieldCheck,
  Zap,
  Check
} from 'lucide-react';

export default function OptionsPanel() {
  const { 
    recoveryOptions, 
    applyOption, 
    setPreviewOption, 
    previewOption,
    selectedOption,
    disruptions
  } = useLogisticsStore();

  const hasDisruption = disruptions.some((d) => d.active !== false);

  if (!hasDisruption || !recoveryOptions || recoveryOptions.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center h-full">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3 border border-blue-500/20">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h4 className="font-bold text-sm text-white mb-1">Standard Operations</h4>
        <p className="text-xs text-slate-400 max-w-xs">
          Recovery generation standing by. Proactive mitigation plans will synthesize here as soon as an impediment is flagged.
        </p>
      </div>
    );
  }

  return (
    <div id="recovery-plans-panel" className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-sm scroll-mt-20">
      {/* Header */}
      <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200 font-mono">
              Algorithmic Recovery Plans
            </h3>
            <p className="text-[11px] text-slate-400">
              Evaluated & ranked by deliverability, transit latency, and operational cost
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
          {recoveryOptions.length} Evaluated
        </span>
      </div>

      {/* Options List */}
      <div className="p-3 overflow-y-auto space-y-3 max-h-[500px]">
        {recoveryOptions.map((opt) => {
          const isSelected = selectedOption?.id === opt.id;
          const isPreviewing = previewOption?.id === opt.id;
          const isApplied = Boolean(selectedOption); // any option has been applied
          const isDimmed = isApplied && !isSelected;

          return (
            <div
              key={opt.id}
              onMouseEnter={() => !isApplied && setPreviewOption(opt)}
              onMouseLeave={() => setPreviewOption(null)}
              className={`p-3.5 rounded-xl border transition-all relative ${
                isSelected
                  ? 'border-emerald-500/60 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 shadow-lg shadow-emerald-950/20'
                  : opt.isRecommended && !isDimmed
                  ? 'border-blue-500/50 bg-gradient-to-br from-blue-950/30 via-slate-900 to-slate-950 shadow-lg'
                  : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
              } ${isPreviewing ? 'ring-2 ring-cyan-400' : ''} ${isDimmed ? 'opacity-40 pointer-events-none' : ''}`}
            >
              {/* Card Header & Badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      {opt.title}
                    </span>
                    {opt.isRecommended && !isApplied && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-cyan-400" />
                        RECOMMENDED
                      </span>
                    )}
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <Check className="h-3 w-3 text-emerald-400" />
                        APPLIED
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    {opt.badge}
                  </span>
                </div>

                {!isSelected && !isApplied && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewOption(isPreviewing ? null : opt);
                    }}
                    className={`text-[10px] font-mono flex items-center gap-1 px-2.5 py-1 rounded border transition cursor-pointer active:scale-95 ${
                      isPreviewing 
                        ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 font-bold shadow-sm' 
                        : 'bg-cyan-950/40 text-cyan-400 border-cyan-800/40 hover:bg-cyan-900/50 hover:text-cyan-300'
                    }`}
                    title={isPreviewing ? "Click to dismiss preview" : "Click to pin preview on map"}
                  >
                    <Eye className="h-3 w-3" />
                    <span>{isPreviewing ? 'Previewing' : 'Preview'}</span>
                  </button>
                )}
              </div>

              {/* Plain-English Explanation */}
              <p className="text-xs text-slate-200 font-medium leading-relaxed mb-3 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                {opt.explanation}
              </p>

              {/* Metric Chips */}
              <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Saved</div>
                  <div className="text-sm font-mono font-extrabold text-emerald-400 mt-0.5">
                    {opt.deliveriesSaved} saved
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {opt.stillLateCount} still late
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Added Delay</div>
                  <div className="text-sm font-mono font-extrabold text-amber-400 mt-0.5">
                    +{opt.totalAddedDelay}m
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    +{opt.extraKm} km
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Extra Cost</div>
                  <div className="text-sm font-mono font-extrabold text-slate-200 mt-0.5">
                    ₹{opt.estimatedExtraCost}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Fuel + delay
                  </div>
                </div>
              </div>

              {/* Customers to notify */}
              {opt.customersToNotify?.length > 0 && (
                <div className="mb-3 pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1 text-slate-400 font-semibold mb-1">
                    <Users className="h-3 w-3 text-slate-500" />
                    <span>Notify ({opt.customersToNotify.length}):</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {opt.customersToNotify.slice(0, 3).map((c, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono">
                        {c.customer}
                      </span>
                    ))}
                    {opt.customersToNotify.length > 3 && (
                      <span className="text-[10px] text-slate-500 self-center">
                        +{opt.customersToNotify.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Apply Action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400">
                  {isSelected ? 'Plan executed — Undo available' : isApplied ? 'Plan not applied' : 'Ready to dispatch'}
                </span>

                <button
                  onClick={() => !isApplied && applyOption(opt)}
                  disabled={isApplied}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                    isSelected
                      ? 'bg-emerald-600 text-white cursor-default'
                      : isApplied
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : opt.isRecommended
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40 cursor-pointer'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Applied
                    </>
                  ) : (
                    <>
                      <span>Apply Plan</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
