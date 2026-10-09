import React, { useState } from 'react';
import { useLogisticsStore } from '../store/logisticsStore';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Search,
  Filter,
  ArrowUpDown,
  MapPin
} from 'lucide-react';

const STATUS_BADGES = {
  on_track: {
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    label: 'On Track'
  },
  at_risk: {
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    label: 'At Risk'
  },
  blocked: {
    bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    label: 'Blocked'
  },
  rerouted: {
    bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    label: 'Rerouted'
  },
  completed: {
    bg: 'bg-slate-700/30 text-slate-400 border-slate-700/50',
    label: 'Completed'
  }
};

export default function ScheduleList() {
  const { 
    deliveries, 
    selectedDeliveryId, 
    setSelectedDeliveryId 
  } = useLogisticsStore();

  const [filterVan, setFilterVan] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter deliveries
  const filtered = deliveries.filter((d) => {
    if (filterVan !== 'ALL' && d.assignedVan !== filterVan) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.id.toLowerCase().includes(q) ||
        d.customer.toLowerCase().includes(q) ||
        d.area.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-sm">
      {/* Table Header & Quick Filters */}
      <div className="p-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-900/90">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-300 font-mono">
            Live Delivery Manifest
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
            {filtered.length} of {deliveries.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Van Filter Tabs */}
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
            {['ALL', 'V1', 'V2', 'V3', 'V4'].map((van) => (
              <button
                key={van}
                onClick={() => setFilterVan(van)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                  filterVan === van
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {van}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="h-3 w-3 absolute left-2 top-2 text-slate-500" />
            <input
              type="text"
              placeholder="Search stop/client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-6 pr-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-36"
            />
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto overflow-y-auto max-h-[300px]">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 sticky top-0 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-mono">
            <tr>
              <th className="py-2 px-3">ID / Customer</th>
              <th className="py-2 px-2">Area</th>
              <th className="py-2 px-2">Van</th>
              <th className="py-2 px-2">Window</th>
              <th className="py-2 px-2">ETA</th>
              <th className="py-2 px-2">Priority</th>
              <th className="py-2 px-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filtered.map((item) => {
              const isSelected = selectedDeliveryId === item.id;
              const badge = STATUS_BADGES[item.status] || STATUS_BADGES.on_track;

              return (
                <tr
                  key={item.id}
                  onClick={() => setSelectedDeliveryId(item.id)}
                  className={`hover:bg-slate-800/60 cursor-pointer transition ${
                    isSelected ? 'bg-blue-950/40 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-white text-xs">{item.id}</span>
                      <span className="text-slate-200 font-medium truncate max-w-[140px]">
                        {item.customer}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-slate-400 text-[11px] truncate max-w-[100px]">
                    {item.area}
                  </td>
                  <td className="py-2 px-2 font-mono font-bold text-slate-200">
                    {item.assignedVan}
                  </td>
                  <td className="py-2 px-2 font-mono text-slate-400 text-[11px]">
                    {item.timeWindow}
                  </td>
                  <td className="py-2 px-2 font-mono font-semibold">
                    <span className={item.isLate ? 'text-rose-400' : 'text-emerald-400'}>
                      {item.eta}
                    </span>
                    {item.isLate && (
                      <span className="ml-1 text-[10px] text-rose-400/80 font-normal">
                        (+{item.delayMinutes}m)
                      </span>
                    )}
                    {item.waitingMinutes > 0 && !item.isLate && !item.isBlocked && !item.isCompleted && (
                      <span className="ml-1 text-[10px] text-sky-400/80 font-normal" title={`Arrives early. Waits ${item.waitingMinutes}m until ${item.windowStart}`}>
                        (waits {item.waitingMinutes}m)
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        item.priority === 'critical'
                          ? 'text-rose-400'
                          : item.priority === 'high'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
