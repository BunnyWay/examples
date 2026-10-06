import { defineEnvVars } from "@sveltejs/kit/env";

// A validator that accepts undefined makes a variable optional, so the app
// builds and starts without them and the page lists what's missing.
const optional = (value: string | undefined) => value;

// Server-only, and read when the app starts.
export const variables = defineEnvVars({
	BUNNY_STREAM_LIBRARY_ID: { schema: optional },
	BUNNY_STREAM_VIDEO_ID: { schema: optional },
	BUNNY_STREAM_TOKEN_AUTH_KEY: { schema: optional },
});
