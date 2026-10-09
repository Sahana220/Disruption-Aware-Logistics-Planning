import React, { useEffect } from 'react';
import { useLogisticsStore } from '../store/logisticsStore';
import { 
  Radio, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  Truck,
  Eye,
  Check,
  Zap,
  Clock
} from 'lucide-react';
import { speakText } from '../voice/useSpeechOutput';

export default function OperatorConfirmationCard({ onOpenDisruptionModal }) {
  const { 
    disruptions, 
    impactData, 
    voiceMuted,
    alertStatus,
    appliedOptionTitle,
    selectedOption
  } = useLogisticsStore();

  const hasActiveDisruption = disruptions.some((d) => d.active !== false);
  const activeDisruption = disruptions.find((d) => d.active !== false);

  // Formulate what changed string
  let whatChanged = '';
  if (activeDisruption) {
    if (activeDisruption.type === 'breakdown') {
      whatChanged = `${activeDisruption.vanName || activeDisruption.vanId} broke down at ${activeDisruption.time || '09:30'} (${activeDisruption.downtime || 'Out for day'})`;
    } else if (activeDisruption.type === 'road_closure') {
      whatChanged = `${activeDisruption.roadName || 'Road'} closed (${activeDisruption.duration || '2h'})`;
    } else if (activeDisruption.type === 'weather') {
      whatChanged = `Severe rain in North Coimbatore (1.4x transit delay)`;
    } else if (activeDisruption.type === 'customer_change') {
      whatChanged = `Customer ${activeDisruption.deliveryId} window rescheduled to ${activeDisruption.newTimeWindow}`;
    } else {
      whatChanged = 'Operational disruption reported';
    }
  }

  const affectedCount = impactData?.totalAffectedCount || 0;
  const criticalCount = impactData?.criticalCount || 0;
  const planTitle = appliedOptionTitle || selectedOption?.title || 'Recovery Plan';
  const isPlanApplied = alertStatus === 'Plan applied';
  const isSeen = alertStatus === 'Seen by Logistics Team' || isPlanApplied;

  // Safe voice readout
  const handleReadAloud = () => {
    try {
      let summaryEn = '';
      let summaryTa = '';

      if (isPlanApplied) {
        summaryEn = `Plan applied by Logistics Team: ${planTitle}. Route resequenced for deliverability.`;
        summaryTa = `லாஜிஸ்டிக்ஸ் குழு திட்டத்தை செயல்படுத்தியது: ${planTitle}.`;
      } else if (isSeen) {
        summaryEn = `Alert seen by Logistics Team. Team is actively reviewing recovery options for ${whatChanged}.`;
        summaryTa = `லாஜிஸ்டிக்ஸ் குழு எச்சரிக்கையைப் பார்த்தது. மீட்பு திட்டங்களை பரிசீலித்து வருகிறது.`;
      } else {
        summaryEn = `Alert sent to the Logistics Team. ${whatChanged}. ${affectedCount} deliveries affected, ${criticalCount} critical. Waiting for the Logistics Team to apply a plan.`;
        summaryTa = `லாஜிஸ்டிக்ஸ் குழுவிற்கு எச்சரிக்கை அனுப்பப்பட்டது. ${whatChanged}. ${affectedCount} டெலிவரிகள் பாதிக்கப்பட்டன. திட்டமிடல் குழுவின் நடவடிக்கைக்காக காத்திருக்கிறது.`;
      }

      speakText(summaryEn, summaryTa);
    } catch (err) {
      console.warn('[Operator Voice] Speech output error:', err);
    }
  };

  // Read aloud on initial disruption confirmation or when plan applied if voice is active
  useEffect(() => {
    if (hasActiveDisruption && !voiceMuted) {
      handleReadAloud();
    }
  }, [activeDisruption?.id, alertStatus, isPlanApplied]);

  if (!hasActiveDisruption) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-md">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-3">
          <Truck className="h-7 w-7 text-blue-400" />
        </div>
        <h4 className="text-base font-bold text-white mb-1">
          Field Operations Active
        </h4>
        <p className="text-xs text-slate-400 max-w-sm mb-4">
          All routes on schedule. If you encounter a breakdown, closed road, or weather delay, report it below or press <strong className="text-slate-200 font-mono">R</strong>.
        </p>
        <button
          type="button"
          onClick={onOpenDisruptionModal}
          className="min-h-[48px] px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg shadow-rose-900/30 transition flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Report Disruption (Press R)</span>
        </button>
      </div>
    );
  }

  // Define 3 tracker steps
  const steps = [
    {
      id: 'sent',
      label: 'Sent',
      subtitle: 'Disruption broadcast',
      icon: Send,
      isDone: true,
      isActive: alertStatus === 'Sent'
    },
    {
      id: 'seen',
      label: 'Seen by Logistics Team',
      subtitle: 'Coordinator reviewing',
      icon: Eye,
      isDone: isSeen,
      isActive: alertStatus === 'Seen by Logistics Team'
    },
    {
      id: 'applied',
      label: 'Plan applied',
      subtitle: 'Routes updated',
      icon: Zap,
      isDone: isPlanApplied,
      isActive: isPlanApplied
    }
  ];

  return (
    <div className="bg-slate-900/90 border-2 border-amber-500/50 rounded-2xl p-5 sm:p-6 shadow-xl shadow-amber-950/20 flex flex-col gap-4">
      {/* Header: Title + Icon + Speaker button */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Radio className="h-6 w-6 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Alert sent to the Logistics Team
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live status synchronized with Central Dispatch Room
            </p>
          </div>
        </div>

        {/* Replay voice button */}
        <button
          type="button"
          onClick={handleReadAloud}
          aria-label="Read confirmation aloud"
          title="Read alert aloud"
          className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white border border-slate-700 hover:border-amber-500 transition flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
        >
          <Volume2 className="h-5 w-5" />
        </button>
      </div>

      {/* Disruption Summary Box */}
      <div className="bg-slate-950/90 rounded-xl p-4 border border-slate-800 space-y-3">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Reported Disruption
          </span>
          <p className="text-sm font-semibold text-white">
            {whatChanged}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Deliveries Affected</span>
            <span className="text-lg font-bold font-mono text-amber-400">{affectedCount} stops</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Critical Urgency</span>
            <span className={`text-lg font-bold font-mono ${criticalCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
              {criticalCount} critical
            </span>
          </div>
        </div>
      </div>

      {/* ── THREE-STEP ALERT STATUS TRACKER ── */}
      <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/90">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-3">
          Dispatch Action Tracker
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            let stepBadge = 'border-slate-800 bg-slate-900/60 text-slate-500';
            let iconClass = 'text-slate-500';

            if (step.isDone) {
              stepBadge = 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300';
              iconClass = 'text-emerald-400';
            } else if (step.isActive) {
              stepBadge = 'border-amber-500/50 bg-amber-950/40 text-amber-300 ring-1 ring-amber-500/30';
              iconClass = 'text-amber-400 animate-pulse';
            }

            return (
              <div 
                key={step.id}
                className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${stepBadge}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold opacity-75">
                      0{idx + 1}
                    </span>
                    <Icon className={`h-4 w-4 ${iconClass}`} />
                  </div>
                  {step.isDone && (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight text-white">
                    {step.label}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {step.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── STATUS LINE / UPDATE LINE ── */}
      {isPlanApplied ? (
        /* Update line when plan is applied: "Plan applied by Logistics Team: <option title>" */
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border-2 border-emerald-500/60 text-emerald-200 flex items-start gap-3 shadow-md animate-fade-in">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0 mt-0.5">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-white">
              Plan applied by Logistics Team: <span className="text-emerald-300 font-mono font-extrabold">{planTitle}</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Recovery route plan is executed. Updated navigation manifests are live across fleet vans.
            </p>
          </div>
        </div>
      ) : isSeen ? (
        /* Status line when seen: Coordinator is reviewing */
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-blue-950/50 border border-blue-500/40 text-blue-200 shadow-inner">
          <Eye className="h-4 w-4 text-blue-400 shrink-0 animate-pulse" />
          <span className="font-semibold text-xs sm:text-sm">
            Logistics Team has seen the alert and is evaluating recovery plans
          </span>
        </div>
      ) : (
        /* Status line when sent: Waiting for Logistics Team */
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 shadow-inner">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <span className="font-semibold text-xs sm:text-sm">
            Waiting for the Logistics Team to apply a plan
          </span>
        </div>
      )}
    </div>
  );
}
