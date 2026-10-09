import React, { useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  useMap,
  Tooltip,
  Polygon
} from 'react-leaflet';
import L from 'leaflet';
import { useLogisticsStore } from '../store/logisticsStore';
import { 
  Navigation, 
  Clock, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert,
  ArrowRight,
  Maximize2
} from 'lucide-react';

// Status color palette
const STATUS_COLORS = {
  on_track: '#10b981', // green
  at_risk: '#f59e0b',  // amber
  blocked: '#ef4444',  // red
  rerouted: '#06b6d4', // cyan / blue
  completed: '#64748b' // grey
};

// Map controller to fit bounds on load and pan smoothly on selection
function MapController({ selectedDelivery, depot, deliveries }) {
  const map = useMap();
  const hasFittedRef = React.useRef(false);

  useEffect(() => {
    if (depot && deliveries && deliveries.length > 0 && !hasFittedRef.current) {
      const allCoords = [
        [depot.lat, depot.lng],
        ...deliveries.map((d) => [d.lat, d.lng])
      ];
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [40, 40] });
      hasFittedRef.current = true;
    }
  }, [map, depot, deliveries]);

  useEffect(() => {
    if (selectedDelivery) {
      map.flyTo([selectedDelivery.lat, selectedDelivery.lng], 14, {
        animate: true,
        duration: 0.8
      });
    }
  }, [selectedDelivery, map]);

  return null;
}

// "Fit all" button control calling fitBounds on all markers + depot
function FitAllControl({ depot, deliveries }) {
  const map = useMap();

  const handleFit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (depot && deliveries && deliveries.length > 0) {
      const allCoords = [
        [depot.lat, depot.lng],
        ...deliveries.map((d) => [d.lat, d.lng])
      ];
      map.fitBounds(L.latLngBounds(allCoords), { padding: [40, 40] });
    }
  };

  return (
    <div className="leaflet-top leaflet-right" style={{ pointerEvents: 'auto', margin: '12px' }}>
      <button
        type="button"
        onClick={handleFit}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/95 hover:bg-slate-800 text-slate-100 text-xs font-semibold shadow-xl border border-slate-700 transition active:scale-95 cursor-pointer backdrop-blur-md"
        title="Fit all markers in view"
      >
        <Maximize2 className="h-3.5 w-3.5 text-blue-400" />
        <span>Fit all</span>
      </button>
    </div>
  );
}

// Create custom SVG DivIcons for Leaflet (24px compact, label on hover for overlap prevention)
function createDeliveryIcon(delivery, isSelected, impactItem) {
  let bgColor = STATUS_COLORS[delivery.status] || '#10b981';

  // Affected markers get colored by priority (red critical, amber at risk, yellow-green low risk)
  if (impactItem) {
    if (impactItem.scoring?.severity === 'CRITICAL') {
      bgColor = '#ef4444'; // Red
    } else if (impactItem.scoring?.severity === 'AT RISK') {
      bgColor = '#f59e0b'; // Amber
    } else {
      bgColor = '#84cc16'; // Yellow-green
    }
  } else if (delivery.isRerouted) {
    bgColor = '#2563eb'; // Blue for rerouted
  }

  const isPulse = Boolean(impactItem || delivery.status === 'blocked');
  const borderRing = isSelected 
    ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900 scale-125 z-50' 
    : delivery.isRerouted 
    ? 'ring-2 ring-sky-400 ring-offset-1 ring-offset-slate-900' 
    : '';

  const html = `
    <div class="relative group cursor-pointer transition-transform ${borderRing}">
      ${isPulse ? '<div class="absolute -inset-1 rounded-full bg-rose-500/50 animate-ping"></div>' : ''}
      <div style="background-color: ${bgColor}" class="relative flex items-center justify-center w-6 h-6 rounded-full text-white font-bold text-[9px] shadow-md shadow-black/60 border border-slate-900 font-mono">
        ${delivery.id}
      </div>
      <!-- Label shown on hover for overlapping markers -->
      <div class="absolute left-1/2 -translate-x-1/2 -top-7 hidden group-hover:flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/95 text-slate-100 text-[10px] font-sans font-semibold whitespace-nowrap shadow-xl border border-slate-700 pointer-events-none z-[9999]">
        <span>${delivery.customer}</span>
        <span class="text-cyan-400 font-mono">(${delivery.assignedVan})</span>
        ${delivery.isRerouted ? '<span class="text-sky-300 font-bold ml-0.5">[REROUTED]</span>' : ''}
        ${impactItem ? `<span class="text-rose-400 font-bold ml-0.5">[${impactItem.scoring.severity}]</span>` : ''}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-delivery-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14]
  });
}

function createDepotIcon() {
  const html = `
    <div class="relative flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-500/30 border border-white/80">
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
      </svg>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-depot-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16]
  });
}

