import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { OrdersProvider } from "./OrdersContext";
import OrderPage from "./pages/OrderPage";
import Dashboard from "./pages/Dashboard";
import OrderTaskPage from "./pages/OrderTaskPage";
import DispatcherPage from "./pages/DispatcherPage";
import ProjectPage from "./pages/ProjectPage";
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
            <Route path="/dispatcher" element={<DispatcherPage />} />
            <Route path="/project/:id" element={<ProjectPage />} />
          </Routes>
        </Router>
      </OrdersProvider>
    </>
  )
}

export default App
