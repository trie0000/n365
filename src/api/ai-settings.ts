// AI provider / model selection state.
//
// n365 supports two AI back-ends:
//   - Anthropic Claude API (default; full Tool Use agent)
//   - PX-AI (社内 Azure OpenAI ゲートウェイ; chat-completions only)
//
// User picks the provider + model from the settings modal. Choices persist
// in localStorage; everything is keyed off `getProvider()` / `getModel()`.
// Each provider stores its own API key separately so switching back and
// forth doesn't lose either.

export type Provider = 'claude' | 'pxai';

export interface PxAiModel {
  /** Model name as the user sees it (also OpenAI's canonical name). */
  id: string;
  /** SP-side deployment id used in the URL path. */
  deploymentId: string;
  /** True when this is a "reasoning" model that requires
   *  `max_completion_tokens` in place of `max_tokens` and the
   *  `2024-12-01-preview` (or newer) api-version. */
  reasoning: boolean;
  /** True when the deployment accepts vision (image_url) inputs. */
  vision: boolean;
}

/** Catalog of PX-AI deployments, mirrored from the spec deck. Update this
 *  when new models are added on the SP side. */
export const PXAI_MODELS: PxAiModel[] = [
  { id: 'gpt-5',           deploymentId: 'pisc-newsol-openai-uat-gpt-5',           reasoning: true,  vision: true },
  { id: 'gpt-5-mini',      deploymentId: 'pisc-newsol-openai-uat-gpt-5-mini',      reasoning: true,  vision: true },
  { id: 'gpt-5-nano',      deploymentId: 'pisc-newsol-openai-uat-gpt-5-nano',      reasoning: true,  vision: true },
  { id: 'o3',              deploymentId: 'pisc-newsol-openai-uat-o3',              reasoning: true,  vision: true },
  { id: 'o4-mini',         deploymentId: 'pisc-newsol-openai-uat-o4-mini',         reasoning: true,  vision: true },
  { id: 'gpt-4.1',         deploymentId: 'pisc-newsol-openai-uat-gpt-41',          reasoning: false, vision: true },
  { id: 'gpt-4.1-mini',    deploymentId: 'pisc-newsol-openai-uat-gpt-41-mini',     reasoning: false, vision: true },
  { id: 'gpt-4.1-nano',    deploymentId: 'pisc-newsol-openai-uat-gpt-41-nano',     reasoning: false, vision: true },
  { id: 'gpt-4o',          deploymentId: 'pisc-newsol-openai-uat-gpt-4o',          reasoning: false, vision: true },
  { id: 'gpt-4o-mini',     deploymentId: 'pisc-newsol-openai-uat-gpt-4o-mini',     reasoning: false, vision: true },
];

/** Catalog of Claude models the AI panel exposes. Kept in sync with the
 *  current Anthropic public lineup; default is the most capable Sonnet. */
export const CLAUDE_MODELS: Array<{ id: string; label: string }> = [
  { id: 'claude-opus-4-5',          label: 'Claude Opus 4.5' },
  { id: 'claude-sonnet-4-5',        label: 'Claude Sonnet 4.5' },
  { id: 'claude-haiku-4-5',         label: 'Claude Haiku 4.5' },
];

const KEY_PROVIDER     = 'n365.ai.provider';
const KEY_CLAUDE_MODEL = 'n365.ai.claudeModel';
const KEY_PXAI_MODEL   = 'n365.ai.pxaiModel';
const KEY_PXAI_APIKEY  = 'n365.ai.pxaiKey';

const DEFAULT_PROVIDER: Provider = 'claude';
const DEFAULT_CLAUDE_MODEL = 'claude-sonnet-4-5';
const DEFAULT_PXAI_MODEL = 'gpt-4.1-mini';

function readLS(key: string): string {
  try { return localStorage.getItem(key) || ''; } catch { return ''; }
}
function writeLS(key: string, value: string): void {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch { /* ignore */ }
}

export function getProvider(): Provider {
  const v = readLS(KEY_PROVIDER);
  return v === 'pxai' ? 'pxai' : DEFAULT_PROVIDER;
}
export function setProvider(p: Provider): void {
  writeLS(KEY_PROVIDER, p);
}

export function getClaudeModel(): string {
  return readLS(KEY_CLAUDE_MODEL) || DEFAULT_CLAUDE_MODEL;
}
export function setClaudeModel(model: string): void {
  writeLS(KEY_CLAUDE_MODEL, model);
}

export function getPxAiModel(): string {
  const stored = readLS(KEY_PXAI_MODEL);
  if (stored && PXAI_MODELS.some((m) => m.id === stored)) return stored;
  return DEFAULT_PXAI_MODEL;
}
export function setPxAiModel(model: string): void {
  writeLS(KEY_PXAI_MODEL, model);
}

export function getPxAiKey(): string {
  return readLS(KEY_PXAI_APIKEY);
}
export function setPxAiKey(key: string): void {
  writeLS(KEY_PXAI_APIKEY, key);
}

/** The model id currently in effect for the active provider. */
export function getActiveModel(): string {
  return getProvider() === 'pxai' ? getPxAiModel() : getClaudeModel();
}

/** Look up the deployment metadata for a PX-AI model id. */
export function findPxAiModel(modelId: string): PxAiModel | null {
  return PXAI_MODELS.find((m) => m.id === modelId) || null;
}