function createVanIcon(van, isBroken) {
  const color = isBroken ? '#ef4444' : van.color || '#3b82f6';
  const html = `
    <div class="relative flex items-center justify-center w-7 h-7 rounded-md ${isBroken ? 'bg-rose-950 border-2 border-rose-500 animate-pulse' : 'bg-slate-900 border border-white/60'} shadow-md">
      ${isBroken ? `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ` : `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="1" y="3" width="15" height="13"/>
          <polygon points="16 8 20 8 23 11 23 16 16 16 8"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      `}
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-van-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16]
  });
}

// In-memory cache for OSRM road geometries to fetch each unique route only once
const osrmRouteCache = new Map();

async function fetchOsrmRoute(waypoints) {
  if (!waypoints || waypoints.length < 2) return waypoints;

  // Format as {lng},{lat};{lng},{lat} for OSRM public routing API
  const coordString = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(';');

  if (osrmRouteCache.has(coordString)) {
    return osrmRouteCache.get(coordString);
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM status ${res.status}`);
    const data = await res.json();
    if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates) {
      // OSRM returns coordinates as [lng, lat], flip to Leaflet's [lat, lng]
      const latLngPoints = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      osrmRouteCache.set(coordString, latLngPoints);
      return latLngPoints;
    }
  } catch (err) {
    // Fail gracefully and fallback to straight lines
  }

  // Cache straight line fallback so repeated failed requests don't spam network
  osrmRouteCache.set(coordString, waypoints);
  return waypoints;
}

