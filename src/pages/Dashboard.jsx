import React, { useState, useRef, useEffect } from "react";
import { useOrders } from "../OrdersContext";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { orders, setOrders } = useOrders();
  const [openedOrderIdx, setOpenedOrderIdx] = useState(null);

  // Модальное окно для создания проекта
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newOrder, setNewOrder] = useState({
    id: "",
    product: "",
    deadline: "",
    progress: 0,
    subOrders: [],
  });

  // --- Навигация выпадающая (Dropdown) ---
  const [navOpen, setNavOpen] = useState(false);
  const navRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setNavOpen(false);
    };
    if (navOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [navOpen]);

  // --- Создание проекта ---
  const handleCreateOrder = (e) => {
    e.preventDefault();
    setOrders([
      ...orders,
      { ...newOrder, subOrders: [] }
    ]);
    setNewOrder({ id: "", product: "", deadline: "", progress: 0, subOrders: [] });
    setShowCreateProject(false);
  };

  return (
    <div className="min-h-screen bg-[#262537] flex flex-col md:flex-row">
      {/* --- Модалка создания проекта --- */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleCreateOrder}
            className="bg-slate-900 p-8 rounded-xl w-[350px] flex flex-col gap-4 border-2 border-violet-500"
          >
            <h2 className="text-xl text-white mb-2">Создать проект</h2>
            <input
              placeholder="№ проекта"
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

      {/* --- Sidebar --- */}
      <aside className="w-full md:w-80 bg-[#323A44] flex-shrink-0 px-4 py-5 flex flex-col gap-6 min-h-screen">
        {/* --- Выпадающая навигация --- */}
        <div className="mb-4 relative" ref={navRef}>
          <button
            className="cursor-pointer bg-gradient-to-r from-purple-900 to-slate-800 rounded-lg px-3 py-2 text-white text-lg font-bold tracking-wide w-full text-left focus:outline-none"
            onClick={() => setNavOpen(v => !v)}
          >
            Навигация
          </button>
          {navOpen && (
            <div className="absolute left-0 top-12 bg-slate-900 border border-violet-700 rounded shadow-xl z-20 w-52 flex flex-col animate-fade-in">
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
        <button className="bg-[#232833] cursor-pointer text-white rounded px-4 py-2 mb-3 hover:bg-[#293141] transition">
          Поиск
        </button>
        <div className="w-full h-44 flex items-center justify-center bg-[#222832] rounded-lg mb-4">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-green-600 via-blue-700 to-purple-900 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#262537]" />
          </div>
        </div>
        <div className="bg-purple-900 text-white px-3 py-2 rounded-lg mb-2 text-center">
          Оперативный чат
        </div>
        <div className="flex-1" />
      </aside>

      {/* --- Main table --- */}
      <main className="flex-1 py-12 px-2 md:px-8 bg-[#262537] min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* --- Table headers --- */}
          <div className="hidden md:flex gap-4 md:gap-8 mb-4 w-full">
            <div className="flex-1 text-center text-white text-2xl font-['Inter']">№ проекта</div>
            <div className="flex-[2] text-center text-white text-2xl font-['Inter']">Наименование изделия</div>
            <div className="flex-[1.5] text-center text-white text-2xl font-['Inter']">Дедлайн</div>
          </div>

          {/* --- Orders list --- */}
          <div className="space-y-2 w-full">
            {orders.map((order, idx) => (
              <div key={idx}>
                <div
                  className={`
                    flex flex-col md:flex-row gap-2 md:gap-4 mb-2
                    rounded-md p-2 md:p-0 justify-between w-full
                    cursor-pointer transition hover:scale-[1.01] hover:shadow-lg
                  `}
                  onClick={() => setOpenedOrderIdx(openedOrderIdx === idx ? null : idx)}
                >
                  {/* --- № проекта --- */}
                  <Link
                    to={`/project/${order.id}`}
                    className="flex-1 h-9 bg-[#49555E] text-center flex items-center justify-center text-white text-base font-['JejuGothic'] rounded md:rounded-none underline hover:text-violet-400"
                  >
                    {order.id}
                  </Link>
                  {/* --- Наименование изделия --- */}
                  <div className="flex-[2] h-9 bg-[#2F3A43] text-center flex items-center justify-center text-white text-base font-['Inter'] rounded md:rounded-none">
                    {order.product}
                  </div>
                  {/* --- Дедлайн + Прогресс --- */}
                  <div className="flex flex-[1.5] min-w-0 h-9">
                    <div className="flex-[1] h-full bg-[#2F3A43] text-center flex items-center justify-center text-white text-base font-['Inter']">
                      {order.deadline}
                    </div>
                    <div className="flex-[1] h-full bg-gradient-to-r from-green-700 via-yellow-400 to-yellow-400 text-center flex items-center justify-center text-white text-xl font-['Inter']">
                      {order.progress}%
                    </div>
                  </div>
                </div>

                {/* --- Раскрывающийся список (по желанию, можно убрать) --- */}
                {openedOrderIdx === idx && order.subOrders?.length > 0 && (
                  <div className="ml-0 md:ml-2 mt-1 space-y-1">
                    {order.subOrders.map((sub, subIdx) => (
                      <div key={subIdx} className="flex gap-2 md:gap-4">
                        <Link
                          to={`/order/${sub.id}`}
                          className="flex-1 h-8 bg-slate-700 text-center flex items-center justify-center text-indigo-200 text-base font-['JejuGothic'] underline hover:text-violet-400 transition"
                        >
                          {sub.id}
                        </Link>
                        <div className="flex-[2] h-8 bg-slate-700 text-center flex items-center justify-center text-white text-base font-['Inter'] ">
                          {sub.product}
                        </div>
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
                  </div>
                )}
               
              </div>
            ))}

            {/* --- Кнопка создать проект --- */}
            <div className="flex justify-start mb-4">
              <button
                onClick={() => setShowCreateProject(true)}
                className="bg-[#172027] hover:bg-violet-800 text-white px-6 py-2 text-lg font-['Inter'] shadow rounded"
              >
                + Создать проект
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
