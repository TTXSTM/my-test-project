import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { OrdersProvider } from "./OrdersContext";
import OrderPage from "./pages/OrderPage";
import Dashboard from "./pages/Dashboard";
import OrderTaskPage from "./pages/OrderTaskPage";
import './App.css'

function App() {

  return (
    <>
      <OrdersProvider>
        <Router>
          <Routes>
            <Route path="/" element={<OrderPage />} />
            <Route path="/order/:taskId" element={<OrderTaskPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Router>
      </OrdersProvider>
    </>
  )
}

export default App
