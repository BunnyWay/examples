"use client";

import { useState } from "react";
import type { Player, TimeUpdate } from "player.js";
import { BunnyPlayer } from "@/components/bunny-player";

const rates = [1, 1.5, 2];

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);

  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function DemoPlayer({ libraryId, videoId }: { libraryId: string; videoId: string }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [time, setTime] = useState<TimeUpdate>({ seconds: 0, duration: 0 });
  const [log, setLog] = useState<string[]>([]);

  const record = (event: string) =>
    setLog((entries) => [`${new Date().toLocaleTimeString()}  ${event}`, ...entries].slice(0, 5));

  const toggleMute = () => {
    if (!player) return;

    // Ask the player first, because viewers can also mute from its own controls.
    player.getMuted((isMuted) => {
      if (isMuted) player.unmute();
      else player.mute();
      setMuted(!isMuted);
    });
  };

  const changeRate = (value: number) => {
    // npm player.js 0.1.0 has no setPlaybackRate(), so send the raw command.
    player?.send({ method: "setPlaybackRate", value });
    setRate(value);
  };

  return (
    <>

      <BunnyPlayer
        libraryId={libraryId}
        videoId={videoId}
        params={{ preload: true }}
        onReady={(instance) => {
          setPlayer(instance);
          // Library settings can autoplay or start muted, so read the real state.
          instance.getPaused((paused) => setPlaying(!paused));
          instance.getMuted(setMuted);
          instance.on("playbackratechange", setRate);
          record("ready");
        }}
        onPlay={() => {
          setPlaying(true);
          record("play");
        }}
        onPause={() => {
          setPlaying(false);
          record("pause");
        }}
        onEnded={() => {
          setPlaying(false);
          record("ended");
        }}
        onTimeUpdate={setTime}
      />

      <progress max={time.duration || 1} value={time.seconds} />

      <div className="controls">
        <button
          type="button"
          disabled={!player}
          onClick={() => (playing ? player?.pause() : player?.play())}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button type="button" disabled={!player} onClick={() => player?.setCurrentTime(0)}>
          Restart
        </button>
        <button type="button" disabled={!player} onClick={toggleMute}>
          {muted ? "Unmute" : "Mute"}
        </button>
        {rates.map((value) => (
          <button
            key={value}
            type="button"
            disabled={!player}
            aria-pressed={rate === value}
            onClick={() => changeRate(value)}
          >
            {value}x
          </button>
        ))}
        <span className="time">
          {formatTime(time.seconds)} / {formatTime(time.duration)}
        </span>
      </div>

      <ol className="log" aria-label="Player events">
        {log.length === 0 ? <li>Waiting for the player…</li> : null}
        {log.map((entry, index) => (
          <li key={index}>{entry}</li>
        ))}
      </ol>
    </>
  );
}
