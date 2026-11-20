import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

export function createApiServer(): Server {
  return createServer((request: IncomingMessage, response: ServerResponse) => {
    const url = new URL(request.url ?? "/", "http://localhost");

    if (request.method === "GET" && url.pathname === "/api/status") {
      sendJson(response, 200, { status: "ok" });
      return;
    }

    sendJson(response, 404, { error: "not_found" });
  });
}
