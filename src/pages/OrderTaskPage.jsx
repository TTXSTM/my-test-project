import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { useOrders } from "../OrdersContext";
import Sidebar from "../Sidebar";

const uploaderFio = "Ананин В.М.";

const MARSHRUTS = [
  { id: 1, name: "Маршрут листового металла № 1", stations: [
    'Станция 1 - Лазер HFR “С1-Л”',
    'Станция 3 - Участок финишной зачистки “С3-фЗ”',
    'Станция 4 - Гибочный станок FinnPower “ГБFP”',
    'Станция 5 - Слесарный оборонный участок ССБ',
    'Станция 7 - Участок покраски “УП”',
  ]},
  { id: 2, name: "Маршрут листового металла № 2", stations: [
    'Станция 2 - Лазер AFR “С2-Л”',
    'Станция 4 - Гибочный станок FinnPower “ГБFP”',
    'Станция 6 - Сварочный участок Пост 1 “СВП1”',
    'Станция 7 - Участок покраски “УП”',
  ]},
];

const initialMockRows = Array.from({ length: 12 }).map((_, i) => ({
  partNum: "6007005",
  name: "GT3-07.00.00.01",
  code: "Труба 30х30х2",
  material: "3х1250х2500 ГОСТ 19904-90 II-Ст3Сп ГОСТ 535-2005",
  count: "23",
  made: "",
  cell: "-",
  status: "В работе",
  taskId: "600102"
}));

const mockData = {
  project: "123",
  order: "123-01",
  product: 'Качели "Солнышко"',
};

// === УТИЛИТА для вычисления процента готовности
function calcSubOrderProgress(mainRows, uploadedBatches) {
  let total = 0, ready = 0;
  for (const row of mainRows) {
    if (row.count) total++;
    if (row.status === "Готово") ready++;
  }
  for (const batch of uploadedBatches) {
    for (const row of batch.rows) {
      if (row.count) total++;
      if (row.status === "Готово") ready++;
    }
  }
  if (total === 0) return 0;
  return Math.round((ready / total) * 100);
}

