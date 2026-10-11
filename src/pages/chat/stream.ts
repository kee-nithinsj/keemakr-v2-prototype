/**
 * The prototype's reveal. Arrived text is in the flow at once (unread characters are invisible,
 * so a line never grows and then jumps). Speed eases toward the backlog over 250ms. A 14-character
 * opacity ramp, driven by a fractional index, glides the edge. Settled characters are not touched
 * again, so the line doesn't reflow under the fade.
 */
const EDGE = 14;

export function streamInto(
  p: HTMLElement,
  src: string,
  dead: () => boolean,
  { chunks = 3, gap = 450 }: { chunks?: number; gap?: number } = {},
): Promise<void> {
  const bold: Array<[number, number]> = [];
  const text = src.replace(/\*\*(.+?)\*\*/g, (_match, inner: string, at: number) => {
    const start = at - bold.length * 4;
    bold.push([start, start + inner.length]);
    return inner;
  });
  const isBold = (i: number) => bold.some(([a, b]) => i >= a && i < b);
  const esc = (c: string) => (c === '<' ? '&lt;' : c === '&' ? '&amp;' : c);
  const html = (a: number, b: number) => {
    let out = '';
    let on = false;
    for (let i = a; i < b; i++) {
      const ch = text[i] ?? '';
      const want = isBold(i);
      if (want !== on) {
        out += want ? '<b>' : '</b>';
        on = want;
      }
      out += esc(ch);
    }
    return on ? out + '</b>' : out;
  };

  const cuts: number[] = [];
  if (chunks > 1) {
    const per = text.length / chunks;
    for (let k = 1; k < chunks; k++) {
      const at = text.indexOf(' ', Math.round(per * k));
      cuts.push(at < 0 ? text.length : at + 1);
    }
  }
  cuts.push(text.length);

  let arrived = chunks === 1 ? text.length : 0;
  let finish: (() => void) | null = null;
  const ids = chunks === 1 ? [] : cuts.map((c, k) => setTimeout(() => {
    arrived = c;
    if (document.hidden && arrived === text.length) finish?.();
  }, k * gap));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const pin = () => {
    let el: HTMLElement | null = p.parentElement;
    while (el) {
      const oy = getComputedStyle(el).overflowY;
      if (oy === 'auto' || oy === 'scroll') {
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 160) el.scrollTop = el.scrollHeight;
        return;
      }
      el = el.parentElement;
    }
  };

  return new Promise((resolve) => {
    let onVis = () => {};
    const done = () => {
      ids.forEach(clearTimeout);
      document.removeEventListener('visibilitychange', onVis);
      resolve();
    };
    if (reduce || document.hidden || dead()) {
      if (!dead()) {
        p.innerHTML = html(0, text.length);
        pin();
      }
      done();
      return;
    }

    p.replaceChildren();
    const nodes: HTMLSpanElement[] = [];
    const grow = (n: number) => {
      for (let i = nodes.length; i < n; i++) {
        const sp = document.createElement('span');
        sp.textContent = text[i] ?? '';
        sp.style.opacity = '0';
        sp.style.transition = 'none';
        if (isBold(i)) sp.style.fontWeight = '500';
        nodes.push(sp);
      }
      p.append(...nodes.slice(p.childNodes.length));
    };

    let pos = 0;
    let v = 0;
    let last = performance.now();
    let solid = 0;
    // A display-synced frame callback is throttled to a crawl in some embedded browsers,
    // which turns the ramp into a series of jumps. A short timer keeps the edge gliding.
    let timer = 0;

    const stop = () => {
      clearInterval(timer);
      done();
    };
    finish = () => {
      if (dead()) return stop();
      p.innerHTML = html(0, text.length);
      pin();
      stop();
    };
    const tick = (now: number) => {
      if (dead()) return stop();
      if (nodes[0] && nodes[0].parentNode !== p) p.append(...nodes);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const backlog = arrived - pos;
      const target = backlog <= 0 ? 0 : Math.min(600, Math.max(35, backlog / 0.8));
      v += (target - v) * (1 - Math.exp(-dt / 0.25));
      pos = Math.min(arrived, pos + v * dt);

      if (arrived > nodes.length) {
        grow(arrived);
        pin();
      }
      const settled = Math.min(arrived, Math.max(0, Math.floor(pos - EDGE)));
      for (let i = solid; i < settled; i++) {
        const sp = nodes[i];
        if (!sp) continue;
        sp.style.opacity = '1';
        // The edge draws bold at 700. Settled text matches <b>, which is 500.
        if (isBold(i)) sp.style.fontWeight = '500';
      }
      solid = settled;
      const edgeEnd = Math.min(arrived, Math.floor(pos) + 1);
      for (let i = settled; i < edgeEnd; i++) {
        const sp = nodes[i];
        if (!sp) continue;
        sp.style.opacity = String(Math.max(0, Math.min(1, (pos - i) / EDGE)));
        if (isBold(i) && sp.style.fontWeight !== '700') sp.style.fontWeight = '700';
      }

      if (pos >= text.length - 0.001 && arrived === text.length) {
        p.innerHTML = html(0, text.length);
        pin();
        return stop();
      }
    };
    onVis = () => { if (!document.hidden) pos = arrived; };
    document.addEventListener('visibilitychange', onVis);
    timer = window.setInterval(() => tick(performance.now()), 16);
    tick(performance.now());
  });
}
