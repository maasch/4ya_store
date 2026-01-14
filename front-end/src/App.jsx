import { Route, Routes } from 'react-router'
import HomePage from './pages/home.jsx'
function App() {
  return (
    <>
      <Routes>
        <Route index element={<HomePage />} />
      </Routes>
    </>
  )
}

export default App
