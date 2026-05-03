// Single typed entry point for every Shapion localStorage key.
//
// Before this module, 70+ call sites scattered across UI/api modules all
// did raw `localStorage.getItem('shapion.foo')` / `setItem(...)` with the
// key string inlined. That made it easy for two modules to drift on the
// SAME key (the Claude API key bug — settings UI wrote to one name, the
// HTTP client read from another) and hard to find every consumer of a
// given pref.
//
// Each pref lives here as a small `{ get, set, key }` triple. Callers
// import the specific accessor they need; new prefs just add a new entry.
//
// Storage failures (private mode, full quota) are swallowed silently —
// every accessor must remain non-throwing so a stuck localStorage
// doesn't take down the editor.

function safeGet(key: string): string {
  try { return localStorage.getItem(key) || ''; } catch { return ''; }
}

function safeSet(key: string, value: string): void {
  try {
    if (value === '' || value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch { /* ignore — storage may be unavailable */ }
}

function safeRemove(key: string): void {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

function jsonGet<T>(key: string, fallback: T): T {
  const raw = safeGet(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function jsonSet(key: string, value: unknown): void {
  try { safeSet(key, JSON.stringify(value)); } catch { /* ignore */ }
}

/** Build a string-typed pref accessor. */
function strPref(key: string, fallback = '') {
  return {
    key,
    get: (): string => safeGet(key) || fallback,
    set: (v: string): void => safeSet(key, v),
    clear: (): void => safeRemove(key),
  };
}

/** Build a JSON pref accessor with a default. */
function jsonPref<T>(key: string, fallback: T) {
  return {
    key,
    get: (): T => jsonGet<T>(key, fallback),
    set: (v: T): void => jsonSet(key, v),
    clear: (): void => safeRemove(key),
  };
}

// ── AI ────────────────────────────────────────────────────────────────
// (The body of these prefs is wrapped by api/ai-settings.ts which adds
//  per-pref validation. UI code should prefer api/ai-settings exports.)
export const prefAiProvider         = strPref('shapion.ai.provider', 'claude');
export const prefAiClaudeModel      = strPref('shapion.ai.claudeModel');
export const prefAiClaudeKey        = strPref('shapion.anthropic.apiKey');
export const prefAiCorpModel        = strPref('shapion.ai.corpModel');
export const prefAiCorpKey          = strPref('shapion.ai.corpKey');
export const prefAiCorpBaseUrl      = strPref('shapion.ai.corpBaseUrl');
export const prefAiCorpDeployPrefix = strPref('shapion.ai.corpDeployPrefix');
export const prefAiCorpOverrides    = strPref('shapion.ai.corpOverrides');
export const prefAiHistory          = strPref('shapion.ai.history');     // raw JSON; ai-chat parses

// Local AI (Ollama / LM Studio / llama.cpp / vLLM 等 — OpenAI ネイティブ形式)
export const prefAiLocalBaseUrl         = strPref('shapion.ai.localBaseUrl');
export const prefAiLocalKey             = strPref('shapion.ai.localKey');
export const prefAiLocalModel           = strPref('shapion.ai.localModel');
export const prefAiLocalModels          = strPref('shapion.ai.localModels');           // raw JSON array
export const prefAiLocalReasoningModels = strPref('shapion.ai.localReasoningModels');  // CSV / whitespace-separated

// ── Workspace ─────────────────────────────────────────────────────────
export const prefWorkspaces       = strPref('shapion.workspaces');        // raw JSON
export const prefCurrentWsName    = strPref('shapion.workspace.current');
export const prefCurrentWsUrl     = strPref('shapion.workspace.currentUrl');

// ── Display ───────────────────────────────────────────────────────────
export const prefDensity          = strPref('shapion.density', 'regular');
export const prefTheme            = strPref('shapion.theme', 'light');

// ── Editor / pages ────────────────────────────────────────────────────
export const prefLastOpenedPages  = jsonPref<Record<string, string>>('shapion.lastOpenedPage', {});

// ── Sidebar layout ───────────────────────────────────────────────────
// Use string for legacy compatibility — older versions may have stored
// it as a non-JSON value. Callers parse as needed.
export const prefSidebarOpen      = strPref('shapion.sb.open');
export const prefSidebarWidth     = strPref('shapion.sb.width');
export const prefOutlineOpen      = strPref('shapion.outline.open');
export const prefOutlineWidth     = strPref('shapion.outline.width');
export const prefAiPanelOpen      = strPref('shapion.ai.panelOpen');
export const prefAiPanelWidth     = strPref('shapion.ai.panelWidth');
export const prefPropsPanelOpen   = strPref('shapion.props.open');
export const prefPropsPanelWidth  = strPref('shapion.props.width');
export const prefFocusMode        = strPref('shapion.focus');

// ── Sidebar / panel state (legacy keys actually used by the UI) ─────
// These mirror the "open"/width prefs above but live under the keys the
// UI modules have always written to. Kept separate from the canonical
// prefs above so we don't change the values stored on user machines.
export const prefSidebarState     = strPref('shapion.sidebar');           // 'collapsed' | 'expanded'
export const prefPropertiesOpen   = strPref('shapion.properties.open');   // '1' or empty
export const prefAiPaneOpen       = strPref('shapion.page.aiPane');       // '1' / '0'
export const prefPaneSbWidth      = strPref('shapion.pane.sb');
export const prefPaneOutlineWidth = strPref('shapion.pane.outline');
export const prefPanePropsWidth   = strPref('shapion.pane.props');
export const prefPaneAiWidth      = strPref('shapion.pane.ai');

// ── Misc ─────────────────────────────────────────────────────────────
// Per-DB ordering / configs — these are PREFIX-keyed (one entry per list),
// so we expose helpers rather than fixed-string accessors.
const COL_ORDER_PREFIX = 'shapion.db.colOrder.';
const ROW_ORDER_PREFIX = 'shapion.db.rowOrder.';
// Legacy lowercase prefixes — kept because existing user data was written
// under these names. New code should use prefDbColOrderLegacy / RowOrderLegacy.
const COL_ORDER_LEGACY_PREFIX = 'shapion.db.colorder.';
const ROW_ORDER_LEGACY_PREFIX = 'shapion.db.roworder.';
const GANTT_CONFIG_PREFIX = 'shapion.db.gantt.';
const COL_WIDTHS_PREFIX = 'shapion.db.colWidths.';
const SIBLING_ORDER_PREFIX = 'shapion.tree.sib.';
const CAL_DATE_FIELD_PREFIX = 'shapion.cal.dateField.';
const SAVED_BY_PREFIX = 'shapion.lastSavedBy.';
// Single-key per-parent map of sibling orders (legacy layout used by
// lib/page-tree.ts — one localStorage key holding {parentId: ids[]}).
export const prefTreeOrder = jsonPref<Record<string, string[]>>('shapion.tree.order', {});

export function prefDbColOrder(listTitle: string) {
  return jsonPref<string[]>(COL_ORDER_PREFIX + listTitle, []);
}
export function prefDbRowOrder(listTitle: string) {
  return jsonPref<number[]>(ROW_ORDER_PREFIX + listTitle, []);
}
/** Legacy lowercase-keyed col order ("shapion.db.colorder.<list>"). The
 *  UI has stored this for a long time; switching to camelCase would
 *  silently lose every user's saved order. */
export function prefDbColOrderLegacy(listTitle: string) {
  return jsonPref<string[]>(COL_ORDER_LEGACY_PREFIX + listTitle, []);
}
export function prefDbRowOrderLegacy(listTitle: string) {
  return jsonPref<number[]>(ROW_ORDER_LEGACY_PREFIX + listTitle, []);
}
export function prefDbGanttConfig<T>(listTitle: string, fallback: T) {
  return jsonPref<T>(GANTT_CONFIG_PREFIX + listTitle, fallback);
}
export function prefDbColWidths(listTitle: string) {
  return jsonPref<Record<string, number>>(COL_WIDTHS_PREFIX + listTitle, {});
}
export function prefSiblingOrder(parentId: string) {
  return jsonPref<string[]>(SIBLING_ORDER_PREFIX + (parentId || '_root'), []);
}
export function prefCalDateField(listTitle: string) {
  return strPref(CAL_DATE_FIELD_PREFIX + listTitle);
}
export function prefLastSavedBy(pageId: string) {
  return strPref(SAVED_BY_PREFIX + pageId);
}

// ── Drafts (the local-store one in ui/draft-store) ───────────────────
// Prefix-keyed; ui/draft-store keeps its own scan/cleanup helpers.
export const DRAFT_KEY_PREFIX = 'shapion.draft.';
