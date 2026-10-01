import { DemoPlayer } from "@/components/demo-player";

export default function Home() {
  const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
  const videoId = process.env.NEXT_PUBLIC_BUNNY_VIDEO_ID;

  if (!libraryId || !videoId) {
    return (
      <main>
        <h1>Bunny Player with Next.js</h1>
        <div className="empty">
          Set <code>NEXT_PUBLIC_BUNNY_LIBRARY_ID</code> and <code>NEXT_PUBLIC_BUNNY_VIDEO_ID</code>{" "}
          in <code>.env</code>, then restart the dev server.
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1>Bunny Player with Next.js</h1>
      <p>
        A Server Component passes the video to a Client Component that controls it with{" "}
        <code>player.js</code>.
      </p>
      <DemoPlayer libraryId={libraryId} videoId={videoId} />
    </main>
  );
}
