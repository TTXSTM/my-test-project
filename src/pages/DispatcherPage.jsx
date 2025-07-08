import React from "react";

const stations = [
  { name: "Станция № 3", tool: "Труборез КВ34" },
  { name: "Станция № 3", tool: "Труборез КВ34" },
  { name: "Станция № 3", tool: "Труборез КВ34" },
  { name: "Станция № 3", tool: "Труборез КВ34" },
];

const columns = [
  {
    title: "Станция № 3\nТруборез КВ34",
    cards: [
      {
        task: "Задание № 123-01-02",
        priority: "Приоритет №1",
        product: "Каркас нижний для паровоза мотовоза",
        status: "В работе",
        border: "border-r-4 border-blue-700"
      },
    ],
  },
  {
    title: "Станция № 4\nТруборез КВ34",
    cards: [
      {
        task: "Задание № 123-01-03",
        priority: "Приоритет №1",
        product: "Каркас нижний для паровоза мотовоза",
        status: "Готов",
        border: "border-r-4 border-green-500"
      },
    ],
  },
];

export default function DispatcherPage() {
  return (
    <div className="min-h-screen w-screen bg-gray-800 font-['Inter'] flex flex-row">
      {/* Левая панель */}
      <aside className="relative w-72 min-w-[256px] h-screen bg-[#1c232a] flex flex-col items-center py-0 px-0">
        {/* Навигация */}
        <div className="w-full h-12 bg-gradient-to-r from-purple-950 to-slate-800 flex items-center pl-5">
          <span className="text-white text-lg font-semibold tracking-wide">Навигация</span>
        </div>
        {/* Суточные задания */}
        <div className="w-56 h-28 mt-6 mb-2 text-center flex items-center justify-center text-indigo-200 text-2xl font-normal">
          Суточные задания
        </div>
        {/* Номер заказа */}
        <div className="w-56 h-14 mb-4 relative">
          <div className="absolute inset-0 bg-zinc-800 rounded" />
          <div className="w-44 h-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-700 flex items-center justify-center text-white text-sm font-normal rounded">
            Номер заказа
          </div>
        </div>
        {/* Кнопки станций */}
        <div className="flex flex-col gap-3 w-56">
          {stations.map((st, idx) => (
            <button
              key={idx}
              className="flex gap-2 mb-2 items-center group"
              onClick={() => alert(`Клик по станции ${st.name}`)}
            >
              <div className="w-11 h-9 bg-gray-700 rounded group-hover:bg-violet-700 transition" />
              <div className="flex-1 h-9 bg-gray-700 rounded flex items-center justify-center group-hover:bg-violet-700 transition">
                <span className="text-white text-sm">{st.name} <br />{st.tool}</span>
              </div>
            </button>
          ))}
        </div>
        {/* Нижний блок */}
        <div className="w-56 h-36 mt-auto mb-4 bg-zinc-800 rounded" />
      </aside>

      {/* Центральная зона */}
      <main className="flex-1 flex flex-row h-screen overflow-x-auto bg-gradient-to-b from-zinc-800 to-gray-700">
        {/* Колонки */}
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="w-[370px] mx-7 mt-4 flex flex-col">
            {/* Заголовок */}
            <div className="w-full h-20 bg-[#262c32] rounded-md flex items-center justify-center mb-4">
              <div className="text-white text-base font-normal whitespace-pre-line text-center">
                {col.title}
              </div>
            </div>
            {/* Карточки */}
            {col.cards.map((c, idx) => (
              <div
                key={idx}
                className={`relative bg-zinc-800 rounded-md min-h-[150px] mb-7 shadow-lg ${c.border} cursor-pointer hover:scale-[1.01] transition`}
                onClick={() => alert(`Клик по карточке: ${c.task}`)}
              >
                <div className="px-5 py-4">
                  <div className="text-white text-base font-semibold mb-1">{c.task}</div>
                  <div className="text-white text-sm mb-1">{c.priority}</div>
                  <div className="text-white text-sm mb-1">{c.product}</div>
                  <div className="text-white text-sm font-bold">Статус: {c.status}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}
