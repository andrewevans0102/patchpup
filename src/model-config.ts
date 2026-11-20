export const DEFAULT_PATCHPUP_MODEL = "openrouter/recursive/flint-v1.0:free";

type ModelEnvironment = {
  OPENROUTER_API_KEY?: string;
  PATCHPUP_MODEL?: string;
};

export function resolveModelConfig(environment: ModelEnvironment): { model: string; apiKey: string } {
  const model = environment.PATCHPUP_MODEL?.trim() || DEFAULT_PATCHPUP_MODEL;
  if (!model.startsWith("openrouter/") || model.length === "openrouter/".length) {
    throw new Error(`PATCHPUP_MODEL must name an OpenRouter model, for example ${DEFAULT_PATCHPUP_MODEL}.`);
  }

  const apiKey = environment.OPENROUTER_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is missing; add an OpenRouter API key with access to free models.");

  return { model, apiKey };
}
