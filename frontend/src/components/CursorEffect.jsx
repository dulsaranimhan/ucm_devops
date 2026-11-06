import { useEffect } from "react";
import "./CursorEffect.css";

function CursorEffect() {
  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    if (!finePointer.matches) return undefined;

    const root = document.documentElement;
    root.classList.add("ucm-cursor-active");

    const moveCursor = (event) => {
      root.style.setProperty("--cursor-x", `${event.clientX}px`);
      root.style.setProperty("--cursor-y", `${event.clientY}px`);
      root.classList.add("ucm-cursor-visible");
    };

    window.addEventListener("pointermove", moveCursor, { passive: true });
    return () => {
      window.removeEventListener("pointermove", moveCursor);
      root.classList.remove("ucm-cursor-active", "ucm-cursor-visible");
      root.style.removeProperty("--cursor-x");
      root.style.removeProperty("--cursor-y");
    };
  }, []);

  return (
    <div className="ucm-cursor" aria-hidden="true">
      <span className="ucm-cursor__dot" />
    </div>
  );
}

export default CursorEffect;
