import axios from 'axios';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router';
import CheckoutPage from './pages/checkout/checkout.jsx';
import HomePage from './pages/home/home.jsx';
import OrdersPage from './pages/orders/orders.jsx';
import ProductPage from './pages/product/ProductPage.jsx';
import SignInPage from './pages/signin/signin.jsx';
import TrackingPage from './pages/tracking/tracking.jsx';
function App() {
  let [cart, setCart] = useState([]);
  async function loadCart() {
    let response = await axios.get('/api/cart-items?expand=product');
    setCart(response.data);
  }
  const [userInfo, setUserInfo] = useState({
    isAuthenticated: false,
    user: {}
  });
  useEffect(() => {
    loadCart();
    fetchUserInfo();
  }, []);
  async function fetchUserInfo() {
    let response = await axios.get('/api/login/check');
    setUserInfo(response.data);
  }
  return (
      <Routes>
        <Route index element={<HomePage cart={cart} loadCart={loadCart} userInfo={userInfo} setUserInfo={setUserInfo} />} />
        <Route path="/checkout" element={<CheckoutPage cart={cart} loadCart={loadCart} userInfo={userInfo} setUserInfo={setUserInfo} />} />
        <Route path="/orders" element={<OrdersPage cart={cart} loadCart={loadCart} userInfo={userInfo} setUserInfo={setUserInfo} />} />
        <Route path="/product" element={<ProductPage cart={cart} loadCart={loadCart} userInfo={userInfo} setUserInfo={setUserInfo} />} />
        <Route path="/signin" element={<SignInPage cart={cart}  userInfo={userInfo} setUserInfo={setUserInfo} />} />
        <Route path="/tracking" element={<TrackingPage cart={cart} userInfo={userInfo} setUserInfo={setUserInfo} />} />  
    </Routes>
  );
}

export default App;