// Additional DB views: list, gallery, calendar, gantt.
// All operate on S.dbItems / S.dbFields and reuse the existing data flow.

import { S } from '../state';
import type { ListItem, ListField } from '../state';
import { g } from './dom';
import {
  doSelect, mkOpenRowBtn, reorderRows, isManualRowOrderActive,
  attachCardSelectionHandlers, attachCardDragHandlers,
  hideCardDropLine, getSortedFilteredItems,
} from './views';
import { apiUpdateDbRow } from '../api/db';
import { recordCellChange } from './db-history';
import { toast } from './ui-helpers';
import { loadGanttConfig, saveGanttConfig, type GanttConfig } from '../lib/db-order';
import { escapeHtml } from '../lib/html-escape';
import { prefCalDateField } from '../lib/prefs';

function getProp(item: ListItem, name: string): string {
  const v = item[name];
  return v == null ? '' : String(v);
}

function findField(kind: number): ListField | undefined {
  return S.dbFields.find((f) => f.FieldTypeKind === kind);
}

/** Wire a vertical/horizontal drag-reorder onto a card/row element.
 *  `axis` controls whether before/after is decided by clientY (vertical) or X.
 *  `dragSource` lets the caller pass a child element (e.g. a small handle)
 *  whose dragstart should initiate the row drag. When omitted, the row
 *  itself is the drag source. */
function attachItemDrag(
  el: HTMLElement, item: ListItem, axis: 'y' | 'x',
  dragSource?: HTMLElement,
): void {
  if (!isManualRowOrderActive()) return;
  const source = dragSource || el;
  source.draggable = true;
  const dragKey = 'text/shapion-row';
  source.addEventListener('dragstart', (e) => {
    if (!e.dataTransfer) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(dragKey, String(item.Id));
    // Multi-select drag: fade every selected item if this one is part of it.
    const ids = S.dbSelected.has(item.Id) ? Array.from(S.dbSelected) : [item.Id];
    document.querySelectorAll<HTMLElement>('[data-id]').forEach((n) => {
      const id = parseInt(n.dataset.id || '0', 10);
      if (ids.indexOf(id) >= 0) n.classList.add('shapion-item-dragging');
    });
  });
  source.addEventListener('dragend', () => {
    document.querySelectorAll('.shapion-item-dragging').forEach((n) =>
      n.classList.remove('shapion-item-dragging'));
  });
  el.addEventListener('dragover', (e) => {
    const dt = e.dataTransfer;
    if (!dt) return;
    // Some browsers withhold custom MIME types from `dt.types` during
    // dragover for privacy. Always preventDefault so drop fires; we
    // gate by the actual data on drop.
    e.preventDefault();
    dt.dropEffect = 'move';
    const r = el.getBoundingClientRect();
    const after = axis === 'y'
      ? e.clientY > r.top + r.height / 2
      : e.clientX > r.left + r.width / 2;
    el.classList.toggle('shapion-item-drop-before', !after);
    el.classList.toggle('shapion-item-drop-after', after);
  });
  el.addEventListener('dragleave', () => {
    el.classList.remove('shapion-item-drop-before', 'shapion-item-drop-after');
  });
  el.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (!dt) return;
    const fromIdStr = dt.getData(dragKey);
    if (!fromIdStr) return;
    e.preventDefault();
    const r = el.getBoundingClientRect();
    const after = axis === 'y'
      ? e.clientY > r.top + r.height / 2
      : e.clientX > r.left + r.width / 2;
    el.classList.remove('shapion-item-drop-before', 'shapion-item-drop-after');
    const fromId = parseInt(fromIdStr, 10);
    // If the source row is part of the multi-selection, move all selected.
    const ids = S.dbSelected.has(fromId) ? Array.from(S.dbSelected) : [fromId];
    if (ids.indexOf(item.Id) >= 0) return;        // dropping on a dragged item
    reorderRows(ids, item.Id, after);
  });
}

