<script lang="ts">
	import { PUBLIC_BUNNY_LIBRARY_ID, PUBLIC_BUNNY_VIDEO_ID } from "$app/env/public";
	import DemoPlayer from "#lib/components/DemoPlayer.svelte";
</script>

<main>
	<h1>Bunny Player with SvelteKit</h1>
	<p>
		The server renders a placeholder, then the browser loads <code>player.js</code> and swaps in
		the player.
	</p>
	<DemoPlayer libraryId={PUBLIC_BUNNY_LIBRARY_ID} videoId={PUBLIC_BUNNY_VIDEO_ID} />
</main>
