import React, { useEffect, useRef, useState } from "react";
import { Music2, Volume2 } from "lucide-react";

const ACCENT = "#2b4050";
const MUSIC_SRC = "/music.mp3";

export default function AudioPlayer({ compact = false }: { compact?: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [available, setAvailable] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    fetch(MUSIC_SRC, { method: "HEAD" })
      .then((r) => {
        const type = r.headers.get("content-type") || "";
        if (!r.ok || type.includes("text/html")) setAvailable(false);
      })
      .catch(() => setAvailable(false));
  }, []);

  // Автозапуск при первом касании/клике в любом месте страницы
  useEffect(() => {
    if (!available || started) return;
    const tryPlay = async () => {
      const audio = audioRef.current;
      if (!audio || started) return;
      setStarted(true);
      try {
        audio.volume = 0;
        await audio.play();
        let v = 0;
        const fade = setInterval(() => {
          v = Math.min(0.5, v + 0.03);
          audio.volume = v;
          if (v >= 0.5) clearInterval(fade);
        }, 80);
        setIsPlaying(true);
      } catch {
        // браузер заблокировал — ждём следующего взаимодействия
        setStarted(false);
      }
    };
    document.addEventListener("click", tryPlay, { once: true });
    document.addEventListener("touchstart", tryPlay, { once: true });
    return () => {
      document.removeEventListener("click", tryPlay);
      document.removeEventListener("touchstart", tryPlay);
    };
  }, [available, started]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        audio.volume = 0;
        await audio.play();
        let v = 0;
        const fade = setInterval(() => {
          v = Math.min(0.5, v + 0.05);
          audio.volume = v;
          if (v >= 0.5) clearInterval(fade);
        }, 60);
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }
  };

  if (!available) {
    return compact ? <span className="w-9 h-9 block" aria-hidden /> : null;
  }

  if (compact) {
    return (
      <>
        <audio ref={audioRef} src={MUSIC_SRC} loop preload="auto" />
        <button
          id="ambient-sound-toggle"
          onClick={toggle}
          title="Фоновая музыка"
          aria-label="Фоновая музыка"
          className="w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer"
          style={{
            borderColor: ACCENT,
            background: isPlaying ? ACCENT : "transparent",
          }}
        >
          {isPlaying ? (
            <div className="flex gap-0.5 items-center h-3.5">
              <span className="w-0.5 h-2.5 rounded-full bg-white animate-bar-1" />
              <span className="w-0.5 h-3.5 rounded-full bg-white animate-bar-2" />
              <span className="w-0.5 h-2 rounded-full bg-white animate-bar-3" />
            </div>
          ) : (
            <Music2 className="w-4 h-4" style={{ color: ACCENT }} />
          )}
        </button>
      </>
    );
  }

  return (
    <>
      <audio ref={audioRef} src={MUSIC_SRC} loop preload="auto" />
      <button
        id="ambient-sound-toggle"
        onClick={toggle}
        title="Фоновая музыка"
        className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-sm transition-all duration-300 cursor-pointer"
        style={{
          background: isPlaying ? "rgba(43,64,80,0.18)" : "rgba(248,245,239,0.85)",
          border: `1px solid ${ACCENT}`,
          color: ACCENT,
        }}
      >
        <Volume2 className="w-4 h-4" />
        <span className="text-[10px] font-light tracking-[0.12em]">{isPlaying ? "Играет" : "Музыка"}</span>
      </button>
    </>
  );
}
