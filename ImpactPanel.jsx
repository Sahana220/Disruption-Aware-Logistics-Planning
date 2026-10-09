import React, { useState, useEffect } from 'react';
import { useLogisticsStore } from '../store/logisticsStore';
import { 
  AlertOctagon, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck,
  ArrowRight, 
  Clock, 
  GitBranch, 
  Layers, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

// Helper to compute live countdown from sim clock and window end
function computeCountdown(item, currentTimeStr) {
  if (!item || !currentTimeStr) return null;
  const delivery = item.delivery || {};
  const scoring = item.scoring || {};

  const priorityLower = (delivery.priority || '').toLowerCase();
  const isTarget = priorityLower === 'critical' || priorityLower === 'high' || scoring.severity === 'CRITICAL';
  if (!isTarget) return null;

  // Extract window end in minutes
  let endMinutes = null;
  if (delivery.windowEnd) {
    const [h, m] = delivery.windowEnd.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) endMinutes = h * 60 + m;
  }
  if (endMinutes === null) {
    const winStr = item.window || delivery.timeWindow;
    if (winStr && winStr.includes('-')) {
      const endPart = winStr.split('-')[1].trim();
      const [h, m] = endPart.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) endMinutes = h * 60 + m;
    }
  }

  if (endMinutes === null) return null;

  const [curH, curM] = currentTimeStr.split(':').map(Number);
  if (isNaN(curH) || isNaN(curM)) return null;
  const currentMinutes = curH * 60 + curM;

  const diffMinutes = endMinutes - currentMinutes;

  if (diffMinutes < 30) {
    return {
      diffMinutes,
      dueText: diffMinutes <= 0 
        ? (diffMinutes === 0 ? 'Due now (0 min)' : `Overdue by ${Math.abs(diffMinutes)} min`) 
        : `Due in ${diffMinutes} min`,
      labelText: diffMinutes <= 0 ? 'CRITICAL (OVERDUE)' : 'CRITICAL (<30m)',
      chipClass: 'border-rose-500/50 bg-rose-950/60 text-rose-300 shadow-sm shadow-rose-950/50',
      iconClass: 'text-rose-400 animate-pulse',
      iconType: 'critical'
    };
  }

  if (diffMinutes < 60) {
    return {
      diffMinutes,
      dueText: `Due in ${diffMinutes} min`,
      labelText: 'URGENT (<60m)',
      chipClass: 'border-amber-500/50 bg-amber-950/50 text-amber-300 shadow-sm shadow-amber-950/40',
      iconClass: 'text-amber-400',
      iconType: 'warning'
    };
  }

  return {
    diffMinutes,
    dueText: `Due in ${diffMinutes} min`,
    labelText: 'SCHEDULED',
    chipClass: 'border-slate-800 bg-slate-900/90 text-slate-300',
    iconClass: 'text-slate-400',
    iconType: 'normal'
  };
}

