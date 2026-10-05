<script lang="ts">
	let { data } = $props();

	const expires = $derived(data.embed ? new Date(data.embed.expires * 1000) : null);
	// Formatted in UTC so the server render and the browser agree on the text.
	const expiresLabel = $derived(
		expires?.toLocaleTimeString("en-GB", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" }),
	);
</script>

<main>
	<h1>Token-authenticated Bunny Player in SvelteKit</h1>
	<p>
		A load function signs the embed URL with your token authentication key. The browser only sees
		the token, never the key.
	</p>
	{#if data.embed && expires}
		<iframe
			src={data.embed.url}
			title="Video player"
			class="player"
			allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
			allowfullscreen
		></iframe>
		<p class="expires">
			This link expires at <time datetime={expires.toISOString()}>{expiresLabel} UTC</time>. Reload
			the page to sign a new one.
		</p>
	{:else}
		<div class="empty">
			Copy <code>.env.example</code> to <code>.env</code> and set
			<code>BUNNY_STREAM_LIBRARY_ID</code>, <code>BUNNY_STREAM_VIDEO_ID</code>, and
			<code>BUNNY_STREAM_TOKEN_AUTH_KEY</code>, then restart the dev server.
		</div>
	{/if}
</main>
