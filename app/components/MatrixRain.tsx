// components/MatrixRain.tsx
import { useEffect, useRef } from "react";

export default function MatrixRain({ intensity = "normal" }: { intensity?: "low" | "normal" | "high" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    const chars = "01"; // só 0 e 1 agora, mais limpo
    const fontSize = intensity === "high" ? 16 : 14;
    let columns = Math.floor(canvas.width / fontSize);
    let drops: number[] = Array(columns).fill(1);

    // Recalcular colunas ao redimensionar
    const handleResize = () => {
      resizeCanvas();
      columns = Math.floor(canvas.width / fontSize);
      drops = Array(columns).fill(1);
    };

    const draw = () => {
      // Fundo preto com leve transparência para o efeito "rastro"
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = "center";

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize + fontSize / 2;
        const y = drops[i] * fontSize;

        // Efeito de brilho branco com fade conforme desce (quanto mais abaixo, mais escuro)
        const opacity = 1 - (y / canvas.height) * 0.7; // mais claro no topo, mais escuro embaixo
        const brightness = 200 + Math.random() * 55; // variação sutil para dar vida

        ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${opacity})`;

        ctx.fillText(text, x, y);

        // Caracteres na frente (mais brilhantes e brancos puros aleatoriamente)
        if (Math.random() > 0.975) {
          ctx.fillStyle = "rgba(255, 255, 255, 1)";
          ctx.fillText(text, x, y);
        }

        // Reset da coluna quando sai da tela
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 35);
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, [intensity]);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />;
}