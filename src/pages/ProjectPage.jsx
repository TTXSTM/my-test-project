import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useOrders } from "../OrdersContext";
import Sidebar from "../Sidebar";

const getProgressGradient = () =>
  "linear-gradient(90deg, #13d110 0%, #ffe600 55%, #d90000 100%)";

function ProgressBar({ percent }) {
  return (
    <div
      className="w-full h-[32px] flex items-center justify-center rounded-lg"
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

  // Только цифры для id
  function handleIdChange(e) {
    const val = e.target.value.replace(/\D/g, "");
    setNewSubOrder((o) => ({ ...o, id: val }));
  }

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
                  progress: 0,
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
      {/* Sidebar */}
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
          value={newSubOrder.id}
          onChange={handleIdChange}
          required
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={8}
          title="Введите только цифры"
        />
      </div>

      <div className="text-center text-white font-semibold text-base tracking-wide mb-2 mt-3">Наименование заказа</div>
      <div className="flex mb-6">
        <input
          className="rounded-lg px-4 py-2 bg-[#292648]/60 text-white border border-[#83799b] focus:outline-none w-full shadow"
          value={newSubOrder.product}
          onChange={e => setNewSubOrder(o => ({ ...o, product: e.target.value }))}
          required
        />
      </div>

      <div className="flex gap-5 mb-6">
        <div className="flex-1">
          <div className="text-white text-sm font-medium mb-1">Ответственный</div>
          <input
            className="rounded-lg px-4 py-2 bg-[#292648]/60 text-white border border-[#83799b] focus:outline-none w-full shadow"
            value={newSubOrder.responsible}
            onChange={e => setNewSubOrder(o => ({ ...o, responsible: e.target.value }))}
            required
          />
        </div>
        <div className="flex-1">
          <div className="text-white text-sm font-medium mb-1 text-right">Исполнители</div>
          <input
            className="rounded-lg px-4 py-2 bg-[#292648]/60 text-white border border-[#83799b] focus:outline-none w-full shadow"
            value={newSubOrder.executors || ""}
            onChange={e => setNewSubOrder(o => ({ ...o, executors: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex gap-5">
        <div className="flex-1">
          <div className="text-white text-sm font-medium mb-1">Взять в работу</div>
          <input
            className="rounded-lg px-4 py-2 bg-[#292648]/60 text-white border border-[#83799b] focus:outline-none w-full shadow"
            type="date"
            value={newSubOrder.startDate}
            onChange={e => setNewSubOrder(o => ({ ...o, startDate: e.target.value }))}
            required
          />
        </div>
        <div className="flex-1">
          <div className="text-white text-sm font-medium mb-1 text-right">Дата завершения</div>
          <input
            className="rounded-lg px-4 py-2 bg-[#292648]/60 text-white border border-[#83799b] focus:outline-none w-full shadow"
            type="date"
            value={newSubOrder.deadline}
            onChange={e => setNewSubOrder(o => ({ ...o, deadline: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-7">
        <button
          type="submit"
          className="bg-violet-700 hover:bg-violet-800 text-white rounded px-7 py-2 text-base shadow font-medium"
        >
          Добавить
        </button>
        <button
          type="button"
          className="text-gray-400 hover:text-red-400 text-base"
          onClick={() => setShowCreateSubOrder(false)}
        >
          Отмена
        </button>
      </div>
    </form>
  </div>
      )}


      <main className="flex-1 py-10 px-2 md:px-10 bg-[#262537] min-h-screen">
        <div className="mx-auto w-full">
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
              <div className="flex-1 py-3 px-6 text-left text-slate-200 font-bold text-base">
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
          <div className="flex flex-col gap-4 w-full">
            {order.subOrders && order.subOrders.length > 0 ? (
              order.subOrders.map((sub) => (
                <div key={sub.id} className="flex flex-col w-full">
                  {/* Header */}
                  <div className="flex bg-[#746487] text-white text-[15px] font-medium rounded-t-lg overflow-hidden">
                    <div className="flex-1 py-2 px-3 text-center">№ заказа</div>
                    <div className="flex-[2.3] py-2 px-3 text-center">Наименование заказа</div>
                    <div className="flex-1 py-2 px-3 text-center">Дата начала</div>
                    <div className="flex-1 py-2 px-3 text-center">Дедлайн</div>
                    <div className="flex-1 py-2 px-3 text-center">Исполнитель</div>
                    <div className="flex-1 py-2 px-3 text-center">Прогресс</div>
                  </div>
                  {/* Row */}
                  <div className="flex bg-[#f2f2f2] rounded-b-lg overflow-hidden min-h-[38px]">
                    <Link
                      to={`/order/${sub.id}`}
                      className="flex-1 py-2 px-3 text-center text-black font-bold underline hover:text-violet-600"
                      style={{ textDecorationThickness: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                      title={sub.id}
                    >
                      {sub.id}
                    </Link>
                    <div
                      className="flex-[2.3] py-2 px-3 text-center text-black"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={sub.product}
                    >
                      {sub.product}
                    </div>
                    <div className="flex-1 py-2 px-3 text-center text-black" style={{
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                      }} title={sub.startDate}>{sub.startDate}</div>
                    <div className="flex-1 py-2 px-3 text-center text-black" style={{
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                      }} title={sub.deadline}>{sub.deadline}</div>
                    <div className="flex-1 py-2 px-3 text-center text-black" style={{
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                      }} title={sub.responsible}>{sub.responsible}</div>
                    <div className="flex-1 py-2 px-3 flex items-center justify-center">
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
