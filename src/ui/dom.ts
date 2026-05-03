// DOM lookup helpers shared across the UI modules.

export function g(id: string): HTMLElement {
  const el = document.getElementById('shapion-' + id);
  if (!el) throw new Error('Shapion: missing element shapion-' + id);
  return el;
}

export function getOverlay(): HTMLElement {
  const el = document.getElementById('shapion-overlay');
  if (!el) throw new Error('Shapion: overlay not mounted');
  return el;
}

export function getEd(): HTMLElement { return g('ed'); }