/** Build a "row controls" widget — a leading cell with a 6-dot drag
 *  handle (visible on hover) and a checkbox (visible on hover or when
 *  something is selected). Mirrors the table view's left-side controls
 *  so users get a consistent affordance across views. Order is
 *  [handle, checkbox] to match the floating handle that hovers to the
 *  LEFT of the row in table view (left-most = drag).
 */
function makeRowControls(item: ListItem, onSelectionChange?: () => void): HTMLElement {
  const box = document.createElement('div');
  box.className = 'shapion-rowctl';
  // Drag handle (Notion-style ⋮⋮) — leftmost so the affordance lines up
  // with the floating handle used by the table view.
  const handle = document.createElement('span');
  handle.className = 'shapion-rowctl-handle';
  handle.title = 'ドラッグして並べ替え';
  handle.innerHTML =
    '<svg viewBox="0 0 10 16" width="10" height="16" fill="currentColor" style="pointer-events:none">' +
    '<circle cx="2" cy="3" r="1.3"/><circle cx="2" cy="8" r="1.3"/><circle cx="2" cy="13" r="1.3"/>' +
    '<circle cx="8" cy="3" r="1.3"/><circle cx="8" cy="8" r="1.3"/><circle cx="8" cy="13" r="1.3"/>' +
    '</svg>';
  // Checkbox
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.className = 'shapion-cb';
  cb.checked = S.dbSelected.has(item.Id);
  cb.addEventListener('click', (e) => e.stopPropagation());
  cb.addEventListener('change', () => {
    if (cb.checked) S.dbSelected.add(item.Id);
    else S.dbSelected.delete(item.Id);
    void import('./db-bulk').then((m) => m.renderBulkBar());
    onSelectionChange?.();
  });
  box.appendChild(handle);
  box.appendChild(cb);
  return box;
}

// ── List view ────────────────────────────────────────────
export function renderListView(): void {
  const root = g('list-view');
  root.innerHTML = '';
  // Apply hover/selected styling to the container so checkbox visibility
  // matches the table view (CSS-driven hover-reveal + always-on when any
  // row is selected).
  if (S.dbSelected.size > 0) root.classList.add('shapion-has-sel');
  else root.classList.remove('shapion-has-sel');
  const fields = S.dbFields.filter((f) => [2, 4, 6, 8, 9].includes(f.FieldTypeKind)).slice(0, 4);
  // Honour user filter + manual row order, mirroring the table view.
  getSortedFilteredItems().forEach((item) => {
    const row = document.createElement('div');
    row.className = 'shapion-lv-row';
    row.dataset.id = String(item.Id);
    const ctl = makeRowControls(item, () => {
      row.classList.toggle('shapion-card-sel', S.dbSelected.has(item.Id));
      if (S.dbSelected.size > 0) root.classList.add('shapion-has-sel');
      else root.classList.remove('shapion-has-sel');
    });
    row.appendChild(ctl);
    const body = document.createElement('div');
    body.className = 'shapion-lv-body';
    const main = document.createElement('div');
    main.className = 'shapion-lv-title';
    main.textContent = item.Title || '(無題)';
    body.appendChild(main);
    const sub = document.createElement('div');
    sub.className = 'shapion-lv-sub';
    sub.innerHTML = fields
      .filter((f) => f.InternalName !== 'Title')
      .map((f) => '<span class="shapion-lv-field">' + escapeHtml(f.Title) + ': ' + escapeHtml(getProp(item, f.InternalName)) + '</span>')
      .join('');
    body.appendChild(sub);
    row.appendChild(body);
    row.appendChild(mkOpenRowBtn(item));
    if (S.dbSelected.has(item.Id)) row.classList.add('shapion-card-sel');
    attachCardSelectionHandlers(row, item.Id);
    // Drag is initiated only via the handle, leaving plain text drag /
    // selection on the row body intact.
    const handle = ctl.querySelector<HTMLElement>('.shapion-rowctl-handle') || undefined;
    attachItemDrag(row, item, 'y', handle);
    root.appendChild(row);
  });
}

