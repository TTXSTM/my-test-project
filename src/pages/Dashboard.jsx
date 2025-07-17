import React, { useState, useRef, useEffect } from "react";
import { useOrders } from "../OrdersContext";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";

// Получение градиента для прогресс-бара
const getProgressGradient = () =>
  "linear-gradient(90deg, #13d110 0%, #ffe600 55%, #d90000 100%)";

// Считает средний прогресс по подзаказам (0..100)
function calcProjectProgress(subOrders = []) {
  if (!subOrders.length) return 0;
  const sum = subOrders.reduce((acc, sub) => acc + (Number(sub.progress) || 0), 0);
  return Math.round(sum / subOrders.length);
}

// Считает средний прогресс по всем проектам
function calcAllProjectsProgress(orders = []) {
  if (!orders.length) return 0;
  const sum = orders.reduce(
    (acc, order) => acc + calcProjectProgress(order.subOrders),
    0
  );
  return Math.round(sum / orders.length);
}

export default function Dashboard() {
  const { orders, setOrders } = useOrders();
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [openedOrderId, setOpenedOrderId] = useState(null);
  const [newOrder, setNewOrder] = useState({
    id: "",
    product: "",
    startDate: "",
    deadline: "",
    responsible: "",
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
      status: "В работе",
      subOrders: [],
    });
    setShowCreateProject(false);
  };

  // --- Рендер строки подзаказа
  const renderSubOrder = (sub) => (
    <div
      key={sub.id}
      className="flex flex-row items-center"
      style={{
        background: "#ece9f7",
        color: "#232537",
        fontSize: "15px",
        borderRadius: 9,
        marginBottom: 5,
        marginTop: 2,
        boxShadow: "0 1px 5px #0001",
        minHeight: 32,
      }}
    >
      <div className="flex-1 px-4 py-2">
        <Link to={`/order/${sub.id}`} className="underline hover:text-[#955cff]">
          {sub.id}
        </Link>
      </div>
      <div className="flex-[2.2] px-4 py-2">{sub.product}</div>
      <div className="flex-1 px-4 py-2">{sub.startDate}</div>
      <div className="flex-1 px-4 py-2">{sub.deadline}</div>
      <div className="flex-1 px-4 py-2">{sub.responsible}</div>
      <div className="flex-[1.2] px-4 py-2 flex items-center">
        <div
          style={{
            minWidth: 65,
            height: 26,
            background: getProgressGradient(),
            borderRadius: 7,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 16,
            color: "#232537",
            boxShadow: "0 1px 3px #0001",
          }}
        >
          {sub.progress || 0}%
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#262537] flex flex-col md:flex-row">
      {/* Sidebar с пайчартом по всем проектам */}
      <Sidebar
        navOpen={navOpen}
        setNavOpen={setNavOpen}
        progressPercent={calcAllProjectsProgress(orders)}
      />
      <main className="flex-1 py-10 px-2 md:px-8 bg-[#262537] min-h-screen w-full">
        <div className="mx-auto space-y-8 w-full">
          {visibleOrders.map((order) => (
            <div key={order.id} className="space-y-0">
              <div
                className="flex flex-row w-full rounded-t-2xl overflow-hidden"
                style={{
                  background: "#35404A",
                  opacity: 1,
                  borderTopLeftRadius: "16px",
                  borderTopRightRadius: "16px",
                }}
              >
                <div className="flex-1 py-3 px-6 text-left text-slate-200 font-bold text-base" style={{letterSpacing: "0.02em"}}>
                  № Проекта
                </div>
                <div className="flex-[2.2] py-3 px-6 text-left text-slate-200 font-bold text-base">
                  Наименование проекта
                </div>
                <div className="flex-1 py-3 px-6 text-left text-slate-200 font-bold text-base">Дата начала</div>
                <div className="flex-1 py-3 px-6 text-left text-slate-200 font-bold text-base">Дедлайн</div>
                <div className="flex-1 py-3 px-6 text-left text-slate-200 font-bold text-base">Ответственный</div>
                <div className="flex-[1.2] py-3 px-6 text-center text-slate-200 font-bold text-base">Статус</div>
              </div>
              <div
                className="flex flex-row items-center rounded-b-2xl cursor-pointer"
                style={{
                  background: "linear-gradient(90deg, #4f3568 0%, #33294a 100%)",
                  borderBottomLeftRadius: "16px",
                  borderBottomRightRadius: "16px",
                  border: "none",
                  marginBottom: 8,
                  minHeight: 60,
                  boxShadow: "0 4px 24px #0002",
                  borderTop: "2px solid #a389bb22",
                  borderBottom: "2px solid #a389bb22",
                  transition: "background 0.2s",
                }}
                onClick={() => setOpenedOrderId(openedOrderId === order.id ? null : order.id)}
                title="Показать/скрыть подзаказы"
              >
                <div className="flex-1 py-4 px-6 bg-transparent text-white text-base font-mono flex items-center">
                  <Link
                    to={`/project/${order.id}`}
                    className="underline hover:text-[#a08cff] transition"
                    onClick={e => e.stopPropagation()}
                  >
                    № {order.id}
                  </Link>
                </div>
                <div className="flex-[2.2] py-4 px-6 bg-transparent text-white flex flex-col justify-center leading-tight">
                  <div className="font-normal text-[1.05rem]" style={{ lineHeight: "1.18" }}>
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
                    {calcProjectProgress(order.subOrders)}
                    <span style={{
                        fontSize: "1.1rem",
                        marginLeft: 4,
                        color: "#fff",
                        fontWeight: 400,
                        textShadow: "0 0 4px #a20",
                        lineHeight: 1,
                      }}>%</span>
                  </div>
                </div>
              </div>
              {openedOrderId === order.id && order.subOrders && order.subOrders.length > 0 && (
                <div className="px-3 py-4">
                  <div className="flex flex-row w-full mb-2" style={{
                    background: "#7f6d9c", color: "#e9e9e9", borderRadius: 8, fontWeight: 600, fontSize: 14
                  }}>
                    <div className="flex-1 px-4 py-2">№ заказа</div>
                    <div className="flex-[2.2] px-4 py-2">Наименование заказа</div>
                    <div className="flex-1 px-4 py-2">Дата начала</div>
                    <div className="flex-1 px-4 py-2">Дедлайн</div>
                    <div className="flex-1 px-4 py-2">Исполнитель</div>
                    <div className="flex-[1.2] px-4 py-2">Статус</div>
                  </div>
                  {order.subOrders.map(renderSubOrder)}
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-start mb-8">
            <button
              onClick={() => setShowCreateProject(true)}
              className="bg-[#172027] hover:bg-violet-800 text-white px-6 py-2 text-lg font-['Inter'] shadow rounded"
            >
              + Создать проект
            </button>
          </div>
        </div>
      </main>
      {/* --- Модалка создания проекта --- */}
      {showCreateProject && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <form
      onSubmit={handleCreateProject}
      className="bg-[#252433] p-8 rounded-3xl w-[700px] max-w-[96vw] flex flex-col gap-0 border border-[#83799b] shadow-2xl relative"
      style={{
        borderTopRightRadius: "18px",
        borderTopLeftRadius: "18px",
        borderBottomRightRadius: "24px",
        borderBottomLeftRadius: "24px",
      }}
    >
      <div className="text-center text-white font-semibold text-base tracking-wide mb-2">Номер заказа</div>
      <div className="flex justify-center mb-3">
        <input
          className="rounded-lg px-4 py-2 bg-[#292648]/60 text-white border border-[#83799b] focus:outline-none w-60 text-center shadow"
          value={newOrder.id}
          onChange={(e) => setNewOrder((o) => ({ ...o, id: e.target.value }))}
          required
        />
      </div>

      <div className="text-center text-white font-semibold text-base tracking-wide mb-2 mt-3">Наименование заказа</div>
      <div className="flex mb-6">
        <input
          className="rounded-lg px-4 py-2 bg-[#292648]/60 text-white border border-[#83799b] focus:outline-none w-full shadow"
          value={newOrder.product}
          onChange={(e) => setNewOrder((o) => ({ ...o, product: e.target.value }))}
          required
        />
      </div>

      <div className="flex gap-5 mb-6">
        <div className="flex-1">
          <div className="text-white text-sm font-medium mb-1">Ответственный</div>
          <input
            className="rounded-lg px-4 py-2 bg-[#292648]/60 text-white border border-[#83799b] focus:outline-none w-full shadow"
            value={newOrder.responsible}
            onChange={(e) => setNewOrder((o) => ({ ...o, responsible: e.target.value }))}
            required
          />
        </div>
        <div className="flex-1">
          <div className="text-white text-sm font-medium mb-1 text-right">Исполнители</div>
          <input
            className="rounded-lg px-4 py-2 bg-[#292648]/60 text-white border border-[#83799b] focus:outline-none w-full shadow"
            // тут можно завести отдельное поле, если надо
            value={newOrder.executors || ""}
            onChange={(e) => setNewOrder((o) => ({ ...o, executors: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex gap-5">
        <div className="flex-1">
          <div className="text-white text-sm font-medium mb-1">Взять в работу</div>
          <input
            className="rounded-lg px-4 py-2 bg-[#292648]/60 text-white border border-[#83799b] focus:outline-none w-full shadow"
            type="date"
            value={newOrder.startDate}
            onChange={(e) =>
              setNewOrder((o) => ({ ...o, startDate: e.target.value }))
            }
            required
          />
        </div>
        <div className="flex-1">
          <div className="text-white text-sm font-medium mb-1 text-right">Дата завершения</div>
          <input
            className="rounded-lg px-4 py-2 bg-[#292648]/60 text-white border border-[#83799b] focus:outline-none w-full shadow"
            type="date"
            value={newOrder.deadline}
            onChange={(e) =>
              setNewOrder((o) => ({ ...o, deadline: e.target.value }))
            }
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-7">
        <button
          type="submit"
          className="bg-violet-700 hover:bg-violet-800 text-white rounded px-7 py-2 text-base shadow font-medium"
        >
          Создать
        </button>
        <button
          type="button"
          className="text-gray-400 hover:text-red-400 text-base"
          onClick={() => setShowCreateProject(false)}
        >
          Отмена
        </button>
      </div>
    </form>
  </div>
)}
    </div>
  );
}
