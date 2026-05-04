// Bookmarklet entry: bootstraps the overlay, mounts CSS + HTML, then calls init().

import { initConfig } from './config';
import { buildHtml } from './ui/html-template';
import { attachAll, init } from './ui/wiring';
import css from './styles/app.css';

(function () {
  // 多重起動防止 — 2 度目の押下は「閉じる」操作。
  // 旧インスタンスのバックグラウンド処理 (sync 監視ポール / presence ping /
  // autosave timer) は別 IIFE のクロージャに閉じ込められているので、ここで
  // 明示的に呼ばないと止まらない。残っていると、次に開いたときに OLD 側の
  // poller が NEW 側の保存 ETag を見て「別のタブ (あなた) が更新」を誤発火
  // させる。OLD 側の init() がオーバーレイ要素にハンドラを貼ってある。
  const existing = document.getElementById('shapion-overlay') as
    (HTMLElement & { __shapionShutdown?: () => void }) | null;
  if (existing) {
    try { existing.__shapionShutdown?.(); } catch { /* best-effort */ }
    existing.remove();
    const es = document.getElementById('shapion-style');
    if (es) es.remove();
    return;
  }

  // SharePoint check
  if (!location.hostname.endsWith('sharepoint.com')) {
    alert('SharePointのページ上でクリックしてください。');
    return;
  }

  initConfig();

  // CSS
  const st = document.createElement('style');
  st.id = 'shapion-style';
  st.textContent = css;
  document.head.appendChild(st);

  // HTML overlay
  const ov = document.createElement('div');
  ov.id = 'shapion-overlay';
  ov.innerHTML = buildHtml();
  document.body.appendChild(ov);

  // Wire up event handlers, then bootstrap.
  attachAll();
  void init();
})();