export default function MapView() {
  const { 
    depot, 
    vans, 
    deliveries, 
    roads, 
    disruptions, 
    selectedDeliveryId, 
    setSelectedDeliveryId,
    previewOption,
    impactData
  } = useLogisticsStore();

  const [routeGeometries, setRouteGeometries] = React.useState({});
  const [previewGeometries, setPreviewGeometries] = React.useState({});

  const selectedDelivery = deliveries.find((d) => d.id === selectedDeliveryId);

  // Group deliveries per van to draw polylines
  const activeDeliveries = previewOption?.proposedDeliveries || deliveries;

  // Fetch realistic road-following geometries from OSRM for each active route
  useEffect(() => {
    let isCancelled = false;

    vans.forEach(async (van) => {
      const vanDeliveries = activeDeliveries
        .filter((d) => d.assignedVan === van.id)
        .sort((a, b) => (a.routeOrder || 0) - (b.routeOrder || 0));

      const waypoints = [[depot.lat, depot.lng], ...vanDeliveries.map((d) => [d.lat, d.lng])];
      if (waypoints.length > 1) {
        const geom = await fetchOsrmRoute(waypoints);
        if (!isCancelled) {
          setRouteGeometries((prev) => ({
            ...prev,
            [van.id]: geom
          }));
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [vans, activeDeliveries, depot]);

  // Fetch preview option road geometry when hovered
  useEffect(() => {
    if (!previewOption) {
      setPreviewGeometries({});
      return;
    }

    let isCancelled = false;
    vans.forEach(async (van) => {
      const proposedDeliveries = (previewOption.proposedDeliveries || [])
        .filter((d) => d.assignedVan === van.id)
        .sort((a, b) => (a.routeOrder || 0) - (b.routeOrder || 0));

      const waypoints = [[depot.lat, depot.lng], ...proposedDeliveries.map((d) => [d.lat, d.lng])];
      if (waypoints.length > 1) {
        const geom = await fetchOsrmRoute(waypoints);
        if (!isCancelled) {
          setPreviewGeometries((prev) => ({
            ...prev,
            [van.id]: geom
          }));
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [previewOption, vans, depot]);

  // Build route lines for each van
  const routesPerVan = vans.map((van) => {
    const vanDeliveries = activeDeliveries
      .filter((d) => d.assignedVan === van.id)
      .sort((a, b) => (a.routeOrder || 0) - (b.routeOrder || 0));

    const waypoints = [[depot.lat, depot.lng], ...vanDeliveries.map((d) => [d.lat, d.lng])];

    const isBroken = disruptions.some(
      (d) => d.type === 'breakdown' && d.vanId === van.id && d.active !== false
    );
    const hasBlockedStop = vanDeliveries.some((d) => d.isBlocked);
    const hasReroutedStop = vanDeliveries.some((d) => d.isRerouted);

    let routeColor = van.color;
    if (isBroken || hasBlockedStop) {
      routeColor = '#ef4444'; // Red
    } else if (hasReroutedStop) {
      routeColor = '#06b6d4'; // Cyan/Blue
    }

    return {
      van,
      waypoints,
      color: routeColor,
      isBroken,
      count: vanDeliveries.length
    };
  });

  // Calculate approximate simulated van location
  const getVanPosition = (van) => {
    const vanDeliveries = deliveries
      .filter((d) => d.assignedVan === van.id)
      .sort((a, b) => (a.routeOrder || 0) - (b.routeOrder || 0));
    
    // If van completed some, put near latest completed or first stop
    const completed = vanDeliveries.filter((d) => d.isCompleted);
    if (completed.length > 0) {
      const lastDone = completed[completed.length - 1];
      return [lastDone.lat + 0.002, lastDone.lng + 0.002];
    }
    // Else near depot with small offset
    const offsetMap = { V1: [-0.003, -0.003], V2: [0.003, -0.003], V3: [-0.003, 0.003], V4: [0.003, 0.003] };
    const offset = offsetMap[van.id] || [0, 0];
    return [depot.lat + offset[0], depot.lng + offset[1]];
  };

  return (
    <div 
      className="relative isolate w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner"
      style={{ position: 'relative', zIndex: 0, isolation: 'isolate' }}
    >
      <MapContainer
        center={[11.0168, 76.9658]}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full relative z-0"
        style={{ position: 'relative', zIndex: 0 }}
      >
        <MapController selectedDelivery={selectedDelivery} depot={depot} deliveries={deliveries} />
        <FitAllControl depot={depot} deliveries={deliveries} />

        {/* Clean Dark CartoDB / OSM tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Closed road segment warning polylines with visible label */}
        {roads.map((road) => {
          const isClosed = disruptions.some(
            (d) => d.type === 'road_closure' && d.roadId === road.id && d.active !== false
          );
          if (!isClosed) return null;
          return (
            <Polyline
              key={`road-${road.id}`}
              positions={road.points}
              pathOptions={{
                color: '#ef4444',
                weight: 6,
                dashArray: '8, 8',
                opacity: 0.95
              }}
            >
              <Tooltip permanent direction="top" className="bg-rose-950 text-rose-200 border border-rose-500 font-mono text-[10px] px-1.5 py-0.5 rounded shadow-lg font-bold">
                CLOSED: {road.name}
              </Tooltip>
              <Popup>
                <div className="p-2 text-xs">
                  <div className="font-bold text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    CLOSED: {road.name}
                  </div>
                  <div className="text-slate-300 mt-1">
                    Alternate route: <span className="text-white font-medium">{road.alternateRoute}</span> (+{road.extraMinutes}m)
                  </div>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* Severe weather zone translucent blue overlay over North Coimbatore */}
        {disruptions.some((d) => d.type === 'weather' && d.active !== false) && (
          <Polygon
            positions={[
              [11.0950, 76.9950],
              [11.0850, 76.9300],
              [11.0200, 76.9850],
              [11.0350, 77.0200]
            ]}
            pathOptions={{
              color: '#0284c7',
              fillColor: '#38bdf8',
              fillOpacity: 0.25,
              weight: 2,
              dashArray: '6, 6'
            }}
          >
            <Tooltip permanent direction="center" className="bg-sky-950 text-sky-200 border border-sky-500 font-mono text-[10px] px-2 py-0.5 rounded shadow font-bold">
              North Coimbatore Rain Zone (1.4x Delay)
            </Tooltip>
            <Popup>
              <div className="p-2 text-xs">
                <div className="font-bold text-sky-400">North Coimbatore Heavy Rain Zone</div>
                <div className="text-slate-300 mt-0.5">Saravanampatti, Thudiyalur, Peelamedu • 1.4x Transit Delay</div>
              </div>
            </Popup>
          </Polygon>
        )}

        {/* Van Routes Polylines */}
        {routesPerVan.map(({ van, waypoints, color, isBroken }) => (
          <React.Fragment key={`route-${van.id}`}>
            <Polyline
              positions={routeGeometries[van.id] || waypoints}
              pathOptions={{
                color,
                weight: isBroken ? 3 : 4,
                opacity: previewOption ? 0.4 : 0.85,
                dashArray: isBroken ? '6, 6' : undefined
              }}
            />
          </React.Fragment>
        ))}

        {/* Preview Option Ghosted Polylines */}
        {previewOption && (
          <>
            {vans.map((van) => {
              const proposedDeliveries = (previewOption.proposedDeliveries || [])
                .filter((d) => d.assignedVan === van.id)
                .sort((a, b) => (a.routeOrder || 0) - (b.routeOrder || 0));
              const waypoints = [[depot.lat, depot.lng], ...proposedDeliveries.map((d) => [d.lat, d.lng])];
              return (
                <Polyline
                  key={`preview-route-${van.id}`}
                  positions={previewGeometries[van.id] || waypoints}
                  pathOptions={{
                    color: '#38bdf8',
                    weight: 5,
                    dashArray: '4, 8',
                    opacity: 0.95
                  }}
                />
              );
            })}
          </>
        )}

        {/* Central Depot Marker */}
        <Marker position={[depot.lat, depot.lng]} icon={createDepotIcon()}>
          <Popup>
            <div className="p-3 text-xs">
              <div className="font-bold text-sm text-blue-400 flex items-center gap-1.5">
                <Package className="h-4 w-4" />
                {depot.name}
              </div>
              <p className="text-slate-400 mt-1">Fleet Dispatch Hub & Inventory Terminal</p>
              <div className="mt-2 text-[11px] text-slate-300 font-mono">
                Lat: {depot.lat.toFixed(4)}, Lng: {depot.lng.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Simulated Van Markers */}
        {vans.map((van) => {
          const isBroken = disruptions.some(
            (d) => d.type === 'breakdown' && d.vanId === van.id && d.active !== false
          );
          return (
            <Marker
              key={`van-marker-${van.id}`}
              position={getVanPosition(van)}
              icon={createVanIcon(van, isBroken)}
            >
              <Popup>
                <div className="p-2.5 text-xs">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>{van.name} ({van.id})</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${isBroken ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {isBroken ? 'Breakdown' : 'Active'}
                    </span>
                  </div>
                  <div className="mt-1.5 space-y-1 text-slate-300">
                    <div>Driver: <span className="text-white font-medium">{van.driver}</span></div>
                    <div>Capacity: <span className="font-mono text-white">{van.capacity} units</span></div>
                    <div>Shift End: <span className="font-mono text-white">{van.shiftEnd}</span></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Delivery Stop Markers */}
        {deliveries.map((delivery) => {
          const isSelected = selectedDeliveryId === delivery.id;
          const impactItem = impactData?.allAffectedList?.find((item) => item.id === delivery.id);
          return (
            <Marker
              key={`delivery-${delivery.id}`}
              position={[delivery.lat, delivery.lng]}
              icon={createDeliveryIcon(delivery, isSelected, impactItem)}
              eventHandlers={{
                click: () => setSelectedDeliveryId(delivery.id)
              }}
            >
              <Popup>
                <div className="p-3 text-xs min-w-[210px]">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/80 mb-2">
                    <span className="font-mono font-bold text-white text-sm">
                      {delivery.id} • {delivery.customer}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono"
                      style={{
                        backgroundColor: `${STATUS_COLORS[delivery.status]}25`,
                        color: STATUS_COLORS[delivery.status],
                        border: `1px solid ${STATUS_COLORS[delivery.status]}50`
                      }}
                    >
                      {delivery.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Area:</span>
                      <span className="font-medium text-slate-200">{delivery.area}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Time Window:</span>
                      <span className="font-mono text-slate-200">{delivery.timeWindow}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimated Arrival:</span>
                      <span className={`font-mono font-bold ${delivery.isLate ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {delivery.eta} {delivery.isLate ? `(+${delivery.delayMinutes}m late)` : delivery.waitingMinutes > 0 ? `(waits ${delivery.waitingMinutes}m)` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assigned Van:</span>
                      <span className="font-semibold text-white">{delivery.assignedVan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Priority:</span>
                      <span className={`font-bold capitalize ${delivery.priority === 'critical' ? 'text-rose-400' : delivery.priority === 'high' ? 'text-amber-400' : 'text-slate-300'}`}>
                        {delivery.priority}
                      </span>
                    </div>
                    {delivery.isRerouted && (
                      <div className="flex justify-between items-center text-[11px] text-sky-400 bg-sky-950/40 px-2 py-1 rounded border border-sky-800/40 font-mono">
                        <span>Recovery:</span>
                        <span className="font-bold">Rerouted {delivery.previousVan ? `(from ${delivery.previousVan})` : ''}</span>
                      </div>
                    )}
                    {delivery.dependsOn && (
                      <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[11px] text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        <span>Depends on: <strong className="font-mono">{delivery.dependsOn}</strong></span>
                      </div>
                    )}
                    {delivery.notes && (
                      <div className="text-[10px] text-slate-400 italic pt-1">
                        "{delivery.notes}"
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 text-[11px] shadow-lg flex flex-wrap items-center gap-3">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-slate-300">On Track</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-slate-300">At Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span className="text-slate-300">Critical / Blocked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
          <span className="text-slate-300">Rerouted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
          <span className="text-slate-400">Completed</span>
        </div>
      </div>
    </div>
  );
}
