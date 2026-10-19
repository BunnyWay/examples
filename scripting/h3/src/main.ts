import * as BunnySDK from "@bunny.net/edgescript-sdk";
import { getRouterParam, H3, HTTPError, readBody } from "h3";

type EchoBody = { message: string };

function isEchoBody(value: unknown): value is EchoBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  );
}

const app = new H3({
  onError: (error) => {
    if (error.unhandled) {
      console.error(error);
    }
  },
});

app.get("/", () => "Hello from h3 on Bunny Edge Scripting");

app.get("/hello/:name", (event) => {
  return { message: `Hello, ${getRouterParam(event, "name")}!` };
});

app.post("/echo", async (event) => {
  const body = await readBody(event);

  if (!isEchoBody(body)) {
    throw new HTTPError({
      status: 400,
      message: "Send a JSON body with a message string",
    });
  }

  return { echo: body.message };
});

BunnySDK.net.http.serve(app.fetch);
