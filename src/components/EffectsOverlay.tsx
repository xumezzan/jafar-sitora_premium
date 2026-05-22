import React, { useEffect, useRef, useState } from "react";
import { EventConceptId } from "../types";

interface EffectsOverlayProps {
  concept: EventConceptId;
}

export default function EffectsOverlay({ concept }: EffectsOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mouse, setMouse] = useState({ x: -1000, y: -1000, active: false });
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  // Update ref to avoid stale closure in canvas loop
  useEffect(() => {
    mouseRef.current = mouse;
  }, [mouse]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Watch resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Track mouse / touch
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY, active: true });
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        setMouse({ x: e.touches[0].clientX, y: e.touches[0].clientY, active: true });
      }
    };
    const handleMouseLeave = () => {
      setMouse({ x: -1000, y: -1000, active: false });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Botanical Falling Leaves
    interface Leaf {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      angle: number;
      spin: number;
      opacity: number;
      color: string;
    }
    const leaves: Leaf[] = [];
    const maxLeaves = 15;

    // Time counters
    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick++;

      const currentMouse = mouseRef.current;

      // --- FOREST EFFECT (Slow leaves & tree branch shadows) ---
      // Shadow overlay on top corner: simulated moving leaves/branches
      ctx.save();
      ctx.fillStyle = "rgba(26, 46, 34, 0.035)"; // Pine Green shadow
      
      ctx.beginPath();
      // Left tree branches wobble
      const leftWobble1 = Math.sin(tick * 0.005) * 30;
      const leftWobble2 = Math.cos(tick * 0.007) * 20;
      ctx.moveTo(-100, -100);
      ctx.bezierCurveTo(400 + leftWobble1, -100 + leftWobble2, 200, 300, -100, 500);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      // Right tree branches wobble
      const rightWobble1 = Math.cos(tick * 0.006) * 25;
      const rightWobble2 = Math.sin(tick * 0.004) * 15;
      ctx.moveTo(width + 100, -100);
      ctx.bezierCurveTo(width - 400 + rightWobble1, -100 + rightWobble2, width - 200, 400, width + 100, 400);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Spawn falling organic leaves
      if (leaves.length < maxLeaves && Math.random() < 0.02) {
        const size = 6 + Math.random() * 12;
        
        // Herbal, olive, emerald, pine green tints
        const colors = [
          "rgba(138, 154, 91, 0.45)", // Sage
          "rgba(47, 79, 79, 0.35)",   // Dark slate green
          "rgba(85, 107, 47, 0.4)",   // Olive
          "rgba(26, 46, 34, 0.3)"     // Forest
        ];

        leaves.push({
          x: Math.random() * width,
          y: -20,
          size,
          speedY: 0.6 + Math.random() * 1.0,
          speedX: -0.4 + Math.random() * 0.8,
          angle: Math.random() * Math.PI * 2,
          spin: -0.01 + Math.random() * 0.02,
          opacity: 0.2 + Math.random() * 0.45,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }

      // Draw and update leaves
      for (let i = leaves.length - 1; i >= 0; i--) {
        const l = leaves[i];
        
        // Let cursor blow leaves slightly if close
        if (currentMouse.active) {
          const dx = currentMouse.x - l.x;
          const dy = currentMouse.y - l.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const angle = Math.atan2(dy, dx);
            const force = (150 - dist) / 150;
            // Push gently away
            l.x -= Math.cos(angle) * force * 2.5;
            l.y -= Math.sin(angle) * force * 1.5;
          }
        }

        l.y += l.speedY;
        l.x += l.speedX + Math.sin(tick * 0.015 + l.angle) * 0.3;
        l.angle += l.spin;

        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.angle);
        ctx.fillStyle = l.color;
        
        // Draw elegant leaf shape with path
        ctx.beginPath();
        ctx.moveTo(0, -l.size);
        ctx.quadraticCurveTo(l.size * 0.6, 0, 0, l.size);
        ctx.quadraticCurveTo(-l.size * 0.6, 0, 0, -l.size);
        ctx.closePath();
        ctx.fill();
        
        // Center spine of leaf
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, -l.size);
        ctx.lineTo(0, l.size * 0.8);
        ctx.stroke();

        ctx.restore();

        // Remove dead leaves
        if (l.y > height + 20) {
          leaves.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Trigger loop
    render();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [concept]);

  return (
    <canvas
      ref={canvasRef}
      id="effects-overlay-canvas"
      className="fixed inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}
