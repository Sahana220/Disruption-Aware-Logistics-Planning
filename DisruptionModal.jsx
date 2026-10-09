import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLogisticsStore } from '../store/logisticsStore';
import { 
  X, 
  AlertTriangle, 
  Truck, 
  Slash, 
  CloudRain, 
  UserCheck, 
  Sparkles, 
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import VoiceInputButton from './VoiceInputButton';

/* ── Simple Mode step-based wizard for Operators & Drivers ── */
function SimpleModeWizard({ onClose, vans, roads, deliveries, currentTime, setTime, reportDisruption }) {
  const [step, setStep] = useState('type'); // type | detail | duration
  const [chosenType, setChosenType] = useState(null); // breakdown | road | weather | customer
  const [chosenDetail, setChosenDetail] = useState(null); // V1..V4 | R1..R3 | null
  const [chosenDuration, setChosenDuration] = useState(null); // '30' | '60' | 'out'

  const vanColors = { V1: '#3b82f6', V2: '#f59e0b', V3: '#10b981', V4: '#8b5cf6' };

  const typeCards = [
    { id: 'breakdown', label: 'Vehicle Breakdown', icon: Truck, color: 'rose', desc: 'A delivery van broke down' },
    { id: 'road', label: 'Road Closed', icon: Slash, color: 'amber', desc: 'Corridor or road blocked' },
    { id: 'weather', label: 'Heavy Rain', icon: CloudRain, color: 'cyan', desc: 'Severe weather delay' },
    { id: 'customer', label: 'Customer Change', icon: UserCheck, color: 'violet', desc: 'Reschedule or cancel stop' }
  ];

  const colorMap = {
    rose: { bg: 'bg-rose-500/15', border: 'border-rose-500/40', activeBg: 'bg-rose-600', text: 'text-rose-300', activeText: 'text-white', iconBg: 'bg-rose-500/20' },
    amber: { bg: 'bg-amber-500/15', border: 'border-amber-500/40', activeBg: 'bg-amber-600', text: 'text-amber-300', activeText: 'text-white', iconBg: 'bg-amber-500/20' },
    cyan: { bg: 'bg-cyan-500/15', border: 'border-cyan-500/40', activeBg: 'bg-cyan-600', text: 'text-cyan-300', activeText: 'text-white', iconBg: 'bg-cyan-500/20' },
    violet: { bg: 'bg-violet-500/15', border: 'border-violet-500/40', activeBg: 'bg-violet-600', text: 'text-violet-300', activeText: 'text-white', iconBg: 'bg-violet-500/20' }
  };

  const handleTypeSelect = (typeId) => {
    setChosenType(typeId);
    if (typeId === 'weather') {
      setChosenDetail(null);
      setStep('duration');
    } else {
      setStep('detail');
    }
  };

  const handleDetailSelect = (detailId) => {
    setChosenDetail(detailId);
    setStep('duration');
  };

  const handleDurationSelect = (dur) => {
    setChosenDuration(dur);
    applySimpleDisruption(chosenType, chosenDetail, dur);
  };

  const applySimpleDisruption = (type, detail, duration) => {
    if (type === 'breakdown') {
      const v = vans.find((x) => x.id === detail);
      const durationLabel = duration === 'out' ? 'Out for the day' : `${duration} min`;
      const eventTime = detail === 'V2' ? '09:30' : currentTime;
      if (setTime) setTime(eventTime);
      reportDisruption({
        type: 'breakdown',
        vanId: detail,
        vanName: v ? v.name : detail,
        time: eventTime,
        downtime: durationLabel,
        setSimTime: eventTime
      });
    } else if (type === 'road') {
      const r = roads.find((x) => x.id === detail);
      const mins = duration === 'out' ? 480 : Number(duration);
      reportDisruption({
        type: 'road_closure',
        roadId: detail,
        roadName: r ? `${r.name} (${r.fromArea} ↔ ${r.toArea})` : detail,
        duration: `${mins} min`,
        durationMins: mins
      });
    } else if (type === 'weather') {
      const mins = duration === 'out' ? 480 : Number(duration);
      reportDisruption({
        type: 'weather',
        zone: 'North Coimbatore',
        areas: ['Saravanampatti', 'Thudiyalur', 'Peelamedu'],
        duration: `${mins} min`,
        durationMins: mins,
        multiplier: 1.4
      });
    } else if (type === 'customer') {
      const del = deliveries.find((x) => x.id === detail);
      if (duration === 'cancel') {
        reportDisruption({
          type: 'customer_change',
          deliveryId: detail,
          customer: del?.customer,
          changeAction: 'cancel',
          newTimeWindow: del?.timeWindow,
          newWindowStart: null,
          newWindowEnd: null
        });
      } else if (duration === 'urgent') {
        reportDisruption({
          type: 'customer_change',
          deliveryId: detail,
          customer: del?.customer,
          changeAction: 'urgent',
          newTimeWindow: '09:00-09:45',
          newWindowStart: '09:00',
          newWindowEnd: '09:45'
        });
      } else {
        const [ws, we] = (del?.timeWindow || '09:00-10:00').split('-');
        const offsetMins = Number(duration) || 30;
        const shiftTime = (t, m) => {
          const [hh, mm] = t.split(':').map(Number);
          const total = hh * 60 + mm + m;
          return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
        };
        reportDisruption({
          type: 'customer_change',
          deliveryId: detail,
          customer: del?.customer,
          changeAction: 'window',
          newTimeWindow: `${shiftTime(ws, offsetMins)}-${shiftTime(we, offsetMins)}`,
          newWindowStart: shiftTime(ws, offsetMins),
          newWindowEnd: shiftTime(we, offsetMins)
        });
      }
    }
    onClose();
  };

  const handleBack = () => {
    if (step === 'duration') {
      if (chosenType === 'weather') {
        setStep('type');
      } else {
        setStep('detail');
      }
    } else if (step === 'detail') {
      setStep('type');
    }
  };

  // Instant 1-click preset for Van 2 Breakdown (Main Demo)
  const handleQuickPresetVan2 = () => {
    if (setTime) setTime('09:30');
    reportDisruption({
      type: 'breakdown',
      vanId: 'V2',
      vanName: 'Van 2',
      time: '09:30',
      downtime: 'Out for the day',
      setSimTime: '09:30'
    });
    onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Quick 1-Click Preset Banner */}
      <button
        type="button"
        onClick={handleQuickPresetVan2}
        className="w-full p-3.5 rounded-xl bg-gradient-to-r from-rose-950/90 via-slate-900 to-amber-950/80 border-2 border-amber-500/50 hover:border-amber-400 text-left flex items-center justify-between transition cursor-pointer active:scale-[0.98] shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Quick Demo Scenario: Van 2 Breakdown</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300">
                09:30 AM
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Vehicle halted, 3 stops stranded. Generates multi-vehicle rerouting.
            </p>
          </div>
        </div>
        <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 whitespace-nowrap">
          Run Scenario →
        </span>
      </button>

      {/* Step Navigation / Back */}
      {step !== 'type' && (
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 min-h-[48px] px-3 -ml-3 text-sm font-semibold text-slate-300 hover:text-white transition self-start cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to previous step</span>
        </button>
      )}

      {/* Instant Voice Input: Mic (min 64px) + Language Toggle */}
      {step === 'type' && (
        <div className="mb-4 pb-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Instant Voice Report (Press & Speak)
            </h4>
            <span className="text-[11px] text-amber-300 font-medium">
              English or தமிழ்
            </span>
          </div>
          <VoiceInputButton inModal={true} onDisruptionReported={onClose} />
        </div>
      )}

      {/* STEP 1: Choose Disruption Type (Min 120px tall cards) */}
      {step === 'type' && (
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
            Step 1: Or select manual disruption category
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {typeCards.map((tc) => {
              const Icon = tc.icon;
              const cm = colorMap[tc.color];
              return (
                <button
                  key={tc.id}
                  type="button"
                  onClick={() => handleTypeSelect(tc.id)}
                  className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 transition-all cursor-pointer active:scale-95 hover:scale-[1.01] ${cm.bg} ${cm.border} hover:border-opacity-100 min-h-[120px]`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cm.iconBg}`}>
                    <Icon className={`h-6 w-6 ${cm.text}`} />
                  </div>
                  <span className="font-bold text-white text-base text-center leading-tight">
                    {tc.label}
                  </span>
                  <span className="text-xs text-slate-400 text-center">{tc.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Detail Selection */}
      {step === 'detail' && chosenType === 'breakdown' && (
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
            Step 2: Which vehicle broke down?
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {vans.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => handleDetailSelect(v.id)}
                className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-700 hover:border-blue-400 bg-slate-950 transition-all cursor-pointer active:scale-95 min-h-[72px]"
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: (vanColors[v.id] || '#3b82f6') + '25', border: `2px solid ${vanColors[v.id] || '#3b82f6'}` }}
                >
                  <Truck className="h-6 w-6" style={{ color: vanColors[v.id] || '#3b82f6' }} />
                </div>
                <div className="text-left">
                  <span className="font-bold text-white block text-base">{v.name}</span>
                  <span className="text-xs text-slate-400">{v.driver}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'detail' && chosenType === 'road' && (
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
            Step 2: Which corridor is blocked?
          </h4>
          <div className="grid grid-cols-1 gap-2.5">
            {roads.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleDetailSelect(r.id)}
                className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-slate-700 hover:border-amber-400 bg-slate-950 transition-all cursor-pointer active:scale-95 min-h-[64px]"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-amber-500/15 border border-amber-500/40">
                  <Slash className="h-5 w-5 text-amber-400" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-white block text-sm">{r.name}</span>
                  <span className="text-xs text-slate-400">{r.fromArea} ↔ {r.toArea}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'detail' && chosenType === 'customer' && (
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
            Step 2: Select the affected customer stop
          </h4>
          <div className="grid grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
            {deliveries.filter((d) => !d.isCompleted).map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => handleDetailSelect(d.id)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-slate-700 hover:border-violet-400 bg-slate-950 transition-all cursor-pointer active:scale-95 min-h-[64px]"
              >
                <span className="font-mono font-bold text-white text-sm">{d.id}</span>
                <span className="text-xs text-slate-300 text-center truncate max-w-full">{d.customer}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: Duration / Action Selection */}
      {step === 'duration' && (
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
            Step 3: Select expected impact duration
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: '30', label: '30 mins', desc: 'Temporary' },
              { id: '60', label: '1 hour', desc: 'Moderate' },
              { id: 'out', label: 'Out for day', desc: 'Full shift' }
            ].map((dur) => (
              <button
                key={dur.id}
                type="button"
                onClick={() => handleDurationSelect(dur.id)}
                className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-700 hover:border-emerald-500 bg-slate-950 hover:bg-emerald-950/20 transition-all cursor-pointer active:scale-95 min-h-[90px]"
              >
                <span className="font-bold text-white text-base">{dur.label}</span>
                <span className="text-xs text-slate-400">{dur.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Disruption Modal Component ── */
export default function DisruptionModal({ isOpen, onClose }) {
  const { reportDisruption, vans, roads, deliveries, currentTime, setTime, simpleMode } = useLogisticsStore();

  const [activeTab, setActiveTab] = useState('breakdown'); // breakdown | road | weather | customer

  // Standard modal form states
  const [selectedVan, setSelectedVan] = useState('V2');
  const [breakdownTime, setBreakdownTime] = useState(currentTime || '09:15');
  const [downtimeType, setDowntimeType] = useState('out_for_day');
  const [customDowntimeMins, setCustomDowntimeMins] = useState(120);

  const [selectedRoad, setSelectedRoad] = useState('R1');
  const [roadDurationMins, setRoadDurationMins] = useState(120);

  const [weatherActive, setWeatherActive] = useState(true);
  const [weatherDurationMins, setWeatherDurationMins] = useState(120);

  const [selectedDelivery, setSelectedDelivery] = useState('D4');
  const [customerAction, setCustomerAction] = useState('window');
  const [newWindowStart, setNewWindowStart] = useState('09:00');
  const [newWindowEnd, setNewWindowEnd] = useState('09:45');

  if (!isOpen) return null;

  // 1-Click Presets for standard modal
  const handlePresetVan2 = () => {
    if (setTime) setTime('09:30');
    reportDisruption({
      type: 'breakdown',
      vanId: 'V2',
      vanName: 'Van 2',
      time: '09:30',
      downtime: 'Out for the day',
      setSimTime: '09:30'
    });
    onClose();
  };

  const handlePresetAvinashi = () => {
    const road = roads.find((r) => r.id === 'R1');
    reportDisruption({
      type: 'road_closure',
      roadId: 'R1',
      roadName: road ? `${road.name} (${road.fromArea} ↔ ${road.toArea})` : 'Avinashi Road',
      duration: '120 min',
      durationMins: 120
    });
    onClose();
  };

  const handlePresetWeather = () => {
    reportDisruption({
      type: 'weather',
      zone: 'North Coimbatore',
      areas: ['Saravanampatti', 'Thudiyalur', 'Peelamedu'],
      duration: '120 min',
      durationMins: 120,
      multiplier: 1.4
    });
    onClose();
  };

  // Standard Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (activeTab === 'breakdown') {
      const v = vans.find((x) => x.id === selectedVan);
      reportDisruption({
        type: 'breakdown',
        vanId: selectedVan,
        vanName: v ? v.name : selectedVan,
        time: breakdownTime,
        downtime: downtimeType === 'out_for_day' ? 'Out for the day' : `${customDowntimeMins} min`,
        setSimTime: breakdownTime
      });
    } else if (activeTab === 'road') {
      const r = roads.find((x) => x.id === selectedRoad);
      reportDisruption({
        type: 'road_closure',
        roadId: selectedRoad,
        roadName: r ? `${r.name} (${r.fromArea} ↔ ${r.toArea})` : selectedRoad,
        duration: `${roadDurationMins} min`,
        durationMins: roadDurationMins
      });
    } else if (activeTab === 'weather') {
      reportDisruption({
        type: 'weather',
        zone: 'North Coimbatore',
        areas: ['Saravanampatti', 'Thudiyalur', 'Peelamedu'],
        duration: `${weatherDurationMins} min`,
        durationMins: weatherDurationMins,
        multiplier: 1.4
      });
    } else if (activeTab === 'customer') {
      const del = deliveries.find((x) => x.id === selectedDelivery);
      const targetStart = customerAction === 'urgent' ? '09:00' : newWindowStart;
      const targetEnd = customerAction === 'urgent' ? '09:45' : newWindowEnd;
      const newWindow = `${targetStart}-${targetEnd}`;

      reportDisruption({
        type: 'customer_change',
        deliveryId: selectedDelivery,
        customer: del ? del.customer : selectedDelivery,
        changeAction: customerAction,
        newTimeWindow: customerAction === 'cancel' ? del?.timeWindow : newWindow,
        newWindowStart: targetStart,
        newWindowEnd: targetEnd
      });
    }

    onClose();
  };

  // ── SIMPLE MODE MODAL (for Operator / Driver role) ──
  if (simpleMode) {
    const simpleModal = (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
        style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
      >
        <div 
          className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col relative z-[9999] max-h-[92vh] overflow-y-auto"
          style={{ position: 'relative', zIndex: 9999 }}
        >
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Report Disruption</h3>
                <p className="text-xs text-slate-400">Operator & Driver Simple Mode</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close disruption modal"
              className="min-h-[48px] min-w-[48px] p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center justify-center cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Simple Mode Content */}
          <div className="p-4 sm:p-5">
            <SimpleModeWizard
              onClose={onClose}
              vans={vans}
              roads={roads}
              deliveries={deliveries}
              currentTime={currentTime}
              setTime={setTime}
              reportDisruption={reportDisruption}
            />
          </div>
        </div>
      </div>
    );

    return typeof document !== 'undefined' ? createPortal(simpleModal, document.body) : simpleModal;
  }

  // ── STANDARD MODAL (for Logistics Team) ──
  const standardModal = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col relative z-[9999] max-h-[92vh] overflow-y-auto"
        style={{ position: 'relative', zIndex: 9999 }}
      >
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Report Real-World Disruption</h3>
              <p className="text-xs text-slate-400">Trigger simulated field exception to model recovery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[48px] min-w-[48px] p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center justify-center cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Instant Voice Report Section */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800">
          <VoiceInputButton inModal={true} onDisruptionReported={onClose} />
        </div>

        {/* 1-Click Demo Scenarios */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Recommended Demo Scenarios (1-Click)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handlePresetVan2}
              className="p-2.5 rounded-lg bg-slate-900 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-500/50 text-left transition text-xs cursor-pointer group"
            >
              <div className="font-bold text-white group-hover:text-rose-400">Van 2 Breakdown</div>
              <div className="text-[11px] text-slate-400 mt-0.5">09:30 AM • Out for day</div>
            </button>
            <button
              type="button"
              onClick={handlePresetAvinashi}
              className="p-2.5 rounded-lg bg-slate-900 hover:bg-amber-950/30 border border-slate-800 hover:border-amber-500/50 text-left transition text-xs cursor-pointer group"
            >
              <div className="font-bold text-white group-hover:text-amber-400">Avinashi Rd Blocked</div>
              <div className="text-[11px] text-slate-400 mt-0.5">2 Hours • Gandhipuram</div>
            </button>
            <button
              type="button"
              onClick={handlePresetWeather}
              className="p-2.5 rounded-lg bg-slate-900 hover:bg-cyan-950/30 border border-slate-800 hover:border-cyan-500/50 text-left transition text-xs cursor-pointer group"
            >
              <div className="font-bold text-white group-hover:text-cyan-400">North Rain Storm</div>
              <div className="text-[11px] text-slate-400 mt-0.5">1.4x Transit Delay</div>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-4 pt-2 gap-1 overflow-x-auto">
          {[
            { id: 'breakdown', label: 'Vehicle Breakdown', icon: Truck },
            { id: 'road', label: 'Road Closure', icon: Slash },
            { id: 'weather', label: 'Heavy Weather', icon: CloudRain },
            { id: 'customer', label: 'Customer Change', icon: UserCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-blue-500 text-blue-400 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          {/* 1. Breakdown Tab */}
          {activeTab === 'breakdown' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Disabled Vehicle</label>
                <select
                  value={selectedVan}
                  onChange={(e) => setSelectedVan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {vans.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.driver}) — Capacity {v.capacity}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Breakdown Time</label>
                  <input
                    type="time"
                    value={breakdownTime}
                    onChange={(e) => setBreakdownTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Expected Downtime</label>
                  <select
                    value={downtimeType}
                    onChange={(e) => setDowntimeType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="out_for_day">Out for full day</option>
                    <option value="custom">Specific Duration</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 2. Road Tab */}
          {activeTab === 'road' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Corridor Closed</label>
                <select
                  value={selectedRoad}
                  onChange={(e) => setSelectedRoad(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {roads.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.fromArea} ↔ {r.toArea})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* 3. Weather Tab */}
          {activeTab === 'weather' && (
            <div className="space-y-3">
              <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-xl">
                <h4 className="font-bold text-xs text-cyan-300">Monsoon Heavy Rain Warning</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Active in North Coimbatore corridor (Saravanampatti, Thudiyalur, Peelamedu). Transit duration multiplier set to 1.4x.
                </p>
              </div>
            </div>
          )}

          {/* 4. Customer Tab */}
          {activeTab === 'customer' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Delivery Destination</label>
                <select
                  value={selectedDelivery}
                  onChange={(e) => setSelectedDelivery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                >
                  {deliveries.filter((d) => !d.isCompleted).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.id} — {d.customer} ({d.area}) [{d.timeWindow}]
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[48px] px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30 transition cursor-pointer"
            >
              Apply Disruption
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(standardModal, document.body) : standardModal;
}
