import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialTouched = {
  product: false,
  startDate: false,
  deadline: false,
  responsible: false,
  executors: false,
  customer: false,
  address: false,
};

const API_PROJECTS = "http://localhost:3001/api/projects";

const OrderPage = () => {
  const navigate = useNavigate();

  // Все поля
  const [product, setProduct] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [responsible, setResponsible] = useState("");
  const [executors, setExecutors] = useState("");
  const [customer, setCustomer] = useState(""); // если нужно в БД
  const [address, setAddress] = useState("");   // если нужно в БД

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(initialTouched);
  const [submitted, setSubmitted] = useState(false);

  function validate(fields) {
    const { product, startDate, deadline, responsible, executors, customer, address } = fields;
    const newErrors = {};
    if (!product || !/^[\wа-яА-ЯёЁ\s.,;:()'"№\-–—]+$/i.test(product))
      newErrors.product = "Наименование — только буквы, цифры и символы";
    if (!startDate) newErrors.startDate = "Укажите дату начала";
    if (!deadline) newErrors.deadline = "Укажите дедлайн";
    if (!responsible || !/^[а-яё\s]+$/i.test(responsible))
      newErrors.responsible = "Ответственный — только кириллица";
    if (executors && !/^[а-яё\s]+$/i.test(executors))
      newErrors.executors = "Исполнители — только кириллица";
    if (customer && customer.length < 2)
      newErrors.customer = "Слишком короткое имя заказчика";
    if (address && address.length < 5)
      newErrors.address = "Адрес слишком короткий";
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
      product,
      startDate,
      deadline,
      responsible,
      executors,
      customer,
      address,
      [name]: e.target.value,
    };
    setErrors(validate(allFields));
  };

  // Сабмит — сохраняем в БД, переходим по insertId
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const allFields = { product, startDate, deadline, responsible, executors, customer, address };
    const validateErrors = validate(allFields);

    // Проверяем заполненность
    const required = ["product", "startDate", "deadline", "responsible"];
    required.forEach((key) => {
      if (!allFields[key]) validateErrors[key] = "Это поле обязательно";
    });

    setErrors(validateErrors);

    if (Object.keys(validateErrors).length > 0) {
      setTouched((prev) =>
        Object.fromEntries(Object.keys(prev).map((key) => [key, true]))
      );
      return;
    }

    try {
      const res = await fetch(API_PROJECTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          startDate,
          deadline,
          responsible,
          status: "В работе",
          executors,
        }),
      });
      const data = await res.json();
      if (data && data.id) {
        navigate(`/project/${data.id}`);
      } else {
        alert("Ошибка создания заказа");
      }
    } catch (err) {
      alert("Ошибка отправки запроса: " + err.message);
    }
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
              <div className="relative group flex-1">
                <input
                  placeholder="Наименование изделия"
                  value={product}
                  onChange={handleChange(setProduct, "product")}
                  onBlur={() => handleTouched("product")}
                  className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-11 px-4 text-stone-300 text-xl font-[Inter] w-full"
                  required
                />
                {showError("product") && <div className="text-red-500 text-xs mt-1">{errors.product}</div>}
                <div className="opacity-0 pointer-events-none absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded shadow transition-all duration-200 z-10 group-hover:opacity-100">Наименование изделия</div>
              </div>
              <div className="relative group flex-1">
                <input
                  placeholder="Дата начала"
                  type="date"
                  value={startDate}
                  onChange={handleChange(setStartDate, "startDate")}
                  onBlur={() => handleTouched("startDate")}
                  className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-11 px-4 text-stone-300 text-xl font-[Inter] w-full"
                  required
                />
                {showError("startDate") && <div className="text-red-500 text-xs mt-1">{errors.startDate}</div>}
                <div className="opacity-0 pointer-events-none absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded shadow transition-all duration-200 z-10 group-hover:opacity-100">Дата начала</div>
              </div>
              <div className="relative group flex-1">
                <input
                  placeholder="Дедлайн"
                  type="date"
                  value={deadline}
                  onChange={handleChange(setDeadline, "deadline")}
                  onBlur={() => handleTouched("deadline")}
                  className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-11 px-4 text-stone-300 text-xl font-[Inter] w-full"
                  required
                />
                {showError("deadline") && <div className="text-red-500 text-xs mt-1">{errors.deadline}</div>}
                <div className="opacity-0 pointer-events-none absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded shadow transition-all duration-200 z-10 group-hover:opacity-100">Дедлайн</div>
              </div>
            </div>
            <div className="flex gap-6 justify-between">
              <div className="relative group flex-1">
                <input
                  placeholder="Ответственный"
                  value={responsible}
                  onChange={handleChange(setResponsible, "responsible")}
                  onBlur={() => handleTouched("responsible")}
                  className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-11 flex-1 px-4 text-stone-300 text-xl font-[Inter]"
                  required
                />
                {showError("responsible") && <div className="text-red-500 text-xs mt-1">{errors.responsible}</div>}
                <div className="opacity-0 pointer-events-none absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded shadow transition-all duration-200 z-10 group-hover:opacity-100">Ответственный</div>
              </div>
              <div className="relative group flex-1">
                <input
                  placeholder="Исполнители"
                  value={executors}
                  onChange={handleChange(setExecutors, "executors")}
                  onBlur={() => handleTouched("executors")}
                  className="focus:outline-violet-600 bg-slate-800 border border-black rounded-[5px] h-11 flex-1 px-4 text-white text-xl font-[Inter]"
                />
                {showError("executors") && <div className="text-red-500 text-xs mt-1">{errors.executors}</div>}
                <div className="opacity-0 pointer-events-none absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded shadow transition-all duration-200 z-10 group-hover:opacity-100">Исполнители</div>
              </div>
            </div>
            {/* Можешь добавить дополнительные поля customer/address если хочешь */}
          </div>
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
              Отправить и перейти в заказ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderPage;
