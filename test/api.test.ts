import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, describe, it } from "node:test";
import { createApiServer } from "../src/api.js";
import { DEFAULT_PATCHPUP_MODEL, resolveModelConfig } from "../src/model-config.js";
import { summarizeOpenCodeEvent } from "../src/opencode-progress.js";

describe("PatchPup API", () => {
  const server = createApiServer();
  let baseUrl = "";

  before(async () => {
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address === "object");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(() => {
    server.close();
  });

  it("returns the service status", async () => {
    const response = await fetch(`${baseUrl}/api/status`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok" });
  });

  it("returns a small JSON 404 for unknown routes", async () => {
    const response = await fetch(`${baseUrl}/missing`);
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: "not_found" });
  });
});

describe("PatchPup model configuration", () => {
  it("defaults to an OpenRouter free model", () => {
    assert.deepEqual(resolveModelConfig({ OPENROUTER_API_KEY: "test-key" }), {
      model: DEFAULT_PATCHPUP_MODEL,
      apiKey: "test-key",
    });
  });

  it("accepts a configured OpenRouter model", () => {
    assert.deepEqual(resolveModelConfig({
      OPENROUTER_API_KEY: " test-key ",
      PATCHPUP_MODEL: "openrouter/recursive/flint-v1.0:free",
    }), {
      model: "openrouter/recursive/flint-v1.0:free",
      apiKey: "test-key",
    });
  });

  it("rejects models from other providers in this revision", () => {
    assert.throws(
      () => resolveModelConfig({ OPENROUTER_API_KEY: "test-key", PATCHPUP_MODEL: "google/gemini-3.8-flash" }),
      /PATCHPUP_MODEL must name an OpenRouter model/,
    );
  });

  it("requires OpenRouter authentication", () => {
    assert.throws(
      () => resolveModelConfig({}),
      /OPENROUTER_API_KEY is missing/,
    );
  });
});

describe("OpenCode progress log summaries", () => {
  it("reports model steps and usage without exposing response text", () => {
    assert.equal(
      summarizeOpenCodeEvent(JSON.stringify({ type: "step_start" })),
      "OpenCode started a model step.",
    );
    assert.equal(
      summarizeOpenCodeEvent(JSON.stringify({
        type: "step_finish",
        part: { reason: "tool-calls", tokens: { input: 100, output: 30 } },
      })),
      "OpenCode step requested tools; 100 input / 30 output tokens.",
    );
    assert.equal(
      summarizeOpenCodeEvent(JSON.stringify({ type: "text", part: { text: "private model response" } })),
      "OpenCode generated a response (22 characters).",
    );
  });

  it("reports completed tools without logging their inputs or outputs", () => {
    const summary = summarizeOpenCodeEvent(JSON.stringify({
      type: "tool_use",
      part: {
        tool: "read",
        state: {
          status: "completed",
          input: { filePath: "src/private.ts" },
          output: "private file contents",
          time: { start: 100, end: 125 },
        },
      },
    }));

    assert.equal(summary, "OpenCode read tool completed in 25ms.");
    assert.doesNotMatch(summary ?? "", /private/);
  });

  it("reports error types without logging provider error contents", () => {
    const summary = summarizeOpenCodeEvent(JSON.stringify({
      type: "error",
      error: { type: "provider.invalid-request", message: "private provider response" },
    }));

    assert.equal(summary, "OpenCode reported provider.invalid-request.");
    assert.doesNotMatch(summary ?? "", /private/);
  });

  it("ignores malformed and unknown events", () => {
    assert.equal(summarizeOpenCodeEvent("not-json"), undefined);
    assert.equal(summarizeOpenCodeEvent(JSON.stringify({ type: "unknown" })), undefined);
  });
});
