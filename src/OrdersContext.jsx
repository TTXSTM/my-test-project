// src/OrdersContext.jsx
import React, { createContext, useState, useContext } from "react";

const OrdersContext = createContext();
export const useOrders = () => useContext(OrdersContext);

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([
    // Пример заказа по макету:
    {
      id: "123",
      product: "Обустройство детской площадки",
      startDate: "2023-06-19",
      deadline: "27.06.2025",
      responsible: "Серега",
      progress: 93,
      status: "В работе",
      subOrders: [
        { id: "123-01",
          product: "Качели “Солнышко“",
          startDate: "04.07.2025",
          deadline: "05.07.2025",
          responsible: "Серега",
          progress: 80, 
        },
      ],
    },
  ]);
  return (
    <OrdersContext.Provider value={{ orders, setOrders }}>
      {children}
    </OrdersContext.Provider>
  );
}
