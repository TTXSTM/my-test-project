import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import Sidebar from "../Sidebar";

const API_PROJECTS = "http://85.198.82.194:3001/api/projects";
const API_SUBORDER = "http://85.198.82.194:3001/api/suborder";
const API_SPEC = "http://85.198.82.194:3001/api/spec";
const API_SPEC_ROW = "http://85.198.82.194:3001/api/specrow";
const API_ORDERS = "http://85.198.82.194:3001/api/orders";

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

const initialColumns = [
  { key: "partNum", title: "П.Н детали", className: "text-center", width: 110 },
  { key: "name", title: "Наименование", className: "text-center", width: 170 },
  { key: "code", title: "Обозначение", className: "text-center", width: 130 },
  { key: "material", title: "Материал", className: "text-left", width: 170 },
  { key: "count", title: "Кол-во по зад.", className: "text-center", width: 90 },
  { key: "made", title: "Изготовил", className: "text-center", width: 100 },
  { key: "cell", title: "Маршрут", className: "text-center", width: 110 },
  { key: "status", title: "Статус", className: "text-center", width: 120 },
  { key: "taskId", title: "Задание", className: "text-center", width: 140 },
];

function StatusCell({ value, onChange, disabled }) {
  let bg = "#181870", color = "#fff";
  if (value === "Готово") { bg = "#17b528"; color = "#fff"; }
  else if (value === "Делать") { bg = "#c7c754"; color = "#222"; }
  else if (value === "В работе") { bg = "#181870"; color = "#fff"; }
  else if (value === "Открыт") { bg = "#393943"; color = "#fff"; }
  else if (value === "Закрыт") { bg = "#393943"; color = "#fff"; }
  return (
    <select
      style={{
        background: bg, color, fontWeight: 600, fontSize: 16,
        border: "none", outline: "none", borderRadius: 0,
        width: "100%", padding: "7px 0", textAlign: "center", transition: "background 0.2s"
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

export default function OrderTaskPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [subOrder, setSubOrder] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadedBatches, setUploadedBatches] = useState([]);
  const fileInputRef = useRef();

  const [columns, setColumns] = useState(() => {
    try {
      const saved = localStorage.getItem("orderTaskColumns");
      if (saved) {
        const order = JSON.parse(saved);
        return order
          .map(key => initialColumns.find(col => col.key === key))
          .filter(Boolean)
          .concat(initialColumns.filter(col => !order.includes(col.key)));
      }
    } catch {}
    return initialColumns;
  });
  const [dragColIdx, setDragColIdx] = useState(null);
  function onColDragStart(idx) { setDragColIdx(idx); }
  function onColDragOver(idx, e) { e.preventDefault(); }
  function onColDrop(idx) {
    if (dragColIdx === null || dragColIdx === idx) return;
    const newCols = [...columns];
    const [dragged] = newCols.splice(dragColIdx, 1);
    newCols.splice(idx, 0, dragged);
    setColumns(newCols);
    setDragColIdx(null);
    localStorage.setItem("orderTaskColumns", JSON.stringify(newCols.map(col => col.key)));
  }
  function onColDragEnd() { setDragColIdx(null); }

  // Состояние таблицы
  const [tableRows, setTableRows] = useState({});
  const [dragGlobal, setDragGlobal] = useState({
    active: false, from: null, to: null, value: null,
  });

  // Для создания задания
  const [createdRows, setCreatedRows] = useState({});
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [orderDesc, setOrderDesc] = useState("");
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");

  // Для множественного выбора
  const [selectedRows, setSelectedRows] = useState([]);

  // Маршруты и модалки
  const [routeSelectOpen, setRouteSelectOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showStations, setShowStations] = useState(false);
  const [clickedCell, setClickedCell] = useState(null);

  // Загрузка проекта и спецификации
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const suborderRes = await fetch(`${API_SUBORDER}/${taskId}`);
      const sub = await suborderRes.json();
      setSubOrder(sub);

      let proj = null;
      if (sub) {
        const projectsRes = await fetch(API_PROJECTS);
        const projects = await projectsRes.json();
        proj = projects.find(p => String(p.id) === String(sub.project_id));
        setProject(proj);
      } else {
        setProject(null);
      }

      let batches = [];
      if (sub) {
        const batchRes = await fetch(`${API_SPEC}/${taskId}`);
        batches = await batchRes.json();
        setUploadedBatches(Array.isArray(batches) ? batches : []);
      } else {
        setUploadedBatches([]);
      }
      const allRows = {};
      (batches || []).forEach(batch => batch.rows.forEach(row => {
        allRows[row.id] = { ...row };
      }));
      setTableRows(allRows);
      setLoading(false);
    }
    fetchAll();
  }, [taskId]);

  // Drag fill для cell
  function handleGlobalDragStart(batchRows, rowIdx, value, e) {
    e.stopPropagation();
    setDragGlobal({
      active: true, from: rowIdx, to: rowIdx, value, batchRows,
    });
    document.body.style.userSelect = "none";
  }
  function handleGlobalDragOver(idx) {
    if (dragGlobal.active) setDragGlobal(drag => ({ ...drag, to: idx }));
  }
  useEffect(() => {
    async function handleMouseUp() {
      if (dragGlobal.active && dragGlobal.from != null && dragGlobal.to != null && dragGlobal.value !== null) {
        const { batchRows, from, to, value } = dragGlobal;
        const [start, end] = [from, to].sort((a, b) => a - b);
        const updated = { ...tableRows };
        const patchRequests = [];
        for (let i = start; i <= end; ++i) {
          const row = batchRows[i];
          if (row) {
            updated[row.id] = { ...updated[row.id], cell: value };
            patchRequests.push(
              fetch(`${API_SPEC_ROW}/${row.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...updated[row.id], cell: value }),
              })
            );
          }
        }
        setTableRows(updated);
        await Promise.all(patchRequests);
      }
      setDragGlobal({
        active: false, from: null, to: null, value: null, batchRows: null,
      });
      document.body.style.userSelect = "";
    }
    if (dragGlobal.active) {
      window.addEventListener("mouseup", handleMouseUp);
      return () => window.removeEventListener("mouseup", handleMouseUp);
    }
  }, [dragGlobal, tableRows]);

  function isGlobalDragHighlighted(idx) {
    if (!dragGlobal.active || dragGlobal.from == null || dragGlobal.to == null) return false;
    const [start, end] = [dragGlobal.from, dragGlobal.to].sort((a, b) => a - b);
    return idx >= start && idx <= end;
  }

  // Мгновенное обновление строки
  async function updateRow(rowId, newFields) {
    setTableRows(prev => ({
      ...prev, [rowId]: { ...prev[rowId], ...newFields },
    }));
    await fetch(`${API_SPEC_ROW}/${rowId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...tableRows[rowId], ...newFields }),
    });
  }

  // Обработчики редактирования ячеек
  function handleCellEdit(rowId, field, value) {
    let patch = { [field]: value };
    if (field === "made") {
      if (String(value) === String(tableRows[rowId].count))
        patch.status = "Готово";
      else if (tableRows[rowId].status === "Готово")
        patch.status = "В работе";
    }
    if (field === "status" && value === "Готово") {
      patch.made = tableRows[rowId].count;
    }
    updateRow(rowId, patch);
  }

  // --- Выделение по клику (множественный выбор) ---
  function toggleRowSelected(rowId) {
    setSelectedRows(selectedRows =>
      selectedRows.includes(rowId)
        ? selectedRows.filter(id => id !== rowId)
        : [...selectedRows, rowId]
    );
  }
  function resetOrderSelection() {
    setSelectedRows([]); setOrderDesc(""); setOrderError(""); setShowOrderDialog(false);
  }

  // --- Создание задания для выбранных строк ---
  async function handleCreateOrder() {
    if (!orderDesc.trim()) { setOrderError("Введите описание задания"); return; }
    if (selectedRows.length === 0) return;
    setCreatingOrder(true); setOrderError("");

    // 1. Сначала подгружаем актуальные заказы!
    const orders = await fetch(`${API_ORDERS}?project_id=${project.id}&order_id=${subOrder.id}`)
      .then(r => r.json())
      .catch(() => []);
    const maxNum = orders.reduce((max, o) => Math.max(max, Number(o.seq_num || 0)), 0);
    const seqNum = maxNum + 1;
    const orderNumber = `${project.id}-${subOrder.id}-${seqNum}`;

    // 2. Создаём задание с этим номером (backend обновляет taskId в spec_rows)
    await fetch(API_ORDERS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: project.id,
        order_id: subOrder.id,
        seq_num: seqNum,
        order_number: orderNumber,
        description: orderDesc,
        row_ids: selectedRows,
      }),
    });

    // 3. После создания обновить UI (без запроса можно так:)
    const newCreated = {};
    selectedRows.forEach(id => newCreated[id] = orderNumber);
    setCreatedRows(prev => ({ ...prev, ...newCreated }));

    setShowOrderDialog(false);
    setOrderDesc("");
    setCreatingOrder(false);
    setSelectedRows([]);
    alert("Создано задание: " + orderNumber);
  }

  // --- Выбор маршрута через модалку ---
  function handleCellClick(rowId) {
    setClickedCell(rowId); setRouteSelectOpen(true);
  }
  function handleChooseRoute(idx) {
    setSelectedRoute(MARSHRUTS[idx]);
    setRouteSelectOpen(false); setShowStations(true);
  }
  function handleStationsClose() {
    if (selectedRoute && clickedCell) {
      updateRow(clickedCell, {
        cell: selectedRoute.id === 1 ? "МЛМ-1" : "МЛМ-2",
      });
    }
    setShowStations(false); setSelectedRoute(null); setClickedCell(null);
  }

  // --- XLSX загрузка ---
  function findCol(headerArr, variants) {
    for (let i = 0; i < headerArr.length; ++i) {
      const val = String(headerArr[i]).trim().toLowerCase();
      for (let variant of variants) if (val.includes(variant)) return i;
    }
    return -1;
  }
  const handleUploadSpec = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async evt => {
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
      await fetch(`${API_SPEC}/${taskId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploaded_by: "Тестовый пользователь", rows: newRows }),
      });
      const batchRes = await fetch(`${API_SPEC}/${taskId}`);
      const batches = await batchRes.json();
      setUploadedBatches(Array.isArray(batches) ? batches : []);
      const allRows = {};
      (batches || []).forEach(batch => batch.rows.forEach(row => {
        allRows[row.id] = { ...row };
      }));
      setTableRows(allRows);
      e.target.value = "";
    };
    reader.readAsArrayBuffer(file);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#262537] text-white flex flex-col justify-center items-center">
      <div className="mb-4 text-2xl">Загрузка...</div>
    </div>
  );
  if (!project || !subOrder) return (
    <div className="min-h-screen bg-[#262537] text-white flex flex-col justify-center items-center">
      <div className="mb-4 text-2xl">Заказ не найден</div>
      <button onClick={() => navigate(-1)}
        className="underline text-violet-400 hover:text-violet-300">Назад</button>
    </div>
  );

  return (
    <div className="min-h-screen w-screen bg-[#262537] font-['Inter'] flex flex-row" style={{ userSelect: dragGlobal.active ? "none" : "auto" }}>
      <Sidebar navOpen={false} setNavOpen={() => {}} progressPercent={subOrder.progress || 0} />
      <main className="flex-1 min-h-screen pl-0 md:pl-3 py-8 bg-gradient-to-br from-[#292d3e] via-[#23283b] to-[#23283b] flex flex-col relative">
        <div className="w-full flex flex-row items-center gap-8 px-8 mb-6">
          <span className="text-stone-300 text-2xl font-light whitespace-nowrap">{subOrder.product}</span>
          <span className="text-white text-base md:text-lg">Заказ <b>№ {subOrder.id}</b></span>
          <span className="text-white text-base md:text-lg">Проект <b>№ {project.id}</b></span>
        </div>
        <div className="flex flex-col gap-8 mx-4">
          {uploadedBatches && uploadedBatches.length > 0 ? (
            uploadedBatches.map((batch, bidx) => (
              <div key={batch.id || bidx} className="bg-[#2B2F3A] rounded-xl shadow-xl p-3 mb-4">
                <div className="flex flex-row justify-between items-center mb-2">
                  <span className="text-sm text-violet-300">
                    Загружено: <b>{batch.uploaded_at && batch.uploaded_at.slice(0,16).replace('T',' ')}</b>
                  </span>
                  <span className="text-sm text-stone-400">Пользователь: <b>{batch.uploaded_by}</b></span>
                </div>
                <table className="min-w-[900px] w-full table-fixed border-separate border-spacing-0">
                  <thead>
                    <tr>
                      {columns.map((col, idx) => (
                        <th
                          key={col.key}
                          className={`px-2 py-3 border-b border-gray-700 bg-[#23293B] text-white text-sm font-semibold text-center whitespace-nowrap ${col.className} ${dragColIdx === idx ? 'bg-violet-900' : ''}`}
                          style={{ width: col.width, cursor: "grab" }}
                          draggable
                          onDragStart={() => onColDragStart(idx)}
                          onDragOver={e => onColDragOver(idx, e)}
                          onDrop={() => onColDrop(idx)}
                          onDragEnd={onColDragEnd}
                          title="Перетащите столбец"
                        >
                          {col.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-white">
                    {batch.rows.map((row, idx) => {
                      const rowData = tableRows[row.id] || row;
                      const ready = String(rowData.made) === String(rowData.count) && rowData.count !== "";
                      const createdOrderNumber = createdRows[row.id] || rowData.taskId;
                      const isSelected = selectedRows.includes(row.id);

                      return (
                        <tr
                          key={"batch-" + batch.id + "-" + idx}
                          className={"hover:bg-[#353a45] transition"}
                        >
                          {columns.map((col) => {
                            if (col.key === "made") {
                              return (
                                <td key={col.key} className={col.className}>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    className="w-16 bg-transparent border-b border-violet-400 text-white text-center outline-none"
                                    value={rowData.made ?? ""}
                                    onChange={e =>
                                      handleCellEdit(row.id, "made", e.target.value.replace(/[^0-9]/g, ""))
                                    }
                                    placeholder=""
                                    disabled={ready}
                                  />
                                </td>
                              );
                            }
                            if (col.key === "cell") {
                              return (
                                <td
                                  key={col.key}
                                  className={col.className + " relative"}
                                  onMouseDown={e =>
                                    rowData.cell !== "-" &&
                                    handleGlobalDragStart(batch.rows, idx, rowData.cell, e)
                                  }
                                  onMouseEnter={() => dragGlobal.active && handleGlobalDragOver(idx)}
                                >
                                  <div
                                    className={
                                      "underline cursor-pointer relative group py-2 px-2 select-none" +
                                      (dragGlobal.active && isGlobalDragHighlighted(idx)
                                        ? " bg-violet-900/60"
                                        : "")
                                    }
                                    onClick={() => handleCellClick(row.id)}
                                  >
                                    {rowData.cell}
                                    {rowData.cell !== "-" && (
                                      <span
                                        className="absolute right-1 bottom-1 w-4 h-4 rounded bg-violet-600 flex items-center justify-center text-xs text-white shadow group-hover:scale-110 group-hover:bg-violet-500 cursor-row-resize select-none"
                                        style={{
                                          cursor: "ns-resize",
                                          border: "2px solid #fff",
                                          fontWeight: "bold",
                                          fontSize: "12px",
                                          zIndex: 10,
                                        }}
                                        title="Протянуть вниз (drag-and-drop)"
                                      >↡</span>
                                    )}
                                  </div>
                                </td>
                              );
                            }
                            if (col.key === "status") {
                              return (
                                <td key={col.key} className={col.className}>
                                  <StatusCell
                                    value={ready ? "Готово" : (rowData.status || "")}
                                    onChange={e => handleCellEdit(row.id, "status", e.target.value)}
                                    disabled={ready}
                                  />
                                </td>
                              );
                            }
                            if (col.key === "taskId") {
                              // Показываем taskId если есть (приоритетнее "createdRows")
                              if (createdOrderNumber) {
                                return (
                                  <td key={col.key} className={col.className} style={{ padding: 0 }}>
                                    <div
                                      className="w-full flex items-center justify-center text-base font-bold text-emerald-400"
                                      style={{ height: 42 }}
                                    >
                                      {createdOrderNumber}
                                    </div>
                                  </td>
                                );
                              }
                              // Если не выбран - рисуем ячейку для выделения
                              return (
                                <td key={col.key} className={col.className} style={{ padding: 0 }}>
                                  <div
                                    className={
                                      "w-full h-full select-none cursor-pointer flex items-center px-2 py-2 transition rounded justify-center " +
                                      (isSelected
                                        ? "bg-violet-500 text-white shadow-lg ring-2 ring-violet-400"
                                        : "bg-[#23283b] hover:bg-violet-900/50 text-indigo-200")
                                    }
                                    style={{ width: "100%", height: 42 }}
                                    onClick={e => {
                                      e.stopPropagation();
                                      toggleRowSelected(row.id);
                                    }}
                                  >
                                    {!isSelected && "Добавить задание"}
                                    {isSelected && <span className="font-semibold">Выбрано</span>}
                                  </div>
                                </td>
                              );
                            }
                            return (
                              <td key={col.key} className={col.className}>{rowData[col.key]}</td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))
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

        {/* Кнопка и модалка для создания задания */}
        {selectedRows.length > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex gap-4">
            <button
              onClick={() => setShowOrderDialog(true)}
              className="px-6 py-3 bg-emerald-500 rounded-2xl text-lg font-bold text-white shadow-xl hover:bg-emerald-600"
            >
              Создать задание ({selectedRows.length})
            </button>
            <button
              onClick={resetOrderSelection}
              className="px-4 py-2 bg-gray-500 rounded-xl text-white hover:bg-gray-700"
            >Сбросить</button>
          </div>
        )}

        {showOrderDialog && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-[#23283b] rounded-2xl shadow-2xl p-8 w-[420px] flex flex-col gap-5 border border-violet-700">
              <div className="text-white text-xl font-semibold">Создание задания</div>
              <div className="text-slate-300 text-base">Номер будет присвоен автоматически</div>
              <textarea
                rows={4}
                className="w-full rounded bg-[#23293b] border border-violet-700 p-2 text-white"
                placeholder="Описание задания"
                value={orderDesc}
                onChange={e => setOrderDesc(e.target.value)}
                disabled={creatingOrder}
              />
              {orderError && <div className="text-red-500">{orderError}</div>}
              <div className="flex gap-4">
                <button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-6 py-2 font-semibold"
                  onClick={handleCreateOrder}
                  disabled={creatingOrder}
                >Создать</button>
                <button
                  className="bg-gray-600 hover:bg-gray-700 text-white rounded px-6 py-2"
                  onClick={resetOrderSelection}
                  disabled={creatingOrder}
                >Отмена</button>
              </div>
            </div>
          </div>
        )}

        {/* Модалки выбора маршрута и станций */}
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
