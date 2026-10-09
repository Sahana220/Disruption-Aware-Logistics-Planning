import React from 'react';
import { useLogisticsStore } from '../store/logisticsStore';
import { 
  AlertOctagon, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  Sparkles, 
  Zap
} from 'lucide-react';

export default function StatusBanner({ onOpenDisruptionModal, currentUser }) {
  const { 
    disruptions, 
    impactData, 
    recoveryOptions, 
    selectedOption, 
    deliveries,
    currentUser: storeUser
  } = useLogisticsStore();

  const user = currentUser || storeUser;
  const isOperator = user?.role === 'operator';

  const hasDisruption = disruptions.some((d) => d.active !== false);
  const activeDisruption = disruptions.find((d) => d.active !== false);

  if (!hasDisruption) {
    const totalDeliveries = deliveries.length;
    const completedCount = deliveries.filter((d) => d.isCompleted).length;

    return (
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-semibold text-xs tracking-wide uppercase">Operational Baseline Stable</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-300">
            All deliveries on track ({completedCount} completed, {totalDeliveries - completedCount} active)
          </span>
        </div>

        {/* Operator can trigger demo test scenario; Logistics Team tooltip shown */}
        <div className="hidden sm:flex items-center gap-2">
          {isOperator ? (
            <>
              <span className="text-[11px] text-slate-400">Click to inject test scenario:</span>
              <button
                type="button"
                onClick={onOpenDisruptionModal}
                className="text-xs text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
              >
                Simulate Disruption (Press R)
              </button>
            </>
          ) : (
            <span className="text-[11px] text-slate-500 italic" title="Operators report disruptions">
              Operators report field disruptions
            </span>
          )}
        </div>
      </div>
    );
  }

  // Generate 3-step decision statement
  let whatChanged = '';
  if (activeDisruption.type === 'breakdown') {
    whatChanged = `${activeDisruption.vanName || activeDisruption.vanId} broke down at ${activeDisruption.time || '09:30'} (${activeDisruption.downtime || 'out for the day'})`;
  } else if (activeDisruption.type === 'road_closure') {
    whatChanged = `${activeDisruption.roadName || 'Road'} closed (${activeDisruption.duration || '2h'})`;
  } else if (activeDisruption.type === 'weather') {
    whatChanged = `Severe rain in North Coimbatore (1.4x transit delay)`;
  } else if (activeDisruption.type === 'customer_change') {
    whatChanged = `Customer ${activeDisruption.deliveryId} window rescheduled to ${activeDisruption.newTimeWindow}`;
  } else {
    whatChanged = 'Operational impediment reported';
  }

  const affectedCount = impactData?.totalAffectedCount || 0;
  const criticalCount = impactData?.criticalCount || 0;
  const optionsCount = recoveryOptions?.length || 0;
  const recommendedOption = recoveryOptions?.find(o => o.isRecommended);
  const appliedOption = selectedOption;

  // Banner step 3 text:
  // For Operator: strictly "Alert sent to Logistics Team"
  // For Logistics Team: plan applied / options ready
  const whatNextText = isOperator
    ? 'Alert sent to Logistics Team'
    : appliedOption
    ? `Plan applied: ${appliedOption.title}`
    : optionsCount > 0
    ? `${optionsCount} options ready${recommendedOption ? `, recommended: ${recommendedOption.title}` : ''}`
    : 'Calculating recovery options…';

  return (
    <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/40 border-b border-rose-500/40 px-4 py-2.5 shadow-lg shadow-rose-950/20">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        {/* Core 3-part triage sequence */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold uppercase tracking-wider animate-alert-pulse">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            <span>DISRUPTION ACTIVE</span>
          </div>

          {/* Part 1: WHAT CHANGED */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded border border-slate-700">
            <span className="font-bold text-rose-400 uppercase tracking-wider text-[11px]">1. WHAT CHANGED:</span>
            <span className="text-slate-200 font-medium">{whatChanged}</span>
          </div>

          <ArrowRight className="h-3.5 w-3.5 text-slate-500 hidden sm:block" />

          {/* Part 2: WHAT IS AFFECTED */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded border border-slate-700">
            <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">2. WHAT IS AFFECTED:</span>
            <span className="text-slate-200 font-medium">
              {affectedCount} deliveries
              {criticalCount > 0 && (
                <span className="ml-1 text-rose-400 font-bold">({criticalCount} critical)</span>
              )}
            </span>
          </div>

          <ArrowRight className="h-3.5 w-3.5 text-slate-500 hidden sm:block" />

          {/* Part 3: WHAT NEXT (Role-based) */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded border border-slate-700">
            <span className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">3. WHAT NEXT:</span>
            <span className="text-blue-300 font-medium">
              {whatNextText}
            </span>
          </div>
        </div>

        {/* Quick hint */}
        <div className="text-[11px] text-slate-400 font-medium">
          {isOperator ? 'Waiting for Logistics Team to review and apply recovery plan' : 'Select and apply an automated recovery plan below'}
        </div>
      </div>
    </div>
  );
}