export default function ImpactPanel({ maxHeight }) {
  const { 
    impactData, 
    disruptions, 
    selectedDeliveryId, 
    setSelectedDeliveryId,
    currentTime 
  } = useLogisticsStore();

  const allItems = impactData?.allAffectedList || [];

  // Animation: direct items appear first, then cascade items ~300ms apart
  const [revealedIds, setRevealedIds] = useState(new Set());

  useEffect(() => {
    if (allItems.length === 0) {
      setRevealedIds(new Set());
      return;
    }

    const directItems = allItems.filter((i) => i.type === 'direct' || i.impactType === 'direct');
    const cascadeItems = allItems.filter((i) => i.type === 'cascade' || i.impactType === 'cascade');

    const sequence = [...directItems, ...cascadeItems];
    let currentIndex = 0;
    setRevealedIds(new Set(sequence.length > 0 ? [sequence[0].id] : []));

    const interval = setInterval(() => {
      currentIndex += 1;
      if (currentIndex < sequence.length) {
        setRevealedIds((prev) => new Set([...prev, sequence[currentIndex].id]));
      } else {
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [allItems.length, disruptions.length]);

  if (!impactData || !impactData.hasDisruption || allItems.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center" style={{ minHeight: '80px' }}>
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 border border-emerald-500/20">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <h4 className="font-bold text-xs text-white mb-0.5">Zero Disruption Impact</h4>
        <p className="text-xs text-slate-400 max-w-xs">
          All routes and delivery windows are operating on track.
        </p>
      </div>
    );
  }

  // Filter items that have been revealed by animation, sorted by priority score
  const visibleItems = allItems.filter((item) => revealedIds.has(item.id));

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-sm">
      {/* Panel Header */}
      <div className="p-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200 font-mono">
              Impact Assessment & Triage
            </h3>
            {/* Required summary line: e.g. "6 deliveries affected, 2 critical" */}
            <p className="text-[11px] text-amber-300 font-medium">
              {impactData.totalAffectedCount} deliveries affected, {impactData.criticalCount} critical
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <AlertOctagon className="h-3 w-3" />
            {impactData.criticalCount} CRITICAL
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {impactData.atRiskCount} AT RISK
          </span>
        </div>
      </div>

      {/* Cascaded Impact List */}
      <div
        className="p-3 overflow-y-auto space-y-2.5"
        style={{ maxHeight: maxHeight ? `${maxHeight}px` : '580px' }}
      >
        {visibleItems.map((item) => {
          const isSelected = selectedDeliveryId === item.id;
          const { scoring, delivery, impactType, reason, oldETA, newETA, window } = item;

          let badgeBorder = 'border-slate-800 bg-slate-950/90';
          let badgeTagClass = 'bg-slate-800 text-slate-300 border-slate-700';
          let priorityIcon = <ShieldCheck className="h-3 w-3 text-emerald-400" />;

          if (scoring.severity === 'CRITICAL') {
            badgeBorder = 'border-rose-500/50 bg-gradient-to-r from-rose-950/40 to-slate-950';
            badgeTagClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
            priorityIcon = <AlertOctagon className="h-3 w-3 text-rose-400" />;
          } else if (scoring.severity === 'AT RISK') {
            badgeBorder = 'border-amber-500/40 bg-gradient-to-r from-amber-950/30 to-slate-950';
            badgeTagClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
            priorityIcon = <AlertTriangle className="h-3 w-3 text-amber-400" />;
          }

          const isDirect = item.type === 'direct' || item.impactType === 'direct';
          const countdown = computeCountdown(item, currentTime);

          return (
            <div
              key={item.id}
              onClick={() => setSelectedDeliveryId(item.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer relative animate-cascade-in ${badgeBorder} ${
                isSelected ? 'ring-2 ring-blue-500 shadow-lg scale-101' : 'hover:border-slate-700'
              }`}
            >
              {/* Row Header: Priority chip (icon + text) + Tag */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-sm text-white">
                    {delivery.id}
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    {delivery.customer}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold font-mono uppercase tracking-wider flex items-center gap-1 border ${badgeTagClass}`}>
                    {priorityIcon}
                    <span>{scoring.severity}</span>
                    <span className="text-slate-400">({scoring.score} pts)</span>
                  </span>

                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${
                    isDirect
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}>
                    {isDirect ? 'Direct' : 'Cascade'}
                  </span>
                </div>
              </div>

              {/* Plain English Reason */}
              <p className="text-xs text-slate-300 font-medium leading-relaxed mb-2">
                {reason}
              </p>

              {/* old ETA -> new ETA vs time window */}
              <div className="bg-slate-900/95 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="h-3 w-3 text-slate-500" />
                  <span>Window: <strong className="text-slate-300">{window || delivery.timeWindow}</strong></span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.parentIsBlocked ? (
                    // Cascade item whose parent is blocked: show waiting state, not an ETA
                    <span className="font-bold text-amber-400">
                      Waiting on {item.blockedByParentId} (blocked)
                    </span>
                  ) : (
                    <>
                      <span className="text-slate-500">{oldETA}</span>
                      <ArrowRight className="h-3 w-3 text-slate-500" />
                      <span className={`font-bold ${delivery.isLate || delivery.isBlocked ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {delivery.isBlocked ? 'BLOCKED' : newETA}
                      </span>
                      {delivery.isLate && !delivery.isBlocked && (
                        <span className="text-rose-400 text-[10px]">(+{delivery.delayMinutes}m)</span>
                      )}
                      {delivery.waitingMinutes > 0 && !delivery.isLate && !delivery.isBlocked && (
                        <span className="text-sky-400 text-[10px]">(waits {delivery.waitingMinutes}m)</span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Live Countdown for Affected Critical and High-Priority Deliveries */}
              {countdown && (
                <div 
                  className={`mt-2 px-2.5 py-1.5 rounded-lg border flex items-center justify-between text-xs font-mono font-bold transition-all ${countdown.chipClass}`}
                  title={`Computed from Sim Clock (${currentTime || '09:15'}) to Window End`}
                >
                  <div className="flex items-center gap-1.5">
                    {countdown.iconType === 'critical' && <AlertOctagon className={`h-3.5 w-3.5 ${countdown.iconClass}`} />}
                    {countdown.iconType === 'warning' && <AlertTriangle className={`h-3.5 w-3.5 ${countdown.iconClass}`} />}
                    {countdown.iconType === 'normal' && <Clock className={`h-3.5 w-3.5 ${countdown.iconClass}`} />}
                    <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold">{countdown.labelText}</span>
                  </div>
                  <span className="font-extrabold tracking-wide text-xs">{countdown.dueText}</span>
                </div>
              )}

              {/* Sub-tag row */}
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                <span className="flex items-center gap-1">
                  {isDirect ? (
                    <span className="text-rose-400 font-medium">
                      Direct failure ({item.triggerType || 'vehicle/road'})
                    </span>
                  ) : (
                    <span className="text-amber-400 font-medium flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      Downstream cascade ({item.parentName || 'Parent'})
                    </span>
                  )}
                </span>
                <span className="text-slate-500 font-mono">
                  Van {delivery.assignedVan} • {delivery.area}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
