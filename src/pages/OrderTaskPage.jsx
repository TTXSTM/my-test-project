import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const mockData = {
  project: "123",
  order: "123-01",
  product: 'Качели "Солнышко"',
  rows: [
    // ... примерные строки для таблицы
    {
      partNum: "6007005",
      name: "GT3-07.00.00.01",
      code: "Труба 30х30х2",
      material: "3х1250х2500 ГОСТ 19904-90 II-Ст3Сп ГОСТ 535-2005",
      count: "23",
      made: "23",
      cell: "56",
      status: "В работе",
      taskId: "600102"
    },
    // ...ещё строки
  ]
};

const OrderTaskPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  // Если надо, найди нужную строку по taskId из БД или массива
  // const row = mockData.rows.find(r => r.taskId === taskId);

  return (
    <div className="w-screen min-h-screen bg-gray-800 text-white font-['JejuGothic'] relative">
      {/* Topbar */}
      <div className="w-full h-20 bg-gray-900 flex items-center px-10 justify-between fixed z-10">
        <button className="w-44 h-9 bg-gray-700 text-white text-sm mb-2">Навигация</button>
        <div className="flex gap-10 ml-24">
          <a href="#" className="underline text-xl">Проекты</a>
          <a href="#" className="underline text-xl">Планирование</a>
          <a href="#" className="underline text-xl">Маршрутная карта</a>
          <a href="#" className="underline text-xl">Оборудование</a>
        </div>
        <div className="flex gap-6 items-center">
          <div className="text-sm">14.06.25</div>
          <div className="text-sm">15:57</div>
          <div className="text-sm">Ананин В.М.</div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="fixed top-20 left-0 w-72 h-[calc(100vh-5rem)] bg-slate-800 shadow-xl flex flex-col gap-4 px-3 pt-6">
        <div className="w-64 h-28 bg-gray-900 rounded text-indigo-200 flex flex-col items-center justify-center text-2xl">
          Станция № 1<br />Гибочный станок
        </div>
        <div className="w-64 h-48 bg-gray-900 rounded mt-4">
          <div className="w-64 h-8 bg-purple-950 rounded-tl rounded-tr flex items-center justify-center text-white text-sm">
            Канбан-доска
          </div>
        </div>
        <div className="w-64 h-52 bg-gray-900 rounded mt-4">
          <div className="w-64 h-8 bg-purple-950 rounded-tl rounded-tr flex items-center justify-center text-white text-sm">
            Оперативный чат
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="ml-[300px] pt-[100px] pr-8">
        <div className="flex gap-12 items-center">
          <div className="text-white text-sm">Проект № {mockData.project}</div>
          <div className="text-white text-sm">Заказ № {mockData.order}</div>
          <div className="text-stone-300 text-2xl">{mockData.product}</div>
        </div>

        {/* Table */}
        <div className="mt-8 bg-gray-800 rounded-lg overflow-x-auto">
          <table className="min-w-full border border-gray-700">
            <thead>
              <tr>
                <th className="px-3 py-2 border-r border-gray-700 bg-[#172027] text-sm">П.Н детали</th>
                <th className="px-3 py-2 border-r border-gray-700 bg-[#172027] text-sm">Наименование</th>
                <th className="px-3 py-2 border-r border-gray-700 bg-[#172027] text-sm">Обозначение</th>
                <th className="px-3 py-2 border-r border-gray-700 bg-[#172027] text-sm">Материал</th>
                <th className="px-2 py-2 border-r border-gray-700 bg-[#172027] text-sm">Кол-во</th>
                <th className="px-2 py-2 border-r border-gray-700 bg-[#172027] text-sm">Изготовил</th>
                <th className="px-2 py-2 border-r border-gray-700 bg-[#172027] text-sm">№ ячейки</th>
                <th className="px-2 py-2 border-r border-gray-700 bg-[#172027] text-sm">Статус</th>
                <th className="px-2 py-2 bg-[#172027] text-sm">Задание</th>
              </tr>
            </thead>
            <tbody>
              {mockData.rows.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-700">
                  <td className="text-center py-1 border-r border-gray-700">{row.partNum}</td>
                  <td className="text-center py-1 border-r border-gray-700">{row.name}</td>
                  <td className="text-center py-1 border-r border-gray-700">{row.code}</td>
                  <td className="text-center py-1 border-r border-gray-700 text-xs">{row.material}</td>
                  <td className="text-center py-1 border-r border-gray-700">{row.count}</td>
                  <td className="text-center py-1 border-r border-gray-700">{row.made}</td>
                  <td className="text-center py-1 border-r border-gray-700">{row.cell}</td>
                  <td className="text-center py-1 border-r border-gray-700">{row.status}</td>
                  <td className="text-center py-1">
                    <button
                      className="underline text-indigo-300 hover:text-violet-400 transition"
                      onClick={() => navigate(`/order/${row.taskId}`)}
                    >
                      {row.taskId}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderTaskPage;
