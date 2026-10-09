import React from 'react';
import { useLogisticsStore } from '../store/logisticsStore';
import { Network, Info, AlertTriangle } from 'lucide-react';

const STATUS_COLOR_MAP = {
  on_track: '#10b981', // green
  at_risk: '#f59e0b',  // amber
  blocked: '#ef4444',  // red
  rerouted: '#06b6d4', // cyan
  completed: '#64748b' // grey
};

export default function DependencyGraph() {
  const { 
    deliveries, 
    selectedDeliveryId, 
    setSelectedDeliveryId,
    disruptions,
    impactData
  } = useLogisticsStore();

  const d6 = deliveries.find((d) => d.id === 'D6');
  const d7 = deliveries.find((d) => d.id === 'D7');
  const d12 = deliveries.find((d) => d.id === 'D12');

  const nodes = [
    {
      id: 'D6',
      data: d6,
      name: d6?.customer || 'Supplier Pickup',
      area: 'Singanallur',
      van: d6?.assignedVan || 'V2',
      status: d6?.status || 'on_track',
      x: 80,
      y: 70
    },
    {
      id: 'D7',
      data: d7,
      name: d7?.customer || 'Ukkadam Dist.',
      area: 'Ukkadam',
      van: d7?.assignedVan || 'V3',
      status: d7?.status || 'on_track',
      x: 290,
      y: 70
    },
    {
      id: 'D12',
      data: d12,
      name: d12?.customer || 'Care Clinic',
      area: 'Saibaba Colony',
      van: d12?.assignedVan || 'V4',
      status: d12?.status || 'on_track',
      x: 500,
      y: 70
    }
  ];

  // Helper to determine dynamic display color
  const getNodeColor = (node) => {
    const isAffected = impactData?.allAffectedList?.some((item) => item.id === node.id);
    if (isAffected) {
      const item = impactData.allAffectedList.find((i) => i.id === node.id);
      if (item?.scoring?.severity === 'CRITICAL') return '#ef4444';
      if (item?.scoring?.severity === 'AT RISK') return '#f59e0b';
      return '#eab308';
    }
    return STATUS_COLOR_MAP[node.status] || '#10b981';
  };

  const isChainAffected = impactData?.allAffectedList?.some(
    (item) => item.id === 'D6' || item.id === 'D7' || item.id === 'D12'
  );

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 shadow-sm">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
          <Network className="h-4 w-4 text-cyan-400" />
          <span>Cross-Van Dependency Graph (SVG)</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Nominal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Affected Chain
          </span>
        </div>
      </div>

      {/* Real SVG Node-Link Diagram */}
      <div className="w-full overflow-x-auto flex justify-center py-2">
        <svg
          viewBox="0 0 580 140"
          className="w-full max-w-[580px] h-auto select-none overflow-visible"
        >
          <defs>
            {/* Arrow Marker Nominal */}
            <marker
              id="arrow-nominal"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#64748b" />
            </marker>

            {/* Arrow Marker Affected */}
            <marker
              id="arrow-affected"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#f43f5e" />
            </marker>
          </defs>

          {/* Links: D6 -> D7 */}
          <line
            x1={nodes[0].x + 35}
            y1={nodes[0].y}
            x2={nodes[1].x - 35}
            y2={nodes[1].y}
            stroke={isChainAffected ? '#f43f5e' : '#475569'}
            strokeWidth={isChainAffected ? '3' : '2'}
            strokeDasharray={isChainAffected ? '5,4' : 'none'}
            markerEnd={isChainAffected ? 'url(#arrow-affected)' : 'url(#arrow-nominal)'}
            className={isChainAffected ? 'animate-pulse' : ''}
          />
          <text
            x={(nodes[0].x + nodes[1].x) / 2}
            y={nodes[0].y - 12}
            fill={isChainAffected ? '#fda4af' : '#94a3b8'}
            fontSize="10"
            fontFamily="monospace"
            textAnchor="middle"
            fontWeight="bold"
          >
            needs D6 goods
          </text>

          {/* Links: D7 -> D12 */}
          <line
            x1={nodes[1].x + 35}
            y1={nodes[1].y}
            x2={nodes[2].x - 35}
            y2={nodes[2].y}
            stroke={isChainAffected ? '#f43f5e' : '#475569'}
            strokeWidth={isChainAffected ? '3' : '2'}
            strokeDasharray={isChainAffected ? '5,4' : 'none'}
            markerEnd={isChainAffected ? 'url(#arrow-affected)' : 'url(#arrow-nominal)'}
            className={isChainAffected ? 'animate-pulse' : ''}
          />
          <text
            x={(nodes[1].x + nodes[2].x) / 2}
            y={nodes[1].y - 12}
            fill={isChainAffected ? '#fda4af' : '#94a3b8'}
            fontSize="10"
            fontFamily="monospace"
            textAnchor="middle"
            fontWeight="bold"
          >
            needs D7 clearance
          </text>

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedDeliveryId === node.id;
            const color = getNodeColor(node);

            return (
              <g
                key={node.id}
                onClick={() => setSelectedDeliveryId(node.id)}
                className="cursor-pointer group"
                transform={`translate(${node.x}, ${node.y})`}
              >
                {/* Outer Glow / Ring */}
                {isSelected && (
                  <circle
                    r="32"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    className="animate-ping opacity-60"
                  />
                )}

                {/* Node Body */}
                <circle
                  r="26"
                  fill="#0f172a"
                  stroke={color}
                  strokeWidth={isSelected ? '3.5' : '2.5'}
                  className="transition-all duration-200 group-hover:scale-110"
                />

                {/* Delivery ID Text */}
                <text
                  textAnchor="middle"
                  dy="-4"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {node.id}
                </text>

                {/* Assigned Van Tag */}
                <text
                  textAnchor="middle"
                  dy="10"
                  fill={color}
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {node.van}
                </text>

                {/* Customer Label Below */}
                <text
                  textAnchor="middle"
                  dy="42"
                  fill="#f1f5f9"
                  fontSize="11"
                  fontWeight="600"
                >
                  {node.name}
                </text>

                {/* Area & ETA */}
                <text
                  textAnchor="middle"
                  dy="56"
                  fill="#94a3b8"
                  fontSize="9.5"
                  fontFamily="monospace"
                >
                  {node.area} • {node.data?.eta}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-1 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Info className="h-3.5 w-3.5 text-slate-500" />
          Click any node to zoom and highlight on map
        </span>
        <span className="font-mono text-[10px] text-cyan-400">
          Supplier (V2) ➔ Distributor (V3) ➔ Clinic (V4)
        </span>
      </div>
    </div>
  );
}
