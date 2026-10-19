import * as BunnySDK from "@bunny.net/edgescript-sdk";
import { Elysia, t } from "elysia";

const app = new Elysia()
  .onError(({ code, status }) => {
    switch (code) {
      case "PARSE":
      case "VALIDATION":
        return status(400, { error: "Send a JSON body with a message string" });
      case "NOT_FOUND":
        return status(404, { error: "Not found" });
    }
  })
  .get("/", () => "Hello from Elysia on Bunny Edge Scripting")
  .get("/hello/:name", ({ params }) => ({ message: `Hello, ${params.name}!` }))
  .post("/echo", ({ body }) => ({ echo: body.message }), {
    body: t.Object({ message: t.String() }),
  });

BunnySDK.net.http.serve(app.fetch);
