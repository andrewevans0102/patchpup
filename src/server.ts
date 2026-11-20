import { pathToFileURL } from "node:url";
import { createApiServer } from "./api.js";

export function startServer(port = Number(process.env.PORT ?? 3000)): void {
  const server = createApiServer();
  server.listen(port, "127.0.0.1", () => {
    console.log(`PatchPup API listening on http://localhost:${port}`);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer();
}