// ── Gallery view ─────────────────────────────────────────
export function renderGalleryView(): void {
  const root = g('gallery-view');
  root.innerHTML = '';
  const fields = S.dbFields.filter((f) => [2, 4, 6, 8, 9].includes(f.FieldTypeKind));
  // Honour filter + manual row order so drag-reordering visibly takes effect.
  getSortedFilteredItems().forEach((item) => {
    const card = document.createElement('div');
    card.className = 'shapion-gv-card';
    if (S.dbSelected.has(item.Id)) card.classList.add('shapion-card-sel');
    card.dataset.id = String(item.Id);
    card.draggable = isManualRowOrderActive();
    card.innerHTML =
      '<div class="shapion-gv-cover">' + (item.Title || '?').slice(0, 1) + '</div>' +
      '<div class="shapion-gv-title">' + escapeHtml(item.Title || '(無題)') + '</div>' +
      '<div class="shapion-gv-meta">' +
        fields
          .filter((f) => f.InternalName !== 'Title')
          .slice(0, 3)
          .map((f) => '<div class="shapion-gv-prop">' + escapeHtml(f.Title) + ': ' + escapeHtml(getProp(item, f.InternalName)) + '</div>')
          .join('') +
      '</div>';
    card.appendChild(mkOpenRowBtn(item));
    attachCardSelectionHandlers(card, item.Id);
    attachCardDragHandlers(card, item.Id);
    root.appendChild(card);
  });
  // Grid-level dragover/drop for reordering (uses card-drop-line indicator)
  if (isManualRowOrderActive()) attachGalleryGridDrop(root);
}

/** Idempotent — wires drop listeners onto `root` exactly once. We mark the
 *  element with a flag attribute so `renderGalleryView`-on-rerender doesn't
 *  pile up duplicate handlers (which would call `reorderRows` multiple
 *  times per drop). */
function attachGalleryGridDrop(root: HTMLElement): void {
  if (root.dataset.dropWired === '1') return;
  root.dataset.dropWired = '1';

  function findNearest(clientX: number, clientY: number): { card: HTMLElement; placeAfter: boolean } | null {
    const cards = Array.from(root.querySelectorAll<HTMLElement>('.shapion-gv-card'));
    if (cards.length === 0) return null;
    let nearest = cards[0];
    let bestDist = Infinity;
    for (const c of cards) {
      const cr = c.getBoundingClientRect();
      const sameRow = clientY >= cr.top && clientY <= cr.bottom;
      const dx = Math.abs(clientX - (cr.left + cr.width / 2));
      const score = (sameRow ? 0 : 1e6) + dx;
      if (score < bestDist) { bestDist = score; nearest = c; }
    }
    const cr = nearest.getBoundingClientRect();
    const placeAfter = clientX > cr.left + cr.width / 2;
    return { card: nearest, placeAfter };
  }

  root.addEventListener('dragover', (e) => {
    const dt = e.dataTransfer;
    if (!dt) return;
    // Browsers (esp. Chrome) don't always expose custom MIME types in
    // `dt.types` during dragover for security reasons. Skip the type
    // check — we'll validate on drop. Always preventDefault so drop fires.
    e.preventDefault();
    dt.dropEffect = 'move';
    const hit = findNearest(e.clientX, e.clientY);
    if (!hit) { hideGalleryDropLine(); return; }
    showGalleryDropLine(hit.card, hit.placeAfter);
  });
  root.addEventListener('dragleave', (e) => {
    const rt = (e as DragEvent).relatedTarget as Node | null;
    if (!rt || !root.contains(rt)) hideGalleryDropLine();
  });
  root.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (!dt) { hideGalleryDropLine(); return; }
    // Accept either the kanban-style payload (cards from kanban path) or
    // text/plain fallback. attachCardDragHandlers writes 'text/shapion-kb'.
    const idStr = dt.getData('text/shapion-kb') || dt.getData('text/plain');
    if (!idStr) { hideGalleryDropLine(); return; }
    e.preventDefault();
    hideGalleryDropLine();
    const fromId = parseInt(idStr, 10);
    if (!fromId) return;
    const ids = S.dbSelected.has(fromId) ? Array.from(S.dbSelected) : [fromId];
    const hit = findNearest(e.clientX, e.clientY);
    if (!hit) return;
    const targetId = parseInt(hit.card.dataset.id || '0', 10);
    if (!targetId || ids.indexOf(targetId) >= 0) return;
    reorderRows(ids, targetId, hit.placeAfter);
  });
}

