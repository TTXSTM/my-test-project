import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../Sidebar";

const STATIONS = [
  'Станция № 1\nЛазер HFR "С1-Л"',
  'Станция № 2\nЛазер AFR "С2-Л"',
  'Станция № 3\nТрубогиб KB34',
  'Станция № 4\nТрубогиб KB34',
  'Станция № 5\nСлесарный оборонный участок ССБ',
  'Станция № 6\nСварочный участок Пост 1 "СВП1"',
  'Станция № 7\nУчасток покраски "УП"',
];

const STATUS_BORDER = {
  "В работе": "border-r-[12px] border-[#1640ae]",
  "Готов": "border-r-[12px] border-[#20d240]",
  "Закрыт": "border-r-[12px] border-gray-400",
  "Делать": "border-r-[12px] border-yellow-500",
  "Открыт": "border-r-[12px] border-slate-400",
};

const API_DISPATCHER_TASKS = "http://85.198.82.194:3001/api/dispatcher-tasks";
const CARD_FONT = "font-['Inter', 'Roboto Mono', monospace]";

// Оптимально для горизонтального скролла — автоматическая ширина
const getStationWidth = stationCount => {
  if (stationCount <= 3) return 440;
  if (stationCount <= 5) return 370;
  if (stationCount <= 7) return 320;
  return 260;
};

