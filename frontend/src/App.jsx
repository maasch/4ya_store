import { Route, Routes } from 'react-router'
import CheckoutPage from './pages/checkout/checkout.jsx'
import HomePage from './pages/home/home.jsx'
import OrdersPage from './pages/orders/orders.jsx'
import TrackingPage from './pages/tracking/tracking.jsx'
function App() {
  return (
    <>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
      </Routes>
    </>
  )
}

export default App
