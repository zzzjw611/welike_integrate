"use client";
import { useEffect, useState, useRef } from "react";

export default function CursorGlow() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number | null>(null);
  const posRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          setPos({ ...posRef.current });
          rafRef.current = null;
        });
      }
    };

    const enter = () => setVisible(true);
    const leave = () => setVisible(false);

    window.addEventListener("mousemove", move);

    const attach = () => {
      const targets = document.querySelectorAll(".hover-target");
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
      });
    };
    attach();

    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", move);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const targets = document.querySelectorAll(".hover-target");
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      });
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed z-[9999] rounded-full"
      style={{
        left: pos.x,
        top: pos.y,
        width: "90px",
        height: "90px",
        opacity: visible ? 1 : 0,
        transform: "translate(-50%, -50%)",
        transition: "opacity 0.18s ease",
        background:
          "radial-gradient(circle, rgba(0,255,170,0.30) 0%, rgba(0,255,170,0.14) 30%, rgba(0,255,170,0.06) 55%, transparent 74%)",
        mixBlendMode: "screen",
      }}
    />
  );
}
