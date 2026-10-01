<script lang="ts">
	import { env } from "$env/dynamic/public";
	import DemoPlayer from "$lib/components/DemoPlayer.svelte";

	const libraryId = env.PUBLIC_BUNNY_LIBRARY_ID;
	const videoId = env.PUBLIC_BUNNY_VIDEO_ID;
</script>

<main>
	<h1>Bunny Player with SvelteKit</h1>
	{#if libraryId && videoId}
		<p>
			The server renders a placeholder, then the browser loads <code>player.js</code> and swaps in
			the player.
		</p>
		<DemoPlayer {libraryId} {videoId} />
	{:else}
		<div class="empty">
			Set <code>PUBLIC_BUNNY_LIBRARY_ID</code> and <code>PUBLIC_BUNNY_VIDEO_ID</code> in
			<code>.env</code>, then restart the dev server.
		</div>
	{/if}
</main>
