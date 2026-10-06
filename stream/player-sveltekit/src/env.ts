import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
	PUBLIC_BUNNY_LIBRARY_ID: { public: true, static: true },
	PUBLIC_BUNNY_VIDEO_ID: { public: true, static: true },
});
