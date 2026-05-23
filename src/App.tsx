import React, { useState, useEffect, useRef } from "react";
import { 
  Tent,
  Mountain,
  Flame,
  Sparkles,
  Music,
  MapPin,
  Clock,
  ChevronDown,
  MessageSquare,
  Share2,
  Calendar,
  Layers,
  Heart,
  Users,
  Utensils,
  Camera
} from "lucide-react";
import { EventConceptId, EventData, RsvpResponse } from "./types";
import { initialEventData } from "./data";
import AudioPlayer from "./components/AudioPlayer";
import EffectsOverlay from "./components/EffectsOverlay";
import RsvpForm from "./components/RsvpForm";

export default function App() {
  const [concept, setConcept] = useState<EventConceptId>("botanical");
  const [eventData, setEventData] = useState<EventData>(initialEventData);
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [rsvpEntries, setRsvpEntries] = useState<RsvpResponse[]>([]);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isCopied, setIsCopied] = useState(false);
  const [showFloatNav, setShowFloatNav] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  // References for scrolling calculations
  const scheduleRef = useRef<HTMLDivElement | null>(null);
  const [reachedAgendaSteps, setReachedAgendaSteps] = useState<boolean[]>([false, false, false, false]);

  // Load guest RSVPs on startup
  const refreshRsvps = async () => {
    try {
      const response = await fetch("/api/rsvp");
      if (response.ok) {
        const list = await response.json();
        setRsvpEntries(list);
      }
    } catch (err) {
      console.error("Unable to query RSVPs from Express server", err);
    }
  };

  useEffect(() => {
    refreshRsvps();
  }, []);

  // Update countdown
  useEffect(() => {
    const weddingDate = new Date(`${eventData.date}T16:00:00`).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = weddingDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setCountdown({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [eventData.date]);

  // Handle Agenda items scrolling trigger (Alpine Tech line lightning)
  useEffect(() => {
    const handleScroll = () => {
      // 1. Agenda highlight logic
      if (scheduleRef.current) {
        const rect = scheduleRef.current.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const progress = Math.max(0, Math.min(1, (viewportH - rect.top) / (rect.height + viewportH * 0.2)));
        const stepsCount = eventData.schedule.length;
        const newReached = eventData.schedule.map((_, i) => {
          const stepTrigger = (i + 0.5) / stepsCount;
          return progress > stepTrigger;
        });
        setReachedAgendaSteps(newReached);
      }

      // 2. Mobile floating navbar visibility
      if (window.scrollY > window.innerHeight * 0.6) {
        setShowFloatNav(true);
      } else {
        setShowFloatNav(false);
      }

      // 3. Current active section evaluation
      const sectionIds = [
        "hero-photo-section",
        "love-story-section",
        "schedule-section",
        "location-section",
        "dress-code-section",
        "rsvp-section"
      ];

      let current = "";
      for (const sectionId of sectionIds) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          // if section occupies central focus area of the viewport
          if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.2) {
            current = sectionId;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // run initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, [eventData.schedule]);

  // Copy Wedding hashtag action
  const handleCopyHashtag = () => {
    navigator.clipboard.writeText(eventData.contacts.hashtag);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  // Switch structure fonts and colors depending on selected concept
  const getLayoutClasses = () => {
    switch (concept) {
      case "botanical":
        return {
          fontTitle: "font-serif",
          fontMain: "font-sans font-light tracking-wide",
          bg: "bg-[#FDFDFB]",
          text: "text-[#1A2E22]",
          accentText: "text-[#8A9A5B]",
          accentBg: "bg-[#1A2E22]",
          button: "border border-[#1A2E22] hover:bg-[#1A2E22] hover:text-[#FDFDFB] rounded-none py-3.5 px-6 uppercase tracking-wider text-[11px] font-semibold transition-all duration-500",
          cardClass: "bg-white border border-[#1A2E22]/10 rounded-none p-8"
        };
      case "passion":
        return {
          fontTitle: "font-pinyon",
          fontMain: "font-tenor",
          bg: "bg-white",
          text: "text-[#660000]",
          accentText: "text-[#D7C4A5]",
          accentBg: "bg-[#660000]",
          button: "bg-[#660000] text-white hover:bg-[#800] rounded-2xl py-3.5 px-8 font-semibold transition-all shadow-lg hover:shadow-[#660000]/20 active:scale-95",
          cardClass: "bg-neutral-50 rounded-[32px] p-8 border-none shadow-xl shadow-neutral-100"
        };
      case "tech":
        return {
          fontTitle: "font-syne font-extrabold uppercase",
          fontMain: "font-mono tracking-tight",
          bg: "bg-[#F2F2F2]",
          text: "text-[#121212]",
          accentText: "text-[#A2AD91]",
          accentBg: "bg-[#121212]",
          button: "bg-[#121212] text-white hover:bg-neutral-800 rounded-md py-3.5 px-6 font-bold uppercase border border-neutral-800 tracking-wider transition-all",
          cardClass: "bg-white border border-neutral-300 rounded-2xl p-6"
        };
      case "cozy":
        return {
          fontTitle: "font-serif font-semibold italic",
          fontMain: "font-serif tracking-normal text-stone-700",
          bg: "bg-[#FFFBF5]",
          text: "text-[#451A03]",
          accentText: "text-[#B45309]",
          accentBg: "bg-[#B45309]",
          button: "bg-[#B45309] hover:bg-[#78350F] text-white rounded-xl py-3.5 px-7 font-serif font-semibold shadow-md transition-all active:scale-95",
          cardClass: "bg-white/85 backdrop-blur-sm border border-[#B45309]/10 rounded-xl p-8 shadow-sm shadow-[#451A03]/5"
        };
      case "cosmic":
        return {
          fontTitle: "font-cinzel tracking-wider text-indigo-200",
          fontMain: "font-serif tracking-wide text-indigo-100/90",
          bg: "bg-gradient-to-b from-[#060416] via-[#0D0B2E] to-[#060413]",
          text: "text-indigo-100",
          accentText: "text-[#C7D2FE]",
          accentBg: "bg-indigo-600",
          button: "bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-3.5 px-8 font-cinzel font-semibold tracking-widest text-xs transition-all duration-300 shadow-lg shadow-indigo-500/25 border border-indigo-400/30 active:scale-95 hover:shadow-[0_0_15px_rgba(129,140,248,0.4)]",
          cardClass: "bg-[#0B081F]/90 backdrop-blur-md border border-indigo-500/15 rounded-lg p-8 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
        };
    }
  };

  const css = getLayoutClasses();

  // Parse Date to beautiful Russian string
  const getReadableDate = () => {
    const d = new Date(eventData.date);
    return d.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <div className={`min-h-screen relative overflow-x-hidden ${css.bg} ${css.text} ${css.fontMain} transition-all duration-700`}>
      
      {/* 1. AUDIO ENVIRONMENT & CANVAS EFFECTS */}
      <AudioPlayer concept={concept} />
      <EffectsOverlay concept={concept} />

      {/* 2. WELCOME SCREEN */}
      <section id="welcome-screen" className="min-h-screen flex flex-col justify-between items-center relative overflow-hidden py-16 px-6 z-20">
        
        {/* Subtle top branding */}
        <div className="text-center font-mono text-[10px] tracking-widest opacity-60 uppercase">
          ПРИГЛАШЕНИЕ НА СВАДЬБУ // WEDDING INVITATION
        </div>

        {/* Center names & interactive line illustration */}
        <div className="flex flex-col items-center justify-center text-center my-auto space-y-8 max-w-lg">
          
          {/* Concept 1 botanical line branch (grows natively!) */}
          {concept === "botanical" && (
            <div className="w-24 h-24 text-[#1A2E22] mb-2 scale-x-[-1] opacity-75">
              <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none">
                <path 
                  d="M50,90 Q50,50 30,20 M50,70 Q60,45 75,30 M50,55 Q40,35 25,45 M50,40 Q55,25 70,15" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  className="animate-pulse"
                />
              </svg>
            </div>
          )}

          {/* Cozy Fireplace Vector */}
          {concept === "cozy" && (
            <div className="w-20 h-20 text-[#B45309] mb-1 opacity-90">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current">
                {/* Campfire logs and flames */}
                <path d="M30,75 L70,75 M35,80 L65,70 M45,75 L55,75" strokeWidth="3" strokeLinecap="round" />
                <path 
                  d="M50,30 C35,50 45,70 50,75 C55,70 65,50 50,30 Z" 
                  strokeWidth="2.5" 
                  className="animate-pulse fill-[#FBBF24]/10" 
                />
                <path 
                  d="M50,45 C42,55 48,68 50,72 C52,68 58,55 50,45 Z" 
                  strokeWidth="1.5" 
                  className="fill-[#F59E0B]/20" 
                />
              </svg>
            </div>
          )}

          {/* Cosmic Constellation Vector */}
          {concept === "cosmic" && (
            <div className="w-24 h-24 text-indigo-300 mb-1 opacity-80">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current">
                {/* Geometry linking stars */}
                <circle cx="50" cy="50" r="1.5" className="fill-indigo-300 animate-pulse" />
                <circle cx="20" cy="35" r="1.5" className="fill-indigo-200" />
                <circle cx="80" cy="35" r="1.5" className="fill-indigo-200" />
                <circle cx="35" cy="75" r="1.5" className="fill-indigo-100" />
                <circle cx="65" cy="75" r="1.5" className="fill-indigo-100 animate-pulse" />
                
                <line x1="20" y1="35" x2="50" y2="50" strokeWidth="0.75" strokeDasharray="3 3" />
                <line x1="80" y1="35" x2="50" y2="50" strokeWidth="0.75" strokeDasharray="3 3" />
                <line x1="35" y1="75" x2="50" y2="50" strokeWidth="0.75" strokeDasharray="2 2" />
                <line x1="65" y1="75" x2="50" y2="50" strokeWidth="0.75" strokeDasharray="2 2" />
                
                {/* Orbital lines */}
                <circle cx="50" cy="50" r="18" strokeWidth="0.5" strokeDasharray="4 4" className="animate-spin-slow origin-center" />
                <circle cx="50" cy="50" r="32" strokeWidth="0.5" className="opacity-40" />
              </svg>
            </div>
          )}

          {/* Names presentation with distinct fonts */}
          <div className="space-y-4">
            <h1 id="couple-names-logo" className={`text-5xl md:text-7xl tracking-tighter ${css.fontTitle} leading-none`}>
              {concept === "passion" ? (
                <div className="flex flex-col gap-1 items-center">
                  <span className="text-6xl md:text-8xl block pr-4 select-none">{eventData.groomName}</span>
                  <span className="text-sm uppercase tracking-widest font-tenor text-[#D7C4A5] flex items-center gap-3">
                    <Heart className="w-3.5 h-3.5 text-[#660000] fill-current animate-ping" />
                    and
                    <Heart className="w-3.5 h-3.5 text-[#660000] fill-current" />
                  </span>
                  <span className="text-6xl md:text-8xl block pl-4 select-none">{eventData.brideName}</span>
                </div>
              ) : (
                eventData.coupleNames
              )}
            </h1>
            
            <p className="text-xs uppercase tracking-[0.25em] opacity-80 max-w-sm mx-auto leading-relaxed">
              {eventData.slogan}
            </p>
          </div>

          {concept === "tech" && (
            <div className="bg-neutral-950/5 border border-neutral-300 p-3 rounded-lg text-[10px] font-mono text-neutral-600 flex flex-col gap-1 w-full max-w-xs text-left">
              <div>PROJECT_LAUNCH: {eventData.date.replace(/-/g, ".")} // 16:00</div>
              <div>BASE: {eventData.coordinates.placeName}</div>
              <div className="flex items-center gap-1.5 mt-1 text-emerald-600">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                <span>SYSTEM ONLINE & CALIBRATED</span>
              </div>
            </div>
          )}
        </div>

        {/* Scroll indicator footer */}
        <div className="flex flex-col items-center gap-2.5 animate-bounce opacity-70">
          <span className="text-[10px] uppercase tracking-widest font-mono select-none">ЛИСТАЙТЕ ВНИЗ</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </section>

      {/* 3. HERO THE COUPLE PHOTO */}
      {/* 3. HERO THE COUPLE PHOTO */}
      <section id="hero-photo-section" className="py-24 px-6 max-w-4xl mx-auto relative z-20 text-center">
        <div className="space-y-6">
          <div className="relative inline-block overflow-hidden rounded-none shadow-2xl">
            {/* Visual design framework framing couples */}
            {concept === "botanical" && (
              <div className="absolute inset-0 border border-[#1A2E22]/20 m-4 pointer-events-none z-10" />
            )}
            {concept === "cozy" && (
              <div className="absolute inset-0 border border-[#B45309]/15 m-3 rounded-lg pointer-events-none z-10" />
            )}
            {concept === "cosmic" && (
              <div className="absolute inset-0 border border-indigo-500/15 m-5.5 pointer-events-none z-10 shadow-[inset_0_0_20px_rgba(99,102,241,0.15)]" />
            )}
            
            <img
              src={eventData.heroImage}
              alt="Вместе"
              referrerPolicy="no-referrer"
              className="w-full max-h-[85vh] object-cover filter saturate-[0.85] contrast-[1.05] transition-transform duration-[4000ms] hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* 4. DATE AND PRECISE COUNTDOWN */}
      <section id="countdown-section" className="py-20 px-6 max-w-4xl mx-auto relative z-20 text-center border-t border-b border-stone-200/40">
        <div className="space-y-8">
          
          <div className="space-y-2">
            <span className="text-[10px] tracking-widest uppercase opacity-60 font-mono">СОХРАНИТЕ ДАТУ // SAVE THE DATE</span>
            <div id="wedding-readable-date" className={`text-3xl md:text-4xl font-semibold tracking-tight ${concept === "botanical" || concept === "cozy" ? "font-serif" : concept === "cosmic" ? "font-cinzel text-indigo-300" : concept === "passion" ? "font-serif italic" : "font-mono"}`}>
              {getReadableDate()}
            </div>
            <div className="text-xs text-stone-400 font-mono mt-1">29.08.2026 в 18:00</div>
          </div>

          {/* Premium ticking stopwatch timers */}
          <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-md mx-auto">
            {[
              { label: "Дней", val: countdown.days },
              { label: "Часов", val: countdown.hours },
              { label: "Минут", val: countdown.minutes },
              { label: "Секунд", val: countdown.seconds }
            ].map((node, i) => (
              <div 
                key={i} 
                className={`p-4 transition-all duration-500 shadow-sm ${
                  concept === "botanical" ? "bg-[#FDFDFB] border border-stone-200/60 rounded-none text-[#1A2E22]" : 
                  concept === "passion" ? "bg-amber-50/40 rounded-2xl border-none shadow-neutral-100 shadow-md text-[#660000]" : 
                  concept === "cozy" ? "bg-amber-50/30 border border-amber-200/40 rounded-xl text-[#451A03]" :
                  concept === "cosmic" ? "bg-indigo-950/35 border border-indigo-500/20 rounded-lg text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.06)]" :
                  "bg-[#F2F2F2] border border-neutral-300 rounded-md font-mono"
                }`}
              >
                <div className="text-2xl md:text-3xl font-bold font-mono tracking-tight">
                  {String(node.val).padStart(2, "0")}
                </div>
                <div className={`text-[9px] uppercase tracking-widest font-semibold mt-1 opacity-85 ${css.accentText}`}>
                  {node.label}
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-stone-500">
            До начала нашего свадебного торжества!
          </div>

        </div>
      </section>



      {/* 6. EXPEDITION SCHEDULE TIMELINE */}
      <section id="schedule-section" ref={scheduleRef} className={`py-24 relative z-20 ${concept === "cosmic" ? "bg-indigo-950/20" : "bg-stone-100/50"}`}>
        <div className="max-w-3xl mx-auto px-6">
          
          <div className="text-center space-y-3 mb-16">
            <span className="text-[10px] tracking-widest uppercase opacity-60 font-mono">ПРОГРАММА ДНЯ // WEDDING TIMELINE</span>
            <h2 className={`text-3xl md:text-5xl ${css.fontTitle}`}>Расписание свадебного дня</h2>
          </div>

          {/* Vertical timeline */}
          <div className="relative border-l border-neutral-300 md:ml-32 ml-6 pl-8 py-2 space-y-12">
            
            {eventData.schedule.map((item, i) => {
              const isActive = reachedAgendaSteps[i];
              
              return (
                <div 
                  key={i} 
                  id={`schedule-timeline-item-${i}`}
                  className="relative transition-all duration-500"
                >
                  
                  {/* Left Floating Time label (Visible on desktop) */}
                  <div className="hidden md:block absolute right-full mr-12 top-1 text-right">
                    <span className="font-mono text-xs opacity-50">ВРЕМЯ НАЧАЛА</span>
                    <div className="text-xl font-bold tracking-tight font-mono">
                      {item.time}
                    </div>
                  </div>

                  {/* Bullet indicator point */}
                  <span className={`absolute right-full mr-8 top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    isActive ? 
                    (concept === "cozy" ? "bg-[#B45309] border-[#B45309] scale-125" : 
                     concept === "cosmic" ? "bg-indigo-300 border-indigo-400 scale-125 shadow-[0_0_10px_rgba(129,140,248,0.5)]" : 
                     "bg-emerald-500 border-emerald-500 scale-125") : 
                    "bg-neutral-200 border-neutral-300"
                  }`}>
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  </span>

                  {/* Bullet micro icons */}
                  <div className={`absolute right-full mr-14 top-0.5 p-1.5 rounded-full ${
                    isActive ? 
                    (concept === "cozy" ? "bg-amber-100 text-[#B45309]" : 
                     concept === "cosmic" ? "bg-indigo-950/80 text-indigo-300 border border-indigo-500/20" : 
                     "bg-[#1A2E22]/5 text-[#1A2E22]") : 
                    "text-neutral-400 bg-neutral-100"
                  } hidden md:block`}>
                    {item.icon === "users" && <Users className="w-4 h-4" />}
                    {item.icon === "heart" && <Heart className="w-4 h-4" />}
                    {item.icon === "utensils" && <Utensils className="w-4 h-4" />}
                    {item.icon === "music" && <Music className="w-4 h-4" />}
                    {item.icon === "camera" && <Camera className="w-4 h-4" />}
                    {item.icon === "tent" && <Tent className="w-4 h-4" />}
                    {item.icon === "peak" && <Mountain className="w-4 h-4" />}
                    {item.icon === "bonfire" && <Flame className="w-4 h-4" />}
                    {item.icon === "stars" && <Sparkles className="w-4 h-4" />}
                  </div>

                  {/* Card Content info */}
                  <div className={`p-6 border transition-all shadow-sm ${
                    item.icon === "camera" ? (
                      concept === "cosmic"
                        ? "bg-indigo-950/60 border-indigo-400/40 rounded-lg text-indigo-100 ring-1 ring-indigo-400/30"
                        : "bg-white border-stone-400/50 rounded-xl ring-1 ring-stone-300 text-[#1A2E22]"
                    ) :
                    concept === "botanical" ? "bg-white border-stone-200/70 rounded-none text-[#1A2E22]" :
                    concept === "passion" ? "bg-neutral-50/95 border-none rounded-3xl text-[#660000]" :
                    concept === "cozy" ? "bg-white border-[#B45309]/10 rounded-xl text-[#451A03]" :
                    concept === "cosmic" ? "bg-[#0B0822]/85 border-indigo-500/15 rounded-lg text-indigo-100" :
                    "bg-white border-stone-200 rounded-xl font-mono text-xs text-neutral-800"
                  }`}>

                    {/* Mobile time display fallback */}
                    <div className="md:hidden text-lg font-bold font-mono mb-1 flex items-center gap-1">
                      <Clock className="w-4 h-4 opacity-50" />
                      <span>{item.time}</span>
                    </div>

                    <h4 className={`text-[13px] font-bold uppercase tracking-wide ${item.icon === "camera" ? "flex items-center gap-2" : ""}`}>
                      {item.icon === "camera" && <Camera className="w-4 h-4 shrink-0" />}
                      {item.title}
                    </h4>
                    <p className={`text-xs leading-relaxed mt-1.5 opacity-80 ${item.icon === "camera" ? "italic" : ""}`}>
                      {item.description}
                    </p>
                  </div>

                </div>
              );
            })}

          </div>

        </div>
      </section>

      {/* 7. LOCATION ADDRESS AND SIMULATED MAP */}
      <section id="location-section" className="py-24 px-6 max-w-4xl mx-auto relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          
          <div className="lg:col-span-2 space-y-6 text-left">
            <span className="text-[10px] tracking-widest uppercase opacity-60 font-mono">ЛОКАЦИЯ // VENUE</span>
            <h2 className={`text-2xl md:text-4xl ${css.fontTitle}`}>Как нас найти</h2>
            
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block font-mono">Место торжества</span>
                <span id="location-place-name" className="text-sm font-bold text-neutral-800">{eventData.coordinates.placeName}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block font-mono">Адрес места проведения</span>
                <span id="location-address" className="text-xs leading-relaxed text-stone-500 block">
                  {eventData.coordinates.address}
                </span>
              </div>
            </div>

            {/* Map button */}
            <a
              id="maps-btn"
              href={`https://www.google.com/maps/search/?api=1&query=${eventData.coordinates.lat},${eventData.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-5 rounded-xl text-neutral-800 bg-white border border-neutral-300 font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-neutral-50 cursor-pointer text-center"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{eventData.coordinates.placeName}</span>
            </a>
          </div>

          {/* Map embed */}
          <div className="lg:col-span-3">
            <div className="aspect-video w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-stone-200/60">
              <iframe
                title="Venue map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(eventData.coordinates.lng)-0.005}%2C${parseFloat(eventData.coordinates.lat)-0.003}%2C${parseFloat(eventData.coordinates.lng)+0.005}%2C${parseFloat(eventData.coordinates.lat)+0.003}&layer=mapnik&marker=${eventData.coordinates.lat}%2C${eventData.coordinates.lng}`}
              />
            </div>
          </div>

        </div>
      </section>

      {/* 8. DRESS CODE BOARD */}
      <section id="dress-code-section" className={`py-24 relative z-20 ${concept === "cosmic" ? "bg-indigo-950/20" : "bg-stone-100/40"}`}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Dress code text block */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[10px] tracking-widest uppercase opacity-60 font-mono">ГАРДЕРОБ // DRESS CODE</span>
              <h2 className={`text-2xl md:text-4xl ${css.fontTitle}`}>Дресс-код вечера</h2>
              <p className="text-sm leading-relaxed opacity-85 text-stone-500">
                {eventData.dressCode.description}
              </p>

              {/* Dress code formats */}
              <div className="space-y-3">
                <div className={`flex items-start gap-4 p-4 rounded-xl border ${
                  concept === "cosmic" ? "bg-indigo-950/40 border-indigo-500/20 text-indigo-100" :
                  concept === "cozy" ? "bg-[#FFFDF9]/90 border-[#B45309]/15 text-[#451A03]" :
                  "bg-white/70 border-neutral-200"
                }`}>
                  <span className="text-2xl">🤵</span>
                  <div>
                    <p className="font-semibold text-sm tracking-wide uppercase">Black Tie</p>
                    <p className="text-xs opacity-70 mt-0.5">Смокинг, вечернее длинное платье</p>
                  </div>
                </div>
                <div className={`flex items-start gap-4 p-4 rounded-xl border ${
                  concept === "cosmic" ? "bg-indigo-950/40 border-indigo-500/20 text-indigo-100" :
                  concept === "cozy" ? "bg-[#FFFDF9]/90 border-[#B45309]/15 text-[#451A03]" :
                  "bg-white/70 border-neutral-200"
                }`}>
                  <span className="text-2xl">👗</span>
                  <div>
                    <p className="font-semibold text-sm tracking-wide uppercase">Cocktail</p>
                    <p className="text-xs opacity-70 mt-0.5">Костюм, коктейльное или вечернее платье</p>
                  </div>
                </div>
              </div>

              {/* Forbidden colors */}
              <div className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${
                concept === "cosmic" ? "bg-indigo-950/40 border-indigo-500/20 text-indigo-200" :
                "bg-stone-50 border-stone-200 text-stone-500"
              }`}>
                <span className="text-base">🚫</span>
                <span>Просим воздержаться от <strong>белого</strong> и <strong>чёрного</strong> цвета</span>
              </div>
            </div>

            {/* Moodboard image gallery */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-3 gap-3">
                {eventData.dressCode.moodboardImages.map((img, i) => (
                  <div key={i} className={`aspect-square relative overflow-hidden shadow-lg border ${concept === "cosmic" ? "border-indigo-500/25 rounded-lg" : concept === "cozy" ? "border-[#B45309]/15 rounded-xl" : "border-white rounded-none"}`}>
                    <img
                      src={img}
                      alt="Dress Code Moodboard"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover filter saturate-[0.8] hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. RSVP FORM SUBMISSION BLOCK */}
      <section id="rsvp-section" className="py-24 px-6 max-w-2xl mx-auto relative z-20">
        <RsvpForm concept={concept} onSuccess={refreshRsvps} />
      </section>



      {/* 11. FINAL SCREEN SEE YOU AT THE CELEBRATION */}
      <section id="final-screen" className="min-h-screen flex flex-col justify-between items-center relative overflow-hidden py-16 px-6 z-20 text-center bg-black text-white">
        
        {/* Sky mountain image with view from behind inside full screen */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
          <img
            src="/photo2.jpg"
            alt="Свадебные кольца"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter grayscale saturate-50 brightness-50 select-none"
          />
        </div>

        <div className="z-10 text-center font-mono text-[9px] tracking-widest opacity-60 uppercase mt-4">
          WEDDING DAY CELEBRATION
        </div>

        <div className="z-10 space-y-6 my-auto max-w-lg px-4">
          <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin-slow">
            <Heart className="w-4 h-4 text-white fill-current" />
          </div>
          
          <h2 id="final-peek-banner" className={`text-3xl md:text-5xl ${
            concept === "botanical" || concept === "cozy" ? "font-serif" : 
            concept === "cosmic" ? "font-cinzel text-indigo-200" : 
            concept === "passion" ? "font-serif italic" : "font-syne font-black"
          } tracking-wider uppercase leading-none`}>
            До скорой <br />встречи!
          </h2>
          
          <p className="text-xs uppercase tracking-[0.25em] text-stone-200 font-medium">
            С нетерпением ждем встречи, {eventData.groomName} & {eventData.brideName}
          </p>
        </div>

        <div className="z-10 text-[9px] tracking-widest opacity-40 font-mono">
          © 2026 {eventData.coupleNames}
        </div>

      </section>

      {/* MOBILE FLOATING DOCK INTERACTIVE NAVIGATION */}
      {showFloatNav && (
        <div 
          id="mobile-float-navigation-dock"
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center justify-around gap-1 p-1 shadow-xl backdrop-blur-md max-w-[95vw] overflow-x-auto scrollbar-none transition-all duration-300 md:hidden ${
            concept === "botanical" 
              ? "bg-[#FDFDFB]/90 text-[#1A2E22] border border-[#1A2E22]/15 rounded-none" 
              : concept === "passion" 
              ? "bg-white/90 text-[#660000] border border-stone-200/50 rounded-full" 
              : concept === "cozy"
              ? "bg-[#FFFBF5]/90 text-[#451A03] border border-[#B45309]/15 rounded-xl"
              : concept === "cosmic"
              ? "bg-[#090514]/92 text-indigo-100 border border-indigo-500/25 rounded-lg"
              : "bg-[#121212]/92 text-[#F2F2F2] border border-neutral-700/60 rounded-lg font-mono text-[9px]"
          }`}
        >
          {[
            { id: "hero-photo-section", label: "Фото", icon: Mountain },
            { id: "schedule-section", label: "Таймлайн", icon: Calendar },
            { id: "location-section", label: "Карта", icon: MapPin },
            { id: "dress-code-section", label: "Стиль", icon: Layers },
            { id: "rsvp-section", label: "RSVP", icon: MessageSquare }
          ].map((item) => {
            const Icon = item.icon;
            const isCurrent = activeSection === item.id;
            
            const btnClass = isCurrent
              ? concept === "botanical"
                ? "bg-[#1A2E22] text-[#FDFDFB]"
                : concept === "passion"
                ? "bg-[#660000] text-white rounded-full"
                : concept === "cozy"
                ? "bg-[#B45309] text-white rounded-lg"
                : concept === "cosmic"
                ? "bg-indigo-650 text-white rounded-full shadow-md shadow-indigo-500/20"
                : "bg-white text-black font-bold rounded"
              : concept === "botanical"
              ? "text-stone-600 hover:text-[#1A2E22]"
              : concept === "passion"
              ? "text-stone-500 hover:text-[#660000]"
              : concept === "cozy"
              ? "text-stone-550 hover:text-[#B45309]"
              : concept === "cosmic"
              ? "text-indigo-300 hover:text-white"
              : "text-neutral-400 hover:text-white";

            const itemFont = concept === "tech" ? "font-mono tracking-tighter text-[8px]" : "font-sans font-medium tracking-tight text-[9px]";

            return (
              <button
                key={item.id}
                id={`float-nav-btn-${item.id}`}
                onClick={() => {
                  const el = document.getElementById(item.id);
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2.5 min-w-[50px] rounded-full transition-all duration-300 pointer-events-auto cursor-pointer ${btnClass}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className={itemFont}>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
}
