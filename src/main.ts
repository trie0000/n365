// Bookmarklet entry: bootstraps the overlay, mounts CSS + HTML, then calls init().

import { initConfig } from './config';
import { buildHtml } from './ui/html-template';
import { attachAll, init } from './ui/wiring';
import css from './styles/app.css';

(function () {
  // 多重起動防止
  const existing = document.getElementById('shapion-overlay');
  if (existing) {
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
