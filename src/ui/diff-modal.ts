// Diff-preview confirmation modal for Tool Use update_page / update_db_row.
//
// confirmPageUpdate    — page body / title diff
// confirmDbRowUpdate   — DB row column changes + optional body diff
//
// Both resolve Promise<boolean> based on the user's OK / Cancel choice.

import { getOverlay } from './dom';
import { escapeHtml } from '../lib/html-escape';

interface DiffOpts {
  pageId: string;
  pageTitle: string;
  oldTitle?: string;
  newTitle?: string;
  oldBody?: string;
  newBody?: string;
}

export function confirmPageUpdate(opts: DiffOpts): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = getOverlay();
    if (!overlay) { resolve(false); return; }

    // Strip any previous instance
    document.getElementById('shapion-diff-modal')?.remove();

    const root = document.createElement('div');
    root.id = 'shapion-diff-modal';
    root.className = 'shapion-diff-modal on';

    const card = document.createElement('div');
    card.className = 'shapion-diff-card';

    const titleChanged = opts.newTitle != null && opts.newTitle !== (opts.oldTitle || '');
    const bodyChanged = opts.newBody != null && opts.newBody !== (opts.oldBody || '');

    const head = document.createElement('div');
    head.className = 'shapion-diff-head';
    head.innerHTML =
      '<h2>ページ更新の確認</h2>' +
      '<div class="shapion-diff-sub">' +
        escapeHtml(opts.pageTitle || '無題') + ' (id=' + escapeHtml(opts.pageId) + ')' +
      '</div>';
    card.appendChild(head);

    if (titleChanged) {
      const tRow = document.createElement('div');
      tRow.className = 'shapion-diff-title-row';
      tRow.innerHTML =
        '<div class="shapion-diff-label">タイトル</div>' +
        '<div class="shapion-diff-title-old">' + escapeHtml(opts.oldTitle || '') + '</div>' +
        '<div class="shapion-diff-arrow">→</div>' +
        '<div class="shapion-diff-title-new">' + escapeHtml(opts.newTitle || '') + '</div>';
      card.appendChild(tRow);
    }

    if (bodyChanged) {
      const bWrap = document.createElement('div');
      bWrap.className = 'shapion-diff-body';
      const bLabel = document.createElement('div');
      bLabel.className = 'shapion-diff-label';
      bLabel.textContent = '本文の差分';
      bWrap.appendChild(bLabel);
      const pre = document.createElement('pre');
      pre.className = 'shapion-diff-pre';
      pre.appendChild(renderDiff(opts.oldBody || '', opts.newBody || ''));
      bWrap.appendChild(pre);
      card.appendChild(bWrap);
    }

    if (!titleChanged && !bodyChanged) {
      const note = document.createElement('div');
      note.className = 'shapion-diff-empty';
      note.textContent = '変更がありません';
      card.appendChild(note);
    }

    const actions = document.createElement('div');
    actions.className = 'shapion-diff-actions';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'shapion-btn s';
    cancelBtn.textContent = 'キャンセル';
    const okBtn = document.createElement('button');
    okBtn.className = 'shapion-btn p';
    okBtn.textContent = '更新する';
    actions.append(cancelBtn, okBtn);
    card.appendChild(actions);

    root.appendChild(card);
    overlay.appendChild(root);

    function close(result: boolean): void {
      root.remove();
      document.removeEventListener('keydown', onKey, true);
      resolve(result);
    }
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.preventDefault(); e.stopPropagation(); close(false);
      }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault(); e.stopPropagation(); close(true);
      }
    }
    cancelBtn.addEventListener('click', () => close(false));
    okBtn.addEventListener('click', () => close(true));
    root.addEventListener('click', (e) => { if (e.target === root) close(false); });
    // Capture phase so we beat the global onKey (which would otherwise show
    // the close-app confirm dialog after we close this modal).
    document.addEventListener('keydown', onKey, true);

    setTimeout(() => okBtn.focus(), 30);
  });
}

// ── DB row update confirmation ──────────────────────────────────

interface DbRowDiffOpts {
  dbTitle: string;
  rowId: number;
  rowTitle: string;
  fieldChanges: Array<{ name: string; oldValue: string; newValue: string }>;
  oldBody?: string;
  newBody?: string;
}

