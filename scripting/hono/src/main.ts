import * as BunnySDK from "@bunny.net/edgescript-sdk";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";

type EchoBody = { message: string };

function isEchoBody(value: unknown): value is EchoBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  );
}

const app = new Hono();

app.get("/", (c) => c.text("Hello from Hono on Bunny Edge Scripting"));

app.get("/hello/:name", (c) => {
  return c.json({ message: `Hello, ${c.req.param("name")}!` });
});

app.post(
  "/echo",
  validator("json", (value, c) => {
    if (!isEchoBody(value)) {
      return c.json({ error: "Send a JSON body with a message string" }, 400);
    }

    return value;
  }),
  (c) => c.json({ echo: c.req.valid("json").message }),
);

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }

  console.error(err);

  return c.json({ error: "Internal server error" }, 500);
});

BunnySDK.net.http.serve(app.fetch);
