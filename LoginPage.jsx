import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  ShieldCheck, 
  Truck, 
  Volume2, 
  AlertCircle, 
  ArrowLeft, 
  LogIn, 
  KeyRound, 
  Delete, 
  RotateCcw,
  CheckCircle2,
  Sparkles,
  MapPin,
  Compass
} from 'lucide-react';
import { speakText } from '../voice/useSpeechOutput';
import { useLogisticsStore } from '../store/logisticsStore';

// Hardcoded demo credentials (Demo only, never stored in database or localStorage)
export const DEMO_CREDENTIALS = {
  logistics: {
    username: 'planner',
    password: 'demo123',
    role: 'logistics',
    name: 'Logistics Planner'
  },
  operator: {
    pin: '1234',
    role: 'operator'
  }
};

const DRIVERS = [
  { id: 'V1', name: 'Van 1', driver: 'Karthik R.', color: '#3b82f6', initials: 'KR', area: 'Gandhipuram' },
  { id: 'V2', name: 'Van 2', driver: 'Muthu S.', color: '#f59e0b', initials: 'MS', area: 'Peelamedu' },
  { id: 'V3', name: 'Van 3', driver: 'Suresh P.', color: '#10b981', initials: 'SP', area: 'RS Puram' },
  { id: 'V4', name: 'Van 4', driver: 'Dinesh K.', color: '#8b5cf6', initials: 'DK', area: 'Saravanampatti' }
];

const I18N = {
  en: {
    tagline: 'Smarter decisions. Smoother deliveries.',
    hub: 'Coimbatore Hub Operations',
    selectRole: 'Select Your Access Role',
    selectRoleSub: 'Choose your workspace view for Coimbatore Hub fleet operations',
    logisticsRole: 'Logistics Team',
    logisticsDesc: 'Full fleet oversight, schedule optimization, and multi-vehicle routing',
    operatorRole: 'Operator',
    operatorDesc: 'Van driver portal, rapid disruption reporting, and simple execution',
    readAloudRole: (role) => `Read ${role} label aloud`,
    backToRoles: 'Back to role selection',
    logisticsSignIn: 'Logistics Team Sign In',
    logisticsSignInSub: 'Enter planner credentials to access central dispatch control',
    usernameLabel: 'Username',
    usernamePlaceholder: 'planner',
    passwordLabel: 'Password',
    passwordPlaceholder: 'demo123',
    signInBtn: 'Sign In',
    continueDemo: 'Continue with demo account',
    demoNote: 'Demo only',
    demoLogisticsInfo: 'Demo account: planner / demo123 (Demo only)',
    invalidLogistics: 'Invalid username or password. Please use planner / demo123',
    operatorSignIn: 'Operator / Driver Access',
    operatorSignInSub: 'Select your vehicle and enter your 4-digit driver PIN',
    selectDriver: 'Select Van Driver',
    pinLabel: '4-Digit Driver PIN',
    pinKeypadHint: 'Tap numbers below to enter your PIN',
    clearPin: 'Clear',
    deleteDigit: 'Backspace',
    demoOperatorInfo: 'Operator PIN: 1234 for every driver (Demo only)',
    invalidOperator: 'Incorrect PIN. Please enter 1234',
    confirmPinBtn: 'Enter PIN to Sign In',
    tapDriverToSelect: 'Tap to select driver'
  },
  ta: {
    tagline: 'சிறந்த முடிவுகள். தடையற்ற டெலிவரிகள்.',
    hub: 'கோயம்புத்தூர் மைய செயல்பாடுகள்',
    selectRole: 'உங்கள் அணுகல் பாத்திரத்தைத் தேர்ந்தெடுக்கவும்',
    selectRoleSub: 'கோயம்புத்தூர் விநியோக நெட்வொர்க்கை நிர்வகிக்க உங்கள் தளத்தைத் தேர்ந்தெடுக்கவும்',
    logisticsRole: 'லாஜிஸ்டிக்ஸ் குழு',
    logisticsDesc: 'முழு வாகன கண்காணிப்பு, அட்டவணை உகப்பாக்கம் மற்றும் வழித்தட திட்டமிடல்',
    operatorRole: 'இயக்குனர்',
    operatorDesc: 'வாகன ஓட்டுநர் தளம், விரைவான இடையூறு அறிக்கை மற்றும் எளிய செயல்பாடுகள்',
    readAloudRole: (role) => `${role} ஒலி வடிவில் கேட்க`,
    backToRoles: 'பாத்திர தேர்வுக்குத் திரும்பு',
    logisticsSignIn: 'லாஜிஸ்டிக்ஸ் குழு உள்நுழைவு',
    logisticsSignInSub: 'மத்திய கட்டுப்பாட்டு அறையை அணுக ஒருங்கிணைப்பாளர் சான்றுகளை உள்ளிடவும்',
    usernameLabel: 'பயனர்பெயர்',
    usernamePlaceholder: 'planner',
    passwordLabel: 'கடவுச்சொல்',
    passwordPlaceholder: 'demo123',
    signInBtn: 'உள்நுழைய',
    continueDemo: 'டெமோ கணக்கில் தொடரவும்',
    demoNote: 'டெமோ மட்டும்',
    demoLogisticsInfo: 'டெமோ கணக்கு: planner / demo123 (டெமோ மட்டும்)',
    invalidLogistics: 'தவறான பயனர்பெயர் அல்லது கடவுச்சொல். planner / demo123 பயன்படுத்தவும்',
    operatorSignIn: 'இயக்குனர் / ஓட்டுநர் அணுகல்',
    operatorSignInSub: 'உங்கள் வாகனத்தைத் தேர்ந்தெடுத்து 4 இலக்க பின்னை உள்ளிடவும்',
    selectDriver: 'ஓட்டுநர் & வாகனத்தைத் தேர்ந்தெடுக்கவும்',
    pinLabel: '4 இலக்க ஓட்டுநர் பின் (PIN)',
    pinKeypadHint: 'பின்னை உள்ளிட கீழே உள்ள எண்களைத் தட்டவும்',
    clearPin: 'அழி',
    deleteDigit: 'பின்தள்ளு',
    demoOperatorInfo: 'அனைத்து ஓட்டுநர்களுக்கும் பின்: 1234 (டெமோ மட்டும்)',
    invalidOperator: 'தவறான பின். 1234 ஐ உள்ளிடவும்',
    confirmPinBtn: 'உள்நுழைய பின்னை உள்ளிடவும்',
    tapDriverToSelect: 'ஓட்டுநரைத் தேர்ந்தெடுக்க தட்டவும்'
  }
};

