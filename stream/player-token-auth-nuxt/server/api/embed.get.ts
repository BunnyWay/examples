import { signEmbedUrl } from "../utils/bunny-stream";

// Signs the embed URL for the configured video. The token authentication key
// stays here on the server, and the browser only ever sees the signed URL.
export default defineEventHandler(() => {
  // Check that the signed-in viewer may watch this video before signing. This runs for anyone who requests it.
  return signEmbedUrl();
});
