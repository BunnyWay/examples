import * as BunnySDK from "@bunny.net/edgescript-sdk";
import {
  FetchIncomingMessage,
  FetchServerResponse,
  toFetchResponse,
  toReqRes,
} from "fetch-to-node";
import { app } from "./app.ts";

// There is no TCP socket at the edge, and fetch-to-node reports a null one.
// express.json() treats a request without a readable socket as finished and
// skips the body, so hand it a stand-in that reports an open connection.
class EdgeIncomingMessage extends FetchIncomingMessage {
  override get socket() {
    return { readable: true };
  }

  override set socket(_value) {}
}

// Express builds every req and res from prototypes that extend node:http.
// Point them at the fetch-to-node classes so Express methods sit on top of
// objects that can be turned back into a Response.
Object.setPrototypeOf(
  Object.getPrototypeOf(app.request),
  EdgeIncomingMessage.prototype,
);
Object.setPrototypeOf(
  Object.getPrototypeOf(app.response),
  FetchServerResponse.prototype,
);

BunnySDK.net.http.serve((request) => {
  const { req, res } = toReqRes(request, {
    createIncomingMessage: () => new EdgeIncomingMessage(),
  });

  app(req, res);

  return toFetchResponse(res);
});
