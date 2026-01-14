import './checkout-header.css'
import './checkout-main.css'
export default () => {
  return (
    <>
      <title>Checkout</title>
      <div className="checkout-header">
        <div className="header-content">
          <div className="checkout-header-left-section">
            <a href="index.html">
              <img className="amazon-logo" src="images/amazon-logo.png" />
              <img
                className="amazon-mobile-logo"
                src="images/amazon-mobile-logo.png"
              />
            </a>
          </div>

          <div className="checkout-header-middle-section">
            Checkout (<a
              className="return-to-home-link items-quantity"
              href="index.html"
            ></a>)
          </div>

          <div className="checkout-header-right-section">
            <img src="images/icons/checkout-lock-icon.png" />
          </div>
        </div>
      </div>

      <div className="main">
        <div className="page-title">Review your order</div>

        <div className="checkout-grid">
          <div className="order-summary js-order-summary"></div>

          <div className="payment-summary"></div>
        </div>
      </div>
    </>
  )
}
