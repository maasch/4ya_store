import axios from 'axios';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router';
import CheckoutPage from './pages/checkout/checkout.jsx';
import HomePage from './pages/home/home.jsx';
import OrdersPage from './pages/orders/orders.jsx';
import TrackingPage from './pages/tracking/tracking.jsx';
function App() {
  let [cart, setCart] = useState([]);
  async function loadCart() {
    let response = await axios.get('/api/cart-items?expand=product');
    setCart(response.data);
  }
  useEffect(() => {
    loadCart();
  }, []);
  return (
    <>
      <Routes>
        <Route index element={<HomePage cart={cart} loadCart={loadCart} />} />
        <Route path="/checkout" element={<CheckoutPage cart={cart} loadCart={loadCart} />} />
        <Route path="/orders" element={<OrdersPage cart={cart} loadCart={loadCart} />} />
        <Route path="/tracking" element={<TrackingPage cart={cart} />} />
      </Routes>
    </>
  );
}

export default App;
