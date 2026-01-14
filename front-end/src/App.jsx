import { Route, Routes } from 'react-router'
import CheckoutPage from './pages/checkout.jsx'
import HomePage from './pages/home.jsx'
function App() {
  return (
    <>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </>
  )
}

export default App
