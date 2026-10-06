import { Suspense } from "react";
import { connection } from "next/server";
import { isConfigured, signEmbedUrl } from "@/lib/bunny-stream";

export default function Home() {
  return (
    <main>
      <h1>Token-authenticated Bunny Player in Next.js</h1>
      <Suspense>
        <SignedPlayer />
      </Suspense>
    </main>
  );
}

async function SignedPlayer() {
  // Sign per request, so every visitor gets a fresh token and the page never bakes in a build-time value.
  await connection();

  if (!isConfigured()) {
    return (
      <div className="empty">
        Copy <code>.env.example</code> to <code>.env.local</code> and set{" "}
        <code>BUNNY_STREAM_LIBRARY_ID</code>, <code>BUNNY_STREAM_VIDEO_ID</code>, and{" "}
        <code>BUNNY_STREAM_TOKEN_AUTH_KEY</code>, then restart the dev server.
      </div>
    );
  }

  // Check that the signed-in viewer may watch this video before signing. This runs for anyone who requests it.
  const { src, expires } = signEmbedUrl();
  const expiresAt = new Date(expires * 1000);
  const expiresLabel = expiresAt.toLocaleTimeString("en-GB", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <p>
        A Server Component signs the embed URL with your token authentication key. The browser only
        sees the token, never the key.
      </p>
      <iframe
        src={src}
        title="Video player"
        className="player"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
      <p className="expires">
        This link expires at <time dateTime={expiresAt.toISOString()}>{expiresLabel} UTC</time>.
        Reload the page to sign a new one.
      </p>
    </>
  );
}
