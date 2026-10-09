import React from 'react';
import { useLogisticsStore } from '../store/logisticsStore';
import { Truck, AlertTriangle, CheckCircle, Package } from 'lucide-react';

export default function FleetCards() {
  const { vans, deliveries, disruptions } = useLogisticsStore();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
      {vans.map((van) => {
        const vanDeliveries = deliveries.filter((d) => d.assignedVan === van.id);
        const capacityUsed = vanDeliveries.reduce((sum, d) => sum + (d.loadUnits || 0), 0);
        const percent = Math.min(100, Math.round((capacityUsed / van.capacity) * 100));

        const isBroken = disruptions.some(
          (d) => d.type === 'breakdown' && d.vanId === van.id && d.active !== false
        );

        const hasBlockedStops = vanDeliveries.some((d) => d.isBlocked);
        const hasLateStops = vanDeliveries.some((d) => d.isLate);

        let borderClass = 'border-slate-800 bg-slate-900/70';
        let statusBadge = (
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active
          </span>
        );

        if (isBroken) {
          borderClass = 'border-rose-500/50 bg-rose-950/20 shadow-md shadow-rose-950/20';
          statusBadge = (
            <span className="flex items-center gap-1 text-[10px] text-rose-400 font-extrabold uppercase animate-pulse">
              <AlertTriangle className="h-3 w-3" /> BROKEN DOWN
            </span>
          );
        } else if (hasBlockedStops || hasLateStops) {
          borderClass = 'border-amber-500/40 bg-amber-950/10';
          statusBadge = (
            <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Delay
            </span>
          );
        }

        return (
          <div
            key={van.id}
            className={`p-3 rounded-xl border transition-all hover:border-slate-700 ${borderClass}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: van.color }}
                  title={`Van base color: ${van.color}`}
                />
                <span className="font-bold text-sm text-white font-mono">{van.name}</span>
              </div>
              {statusBadge}
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Driver:</span>
                <span className="font-medium text-slate-200">{van.driver}</span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Deliveries:</span>
                <span className="font-mono font-bold text-white">
                  {vanDeliveries.length} stops
                </span>
              </div>

              {/* Capacity Progress Bar */}
              <div className="pt-1">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Capacity</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {capacityUsed} / {van.capacity} units ({percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      percent > 90
                        ? 'bg-rose-500'
                        : percent > 75
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
