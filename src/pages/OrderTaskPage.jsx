import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { useOrders } from "../OrdersContext";
import Sidebar from "../Sidebar";

// ===== МАРШРУТЫ =====
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

// ===== СТАТУСЫ =====
function StatusCell({ value, onChange, disabled }) {
  let bg = "#181870";
  let color = "#fff";
  if (value === "Готово") { bg = "#17b528"; color = "#fff"; }
  else if (value === "Делать") { bg = "#c7c754"; color = "#222"; }
  else if (value === "В работе") { bg = "#181870"; color = "#fff"; }
  else if (value === "Открыт") { bg = "#393943"; color = "#fff"; }
  else if (value === "Закрыт") { bg = "#393943"; color = "#fff"; }

  return (
    <select
      style={{
        background: bg,
        color,
        fontWeight: 600,
        fontSize: 16,
        border: "none",
        outline: "none",
        borderRadius: 0,
        width: "100%",
        padding: "7px 0",
        textAlign: "center",
        transition: "background 0.2s",
      }}
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      <option value="Открыт">Открыт</option>
      <option value="В работе">В работе</option>
      <option value="Делать">Делать</option>
      <option value="Готово">Готово</option>
      <option value="Закрыт">Закрыт</option>
    </select>
  );
}

// ===== ПРОГРЕСС =====
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

// ===== КОНФИГ КОЛОНОК =====
const initialColumns = [
  {
    key: "partNum",
    title: "П.Н детали",
    render: row => row.partNum,
    className: "text-center",
    width: 110,
  },
  {
    key: "name",
    title: "Наименование",
    render: row => row.name,
    className: "text-center",
    width: 170,
  },
  {
    key: "code",
    title: "Обозначение",
    render: row => row.code,
    className: "text-center",
    width: 130,
  },
  {
    key: "material",
    title: "Материал",
    render: row => <span className="text-xs text-left">{row.material}</span>,
    className: "text-left",
    width: 170,
  },
  {
    key: "count",
    title: "Кол-во по зад.",
    render: row => row.count,
    className: "text-center",
    width: 90,
  },
  {
    key: "made",
    title: "Изготовил",
    render: (row, idx, ready, handleRowEditMain) => (
      <input
        type="number"
        min="0"
        step="1"
        pattern="[0-9]*"
        className="w-16 bg-transparent border-b border-violet-400 text-white text-center outline-none"
        value={row.made}
        onChange={e => handleRowEditMain(idx, "made", e.target.value.replace(/[^0-9]/g, ""))}
        placeholder=""
        disabled={ready}
      />
    ),
    className: "text-center",
    width: 100,
  },
  {
    key: "cell",
    title: "Маршрут",
    render: (row, idx, _ready, _handleRowEditMain, handleCellClick, isGlobalDragHighlighted, dragGlobal) => (
      <div
        className={
          "underline cursor-pointer relative group py-2 px-2 " +
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
            onMouseDown={e => dragGlobal.handleGlobalDragStart('main', null, idx, row.cell, e)}
            title="Протянуть вниз (drag-and-drop)"
          >↡</span>
        )}
      </div>
    ),
    className: "text-center",
    width: 110,
  },
  {
    key: "status",
    title: "Статус",
    render: (row, idx, ready, handleRowEditMain) => (
      <StatusCell
        value={ready ? "Готово" : (row.status || "")}
        onChange={e => handleRowEditMain(idx, "status", e.target.value)}
        disabled={ready}
      />
    ),
    className: "text-center",
    width: 120,
  },
  {
    key: "taskId",
    title: "Задание",
    render: (row, idx, _ready, _handleRowEditMain, _handleCellClick, _isGlobalDragHighlighted, _dragGlobal, navigate) => (
      <button
        className="underline text-indigo-300 hover:text-violet-400 transition"
        onClick={() => navigate(`/order/${row.taskId}`)}
      >
        {row.taskId}
      </button>
    ),
    className: "text-center",
    width: 100,
  },
];