export default function OrderTaskPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  // Подключаем OrdersContext
  const { orders, setOrders } = useOrders();

  const [mainRows, setMainRows] = useState(initialMockRows);
  const [uploadedBatches, setUploadedBatches] = useState([]);
  const fileInputRef = useRef();

  // === DRAG-FILL ГЛОБАЛЬНЫЙ (main + batch)
  const [dragGlobal, setDragGlobal] = useState({
    active: false,
    from: null, // { type: 'main'|'batch', batchIdx, rowIdx }
    to: null,
    value: null,
  });

  // === Навигация
  const [navOpen, setNavOpen] = useState(false);
  const navRef = useRef();
  useEffect(() => {
    const handleClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setNavOpen(false);
    };
    if (navOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [navOpen]);

  // === Загрузка спецификации .xlsx
  function findCol(headerArr, variants) {
    for (let i = 0; i < headerArr.length; ++i) {
      const val = String(headerArr[i]).trim().toLowerCase();
      for (let variant of variants) {
        if (val.includes(variant)) return i;
      }
    }
    return -1;
  }
  const handleUploadSpec = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

      const header = rows[0];
      const colIdx = {
        partNum: findCol(header, ["п.н", "пн", "детал"]),
        name: findCol(header, ["наимен", "имя"]),
        code: findCol(header, ["обозна", "код"]),
        material: findCol(header, ["матер"]),
        count: findCol(header, ["кол-во", "количество"]),
      };

      if (Object.values(colIdx).some(idx => idx === -1)) {
        alert("Некорректная спецификация: не найдены все нужные столбцы.\nПроверьте заголовки!");
        return;
      }

      const newRows = rows.slice(1)
        .filter(row => row[colIdx.partNum])
        .map(row => ({
          partNum: row[colIdx.partNum] || "",
          name: row[colIdx.name] || "",
          code: row[colIdx.code] || "",
          material: row[colIdx.material] || "",
          count: row[colIdx.count] || "",
          made: "",
          cell: "-",
          status: "",
          taskId: "",
        }));

      const now = new Date();
      const timeLabel = now.toLocaleString("ru-RU", {
        day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit"
      });

      setUploadedBatches(batches => [
        ...batches,
        {
          date: timeLabel,
          file: file.name,
          uploader: uploaderFio,
          rows: newRows
        }
      ]);
      e.target.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  // === Статусы/изготовил
  function handleRowEditMain(rowIdx, field, value) {
    setMainRows(prev => prev.map((row, idx) => {
      let newRow = idx === rowIdx ? { ...row, [field]: value } : row;
      if (idx === rowIdx && field === "made" && value !== undefined) {
        if (String(value) === String(row.count)) newRow.status = "Готово";
        else if (row.status === "Готово") newRow.status = "";
      }
      if (idx === rowIdx && field === "status" && value === "Готово") {
        newRow.made = row.count;
      }
      return newRow;
    }));
  }
  function handleRowEditBatch(batchIdx, rowIdx, field, value) {
    setUploadedBatches(prev =>
      prev.map((batch, bidx) => bidx !== batchIdx
        ? batch
        : {
          ...batch,
          rows: batch.rows.map((row, ridx) => {
            let newRow = ridx === rowIdx ? { ...row, [field]: value } : row;
            if (ridx === rowIdx && field === "made" && value !== undefined) {
              if (String(value) === String(row.count)) newRow.status = "Готово";
              else if (row.status === "Готово") newRow.status = "";
            }
            if (ridx === rowIdx && field === "status" && value === "Готово") {
              newRow.made = row.count;
            }
            return newRow;
          })
        }
      )
    );
  }

  // === Маршрут, модалки
  const [routeSelectOpen, setRouteSelectOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showStations, setShowStations] = useState(false);
  const [clicked, setClicked] = useState(null); // {type:'main'|'batch', batchIdx, rowIdx}

  function handleCellClick(type, batchIdx, rowIdx) {
    setClicked({ type, batchIdx, rowIdx });
    setRouteSelectOpen(true);
  }
  function handleChooseRoute(idx) {
    setSelectedRoute(MARSHRUTS[idx]);
    setRouteSelectOpen(false);
    setShowStations(true);
  }
  function handleStationsClose() {
    if (selectedRoute && clicked) {
      if (clicked.type === 'main') {
        setMainRows(prev =>
          prev.map((row, idx) =>
            idx === clicked.rowIdx
              ? { ...row, cell: selectedRoute.id === 1 ? "МЛМ-1" : "МЛМ-2" }
              : row
          )
        );
      } else if (clicked.type === 'batch') {
        setUploadedBatches(prev =>
          prev.map((batch, bidx) =>
            bidx !== clicked.batchIdx
              ? batch
              : {
                ...batch,
                rows: batch.rows.map((row, ridx) =>
                  ridx === clicked.rowIdx
                    ? { ...row, cell: selectedRoute.id === 1 ? "МЛМ-1" : "МЛМ-2" }
                    : row
                )
              }
          )
        );
      }
    }
    setShowStations(false);
    setSelectedRoute(null);
    setClicked(null);
  }

  // === DRAG-FILL ГЛОБАЛЬНО (main <-> batch)
  function handleGlobalDragStart(type, batchIdx, rowIdx, value, e) {
    e.stopPropagation();
    setDragGlobal({
      active: true,
      from: { type, batchIdx, rowIdx },
      to: { type, batchIdx, rowIdx },
      value,
    });
    document.body.style.userSelect = "none";
  }
  function handleGlobalDragOver(type, batchIdx, rowIdx) {
    if (dragGlobal.active) {
      setDragGlobal(drag => ({
        ...drag,
        to: { type, batchIdx, rowIdx }
      }));
    }
  }
  useEffect(() => {
    function handleMouseUp() {
      if (dragGlobal.active && dragGlobal.from && dragGlobal.to && dragGlobal.value !== null) {
        // Виртуальная таблица: mainRows + batchRows подряд
        const allRows = [
          ...mainRows.map((row, idx) => ({ type: 'main', batchIdx: null, rowIdx: idx })),
          ...uploadedBatches.flatMap((batch, bidx) =>
            batch.rows.map((row, ridx) => ({ type: 'batch', batchIdx: bidx, rowIdx: ridx }))
          ),
        ];
        const startIdx = allRows.findIndex(
          r => r.type === dragGlobal.from.type &&
               r.batchIdx === dragGlobal.from.batchIdx &&
               r.rowIdx === dragGlobal.from.rowIdx
        );
        const endIdx = allRows.findIndex(
          r => r.type === dragGlobal.to.type &&
               r.batchIdx === dragGlobal.to.batchIdx &&
               r.rowIdx === dragGlobal.to.rowIdx
        );
        if (startIdx === -1 || endIdx === -1) {
          setDragGlobal({ active: false, from: null, to: null, value: null });
          document.body.style.userSelect = "";
          return;
        }
        const [fromIdx, toIdx] = [startIdx, endIdx].sort((a, b) => a - b);
        let newMainRows = [...mainRows];
        let newBatches = uploadedBatches.map(batch => ({ ...batch, rows: [...batch.rows] }));
        for (let i = fromIdx; i <= toIdx; ++i) {
          const r = allRows[i];
          if (r.type === 'main') {
            newMainRows[r.rowIdx] = { ...newMainRows[r.rowIdx], cell: dragGlobal.value };
          } else if (r.type === 'batch') {
            newBatches[r.batchIdx].rows[r.rowIdx] = { ...newBatches[r.batchIdx].rows[r.rowIdx], cell: dragGlobal.value };
          }
        }
        setMainRows(newMainRows);
        setUploadedBatches(newBatches);
      }
      setDragGlobal({ active: false, from: null, to: null, value: null });
      document.body.style.userSelect = "";
    }
    if (dragGlobal.active) {
      window.addEventListener("mouseup", handleMouseUp);
      return () => window.removeEventListener("mouseup", handleMouseUp);
    }
  }, [dragGlobal, mainRows, uploadedBatches]);

  // === Подсветка диапазона drag-fill
  function isGlobalDragHighlighted(type, batchIdx, rowIdx) {
    if (!dragGlobal.active || !dragGlobal.from || !dragGlobal.to) return false;
    const allRows = [
      ...mainRows.map((row, idx) => ({ type: 'main', batchIdx: null, rowIdx: idx })),
      ...uploadedBatches.flatMap((batch, bidx) =>
        batch.rows.map((row, ridx) => ({ type: 'batch', batchIdx: bidx, rowIdx: ridx }))
      ),
    ];
    const startIdx = allRows.findIndex(
      r => r.type === dragGlobal.from.type &&
           r.batchIdx === dragGlobal.from.batchIdx &&
           r.rowIdx === dragGlobal.from.rowIdx
    );
    const endIdx = allRows.findIndex(
      r => r.type === dragGlobal.to.type &&
           r.batchIdx === dragGlobal.to.batchIdx &&
           r.rowIdx === dragGlobal.to.rowIdx
    );
    const meIdx = allRows.findIndex(
      r => r.type === type && r.batchIdx === batchIdx && r.rowIdx === rowIdx
    );
    if (startIdx === -1 || endIdx === -1 || meIdx === -1) return false;
    const [fromIdx, toIdx] = [startIdx, endIdx].sort((a, b) => a - b);
    return meIdx >= fromIdx && meIdx <= toIdx;
  }

  // === ОБНОВЛЯЕМ ПРОГРЕСС ПОДЗАКАЗА В ГЛОБАЛЬНОМ ORDERS
  useEffect(() => {
    if (!taskId) return;
    setOrders(prevOrders =>
      prevOrders.map(order => ({
        ...order,
        subOrders: order.subOrders.map(sub =>
          sub.id === taskId
            ? { ...sub, progress: calcSubOrderProgress(mainRows, uploadedBatches) }
            : sub
        ),
      }))
    );
  }, [mainRows, uploadedBatches, taskId, setOrders]);

  return (
    <div className="min-h-screen w-screen bg-[#262537] font-['JejuGothic'] flex flex-row" style={{ userSelect: dragGlobal.active ? 'none' : 'auto' }}>
        {/* ... SIDEBAR ... */}
      <Sidebar
              navOpen={navOpen}
              setNavOpen={setNavOpen}
              progressPercent={false}
            />

      <main className="flex-1 min-h-screen pl-0 md:pl-3 py-8 bg-gradient-to-br from-[#292d3e] via-[#23283b] to-[#23283b] flex flex-col">
        <div className="w-full flex flex-row items-center gap-8 px-8 mb-6">
          <span className="text-stone-300 text-2xl font-light whitespace-nowrap">{mockData.product}</span>
          <span className="text-white text-base md:text-lg">Заказ <b>№ {mockData.order}</b></span>
          <span className="text-white text-base md:text-lg">Проект <b>№ {mockData.project}</b></span>
        </div>
        {/* --- Таблица --- */}
        <div className="bg-[#2B2F3A] rounded-xl shadow-xl px-1 md:px-4 py-2 overflow-x-auto mx-4" style={{ minHeight: 480 }}>
          <table className="min-w-[900px] w-full table-fixed border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="px-2 py-3 border-b border-gray-700 bg-[#23293B] text-white text-sm font-semibold text-left whitespace-nowrap">П.Н детали</th>
                <th className="px-2 py-3 border-b border-gray-700 bg-[#23293B] text-white text-sm font-semibold text-left whitespace-nowrap">Наименование</th>
                <th className="px-2 py-3 border-b border-gray-700 bg-[#23293B] text-white text-sm font-semibold text-left whitespace-nowrap">Обозначение</th>
                <th className="px-2 py-3 border-b border-gray-700 bg-[#23293B] text-white text-sm font-semibold text-left whitespace-nowrap">Материал</th>
                <th className="px-1 py-3 border-b border-gray-700 bg-[#23293B] text-white text-sm font-semibold text-center">Кол-во<br />по зад.</th>
                <th className="px-1 py-3 border-b border-gray-700 bg-[#23293B] text-white text-sm font-semibold text-center">Изготовил</th>
                <th className="px-1 py-3 border-b border-gray-700 bg-[#23293B] text-white text-sm font-semibold text-center">Маршрут</th>
                <th className="px-1 py-3 border-b border-gray-700 bg-[#23293B] text-white text-sm font-semibold text-center">Статус</th>
                <th className="px-1 py-3 border-b border-gray-700 bg-[#23293B] text-white text-sm font-semibold text-center">Задание</th>
              </tr>
            </thead>
            <tbody>
              {/* Основная таблица */}
              {mainRows.map((row, idx) => {
                const ready = String(row.made) === String(row.count) && row.count !== "";
                return (
                  <tr key={"mock-" + idx} className="hover:bg-[#353a45] transition"
                    onMouseMove={() => handleGlobalDragOver('main', null, idx)}
                  >
                    <td className="py-2 px-2 border-b border-gray-700 text-white text-center">{row.partNum}</td>
                    <td className="py-2 px-2 border-b border-gray-700 text-white text-center">{row.name}</td>
                    <td className="py-2 px-2 border-b border-gray-700 text-white text-center">{row.code}</td>
                    <td className="py-2 px-2 border-b border-gray-700 text-white text-xs text-left">{row.material}</td>
                    <td className="py-2 px-2 border-b border-gray-700 text-white text-center">{row.count}</td>
                    {/* Изготовил */}
                    <td className="py-2 px-2 border-b border-gray-700 text-white text-center">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        pattern="[0-9]*"
                        className="w-16 bg-transparent border-b border-violet-400 text-white text-center outline-none"
                        value={row.made}
                        onChange={e =>
                          handleRowEditMain(idx, "made", e.target.value.replace(/[^0-9]/g, ""))
                        }
                        placeholder=""
                        disabled={ready}
                      />
                    </td>
                    {/* Маршрут */}
                    <td
                      className={
                        `py-2 px-2 border-b border-gray-700 text-white text-center underline cursor-pointer relative group` +
                        (isGlobalDragHighlighted('main', null, idx) ? " bg-violet-900/60" : "")
                      }
                      onClick={() => handleCellClick('main', null, idx)}
                    >
                      {row.cell}
                      {row.cell !== "-" && (
                        <span
                          className="absolute right-1 bottom-1 w-4 h-4 rounded bg-violet-600 flex items-center justify-center text-xs text-white shadow group-hover:scale-110 group-hover:bg-violet-500 cursor-row-resize select-none"
                          style={{
                            cursor: "ns-resize",
                            border: "2px solid #fff",
                            fontWeight: "bold",
                            fontSize: "12px",
                            zIndex: 10,
                          }}
                          onMouseDown={e => handleGlobalDragStart('main', null, idx, row.cell, e)}
                          title="Протянуть вниз (drag-and-drop)"
                        >↡</span>
                      )}
                    </td>
                    {/* Статус */}
                    <td className="py-2 px-2 border-b border-gray-700 text-white text-center">
                      <select
                        className="bg-[#262537] border border-violet-700 rounded px-1 text-white"
                        value={ready ? "Готово" : (row.status || "")}
                        onChange={e => handleRowEditMain(idx, "status", e.target.value)}
                        disabled={ready}
                      >
                        <option value="Открыт">Открыт</option>
                        <option value="В работе">В работе</option>
                        <option value="Готово">Готово</option>
                        <option value="Закрыт">Закрыт</option>
                      </select>
                    </td>
                    {/* Задание */}
                    <td className="py-2 px-2 border-b border-gray-700 text-center">
                      <button
                        className="underline text-indigo-300 hover:text-violet-400 transition"
                        onClick={() => navigate(`/order/${row.taskId}`)}
                      >
                        {row.taskId}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {/* Batch таблицы (загруженные спецификации) */}
              {uploadedBatches.map((batch, bidx) => (
                <React.Fragment key={bidx}>
                  <tr>
                    <td colSpan={3} className="py-2 px-2 border-b border-gray-700 text-purple-300 text-xs text-left font-semibold">
                      Дата загрузки: {batch.date}
                    </td>
                    <td colSpan={3} className="py-2 px-2 border-b border-gray-700 text-purple-300 text-xs text-left font-semibold">
                      Имя файла спецификации: {batch.file}
                    </td>
                    <td colSpan={3} className="py-2 px-2 border-b border-gray-700 text-purple-300 text-xs text-left font-semibold">
                      Загрузил: {batch.uploader}
                    </td>
                  </tr>
                  {batch.rows.map((row, ridx) => {
                    const ready = String(row.made) === String(row.count) && row.count !== "";
                    return (
                      <tr key={`batch${bidx}-${ridx}`} className="hover:bg-[#353a45] transition"
                        onMouseMove={() => handleGlobalDragOver('batch', bidx, ridx)}
                      >
                        <td className="py-2 px-2 border-b border-gray-700 text-white text-center">{row.partNum}</td>
                        <td className="py-2 px-2 border-b border-gray-700 text-white text-center">{row.name}</td>
                        <td className="py-2 px-2 border-b border-gray-700 text-white text-center">{row.code}</td>
                        <td className="py-2 px-2 border-b border-gray-700 text-white text-xs text-left">{row.material}</td>
                        <td className="py-2 px-2 border-b border-gray-700 text-white text-center">{row.count}</td>
                        {/* Изготовил */}
                        <td className="py-2 px-2 border-b border-gray-700 text-white text-center">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            pattern="[0-9]*"
                            className="w-16 bg-transparent border-b border-violet-400 text-white text-center outline-none"
                            value={row.made}
                            onChange={e =>
                              handleRowEditBatch(bidx, ridx, "made", e.target.value.replace(/[^0-9]/g, ""))
                            }
                            placeholder=""
                            disabled={ready}
                          />
                        </td>
                        {/* Маршрут */}
                        <td
                          className={
                            `py-2 px-2 border-b border-gray-700 text-white text-center underline cursor-pointer relative group` +
                            (isGlobalDragHighlighted('batch', bidx, ridx) ? " bg-violet-900/60" : "")
                          }
                          onClick={() => handleCellClick('batch', bidx, ridx)}
                        >
                          {row.cell}
                          {row.cell !== "-" && (
                            <span
                              className="absolute right-1 bottom-1 w-4 h-4 rounded bg-violet-600 flex items-center justify-center text-xs text-white shadow group-hover:scale-110 group-hover:bg-violet-500 cursor-row-resize select-none"
                              style={{
                                cursor: "ns-resize",
                                border: "2px solid #fff",
                                fontWeight: "bold",
                                fontSize: "12px",
                                zIndex: 10,
                              }}
                              onMouseDown={e => handleGlobalDragStart('batch', bidx, ridx, row.cell, e)}
                              title="Протянуть вниз (drag-and-drop)"
                            >↡</span>
                          )}
                        </td>
                        {/* Статус */}
                        <td className="py-2 px-2 border-b border-gray-700 text-white text-center">
                          <select
                            className="bg-[#262537] border border-violet-700 rounded px-1 text-white"
                            value={ready ? "Готово" : (row.status || "")}
                            onChange={e => handleRowEditBatch(bidx, ridx, "status", e.target.value)}
                            disabled={ready}
                          >
                            <option value="">-</option>
                            <option value="В работе">В работе</option>
                            <option value="Готово">Готово</option>
                            <option value="В архиве">В архиве</option>
                          </select>
                        </td>
                        {/* Задание */}
                        <td className="py-2 px-2 border-b border-gray-700 text-center"></td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <button
          className="cursor-pointer w-[210px] h-10 mt-2 bg-gradient-to-r from-[#922b7b] to-[#3c1c3e] rounded text-white text-base font-semibold mb-8 hover:bg-violet-900 transition"
          onClick={() => fileInputRef.current.click()}
        >
          Загрузить спецификацию
        </button>
        {/* --- Модалка выбора маршрута --- */}
        {routeSelectOpen && (
          <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center">
            <div className="bg-[#23283b] rounded-2xl p-7 flex flex-col w-[430px] gap-3 shadow-xl border border-violet-700">
              <div className="text-white text-lg font-semibold mb-3">Выберите маршрут</div>
              {MARSHRUTS.map((route, idx) => (
                <button
                  key={route.id}
                  onClick={() => handleChooseRoute(idx)}
                  className="w-full bg-gradient-to-r from-violet-900 to-slate-700 hover:bg-violet-700 rounded-lg py-3 text-white text-base border border-white/10 mb-1"
                >
                  {route.name}
                </button>
              ))}
              <button
                className="mt-5 text-slate-400 underline hover:text-red-400"
                onClick={() => setRouteSelectOpen(false)}
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* --- Модалка детализации маршрута (станции) --- */}
        {showStations && selectedRoute && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="bg-[#23283b] rounded-2xl p-8 w-[490px] flex flex-col gap-5 shadow-2xl border border-violet-800">
              <div className="text-white text-lg font-semibold mb-2">Маршрут: {selectedRoute.name}</div>
              {selectedRoute.stations.map((st, i) => (
                <div key={i} className="flex gap-5 items-center mb-1">
                  <span className="text-slate-200 font-mono min-w-[32px] text-right">{`№ ${i + 1}`}</span>
                  <span className="text-white text-base">{st}</span>
                </div>
              ))}
              <button
                className="mt-8 bg-violet-800 text-white text-base rounded-xl py-3 hover:bg-violet-900 transition"
                onClick={handleStationsClose}
              >
                Подтвердить
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
