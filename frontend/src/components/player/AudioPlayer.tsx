"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react";
import { formatTimestamp } from "@/lib/utils";

interface Props {
  duration: number;
  currentTime: number;
  onTimeUpdate: (t: number) => void;
  onSeek: (t: number) => void;
}

export default function AudioPlayer({ duration, currentTime, onTimeUpdate, onSeek }: Props) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const internalTimeRef = useRef(currentTime);

  // sync external seek into internal state
  useEffect(() => {
    internalTimeRef.current = currentTime;
  }, [currentTime]);

  // simulate playback
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        internalTimeRef.current = Math.min(
          internalTimeRef.current + 0.1,
          duration
        );
        onTimeUpdate(internalTimeRef.current);
        if (internalTimeRef.current >= duration) {
          setPlaying(false);
        }
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, duration, onTimeUpdate]);

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    internalTimeRef.current = t;
    onSeek(t);
  };

  const skip = (delta: number) => {
    const next = Math.max(0, Math.min(duration, internalTimeRef.current + delta));
    internalTimeRef.current = next;
    onSeek(next);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl px-6 py-4 shadow-sm overflow-hidden">
      {/* Waveform visualization (simulated) */}
      <div className="flex items-center gap-0.5 mb-4 h-10">
        {Array.from({ length: 80 }).map((_, i) => {
          const barProgress = (i / 80) * 100;
          const isPlayed = barProgress <= progress;
          const height = 20 + Math.sin(i * 0.5) * 12 + Math.sin(i * 1.3) * 6;
          return (
            <div
              key={i}
              className="flex-1 rounded-full transition-colors duration-100"
              style={{
                height: `${height}px`,
                background: isPlayed ? "#7c3aed" : "#e2e8f0",
                opacity: isPlayed ? 1 : 0.6,
              }}
            />
          );
        })}
      </div>

      {/* Scrubber */}
      <input
        type="range"
        min={0}
        max={duration}
        step={0.1}
        value={currentTime}
        onChange={handleScrub}
        className="w-full mb-3"
        style={{
          background: `linear-gradient(to right, #7c3aed ${progress}%, #e2e8f0 ${progress}%)`,
        }}
      />

      {/* Controls row */}
      <div className="flex items-center gap-4">
        {/* Time */}
        <span className="text-xs font-mono text-slate-500 w-16 shrink-0">
          {formatTimestamp(currentTime)} / {formatTimestamp(duration)}
        </span>

        {/* Play controls */}
        <div className="flex items-center gap-3 mx-auto">
          <button
            onClick={() => skip(-10)}
            className="p-2 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
            title="Back 10s"
          >
            <SkipBack size={18} />
          </button>

          <button
            onClick={() => setPlaying(!playing)}
            className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-md shadow-purple-200 transition-colors"
          >
            {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>

          <button
            onClick={() => skip(10)}
            className="p-2 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
            title="Forward 10s"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 shrink-0" style={{ width: "100px" }}>
          <button
            onClick={() => setMuted(!muted)}
            className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          >
            {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <div className="flex-1 overflow-hidden">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
              className="w-full block"
            />
          </div>
        </div>
      </div>

      {/* Playback hint */}
      <p className="text-center text-xs text-slate-400 mt-3">
        Audio playback simulated · Click any transcript line to jump to that moment
      </p>
    </div>
  );
}
