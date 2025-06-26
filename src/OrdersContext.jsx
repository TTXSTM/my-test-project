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
      deadline: "27.06.2025",
      progress: 93,
      subOrders: [
        { id: "123-01", product: "Качели “Солнышко”", progress: 80, deadline: "2 КОМП-ТА" },
      ],
    },
  ]);
  return (
    <OrdersContext.Provider value={{ orders, setOrders }}>
      {children}
    </OrdersContext.Provider>
  );
}
