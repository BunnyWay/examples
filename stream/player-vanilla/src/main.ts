import { createBunnyPlayer } from "./bunny-player";
import "./index.css";

const libraryId = import.meta.env.VITE_BUNNY_LIBRARY_ID;
const videoId = import.meta.env.VITE_BUNNY_VIDEO_ID;
const rates = [1, 1.5, 2];
const app = document.querySelector<HTMLDivElement>("#app")!;

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);

  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function renderDemo(libraryId: string, videoId: string) {
  app.innerHTML = `
    <main>
      <h1>Bunny Player with vanilla JavaScript</h1>
      <p>An embedded Bunny Stream video controlled with <code>player.js</code>.</p>
      <div id="player"></div>
      <progress max="1" value="0"></progress>
      <div class="controls">
        <button type="button" id="play" disabled>Play</button>
        <button type="button" id="restart" disabled>Restart</button>
        <button type="button" id="mute" disabled>Mute</button>
        ${rates
          .map(
            (value) =>
              `<button type="button" data-rate="${value}" aria-pressed="${value === 1}" disabled>${value}x</button>`,
          )
          .join("")}
        <span class="time">0:00 / 0:00</span>
      </div>
      <ol class="log" aria-label="Player events">
        <li>Waiting for the player…</li>
      </ol>
    </main>
  `;

  const buttons = app.querySelectorAll("button");
  const playButton = app.querySelector<HTMLButtonElement>("#play")!;
  const restartButton = app.querySelector<HTMLButtonElement>("#restart")!;
  const muteButton = app.querySelector<HTMLButtonElement>("#mute")!;
  const rateButtons = app.querySelectorAll<HTMLButtonElement>("[data-rate]");
  const progress = app.querySelector("progress")!;
  const time = app.querySelector<HTMLSpanElement>(".time")!;
  const log = app.querySelector<HTMLOListElement>(".log")!;

  let playing = false;
  let entries: string[] = [];

  const setPlaying = (value: boolean) => {
    playing = value;
    playButton.textContent = value ? "Pause" : "Play";
  };

  const setMuted = (value: boolean) => {
    muteButton.textContent = value ? "Unmute" : "Mute";
  };

  const setRate = (value: number) => {
    for (const button of rateButtons) {
      button.setAttribute("aria-pressed", String(Number(button.dataset.rate) === value));
    }
  };

  const record = (event: string) => {
    entries = [`${new Date().toLocaleTimeString()}  ${event}`, ...entries].slice(0, 5);
    log.replaceChildren(
      ...entries.map((entry) => Object.assign(document.createElement("li"), { textContent: entry })),
    );
  };

  const player = createBunnyPlayer(app.querySelector("#player")!, {
    libraryId,
    videoId,
    params: { preload: true },
  });

  player.on("ready", () => {
    for (const button of buttons) button.disabled = false;
    // Library settings can autoplay or start muted, so read the real state.
    player.getPaused((paused) => setPlaying(!paused));
    player.getMuted(setMuted);
    record("ready");
  });
  player.on("play", () => {
    setPlaying(true);
    record("play");
  });
  player.on("pause", () => {
    setPlaying(false);
    record("pause");
  });
  player.on("ended", () => {
    setPlaying(false);
    record("ended");
  });
  player.on("timeupdate", ({ seconds, duration }) => {
    progress.max = duration || 1;
    progress.value = seconds;
    time.textContent = `${formatTime(seconds)} / ${formatTime(duration)}`;
  });
  player.on("playbackratechange", setRate);

  playButton.addEventListener("click", () => (playing ? player.pause() : player.play()));
  restartButton.addEventListener("click", () => player.setCurrentTime(0));

  muteButton.addEventListener("click", () => {
    // Ask the player first, because viewers can also mute from its own controls.
    player.getMuted((isMuted) => {
      if (isMuted) player.unmute();
      else player.mute();
      setMuted(!isMuted);
    });
  });

  for (const button of rateButtons) {
    button.addEventListener("click", () => {
      const value = Number(button.dataset.rate);
      // npm player.js 0.1.0 has no setPlaybackRate(), so send the raw command.
      player.send({ method: "setPlaybackRate", value });
      setRate(value);
    });
  }
}

if (libraryId && videoId) {
  renderDemo(libraryId, videoId);
} else {
  app.innerHTML = `
    <main>
      <h1>Bunny Player with vanilla JavaScript</h1>
      <div class="empty">
        Set <code>VITE_BUNNY_LIBRARY_ID</code> and <code>VITE_BUNNY_VIDEO_ID</code> in
        <code>.env</code>, then restart the dev server.
      </div>
    </main>
  `;
}