export default function DispatcherPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [columns, setColumns] = useState(() =>
    STATIONS.map(title => ({ title, cards: [] }))
  );
  const dragItem = useRef(null);
  const [dragOver, setDragOver] = useState({ colIdx: null, cardIdx: null, dragging: false });

  // Сохраняем стейт: кто скрыт, кто видим
  const [visibleColumns, setVisibleColumns] = useState(STATIONS.map(() => false));

  // Получение заданий
  useEffect(() => {
    async function fetchTasks() {
      const res = await fetch(API_DISPATCHER_TASKS);
      const data = await res.json();

      const stationMap = {};
      STATIONS.forEach(st => stationMap[st] = []);
      function matchStation(orderStation) {
        if (!orderStation) return null;
        const orderNorm = orderStation.replace(/\s+/g, " ").toLowerCase();
        let found = null, max = 0;
        STATIONS.forEach(stTitle => {
          const words = stTitle.replace(/\s+/g, " ").toLowerCase().split(" ").filter(w => w.length > 2);
          let score = 0;
          words.forEach(w => { if (orderNorm.includes(w)) score++; });
          if (score > max) { max = score; found = stTitle; }
        });
        return max >= 2 ? found : null;
      }
      (data || []).forEach(order => {
        const st = matchStation(order.station);
        if (st && stationMap[st] !== undefined) {
          stationMap[st].push({
            id: order.id,
            task: `Задание № ${order.order_number}`,
            priority: order.priority ? `Приоритет №${order.priority}` : "",
            description: order.description || "",
            status: order.status,
            border: STATUS_BORDER[order.status] || "border-r-[12px] border-blue-700",
          });
        }
      });
      // Сохраняем колонки и видимость
      const cols = STATIONS.map(title => ({
        title,
        cards: stationMap[title] || [],
      }));
      setColumns(cols);
      setVisibleColumns(cols.map(c => c.cards.length > 0));
    }
    fetchTasks();
  }, []);

  // Drag&Drop
  const onDragStart = (colIdx, cardIdx) => {
    dragItem.current = { colIdx, cardIdx };
    setDragOver(prev => ({ ...prev, dragging: true }));
  };

  const onDragOverCard = (colIdx, cardIdx, e) => {
    e.preventDefault();
    setDragOver({ colIdx, cardIdx, dragging: true });
  };
  const onDragOverCol = (colIdx, e) => {
    e.preventDefault();
    setDragOver({ colIdx, cardIdx: null, dragging: true });
  };
  const onDrop = (toColIdx, toCardIdx = null) => {
    const from = dragItem.current;
    if (!from) return;
    const columnsCopy = JSON.parse(JSON.stringify(columns));
    const [card] = columnsCopy[from.colIdx].cards.splice(from.cardIdx, 1);
    if (toCardIdx === null) columnsCopy[toColIdx].cards.push(card);
    else columnsCopy[toColIdx].cards.splice(toCardIdx, 0, card);
    setColumns(columnsCopy);
    setDragOver({ colIdx: null, cardIdx: null, dragging: false });
    dragItem.current = null;
    // Пересчитать видимость — вдруг колонка стала пустой
    setVisibleColumns(columnsCopy.map(c => c.cards.length > 0));
  };

  // Динамический подсчет ширины
  const visibleCount = visibleColumns.filter(v => v).length;
  const dragging = dragOver.dragging;
  const colWidth = getStationWidth(visibleCount || STATIONS.length);

  // Список индексов колонок, которые должны быть видимы:
  // - всегда все с заданиями
  // - если drag&drop активен — также "соседняя пустая" колонка для перемещения влево/вправо
  let activeCols = [];
  if (!dragging) {
    activeCols = columns.map((c, i) => visibleColumns[i] ? i : null).filter(i => i !== null);
  } else {
    // видим все, где есть задания + ближайшие пустые соседи
    const withCards = columns.map((c, i) => c.cards.length > 0 ? i : null).filter(i => i !== null);
    const toShow = new Set([...withCards]);
    withCards.forEach(i => {
      if (i > 0 && columns[i - 1].cards.length === 0) toShow.add(i - 1);
      if (i < columns.length - 1 && columns[i + 1].cards.length === 0) toShow.add(i + 1);
    });
    activeCols = Array.from(toShow).sort((a, b) => a - b);
  }

  // Основная верстка
  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#212731] to-[#28313f] font-['Inter'] flex flex-row">
      <Sidebar navOpen={navOpen} setNavOpen={setNavOpen} dispatcher={true} />
      <main
        className="flex-1 flex flex-row h-screen overflow-x-auto px-4 pt-6 pb-8 scrollbar-thin scrollbar-thumb-[#23283b]"
        style={{ minWidth: 400, gap: "24px" }}
      >
        {activeCols.map(colIdx => {
          const col = columns[colIdx];
          return (
            <div
              key={col.title}
              className={`transition-all flex flex-col bg-[#23282d] rounded-[7px] border border-[#313c4a] overflow-hidden shadow-md
                ${col.cards.length === 0 && dragging ? "opacity-70 border-dashed border-violet-500" : ""}`}
              style={{
                minWidth: colWidth,
                maxWidth: colWidth,
                marginLeft: 0, marginRight: 0,
                opacity: !dragging && col.cards.length === 0 ? 0 : 1,
                pointerEvents: (!dragging && col.cards.length === 0) ? "none" : "auto",
                height: "auto"
              }}
              onDragOver={e => onDragOverCol(colIdx, e)}
              onDrop={() => onDrop(colIdx)}
            >
              <div className="w-full px-5 py-2 bg-[#252c33] text-white text-[17px] font-semibold border-b border-[#303846] tracking-widest" style={{letterSpacing:".03em"}}>
                {col.title.split("\n").map((line, i) =>
                  <div key={i} className="whitespace-pre">{line}</div>
                )}
              </div>
              <div className="flex-1 px-1 pt-2 pb-4 min-h-[100px]">
                {col.cards.length === 0 ? (
                  <div className="h-[100px] flex items-center justify-center text-gray-400 text-base bg-[#232a32] rounded-md mt-2 select-none">
                    Нет заданий
                  </div>
                ) : col.cards.map((c, idx) => (
                  <div
                    key={c.id || idx}
                    className={`relative bg-[#23282d] rounded-[3px] min-h-[90px] mb-4 border border-[#323d4d] shadow-sm pl-5 pr-2 py-2 text-[22px] text-white ${CARD_FONT} ${c.border} flex flex-col justify-center
                    ${dragOver.colIdx === colIdx && dragOver.cardIdx === idx ? "ring-2 ring-violet-400 scale-[1.015] z-10" : ""}`}
                    style={{lineHeight:"1.15", letterSpacing:".03em"}}
                    draggable
                    onDragStart={() => onDragStart(colIdx, idx)}
                    onDragOver={e => onDragOverCard(colIdx, idx, e)}
                    onDrop={() => onDrop(colIdx, idx)}
                  >
                    <div className="font-semibold mb-2" style={{fontSize:"22px"}}>{c.task}</div>
                    {c.priority && <div className="mb-1" style={{fontWeight:500}}>{c.priority}</div>}
                    {c.description && <div className="mb-2" style={{fontWeight:400, whiteSpace:"pre-line"}}>{c.description}</div>}
                    <div className="font-semibold" style={{fontSize:"21px"}}>Статус: <span className="font-normal">{c.status}</span></div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
