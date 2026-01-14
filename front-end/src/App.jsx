import { Route, Routes } from 'react-router'
import CheckoutPage from './pages/checkout.jsx'
import HomePage from './pages/home.jsx'
import OrdersPage from './pages/orders.jsx'
function App() {
  return (
    <>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Routes>
    </>
  )
}

export default App
