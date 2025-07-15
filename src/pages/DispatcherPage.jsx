import React, { useState, useRef } from "react";
import Sidebar from "../Sidebar";

// Исходные станции и задания (точно по твоему скриншоту)
const initialColumns = [
  {
    title: "Станция 1 - Лазер HFR \"С1-Л\"",
    cards: [
      {
        task: "Задание № 600104",
        priority: "Приоритет №1",
        product: "Каркас нижний для паровоза мотовоза",
        status: "В работе",
        border: "border-r-4 border-blue-700"
      },
      {
        task: "Задание № 600104",
        priority: "Приоритет №1",
        product: "Каркас нижний для паровоза мотовоза",
        status: "Готов",
        border: "border-r-4 border-green-500"
      },
    ],
  },
  {
    title: "Станция 1 - Лазер HFR \"С1-Л\"",
    cards: [
      {
        task: "Задание № 123-01-03",
        priority: "Приоритет №1",
        product: "Каркас нижний для паровоза мотовоза",
        status: "Готов",
        border: "border-r-4 border-green-500"
      }
    ],
  }
];

export default function DispatcherPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [columns, setColumns] = useState(initialColumns);

  // dragItem: { colIdx, cardIdx }
  const dragItem = useRef(null);
  const [dragOver, setDragOver] = useState({ colIdx: null, cardIdx: null });

  // Начало drag карточки
  const onDragStart = (colIdx, cardIdx) => {
    dragItem.current = { colIdx, cardIdx };
  };

  // Перетаскиваем поверх другой карточки
  const onDragOverCard = (colIdx, cardIdx, e) => {
    e.preventDefault();
    setDragOver({ colIdx, cardIdx });
  };

  // Перетаскиваем поверх пустого места в колонке
  const onDragOverCol = (colIdx, e) => {
    e.preventDefault();
    setDragOver({ colIdx, cardIdx: null });
  };

  // Завершение drag&drop (бросить)
  const onDrop = (toColIdx, toCardIdx = null) => {
    const from = dragItem.current;
    if (!from) return;
    if (from.colIdx === toColIdx && from.cardIdx === toCardIdx) {
      setDragOver({ colIdx: null, cardIdx: null });
      return;
    }

    // Получаем карточку
    const columnsCopy = JSON.parse(JSON.stringify(columns));
    const [card] = columnsCopy[from.colIdx].cards.splice(from.cardIdx, 1);

    if (toCardIdx === null) {
      // Добавить в конец
      columnsCopy[toColIdx].cards.push(card);
    } else {
      // Вставить перед toCardIdx
      columnsCopy[toColIdx].cards.splice(toCardIdx, 0, card);
    }
    setColumns(columnsCopy);
    setDragOver({ colIdx: null, cardIdx: null });
    dragItem.current = null;
  };

  return (
    <div className="min-h-screen w-screen bg-gray-800 font-['Inter'] flex flex-row">
      {/* Sidebar с диспетчерским режимом */}
      <Sidebar navOpen={navOpen} setNavOpen={setNavOpen} dispatcher={true} />

      {/* Центральная зона */}
      <main className="flex-1 flex flex-row h-screen overflow-x-auto bg-gradient-to-b from-zinc-800 to-gray-700">
        {/* Колонки */}
        {columns.map((col, colIdx) => (
          <div
            key={colIdx}
            className="w-[370px] mx-7 mt-4 flex flex-col"
            onDragOver={e => onDragOverCol(colIdx, e)}
            onDrop={() => onDrop(colIdx)}
          >
            {/* Заголовок */}
            <div className="w-full h-16 bg-[#262c32] rounded-md flex items-center justify-center mb-4">
              <div className="text-white text-base font-normal text-center">
                {col.title}
              </div>
            </div>
            {/* Карточки */}
            {col.cards.map((c, idx) => (
              <div
                key={idx}
                className={`relative bg-zinc-800 rounded-md min-h-[110px] mb-7 shadow-lg ${c.border} cursor-grab hover:scale-[1.01] transition ${
                  dragOver.colIdx === colIdx && dragOver.cardIdx === idx ? "ring-2 ring-violet-400" : ""
                }`}
                draggable
                onDragStart={() => onDragStart(colIdx, idx)}
                onDragOver={e => onDragOverCard(colIdx, idx, e)}
                onDrop={() => onDrop(colIdx, idx)}
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
