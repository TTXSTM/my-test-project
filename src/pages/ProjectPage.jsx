import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useOrders } from "../OrdersContext";
import Sidebar from "../Sidebar";

const getProgressGradient = () =>
  "linear-gradient(90deg, #13d110 0%, #ffe600 55%, #d90000 100%)";

function ProgressBar({ percent }) {
  return (
    <div
      className="flex-1 h-full flex items-center justify-center rounded-b-lg"
      style={{
        background: getProgressGradient(),
        minWidth: 0,
      }}
    >
      <span
        className="w-full text-center text-white font-semibold text-[20px] select-none"
        style={{ textShadow: "0 0 8px #111" }}
      >
        {percent ?? 0}%
      </span>
    </div>
  );
}

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, setOrders } = useOrders();

  // Состояние боковой навигации (для Sidebar)
  const [navOpen, setNavOpen] = useState(false);

  const orderIdx = orders.findIndex((o) => o.id === id);
  const order = orders[orderIdx];

  const [showCreateSubOrder, setShowCreateSubOrder] = useState(false);
  const [newSubOrder, setNewSubOrder] = useState({
    id: "",
    product: "",
    startDate: "",
    deadline: "",
    responsible: "",
  });

  function handleCreateSubOrder(e) {
    e.preventDefault();
    setOrders((prevOrders) =>
      prevOrders.map((ord, idx) =>
        idx === orderIdx
          ? {
              ...ord,
              subOrders: [
                ...(ord.subOrders || []),
                {
                  ...newSubOrder,
                  progress: 0, // стартовое значение (будет пересчитано потом)
                },
              ],
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
    });
    setShowCreateSubOrder(false);
  }

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

  const cellHeight = 46;
  const columns = [
    { title: "№ заказа", w: 130 },
    { title: "Наименование заказа", w: 320 },
    { title: "Дата начала", w: 160 },
    { title: "Дедлайн", w: 160 },
    { title: "Исполнитель", w: 160 },
    { title: "Прогресс", w: 180 },
  ];

  // --- ПРОГРЕСС проекта по подзаказам
  const projectProgress =
    order.subOrders && order.subOrders.length
      ? Math.round(
          order.subOrders.reduce(
            (sum, s) => sum + (Number(s.progress) || 0),
            0
          ) / order.subOrders.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#262537] flex flex-col md:flex-row font-['Inter']">
      {/* Sidebar с пайчартом и рабочей навигацией */}
      <Sidebar
        navOpen={navOpen}
        setNavOpen={setNavOpen}
        progressPercent={projectProgress}
      />

      {/* --- Модалка добавления подзаказа --- */}
      {showCreateSubOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <form
            onSubmit={handleCreateSubOrder}
            className="bg-[#1c1a29] border-2 border-violet-500 rounded-2xl px-7 py-8 w-[370px] flex flex-col gap-4 shadow-2xl"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <h2 className="text-xl text-white font-semibold mb-1">
              Добавить подзаказ
            </h2>
            <label className="text-slate-300 text-base">
              № заказа
              <input
                className="mt-1 rounded px-3 py-2 bg-slate-700 text-white w-full outline-none"
                value={newSubOrder.id}
                onChange={(e) =>
                  setNewSubOrder((o) => ({ ...o, id: e.target.value }))
                }
                required
              />
            </label>
            <label className="text-slate-300 text-base">
              Наименование заказа
              <input
                className="mt-1 rounded px-3 py-2 bg-slate-700 text-white w-full outline-none"
                value={newSubOrder.product}
                onChange={(e) =>
                  setNewSubOrder((o) => ({ ...o, product: e.target.value }))
                }
                required
              />
            </label>
            <label className="text-slate-300 text-base">
              Дата начала
              <input
                type="date"
                className="mt-1 rounded px-3 py-2 bg-slate-700 text-white w-full outline-none"
                value={newSubOrder.startDate}
                onChange={(e) =>
                  setNewSubOrder((o) => ({
                    ...o,
                    startDate: e.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="text-slate-300 text-base">
              Дедлайн
              <input
                type="date"
                className="mt-1 rounded px-3 py-2 bg-slate-700 text-white w-full outline-none"
                value={newSubOrder.deadline}
                onChange={(e) =>
                  setNewSubOrder((o) => ({
                    ...o,
                    deadline: e.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="text-slate-300 text-base">
              Исполнитель
              <input
                className="mt-1 rounded px-3 py-2 bg-slate-700 text-white w-full outline-none"
                value={newSubOrder.responsible}
                onChange={(e) =>
                  setNewSubOrder((o) => ({
                    ...o,
                    responsible: e.target.value,
                  }))
                }
                required
              />
            </label>
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="bg-violet-700 hover:bg-violet-800 transition text-white rounded py-2 flex-1"
              >
                Добавить
              </button>
              <button
                type="button"
                className="text-slate-400 hover:text-red-400 flex-1"
                onClick={() => setShowCreateSubOrder(false)}
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <main className="flex-1 py-10 px-4 md:px-8 bg-[#262537] min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* --- Блок проекта --- */}
          <div
            className="rounded-[16px] mb-14 mt-6 overflow-hidden shadow"
            style={{ background: "#ece9f7" }}
          >
            <div
              className="flex flex-row w-full rounded-t-2xl overflow-hidden"
              style={{
                background: "#35404A",
                opacity: 1,
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
              }}
            >
              <div
                className="flex-1 py-3 px-6 text-left text-slate-200 font-bold text-base"
                style={{ letterSpacing: "0.02em" }}
              >
                № Проекта
              </div>
              <div className="flex-[2.2] py-3 px-6 text-left text-slate-200 font-bold text-base">
                Наименование проекта
              </div>
              <div className="flex-1 py-3 px-6 text-left text-slate-200 font-bold text-base">
                Дата начала
              </div>
              <div className="flex-1 py-3 px-6 text-left text-slate-200 font-bold text-base">
                Дедлайн
              </div>
              <div className="flex-1 py-3 px-6 text-left text-slate-200 font-bold text-base">
                Ответственный
              </div>
              <div className="flex-[1.2] py-3 px-6 text-center text-slate-200 font-bold text-base">
                Статус
              </div>
            </div>
            <div
              className="flex flex-row items-center rounded-b-2xl"
              style={{
                background: "linear-gradient(90deg, #4f3568 0%, #33294a 100%)",
                borderBottomLeftRadius: "16px",
                borderBottomRightRadius: "16px",
                border: "none",
                minHeight: 60,
                boxShadow: "0 4px 24px #0002",
                borderTop: "2px solid #a389bb22",
                borderBottom: "2px solid #a389bb22",
                transition: "background 0.2s",
              }}
            >
              <div className="flex-1 py-4 px-6 bg-transparent text-white text-base font-mono flex items-center">
                № {order.id}
              </div>
              <div className="flex-[2.2] py-4 px-6 bg-transparent text-white flex flex-col justify-center leading-tight">
                <div
                  className="font-normal text-[1.05rem]"
                  style={{ lineHeight: "1.18" }}
                >
                  {order.product}
                </div>
              </div>
              <div className="flex-1 py-4 px-6 bg-transparent text-white text-base flex items-center">
                {order.startDate}
              </div>
              <div className="flex-1 py-4 px-6 bg-transparent text-white text-base flex items-center">
                {order.deadline}
              </div>
              <div className="flex-1 py-4 px-6 bg-transparent text-white text-base flex items-center">
                {order.responsible}
              </div>
              <div className="flex-[1.2] py-2 px-6 bg-transparent flex items-center justify-center">
                <div
                  style={{
                    width: "120px",
                    height: "38px",
                    background: getProgressGradient(),
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "1.65rem",
                    color: "#fff",
                    boxShadow: "0 2px 8px #0002",
                    letterSpacing: "1px",
                    position: "relative",
                    lineHeight: 1,
                  }}
                >
                  {projectProgress}
                  <span
                    style={{
                      fontSize: "1.1rem",
                      marginLeft: 4,
                      color: "#fff",
                      fontWeight: 400,
                      textShadow: "0 0 4px #a20",
                      lineHeight: 1,
                    }}
                  >
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* --- Заголовок --- */}
          <div
            className="text-[27px] text-white font-medium mb-6 ml-2 tracking-wide"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Заказ на производство
          </div>

          {/* --- Список подзаказов --- */}
          <div className="flex flex-col gap-5">
            {order.subOrders && order.subOrders.length > 0 ? (
              order.subOrders.map((sub) => (
                <div key={sub.id} className="w-full">
                  {/* Header */}
                  <div className="flex justify-between mb-0">
                    {columns.map((col, i) => (
                      <div
                        key={col.title}
                        className={`rounded-t-lg flex items-center justify-center bg-[#746487] text-white text-[15px] font-medium`}
                        style={{
                          width: col.w,
                          height: `${cellHeight}px`,
                          ...(i === 0 && { borderTopLeftRadius: 10 }),
                          ...(i === columns.length - 1 && { borderTopRightRadius: 10 }),
                        }}
                      >
                        {col.title}
                      </div>
                    ))}
                  </div>
                  {/* Row */}
                  <div
                    className="flex justify-between"
                    style={{
                      height: `${cellHeight}px`,
                      boxShadow: "0 1px 8px 0 rgba(0,0,0,0.06)",
                      marginTop: 0,
                      marginBottom: 0,
                      overflow: "hidden",
                    }}
                  >
                    <Link
                      to={`/order/${sub.id}`}
                      className="rounded-b-lg flex items-center justify-center bg-[#e6e6e6] text-black text-[17px] font-bold underline hover:text-violet-600 transition-all duration-100"
                      style={{
                        width: columns[0].w,
                        height: "100%",
                        textDecorationThickness: "2px",
                      }}
                    >
                      {sub.id}
                    </Link>
                    <div
                      className="rounded-b-lg flex items-center bg-[#e6e6e6] text-black text-[16px] px-3"
                      style={{
                        width: columns[1].w,
                        height: "100%",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {sub.product}
                    </div>
                    <div
                      className="rounded-b-lg flex items-center justify-center bg-[#e6e6e6] text-black text-[16px]"
                      style={{ width: columns[2].w, height: "100%" }}
                    >
                      {sub.startDate}
                    </div>
                    <div
                      className="rounded-b-lg flex items-center justify-center bg-[#e6e6e6] text-black text-[16px]"
                      style={{ width: columns[3].w, height: "100%" }}
                    >
                      {sub.deadline}
                    </div>
                    <div
                      className="rounded-b-lg flex items-center justify-center bg-[#e6e6e6] text-black text-[16px]"
                      style={{ width: columns[4].w, height: "100%" }}
                    >
                      {sub.responsible}
                    </div>
                    <div
                      style={{
                        width: columns[5].w,
                        height: "100%",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "stretch",
                      }}
                    >
                      <ProgressBar percent={Number(sub.progress) || 0} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 pl-2">Подзаказы отсутствуют</div>
            )}
          </div>

          {/* --- Кнопка --- */}
          <div
            onClick={() => setShowCreateSubOrder(true)}
            className="text-[17px] text-white font-medium underline cursor-pointer hover:text-violet-400 mt-8 ml-2"
          >
            Добавить заказ
          </div>
        </div>
      </main>
    </div>
  );
}
