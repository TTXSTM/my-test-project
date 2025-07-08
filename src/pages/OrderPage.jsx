import React from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../OrdersContext";

export default function OrderPage() {
  const { orders, setOrders } = useOrders();
  const navigate = useNavigate();

  // Состояния для полей формы
  const [id, setId] = useState("");
  const [product, setProduct] = useState("");
  const [deadline, setDeadline] = useState("");
  const [progress, setProgress] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setOrders([
      ...orders,
      {
        id,
        product,
        deadline,
        progress: Number(progress),
        subOrders: [],
      },
    ]);
    navigate("/dashboard"); // редирект на таблицу
  };

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center pt-10">
      {/* Top menu */}
      <nav className="w-full max-w-5xl flex justify-center gap-10 mb-8">
        {["Проекты", "Планирование", "Маршрутная карта", "Оборудование"].map((item, idx) => (
            <a
            key={idx}
            href="#"
            className="
                text-white text-2xl font-normal font-[Inter]
                transition duration-200
                hover:text-violet-400
                hover:scale-110
                active:text-violet-600
            "
            >
            {item}
            </a>
        ))}
        </nav>

      {/* Form Card */}
      <div className="w-full max-w-4xl bg-white rounded-tl-2xl rounded-tr-2xl shadow-xl p-10">
        <form onSubmit={handleSubmit}>
          <h1 className="text-center text-3xl font-bold mb-8 font-[Inter]">Заказ на производство</h1>
          <div className="flex flex-col gap-9">
            <div className="flex gap-6">
              <div className="relative group">
                <input
                    placeholder="Номер проекта"
                    value={id}
                    onChange={e => setId(e.target.value)}
                    className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-11 px-4 text-stone-300 text-xl font-[Macondo_Swash_Caps] w-full"
                />
                <div
                    className="
                    opacity-0 pointer-events-none
                    absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded
                    shadow transition-all duration-200 z-10
                    group-hover:opacity-100
                    "
                >
                    Номер проекта
                </div>
                </div>
              <div className="flex-1 flex flex-col">
                <div className="relative group w-full">
                <input
                    placeholder="Плановый срок отгрузки"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className=" focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-11 px-4 text-stone-300 text-xl font-[Macondo_Swash_Caps] w-full"
                />
                <div
                    className="
                    opacity-0 pointer-events-none
                    absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded
                    shadow transition-all duration-200 z-10
                    group-hover:opacity-100
                    "
                >
                    Плановый срок отгрузки
                </div>
                </div>
              </div>
            </div>
            <div>
                <div className="relative group">
                    <input placeholder="Наименование изделия"
                    value={product}
                    onChange={e => setProduct(e.target.value)}
                    className=" focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-14 w-full px-4 text-stone-300 text-xl font-[Macondo_Swash_Caps]" />
                    <div
                    className="
                    opacity-0 pointer-events-none
                    absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded
                    shadow transition-all duration-200 z-10
                    group-hover:opacity-100
                    "
                >
                    Наименование изделия
                </div>
                </div>
            </div>
            <div>
                <div className="relative group">
                    <input placeholder="Заказчик" className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-14 w-full px-4 text-stone-300 text-xl font-[Macondo_Swash_Caps]" />
                <div
                    className="
                    opacity-0 pointer-events-none
                    absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded
                    shadow transition-all duration-200 z-10
                    group-hover:opacity-100
                    "
                >
                    Заказчик
                </div>
                </div>
            </div>
            <div>
            <div className="relative group">
              <input placeholder="Адрес объекта" className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-14 w-full px-4 text-stone-300 text-xl font-[Macondo_Swash_Caps]" />
                <div
                    className="
                    opacity-0 pointer-events-none
                    absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded
                    shadow transition-all duration-200 z-10
                    group-hover:opacity-100
                    "
                >
                    Адрес объекта
                </div>
            </div>
            </div>
            <div className="flex gap-6 justify-between">
                <div className="relative group">
                    <input placeholder="Ответственный" className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-11 flex-1 px-4 text-stone-300 text-xl font-[Macondo_Swash_Caps]" />
                <div
                    className="
                    opacity-0 pointer-events-none
                    absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded
                    shadow transition-all duration-200 z-10
                    group-hover:opacity-100
                    "
                >
                    Ответственный
                </div>
                </div>
                <div className="relative group">
                    <input placeholder="Исполнитель" className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-11 flex-1 px-4 text-white text-xl font-[Macondo_Swash_Caps]" />
                <div
                    className="
                    opacity-0 pointer-events-none
                    absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded
                    shadow transition-all duration-200 z-10
                    group-hover:opacity-100
                    "
                >
                    Исполнитель
                </div>
                </div>
            </div>
          </div>

          {/* Состав заказа */}
          <h2 className="text-center text-2xl font-bold mt-12 mb-6 font-[Inter]">Состав заказа</h2>
          <div className="flex gap-6 mb-9">
            <input placeholder="Загрузить файл таблицы" className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-14 flex-1 px-4 text-stone-300 text-xl font-[Macondo_Swash_Caps]" />
            <button type="button" className="bg-slate-800 rounded-[5px] h-14 px-8 text-stone-300 text-xl font-[Macondo_Swash_Caps]">Загрузить</button>
          </div>
          {/* Таблица */}
          <div className="flex justify-between mb-9">
            <div className="relative group">
                <input placeholder="№ заказа" className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-11 px-4 text-stone-300 text-xl font-[Macondo_Swash_Caps]" />
                <div
                    className="
                    opacity-0 pointer-events-none
                    absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded
                    shadow transition-all duration-200 z-10
                    group-hover:opacity-100
                    "
                >
                    № заказа
                </div>
            </div>
            <div className="relative group">
                <input placeholder="Наименование" className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-11 px-4 text-stone-300 text-xl font-[Macondo_Swash_Caps]" />
                <div
                    className="
                    opacity-0 pointer-events-none
                    absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded
                    shadow transition-all duration-200 z-10
                    group-hover:opacity-100
                    "
                >
                    Наименование
                </div>
            </div>
            <div className="relative group">
                <input placeholder="Кол-во" className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-11 px-4 text-stone-300 text-xl font-[Macondo_Swash_Caps]" />
                <div
                    className="
                    opacity-0 pointer-events-none
                    absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded
                    shadow transition-all duration-200 z-10
                    group-hover:opacity-100
                    "
                >
                    Кол-во
                </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-11 px-4" />
            <input className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-11 px-4" />
          </div>
          {/* Button */}
          <div className="flex justify-center mt-10">
            <button
                type="submit"
                className="
                    bg-slate-800 w-[552px] h-24 rounded-2xl text-white text-3xl font-normal font-[Inter] cursor-pointer
                    transition duration-300
                    hover:bg-violet-600 hover:scale-105 hover:shadow-xl
                    active:scale-95 active:bg-violet-800
                "
                >
                Отправить и прейти в заказ
                </button>
          </div>
        </form>
      </div>
    </div>
  );
};

