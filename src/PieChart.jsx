import React, { useEffect, useRef } from "react";

// Плавная анимация, плавные углы, круглое заполнение
export default function PieChart({ percent = 0, size = 140, fg = "#22c55e", bg = "#212b35" }) {
  // Сглаживание + радиус
  const r = size / 2 - 12;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, percent));
  const offset = circ * (1 - pct / 100);

  const fgRef = useRef();
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.style.transition = "stroke-dashoffset 0.8s cubic-bezier(.65,0,.22,1)";
    }
  }, []);

  return (
    <svg width={size} height={size} style={{ display: "block", margin: "0 auto" }}>
      {/* Тень */}
      <circle
        cx={cx}
        cy={cy}
        r={r + 2}
        fill="#000"
        opacity="0.17"
        filter="blur(6px)"
      />
      {/* Фоновый круг */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={bg}
        strokeWidth="19"
      />
      {/* Прогресс дуга */}
      <circle
        ref={fgRef}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={fg}
        strokeWidth="19"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{
          transition: "stroke-dashoffset 0.8s cubic-bezier(.65,0,.22,1)",
          filter: "drop-shadow(0 2px 16px #22c55e33)",
        }}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      {/* Текст в центре */}
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fontSize={size / 3.6}
        fill="#fff"
        fontWeight="bold"
        style={{
          fontFamily: "'Inter', Arial, sans-serif",
          letterSpacing: "0.03em",
          textShadow: "0 3px 12px #0008",
          paintOrder: "stroke fill",
          stroke: "#222a31",
          strokeWidth: "2.7px",
        }}
      >
        {Math.round(pct)}%
      </text>
    </svg>
  );
}
