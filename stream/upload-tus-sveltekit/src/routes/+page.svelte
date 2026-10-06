<script lang="ts">
	import VideoUploader from "#lib/components/VideoUploader.svelte";

	let { data } = $props();
</script>

<main>
	<h1>Upload to Bunny Stream with TUS</h1>
	<p>
		The browser sends the file straight to Bunny Stream. Pause it, or reload the page halfway through
		and pick the same file to carry on.
	</p>
	{#if data.configured}
		<VideoUploader />
	{:else}
		<div class="empty">
			Copy <code>.env.example</code> to <code>.env</code> and set
			<code>BUNNY_STREAM_LIBRARY_ID</code> and <code>BUNNY_STREAM_API_KEY</code>, then restart the
			dev server.
		</div>
	{/if}
</main>
