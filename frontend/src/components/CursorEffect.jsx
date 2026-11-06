import { useEffect } from "react";
import "./CursorEffect.css";

function CursorEffect() {
  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    if (!finePointer.matches) return undefined;

    const root = document.documentElement;
    root.classList.add("ucm-cursor-active");
    let targetX = -30;
    let targetY = -30;
    let trailX = targetX;
    let trailY = targetY;
    let frame = null;

    const animateTrail = () => {
      trailX += (targetX - trailX) * 0.18;
      trailY += (targetY - trailY) * 0.18;
      root.style.setProperty("--cursor-trail-x", `${trailX}px`);
      root.style.setProperty("--cursor-trail-y", `${trailY}px`);

      if (Math.abs(targetX - trailX) > 0.2 || Math.abs(targetY - trailY) > 0.2) {
        frame = window.requestAnimationFrame(animateTrail);
      } else {
        frame = null;
      }
    };

    const moveCursor = (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      root.style.setProperty("--cursor-x", `${targetX}px`);
      root.style.setProperty("--cursor-y", `${targetY}px`);
      if (frame === null) frame = window.requestAnimationFrame(animateTrail);
      root.classList.add("ucm-cursor-visible");
    };
    const updateHover = (event) => {
      const candidate = event.type === "pointerout" ? event.relatedTarget : event.target;
      const target = candidate instanceof Element ? candidate : null;
      root.classList.toggle("ucm-cursor-hovering", Boolean(target?.closest("a, button, [role='button']")));
    };

    window.addEventListener("pointermove", moveCursor, { passive: true });
    document.addEventListener("pointerover", updateHover, true);
    document.addEventListener("pointerout", updateHover, true);
    return () => {
      window.removeEventListener("pointermove", moveCursor);
      document.removeEventListener("pointerover", updateHover, true);
      document.removeEventListener("pointerout", updateHover, true);
      root.classList.remove("ucm-cursor-active", "ucm-cursor-visible", "ucm-cursor-hovering");
      root.style.removeProperty("--cursor-x");
      root.style.removeProperty("--cursor-y");
      root.style.removeProperty("--cursor-trail-x");
      root.style.removeProperty("--cursor-trail-y");
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="ucm-cursor" aria-hidden="true">
      <span className="ucm-cursor__trail" />
      <span className="ucm-cursor__dot" />
    </div>
  );
}

export default CursorEffect;