// ── Gallery drop indicator (vertical line between cards) ───────────────
let _galleryDropLine: HTMLDivElement | null = null;
function ensureGalleryDropLine(): HTMLDivElement {
  const overlay = document.getElementById('shapion-overlay') || document.body;
  if (_galleryDropLine && overlay.contains(_galleryDropLine)) return _galleryDropLine;
  const el = document.createElement('div');
  el.className = 'shapion-card-drop-line vertical';
  overlay.appendChild(el);
  _galleryDropLine = el;
  return el;
}
function showGalleryDropLine(card: HTMLElement, placeAfter: boolean): void {
  const cr = card.getBoundingClientRect();
  const line = ensureGalleryDropLine();
  line.style.top = cr.top + 'px';
  line.style.height = cr.height + 'px';
  line.style.left = ((placeAfter ? cr.right : cr.left) - 1) + 'px';
  line.style.width = '2px';
  line.classList.add('on');
}
function hideGalleryDropLine(): void {
  if (_galleryDropLine) _galleryDropLine.classList.remove('on');
  // Defensive: also nuke any stale lines kanban / earlier code may have
  // left in the DOM. The user's "vertical line stays" report points to
  // such a stale element surviving a re-render.
  document.querySelectorAll<HTMLElement>('.shapion-card-drop-line').forEach((el) => {
    el.classList.remove('on');
  });
}

// ── Calendar view (month grid) ──────────────────────────

/** Currently-displayed month in the calendar view. Module-local so the
 *  prev / next / year buttons can advance it without re-fetching from SP.
 *  Initialised lazily on first render to "today's month". Reset to today
 *  if the user switches DBs (different `S.dbList` invalidates context). */
let _calYear: number | null = null;
let _calMonth: number | null = null;          // 0-based
let _calLastList: string | null = null;       // for context reset

/** Persist user's date-column choice per DB so the calendar remembers
 *  which date field to use (when there are multiple). */
function loadCalDateField(listTitle: string): string | null {
  return prefCalDateField(listTitle).get() || null;
}
function saveCalDateField(listTitle: string, internalName: string): void {
  prefCalDateField(listTitle).set(internalName);
}

function pad2(n: number): string { return n < 10 ? '0' + n : String(n); }

/** Build a YYYY-MM-DD key from a Date object using its LOCAL components
 *  (the calendar grid is laid out in local time, so the lookup must be too). */
