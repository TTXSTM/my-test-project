import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrders } from "../OrdersContext";
import { Link } from "react-router-dom";

function getProgressColor(progress) {
  if (progress > 95) return "bg-gradient-to-r from-green-600 to-green-400";
  if (progress > 80) return "bg-gradient-to-r from-green-500 to-yellow-300";
  if (progress > 50) return "bg-gradient-to-r from-yellow-300 to-orange-400";
  return "bg-gradient-to-r from-orange-400 to-red-500";
}

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, setOrders } = useOrders();

  const orderIdx = orders.findIndex(o => o.id === id);
  const order = orders[orderIdx];

  // Модалка для подзаказа
  const [showCreateSubOrder, setShowCreateSubOrder] = useState(false);
  const [newSubOrder, setNewSubOrder] = useState({
    id: "",
    product: "",
    amount: "",
    progress: 0,
  });

  // Состояние для дропдауна навигации
  const [navOpen, setNavOpen] = useState(false);
  const navRef = useRef();

  // Закрытие дропдауна при клике вне его
  useEffect(() => {
    const handleClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setNavOpen(false);
    };
    if (navOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [navOpen]);

  const handleCreateSubOrder = (e) => {
    e.preventDefault();
    setOrders(prevOrders =>
      prevOrders.map((ord, idx) =>
        idx === orderIdx
          ? { ...ord, subOrders: [...(ord.subOrders || []), { ...newSubOrder }] }
          : ord
      )
    );
    setNewSubOrder({ id: "", product: "", amount: "", progress: 0 });
    setShowCreateSubOrder(false);
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-[#262537] text-white flex flex-col justify-center items-center">
        <div className="mb-4 text-2xl">Проект не найден</div>
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
    <div className="min-h-screen bg-[#262537] flex flex-col md:flex-row">
      {/* Модалка для подзаказа */}
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
              placeholder="Кол-во"
              className="rounded px-3 py-2 bg-slate-700 text-white"
              value={newSubOrder.amount}
              onChange={e => setNewSubOrder(o => ({ ...o, amount: e.target.value }))}
              required
            />
            <input
              type="number"
              placeholder="Прогресс (%)"
              className="rounded px-3 py-2 bg-slate-700 text-white"
              value={newSubOrder.progress}
              min={0}
              max={100}
              onChange={e => setNewSubOrder(o => ({ ...o, progress: e.target.value }))}
              required
            />
            <button
              type="submit"
              className="bg-violet-700 cursor-pointer hover:bg-violet-800 text-white rounded py-2 mt-2"
            >
              Создать
            </button>
            <button
              type="button"
              className="text-gray-400 cursor-pointer hover:text-red-400 mt-1"
              onClick={() => setShowCreateSubOrder(false)}
            >
              Отмена
            </button>
          </form>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-[#323A44] flex-shrink-0 px-4 py-5 flex flex-col gap-6 min-h-screen">
        {/* Выпадающая навигация */}
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

      {/* Main content */}
      <main className="flex-1 py-12 px-2 md:px-8 bg-[#262537] min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* Card top info */}
          <div className="bg-[#424C5B] rounded-2xl p-7 mb-8 shadow-lg relative">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white">
              Проект № {order.id}
            </h2>
            <div className="text-base md:text-lg text-gray-200 mb-1">
              {order.product}
            </div>
            <div className="flex flex-wrap gap-8 mt-2">
              <div>
                <span className="text-gray-300">Дедлайн: </span>
                <span className="font-semibold text-white">{order.deadline}</span>
              </div>
              <div>
                <span className="text-gray-300">Прогресс: </span>
                <span className="font-semibold text-white">{order.progress}%</span>
              </div>
            </div>
            {/* Кнопка создать подзаказ */}
            <button
              onClick={() => setShowCreateSubOrder(true)}
              className="cursor-pointer mt-5 mb-2 bg-[#172027] hover:bg-violet-800 text-white px-4 py-1 text-sm rounded"
            >
              + Создать подзаказ
            </button>
          </div>

          {/* Suborders Table */}
          <div>
            <h3 className="text-xl text-white mb-5 pl-2">Заказ на производство</h3>
            <div className="w-full flex flex-col gap-3">
              {order.subOrders && order.subOrders.length > 0 ? (
                order.subOrders.map(sub => (
                  <div
                    key={sub.id}
                    className="flex flex-col md:flex-row gap-2 bg-[#2F3A43] rounded-md items-center"
                  >
                    {/* № подзаказа */}
                    <Link
                      to={`/order/${sub.id}`}
                      className="flex items-center px-4 py-2 bg-[#49555E] text-white text-lg font-bold rounded-t-md md:rounded-t-none md:rounded-l-md min-w-[120px] md:min-w-[140px] font-['JejuGothic'] underline hover:text-violet-400"
                    >
                      {sub.id}
                    </Link>
                    {/* Наименование */}
                    <div className="flex-1 px-4 py-2 text-gray-100 text-lg font-['JejuGothic']">
                      {sub.product}
                    </div>
                    {/* Кол-во */}
                    <div className="px-4 py-2 text-gray-300 text-lg font-['JejuGothic'] min-w-[140px]">
                      {sub.amount || "2 КОМП-ТА"}
                    </div>
                    {/* Прогресс */}
                    <div className="flex items-center min-w-[160px] px-4 py-1">
                      <div className={`h-8 w-full rounded-lg flex items-center justify-center ${getProgressColor(Number(sub.progress ?? 80))}`}>
                        <span className="text-white text-xl font-semibold tracking-wide shadow-black drop-shadow">
                          {sub.progress ?? 80}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 pl-2">Подзаказы отсутствуют</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
