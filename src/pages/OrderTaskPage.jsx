import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

// ФИО загрузившего (можно подставлять из авторизации)
const uploaderFio = "Ананин В.М.";

const initialMockRows = Array.from({ length: 12 }).map(() => ({
  partNum: "6007005",
  name: "GT3-07.00.00.01",
  code: "Труба 30х30х2",
  material: "3х1250х2500 ГОСТ 19904-90 II-Ст3Сп ГОСТ 535-2005",
  count: "23",
  made: "23",
  cell: "56",
  status: "В работе",
  taskId: "600102"
}));

const mockData = {
  project: "123",
  order: "123-01",
  product: 'Качели "Солнышко"',
};

export default function OrderTaskPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  // --- Состояния для всех строк (старых и новых) ---
  const [mainRows, setMainRows] = useState(initialMockRows);
  const [uploadedBatches, setUploadedBatches] = useState([]);
  const fileInputRef = useRef();

  // --- Навигация ---
  const [navOpen, setNavOpen] = useState(false);
  const navRef = useRef();
  useEffect(() => {
    const handleClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setNavOpen(false);
    };
    if (navOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [navOpen]);

  // --- Универсальный поиск столбцов по русским заголовкам ---
  function findCol(headerArr, variants) {
    for (let i = 0; i < headerArr.length; ++i) {
      const val = String(headerArr[i]).trim().toLowerCase();
      for (let variant of variants) {
        if (val.includes(variant)) return i;
      }
    }
    return -1;
  }

  // --- Загрузка спецификации .xlsx ---
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
          cell: "",
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

  // --- Универсальная обработка редактирования строки ---
  function handleRowEdit(rows, setRows, rowIdx, field, value) {
    setRows(prev => prev.map((row, idx) => {
      let newRow = idx === rowIdx ? { ...row, [field]: value } : row;
      // Если изменили "Изготовил", и значение = "Кол-во", ставим статус "Готово"
      if (idx === rowIdx && field === "made" && value !== undefined) {
        if (String(value) === String(row.count)) newRow.status = "Готово";
        else if (row.status === "Готово") newRow.status = ""; // сброс если изменили вниз
      }
      // Если изменили статус вручную на "Готово", но цифры не совпадают, подстраиваем цифры
      if (idx === rowIdx && field === "status" && value === "Готово") {
        newRow.made = row.count;
      }
      return newRow;
    }));
  }

  // --- Для batch-строк (после загрузки) ---
  function handleBatchRowEdit(batchIdx, rowIdx, field, value) {
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

  return (
    <div className="min-h-screen w-screen bg-[#262537] font-['JejuGothic'] flex flex-row">
      {/* --- Sidebar --- */}
      <aside className="w-[290px] min-w-[250px] bg-[#232933] flex flex-col items-center py-4 px-0 relative">
        <div className="w-full px-7 flex justify-between items-center mb-5">
          <div className="text-stone-300 text-base">{uploaderFio}</div>
          <div>
            <span className="text-stone-300 text-base mr-3">14.06.25</span>
            <span className="text-stone-300 text-base">15:57</span>
          </div>
        </div>
        {/* --- Выпадающая навигация --- */}
        <div className="w-full flex flex-col items-center mb-3 relative" ref={navRef}>
          <button
            className="cursor-pointer w-[175px] hover:from-purple-900 h-9 bg-gradient-to-r from-purple-900 to-slate-800 rounded-lg text-white text-lg font-bold tracking-wide mb-2"
            onClick={() => setNavOpen(v => !v)}
          >
            Навигация
          </button>
          {navOpen && (
            <div className="absolute top-10 bg-slate-900 border border-violet-700 rounded shadow-xl z-20 w-52 flex flex-col animate-fade-in">
              <button
                className="py-2 px-4 text-left cursor-pointer text-white hover:bg-violet-700 transition"
                onClick={() => { navigate("/dispatcher"); setNavOpen(false); }}
              >
                Диспетчерская
              </button>
              <button
                className="py-2 px-4 text-left cursor-pointer text-white hover:bg-violet-700 transition"
                onClick={() => { navigate("/dashboard"); setNavOpen(false); }}
              >
                Проекты
              </button>
              <button
                className="py-2 px-4 text-left cursor-pointer text-white hover:bg-violet-700 transition"
                onClick={() => { navigate("/"); setNavOpen(false); }}
              >
                Главная
              </button>
            </div>
          )}
        </div>
        <button
          className="cursor-pointer w-[210px] h-10 mt-2 bg-gradient-to-r from-[#922b7b] to-[#3c1c3e] rounded text-white text-base font-semibold mb-8 hover:bg-violet-900 transition"
          onClick={() => fileInputRef.current.click()}
        >
          Загрузить спецификацию
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          onChange={handleUploadSpec}
          className="hidden"
        />
      </aside>

      {/* --- Контент --- */}
      <main className="flex-1 min-h-screen pl-0 md:pl-3 py-8 bg-gradient-to-br from-[#292d3e] via-[#23283b] to-[#23283b] flex flex-col">
        {/* --- Заголовок заказа --- */}
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
                <th className="px-1 py-3 border-b border-gray-700 bg-[#23293B] text-white text-sm font-semibold text-center">№ ячейки</th>
                <th className="px-1 py-3 border-b border-gray-700 bg-[#23293B] text-white text-sm font-semibold text-center">Статус</th>
                <th className="px-1 py-3 border-b border-gray-700 bg-[#23293B] text-white text-sm font-semibold text-center">Задание</th>
              </tr>
            </thead>
            <tbody>
              {/* СТАРЫЕ СТРОКИ (основные) */}
              {mainRows.map((row, idx) => {
                const ready = String(row.made) === String(row.count) && row.count !== "";
                return (
                  <tr key={"mock-" + idx} className="hover:bg-[#353a45] transition">
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
                          handleRowEdit(mainRows, setMainRows, idx, "made", e.target.value.replace(/[^0-9]/g, ""))
                        }
                        placeholder=""
                      />
                    </td>
                    {/* № ячейки */}
                    <td className="py-2 px-2 border-b border-gray-700 text-white text-center">
                      {row.cell}
                    </td>
                    {/* Статус */}
                    <td className="py-2 px-2 border-b border-gray-700 text-white text-center">
                      <select
                        className="bg-[#262537] border border-violet-700 rounded px-1 text-white"
                        value={ready ? "Готово" : (row.status || "")}
                        onChange={e => handleRowEdit(mainRows, setMainRows, idx, "status", e.target.value)}
                        disabled={ready}
                      >
                        <option value="">-</option>
                        <option value="В работе">В работе</option>
                        <option value="Готово">Готово</option>
                        <option value="В архиве">В архиве</option>
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
              {/* Новые блоки с датой/именем файла/ФИО */}
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
                      <tr key={`batch${bidx}-${ridx}`} className="hover:bg-[#353a45] transition">
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
                              handleBatchRowEdit(bidx, ridx, "made", e.target.value.replace(/[^0-9]/g, ""))
                            }
                            placeholder=""
                          />
                        </td>
                        {/* № ячейки */}
                        <td className="py-2 px-2 border-b border-gray-700 text-white text-center">
                          {row.cell}
                        </td>
                        {/* Статус */}
                        <td className="py-2 px-2 border-b border-gray-700 text-white text-center">
                          <select
                            className="bg-[#262537] border border-violet-700 rounded px-1 text-white"
                            value={ready ? "Готово" : (row.status || "")}
                            onChange={e => handleBatchRowEdit(bidx, ridx, "status", e.target.value)}
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
      </main>
    </div>
  );
}
