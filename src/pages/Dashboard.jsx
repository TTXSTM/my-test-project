import React from "react";
import { useOrders } from "../OrdersContext";

export default function Dashboard() {
  const { orders } = useOrders();

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="
        w-full md:w-80 bg-slate-800 shadow-xl pt-6 px-3 flex-shrink-0
        flex flex-col items-center
      ">
        <button className="
          w-full h-9 bg-stone-500 text-white mb-6 text-sm font-['JejuGothic'] rounded
          hover:bg-stone-600 transition
        ">
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
        <nav className="
          flex flex-wrap gap-4 md:gap-8 mb-6 md:mb-8 justify-center 
        ">
          {["Проекты", "Планирование", "Маршрутная карта", "Оборудование"].map((item, idx) => (
            <a key={idx}
              href="#"
              className="
                text-white text-base md:text-2xl font-['Inter']
                hover:text-violet-400 transition
              "
            >{item}</a>
          ))}
        </nav>
        {/* Table headers */}
        <div className="hidden md:flex gap-4 md:gap-8 mb-4 w-full">
          <div className="flex-1 text-center text-white text-2xl font-['Inter']">
            № заказа
          </div>
          <div className="flex-[2] text-center text-white text-2xl font-['Inter']">
            Наименование изделие
          </div>
          <div className="flex-[1.5] text-center text-white text-2xl font-['Inter']">
            Дедлайн
          </div>
        </div>
        {/* Orders list */}
        <div className="space-y-2 w-full">
          {orders.map((order, idx) => (
            <div
              key={idx}
              className="
                flex flex-col md:flex-row gap-2 md:gap-4 mb-2 bg-transparent md:bg-transparent
                rounded-md p-2 md:p-0 justify-between w-full
              "
            >
              {/* № заказа */}
              <div className="
                flex-1 h-9 bg-stone-500 text-center flex items-center justify-center
                text-white text-base font-['JejuGothic'] underline rounded md:rounded-none
              ">
                {order.id}
              </div>
              {/* Наименование изделие */}
              <div className="
                flex-[2] h-9 bg-stone-500 text-center flex items-center justify-center
                text-white text-base font-['Inter'] rounded md:rounded-none
              ">
                {order.product}
              </div>
              {/* Дедлайн + Прогресс */}
              <div className="flex flex-[1.5] min-w-0 h-9">
                {/* Deadline */}
                <div className="
                  flex-[1] h-full bg-stone-500 text-center flex items-center justify-center
                  text-white text-base font-['Inter'] rounded-l
                ">
                  {order.deadline}
                </div>
                {/* Progress Bar */}
                <div className="
                  flex-[1] h-full bg-gradient-to-r from-green-700 via-yellow-400 to-yellow-400
                  text-center flex items-center justify-center text-white text-xl font-['Inter']
                  rounded-r
                ">
                  {order.progress}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
