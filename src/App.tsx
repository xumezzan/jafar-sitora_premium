import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Clock,
  ChevronDown,
  Calendar,
  Shirt,
  Camera,
  MessageSquare,
  X,
  Car,
} from "lucide-react";
import { EventData, RsvpResponse } from "./types";
import { initialEventData } from "./data";
import AudioPlayer from "./components/AudioPlayer";
import RsvpForm from "./components/RsvpForm";
import { Ornament, Sprig, CornerLeaf } from "./components/Decor";
import DressCodeSlider from "./components/DressCodeSlider";

const ACCENT = "#3d5a6e";
const ACCENT_DEEP = "#2b4050";
const INK = "#1a2428";
const MUTED = "#3d4f56";

// Пути к декоративным PNG-веточкам (положите в public/). Если файла нет — он просто не покажется.
const LEAF = "/leaf.png";

export default function App() {
  const [eventData] = useState<EventData>(initialEventData);
  const [, setRsvpEntries] = useState<RsvpResponse[]>([]);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showFloatNav, setShowFloatNav] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const scheduleRef = useRef<HTMLDivElement | null>(null);

  // Загрузка списка RSVP
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

  // Обратный отсчёт
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

  // Reveal через IntersectionObserver (надёжнее scroll-handler, не пропускает быстрый скролл)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Скролл: прогресс таймлайна, плавающая навигация, активная секция
  useEffect(() => {
    const handleScroll = () => {
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
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [eventData.schedule]);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // ── Заголовок секции: эйбрау + орнамент-веточка + serif h2 ──
  const SectionTitle = ({ eyebrow, title }: { eyebrow: string; title: React.ReactNode }) => (
    <div className="text-center mb-12 md:mb-14">
      <span
        className="block text-[11px] tracking-[0.32em] uppercase font-sans font-medium reveal mb-4"
        style={{ color: ACCENT }}
      >
        {eyebrow}
      </span>
      <h2
        className="font-serif text-4xl md:text-5xl reveal d1 mb-4"
        style={{ color: INK, fontWeight: 500, letterSpacing: "0.01em" }}
      >
        {title}
      </h2>
      <Ornament className="reveal d2" />
    </div>
  );

  // ── Орнаментная дата 29 / августа 2026 (как на скринах) ──
  const BigDate = ({ light = false }: { light?: boolean }) => {
    const col = light ? "#ffffff" : ACCENT_DEEP;
    return (
      <div className="flex items-center justify-center gap-2 select-none font-serif flex-wrap" style={{ color: col }}>
        <span className="text-5xl md:text-6xl leading-none" style={{ fontWeight: 500 }}>29</span>
        <span className="text-xl md:text-2xl uppercase tracking-[0.22em] leading-none" style={{ opacity: 0.85, fontWeight: 400 }}>августа</span>
        <span className="text-5xl md:text-6xl leading-none" style={{ fontWeight: 500 }}>2026</span>
      </div>
    );
  };

  const navItems = [
    { id: "when-section", label: "Когда", icon: Calendar },
    { id: "location-section", label: "Где", icon: MapPin },
    { id: "schedule-section", label: "Программа", icon: Clock },
    { id: "dress-code-section", label: "Дресс-код", icon: Shirt },
    { id: "rsvp-section", label: "RSVP", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ color: INK }}>
      {/* ── ФИКСИРОВАННАЯ ШАПКА ── */}
      <header className="fixed top-0 left-0 right-0 z-40">
        <div
          className="flex items-center justify-between px-5 py-3.5 backdrop-blur-md"
          style={{ background: "rgba(237,236,234,0.82)", borderBottom: "1px solid var(--color-line)" }}
        >
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Меню"
            className="flex flex-col gap-[5px] p-1 cursor-pointer"
          >
            <span className="block h-px w-6" style={{ background: ACCENT_DEEP }} />
            <span className="block h-px w-6" style={{ background: ACCENT_DEEP }} />
            <span className="block h-px w-4" style={{ background: ACCENT_DEEP }} />
          </button>
          <span className="text-xs md:text-sm tracking-[0.28em] uppercase font-medium" style={{ color: ACCENT_DEEP }}>
            {eventData.groomName} &amp; {eventData.brideName}
          </span>
          <AudioPlayer compact />
        </div>
      </header>

      {/* ── ВЫДВИЖНОЕ МЕНЮ ── */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-400 ${menuOpen ? "visible opacity-100" : "invisible opacity-0"}`}
        style={{ background: "rgba(47,59,66,0.5)", backdropFilter: "blur(4px)" }}
        onClick={() => setMenuOpen(false)}
      >
        <nav
          className={`absolute top-0 left-0 h-full w-72 max-w-[80vw] px-7 pt-8 transition-transform duration-400 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
          style={{ background: "transparent" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-10">
            <span className="font-serif text-2xl" style={{ color: INK }}>Меню</span>
            <button onClick={() => setMenuOpen(false)} aria-label="Закрыть" className="cursor-pointer">
              <X className="w-5 h-5" style={{ color: ACCENT_DEEP }} />
            </button>
          </div>
          <Sprig />
          <ul className="mt-8 space-y-5">
            {[{ id: "welcome-screen", label: "Главная" }, ...navItems].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollTo(item.id)}
                  className="text-lg font-serif cursor-pointer transition-colors"
                  style={{ color: INK }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = ACCENT)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = INK)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* ── HERO ── */}
      <section id="welcome-screen" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={eventData.heroImage}
            alt="Джаъфар и Ситора"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            style={{ objectPosition: "50% 30%" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(40,50,58,0.42) 0%, rgba(40,50,58,0.12) 24%, rgba(40,50,58,0.10) 46%, rgba(40,50,58,0.55) 74%, rgba(40,50,58,0.80) 100%)",
            }}
          />
        </div>

        <div className="absolute top-20 left-0 right-0 text-center z-10 soft-in">
          <span className="text-[11px] tracking-[0.45em] uppercase font-light text-white/85">Wedding Day</span>
        </div>

        {/* Имена + орнамент + большая дата */}
        <div className="relative z-10 text-center px-6 soft-in" style={{ animationDelay: "0.2s" }}>
          <h1 className="font-serif text-white leading-[0.92] drop-shadow-md" style={{ fontWeight: 500 }}>
            <span className="block text-6xl md:text-8xl">{eventData.groomName}</span>
            <span className="block text-3xl md:text-4xl my-3 opacity-80">&amp;</span>
            <span className="block text-6xl md:text-8xl">{eventData.brideName}</span>
          </h1>

          <div className="my-8 flex items-center justify-center gap-3 text-white/80">
            <span className="h-px w-16" style={{ background: "rgba(255,255,255,0.5)" }} />
            <Sprig color="#ffffff" />
            <span className="h-px w-16" style={{ background: "rgba(255,255,255,0.5)" }} />
          </div>

          <BigDate light />

          <p className="mt-10 text-[11px] md:text-xs uppercase tracking-[0.3em] font-light text-white/80 leading-relaxed">
            Мы приглашаем вас разделить
            <br />
            с нами этот особенный день
          </p>
        </div>

        <button
          onClick={() => scrollTo("about-section")}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 w-11 h-16 rounded-full border flex items-end justify-center pb-3 animate-bounce cursor-pointer"
          style={{ borderColor: "rgba(255,255,255,0.5)" }}
          aria-label="Листать вниз"
        >
          <ChevronDown className="w-4 h-4 text-white/90" />
        </button>
      </section>

      {/* ── ПРИГЛАШЕНИЕ + арочное фото ── */}
      <section id="about-section" className="relative py-24 px-6 overflow-hidden">
        <CornerLeaf src={LEAF} pos="tl" width={150} className="opacity-40 -translate-x-6 -translate-y-2" />
        <CornerLeaf src={LEAF} pos="tr" width={170} flip className="opacity-60" delay={1.5} />

        <div className="max-w-xl mx-auto text-center relative z-10">
          <span className="block text-[11px] tracking-[0.32em] uppercase font-medium reveal mb-4" style={{ color: ACCENT }}>
            Wedding Day
          </span>
          <h2 className="font-serif text-4xl md:text-5xl reveal d1 mb-4" style={{ color: INK, fontWeight: 500 }}>
            Приглашаем вас
          </h2>
          <Ornament className="reveal d2 mb-8" />

          <p className="font-serif text-base md:text-lg leading-loose reveal d2" style={{ color: MUTED, fontWeight: 400 }}>
            Дорогие друзья и близкие! С большой радостью приглашаем вас разделить с нами один из
            самых важных дней нашей жизни. Будем счастливы видеть вас среди гостей нашего торжества.
          </p>

          {/* Арочное фото */}
          <div className="mt-12 reveal reveal-scale d3 mx-auto max-w-md">
            <div className="arch-top soft-card p-0 overflow-hidden">
              <img
                src={eventData.heroImage}
                alt="Джаъфар и Ситора"
                referrerPolicy="no-referrer"
                className="w-full h-[420px] object-cover"
                style={{ objectPosition: "50% 28%" }}
              />
              <div className="py-7 px-4 text-center" style={{ background: "rgba(237,236,234,0.85)" }}>
                <span className="block text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: ACCENT }}>
                  Наша свадьба
                </span>
                <div className="font-serif text-3xl md:text-4xl mb-3" style={{ color: ACCENT_DEEP, fontWeight: 500 }}>
                  29 августа 2026
                </div>
                <Ornament />
                <span className="block mt-3 text-[11px] uppercase tracking-[0.25em] font-light" style={{ color: MUTED }}>
                  Мы будем рады видеть вас!
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── КОГДА: обратный отсчёт ── */}
      <section id="when-section" className="relative py-24 px-6 overflow-hidden" style={{ background: "transparent" }}>
        <CornerLeaf src={LEAF} pos="bl" width={160} className="opacity-50" />
        <CornerLeaf src={LEAF} pos="tr" width={130} flip className="opacity-30" delay={2} />

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <span className="block text-[11px] tracking-[0.32em] uppercase font-medium reveal mb-4" style={{ color: ACCENT }}>
            До нашей свадьбы осталось
          </span>
          <Ornament className="reveal d1 mb-8" />

          {/* Огромное число дней */}
          <div className="reveal reveal-scale d1 mb-2">
            <div className="font-serif leading-none" style={{ color: ACCENT, fontSize: "min(34vw, 200px)", fontWeight: 500 }}>
              {countdown.days}
            </div>
            <div className="font-serif italic text-3xl -mt-3" style={{ color: ACCENT }}>
              {dayWord(countdown.days)}
            </div>
          </div>

          {/* Часы / минуты / секунды */}
          <div className="grid grid-cols-3 gap-3 md:gap-5 max-w-sm mx-auto mt-8 reveal d2">
            {[
              { label: "часов", val: countdown.hours },
              { label: "минут", val: countdown.minutes },
              { label: "секунд", val: countdown.seconds },
            ].map((node, i) => (
              <div key={i} className="soft-card py-5 rounded-sm">
                <div className="font-serif text-3xl md:text-4xl" style={{ color: ACCENT_DEEP, fontWeight: 500 }}>
                  {String(node.val).padStart(2, "0")}
                </div>
                <div className="text-[9px] uppercase tracking-[0.18em] font-light mt-1.5" style={{ color: MUTED }}>
                  {node.label}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-10 text-sm md:text-base font-light leading-relaxed reveal d3" style={{ color: MUTED }}>
            До самого важного дня мы отсчитываем каждую минуту
            <br className="hidden md:block" /> и с нетерпением ждём встречи с вами!
          </p>
        </div>
      </section>

      {/* ── ГДЕ И КОГДА: локация ── */}
      <section id="location-section" className="relative overflow-hidden">
        {/* Фото-шапка с волнистым низом */}
        <div className="relative">
          <div className="relative h-[300px] md:h-[380px] overflow-hidden wavy-bottom">
            <img
              src="/photo3.jpg"
              alt={eventData.coordinates.placeName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(40,50,58,0.45), rgba(40,50,58,0.15) 45%, rgba(40,50,58,0.05))" }} />
            <div className="absolute top-0 left-0 right-0 pt-20 px-6 text-center">
              <Ornament className="mb-3" color="#ffffff" />
              <h2 className="font-serif text-4xl md:text-5xl text-white drop-shadow" style={{ fontWeight: 500 }}>
                Где и когда?
              </h2>
              <p className="mt-3 text-sm font-light text-white/85 max-w-xs mx-auto">
                Мы с удовольствием поделимся с вами местом, где всё начнётся.
              </p>
            </div>
          </div>

          {/* Пин-карточка по центру края */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-7 z-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: ACCENT }}>
              <MapPin className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="px-6 pt-14 pb-24 max-w-2xl mx-auto text-center">
          <h3 className="font-serif text-3xl md:text-4xl reveal" style={{ color: INK, fontWeight: 500 }}>
            {eventData.coordinates.placeName}
          </h3>
          <Ornament className="reveal d1 my-4" />
          <div className="flex items-center justify-center gap-1.5 reveal d1 mb-7" style={{ color: MUTED }}>
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-light">{eventData.coordinates.address}</span>
          </div>

          <a
            id="maps-btn"
            href={`https://www.google.com/maps/search/?api=1&query=${eventData.coordinates.lat},${eventData.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="reveal d2 inline-flex items-center gap-2.5 py-3.5 px-9 rounded-full text-sm font-light tracking-wide text-white transition-all duration-300 shadow-md"
            style={{ background: ACCENT }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = ACCENT_DEEP)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = ACCENT)}
          >
            <MapPin className="w-4 h-4" />
            <span>Открыть маршрут</span>
          </a>

          {/* Инфо-плитки */}
          <div className="grid grid-cols-3 gap-2 md:gap-3 mt-10 reveal d3">
            {[
              { icon: Clock, top: "Сбор гостей", bot: "18:00" },
              { icon: MapPin, top: eventData.coordinates.placeName, bot: "Навбахор, 14" },
              { icon: Car, top: "Парковка", bot: "есть" },
            ].map((t, i) => {
              const Icon = t.icon;
              return (
                <div key={i} className="soft-card rounded-lg py-5 px-2 flex flex-col items-center gap-2">
                  <Icon className="w-5 h-5" style={{ color: ACCENT, opacity: 0.7 }} />
                  <span className="text-xs font-medium leading-tight" style={{ color: INK }}>{t.top}</span>
                  <span className="text-xs font-light" style={{ color: MUTED }}>{t.bot}</span>
                </div>
              );
            })}
          </div>

          {/* Карта */}
          <div className="mt-6 reveal d3 rounded-lg overflow-hidden soft-card p-0">
            <iframe
              title="Карта"
              width="100%"
              height="220"
              style={{ border: 0, display: "block", filter: "grayscale(20%) contrast(0.96) brightness(1.02)" }}
              loading="lazy"
              allowFullScreen
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(eventData.coordinates.lng) - 0.005}%2C${parseFloat(eventData.coordinates.lat) - 0.003}%2C${parseFloat(eventData.coordinates.lng) + 0.005}%2C${parseFloat(eventData.coordinates.lat) + 0.003}&layer=mapnik&marker=${eventData.coordinates.lat}%2C${eventData.coordinates.lng}`}
            />
          </div>
        </div>
      </section>

      {/* ── ПРОГРАММА ── */}
      <section id="schedule-section" ref={scheduleRef} className="relative py-20 px-6 overflow-hidden" style={{ background: "transparent" }}>
        <CornerLeaf src={LEAF} pos="bl" width={170} className="opacity-50" />

        <div className="max-w-xl mx-auto relative z-10">
          {/* Заголовок в стиле макета: Программа + курсивное дня */}
          <div className="text-center mb-10 reveal">
            <h2 className="font-serif inline" style={{ color: INK, fontWeight: 500, fontSize: "clamp(2.4rem,8vw,3.2rem)" }}>
              Программа{" "}
              <em style={{ color: ACCENT, fontWeight: 400 }}>дня</em>
            </h2>
          </div>
          <Ornament className="reveal d1 mb-12" />

          {/* Строки расписания */}
          <div>
            {eventData.schedule.map((item, i) => {
              const isPhoto = item.icon === "camera";
              return (
                <div key={i} id={`schedule-timeline-item-${i}`}>
                  {isPhoto ? (
                    /* ── Выделенная строка фотосессии: пунктирная рамка ── */
                    <div
                      className="reveal d1 flex gap-6 px-5 py-5 my-3 rounded-sm"
                      style={{
                        border: `1.5px dashed rgba(93,116,136,0.55)`,
                        background: "rgba(93,116,136,0.05)",
                      }}
                    >
                      <div className="w-16 shrink-0">
                        <span
                          className="font-serif italic"
                          style={{ color: ACCENT, fontSize: "1.35rem", fontWeight: 400 }}
                        >
                          {item.time}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4
                          className="text-sm tracking-[0.14em] uppercase font-medium flex items-center gap-2"
                          style={{ color: ACCENT_DEEP }}
                        >
                          <Camera className="w-3.5 h-3.5 shrink-0" />
                          {item.title}
                        </h4>
                        <p
                          className="text-sm font-light leading-relaxed mt-1.5 italic"
                          style={{ color: MUTED }}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* ── Обычная строка: время + разделитель + заголовок+описание ── */
                    <div
                      className={`reveal flex gap-6 py-5 ${i < eventData.schedule.length - 1 && !isPhoto ? "border-b" : ""}`}
                      style={{ borderColor: "var(--color-line)" }}
                    >
                      <div className="w-16 shrink-0">
                        <span
                          className="font-serif italic"
                          style={{ color: ACCENT, fontSize: "1.35rem", fontWeight: 400 }}
                        >
                          {item.time}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4
                          className="text-xs tracking-[0.14em] uppercase font-semibold mb-1.5"
                          style={{ color: INK }}
                        >
                          {item.title}
                        </h4>
                        <p className="text-sm font-light leading-relaxed" style={{ color: MUTED }}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ДРЕСС-КОД: слайдер ── */}
      <section id="dress-code-section" className="relative py-20 px-6 overflow-hidden">
        <CornerLeaf src={LEAF} pos="tr" width={150} flip className="opacity-40" />
        <CornerLeaf src={LEAF} pos="bl" width={150} className="opacity-40" delay={1.8} />

        <div className="max-w-md mx-auto relative z-10">
          {/* Заголовок */}
          <div className="text-center mb-3 reveal">
            <span className="block text-[11px] tracking-[0.32em] uppercase font-medium mb-4" style={{ color: ACCENT }}>
              Пожелание
            </span>
            <h2 className="font-serif inline" style={{ color: INK, fontWeight: 500, fontSize: "clamp(2.4rem,8vw,3.2rem)" }}>
              Дресс-<em style={{ color: ACCENT_DEEP, fontWeight: 400 }}>код</em>
            </h2>
          </div>
          <Ornament className="reveal d1 mb-6" />

          <p className="text-center font-serif italic text-lg reveal d2 mb-8 leading-snug" style={{ color: MUTED }}>
            Листайте, чтобы узнать<br />наши пожелания к образу
          </p>

          <DressCodeSlider accentDeep={ACCENT_DEEP} muted={MUTED} ink={INK} />
        </div>
      </section>

      {/* ── RSVP ── */}
      <section id="rsvp-section" className="relative py-24 px-6 overflow-hidden" style={{ background: "transparent" }}>
        <CornerLeaf src={LEAF} pos="tr" width={160} flip className="opacity-50" />
        <CornerLeaf src={LEAF} pos="bl" width={130} className="opacity-30" delay={2} />

        <div className="max-w-xl mx-auto relative z-10">
          <SectionTitle eyebrow="Подтверждение участия" title="RSVP" />
          <p className="text-center text-sm font-light reveal -mt-6 mb-8" style={{ color: MUTED }}>
            Пожалуйста, подтвердите участие до 1 июля 2026 года.
          </p>
          <div className="reveal d1">
            <RsvpForm onSuccess={refreshRsvps} />
          </div>
        </div>
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
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(40,50,58,0.5) 0%, rgba(40,50,58,0.32) 50%, rgba(40,50,58,0.62) 100%)" }} />
        </div>

        <div className="relative z-10 space-y-6 max-w-lg reveal reveal-blur">
          <h2 className="font-serif text-5xl md:text-6xl text-white leading-tight" style={{ fontWeight: 500 }}>
            До скорой
            <br />
            встречи!
          </h2>
          <div className="flex items-center justify-center gap-3 text-white/80">
            <span className="h-px w-14" style={{ background: "rgba(255,255,255,0.5)" }} />
            <Sprig color="#ffffff" />
            <span className="h-px w-14" style={{ background: "rgba(255,255,255,0.5)" }} />
          </div>
          <p className="text-xs uppercase tracking-[0.28em] font-light text-white/85 leading-relaxed">
            С нетерпением ждём встречи,
            <br />
            {eventData.groomName} &amp; {eventData.brideName}
          </p>
        </div>

        <div className="absolute bottom-6 left-0 right-0 z-10 text-[9px] tracking-[0.25em] uppercase font-light text-white/55">
          © 2026 · {eventData.coupleNames}
        </div>
      </section>

      {/* ── Плавающая навигация (моб.) ── */}
      {showFloatNav && (
        <div
          id="mobile-float-navigation-dock"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center justify-around gap-1 p-1.5 rounded-full shadow-xl backdrop-blur-md max-w-[95vw] md:hidden transition-all duration-300"
          style={{ background: "rgba(248,245,239,0.94)", border: "1px solid var(--color-line)" }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`float-nav-btn-${item.id}`}
                onClick={() => scrollTo(item.id)}
                className="flex flex-col items-center justify-center gap-1 py-1.5 px-2.5 min-w-[52px] rounded-full transition-all duration-300 cursor-pointer"
                style={{
                  color: isCurrent ? "#fff" : MUTED,
                  background: isCurrent ? ACCENT : "transparent",
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

// Склонение слова «день» под число
function dayWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "дня";
  return "дней";
}
