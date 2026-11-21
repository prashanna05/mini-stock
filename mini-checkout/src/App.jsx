import React, { useState, useRef } from 'react';

// Fixed synthetic product catalog
const PRODUCTS = [
  {
    id: 'mouse',
    name: 'Wireless Mouse',
    price: 799,
    description: 'Ergonomic 2.4GHz wireless optical mouse with smooth tracking and silent clicks.',
    badge: 'Popular'
  },
  {
    id: 'keyboard',
    name: 'Mechanical Keyboard',
    price: 1499,
    description: 'Tactile mechanical keyboard with responsive switches and durable keycaps.',
    badge: 'Top Rated'
  }
];

// Helper to format currency in Indian Rupees (₹)
const formatINR = (amount) => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export default function App() {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [errors, setErrors] = useState({});
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronous ref to prevent duplicate submissions from rapid multi-clicks
  const isSubmittingRef = useRef(false);

  // Add product to cart
  const handleAddToCart = (product) => {
    // If an order is already confirmed, prevent cart modifications to preserve order integrity
    if (orderConfirmation) return;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        }
      ];
    });

    // Clear cart-related error if present
    setErrors((prev) => {
      if (!prev.cart) return prev;
      const { cart: _, ...rest } = prev;
      return rest;
    });
  };

  // Remove product from cart
  const handleRemoveFromCart = (productId) => {
    if (orderConfirmation) return;
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Increase or decrease quantity (preventing quantity from dropping below 1)
  const handleUpdateQuantity = (productId, delta) => {
    if (orderConfirmation) return;
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty < 1) return item; // Prevent quantity < 1
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // Handle customer name change
  const handleNameChange = (e) => {
    const val = e.target.value;
    setCustomerName(val);
    if (val.trim() && errors.name) {
      setErrors((prev) => {
        const { name: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // Calculate order total
  const orderTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Handle Place Order
  const handlePlaceOrder = (e) => {
    e.preventDefault();

    // Guard against duplicate confirmation if already confirmed or already processing
    if (orderConfirmation || isSubmittingRef.current || isSubmitting) {
      return;
    }

    // Set lock immediately to block rapid double-clicks
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    const validationErrors = {};
    const trimmedName = customerName.trim();

    // Validate cart is not empty
    if (cart.length === 0) {
      validationErrors.cart = 'Your cart is empty. Please add at least one product to proceed.';
    }

    // Validate customer name is not empty
    if (!trimmedName) {
      validationErrors.name = 'Please enter your customer name.';
    }

    // If validation fails: preserve customerName, report errors, unlock
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    // Successful checkout: clear errors and generate unique order reference
    setErrors({});
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const referenceNumber = `ORD-${timestamp}-${randomPart}`;

    const confirmationData = {
      reference: referenceNumber,
      customerName: trimmedName,
      items: cart.map((item) => ({ ...item })),
      total: orderTotal,
      placedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setOrderConfirmation(confirmationData);
    setIsSubmitting(false);
    // Keep isSubmittingRef.current = true to permanently prevent subsequent submissions
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="store-header">
        <div className="header-content">
          <div className="logo-group">
            <span className="logo-icon" aria-hidden="true">🛒</span>
            <div>
              <h1 className="store-title">Mini Store</h1>
              <p className="store-subtitle">Fast & Reliable Checkout</p>
            </div>
          </div>
          <span className="catalog-pill">2 Products Available</span>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="main-layout">
        {/* Left Column: Products & Cart */}
        <section className="catalog-and-cart">
          {/* Product Cards Section */}
          <section className="card-section" aria-labelledby="products-heading">
            <h2 id="products-heading" className="section-title">Products</h2>
            <div className="product-grid">
              {PRODUCTS.map((product) => {
                const itemInCart = cart.find((i) => i.id === product.id);
                return (
                  <article
                    key={product.id}
                    className="product-card"
                    data-testid={`product-card-${product.id}`}
                  >
                    <div className="product-header">
                      <span className="product-badge">{product.badge}</span>
                      <span className="product-price">{formatINR(product.price)}</span>
                    </div>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-desc">{product.description}</p>
                    <div className="product-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        data-testid={`add-to-cart-${product.id}`}
                        onClick={() => handleAddToCart(product)}
                        disabled={Boolean(orderConfirmation)}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        {itemInCart ? `Add More (${itemInCart.quantity} in cart)` : 'Add to Cart'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Shopping Cart Section */}
          <section className="card-section" aria-labelledby="cart-heading">
            <div className="cart-title-row">
              <h2 id="cart-heading" className="section-title">Shopping Cart</h2>
              <span className="cart-count-badge" data-testid="cart-item-count">
                {cart.reduce((cnt, item) => cnt + item.quantity, 0)} items
              </span>
            </div>

            {/* Empty cart message */}
            {cart.length === 0 ? (
              <div className="empty-cart-state" data-testid="empty-cart-message">
                <span className="empty-icon" aria-hidden="true">🛍️</span>
                <p className="empty-cart-text">Your cart is empty.</p>
                <p className="empty-cart-subtext">Add a product above to start your checkout.</p>
              </div>
            ) : (
              <div className="cart-items-list" data-testid="cart-items-container">
                {cart.map((item) => {
                  const lineTotal = item.price * item.quantity;
                  return (
                    <div
                      key={item.id}
                      className="cart-item"
                      data-testid={`cart-item-${item.id}`}
                    >
                      <div className="cart-item-details">
                        <span className="cart-item-name">{item.name}</span>
                        <span className="cart-item-unit-price">
                          {formatINR(item.price)} each
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="cart-item-controls">
                        <div className="quantity-stepper">
                          <button
                            type="button"
                            className="qty-btn"
                            data-testid={`qty-decrease-${item.id}`}
                            aria-label={`Decrease quantity of ${item.name}`}
                            disabled={item.quantity <= 1 || Boolean(orderConfirmation)}
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                          >
                            −
                          </button>
                          <span
                            className="qty-value"
                            data-testid={`qty-value-${item.id}`}
                            aria-label={`Current quantity ${item.quantity}`}
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="qty-btn"
                            data-testid={`qty-increase-${item.id}`}
                            aria-label={`Increase quantity of ${item.name}`}
                            disabled={Boolean(orderConfirmation)}
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                          >
                            +
                          </button>
                        </div>

                        {/* Line Total */}
                        <div className="line-total-wrapper">
                          <span className="line-total-label">Subtotal:</span>
                          <span
                            className="cart-item-line-total"
                            data-testid={`line-total-${item.id}`}
                          >
                            {formatINR(lineTotal)}
                          </span>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          className="btn-remove"
                          data-testid={`remove-${item.id}`}
                          aria-label={`Remove ${item.name} from cart`}
                          disabled={Boolean(orderConfirmation)}
                          onClick={() => handleRemoveFromCart(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Cart Total Summary */}
                <div className="cart-summary-bar">
                  <span className="cart-total-label">Cart Subtotal:</span>
                  <span className="cart-total-value">{formatINR(orderTotal)}</span>
                </div>
              </div>
            )}
          </section>
        </section>

        {/* Right Column: Checkout Form & Confirmation */}
        <section className="checkout-and-confirmation">
          {/* Order Summary & Form Card */}
          <div className="checkout-card">
            <h2 className="section-title">Checkout Details</h2>

            {/* Error banner if cart is empty on submission */}
            {errors.cart && (
              <div
                className="alert alert-error"
                role="alert"
                data-testid="cart-error"
              >
                <span className="alert-icon" aria-hidden="true">⚠️</span>
                <span>{errors.cart}</span>
              </div>
            )}

            <form onSubmit={handlePlaceOrder} noValidate>
              {/* Customer Name Input */}
              <div className="form-group">
                <label htmlFor="customer-name" className="form-label">
                  Customer Name <span className="required-indicator">*</span>
                </label>
                <input
                  id="customer-name"
                  type="text"
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                  data-testid="customer-name-input"
                  placeholder="Enter full name"
                  value={customerName}
                  onChange={handleNameChange}
                  disabled={Boolean(orderConfirmation)}
                  aria-required="true"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'name-error-msg' : undefined}
                />
                {errors.name && (
                  <p
                    id="name-error-msg"
                    className="error-message"
                    role="alert"
                    data-testid="name-error"
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Order Calculation Preview */}
              <div className="order-summary-box">
                <div className="summary-row">
                  <span>Selected Items</span>
                  <span>{cart.reduce((cnt, item) => cnt + item.quantity, 0)}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery</span>
                  <span className="free-tag">FREE</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total-row">
                  <span>Order Total:</span>
                  <span className="total-amount" data-testid="order-total">
                    {formatINR(orderTotal)}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                className="btn btn-checkout"
                data-testid="place-order-button"
                disabled={Boolean(orderConfirmation) || isSubmitting}
              >
                {orderConfirmation
                  ? 'Order Confirmed ✓'
                  : isSubmitting
                  ? 'Processing Order...'
                  : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Confirmation Panel (appears upon successful checkout) */}
          {orderConfirmation && (
            <section
              className="confirmation-card"
              data-testid="order-confirmation"
              aria-labelledby="confirmation-heading"
            >
              <div className="confirmation-header">
                <div className="success-badge-icon" aria-hidden="true">✓</div>
                <div>
                  <h3 id="confirmation-heading" className="confirmation-title">
                    Order Placed Successfully!
                  </h3>
                  <p className="confirmation-subtitle">
                    Thank you, your order has been received and confirmed.
                  </p>
                </div>
              </div>

              <div className="confirmation-details">
                <div className="confirmation-row">
                  <span className="detail-label">Order Reference:</span>
                  <strong className="detail-value ref-number" data-testid="order-reference">
                    {orderConfirmation.reference}
                  </strong>
                </div>
                <div className="confirmation-row">
                  <span className="detail-label">Customer Name:</span>
                  <strong className="detail-value" data-testid="confirmed-customer-name">
                    {orderConfirmation.customerName}
                  </strong>
                </div>
                <div className="confirmation-row">
                  <span className="detail-label">Order Time:</span>
                  <span className="detail-value">{orderConfirmation.placedAt}</span>
                </div>
              </div>

              <div className="confirmation-items-summary">
                <h4 className="confirmed-items-title">Items Ordered</h4>
                <ul className="confirmed-items-list">
                  {orderConfirmation.items.map((item) => (
                    <li key={item.id} className="confirmed-item-row">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>{formatINR(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="confirmation-total-row">
                  <span>Total Paid:</span>
                  <strong className="confirmed-total-amount" data-testid="confirmed-total">
                    {formatINR(orderConfirmation.total)}
                  </strong>
                </div>
              </div>

              <div className="confirmation-notice">
                ℹ️ This order is permanently confirmed. No duplicate charges will occur.
              </div>
            </section>
          )}
        </section>
      </main>

      <footer className="store-footer">
        <p>Mini Checkout Store • Beginner-Friendly React & Playwright Demonstration</p>
      </footer>
    </div>
  );
}
