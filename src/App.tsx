import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Clock,
  ChevronDown,
  Calendar,
  Shirt,
  Heart,
  Users,
  Utensils,
  Music,
  Camera,
  MessageSquare,
} from "lucide-react";
import { EventData, RsvpResponse } from "./types";
import { initialEventData } from "./data";
import AudioPlayer from "./components/AudioPlayer";
import RsvpForm from "./components/RsvpForm";

const ACCENT = "#7b928a";
const ACCENT_DEEP = "#54665e";
const INK = "#3c4541";
const MUTED = "#847f74";

export default function App() {
  const [eventData] = useState<EventData>(initialEventData);
  const [, setRsvpEntries] = useState<RsvpResponse[]>([]);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showFloatNav, setShowFloatNav] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const scheduleRef = useRef<HTMLDivElement | null>(null);
  const [reachedAgendaSteps, setReachedAgendaSteps] = useState<boolean[]>(
    eventData.schedule.map(() => false)
  );

  // Load guest RSVPs
  const refreshRsvps = async (newRsvp?: RsvpResponse) => {
    if (newRsvp) {
      setRsvpEntries((prev) => [...prev, newRsvp]);
      return;
    }
    try {
      const response = await fetch("/api/rsvp");
      if (response.ok) setRsvpEntries(await response.json());
    } catch (err) {
      console.error("Unable to query RSVPs from Express server", err);
    }
  };

  useEffect(() => {
    refreshRsvps();
  }, []);

  // Countdown
  useEffect(() => {
    const weddingDate = new Date(`${eventData.date}T18:00:00`).getTime();
    const interval = setInterval(() => {
      const difference = weddingDate - Date.now();
      if (difference <= 0) {
        clearInterval(interval);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [eventData.date]);

  // Scroll: agenda, nav, active section, reveal
  useEffect(() => {
    const handleScroll = () => {
      if (scheduleRef.current) {
        const rect = scheduleRef.current.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const progress = Math.max(0, Math.min(1, (viewportH - rect.top) / (rect.height + viewportH * 0.2)));
        const stepsCount = eventData.schedule.length;
        setReachedAgendaSteps(eventData.schedule.map((_, i) => progress > (i + 0.5) / stepsCount));
      }

      setShowFloatNav(window.scrollY > window.innerHeight * 0.6);

      const sectionIds = ["when-section", "location-section", "schedule-section", "dress-code-section", "rsvp-section"];
      let current = "";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.top <= window.innerHeight * 0.5 && r.bottom >= window.innerHeight * 0.2) current = id;
        }
      }
      setActiveSection(current);

      document.querySelectorAll(".reveal").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.88) el.classList.add("visible");
      });
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [eventData.schedule]);

  const getReadableDate = () =>
    new Date(eventData.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

  // ── Reusable section header ──
  const SectionTitle = ({ eyebrow, title }: { eyebrow: string; title: React.ReactNode }) => (
    <div className="text-center space-y-4 mb-14">
      <span className="block text-[10px] tracking-[0.34em] uppercase font-sans font-light reveal" style={{ color: ACCENT }}>
        {eyebrow}
      </span>
      <div className="divider reveal" />
      <h2 className="text-3xl md:text-4xl font-serif italic reveal" style={{ color: INK }}>
        {title}
      </h2>
    </div>
  );

  // ── Big accented date block (used in hero + when) ──
  const DateAccent = ({ light = false }: { light?: boolean }) => (
    <div className="flex items-center justify-center gap-4 select-none">
      <span className="h-px w-8" style={{ background: light ? "rgba(255,255,255,0.6)" : ACCENT }} />
      <span
        className="font-serif tracking-[0.12em]"
        style={{ color: light ? "#ffffff" : ACCENT_DEEP }}
      >
        <span className="text-2xl md:text-3xl">29</span>
        <span className="text-base md:text-lg mx-1.5 uppercase tracking-[0.2em]">августа</span>
        <span className="text-2xl md:text-3xl">2026</span>
      </span>
      <span className="h-px w-8" style={{ background: light ? "rgba(255,255,255,0.6)" : ACCENT }} />
    </div>
  );

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ background: "var(--color-bg)", color: INK }}>
      <AudioPlayer />

      {/* ── HERO: фото на фоне + акцент на дату ── */}
      <section id="welcome-screen" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Photo background */}
        <div className="absolute inset-0">
          <img
            src={eventData.heroImage}
            alt="Джаъфар и Ситора"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            style={{ objectPosition: "50% 32%" }}
          />
          {/* Soft scrim for legibility & cohesion */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(40,50,46,0.30) 0%, rgba(40,50,46,0.02) 25%, rgba(40,50,46,0.05) 45%, rgba(40,50,46,0.72) 75%, rgba(40,50,46,0.85) 100%)",
            }}
          />
        </div>

        {/* Top eyebrow */}
        <div className="absolute top-10 left-0 right-0 text-center z-10">
          <span className="text-[10px] tracking-[0.4em] uppercase font-light text-white/85">
            Приглашение на свадьбу
          </span>
        </div>

        {/* Bottom: names + date + scroll hint */}
        <div className="absolute bottom-10 left-0 right-0 z-10 flex flex-col items-center gap-5 px-6">
          <h1 className="text-white text-center leading-tight drop-shadow-sm" style={{ fontFamily: "'Great Vibes', cursive" }}>
            <span className="block text-4xl md:text-6xl">{eventData.groomName}</span>
            <span className="block text-base md:text-lg my-2 font-light tracking-[0.3em] uppercase text-white/75" style={{ fontFamily: "'Raleway', sans-serif" }}>
              &amp;
            </span>
            <span className="block text-4xl md:text-6xl">{eventData.brideName}</span>
          </h1>
          <DateAccent light />
          <div className="flex flex-col items-center gap-1.5 animate-bounce opacity-80">
            <span className="text-[9px] uppercase tracking-[0.3em] font-light text-white/80">листайте вниз</span>
            <ChevronDown className="w-4 h-4 text-white/90" />
          </div>
        </div>
      </section>

      {/* ── ЧТО: приглашение ── */}
      <section id="about-section" className="py-24 px-6 max-w-2xl mx-auto relative text-center">
        <SectionTitle eyebrow="Что нас ждёт" title="Мы женимся" />
        <p className="text-base md:text-lg leading-relaxed font-light reveal" style={{ color: MUTED }}>
          Дорогие друзья и близкие! С большой радостью и трепетом приглашаем вас
          разделить с нами один из самых важных дней нашей жизни — день, когда
          мы скажем друг другу <span style={{ color: ACCENT_DEEP }}>«да»</span>.
          Будем счастливы видеть вас среди гостей нашего торжества.
        </p>
      </section>

      {/* ── КОГДА: дата + обратный отсчёт ── */}
      <section
        id="when-section"
        className="py-24 px-6 relative"
        style={{ background: "var(--color-bg-alt)" }}
      >
        <div className="max-w-3xl mx-auto">
          <SectionTitle eyebrow="Когда" title={<>Дата<br /><em>торжества</em></>} />

          <div className="text-center space-y-3 mb-12 reveal">
            <div className="text-3xl md:text-4xl font-serif italic" style={{ color: INK }}>
              {getReadableDate()}
            </div>
            <div className="text-sm font-light tracking-widest" style={{ color: MUTED }}>
              суббота · сбор гостей в 18:00
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 md:gap-5 max-w-md mx-auto reveal">
            {[
              { label: "Дней", val: countdown.days },
              { label: "Часов", val: countdown.hours },
              { label: "Минут", val: countdown.minutes },
              { label: "Секунд", val: countdown.seconds },
            ].map((node, i) => (
              <div
                key={i}
                className="py-5 text-center"
                style={{ background: "var(--color-bg)", border: "1px solid var(--color-line)" }}
              >
                <div className="text-2xl md:text-3xl font-serif" style={{ color: ACCENT_DEEP }}>
                  {String(node.val).padStart(2, "0")}
                </div>
                <div className="text-[9px] uppercase tracking-[0.2em] font-light mt-1.5" style={{ color: MUTED }}>
                  {node.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ГДЕ: локация + карта ── */}
      <section id="location-section" className="py-24 px-6 max-w-4xl mx-auto relative">
        <SectionTitle eyebrow="Где" title={<>Место<br /><em>проведения</em></>} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-2 space-y-6 text-center lg:text-left reveal">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-light uppercase tracking-[0.2em] block" style={{ color: MUTED }}>
                  Ресторан
                </span>
                <span className="text-lg font-serif italic" style={{ color: INK }}>
                  {eventData.coordinates.placeName}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-light uppercase tracking-[0.2em] block" style={{ color: MUTED }}>
                  Адрес
                </span>
                <span className="text-sm font-light leading-relaxed block" style={{ color: MUTED }}>
                  {eventData.coordinates.address}
                </span>
              </div>
            </div>
            <a
              id="maps-btn"
              href={`https://www.google.com/maps/search/?api=1&query=${eventData.coordinates.lat},${eventData.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 py-3 px-6 text-[11px] font-light tracking-[0.18em] uppercase transition-all duration-300"
              style={{ border: `1px solid ${ACCENT}`, color: ACCENT_DEEP, background: "transparent" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(123,146,138,0.12)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
            >
              <MapPin className="w-4 h-4" />
              <span>Открыть на карте</span>
            </a>
          </div>

          <div className="lg:col-span-3 reveal">
            <div className="aspect-video w-full overflow-hidden" style={{ border: "1px solid var(--color-line)" }}>
              <iframe
                title="Карта"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(35%) contrast(0.95) brightness(1.02)" }}
                loading="lazy"
                allowFullScreen
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(eventData.coordinates.lng) - 0.005}%2C${parseFloat(eventData.coordinates.lat) - 0.003}%2C${parseFloat(eventData.coordinates.lng) + 0.005}%2C${parseFloat(eventData.coordinates.lat) + 0.003}&layer=mapnik&marker=${eventData.coordinates.lat}%2C${eventData.coordinates.lng}`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── ПРОГРАММА ── */}
      <section id="schedule-section" ref={scheduleRef} className="py-24 relative" style={{ background: "var(--color-bg-alt)" }}>
        <div className="max-w-3xl mx-auto px-6">
          <SectionTitle eyebrow="Программа вечера" title={<>Как пройдёт<br /><em>наш день</em></>} />

          <div className="relative pl-8 py-2 space-y-9 md:ml-32 ml-4" style={{ borderLeft: "1px solid var(--color-line)" }}>
            {eventData.schedule.map((item, i) => {
              const isActive = reachedAgendaSteps[i];
              const isPhoto = item.icon === "camera";
              return (
                <div key={i} id={`schedule-timeline-item-${i}`} className="relative transition-all duration-500 reveal">
                  {/* Time label (desktop) */}
                  <div className="hidden md:block absolute right-full mr-12 top-1 text-right">
                    <div className="text-xl font-serif" style={{ color: isActive ? ACCENT_DEEP : MUTED }}>
                      {item.time}
                    </div>
                  </div>

                  {/* Dot */}
                  <span
                    className="absolute right-full mr-8 top-2 w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all"
                    style={{
                      background: isActive ? ACCENT : "var(--color-bg-alt)",
                      borderColor: isActive ? ACCENT : "var(--color-line)",
                      transform: isActive ? "scale(1.15)" : "scale(1)",
                    }}
                  >
                    {isActive && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </span>

                  {/* Card */}
                  <div
                    className="p-5 transition-all"
                    style={{
                      background: isPhoto ? "rgba(123,146,138,0.10)" : "var(--color-bg)",
                      border: `1px solid ${isPhoto ? "rgba(123,146,138,0.4)" : "var(--color-line)"}`,
                    }}
                  >
                    <div className="md:hidden text-base font-serif mb-1 flex items-center gap-1.5" style={{ color: ACCENT_DEEP }}>
                      <Clock className="w-3.5 h-3.5 opacity-60" />
                      <span>{item.time}</span>
                    </div>
                    <h4 className="text-sm font-medium tracking-wide flex items-center gap-2" style={{ color: INK }}>
                      {item.icon === "camera" && <Camera className="w-4 h-4 shrink-0" style={{ color: ACCENT }} />}
                      {item.icon === "users" && <Users className="w-4 h-4 shrink-0 opacity-60" />}
                      {item.icon === "heart" && <Heart className="w-4 h-4 shrink-0 opacity-60" />}
                      {item.icon === "utensils" && <Utensils className="w-4 h-4 shrink-0 opacity-60" />}
                      {item.icon === "music" && <Music className="w-4 h-4 shrink-0 opacity-60" />}
                      {item.title}
                    </h4>
                    <p className="text-sm font-light leading-relaxed mt-1.5" style={{ color: MUTED }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ДРЕСС-КОД ── */}
      <section id="dress-code-section" className="py-24 px-6 max-w-2xl mx-auto relative">
        <SectionTitle eyebrow="Гардероб" title={<>Дресс-<em>код</em></>} />

        <div className="space-y-7">
          <p className="text-base font-light leading-relaxed text-center reveal" style={{ color: MUTED }}>
            {eventData.dressCode.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 reveal">
            {[
              { title: "Black Tie", desc: "Смокинг, вечернее длинное платье" },
              { title: "Cocktail", desc: "Костюм, коктейльное или вечернее платье" },
            ].map((item, i) => (
              <div key={i} className="p-5 text-center" style={{ border: "1px solid var(--color-line)", background: "var(--color-bg-alt)" }}>
                <p className="font-serif italic text-lg" style={{ color: ACCENT_DEEP }}>{item.title}</p>
                <p className="text-sm font-light mt-1" style={{ color: MUTED }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center text-sm font-light reveal" style={{ color: MUTED }}>
            Просим воздержаться от <span style={{ color: ACCENT_DEEP }}>белого</span> и{" "}
            <span style={{ color: ACCENT_DEEP }}>чёрного</span> цвета
          </div>
        </div>
      </section>

      {/* ── RSVP ── */}
      <section id="rsvp-section" className="py-24 px-6 max-w-xl mx-auto relative" style={{ background: "var(--color-bg-alt)" }}>
        <SectionTitle eyebrow="Подтверждение участия" title="Будете с нами?" />
        <RsvpForm onSuccess={refreshRsvps} />
      </section>

      {/* ── ФИНАЛ ── */}
      <section id="final-screen" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden text-center px-6">
        <div className="absolute inset-0">
          <img
            src="/photo2.jpg"
            alt="Джаъфар и Ситора"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(58,68,65,0.45) 0%, rgba(58,68,65,0.30) 50%, rgba(58,68,65,0.6) 100%)" }}
          />
        </div>

        <div className="relative z-10 space-y-7 max-w-lg">
          <h2 className="text-4xl md:text-5xl text-white leading-tight" style={{ fontFamily: "'Great Vibes', cursive" }}>
            До скорой <br />встречи!
          </h2>
          <div className="divider" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.7), transparent)" }} />
          <p className="text-xs uppercase tracking-[0.28em] font-light text-white/85">
            С нетерпением ждём встречи,<br />
            {eventData.groomName} &amp; {eventData.brideName}
          </p>
        </div>

        <div className="absolute bottom-6 left-0 right-0 z-10 text-[9px] tracking-[0.25em] uppercase font-light text-white/60">
          © 2026 · {eventData.coupleNames}
        </div>
      </section>

      {/* ── Плавающая навигация ── */}
      {showFloatNav && (
        <div
          id="mobile-float-navigation-dock"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center justify-around gap-1 p-1 shadow-lg backdrop-blur-md max-w-[95vw] overflow-x-auto md:hidden transition-all duration-300"
          style={{ background: "rgba(238,240,236,0.92)", border: "1px solid var(--color-line)" }}
        >
          {[
            { id: "when-section", label: "Когда", icon: Calendar },
            { id: "location-section", label: "Где", icon: MapPin },
            { id: "schedule-section", label: "Программа", icon: Clock },
            { id: "dress-code-section", label: "Стиль", icon: Shirt },
            { id: "rsvp-section", label: "RSVP", icon: MessageSquare },
          ].map((item) => {
            const Icon = item.icon;
            const isCurrent = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`float-nav-btn-${item.id}`}
                onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
                className="flex flex-col items-center justify-center gap-1 py-1.5 px-2.5 min-w-[52px] transition-all duration-300 cursor-pointer"
                style={{
                  color: isCurrent ? ACCENT_DEEP : MUTED,
                  background: isCurrent ? "rgba(123,146,138,0.14)" : "transparent",
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="font-light tracking-tight text-[8px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
