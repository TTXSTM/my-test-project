import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../OrdersContext";

const initialTouched = {
  id: false,
  deadline: false,
  product: false,
  customer: false,
  address: false,
  responsible: false,
  executor: false,
  subId: false,
  subProduct: false,
  subDeadline: false,
};

const OrderPage = () => {
  const { orders, setOrders } = useOrders();
  const navigate = useNavigate();

  // Все поля
  const [id, setId] = useState("");
  const [product, setProduct] = useState("");
  const [deadline, setDeadline] = useState("");
  const [progress, setProgress] = useState(0);
  const [customer, setCustomer] = useState("");
  const [address, setAddress] = useState("");
  const [responsible, setResponsible] = useState("");
  const [executor, setExecutor] = useState("");
  const [subId, setSubId] = useState("");
  const [subProduct, setSubProduct] = useState("");
  const [subDeadline, setSubDeadline] = useState("");
  const [subProgress, setSubProgress] = useState("");

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(initialTouched);
  const [submitted, setSubmitted] = useState(false);

  function validate(fields) {
    const {
      id,
      deadline,
      product,
      customer,
      address,
      responsible,
      executor,
      subId,
      subProduct,
      subDeadline,
    } = fields;
    const newErrors = {};

    if (id && !/^\d+$/.test(id)) newErrors.id = "Номер проекта — только цифры";
    if (deadline && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(deadline))
      newErrors.deadline = "Плановый срок — выберите дату и время";
    if (product && !/^[\wа-яА-ЯёЁ\s.,;:()'"№\-–—]+$/i.test(product))
      newErrors.product = "Наименование изделия — только буквы, цифры и символы";
    if (customer && !/^[\wа-яА-ЯёЁ\s.,;:()'"№\-–—]+$/i.test(customer))
      newErrors.customer = "Заказчик — только буквы, цифры и символы";
    if (address && address.length < 5)
      newErrors.address = "Адрес слишком короткий";
    if (responsible && !/^[а-яё\s]+$/i.test(responsible))
      newErrors.responsible = "Ответственный — только кириллица";
    if (executor && !/^[а-яё\s]+$/i.test(executor))
      newErrors.executor = "Исполнитель — только кириллица";
    if (subId && !new RegExp(`^${id || "\\d+"}-\\d{3}$`).test(subId))
      newErrors.subId = `№ заказа — в формате ${id || "xxx"}-001`;
    if (subProduct && !/^[\wа-яА-ЯёЁ\s.,;:()'"№\-–—]+$/i.test(subProduct))
      newErrors.subProduct = "Наименование — только буквы, цифры и символы";
    if (subDeadline && !/^\d+$/.test(subDeadline))
      newErrors.subDeadline = "Кол-во — только цифры";
    return newErrors;
  }

  // Для всех обработчиков: помечаем поле как touched
  const handleTouched = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleChange = (setter, name) => (e) => {
    setter(e.target.value);
    handleTouched(name);
    const allFields = {
      id,
      deadline,
      product,
      customer,
      address,
      responsible,
      executor,
      subId,
      subProduct,
      subDeadline,
      [name]: e.target.value,
    };
    setErrors(validate(allFields));
  };

  // Сабмит
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const allFields = {
      id,
      deadline,
      product,
      customer,
      address,
      responsible,
      executor,
      subId,
      subProduct,
      subDeadline,
    };
    const validateErrors = validate(allFields);

    // Проверяем заполненность
    const required = [
      "id",
      "deadline",
      "product",
      "customer",
      "address",
      "responsible",
      "executor",
      "subId",
      "subProduct",
      "subDeadline",
    ];
    required.forEach((key) => {
      if (!allFields[key]) validateErrors[key] = "Это поле обязательно";
    });

    setErrors(validateErrors);

    if (Object.keys(validateErrors).length > 0) {
      setTouched((prev) =>
        Object.fromEntries(
          Object.keys(prev).map((key) => [key, true])
        )
      );
      return;
    }

    setOrders([
      ...orders,
      {
        id,
        product,
        deadline,
        progress: Number(progress),
        customer,
        address,
        responsible,
        executor,
        subOrders: [
          {
            id: subId,
            product: subProduct,
            deadline: subDeadline,
            progress: subProgress,
          },
        ],
      },
    ]);
    navigate("/dashboard");
  };

  // Показывать ошибку если поле тронуто или форма отправлена
  const showError = (name) => (touched[name] || submitted) && errors[name];

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center pt-10">
              <nav className="w-full max-w-5xl flex justify-center gap-10 mb-8">
        {["Проекты", "Планирование", "Маршрутная карта", "Оборудование"].map((item, idx) => (
          <a
            key={idx}
            href="/my-test-project/#/dashboard"
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
      <div className="w-full max-w-4xl bg-white rounded-tl-2xl rounded-tr-2xl shadow-xl p-10">
        <form onSubmit={handleSubmit}>
          <h1 className="text-center text-3xl font-bold mb-8 font-[Inter]">Заказ на производство</h1>
          <div className="flex flex-col gap-9">
            <div className="flex gap-6 justify-between">
              <div className="relative group">
                <input
                  placeholder="Номер проекта"
                  value={id}
                  onChange={handleChange(setId, "id")}
                  onBlur={() => handleTouched("id")}
                  className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-11 px-4 text-stone-300 text-xl font-[Inter] w-full"
                />
                {showError("id") && <div className="text-red-500 text-xs mt-1">{errors.id}</div>}
                <div className="opacity-0 pointer-events-none absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded shadow transition-all duration-200 z-10 group-hover:opacity-100">Номер проекта</div>
              </div>
              <div className="flex flex-col">
                <div className="relative group w-full">
                  <input
                    placeholder="Плановый срок отгрузки"
                    type="datetime-local"
                    value={deadline}
                    onChange={handleChange(setDeadline, "deadline")}
                    onBlur={() => handleTouched("deadline")}
                    className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-11 px-4 text-stone-300 text-xl font-[Inter] w-full"
                  />
                  {showError("deadline") && <div className="text-red-500 text-xs mt-1">{errors.deadline}</div>}
                  <div className="opacity-0 pointer-events-none absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded shadow transition-all duration-200 z-10 group-hover:opacity-100">Плановый срок отгрузки</div>
                </div>
              </div>
            </div>
            <div>
              <div className="relative group">
                <input
                  placeholder="Наименование изделия"
                  value={product}
                  onChange={handleChange(setProduct, "product")}
                  onBlur={() => handleTouched("product")}
                  className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-14 w-full px-4 text-stone-300 text-xl font-[Inter]"
                />
                {showError("product") && <div className="text-red-500 text-xs mt-1">{errors.product}</div>}
                <div className="opacity-0 pointer-events-none absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded shadow transition-all duration-200 z-10 group-hover:opacity-100">Наименование изделия</div>
              </div>
            </div>
            <div>
              <div className="relative group">
                <input
                  placeholder="Заказчик"
                  value={customer}
                  onChange={handleChange(setCustomer, "customer")}
                  onBlur={() => handleTouched("customer")}
                  className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-14 w-full px-4 text-stone-300 text-xl font-[Inter]"
                />
                {showError("customer") && <div className="text-red-500 text-xs mt-1">{errors.customer}</div>}
                <div className="opacity-0 pointer-events-none absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded shadow transition-all duration-200 z-10 group-hover:opacity-100">Заказчик</div>
              </div>
            </div>
            <div>
              <div className="relative group">
                <input
                  placeholder="Адрес объекта"
                  value={address}
                  onChange={handleChange(setAddress, "address")}
                  onBlur={() => handleTouched("address")}
                  className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-14 w-full px-4 text-stone-300 text-xl font-[Inter]"
                />
                {showError("address") && <div className="text-red-500 text-xs mt-1">{errors.address}</div>}
                <div className="opacity-0 pointer-events-none absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded shadow transition-all duration-200 z-10 group-hover:opacity-100">Адрес объекта</div>
              </div>
            </div>
            <div className="flex gap-6 justify-between">
              <div className="relative group">
                <input
                  placeholder="Ответственный"
                  value={responsible}
                  onChange={handleChange(setResponsible, "responsible")}
                  onBlur={() => handleTouched("responsible")}
                  className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-11 flex-1 px-4 text-stone-300 text-xl font-[Inter]"
                />
                {showError("responsible") && <div className="text-red-500 text-xs mt-1">{errors.responsible}</div>}
                <div className="opacity-0 pointer-events-none absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded shadow transition-all duration-200 z-10 group-hover:opacity-100">Ответственный</div>
              </div>
              <div className="relative group">
                <input
                  placeholder="Исполнитель"
                  value={executor}
                  onChange={handleChange(setExecutor, "executor")}
                  onBlur={() => handleTouched("executor")}
                  className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-11 flex-1 px-4 text-white text-xl font-[Inter]"
                />
                {showError("executor") && <div className="text-red-500 text-xs mt-1">{errors.executor}</div>}
                <div className="opacity-0 pointer-events-none absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded shadow transition-all duration-200 z-10 group-hover:opacity-100">Исполнитель</div>
              </div>
            </div>
          </div>

          {/* Состав заказа */}
          <h2 className="text-center text-2xl font-bold mt-12 mb-6 font-[Inter]">Состав заказа</h2>
          <div className="flex gap-6 mb-9">
            <input placeholder="Загрузить файл таблицы" className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-14 flex-1 px-4 text-stone-300 text-xl font-[Inter]" />
            <button type="button" className="bg-slate-800 rounded-[5px] h-14 px-8 text-stone-300 text-xl font-[Inter]">Загрузить</button>
          </div>
          <div className="flex justify-between mb-9">
            <div className="relative group">
              <input
                placeholder="№ заказа"
                value={subId}
                onChange={handleChange(setSubId, "subId")}
                onBlur={() => handleTouched("subId")}
                className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-11 px-4 text-stone-300 text-xl font-[Inter]"
              />
              {showError("subId") && <div className="text-red-500 text-xs mt-1">{errors.subId}</div>}
              <div className="opacity-0 pointer-events-none absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded shadow transition-all duration-200 z-10 group-hover:opacity-100">№ заказа</div>
            </div>
            <div className="relative group">
              <input
                placeholder="Наименование"
                value={subProduct}
                onChange={handleChange(setSubProduct, "subProduct")}
                onBlur={() => handleTouched("subProduct")}
                className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-11 px-4 text-stone-300 text-xl font-[Inter]"
              />
              {showError("subProduct") && <div className="text-red-500 text-xs mt-1">{errors.subProduct}</div>}
              <div className="opacity-0 pointer-events-none absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded shadow transition-all duration-200 z-10 group-hover:opacity-100">Наименование</div>
            </div>
            <div className="relative group">
              <input
                placeholder="Кол-во"
                value={subDeadline}
                onChange={handleChange(setSubDeadline, "subDeadline")}
                onBlur={() => handleTouched("subDeadline")}
                className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-11 px-4 text-stone-300 text-xl font-[Inter]"
              />
              {showError("subDeadline") && <div className="text-red-500 text-xs mt-1">{errors.subDeadline}</div>}
              <div className="opacity-0 pointer-events-none absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded shadow transition-all duration-200 z-10 group-hover:opacity-100">Кол-во</div>
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

export default OrderPage;
