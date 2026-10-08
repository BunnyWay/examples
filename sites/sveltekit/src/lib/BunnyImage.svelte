<script lang="ts">
	import { PUBLIC_BUNNY_OPTIMIZER } from '$app/env/public';

	let { src, alt, width, height, sizes = '100vw' }: {
		src: string;
		alt: string;
		width: number;
		height: number;
		sizes?: string;
	} = $props();

	// Bunny Optimizer resizes `?width=` requests at the edge
	const url = (w: number) => `${src}?width=${w}&quality=75`;
</script>

{#if PUBLIC_BUNNY_OPTIMIZER}
	<img
		src={url(1280)}
		srcset={[640, 960, 1280, 1920].map((w) => `${url(w)} ${w}w`).join(', ')}
		{sizes}
		{alt}
		{width}
		{height}
	/>
{:else}
	<img {src} {alt} {width} {height} />
{/if}
