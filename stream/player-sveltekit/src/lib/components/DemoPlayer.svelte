<script lang="ts">
	import type { Player, TimeUpdate } from "player.js";
	import BunnyPlayer from "./BunnyPlayer.svelte";

	let { libraryId, videoId }: { libraryId: string; videoId: string } = $props();

	const rates = [1, 1.5, 2];

	let player: Player | null = $state.raw(null);
	let playing = $state(false);
	let muted = $state(false);
	let rate = $state(1);
	let time: TimeUpdate = $state({ seconds: 0, duration: 0 });
	let log: string[] = $state([]);

	function formatTime(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const rest = Math.floor(seconds % 60);

		return `${minutes}:${String(rest).padStart(2, "0")}`;
	}

	function record(event: string) {
		log = [`${new Date().toLocaleTimeString()}  ${event}`, ...log].slice(0, 5);
	}

	function toggleMute() {
		const instance = player;
		if (!instance) return;

		// Ask the player first, because viewers can also mute from its own controls.
		instance.getMuted((isMuted) => {
			if (isMuted) instance.unmute();
			else instance.mute();
			muted = !isMuted;
		});
	}

	function changeRate(value: number) {
		// npm player.js 0.1.0 has no setPlaybackRate(), so send the raw command.
		player?.send({ method: "setPlaybackRate", value });
		rate = value;
	}
</script>

<BunnyPlayer
	{libraryId}
	{videoId}
	params={{ preload: true }}
	onready={(instance) => {
		player = instance;
		// Library settings can autoplay or start muted, so read the real state.
		instance.getPaused((paused) => (playing = !paused));
		instance.getMuted((isMuted) => (muted = isMuted));
		instance.on("playbackratechange", (value) => (rate = value));
		record("ready");
	}}
	onplay={() => {
		playing = true;
		record("play");
	}}
	onpause={() => {
		playing = false;
		record("pause");
	}}
	onended={() => {
		playing = false;
		record("ended");
	}}
	ontimeupdate={(update) => (time = update)}
/>

<progress max={time.duration || 1} value={time.seconds}></progress>

<div class="controls">
	<button type="button" disabled={!player} onclick={() => (playing ? player?.pause() : player?.play())}>
		{playing ? "Pause" : "Play"}
	</button>
	<button type="button" disabled={!player} onclick={() => player?.setCurrentTime(0)}>Restart</button>
	<button type="button" disabled={!player} onclick={toggleMute}>
		{muted ? "Unmute" : "Mute"}
	</button>
	{#each rates as value (value)}
		<button
			type="button"
			disabled={!player}
			aria-pressed={rate === value}
			onclick={() => changeRate(value)}
		>
			{value}x
		</button>
	{/each}
	<span class="time">{formatTime(time.seconds)} / {formatTime(time.duration)}</span>
</div>

<ol class="log" aria-label="Player events">
	{#each log as entry, index (index)}
		<li>{entry}</li>
	{:else}
		<li>Waiting for the player…</li>
	{/each}
</ol>
