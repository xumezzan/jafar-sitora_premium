import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const ACCENT = "#54665e";

// Кладите файл в public/music.mp3 (обрезок припева — той же мелодии, под которую заходим).
const MUSIC_SRC = "/music.mp3";

export default function AudioPlayer() {
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
        // плавное появление громкости
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

  if (!available) return null;

  return (
    <>
      <audio ref={audioRef} src={MUSIC_SRC} loop preload="none" />
      <button
        id="ambient-sound-toggle"
        onClick={toggle}
        title="Фоновая музыка"
        className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 backdrop-blur-sm transition-all duration-300 cursor-pointer"
        style={{
          background: isPlaying ? "rgba(123,146,138,0.18)" : "rgba(238,240,236,0.85)",
          border: "1px solid rgba(84,102,94,0.3)",
          color: ACCENT,
        }}
      >
        {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-80" />}
        <span className="text-[10px] font-light tracking-[0.12em] hidden md:inline" style={{ color: ACCENT }}>
          {isPlaying ? "Играет музыка" : "Включить музыку"}
        </span>
        <div className="flex gap-0.5 justify-center items-center h-3">
          <span className={`w-0.5 h-2.5 rounded-full transition-all duration-300 ${isPlaying ? "animate-bar-1" : "opacity-40"}`} style={{ background: ACCENT }} />
          <span className={`w-0.5 h-3 rounded-full transition-all duration-300 ${isPlaying ? "animate-bar-2" : "opacity-40"}`} style={{ background: ACCENT }} />
          <span className={`w-0.5 h-2 rounded-full transition-all duration-300 ${isPlaying ? "animate-bar-3" : "opacity-40"}`} style={{ background: ACCENT }} />
        </div>
      </button>
    </>
  );
}
