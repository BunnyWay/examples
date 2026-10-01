<script lang="ts">
	import { hasFailed, VideoStatusCode, type VideoStatus } from "$lib/bunny-stream";

	let { videoId, title }: { videoId: string; title: string } = $props();

	let video: VideoStatus | null = $state(null);
	let error: string | null = $state(null);

	// Poll until Bunny Stream finishes encoding or gives up.
	$effect(() => {
		let timer: ReturnType<typeof setTimeout>;
		let active = true;

		const poll = async () => {
			const response = await fetch(`/api/videos/${videoId}`);
			const body = await response.json();
			if (!active) return;
			if (!response.ok) {
				error = body.error ?? "Could not read the video status";
				return;
			}

			video = body;
			if (body.status !== VideoStatusCode.Finished && !hasFailed(body.status)) {
				timer = setTimeout(poll, 3000);
			}
		};

		poll();

		return () => {
			active = false;
			clearTimeout(timer);
		};
	});
</script>

{#if error}
	<p class="error">{error}</p>
{:else if !video}
	<p>Checking the video…</p>
{:else if hasFailed(video.status)}
	<p class="error">Bunny Stream could not encode {title}.</p>
{:else if video.status !== VideoStatusCode.Finished}
	<p>Encoding {title}… {video.encodeProgress}%</p>
{:else}
	<iframe
		src={video.embedUrl}
		{title}
		class="player"
		allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
		allowfullscreen
	></iframe>
{/if}
