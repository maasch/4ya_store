import Header from '../components/header.jsx'
import './orders.css'
export default () => {
  return (
    <>
      <title>Orders</title>
      <Header />
      <div class="main">
        <div class="page-title">Your Orders</div>

        <div class="orders-grid js-orders-grid">

        </div>
      </div>
    </>
  )
}
