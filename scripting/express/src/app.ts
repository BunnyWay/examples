import express, { type ErrorRequestHandler } from "express";

type EchoBody = { message: string };

function isEchoBody(value: unknown): value is EchoBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof value.message === "string"
  );
}

// express.json() tags the errors it raises for a body it can't parse.
function isBodyParseError(err: unknown): boolean {
  return (
    err instanceof Error && "type" in err && err.type === "entity.parse.failed"
  );
}

const handleError: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  if (isBodyParseError(err)) {
    res.status(400).json({ error: "Send a JSON body with a message string" });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};

export const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Hello from Express on Bunny Edge Scripting");
});

app.get("/hello/:name", (req, res) => {
  res.json({ message: `Hello, ${req.params.name}!` });
});

app.post("/echo", (req, res) => {
  const body: unknown = req.body;

  if (!isEchoBody(body)) {
    res.status(400).json({ error: "Send a JSON body with a message string" });
    return;
  }

  res.json({ echo: body.message });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(handleError);