function dateKey(d: Date): string {
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

export function renderCalendarView(): void {
  const root = g('calendar-view');
  root.innerHTML = '';

  const dateFields = S.dbFields.filter((f) => f.FieldTypeKind === 4);
  if (dateFields.length === 0) {
    root.innerHTML = '<div class="shapion-altview-empty">日付列がありません</div>';
    return;
  }

  // Reset calendar context when switching DBs
  if (_calLastList !== S.dbList) {
    _calLastList = S.dbList;
    _calYear = null; _calMonth = null;
  }
  const today = new Date();
  if (_calYear == null || _calMonth == null) {
    _calYear = today.getFullYear();
    _calMonth = today.getMonth();
  }

  // Resolve the active date field (saved choice → first available)
  const savedDF = loadCalDateField(S.dbList);
  const dateField =
    (savedDF && dateFields.find((f) => f.InternalName === savedDF)) || dateFields[0];

  const year = _calYear;
  const month = _calMonth;
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = first.getDay();
  const totalDays = last.getDate();

  // Group filtered items by their LOCAL date key
  const byDate: Record<string, ListItem[]> = {};
  getSortedFilteredItems().forEach((item) => {
    const v = getProp(item, dateField.InternalName);
    if (!v) return;
    const d = new Date(v);
    if (isNaN(d.getTime())) return;
    (byDate[dateKey(d)] ||= []).push(item);
  });

  const wrap = document.createElement('div');
  wrap.className = 'shapion-cal';

  // ── Header bar: nav buttons + month label + date-field picker ──
  const head = document.createElement('div');
  head.className = 'shapion-cal-head';
  // Left controls
  const navBox = document.createElement('div');
  navBox.className = 'shapion-cal-nav';
  const mkNavBtn = (label: string, title: string, action: () => void): HTMLButtonElement => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'shapion-cal-nav-btn';
    b.textContent = label;
    b.title = title;
    b.addEventListener('click', () => { action(); renderCalendarView(); });
    return b;
  };
  navBox.appendChild(mkNavBtn('«', '前年', () => { _calYear = (_calYear ?? today.getFullYear()) - 1; }));
  navBox.appendChild(mkNavBtn('‹', '前月', () => {
    let y = _calYear ?? today.getFullYear();
    let m = (_calMonth ?? today.getMonth()) - 1;
    if (m < 0) { m = 11; y--; }
    _calYear = y; _calMonth = m;
  }));
  navBox.appendChild(mkNavBtn('今日', '今日に戻る', () => {
    _calYear = today.getFullYear(); _calMonth = today.getMonth();
  }));
  navBox.appendChild(mkNavBtn('›', '翌月', () => {
    let y = _calYear ?? today.getFullYear();
    let m = (_calMonth ?? today.getMonth()) + 1;
    if (m > 11) { m = 0; y++; }
    _calYear = y; _calMonth = m;
  }));
  navBox.appendChild(mkNavBtn('»', '翌年', () => { _calYear = (_calYear ?? today.getFullYear()) + 1; }));
  head.appendChild(navBox);

  // Centre: month/year label
  const lbl = document.createElement('div');
  lbl.className = 'shapion-cal-title';
  lbl.textContent = year + '年 ' + (month + 1) + '月';
  head.appendChild(lbl);

  // Right: date-column picker (only when multiple date columns exist)
  const dfBox = document.createElement('div');
  dfBox.className = 'shapion-cal-dfbox';
  if (dateFields.length > 1) {
    const lab = document.createElement('span');
    lab.textContent = '日付列';
    dfBox.appendChild(lab);
    const sel = document.createElement('select');
    sel.className = 'shapion-cal-dfsel';
    for (const f of dateFields) {
      const o = document.createElement('option');
      o.value = f.InternalName; o.textContent = f.Title;
      if (f.InternalName === dateField.InternalName) o.selected = true;
      sel.appendChild(o);
    }
    sel.addEventListener('change', () => {
      saveCalDateField(S.dbList, sel.value);
      renderCalendarView();
    });
    dfBox.appendChild(sel);
  } else {
    // Single date column — just label it (informational)
    const lab = document.createElement('span');
    lab.className = 'shapion-cal-dfsingle';
    lab.textContent = '日付列: ' + dateField.Title;
    dfBox.appendChild(lab);
  }
  head.appendChild(dfBox);
  wrap.appendChild(head);

  // ── Day-of-week header row ──
  const dayHead = document.createElement('div');
  dayHead.className = 'shapion-cal-grid shapion-cal-dayhead';
  ['日', '月', '火', '水', '木', '金', '土'].forEach((d) => {
    const cell = document.createElement('div');
    cell.className = 'shapion-cal-cell';
    cell.textContent = d;
    dayHead.appendChild(cell);
  });
  wrap.appendChild(dayHead);

  // ── Day grid ──
  const grid = document.createElement('div');
  grid.className = 'shapion-cal-grid';

  // Leading empty cells need the cell class so their borders render
  // (otherwise the top-left of the calendar looks like it's missing
  // borders). Use a `shapion-cal-blank` modifier so we can suppress
  // padding / interactivity if needed.
  for (let i = 0; i < startDay; i++) {
    const blank = document.createElement('div');
    blank.className = 'shapion-cal-cell shapion-cal-blank';
    grid.appendChild(blank);
  }
  for (let d = 1; d <= totalDays; d++) {
    const cellDate = new Date(year, month, d);
    const cell = document.createElement('div');
    cell.className = 'shapion-cal-cell shapion-cal-day';
    cell.dataset.date = dateKey(cellDate);
    if (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      d === today.getDate()
    ) cell.classList.add('today');
    const num = document.createElement('div');
    num.className = 'shapion-cal-num';
    num.textContent = String(d);
    cell.appendChild(num);
    const key = dateKey(cellDate);
    (byDate[key] || []).forEach((item) => {
      const ev = document.createElement('div');
      ev.className = 'shapion-cal-event';
      ev.draggable = true;
      ev.dataset.id = String(item.Id);
      if (S.dbSelected.has(item.Id)) ev.classList.add('shapion-card-sel');
      const t = document.createElement('span');
      t.className = 'shapion-cal-event-title';
      t.textContent = item.Title || '(無題)';
      ev.appendChild(t);
      ev.appendChild(mkOpenRowBtn(item));
      attachCardSelectionHandlers(ev, item.Id);
      attachCalendarEventDrag(ev, item.Id);
      cell.appendChild(ev);
    });
    attachCalendarCellDrop(cell, dateField.InternalName);
    grid.appendChild(cell);
  }

  // Trailing empty cells to fill the last row (so its right edge / bottom
  // border is consistent). Compute how many cells are needed.
  const cellsUsed = startDay + totalDays;
  const remainder = cellsUsed % 7;
  if (remainder !== 0) {
    for (let i = 0; i < (7 - remainder); i++) {
      const blank = document.createElement('div');
      blank.className = 'shapion-cal-cell shapion-cal-blank';
      grid.appendChild(blank);
    }
  }

  wrap.appendChild(grid);
  root.appendChild(wrap);
}

