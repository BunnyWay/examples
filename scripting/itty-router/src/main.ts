import * as BunnySDK from "@bunny.net/edgescript-sdk";
import { AutoRouter, error, text } from "itty-router";

type EchoBody = { message: string };

function isEchoBody(value: unknown): value is EchoBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  );
}

const router = AutoRouter();

router
  .get("/", () => text("Hello from itty-router on Bunny Edge Scripting"))
  .get("/hello/:name", ({ params }) => ({ message: `Hello, ${params.name}!` }))
  .post("/echo", async (request) => {
    const body: unknown = await request.json().catch(() => null);

    if (!isEchoBody(body)) {
      return error(400, "Send a JSON body with a message string");
    }

    return { echo: body.message };
  });

BunnySDK.net.http.serve(router.fetch);
