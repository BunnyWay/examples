import { isConfigured } from "#lib/server/bunny-stream.ts";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => ({ configured: isConfigured() });