// ── Calendar drag-to-reschedule ────────────────────────────────────────
//
// Dragging an event onto a different day cell rewrites the row's date
// column to match. Multi-row drags (when the dragged event is part of
// the current selection) move every selected row at once.

function attachCalendarEventDrag(ev: HTMLElement, itemId: number): void {
  ev.addEventListener('dragstart', (e) => {
    if (!e.dataTransfer) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/shapion-cal', String(itemId));
    ev.classList.add('shapion-cal-event-dragging');
    // Fade siblings of the same multi-selection
    const ids = S.dbSelected.has(itemId) ? Array.from(S.dbSelected) : [itemId];
    document.querySelectorAll<HTMLElement>('.shapion-cal-event[data-id]').forEach((n) => {
      const id = parseInt(n.dataset.id || '0', 10);
      if (ids.indexOf(id) >= 0) n.classList.add('shapion-cal-event-dragging');
    });
  });
  ev.addEventListener('dragend', () => {
    document.querySelectorAll('.shapion-cal-event-dragging').forEach((n) =>
      n.classList.remove('shapion-cal-event-dragging'));
    document.querySelectorAll('.shapion-cal-day-dropover').forEach((n) =>
      n.classList.remove('shapion-cal-day-dropover'));
  });
}

function attachCalendarCellDrop(cell: HTMLElement, dateInternalName: string): void {
  cell.addEventListener('dragover', (e) => {
    const dt = e.dataTransfer;
    if (!dt) return;
    e.preventDefault();
    dt.dropEffect = 'move';
    cell.classList.add('shapion-cal-day-dropover');
  });
  cell.addEventListener('dragleave', () => {
    cell.classList.remove('shapion-cal-day-dropover');
  });
  cell.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (!dt) return;
    cell.classList.remove('shapion-cal-day-dropover');
    const idStr = dt.getData('text/shapion-cal') || dt.getData('text/shapion-kb') || dt.getData('text/plain');
    if (!idStr) return;
    e.preventDefault();
    const fromId = parseInt(idStr, 10);
    if (!fromId) return;
    const targetDate = cell.dataset.date || '';
    if (!targetDate) return;
    const ids = S.dbSelected.has(fromId) ? Array.from(S.dbSelected) : [fromId];
    void rescheduleItems(ids, dateInternalName, targetDate);
  });
}

