// src/pages/Dashboard.jsx
import React from "react";
import { useOrders } from "../OrdersContext";

export default function Dashboard() {
  const { orders } = useOrders();

  return (
    <div className="min-h-screen bg-gray-800 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-slate-800 shadow-xl pt-10 px-4">
        <button className="w-full h-9 bg-stone-500 text-white mb-8 text-sm font-['JejuGothic'] rounded">поиск</button>
        <div className="w-64 h-56 bg-gray-900 rounded mb-8 flex items-center justify-center">
          {/* Здесь может быть pie chart, например через react-chartjs-2 */}
          <div className="w-44 h-44 bg-green-900 rounded-full relative" />
          <div className="w-44 h-44 bg-slate-700 rounded-full absolute top-0 left-0 opacity-40" />
        </div>
        <div className="w-64 h-8 bg-purple-950 text-white text-sm flex items-center justify-center rounded-t">Оперативный чат</div>
        <div className="w-64 h-96 bg-gray-900 rounded">
          {/* Чат или заглушка */}
          <div className="w-56 h-36 bg-zinc-800 m-4 rounded" />
        </div>
      </aside>
      {/* Main table */}
      <main className="flex-1 pt-10 pl-10">
        <nav className="flex gap-8 mb-8">
          {["Проекты", "Планирование", "Маршрутная карта", "Оборудование"].map((item, idx) => (
            <a key={idx} href="#" className="text-white text-2xl underline font-['JejuGothic']">{item}</a>
          ))}
        </nav>
        {/* Table headers */}
        <div className="flex gap-8 mb-4">
          <div className="w-44 text-center text-white text-2xl font-['JejuGothic']">№ заказа</div>
          <div className="w-[509px] text-center text-white text-2xl font-['JejuGothic']">Наименование изделие</div>
          <div className="w-44 text-center text-white text-2xl font-['JejuGothic']">Дедлайн</div>
        </div>
        {/* Orders list */}
        {orders.map((order, idx) => (
          <div key={idx} className="flex gap-8 mb-2">
            <div className="w-44 h-9 bg-stone-500 text-center flex items-center justify-center text-white text-base font-['JejuGothic'] underline">{order.id}</div>
            <div className="w-[509px] h-9 bg-stone-500 text-center flex items-center justify-center text-white text-base font-['Inter']">{order.product}</div>
            <div className="w-44 h-9 bg-stone-500 text-center flex items-center justify-center text-white text-base font-['Inter']">{order.deadline}</div>
            <div className="w-48 h-9 bg-gradient-to-r from-green-700 to-yellow-400 text-center flex items-center justify-center text-white text-xl font-['Inter']">{order.progress}%</div>
          </div>
        ))}
      </main>
    </div>
  );
}
