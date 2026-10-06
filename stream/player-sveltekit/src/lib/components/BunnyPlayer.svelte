<script lang="ts">
	import { onMount } from "svelte";
	import type { Player, TimeUpdate } from "player.js";

	type PlayerJs = (typeof import("player.js"))["default"];

	type Props = {
		libraryId: string;
		videoId: string;
		/** Player parameters such as autoplay, muted, captions, or t. */
		params?: Record<string, string | number | boolean>;
		title?: string;
		onready?: (player: Player) => void;
		onplay?: () => void;
		onpause?: () => void;
		onended?: () => void;
		ontimeupdate?: (time: TimeUpdate) => void;
	};

	let {
		libraryId,
		videoId,
		params = {},
		title = "Video player",
		onready,
		onplay,
		onpause,
		onended,
		ontimeupdate,
	}: Props = $props();

	let playerjs: PlayerJs | null = $state.raw(null);
	let iframe: HTMLIFrameElement | undefined = $state();

	const src = $derived.by(() => {
		const query = new URLSearchParams(
			Object.entries(params).map(([key, value]) => [key, String(value)]),
		).toString();
		return `https://player.mediadelivery.net/embed/${libraryId}/${videoId}${query ? `?${query}` : ""}`;
	});

	onMount(async () => {
		// player.js reads window when imported, so load it in the browser only.
		playerjs = (await import("player.js")).default;
	});

	// Runs for every new iframe element, right after it is inserted
	// and before it has finished loading.
	$effect(() => {
		if (!playerjs || !iframe) return;

		let onMessage: EventListener = () => {};
		const addEvent = playerjs.addEvent;
		playerjs.addEvent = (elem, type, handler) => addEvent(elem, type, (onMessage = handler));
		const player = new playerjs.Player(iframe);
		playerjs.addEvent = addEvent;

		player.on("ready", () => onready?.(player));
		player.on("play", () => onplay?.());
		player.on("pause", () => onpause?.());
		player.on("ended", () => onended?.());
		player.on("timeupdate", (time) => ontimeupdate?.(time));

		return () => window.removeEventListener("message", onMessage);
	});
</script>

{#if playerjs}
	{#key src}
		<iframe
			bind:this={iframe}
			{src}
			{title}
			class="bunny-player"
			allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
			allowfullscreen
		></iframe>
	{/key}
{:else}
	<!-- Hold the space until player.js is loaded so the iframe cannot
	     finish loading before the Player exists. -->
	<div class="bunny-player" aria-hidden="true"></div>
{/if}

<style>
	.bunny-player {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 16 / 9;
		border: 0;
		background: #000;
	}
</style>