async function rescheduleItems(
  ids: number[], dateInternalName: string, targetDate: string,
): Promise<void> {
  // Optimistic update first so the calendar repaints instantly; revert
  // any row that fails. SP datetime values are stored as ISO strings —
  // we send the YYYY-MM-DD form which SP interprets as midnight UTC.
  const reverts: Array<() => void> = [];
  const pending: Promise<void>[] = [];
  for (const id of ids) {
    const item = S.dbItems.find((it) => it.Id === id);
    if (!item) continue;
    const oldVal = String(item[dateInternalName] || '');
    if (oldVal && oldVal.startsWith(targetDate)) continue;     // same day — skip
    item[dateInternalName] = targetDate;
    reverts.push(() => { item[dateInternalName] = oldVal; });
    const fieldMeta = S.dbFields.find((f) => f.InternalName === dateInternalName);
    pending.push(
      apiUpdateDbRow(S.dbList, id, { [dateInternalName]: targetDate })
        .then(() => {
          if (fieldMeta) recordCellChange(S.dbList, id, dateInternalName, fieldMeta.Title, oldVal, targetDate);
        }),
    );
  }
  if (pending.length === 0) return;
  // Re-render immediately with the optimistic value
  renderCalendarView();
  try {
    await Promise.all(pending);
  } catch (e) {
    reverts.forEach((r) => r());
    toast('日付更新失敗: ' + (e as Error).message, 'err');
    renderCalendarView();
  }
}