export function confirmDbRowUpdate(opts: DbRowDiffOpts): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = getOverlay();
    if (!overlay) { resolve(false); return; }
    document.getElementById('shapion-diff-modal')?.remove();

    const root = document.createElement('div');
    root.id = 'shapion-diff-modal';
    root.className = 'shapion-diff-modal on';

    const card = document.createElement('div');
    card.className = 'shapion-diff-card';

    const head = document.createElement('div');
    head.className = 'shapion-diff-head';
    head.innerHTML =
      '<h2>行更新の確認</h2>' +
      '<div class="shapion-diff-sub">' +
        escapeHtml(opts.dbTitle) + ' #' + opts.rowId +
        (opts.rowTitle ? ' — ' + escapeHtml(opts.rowTitle) : '') +
      '</div>';
    card.appendChild(head);

    const bodyChanged = opts.newBody != null && opts.newBody !== (opts.oldBody || '');
    const hasFieldChanges = opts.fieldChanges.length > 0;

    if (hasFieldChanges) {
      const wrap = document.createElement('div');
      wrap.className = 'shapion-diff-fields';
      const lbl = document.createElement('div');
      lbl.className = 'shapion-diff-label';
      lbl.textContent = '列の変更';
      wrap.appendChild(lbl);
      const tbl = document.createElement('table');
      tbl.className = 'shapion-diff-fields-tbl';
      for (const ch of opts.fieldChanges) {
        const tr = document.createElement('tr');
        tr.innerHTML =
          '<td class="shapion-diff-fname">' + escapeHtml(ch.name) + '</td>' +
          '<td class="shapion-diff-title-old">' + escapeHtml(ch.oldValue || '(空)') + '</td>' +
          '<td class="shapion-diff-arrow">→</td>' +
          '<td class="shapion-diff-title-new">' + escapeHtml(ch.newValue || '(空)') + '</td>';
        tbl.appendChild(tr);
      }
      wrap.appendChild(tbl);
      card.appendChild(wrap);
    }

    if (bodyChanged) {
      const bWrap = document.createElement('div');
      bWrap.className = 'shapion-diff-body';
      const bLabel = document.createElement('div');
      bLabel.className = 'shapion-diff-label';
      bLabel.textContent = '本文の差分';
      bWrap.appendChild(bLabel);
      const pre = document.createElement('pre');
      pre.className = 'shapion-diff-pre';
      pre.appendChild(renderDiff(opts.oldBody || '', opts.newBody || ''));
      bWrap.appendChild(pre);
      card.appendChild(bWrap);
    }

    if (!hasFieldChanges && !bodyChanged) {
      const note = document.createElement('div');
      note.className = 'shapion-diff-empty';
      note.textContent = '変更がありません';
      card.appendChild(note);
    }

    const actions = document.createElement('div');
    actions.className = 'shapion-diff-actions';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'shapion-btn s';
    cancelBtn.textContent = 'キャンセル';
    const okBtn = document.createElement('button');
    okBtn.className = 'shapion-btn p';
    okBtn.textContent = '更新する';
    actions.append(cancelBtn, okBtn);
    card.appendChild(actions);

    root.appendChild(card);
    overlay.appendChild(root);

    function close(result: boolean): void {
      root.remove();
      document.removeEventListener('keydown', onKey, true);
      resolve(result);
    }
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.preventDefault(); e.stopPropagation(); close(false);
      }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault(); e.stopPropagation(); close(true);
      }
    }
    cancelBtn.addEventListener('click', () => close(false));
    okBtn.addEventListener('click', () => close(true));
    root.addEventListener('click', (e) => { if (e.target === root) close(false); });
    // Capture phase to keep the global ESC handler from running after us.
    document.addEventListener('keydown', onKey, true);

    setTimeout(() => okBtn.focus(), 30);
  });
}

// ── pure diff helpers ──────────────────────────────────────────

interface DiffOp { type: 'eq' | 'del' | 'add'; line: string }

/** Render a unified line-level diff into a DocumentFragment. */
function renderDiff(oldText: string, newText: string): DocumentFragment {
  const ops = diffLines(oldText.split('\n'), newText.split('\n'));
  const frag = document.createDocumentFragment();
  for (const op of ops) {
    const line = document.createElement('span');
    line.className = 'shapion-diff-line shapion-diff-' + op.type;
    const sigil = op.type === 'add' ? '+ ' : op.type === 'del' ? '- ' : '  ';
    line.textContent = sigil + op.line + '\n';
    frag.appendChild(line);
  }
  return frag;
}

/** Line diff via LCS. O(n*m) memory; fine for Shapion page sizes. */
function diffLines(a: string[], b: string[]): DiffOp[] {
  const n = a.length;
  const m = b.length;
  // dp[i][j] = LCS length of a[0..i) and b[0..j)
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const ops: DiffOp[] = [];
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) { ops.push({ type: 'eq', line: a[i - 1] }); i--; j--; }
    else if (dp[i - 1][j] >= dp[i][j - 1]) { ops.push({ type: 'del', line: a[i - 1] }); i--; }
    else { ops.push({ type: 'add', line: b[j - 1] }); j--; }
  }
  while (i > 0) { ops.push({ type: 'del', line: a[i - 1] }); i--; }
  while (j > 0) { ops.push({ type: 'add', line: b[j - 1] }); j--; }
  return ops.reverse();
}
