import React, { useEffect, useRef, useState } from "react";
import { Music2, Volume2 } from "lucide-react";

const ACCENT = "#2b4050";

// Кладите файл в public/music.mp3
const MUSIC_SRC = "/music.mp3";

export default function AudioPlayer({ compact = false }: { compact?: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [available, setAvailable] = useState(true);

  // Проверяем, что файл существует, иначе прячем кнопку
  useEffect(() => {
    fetch(MUSIC_SRC, { method: "HEAD" })
      .then((r) => {
        const type = r.headers.get("content-type") || "";
        if (!r.ok || type.includes("text/html")) setAvailable(false);
      })
      .catch(() => setAvailable(false));
  }, []);

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
          v = Math.min(0.6, v + 0.05);
          audio.volume = v;
          if (v >= 0.6) clearInterval(fade);
        }, 60);
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }
  };

  if (!available) {
    // Если музыки нет, в compact-режиме всё равно отдаём пустой слот ширины, чтобы шапка не «прыгала»
    return compact ? <span className="w-9 h-9 block" aria-hidden /> : null;
  }

  // Компактный режим — круглая иконка-нота для шапки
  if (compact) {
    return (
      <>
        <audio ref={audioRef} src={MUSIC_SRC} loop preload="none" />
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

  // Полный режим (запасной)
  return (
    <>
      <audio ref={audioRef} src={MUSIC_SRC} loop preload="none" />
      <button
        id="ambient-sound-toggle"
        onClick={toggle}
        title="Фоновая музыка"
        className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-sm transition-all duration-300 cursor-pointer"
        style={{
          background: isPlaying ? "rgba(93,116,136,0.18)" : "rgba(248,245,239,0.85)",
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
