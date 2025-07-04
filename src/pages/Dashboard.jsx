import React, { useState, useRef, useEffect } from "react";
import { useOrders } from "../OrdersContext";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar"; 

// Функция для прогресс-бара
const getProgressGradient = () =>
  "linear-gradient(90deg, #10d100 0%, #ffe600 50%, #d90000 100%)";

export default function Dashboard() {
  const { orders, setOrders } = useOrders();
  const [openedOrderIdx, setOpenedOrderIdx] = useState(null);

  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newOrder, setNewOrder] = useState({
    id: "",
    product: "",
    startDate: "",
    deadline: "",
    responsible: "",
    progress: 0,
    status: "В работе",
    subOrders: [],
  });

  const [navOpen, setNavOpen] = useState(false);
  const navRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (showCreateProject) return;
      if (navRef.current && !navRef.current.contains(e.target)) setNavOpen(false);
    }
    if (navOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [navOpen, showCreateProject]);

  // Фильтрация пустых заказов
  const visibleOrders = (orders || []).filter(
    (o) => o.id && o.product && o.deadline
  );

  // Создание проекта
  const handleCreateProject = (e) => {
    e.preventDefault();
    if (
      !newOrder.id ||
      !newOrder.product ||
      !newOrder.startDate ||
      !newOrder.deadline ||
      !newOrder.responsible
    ) {
      alert("Заполните все поля!");
      return;
    }
    setOrders([...orders, { ...newOrder, subOrders: [] }]);
    setNewOrder({
      id: "",
      product: "",
      startDate: "",
      deadline: "",
      responsible: "",
      progress: 0,
      status: "В работе",
      subOrders: [],
    });
    setShowCreateProject(false);
  };

  // --- Одинаковый стиль для подзаказов и их шапки! ---
  const suborderGrid = {
    id: "flex-1",
    product: "flex-[2]",
    startDate: "flex-[1.5]",
    deadline: "flex-[1.5]",
    responsible: "flex-[1.5]",
    progress: "flex-1",
  };

  // Рендер строки подзаказа
  const renderSubOrder = (sub) => (
    <div
      key={sub.id}
      className="flex flex-row items-center justify-center w-full"
      style={{ minHeight: "38px" }}
    >
      <Link
        to={`/order/${sub.id}`}
        className={`${suborderGrid.id} h-9 px-2 bg-[#232B34] justify-center text-white flex items-center underline text-[15px] hover:text-violet-400 hover:scale-[1.01] hover:shadow-lg`}
        title={sub.id}
      >
        {sub.id}
      </Link>
      <div
        className={`${suborderGrid.product} h-9 px-2 bg-[#232B34] justify-center text-white flex items-center text-[15px] truncate`}
        style={{ maxWidth: 320 }}
        title={sub.product}
      >
        {sub.product}
      </div>
      <div className={`${suborderGrid.startDate} h-9 px-2 bg-[#232B34] justify-center text-white flex items-center text-[15px]`}>
        {sub.startDate || "-"}
      </div>
      <div className={`${suborderGrid.deadline} h-9 px-2 bg-[#232B34] justify-center text-white flex items-center text-[15px]`}>
        {sub.deadline || "-"}
      </div>
      <div className={`${suborderGrid.responsible} h-9 px-2 bg-[#232B34] justify-center text-white flex items-center text-[15px]`}>
        {sub.responsible || "-"}
      </div>
      <div className={`${suborderGrid.progress} flex justify-center items-center h-9 px-2`}>
        <div
          className="relative w-full h-8 overflow-hidden flex items-center"
          style={{ background: getProgressGradient() }}
        >
          <span
            style={{
              position: "absolute",
              right: "8px",
              color: "#fff",
              fontWeight: 600,
              textShadow: "0 0 6px #000,0 1px 2px #fff",
              zIndex: 2,
              fontSize: "15px",
            }}
          >
            {sub.progress}%
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#262537] flex flex-col md:flex-row">
      {/* --- Sidebar --- */}
      <Sidebar navOpen={navOpen} setNavOpen={setNavOpen} />

      {/* --- Main table --- */}
      <main className="flex-1 py-12 px-2 md:px-8 bg-[#262537] min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Заголовки */}
          <div className="hidden md:flex gap-4 md:gap-8 mb-4 w-full">
            <div className="flex-1 text-center text-white text-2xl font-['Inter']">
              № проекта
            </div>
            <div className="flex-[2] text-center text-white text-2xl font-['Inter']">
              Наименование изделия
            </div>
            <div className="flex-[1.5] text-center text-white text-2xl font-['Inter']">
              Дата начала
            </div>
            <div className="flex-[1.5] text-center text-white text-2xl font-['Inter']">
              Дедлайн
            </div>
            <div className="flex-[1.5] text-center text-white text-2xl font-['Inter']">
              Ответственный
            </div>
            <div className="flex-1 text-center text-white text-2xl font-['Inter']">
              Статус
            </div>
          </div>

          <div className="space-y-2 w-full">
            {/* Все проекты */}
            {visibleOrders.map((order, idx) => (
              <React.Fragment key={order.id}>
                <div
                  className={
                    "flex flex-col md:flex-row gap-1 md:gap-2 mb-2 rounded-md p-2 md:p-0 justify-between w-full cursor-pointer transition hover:scale-[1.01] hover:shadow-lg " +
                    (openedOrderIdx === idx ? "bg-[#313446]" : "")
                  }
                  onClick={() =>
                    setOpenedOrderIdx(openedOrderIdx === idx ? null : idx)
                  }
                >
                  <Link
                    to={`/project/${order.id}`}
                    className="flex-1 h-9 bg-[#49555E] text-center flex items-center justify-center text-white text-base font-['JejuGothic'] rounded md:rounded-none underline hover:text-violet-400"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {order.id}
                  </Link>
                  <div
                    className="flex-[2] h-9 bg-[#2F3A43] text-center flex items-center justify-center text-white text-base font-['Inter'] rounded md:rounded-none truncate overflow-hidden whitespace-nowrap"
                    style={{ maxWidth: 400, minWidth: 0 }}
                    title={order.product}
                  >
                    {order.product}
                  </div>
                  <div className="flex-[1.5] bg-[#2F3A43] text-center flex items-center justify-center text-white text-base font-['Inter']">
                    {order.startDate}
                  </div>
                  <div className="flex-[1.5] bg-[#2F3A43] text-center flex items-center justify-center text-white text-base font-['Inter']">
                    {order.deadline}
                  </div>
                  <div className="flex-[1.5] bg-[#2F3A43] text-center flex items-center justify-center text-white text-base font-['Inter']">
                    {order.responsible}
                  </div>
                  <div className="flex-1 flex items-center h-9">
                    <div
                      className="relative w-full h-8 bg-gray-700 overflow-hidden flex items-center"
                      style={{ background: getProgressGradient() }}
                    >
                      <div
                        style={{
                          left: `calc(${order.progress}% - 1.5px)`,
                        }}
                        className="absolute top-0 bottom-0 w-[3px] bg-black/60 z-10"
                      />
                      <span
                        style={{
                          position: "absolute",
                          left: `calc(${order.progress}% - 24px)`,
                          top: 0,
                          bottom: 0,
                          width: "48px",
                          textAlign: "center",
                        }}
                        className="font-semibold text-white text-base z-20 flex items-center justify-center"
                      >
                        {order.progress}%
                      </span>
                    </div>
                  </div>
                </div>
                {/* --- Раскрывающийся блок подзаказов --- */}
                {openedOrderIdx === idx &&
                  order.subOrders &&
                  order.subOrders.length > 0 && (
                    <div className="mb-2 ml-1 justify-center">
                      {/* --- Заголовок для подзаказов --- */}
                      <div
                        className="flex flex-row items-center justify-center w-full px-2 py-1"
                        style={{
                          background: "#746487",
                          color: "#ddd",
                          fontSize: 14,
                          fontWeight: 400,
                        }}
                      >
                        <div className="flex-1 text-center">№ заказа</div>
                        <div className="flex-[2] text-center">
                          Наименование заказа
                        </div>
                        <div className="flex-[1.5] text-center">
                          Дата начала
                        </div>
                        <div className="flex-[1.5] text-center">
                          Дедлай
                        </div>
                        <div className="flex-[1.5] text-center">
                          Исполнитель
                        </div>
                        <div className="flex-1 text-center">Прогресс</div>
                      </div>
                      {order.subOrders.map(renderSubOrder)}
                    </div>
                  )}
              </React.Fragment>
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

      {/* --- Модалка создания проекта --- */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleCreateProject}
            className="bg-slate-900 p-8 rounded-xl w-[350px] flex flex-col gap-4 border-2 border-violet-500"
          >
            <h2 className="text-xl text-white mb-2">Создать проект</h2>
            <label className="text-gray-200 text-sm font-semibold">
              № проекта
              <input
                className="mt-1 rounded px-3 py-2 bg-slate-700 text-white w-full"
                value={newOrder.id}
                onChange={(e) => setNewOrder((o) => ({ ...o, id: e.target.value }))}
                required
              />
            </label>
            <label className="text-gray-200 text-sm font-semibold">
              Наименование изделия
              <input
                className="mt-1 rounded px-3 py-2 bg-slate-700 text-white w-full"
                value={newOrder.product}
                onChange={(e) => setNewOrder((o) => ({ ...o, product: e.target.value }))}
                required
              />
            </label>
            <label className="text-gray-200 text-sm font-semibold">
              Дата начала
              <input
                type="date"
                className="mt-1 rounded px-3 py-2 bg-slate-700 text-white w-full"
                value={newOrder.startDate}
                onChange={(e) =>
                  setNewOrder((o) => ({ ...o, startDate: e.target.value }))
                }
                required
              />
            </label>
            <label className="text-gray-200 text-sm font-semibold">
              Дедлайн
              <input
                type="date"
                className="mt-1 rounded px-3 py-2 bg-slate-700 text-white w-full"
                value={newOrder.deadline}
                onChange={(e) =>
                  setNewOrder((o) => ({ ...o, deadline: e.target.value }))
                }
                required
              />
            </label>
            <label className="text-gray-200 text-sm font-semibold">
              Ответственный
              <input
                className="mt-1 rounded px-3 py-2 bg-slate-700 text-white w-full"
                value={newOrder.responsible}
                onChange={(e) =>
                  setNewOrder((o) => ({ ...o, responsible: e.target.value }))
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
                value={newOrder.progress}
                onChange={(e) =>
                  setNewOrder((o) => ({ ...o, progress: e.target.value }))
                }
                required
              />
            </label>
            <button
              type="submit"
              className="bg-violet-700 hover:bg-violet-800 text-white rounded py-2 mt-2"
            >
              Создать
            </button>
            <button
              type="button"
              className="text-gray-400 hover:text-red-400 mt-1"
              onClick={() => setShowCreateProject(false)}
            >
              Отмена
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
