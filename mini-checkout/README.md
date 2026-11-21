# Mini Checkout and Browser Test Suite

A clean, beginner-friendly single-page checkout web application built with **React**, **Vite**, and **Playwright**.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Installation Instructions](#installation-instructions)
7. [Running the Application](#running-the-application)
8. [Running Playwright Tests](#running-playwright-tests)
9. [Running Tests in Headed Browser Mode](#running-tests-in-headed-browser-mode)
10. [Viewing Test Reports and Evidence](#viewing-test-reports-and-evidence)
11. [Manual Testing Scenarios](#manual-testing-scenarios)
12. [Actual Test Execution Results](#actual-test-execution-results)
13. [Defect Reporting](#defect-reporting)
14. [Known Limitations](#known-limitations)

---

## 1. Project Overview
This project simulates an online store checkout page for a small e-commerce store with two synthetic products. It guarantees:
- Accurate dynamic calculation of item line totals and order totals in Indian Rupees (₹).
- Robust validation ensuring an empty cart or empty customer name cannot be submitted.
- Form state preservation when validation fails.
- Complete idempotency and protection against duplicate order confirmation upon rapid double clicking.
- A comprehensive Playwright test automation suite verifying end-to-end checkout scenarios.

---

## 2. Features

### Products
Fixed synthetic product catalog:
- **Wireless Mouse** — ₹799
- **Mechanical Keyboard** — ₹1,499

### Shopping Cart
- Display product names, prices, and badges.
- **Add to Cart:** Add new items or increment count if already present.
- **Quantity Controls:** Increase (+) and decrease (−) buttons with an enforced lower boundary of 1.
- **Item Removal:** "Remove" button to drop items from the cart.
- **Immediate Real-Time Calculation:** Subtotals and grand total update instantaneously on state change.
- **Empty State Feedback:** Clear illustration and message when cart has no items.

### Checkout Form & Validation
- **Required Field:** Customer Name with accessible `<label htmlFor="customer-name">` and `aria-required`.
- **Validation Messages:** Clear inline error for blank customer name and banner alert for empty cart checkout attempt.
- **State Preservation:** Retains entered customer name even if checkout is blocked.

### Order Confirmation
- Unique order reference generator (e.g. `ORD-XXXXXX-XXXX`).
- Displays customer name, list of items ordered with quantities, and total amount paid.
- **Duplicate Prevention:** Immediate synchronous submission lock prevents multiple order creation even on rapid multi-clicks.
- Disables the "Place Order" button upon success.
- Confirmation card remains permanently visible on the page without losing state.

---

## 3. Technologies Used
- **HTML5 & CSS3:** Semantic markup, responsive CSS Grid and Flexbox, accessible form controls, clean design system.
- **JavaScript (ES6+) & React 18:** Modern React functional components, hooks (`useState`, `useRef`).
- **Vite:** High-performance local development server and bundler.
- **Playwright Test:** End-to-end browser automation suite with Chromium browser execution.

---

## 4. Project Structure
```text
mini-checkout/
├── src/
│   ├── App.jsx              # Main React checkout component
│   ├── main.jsx             # React DOM entry point
│   └── styles.css           # Modern card-based UI styles
├── tests/
│   └── checkout.spec.js     # Playwright automated test suite
├── test-results/            # Playwright HTML reports and artifacts
├── screenshots/             # Visual screenshot evidence of test executions
├── index.html               # Main HTML template
├── package.json             # NPM dependencies and scripts
├── playwright.config.js     # Playwright configuration
├── README.md                # Project documentation and guide
└── TEST_PLAN.md             # Test plan and defect reporting
```

---

## 5. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or later (v22.16.0+ recommended)
- **NPM**: v9.0.0 or later (v10.9.2+ recommended)

Check versions:
```bash
node -v
npm -v
```

---

## 6. Installation Instructions
1. Navigate to the project directory:
   ```bash
   cd mini-checkout
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Install Playwright browser binaries (Chromium):
   ```bash
   npx playwright install chromium
   ```

---

## 7. Running the Application
To start the Vite development server locally:
```bash
npm run dev
```
The application will be accessible at:
```text
http://localhost:5173
```

---

## 8. Running Playwright Tests
The automated test suite runs in headless mode against the application:
```bash
npm test
```
Or directly using Playwright CLI:
```bash
npx playwright test
```

---

## 9. Running Tests in Headed Browser Mode
To watch the tests execute interactively inside a visible browser window:
```bash
npm run test:headed
```

Or run Playwright's interactive UI runner:
```bash
npm run test:ui
```

---

## 10. Viewing Test Reports and Evidence
After executing tests, view the HTML report in your browser:
```bash
npm run test:report
```

Visual screenshot evidence is automatically stored in the `screenshots/` directory:
- `screenshots/successful-checkout.png`: Confirmation state with unique reference and totals.
- `screenshots/validation-error-name.png`: Missing customer name error state.
- `screenshots/validation-error-empty-cart.png`: Empty cart checkout error with name preserved.
- `screenshots/quantity-updated-cart.png`: Line subtotal and total calculations.
- `screenshots/rapid-double-click-confirmed.png`: Duplicate click prevention evidence.

---

## 11. Manual Testing Scenarios

### Manual Test A: Empty Cart Checkout Prevention
**Steps:**
1. Open the application at `http://localhost:5173`.
2. Ensure the cart is empty (displays "Your cart is empty").
3. In the Customer Name field, type: `Jane Doe`.
4. Click the **Place Order** button.

**Expected Result:**
- Checkout does not proceed.
- An alert message displays: *"Your cart is empty. Please add at least one product to proceed."*
- Customer name input still contains `Jane Doe` (not erased).
- No order confirmation is generated.

**Actual Observed Result:**
- **PASS:** An alert banner immediately appeared with the exact message. The entered name `Jane Doe` was completely preserved in the input box, and no confirmation card or reference number was created.

---

### Manual Test B: Rapid Double Click / Duplicate Prevention
**Steps:**
1. Open the application at `http://localhost:5173`.
2. Click **Add to Cart** on "Wireless Mouse".
3. Enter Customer Name: `Jane Doe`.
4. Rapidly double-click the **Place Order** button twice in quick succession.

**Expected Result:**
- Exactly one order confirmation card is generated.
- Exactly one order reference number is displayed.
- The order is not duplicated.
- The "Place Order" button disables and changes text to "Order Confirmed ✓".

**Actual Observed Result:**
- **PASS:** Only a single confirmation panel was rendered. Exactly one unique reference number (e.g. `ORD-...`) was generated. The button was disabled immediately upon the first click, preventing any secondary invocation.

---

## 12. Actual Test Execution Results

The automated Playwright test suite was executed in Chromium. Below are the actual execution metrics:

```text
Running 6 tests using 1 worker

  ✓ 1 [chromium] › tests/checkout.spec.js › Mini Checkout Suite › Test 1: Successful Checkout (Passed)
  ✓ 2 [chromium] › tests/checkout.spec.js › Mini Checkout Suite › Test 2: Missing Required Field (Passed)
  ✓ 3 [chromium] › tests/checkout.spec.js › Mini Checkout Suite › Test 3: Quantity Update and Exact Total (Passed)
  ✓ 4 [chromium] › tests/checkout.spec.js › Mini Checkout Suite › Additional Test: Empty Cart Checkout Prevention (Passed)
  ✓ 5 [chromium] › tests/checkout.spec.js › Mini Checkout Suite › Additional Test: Rapid Double Click Prevention (Passed)
  ✓ 6 [chromium] › tests/checkout.spec.js › Mini Checkout Suite › Additional Test: Quantity Minimum Limit and Product Removal (Passed)

6 passed (100% passing rate)
```

### Breakdown:
- **Tests Implemented:** 6
- **Tests Actually Executed:** 6
- **Tests Passed:** 6
- **Tests Failed:** 0
- **Tests Not Executed:** 0

---

## 13. Defect Reporting
**"No defects were observed during the executed tests."**

The application conforms to all functional, UI/UX, validation, and idempotency criteria.

---

## 14. Known Limitations
- The store uses synthetic in-memory state; refreshing the browser will reset the shopping cart and checkout state.
- No backend persistence or actual payment gateway is connected, as per project requirements.
- The catalog is fixed to the two designated synthetic products: Wireless Mouse (₹799) and Mechanical Keyboard (₹1,499).
