// Build with PREACT_APP_BUNNY_OPTIMIZER=true to let Bunny Optimizer resize images at the edge.
const enabled = process.env.PREACT_APP_BUNNY_OPTIMIZER === 'true';
const widths = [640, 960, 1280, 1920];
const url = (src, width) => `${src}?width=${width}&quality=75`;

const BunnyImage = ({ src, sizes = '100vw', ...props }) => {
	if (!enabled) return <img src={src} {...props} />;

	return (
		<img
			src={url(src, 1280)}
			srcset={widths.map(w => `${url(src, w)} ${w}w`).join(', ')}
			sizes={sizes}
			{...props}
		/>
	);
};

export default BunnyImage;
