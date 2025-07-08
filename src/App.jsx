import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { OrdersProvider } from "./OrdersContext";
import OrderPage from "./pages/OrderPage";
import Dashboard from "./pages/Dashboard";
import './App.css'

function App() {

  return (
    <>
      <OrdersProvider>
      <Router>
        <Routes>
          <Route path="/" element={<OrderPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </OrdersProvider>
    </>
  )
}

export default App
