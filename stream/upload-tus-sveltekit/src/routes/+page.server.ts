import { isConfigured } from "$lib/server/bunny-stream";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => ({ configured: isConfigured() });
