import React, { useState } from "react";
import { useOrders } from "../OrdersContext";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { orders, setOrders } = useOrders();
  const [openedOrderIdx, setOpenedOrderIdx] = useState(null);

  // Модальное окно для создания проекта
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newOrder, setNewOrder] = useState({ id: "", product: "", deadline: "", progress: 0, subOrders: [] });

  // Модальное окно для создания подзаказа
  const [showCreateSubOrder, setShowCreateSubOrder] = useState(false);
  const [currentOrderIdx, setCurrentOrderIdx] = useState(null);
  const [newSubOrder, setNewSubOrder] = useState({ id: "", product: "", deadline: "", progress: 0 });

  const toggleOrder = (idx) => setOpenedOrderIdx(openedOrderIdx === idx ? null : idx);

  // --- Создание проекта ---
  const handleCreateOrder = (e) => {
    e.preventDefault();
    setOrders([
      ...orders,
      {
        ...newOrder,
        subOrders: []
      }
    ]);
    setNewOrder({ id: "", product: "", deadline: "", progress: 0, subOrders: [] });
    setShowCreateProject(false);
  };

  // --- Создание подзаказа ---
  const handleCreateSubOrder = (e) => {
    e.preventDefault();
    setOrders((prevOrders) => {
      return prevOrders.map((order, idx) =>
        idx === currentOrderIdx
          ? {
              ...order,
              subOrders: [...(order.subOrders || []), { ...newSubOrder }]
            }
          : order
      );
    });
    setNewSubOrder({ id: "", product: "", deadline: "", progress: 0 });
    setShowCreateSubOrder(false);
  };

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col md:flex-row">
      {/* Модальное окно создания проекта */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleCreateOrder}
            className="bg-slate-900 p-8 rounded-xl w-[350px] flex flex-col gap-4 border-2 border-violet-500"
          >
            <h2 className="text-xl text-white mb-2">Создать проект</h2>
            <input
              placeholder="№ заказа"
              className="rounded px-3 py-2 bg-slate-700 text-white"
              value={newOrder.id}
              onChange={e => setNewOrder(o => ({ ...o, id: e.target.value }))}
              required
            />
            <input
              placeholder="Наименование изделия"
              className="rounded px-3 py-2 bg-slate-700 text-white"
              value={newOrder.product}
              onChange={e => setNewOrder(o => ({ ...o, product: e.target.value }))}
              required
            />
            <input
              type="datetime-local"
              placeholder="Дедлайн"
              className="rounded px-3 py-2 bg-slate-700 text-white"
              value={newOrder.deadline}
              onChange={e => setNewOrder(o => ({ ...o, deadline: e.target.value }))}
              required
            />
            <button type="submit" className="bg-violet-700 hover:bg-violet-800 text-white rounded py-2 mt-2">Создать</button>
            <button type="button" className="text-gray-400 hover:text-red-400 mt-1" onClick={() => setShowCreateProject(false)}>Отмена</button>
          </form>
        </div>
      )}

      {/* Модальное окно создания подзаказа */}
      {showCreateSubOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleCreateSubOrder}
            className="bg-slate-900 p-8 rounded-xl w-[350px] flex flex-col gap-4 border-2 border-violet-500"
          >
            <h2 className="text-xl text-white mb-2">Создать подзаказ</h2>
            <input
              placeholder="№ подзаказа"
              className="rounded px-3 py-2 bg-slate-700 text-white"
              value={newSubOrder.id}
              onChange={e => setNewSubOrder(o => ({ ...o, id: e.target.value }))}
              required
            />
            <input
              placeholder="Наименование"
              className="rounded px-3 py-2 bg-slate-700 text-white"
              value={newSubOrder.product}
              onChange={e => setNewSubOrder(o => ({ ...o, product: e.target.value }))}
              required
            />
            <input
              type="number"
              placeholder="Кол-во"
              className="rounded px-3 py-2 bg-slate-700 text-white"
              value={newSubOrder.deadline}
              onChange={e => setNewSubOrder(o => ({ ...o, deadline: e.target.value }))}
              required
            />
            <button type="submit" className="bg-violet-700 hover:bg-violet-800 text-white rounded py-2 mt-2">Создать</button>
            <button type="button" className="text-gray-400 hover:text-red-400 mt-1" onClick={() => setShowCreateSubOrder(false)}>Отмена</button>
          </form>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-slate-800 shadow-xl pt-6 px-3 flex-shrink-0 flex flex-col items-center">
        <button className="w-full h-9 bg-stone-500 text-white mb-6 text-sm font-['JejuGothic'] rounded hover:bg-stone-600 transition">
          поиск
        </button>
        <div className="w-full max-w-xs h-8 bg-purple-950 text-white text-sm flex items-center justify-center rounded-t mb-2">
          Оперативный чат
        </div>
        <div className="w-full max-w-xs h-40 md:h-96 bg-gray-900 rounded mb-3">
          <div className="w-11/12 h-24 md:h-36 bg-zinc-800 m-4 rounded" />
        </div>
      </aside>

      {/* Main table */}
      <main className="flex-1 pt-6 px-3 md:pl-10">
        {/* Top menu */}
        <nav className="flex flex-wrap gap-4 md:gap-8 mb-6 md:mb-8 justify-center">
          {["Проекты", "Планирование", "Маршрутная карта", "Оборудование"].map((item, idx) => (
            <a key={idx} href="#" className="text-white text-base md:text-2xl font-['Inter'] hover:text-violet-400 transition">{item}</a>
          ))}
        </nav>

        {/* Table headers */}
        <div className="hidden md:flex gap-4 md:gap-8 mb-4 w-full">
          <div className="flex-1 text-center text-white text-2xl font-['Inter']">№ заказа</div>
          <div className="flex-[2] text-center text-white text-2xl font-['Inter']">Наименование изделие</div>
          <div className="flex-[1.5] text-center text-white text-2xl font-['Inter']">Дедлайн</div>
        </div>

        {/* Orders list */}
        <div className="space-y-2 w-full">
          {orders.map((order, idx) => (
            <div key={idx}>
              <div
                className={`
                  flex flex-col md:flex-row gap-2 md:gap-4 mb-2
                  rounded-md p-2 md:p-0 justify-between w-full
                  cursor-pointer transition hover:scale-[1.01] hover:shadow-lg
                `}
                onClick={() => toggleOrder(idx)}
              >
                {/* № заказа */}
                <div className="flex-1 h-9 bg-stone-500 text-center flex items-center justify-center text-white text-base font-['JejuGothic'] rounded md:rounded-none">
                  {order.id}
                </div>
                {/* Наименование изделие */}
                <div className="flex-[2] h-9 bg-stone-500 text-center flex items-center justify-center text-white text-base font-['Inter'] rounded md:rounded-none">
                  {order.product}
                </div>
                {/* Дедлайн + Прогресс */}
                <div className="flex flex-[1.5] min-w-0 h-9">
                  <div className="flex-[1] h-full bg-stone-500 text-center flex items-center justify-center text-white text-base font-['Inter']">
                    {order.deadline}
                  </div>
                  <div className="flex-[1] h-full bg-gradient-to-r from-green-700 via-yellow-400 to-yellow-400 text-center flex items-center justify-center text-white text-xl font-['Inter']">
                    {order.progress}%
                  </div>
                </div>
              </div>

              {/* Состав заказа (раскрывающийся блок) + кнопка создать подзаказ */}
              {openedOrderIdx === idx && (
                <div className="ml-0 md:ml-2 mt-1 space-y-1">
                  {/* Кнопка создать подзаказ */}
                  {order.subOrders?.map((sub, subIdx) => (
                    <div key={subIdx} className="flex gap-2 md:gap-4">
                      {/* № подзаказа */}
                      <Link
                        to={`/order/${sub.id}`}
                        className="flex-1 h-8 bg-slate-700 text-center flex items-center justify-center text-indigo-200 text-base font-['JejuGothic'] underline hover:text-violet-400 transition"
                      >
                        {sub.id}
                      </Link>
                      {/* Наименование */}
                      <div className="flex-[2] h-8 bg-slate-700 text-center flex items-center justify-center text-white text-base font-['Inter'] ">
                        {sub.product}
                      </div>
                      {/* Дедлайн + Прогресс */}
                      <div className="flex flex-[1.5] min-w-0 h-8">
                        <div className="flex-[1] h-full bg-slate-700 text-center flex items-center justify-center text-stone-300 text-base font-['Inter']">
                          {sub.deadline}
                        </div>
                        <div className="flex-[1] h-full bg-gradient-to-r from-green-700 via-yellow-400 to-red-600 text-center flex items-center justify-center text-white text-base font-['Inter'] ">
                          {sub.progress}%
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={e => { e.stopPropagation(); setCurrentOrderIdx(idx); setShowCreateSubOrder(true); }}
                    className="mb-2 bg-[#172027] hover:bg-violet-800 text-white px-4 py-1 text-sm"
                  >
                    + Создать подзаказ
                  </button>
                </div>
              )}
            </div>
          ))}
        {/* Кнопка создать проект */}
        <div className="flex justify-start mb-4">
          <button
            onClick={() => setShowCreateProject(true)}
            className="bg-[#172027] hover:bg-violet-800 text-white px-6 py-2 text-lg font-['Inter'] shadow"
          >
            + Создать проект
          </button>
        </div>
        </div>
      </main>
    </div>
  );
}
