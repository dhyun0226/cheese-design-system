// Loopback-only QA receiver. Nothing is written to disk or deployed to Pages.
import { createServer } from "node:http";
const sessions = new Map();
createServer(async (request, response) => {
  const url = new URL(request.url, "http://127.0.0.1:48179");
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Cache-Control", "no-store");
  if (url.pathname === "/health") {
    response.end('{"ok":true}');
    return;
  }
  if (url.pathname !== "/api/upload") {
    response.writeHead(404);
    response.end("{}");
    return;
  }
  const key = url.searchParams.get("key");
  if (!key || key.length > 128) {
    response.writeHead(400);
    response.end("{}");
    return;
  }
  const state = sessions.get(key) ?? { calls: 0, requests: [] };
  if (request.method === "GET") {
    response.end(JSON.stringify(state));
    return;
  }
  if (request.method !== "POST") {
    response.writeHead(405);
    response.end("{}");
    return;
  }
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 65536) {
      response.writeHead(413);
      response.end("{}");
      return;
    }
    chunks.push(chunk);
  }
  state.calls++;
  state.requests.push({
    type: request.headers["content-type"],
    body: Buffer.concat(chunks).toString("utf8"),
  });
  sessions.set(key, state);
  if (sessions.size > 256) sessions.delete(sessions.keys().next().value);
  response.writeHead(state.calls === 1 ? 500 : 200);
  response.end(JSON.stringify({ id: "test-file" }));
}).listen(48179, "127.0.0.1");