export default function LoginPage({ onLogin }) {
  const { setVoiceLang } = useLogisticsStore();
  
  // Step 1: 'select_role', Step 2a: 'logistics', Step 2b: 'operator'
  const [step, setStep] = useState('select_role');
  const [lang, setLang] = useState('en'); // 'en' | 'ta'

  // Logistics form state
  const [logisticsUsername, setLogisticsUsername] = useState('');
  const [logisticsPassword, setLogisticsPassword] = useState('');
  const [logisticsError, setLogisticsError] = useState('');
  const [logisticsShaking, setLogisticsShaking] = useState(false);

  // Operator state
  const [selectedDriver, setSelectedDriver] = useState(DRIVERS[0]);
  const [enteredPin, setEnteredPin] = useState('');
  const [operatorError, setOperatorError] = useState('');
  const [operatorShaking, setOperatorShaking] = useState(false);

  const t = I18N[lang];

  // Update voice language in store when toggle switches
  const handleToggleLang = (newLang) => {
    setLang(newLang);
    try {
      setVoiceLang(newLang === 'ta' ? 'ta-IN' : 'en-IN');
    } catch (err) {
      console.warn('[Voice] Language toggle error:', err);
    }
  };

  // Safe voice readout
  const handleSpeakRole = (roleKey, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const isTa = lang === 'ta';
      const textEn = roleKey === 'logistics' 
        ? 'Logistics Team. Full fleet oversight and route optimization.' 
        : 'Operator. Van driver portal and quick incident reporting.';
      const textTa = roleKey === 'logistics'
        ? 'லாஜிஸ்டிக்ஸ் குழு. முழு வாகன கண்காணிப்பு மற்றும் வழித்தட திட்டமிடல்.'
        : 'இயக்குனர். விரைவான இடையூறு அறிக்கை மற்றும் எளிய செயல்பாடுகள்.';
      speakText(textEn, textTa);
    } catch (err) {
      console.warn('[Login Voice] Speech synthesis error:', err);
    }
  };

  // ── Logistics Login Handlers ──
  const handleLogisticsSubmit = (e) => {
    e.preventDefault();
    setLogisticsError('');

    if (
      logisticsUsername.trim().toLowerCase() === DEMO_CREDENTIALS.logistics.username &&
      logisticsPassword === DEMO_CREDENTIALS.logistics.password
    ) {
      onLogin({
        role: 'logistics',
        name: DEMO_CREDENTIALS.logistics.name,
        username: DEMO_CREDENTIALS.logistics.username
      });
    } else {
      setLogisticsError(t.invalidLogistics);
      setLogisticsShaking(true);
      setTimeout(() => setLogisticsShaking(false), 500);
      setLogisticsPassword('');
    }
  };

  const handleLogisticsDemoContinue = () => {
    onLogin({
      role: 'logistics',
      name: DEMO_CREDENTIALS.logistics.name,
      username: DEMO_CREDENTIALS.logistics.username
    });
  };

  // ── Operator PIN Handlers ──
  const handleKeypadPress = (digit) => {
    setOperatorError('');
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      if (nextPin.length === 4) {
        validatePin(nextPin);
      }
    }
  };

  const handleKeypadClear = () => {
    setEnteredPin('');
    setOperatorError('');
  };

  const handleKeypadBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setOperatorError('');
  };

  const validatePin = (pinToTest) => {
    if (pinToTest === DEMO_CREDENTIALS.operator.pin) {
      onLogin({
        role: 'operator',
        name: selectedDriver.driver,
        vanId: selectedDriver.id,
        driverInfo: selectedDriver
      });
    } else {
      setOperatorError(t.invalidOperator);
      setOperatorShaking(true);
      setTimeout(() => {
        setOperatorShaking(false);
        setEnteredPin('');
      }, 500);
    }
  };

  const handleOperatorDemoContinue = () => {
    onLogin({
      role: 'operator',
      name: selectedDriver.driver,
      vanId: selectedDriver.id,
      driverInfo: selectedDriver
    });
  };

  // Physical keyboard listener for PIN when on operator screen
  useEffect(() => {
    if (step !== 'operator') return;

    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        handleKeypadBackspace();
      } else if (e.key === 'Escape') {
        handleKeypadClear();
      } else if (e.key === 'Enter' && enteredPin.length === 4) {
        validatePin(enteredPin);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, enteredPin, selectedDriver]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* ── MAP-THEMED BACKGROUND ── */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="login-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#334155" strokeWidth="0.8" opacity="0.6" />
              <circle cx="60" cy="60" r="1.5" fill="#38bdf8" opacity="0.4" />
            </pattern>
            <linearGradient id="route-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="route-gradient-2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-grid)" />
          
          {/* Simulated Hub Transit Routes */}
          <path d="M 120,240 Q 380,120 640,320 T 1100,260 T 1600,480" fill="none" stroke="url(#route-gradient-1)" strokeWidth="2.5" strokeDasharray="6,4" />
          <path d="M 200,680 Q 550,520 880,740 T 1350,600 T 1800,820" fill="none" stroke="url(#route-gradient-2)" strokeWidth="2" strokeDasharray="8,6" />
          
          {/* Glowing Hub Nodes */}
          <circle cx="380" cy="120" r="6" fill="#38bdf8" />
          <circle cx="640" cy="320" r="8" fill="#3b82f6" opacity="0.8" />
          <circle cx="1100" cy="260" r="6" fill="#06b6d4" />
          <circle cx="880" cy="740" r="7" fill="#f59e0b" />
          <circle cx="1350" cy="600" r="6" fill="#10b981" />
        </svg>
      </div>

      {/* Subtle radial glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[350px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* ── TOP BAR: Brand & Language Toggle ── */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Layers className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white font-mono">
                DISRUPTION<span className="text-blue-400">DESK</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30">
                v1.0 Live
              </span>
            </div>
            <p className="text-xs text-slate-400">{t.hub}</p>
          </div>
        </div>

        {/* EN / தமிழ் Toggle (Min 48px touch target) */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            type="button"
            onClick={() => handleToggleLang('en')}
            aria-label="Switch language to English"
            className={`min-h-[48px] px-4 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              lang === 'en'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => handleToggleLang('ta')}
            aria-label="Switch language to Tamil"
            className={`min-h-[48px] px-4 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              lang === 'ta'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            தமிழ்
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 w-full max-w-5xl mx-auto">
        {/* DisruptionDesk Tagline Hero */}
        <div className="text-center mb-6 max-w-xl">
          <p className="text-sm font-semibold tracking-widest uppercase text-blue-400 mb-1">
            Dispatch Decision Automation
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            DisruptionDesk
          </h1>
          <p className="text-base text-slate-300 mt-1 font-medium">
            "{t.tagline}"
          </p>
        </div>

        {/* ════════════════════════════════════════════════════════════
            STEP 1: TWO BIG ROLE TILES (Logistics Team & Operator)
           ════════════════════════════════════════════════════════════ */}
        {step === 'select_role' && (
          <div className="w-full max-w-3xl bg-slate-900/80 backdrop-blur-md border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {t.selectRole}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {t.selectRoleSub}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Tile 1: Logistics Team (min 120px tall, 18px+ text) */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setStep('logistics')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setStep('logistics'); }}
                aria-label="Select Logistics Team role"
                className="group relative flex flex-col justify-between p-6 rounded-2xl border-2 border-slate-700/80 hover:border-blue-500 bg-gradient-to-br from-slate-900/90 via-slate-900 to-blue-950/20 hover:from-slate-900 hover:to-blue-950/40 cursor-pointer transition-all duration-200 min-h-[140px] shadow-lg hover:shadow-blue-950/40 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="p-3 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-7 w-7 text-blue-400" />
                  </div>

                  {/* Speaker Button on tile (reads label aloud in EN/Tamil) */}
                  <button
                    type="button"
                    onClick={(e) => handleSpeakRole('logistics', e)}
                    aria-label={t.readAloudRole(t.logisticsRole)}
                    title={t.readAloudRole(t.logisticsRole)}
                    className="min-h-[48px] min-w-[48px] p-2.5 rounded-xl bg-slate-800/80 hover:bg-blue-600 text-slate-300 hover:text-white border border-slate-700/80 hover:border-blue-500 transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-90"
                  >
                    <Volume2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                      {t.logisticsRole}
                    </h3>
                    <span className="text-xs font-mono text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                      Planner
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {t.logisticsDesc}
                  </p>
                </div>
              </div>

              {/* Tile 2: Operator (min 120px tall, 18px+ text) */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setStep('operator')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setStep('operator'); }}
                aria-label="Select Operator role"
                className="group relative flex flex-col justify-between p-6 rounded-2xl border-2 border-slate-700/80 hover:border-amber-500 bg-gradient-to-br from-slate-900/90 via-slate-900 to-amber-950/20 hover:from-slate-900 hover:to-amber-950/40 cursor-pointer transition-all duration-200 min-h-[140px] shadow-lg hover:shadow-amber-950/40 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">
                    <Truck className="h-7 w-7 text-amber-400" />
                  </div>

                  {/* Speaker Button on tile (reads label aloud in EN/Tamil) */}
                  <button
                    type="button"
                    onClick={(e) => handleSpeakRole('operator', e)}
                    aria-label={t.readAloudRole(t.operatorRole)}
                    title={t.readAloudRole(t.operatorRole)}
                    className="min-h-[48px] min-w-[48px] p-2.5 rounded-xl bg-slate-800/80 hover:bg-amber-600 text-slate-300 hover:text-white border border-slate-700/80 hover:border-amber-500 transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-90"
                  >
                    <Volume2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {t.operatorRole}
                    </h3>
                    <span className="text-xs font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      Driver PIN
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {t.operatorDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Demo Credentials Footer Note */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-semibold text-[11px] border border-slate-700">
                  {t.demoNote}
                </span>
                <span>Logistics: <strong className="text-slate-200 font-mono">planner / demo123</strong> • Operator: <strong className="text-slate-200 font-mono">PIN 1234</strong></span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Simulated Coimbatore Depot</span>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            STEP 2a: LOGISTICS TEAM SIGN IN
           ════════════════════════════════════════════════════════════ */}
        {step === 'logistics' && (
          <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl">
            {/* Back to Step 1 */}
            <button
              type="button"
              onClick={() => {
                setStep('select_role');
                setLogisticsError('');
              }}
              aria-label={t.backToRoles}
              className="min-h-[48px] px-3 -ml-3 mb-2 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t.backToRoles}</span>
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {t.logisticsSignIn}
                </h2>
                <p className="text-xs text-slate-400">
                  {t.logisticsSignInSub}
                </p>
              </div>
            </div>

            {/* Error Message with Shake Animation */}
            {logisticsError && (
              <div className={`mb-4 p-3.5 rounded-xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 text-xs flex items-center gap-2.5 shadow-lg ${logisticsShaking ? 'animate-shake' : ''}`}>
                <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                <span className="font-semibold">{logisticsError}</span>
              </div>
            )}

            <form onSubmit={handleLogisticsSubmit} className="space-y-4">
              <div>
                <label 
                  htmlFor="logistics-username"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  {t.usernameLabel}
                </label>
                <input
                  id="logistics-username"
                  type="text"
                  value={logisticsUsername}
                  onChange={(e) => {
                    setLogisticsUsername(e.target.value);
                    setLogisticsError('');
                  }}
                  placeholder={t.usernamePlaceholder}
                  autoComplete="username"
                  className="w-full min-h-[48px] px-4 rounded-xl bg-slate-950 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-500 text-sm font-mono outline-none transition"
                />
              </div>

              <div>
                <label 
                  htmlFor="logistics-password"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  {t.passwordLabel}
                </label>
                <input
                  id="logistics-password"
                  type="password"
                  value={logisticsPassword}
                  onChange={(e) => {
                    setLogisticsPassword(e.target.value);
                    setLogisticsError('');
                  }}
                  placeholder={t.passwordPlaceholder}
                  autoComplete="current-password"
                  className="w-full min-h-[48px] px-4 rounded-xl bg-slate-950 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-500 text-sm font-mono outline-none transition"
                />
              </div>

              {/* Sign in button (Min 48px, Enter submits) */}
              <button
                type="submit"
                aria-label={t.signInBtn}
                className="w-full min-h-[48px] rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white shadow-lg shadow-blue-900/30 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <LogIn className="h-4 w-4" />
                <span>{t.signInBtn}</span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-400 font-mono">or demo access</span>
              </div>
            </div>

            {/* Large "Continue with demo account" button (Min 48px) */}
            <button
              type="button"
              onClick={handleLogisticsDemoContinue}
              aria-label={t.continueDemo}
              className="w-full min-h-[48px] rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 hover:text-white border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>{t.continueDemo}</span>
            </button>

            {/* Demo credentials note */}
            <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                <span className="text-slate-400 font-semibold">{t.demoLogisticsInfo}</span>
              </p>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            STEP 2b: OPERATOR / DRIVER ACCESS WITH 4-DIGIT PIN KEYPAD
           ════════════════════════════════════════════════════════════ */}
        {step === 'operator' && (
          <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-md border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl">
            {/* Back to Step 1 */}
            <button
              type="button"
              onClick={() => {
                setStep('select_role');
                setOperatorError('');
                setEnteredPin('');
              }}
              aria-label={t.backToRoles}
              className="min-h-[48px] px-3 -ml-3 mb-2 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t.backToRoles}</span>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {t.operatorSignIn}
                </h2>
                <p className="text-xs text-slate-400">
                  {t.operatorSignInSub}
                </p>
              </div>
            </div>

            {/* Avatar tiles for the van drivers */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                {t.selectDriver}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {DRIVERS.map((d) => {
                  const isSelected = selectedDriver.id === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setSelectedDriver(d);
                        setEnteredPin('');
                        setOperatorError('');
                      }}
                      aria-label={`Select driver ${d.driver} for ${d.name}`}
                      className={`min-h-[58px] p-2.5 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/15 shadow-md shadow-amber-950/30'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white mb-1 shadow-sm"
                        style={{ backgroundColor: d.color }}
                      >
                        {d.initials}
                      </div>
                      <span className={`text-xs font-bold truncate max-w-full ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {d.driver}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {d.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Message with Shake Animation */}
            {operatorError && (
              <div className={`mb-4 p-3.5 rounded-xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 text-xs flex items-center gap-2.5 shadow-lg ${operatorShaking ? 'animate-shake' : ''}`}>
                <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                <span className="font-semibold">{operatorError}</span>
              </div>
            )}

            {/* PIN Display (4 Digit Dots) */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                  <span>{t.pinLabel}</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  Driver: {selectedDriver.driver} ({selectedDriver.name})
                </span>
              </div>

              {/* 4-digit indicators (Min 48px height) */}
              <div className="flex items-center justify-center gap-3 py-2 bg-slate-950 rounded-xl border border-slate-800 min-h-[54px]">
                {[0, 1, 2, 3].map((index) => {
                  const isFilled = enteredPin.length > index;
                  return (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded-full border-2 transition-all ${
                        isFilled
                          ? 'bg-amber-400 border-amber-300 scale-110 shadow-sm shadow-amber-400/50'
                          : 'bg-slate-900 border-slate-700'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Large 4-digit PIN Keypad (min 64px keys, works by tap) */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(String(num))}
                  aria-label={`Keypad ${num}`}
                  className="min-h-[64px] min-w-[64px] rounded-xl bg-slate-950/90 hover:bg-slate-800 active:bg-amber-500/20 active:border-amber-400 border border-slate-800 hover:border-slate-700 text-2xl font-bold font-mono text-white transition-all shadow-md flex items-center justify-center cursor-pointer active:scale-95"
                >
                  {num}
                </button>
              ))}

              {/* Clear button */}
              <button
                type="button"
                onClick={handleKeypadClear}
                aria-label={t.clearPin}
                title={t.clearPin}
                className="min-h-[64px] min-w-[64px] rounded-xl bg-slate-950/90 hover:bg-slate-800 active:bg-rose-900/30 border border-slate-800 text-xs font-bold font-mono text-slate-400 hover:text-white transition-all shadow-md flex items-center justify-center cursor-pointer active:scale-95"
              >
                {t.clearPin}
              </button>

              {/* 0 Key */}
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                aria-label="Keypad 0"
                className="min-h-[64px] min-w-[64px] rounded-xl bg-slate-950/90 hover:bg-slate-800 active:bg-amber-500/20 active:border-amber-400 border border-slate-800 hover:border-slate-700 text-2xl font-bold font-mono text-white transition-all shadow-md flex items-center justify-center cursor-pointer active:scale-95"
              >
                0
              </button>

              {/* Backspace button */}
              <button
                type="button"
                onClick={handleKeypadBackspace}
                aria-label={t.deleteDigit}
                title={t.deleteDigit}
                className="min-h-[64px] min-w-[64px] rounded-xl bg-slate-950/90 hover:bg-slate-800 active:bg-amber-500/20 border border-slate-800 text-slate-400 hover:text-white transition-all shadow-md flex items-center justify-center cursor-pointer active:scale-95"
              >
                <Delete className="h-6 w-6" />
              </button>
            </div>

            {/* Large "Continue with demo account" button (Min 48px) */}
            <button
              type="button"
              onClick={handleOperatorDemoContinue}
              aria-label={t.continueDemo}
              className="w-full min-h-[48px] rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 hover:text-white border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>{t.continueDemo}</span>
            </button>

            {/* Demo credentials note */}
            <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                <span className="text-slate-400 font-semibold">{t.demoOperatorInfo}</span>
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-4 py-4 text-center text-xs text-slate-400 border-t border-slate-900">
        DisruptionDesk Demo • No external database or credentials stored • React session state only
      </footer>
    </div>
  );
}
