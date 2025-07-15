import React, { useState } from "react";
import PieChart from "./PieChart";
import { useNavigate } from "react-router-dom";

// Массив станций для диспетчерской
const defaultStations = [
  { name: "Станция № 3", tool: "Труборез КВ34" },
  { name: "Станция № 3", tool: "Труборез КВ34" },
  { name: "Станция № 3", tool: "Труборез КВ34" },
  { name: "Станция № 3", tool: "Труборез КВ34" },
];

export default function Sidebar({
  navOpen,
  setNavOpen,
  progressPercent = 0,
  dispatcher = false
}) {
  const navigate = useNavigate();

  // Для галочек по станциям
  const [checked, setChecked] = useState([true, false, true, false]); // из примера на скрине, или просто [false, false, false, false]

  // Главное меню
  const menu = [
    { label: "Проекты", to: "/dashboard" },
    { label: "Диспетчерская", to: "/dispatcher" },
    { label: "Дашборды", to: "/dashboard" },
    { label: "План производства", to: "/plan" },
  ];

  const handleStationClick = idx => {
    setChecked(prev => prev.map((val, i) => (i === idx ? !val : val)));
  };

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
          // Можно добавить действие поиска
        }}
      >
        Поиск
      </button>

      {/* === Блоки только для dispatcher === */}
      {dispatcher && (
        <div className="flex flex-col items-center w-full pt-7 pb-2">
          {/* Суточные задания */}
          <div className="w-full h-25 bg-[#34414C] mb-5 flex items-center justify-center">
            <span className="text-indigo-200 text-lg font-normal tracking-wide">
              Суточные задания
            </span>
          </div>
          {/* Номер заказа */}
          <div className="w-full h-12 mb-4 relative">
            <div className="absolute inset-0 bg-zinc-800" />
            <div className="w-44 h-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-700 flex items-center justify-center text-white text-sm font-normal rounded">
              Номер заказа
            </div>
          </div>
          {/* Кнопки станций */}
          <div className="flex px-5 flex-col gap-3 w-full">
            {defaultStations.map((st, idx) => (
              <button
                key={idx}
                className="flex gap-2 mb-2 items-center group"
                onClick={() => handleStationClick(idx)}
              >
                <div className={`w-11 h-10 bg-gray-700 rounded group-hover:bg-violet-700 transition flex items-center justify-center`}>
                  {checked[idx] && (
                    <svg width="26" height="26" fill="none" viewBox="0 0 26 26">
                      <rect x="1" y="1" width="24" height="24" rx="5" fill="#353f46" />
                      <path d="M7 13.5l4 4 8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 bg-gray-700 rounded flex items-center justify-center group-hover:bg-violet-700 transition">
                  <span className="text-white text-sm">{st.name} <br />{st.tool}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Прогресс только если НЕ dispatcher */}
      {!dispatcher && (
        <div className="w-full flex justify-center items-center mt-14 mb-3">
          <div className="bg-[#222a31] rounded-xl shadow-lg p-4">
            <PieChart percent={progressPercent} size={140} />
          </div>
        </div>
      )}
    </aside>
  );
}
