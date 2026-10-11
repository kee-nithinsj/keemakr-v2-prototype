import { useEffect, type RefObject } from 'react';
import { useReducedMotion } from 'motion/react';

/** Wheel input eases toward its target instead of jumping. Reduced motion keeps native scroll. */
export function useFrictionScroll(feedRef: RefObject<HTMLElement | null>, ease = 0.16) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = feedRef.current;
    if (!el || reduced) return;
    let target = 0;
    let pos = 0;
    let timer = 0;
    const step = () => {
      const d = target - pos;
      if (Math.abs(d) < 0.5) {
        el.scrollTop = pos = target;
        window.clearInterval(timer);
        timer = 0;
        return;
      }
      pos += d * ease;
      el.scrollTop = pos;
    };
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 0) return;
      e.preventDefault();
      if (!timer) target = pos = el.scrollTop;
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientHeight : 1);
      target = Math.max(0, Math.min(max, target + dy));
      if (!timer) timer = window.setInterval(step, 16);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      window.clearInterval(timer);
    };
  }, [ease, feedRef, reduced]);
}