export default function OrderTaskPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { orders, setOrders } = useOrders();
  const [navOpen, setNavOpen] = useState(false);

  const project = orders.find(order =>
    order.subOrders && order.subOrders.some(sub => sub.id === taskId)
  );
  const subOrder = project
    ? project.subOrders.find(sub => sub.id === taskId)
    : null;

  const [mainRows, setMainRows] = useState([]);
  const [uploadedBatches, setUploadedBatches] = useState([]);
  const fileInputRef = useRef();

  // --- drag&drop для колонок ---
  const [columns, setColumns] = useState(initialColumns);
  const [draggedColIdx, setDraggedColIdx] = useState(null);

  function onColDragStart(idx) {
    setDraggedColIdx(idx);
  }
  function onColDragOver(idx, e) {
    e.preventDefault();
  }
  function onColDrop(idx) {
    if (draggedColIdx === null || draggedColIdx === idx) return;
    const newCols = [...columns];
    const [dragged] = newCols.splice(draggedColIdx, 1);
    newCols.splice(idx, 0, dragged);
    setColumns(newCols);
    setDraggedColIdx(null);
  }

  // DRAG-FILL
  const [dragGlobal, setDragGlobal] = useState({
    active: false,
    from: null,
    to: null,
    value: null,
    handleGlobalDragStart: handleGlobalDragStart,
  });
  function handleGlobalDragStart(type, batchIdx, rowIdx, value, e) {
    e.stopPropagation();
    setDragGlobal({
      ...dragGlobal,
      active: true,
      from: { type, batchIdx, rowIdx },
      to: { type, batchIdx, rowIdx },
      value,
      handleGlobalDragStart,
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
        // только mainRows
        const allRows = mainRows.map((row, idx) => ({ type: 'main', batchIdx: null, rowIdx: idx }));
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
          setDragGlobal({ ...dragGlobal, active: false, from: null, to: null, value: null });
          document.body.style.userSelect = "";
          return;
        }
        const [fromIdx, toIdx] = [startIdx, endIdx].sort((a, b) => a - b);
        let newMainRows = [...mainRows];
        for (let i = fromIdx; i <= toIdx; ++i) {
          const r = allRows[i];
          newMainRows[r.rowIdx] = { ...newMainRows[r.rowIdx], cell: dragGlobal.value };
        }
        setMainRows(newMainRows);
      }
      setDragGlobal({ ...dragGlobal, active: false, from: null, to: null, value: null });
      document.body.style.userSelect = "";
    }
    if (dragGlobal.active) {
      window.addEventListener("mouseup", handleMouseUp);
      return () => window.removeEventListener("mouseup", handleMouseUp);
    }
  }, [dragGlobal, mainRows]);

  function isGlobalDragHighlighted(type, batchIdx, rowIdx) {
    if (!dragGlobal.active || !dragGlobal.from || !dragGlobal.to) return false;
    const allRows = mainRows.map((row, idx) => ({ type: 'main', batchIdx: null, rowIdx: idx }));
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

  // --- XLSX загрузка ---
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
        taskId: findCol(header, ["задание", "id задания"]),
      };

      if (Object.values(colIdx).slice(0, 5).some(idx => idx === -1)) {
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
          status: "В работе",
          taskId: colIdx.taskId !== -1 ? row[colIdx.taskId] : "",
        }));

      setMainRows(newRows);
      setUploadedBatches([]); // не используем батчи (если не нужно)
      e.target.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

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

  // === Маршрут (выбор/drag-fill) ===
  const [routeSelectOpen, setRouteSelectOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showStations, setShowStations] = useState(false);
  const [clicked, setClicked] = useState(null);

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
      }
    }
    setShowStations(false);
    setSelectedRoute(null);
    setClicked(null);
  }

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

  // --- Рендер ---
  if (!project || !subOrder) {
    return (
      <div className="min-h-screen bg-[#262537] text-white flex flex-col justify-center items-center">
        <div className="mb-4 text-2xl">Заказ не найден</div>
        <button
          onClick={() => navigate(-1)}
          className="underline text-violet-400 hover:text-violet-300"
        >
          Назад
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-[#262537] font-['Inter'] flex flex-row" style={{ userSelect: dragGlobal.active ? 'none' : 'auto' }}>
      <Sidebar navOpen={navOpen} setNavOpen={setNavOpen} 
      progressPercent={subOrder.progress || 0} />
      <main className="flex-1 min-h-screen pl-0 md:pl-3 py-8 bg-gradient-to-br from-[#292d3e] via-[#23283b] to-[#23283b] flex flex-col">
        <div className="w-full flex flex-row items-center gap-8 px-8 mb-6">
          <span className="text-stone-300 text-2xl font-light whitespace-nowrap">{subOrder.product}</span>
          <span className="text-white text-base md:text-lg">Заказ <b>№ {subOrder.id}</b></span>
          <span className="text-white text-base md:text-lg">Проект <b>№ {project.id}</b></span>
        </div>
        <div className="bg-[#2B2F3A] rounded-xl shadow-xl px-1 md:px-4 py-2 overflow-x-auto mx-4" style={{ minHeight: 480 }}>
          {mainRows.length > 0 ? (
            <table className="min-w-[900px] w-full table-fixed border-separate border-spacing-0">
              <thead>
                <tr>
                  {columns.map((col, colIdx) => (
                    <th
                      key={col.key}
                      className={
                        `px-2 py-3 border-b border-gray-700 bg-[#23293B] text-white text-sm font-semibold text-center whitespace-nowrap ` +
                        col.className
                      }
                      style={{
                        width: col.width,
                        cursor: "move",
                        opacity: draggedColIdx === colIdx ? 0.65 : 1,
                        border: draggedColIdx === colIdx ? "2px solid #c7c754" : undefined,
                        transition: "border 0.1s"
                      }}
                      draggable
                      onDragStart={() => onColDragStart(colIdx)}
                      onDragOver={e => onColDragOver(colIdx, e)}
                      onDrop={() => onColDrop(colIdx)}
                      onDragEnd={() => setDraggedColIdx(null)}
                    >
                      {col.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mainRows.map((row, idx) => {
                  const ready = String(row.made) === String(row.count) && row.count !== "";
                  return (
                    <tr
                      key={"main-" + idx}
                      className="hover:bg-[#353a45] transition"
                      onMouseMove={() => handleGlobalDragOver('main', null, idx)}
                    >
                      {columns.map((col, colIdx) => (
                        <td
                          key={col.key}
                          className={`py-2 px-2 border-b border-gray-700 text-white ${col.className}`}
                          style={{ width: col.width }}
                        >
                          {typeof col.render === "function"
                            ? col.render(
                                row,
                                idx,
                                ready,
                                handleRowEditMain,
                                handleCellClick,
                                isGlobalDragHighlighted,
                                dragGlobal,
                                navigate
                              )
                            : row[col.key]}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-gray-400 text-center py-24">
              Для этого заказа не загружена спецификация. Загрузите файл для отображения данных.
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xls,.xlsx"
          className="hidden"
          onChange={handleUploadSpec}
        />
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
