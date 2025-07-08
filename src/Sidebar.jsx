// Sidebar.jsx
import React from "react";
import PieChart from "./PieChart";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ navOpen, setNavOpen, progressPercent = 0 }) {
  const navigate = useNavigate();

  // Массив меню для удобства
  const menu = [
    { label: "Проекты", to: "/dashboard" },
    { label: "Диспетчерская", to: "/dispatcher" },
    { label: "Дашборды", to: "/dashboard" },
    { label: "План производства", to: "/plan" },
  ];

  return (
    <aside className="w-full md:w-80 bg-[#323A44] flex-shrink-0 px-0 py-0 flex flex-col min-h-screen relative z-40">
      {/* Навигация */}
      <button
        className="block text-left text-white font-bold tracking-wide w-full text-xl py-6 px-8 transition duration-300 hover:bg-[#593064]/90"
        style={{
          background: "linear-gradient(90deg, #2d3143 60%, #593064 120%)",
          letterSpacing: "0.06em",
        }}
        onClick={() => setNavOpen((v) => !v)}
      >
        Навигация
      </button>

      {/* Меню (выпадает только при navOpen) */}
      {navOpen && (
        <div className="flex flex-col w-full animate-fade-in">
          {menu.map((item) => (
            <button
              key={item.label}
              className="text-left text-white w-full py-4 px-8 text-base transition-all duration-300
                hover:scale-[1.03] hover:bg-[#7b3ab9]/70 hover:shadow-lg active:bg-[#593064]/80"
              style={{
                background: "linear-gradient(90deg, #46295e 0%, #323A44 100%)",
                fontFamily: "Inter, Arial, sans-serif",
                letterSpacing: "0.05em",
              }}
              onClick={() => {
                setNavOpen(false);
                navigate(item.to);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Поиск */}
      <button
        className="block text-left text-white w-full py-4 px-8 text-base transition-all duration-300
          hover:scale-[1.03] hover:bg-[#7b3ab9]/70 hover:shadow-lg active:bg-[#593064]/80"
        style={{
          background: "linear-gradient(90deg, #46295e 0%, #323A44 100%)",
          fontFamily: "Inter, Arial, sans-serif",
          letterSpacing: "0.05em",
        }}
        onClick={() => {
          // Здесь можно добавить действие поиска
        }}
      >
        Поиск
      </button>

      <div className="w-full flex justify-center items-center mt-14 mb-3">
        <div className="bg-[#222a31] rounded-xl shadow-lg p-4">
          <PieChart percent={progressPercent} size={140} />
        </div>
      </div>

    </aside>
  );
}
