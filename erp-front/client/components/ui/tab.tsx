import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Tabs (Tailwind only, no external CSS)
 * Props:
 * - tabs: [{ id?: string, title: string, content: ReactNode }]
 * - defaultIndex?: number
 * - onChange?: (index:number) => void
 *
 * Accessibility: role="tablist"/"tab"/"tabpanel", keyboard support (ArrowLeft/Right, Home, End, Enter/Space)
 * Visual indicator: absolute bottom bar moved by inline style (measured via refs) — styled with Tailwind classes only.
 */
export default function Tabs({ tabs = [], defaultIndex = 0, onChange }) {
  const [active, setActive] = useState(
    Math.min(Math.max(0, defaultIndex), tabs.length - 1),
  );
  const containerRef = useRef(null);
  const tabRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  // ensure tabRefs length matches
  useEffect(() => {
    tabRefs.current = tabRefs.current.slice(0, tabs.length);
  }, [tabs.length]);

  // update indicator position/size based on active tab
  const updateIndicator = () => {
    const container = containerRef.current;
    const activeBtn = tabRefs.current[active];
    if (!container || !activeBtn) {
      setIndicator({ left: 0, width: 0 });
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    setIndicator({
      left: btnRect.left - containerRect.left + container.scrollLeft,
      width: btnRect.width,
    });
  };

  // update on active change and on mount/resize/scroll
  useLayoutEffect(() => {
    updateIndicator();
    // small timeout to handle fonts/loading
    const t = setTimeout(updateIndicator, 30);
    return () => clearTimeout(t);
  }, [active, tabs.length]);

  useEffect(() => {
    const onResize = () => updateIndicator();
    window.addEventListener("resize", onResize);
    // if tabs container is scrollable, watch scroll
    const c = containerRef.current;
    if (c) c.addEventListener("scroll", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      if (c) c.removeEventListener("scroll", onResize);
    };
  }, []);

  // change active tab
  const activate = (index) => {
    const next = Math.max(0, Math.min(index, tabs.length - 1));
    setActive(next);
    if (typeof onChange === "function") onChange(next);
  };

  // keyboard navigation
  const onKeyDown = (e, index) => {
    const key = e.key;
    if (key === "ArrowRight") {
      e.preventDefault();
      activate((index + 1) % tabs.length);
    } else if (key === "ArrowLeft") {
      e.preventDefault();
      activate((index - 1 + tabs.length) % tabs.length);
    } else if (key === "Home") {
      e.preventDefault();
      activate(0);
    } else if (key === "End") {
      e.preventDefault();
      activate(tabs.length - 1);
    } else if (key === "Enter" || key === " ") {
      e.preventDefault();
      activate(index);
    }
  };

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        role="tablist"
        aria-label="Tabs"
        className="relative flex gap-2 overflow-x-auto no-scrollbar py-1 px-5"
      >
        {tabs.map((t, i) => (
          <button
            type="button"
            key={t.id ?? i}
            id={`tab-${t.id ?? i}`}
            role="tab"
            aria-selected={active === i}
            aria-controls={`panel-${t.id ?? i}`}
            tabIndex={active === i ? 0 : -1}
            ref={(el) => (tabRefs.current[i] = el)}
            onClick={() => activate(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={
              "relative whitespace-nowrap px-4 py-2 rounded-md transition-colors outline-none " +
              (active === i
                ? "text-primary bg-primary-100 font-semibold"
                : "text-gray-600 hover:text-primary hover:bg-primary-50")
            }
          >
            {t.title}
          </button>
        ))}
      </div>

      <div className="mt-3">
        {tabs.map((t, i) => (
          <div
            key={t.id ?? i}
            id={`panel-${t.id ?? i}`}
            role="tabpanel"
            aria-labelledby={`tab-${t.id ?? i}`}
            hidden={active !== i}
            className={
              "bg-white rounded-md p-4 shadow-sm transition-opacity duration-200 " +
              (active === i ? "opacity-100" : "opacity-0 pointer-events-none")
            }
          >
            {t.content}
          </div>
        ))}
      </div>
    </div>
  );
}
