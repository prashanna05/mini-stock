# Test Plan: Mini Checkout Application

## 1. Overview & Quality Objectives
The primary objective of this test plan is to verify the reliability, mathematical correctness, input validation, and idempotency of the single-page checkout flow for the **Mini Store** application.

### Key Checkout Risks Prioritized:
1. **Incorrect Total Calculation:** Risk of charging customers incorrect amounts or failing to update line subtotals and order totals upon quantity changes.
2. **Duplicate Order Confirmation:** Risk of double billing or multiple order generation caused by rapid user clicks on the checkout button.
3. **Missing Required Field:** Risk of submitting unassigned orders lacking customer identity.
4. **Empty Cart Checkout:** Risk of placing an empty order with zero items.
5. **Quantity Boundary Errors:** Risk of quantities dropping to 0 or negative numbers through decrement controls.
6. **Cart Modification & Item Removal:** Inability to remove unwanted products or incorrect remaining totals.
7. **Successful Checkout Completion:** Failure to issue a unique order reference, preserve customer name, and present an immutable confirmation.
8. **Validation State Preservation:** Form resetting and losing user input when other validation constraints fail.

---

## 2. Test Cases Matrix

| Test Case ID | Test Scenario | Steps | Expected Result | Priority | Test Type |
|---|---|---|---|---|---|
| **TC-01** | Total Calculation Accuracy | 1. Add Wireless Mouse (₹799)<br>2. Add Mechanical Keyboard (₹1,499)<br>3. Increase Mouse qty to 2 | Mouse line total is ₹1,598; Keyboard line total is ₹1,499; Order total is ₹3,097 immediately. | **P0 (Critical)** | Automated (`checkout.spec.js`) |
| **TC-02** | Prevent Duplicate Confirmation on Rapid Clicks | 1. Add product to cart<br>2. Enter valid customer name<br>3. Rapidly click "Place Order" twice | Exactly one order confirmation is generated; single unique reference number displayed; button becomes disabled. | **P0 (Critical)** | Automated & Manual |
| **TC-03** | Missing Customer Name Validation | 1. Add Wireless Mouse to cart<br>2. Leave Customer Name empty<br>3. Click "Place Order" | Checkout blocked; helpful validation error "Please enter your customer name." visible; cart contents unchanged. | **P0 (Critical)** | Automated (`checkout.spec.js`) |
| **TC-04** | Prevent Checkout with Empty Cart | 1. Ensure cart has 0 items<br>2. Enter Customer Name "Sarah Connor"<br>3. Click "Place Order" | Checkout blocked; message "Your cart is empty. Please add at least one product to proceed." displayed; name preserved; no confirmation generated. | **P0 (Critical)** | Automated & Manual |
| **TC-05** | Quantity Decrement Boundary (Minimum 1) | 1. Add item to cart (qty 1)<br>2. Observe minus (-) button<br>3. Attempt to decrease | Minus button is disabled when quantity = 1; quantity cannot drop to 0 or negative. | **P1 (High)** | Automated (`checkout.spec.js`) |
| **TC-06** | Product Removal from Cart | 1. Add item to cart<br>2. Click "Remove" button | Item removed from cart; totals update to ₹0; empty cart message displayed. | **P1 (High)** | Automated (`checkout.spec.js`) |
| **TC-07** | Successful End-to-End Checkout | 1. Start from clean state<br>2. Add Wireless Mouse<br>3. Enter name "Test Customer"<br>4. Click "Place Order" | Confirmation card rendered with unique `ORD-...` reference, customer name, items list, total ₹799, and disabled Place Order button. | **P0 (Critical)** | Automated (`checkout.spec.js`) |
| **TC-08** | Customer Name Preservation on Validation Failure | 1. Enter customer name<br>2. Trigger cart empty validation error | The entered name remains in the text box and is never wiped or lost. | **P1 (High)** | Automated (`checkout.spec.js`) |

---

## 3. Defect Reporting

### Defect Tracking Summary
- **Tests Implemented:** 6 test cases in Playwright suite covering all P0 and P1 risks.
- **Tests Actually Executed:** 6 automated tests + 2 manual scenario verifications.
- **Tests Passed:** 6 automated passed (100%), 2 manual verifications passed (100%).
- **Tests Failed:** 0 failed.
- **Tests Not Executed:** 0.

### Status Statement
**"No defects were observed during the executed tests."**

All calculations, boundary controls, rapid-click debouncing locks, empty-state validations, and confirmation persistence functioned in accordance with specifications.
