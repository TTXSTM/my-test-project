import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useOrders } from "../OrdersContext";
import Sidebar from "../Sidebar"; 

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

  const orderIdx = orders.findIndex((o) => o.id === id);
  const order = orders[orderIdx];

  // Модалка для подзаказа
  const [showCreateSubOrder, setShowCreateSubOrder] = useState(false);
  const [newSubOrder, setNewSubOrder] = useState({
    id: "",
    product: "",
    startDate: "",
    deadline: "",
    responsible: "",
    progress: 0,
  });

  // Навигация сайдбара
  const [navOpen, setNavOpen] = useState(false);
  const navRef = useRef();

  useEffect(() => {
    const handleClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setNavOpen(false);
    };
    if (navOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [navOpen]);

  const handleCreateSubOrder = (e) => {
    e.preventDefault();
    setOrders((prevOrders) =>
      prevOrders.map((ord, idx) =>
        idx === orderIdx
          ? {
              ...ord,
              subOrders: [...(ord.subOrders || []), { ...newSubOrder }],
            }
          : ord
      )
    );
    setNewSubOrder({
      id: "",
      product: "",
      startDate: "",
      deadline: "",
      responsible: "",
      progress: 0,
    });
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
      {/* Модалка создания подзаказа */}
      {showCreateSubOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleCreateSubOrder}
            className="bg-slate-900 p-8 rounded-xl w-[350px] flex flex-col gap-4 border-2 border-violet-500"
          >
            <h2 className="text-xl text-white mb-2">Создать подзаказ</h2>
            <label className="text-gray-200 text-sm font-semibold">
              № заказа
              <input
                className="mt-1 rounded px-3 py-2 bg-slate-700 text-white w-full"
                value={newSubOrder.id}
                onChange={(e) =>
                  setNewSubOrder((o) => ({ ...o, id: e.target.value }))
                }
                required
              />
            </label>
            <label className="text-gray-200 text-sm font-semibold">
              Наименование заказа
              <input
                className="mt-1 rounded px-3 py-2 bg-slate-700 text-white w-full"
                value={newSubOrder.product}
                onChange={(e) =>
                  setNewSubOrder((o) => ({ ...o, product: e.target.value }))
                }
                required
              />
            </label>
            <label className="text-gray-200 text-sm font-semibold">
              Дата начала
              <input
                type="date"
                className="mt-1 rounded px-3 py-2 bg-slate-700 text-white w-full"
                value={newSubOrder.startDate}
                onChange={(e) =>
                  setNewSubOrder((o) => ({ ...o, startDate: e.target.value }))
                }
                required
              />
            </label>
            <label className="text-gray-200 text-sm font-semibold">
              Дедлай
              <input
                type="date"
                className="mt-1 rounded px-3 py-2 bg-slate-700 text-white w-full"
                value={newSubOrder.deadline}
                onChange={(e) =>
                  setNewSubOrder((o) => ({ ...o, deadline: e.target.value }))
                }
                required
              />
            </label>
            <label className="text-gray-200 text-sm font-semibold">
              Исполнитель
              <input
                className="mt-1 rounded px-3 py-2 bg-slate-700 text-white w-full"
                value={newSubOrder.responsible}
                onChange={(e) =>
                  setNewSubOrder((o) => ({ ...o, responsible: e.target.value }))
                }
                required
              />
            </label>
            <label className="text-gray-200 text-sm font-semibold">
              Прогресс (%)
              <input
                type="number"
                min={0}
                max={100}
                className="mt-1 rounded px-3 py-2 bg-slate-700 text-white w-full"
                value={newSubOrder.progress}
                onChange={(e) =>
                  setNewSubOrder((o) => ({ ...o, progress: e.target.value }))
                }
                required
              />
            </label>
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
      <Sidebar navOpen={navOpen} setNavOpen={setNavOpen} />

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
            {/* Заголовок таблицы */}
            <div className="hidden md:flex font-semibold text-gray-300 bg-[#746487] rounded-t-md px-2 py-2 mb-1">
              <div className="w-[130px] text-center">№ заказа</div>
              <div className="w-[300px] text-center">Наименование заказа</div>
              <div className="w-[160px] text-center">Дата начала</div>
              <div className="w-[160px] text-center">Дедлай</div>
              <div className="w-[160px] text-center">Исполнитель</div>
              <div className="w-[120px] text-center">Прогресс</div>
            </div>
            <div className="w-full flex flex-col gap-3">
              {order.subOrders && order.subOrders.length > 0 ? (
                order.subOrders.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex bg-[#2F3A43] rounded-md items-center mb-2"
                    style={{ minHeight: 48 }}
                  >
                    {/* № заказа */}
                    <Link
                      to={`/order/${sub.id}`}
                      className="w-[130px] flex items-center justify-center px-2 py-2 bg-[#49555E] text-white text-base font-bold font-['JejuGothic'] underline hover:text-violet-400 truncate rounded-l-md"
                      title={sub.id}
                    >
                      {sub.id}
                    </Link>
                    {/* Наименование */}
                    <div
                      className="w-[300px] px-2 py-2 text-gray-100 text-base font-['JejuGothic'] truncate"
                      title={sub.product}
                    >
                      {sub.product}
                    </div>
                    {/* Дата начала */}
                    <div className="w-[160px] px-2 py-2 text-gray-300 text-base truncate text-center" title={sub.startDate}>
                      {sub.startDate || "-"}
                    </div>
                    {/* Дедлайн */}
                    <div className="w-[160px] px-2 py-2 text-gray-300 text-base truncate text-center" title={sub.deadline}>
                      {sub.deadline || "-"}
                    </div>
                    {/* Исполнитель */}
                    <div className="w-[160px] px-2 py-2 text-gray-300 text-base truncate text-center" title={sub.responsible}>
                      {sub.responsible || "-"}
                    </div>
                    {/* Прогресс */}
                    <div className="w-[120px] flex items-center px-2 py-1 justify-center">
                      <div className={`h-8 w-full rounded-lg flex items-center justify-center ${getProgressColor(Number(sub.progress ?? 0))}`}>
                        <span className="text-white text-lg font-semibold tracking-wide shadow-black drop-shadow">
                          {sub.progress ?? 0}%
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