// ── Gantt view (simple horizontal bars) ─────────────────
export function renderGanttView(): void {
  const root = g('gantt-view');
  root.innerHTML = '';
  const dateFields = S.dbFields.filter((f) => f.FieldTypeKind === 4);
  if (dateFields.length === 0) {
    root.innerHTML = '<div class="shapion-altview-empty">日付列がありません</div>';
    return;
  }

  // Resolve the start/end columns: saved config takes precedence,
  // otherwise fall back to "first date column → start, second → end".
  const saved = loadGanttConfig(S.dbList);
  const startInternal = saved && dateFields.some((f) => f.InternalName === saved.start)
    ? saved.start
    : dateFields[0].InternalName;
  const endInternal = saved
    ? (saved.end && dateFields.some((f) => f.InternalName === saved.end) ? saved.end : null)
    : (dateFields[1]?.InternalName ?? null);

  // Config bar — let user pick start / end columns
  const cfgBar = document.createElement('div');
  cfgBar.className = 'shapion-gantt-cfg';
  cfgBar.innerHTML = '<span>開始</span>';
  const startSel = document.createElement('select');
  startSel.className = 'shapion-gantt-cfg-sel';
  dateFields.forEach((f) => {
    const o = document.createElement('option');
    o.value = f.InternalName; o.textContent = f.Title;
    if (f.InternalName === startInternal) o.selected = true;
    startSel.appendChild(o);
  });
  cfgBar.appendChild(startSel);
  const endLbl = document.createElement('span');
  endLbl.textContent = '終了';
  cfgBar.appendChild(endLbl);
  const endSel = document.createElement('select');
  endSel.className = 'shapion-gantt-cfg-sel';
  const noneOpt = document.createElement('option');
  noneOpt.value = ''; noneOpt.textContent = '(単日バー)';
  endSel.appendChild(noneOpt);
  dateFields.forEach((f) => {
    const o = document.createElement('option');
    o.value = f.InternalName; o.textContent = f.Title;
    if (f.InternalName === endInternal) o.selected = true;
    endSel.appendChild(o);
  });
  if (!endInternal) noneOpt.selected = true;
  cfgBar.appendChild(endSel);
  function persist(): void {
    const cfg: GanttConfig = {
      start: startSel.value,
      end: endSel.value || null,
    };
    saveGanttConfig(S.dbList, cfg);
    renderGanttView();
  }
  startSel.addEventListener('change', persist);
  endSel.addEventListener('change', persist);
  root.appendChild(cfgBar);

  const startField = dateFields.find((f) => f.InternalName === startInternal) || dateFields[0];
  const endField = endInternal
    ? (dateFields.find((f) => f.InternalName === endInternal) || startField)
    : startField;

  // Determine min/max date
  const items = S.dbItems
    .map((item) => {
      const s = getProp(item, startField.InternalName);
      const e = getProp(item, endField.InternalName) || s;
      if (!s) return null;
      return { item, start: new Date(s), end: new Date(e) };
    })
    .filter(Boolean) as Array<{ item: ListItem; start: Date; end: Date }>;
  if (items.length === 0) {
    const note = document.createElement('div');
    note.className = 'shapion-altview-empty';
    note.textContent = '日付データがありません';
    root.appendChild(note);
    return;
  }
  const minD = new Date(Math.min(...items.map((i) => i.start.getTime())));
  const maxD = new Date(Math.max(...items.map((i) => i.end.getTime())));
  const totalDays = Math.max(1, Math.ceil((maxD.getTime() - minD.getTime()) / 86400000) + 1);
  const dayW = 28; // px per day

  const wrap = document.createElement('div');
  wrap.className = 'shapion-gantt';

  const header = document.createElement('div');
  header.className = 'shapion-gantt-header';
  header.style.width = (totalDays * dayW) + 'px';
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(minD.getTime() + i * 86400000);
    const cell = document.createElement('div');
    cell.className = 'shapion-gantt-day';
    if (d.getDay() === 0 || d.getDay() === 6) cell.classList.add('weekend');
    cell.textContent = String(d.getDate());
    cell.title = d.toLocaleDateString('ja-JP');
    header.appendChild(cell);
  }
  wrap.appendChild(header);

  // Reflect selection state on the wrap so CSS can flip checkboxes to
  // always-visible (matches table-view behavior).
  if (S.dbSelected.size > 0) wrap.classList.add('shapion-has-sel');

  items.forEach((it) => {
    const row = document.createElement('div');
    row.className = 'shapion-gantt-row';
    row.dataset.id = String(it.item.Id);
    if (S.dbSelected.has(it.item.Id)) row.classList.add('shapion-card-sel');
    // Leading checkbox + drag handle, mirroring the table view's controls.
    const ctl = makeRowControls(it.item, () => {
      row.classList.toggle('shapion-card-sel', S.dbSelected.has(it.item.Id));
      if (S.dbSelected.size > 0) wrap.classList.add('shapion-has-sel');
      else wrap.classList.remove('shapion-has-sel');
    });
    row.appendChild(ctl);
    const label = document.createElement('div');
    label.className = 'shapion-gantt-label';
    const labelText = document.createElement('span');
    labelText.className = 'shapion-gantt-label-text';
    labelText.textContent = it.item.Title || '(無題)';
    label.appendChild(labelText);
    label.appendChild(mkOpenRowBtn(it.item));
    attachCardSelectionHandlers(row, it.item.Id);
    row.appendChild(label);
    const track = document.createElement('div');
    track.className = 'shapion-gantt-track';
    track.style.width = (totalDays * dayW) + 'px';
    const bar = document.createElement('div');
    const offset = Math.floor((it.start.getTime() - minD.getTime()) / 86400000);
    const span = Math.max(1, Math.ceil((it.end.getTime() - it.start.getTime()) / 86400000) + 1);
    bar.className = 'shapion-gantt-bar';
    bar.style.left = (offset * dayW) + 'px';
    bar.style.width = (span * dayW - 2) + 'px';
    bar.title = it.item.Title || '';
    track.appendChild(bar);
    row.appendChild(track);
    // Drag-reorder via the leading handle. Only active when no sort applied.
    const handle = ctl.querySelector<HTMLElement>('.shapion-rowctl-handle') || undefined;
    attachItemDrag(row, it.item, 'y', handle);
    wrap.appendChild(row);
  });

  root.appendChild(wrap);
}

// ── View dispatcher ─────────────────────────────────────
export function renderActiveView(view: string): void {
  if (view === 'list') renderListView();
  else if (view === 'gallery') renderGalleryView();
  else if (view === 'calendar') renderCalendarView();
  else if (view === 'gantt') renderGanttView();
}

// Helper used by row items in any view to open the row as a "page" (placeholder)
export function openItem(itemId: string): void {
  void doSelect(itemId);
}
