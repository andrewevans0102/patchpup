type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject | undefined {
  return value !== null && typeof value === "object" ? value as JsonObject : undefined;
}

function asText(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asCount(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function summarizeOpenCodeEvent(line: string): string | undefined {
  let event: JsonObject;
  try {
    const parsed: unknown = JSON.parse(line);
    const object = asObject(parsed);
    if (!object) return undefined;
    event = object;
  } catch {
    return undefined;
  }

  const part = asObject(event.part);
  switch (event.type) {
    case "step_start":
      return "OpenCode started a model step.";
    case "tool_use": {
      const tool = asText(part?.tool);
      const safeTool = tool && /^[a-zA-Z0-9_-]{1,64}$/.test(tool) ? tool : "tool";
      const state = asObject(part?.state);
      const status = state?.status === "error" ? "failed" : state?.status === "completed" ? "completed" : "updated";
      const time = asObject(state?.time);
      const started = asCount(time?.start);
      const ended = asCount(time?.end);
      const duration = started !== undefined && ended !== undefined && ended >= started
        ? ` in ${ended - started}ms`
        : "";
      return `OpenCode ${safeTool} tool ${status}${duration}.`;
    }
    case "text": {
      const text = asText(part?.text);
      return text ? `OpenCode generated a response (${text.length} characters).` : undefined;
    }
    case "step_finish": {
      const reason = part?.reason === "tool-calls" ? "requested tools" : "finished";
      const tokens = asObject(part?.tokens);
      const input = asCount(tokens?.input);
      const output = asCount(tokens?.output);
      const usage = input !== undefined || output !== undefined
        ? `; ${input ?? 0} input / ${output ?? 0} output tokens`
        : "";
      return `OpenCode step ${reason}${usage}.`;
    }
    case "error": {
      const error = asObject(event.error);
      const kind = asText(error?.type) ?? asText(error?.name);
      return kind ? `OpenCode reported ${kind}.` : "OpenCode reported an error.";
    }
    default:
      return undefined;
  }
}
