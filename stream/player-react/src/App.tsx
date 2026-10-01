import { useState } from "react";
import type { Player, TimeUpdate } from "player.js";
import { BunnyPlayer } from "./components/bunny-player";

const libraryId = import.meta.env.VITE_BUNNY_LIBRARY_ID;
const videoId = import.meta.env.VITE_BUNNY_VIDEO_ID;
const rates = [1, 1.5, 2];

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);

  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export default function App() {
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

  if (!libraryId || !videoId) {
    return (
      <main>
        <h1>Bunny Player with React</h1>
        <div className="empty">
          Set <code>VITE_BUNNY_LIBRARY_ID</code> and <code>VITE_BUNNY_VIDEO_ID</code> in{" "}
          <code>.env</code>, then restart the dev server.
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1>Bunny Player with React</h1>
      <p>
        An embedded Bunny Stream video controlled from React with <code>player.js</code>.
      </p>

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
    </main>
  );
}
