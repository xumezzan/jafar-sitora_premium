import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Music } from "lucide-react";
import { EventConceptId } from "../types";

interface AudioPlayerProps {
  concept: EventConceptId;
}

export default function AudioPlayer({ concept }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const windVolumeRef = useRef<GainNode | null>(null);
  const crackleVolumeRef = useRef<GainNode | null>(null);
  const musicVolumeRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<any>(null);

  // Initialize Web Audio API nodes
  const initAudio = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0.0, ctx.currentTime);
      mainGain.connect(ctx.destination);
      gainNodeRef.current = mainGain;

      // 1. Synth Wind Node (Filtered Pink/White Noise)
      // Generate white noise buffer
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink noise approximation
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // rescue safety gain
        b6 = white * 0.115926;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Filter for wind howling sound
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.setValueAtTime(4.0, ctx.currentTime);
      filter.frequency.setValueAtTime(400, ctx.currentTime);

      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(0.0, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(windGain);
      windGain.connect(mainGain);
      noiseSource.start();
      windVolumeRef.current = windGain;

      // Modulate wind frequency for natural gusting
      const modulator = ctx.createOscillator();
      modulator.type = "sine";
      modulator.frequency.setValueAtTime(0.08, ctx.currentTime); // very slow speed

      const modGain = ctx.createGain();
      modGain.gain.setValueAtTime(120, ctx.currentTime); // frequency variation range

      modulator.connect(modGain);
      modGain.connect(filter.frequency);
      modulator.start();

      // 2. Fire Crackle Node (Short randomized clicks)
      const crackleGain = ctx.createGain();
      crackleGain.gain.setValueAtTime(0.0, ctx.currentTime);
      crackleGain.connect(mainGain);
      crackleVolumeRef.current = crackleGain;

      // Synthesize campfire crackles actively using intervals
      let clickTimer = 0;
      const synthCrackle = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === "suspended") return;
        
        // Random clicks
        if (Math.random() < 0.28) {
          const osc = ctx.createOscillator();
          const filterNode = ctx.createBiquadFilter();
          const clickGain = ctx.createGain();

          osc.type = "triangle";
          // crackle or high pop
          osc.frequency.setValueAtTime(100 + Math.random() * 1200, ctx.currentTime);
          
          filterNode.type = "bandpass";
          filterNode.frequency.setValueAtTime(2000, ctx.currentTime);
          filterNode.Q.setValueAtTime(10.0, ctx.currentTime);

          clickGain.gain.setValueAtTime(0, ctx.currentTime);
          clickGain.gain.linearRampToValueAtTime(0.015 + Math.random() * 0.04, ctx.currentTime + 0.001);
          clickGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02 + Math.random() * 0.04);

          osc.connect(filterNode);
          filterNode.connect(clickGain);
          clickGain.connect(crackleGain);

          osc.start();
          osc.stop(ctx.currentTime + 0.1);
        }

        // Deep flame rumble
        if (Math.random() < 0.05) {
          const rumble = ctx.createOscillator();
          const rumbleFilter = ctx.createBiquadFilter();
          const rumbleGain = ctx.createGain();

          rumble.type = "sawtooth";
          rumble.frequency.setValueAtTime(40 + Math.random() * 30, ctx.currentTime);

          rumbleFilter.type = "lowpass";
          rumbleFilter.frequency.setValueAtTime(100, ctx.currentTime);

          rumbleGain.gain.setValueAtTime(0.0, ctx.currentTime);
          rumbleGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.2);
          rumbleGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

          rumble.connect(rumbleFilter);
          rumbleFilter.connect(rumbleGain);
          rumbleGain.connect(crackleGain);

          rumble.start();
          rumble.stop(ctx.currentTime + 0.7);
        }
      };

      intervalRef.current = setInterval(synthCrackle, 50);

      // 3. Gentle Ambient Arpeggio (Atmosphere chords)
      const musicGain = ctx.createGain();
      musicGain.gain.setValueAtTime(0.0, ctx.currentTime);
      musicGain.connect(mainGain);
      musicVolumeRef.current = musicGain;

      // Soft ambient pulse note generator
      // Root frequencies: A minor (A2, C3, E3, A3, B3, G3) etc.
      const chordRoots = [
        [110.00, 130.81, 164.81, 220.00], // Am
        [87.31, 130.81, 174.61, 220.00],  // F maj
        [130.81, 164.81, 196.00, 261.63], // C maj
        [98.00, 146.83, 196.00, 246.94]   // G maj
      ];

      let currentChordIdx = 0;
      let step = 0;

      const playAmbientArpeggio = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === "suspended") return;
        if (gainNodeRef.current && gainNodeRef.current.gain.value < 0.01) return;

        const chord = chordRoots[currentChordIdx];
        const freq = chord[step % chord.length];

        const noteOsc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        const delay = ctx.createDelay();
        const delayGain = ctx.createGain();

        // Extra soft sine wave
        noteOsc.type = "sine";
        noteOsc.frequency.setValueAtTime(freq, ctx.currentTime);

        noteGain.gain.setValueAtTime(0, ctx.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.4); // soft attack
        noteGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.0); // long decay

        // Subtle tape echo effect
        delay.delayTime.setValueAtTime(0.45, ctx.currentTime);
        delayGain.gain.setValueAtTime(0.35, ctx.currentTime);

        noteOsc.connect(noteGain);
        noteGain.connect(musicGain);
        
        // feedback delay loop
        noteGain.connect(delay);
        delay.connect(delayGain);
        delayGain.connect(delay);
        delayGain.connect(musicGain);

        noteOsc.start();
        noteOsc.stop(ctx.currentTime + 4.0);

        step++;
        if (step % 8 === 0) {
          // Switch chord
          currentChordIdx = (currentChordIdx + 1) % chordRoots.length;
        }
      };

      // Play soft notes every 1.5 seconds
      const musicInterval = setInterval(playAmbientArpeggio, 1500);
      
      // Cleanup on destory
      const oldInterval = intervalRef.current;
      intervalRef.current = {
        clear: () => {
          clearInterval(oldInterval);
          clearInterval(musicInterval);
        }
      };

    } catch (err) {
      console.error("Web Audio initialization failed:", err);
    }
  };

  // Adjust volume levels depending on concept
  useEffect(() => {
    if (!audioCtxRef.current || !gainNodeRef.current) return;

    const ctx = audioCtxRef.current;
    
    // Smooth transition between volumes
    const t = ctx.currentTime;
    const transitionTime = 1.0;

    // Wind: low, crackle: none, music: warm, soft
    windVolumeRef.current?.gain.linearRampToValueAtTime(0.12, t + transitionTime);
    crackleVolumeRef.current?.gain.linearRampToValueAtTime(0.0, t + transitionTime);
    musicVolumeRef.current?.gain.linearRampToValueAtTime(0.5, t + transitionTime);
  }, [isPlaying]);

  const toggleSound = async () => {
    initAudio();

    if (!audioCtxRef.current) return;

    if (audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }

    const targetGain = isPlaying ? 0.0 : 1.0;
    
    // Fade in or fade out main volume smoothly so it doesn't click
    gainNodeRef.current?.gain.linearRampToValueAtTime(targetGain, audioCtxRef.current.currentTime + 0.8);
    setIsPlaying(!isPlaying);
  };

  // Clean intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current && typeof intervalRef.current.clear === "function") {
        intervalRef.current.clear();
      }
    };
  }, []);

  // Theme-specific colors and labels
  const getButtonStyles = () => {
    return {
      bg: isPlaying ? "bg-[#1A2E22] text-[#FDFDFB]" : "bg-white/80 text-[#1A2E22]",
      border: "border border-[#1A2E22]/20",
      hover: "hover:bg-[#1A2E22] hover:text-[#FDFDFB]"
    };
  };

  const style = getButtonStyles();

  return (
    <button
      id="ambient-sound-toggle"
      onClick={toggleSound}
      title="Звуки природы"
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 pointer-events-auto cursor-pointer ${style.bg} ${style.border} ${style.hover}`}
    >
      {isPlaying ? (
        <>
          <Volume2 className="w-4.5 h-4.5 animate-pulse" />
          <span className="text-[11px] font-medium tracking-tight h-5 flex items-center md:inline hidden">
            Звук активности
          </span>
        </>
      ) : (
        <>
          <VolumeX className="w-4.5 h-4.5 opacity-80" />
          <span className="text-[11px] font-medium tracking-tight h-5 flex items-center md:inline hidden">
            Включить атмосферу
          </span>
        </>
      )}
      <div className="flex gap-0.5 justify-center items-center h-3">
        <span className={`w-0.5 h-2.5 bg-current rounded-full transition-all duration-300 ${isPlaying ? "animate-bar-1" : "scale-y-40 origin-bottom"}`} />
        <span className={`w-0.5 h-3 bg-current rounded-full transition-all duration-300 ${isPlaying ? "animate-bar-2" : "scale-y-30 origin-bottom"}`} />
        <span className={`w-0.5 h-2 bg-current rounded-full transition-all duration-300 ${isPlaying ? "animate-bar-3" : "scale-y-50 origin-bottom"}`} />
      </div>
    </button>
  );
}
