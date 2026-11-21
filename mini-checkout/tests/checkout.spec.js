import { test, expect } from '@playwright/test';

test.describe('Mini Checkout Suite', () => {
  // Ensure every test starts from a clean application state
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Verify page loaded cleanly with empty cart
    await expect(page.getByRole('heading', { name: 'Mini Store' })).toBeVisible();
    await expect(page.getByTestId('empty-cart-message')).toBeVisible();
  });

  /**
   * Test 1: Successful Checkout
   * 1. Start from a clean application state.
   * 2. Add Wireless Mouse to the cart.
   * 3. Verify that the cart displays the product.
   * 4. Enter the customer name "Test Customer".
   * 5. Click Place Order.
   * 6. Assert that the order confirmation message is visible.
   * 7. Assert that a unique order reference is displayed.
   * 8. Assert that the displayed order total is ₹799.
   */
  test('Test 1: Successful Checkout', async ({ page }) => {
    // 2. Add Wireless Mouse to the cart
    const addMouseBtn = page.getByTestId('add-to-cart-mouse');
    await addMouseBtn.click();

    // 3. Verify that the cart displays the product
    const cartMouseItem = page.getByTestId('cart-item-mouse');
    await expect(cartMouseItem).toBeVisible();
    await expect(cartMouseItem).toContainText('Wireless Mouse');
    await expect(page.getByTestId('line-total-mouse')).toContainText('₹799');

    // 4. Enter the customer name "Test Customer"
    const nameInput = page.getByLabel(/Customer Name/i);
    await nameInput.fill('Test Customer');
    await expect(nameInput).toHaveValue('Test Customer');

    // 5. Click Place Order
    const placeOrderBtn = page.getByRole('button', { name: /Place Order/i });
    await placeOrderBtn.click();

    // 6. Assert that the order confirmation message is visible
    const confirmationCard = page.getByTestId('order-confirmation');
    await expect(confirmationCard).toBeVisible();
    await expect(page.getByText('Order Placed Successfully!')).toBeVisible();

    // 7. Assert that a unique order reference is displayed
    const orderRefLocator = page.getByTestId('order-reference');
    await expect(orderRefLocator).toBeVisible();
    const orderRefText = await orderRefLocator.textContent();
    expect(orderRefText).toBeTruthy();
    expect(orderRefText?.trim().startsWith('ORD-')).toBeTruthy();

    // Assert customer name is confirmed
    await expect(page.getByTestId('confirmed-customer-name')).toHaveText('Test Customer');

    // 8. Assert that the displayed order total is ₹799
    await expect(page.getByTestId('confirmed-total')).toHaveText('₹799');

    // Assert that the Place Order button is disabled after confirmation
    await expect(page.getByTestId('place-order-button')).toBeDisabled();

    // Capture screenshot evidence of successful checkout
    await page.screenshot({ path: 'screenshots/successful-checkout.png', fullPage: true });
  });

  /**
   * Test 2: Missing Required Field
   * 1. Start from a clean application state.
   * 2. Add Wireless Mouse to the cart.
   * 3. Leave the customer name blank.
   * 4. Click Place Order.
   * 5. Assert that checkout is blocked.
   * 6. Assert that a clear name validation message is visible.
   * 7. Assert that the order confirmation is not visible.
   * 8. Assert that the cart contents remain unchanged.
   */
  test('Test 2: Missing Required Field', async ({ page }) => {
    // 2. Add Wireless Mouse to the cart
    await page.getByTestId('add-to-cart-mouse').click();
    await expect(page.getByTestId('cart-item-mouse')).toBeVisible();

    // 3. Leave the customer name blank (ensure empty)
    const nameInput = page.getByLabel(/Customer Name/i);
    await nameInput.fill('');
    await expect(nameInput).toHaveValue('');

    // 4. Click Place Order
    await page.getByRole('button', { name: /Place Order/i }).click();

    // 5. Assert that checkout is blocked
    // 6. Assert that a clear name validation message is visible
    const nameError = page.getByTestId('name-error');
    await expect(nameError).toBeVisible();
    await expect(nameError).toContainText('Please enter your customer name.');

    // 7. Assert that the order confirmation is not visible
    await expect(page.getByTestId('order-confirmation')).not.toBeVisible();

    // 8. Assert that the cart contents remain unchanged
    const cartMouseItem = page.getByTestId('cart-item-mouse');
    await expect(cartMouseItem).toBeVisible();
    await expect(page.getByTestId('qty-value-mouse')).toHaveText('1');
    await expect(page.getByTestId('line-total-mouse')).toHaveText('₹799');
    await expect(page.getByTestId('order-total')).toHaveText('₹799');

    // Capture screenshot evidence of missing name validation error
    await page.screenshot({ path: 'screenshots/validation-error-name.png', fullPage: true });
  });

  /**
   * Test 3: Quantity Update and Exact Total
   * 1. Start from a clean application state.
   * 2. Add Wireless Mouse.
   * 3. Add Mechanical Keyboard.
   * 4. Increase Wireless Mouse quantity to 2.
   * 5. Verify the Mouse line total is ₹1,598.
   * 6. Verify the Keyboard line total is ₹1,499.
   * 7. Verify the exact order total is ₹3,097.
   */
  test('Test 3: Quantity Update and Exact Total', async ({ page }) => {
    // 2. Add Wireless Mouse
    await page.getByTestId('add-to-cart-mouse').click();

    // 3. Add Mechanical Keyboard
    await page.getByTestId('add-to-cart-keyboard').click();

    // Verify both items in cart
    await expect(page.getByTestId('cart-item-mouse')).toBeVisible();
    await expect(page.getByTestId('cart-item-keyboard')).toBeVisible();

    // 4. Increase Wireless Mouse quantity to 2
    await page.getByTestId('qty-increase-mouse').click();
    await expect(page.getByTestId('qty-value-mouse')).toHaveText('2');

    // 5. Verify the Mouse line total is ₹1,598
    await expect(page.getByTestId('line-total-mouse')).toHaveText('₹1,598');

    // 6. Verify the Keyboard line total is ₹1,499
    await expect(page.getByTestId('line-total-keyboard')).toHaveText('₹1,499');

    // 7. Verify the exact order total is ₹3,097
    await expect(page.getByTestId('order-total')).toHaveText('₹3,097');

    // Capture screenshot evidence of cart calculation
    await page.screenshot({ path: 'screenshots/quantity-updated-cart.png', fullPage: true });
  });

  /**
   * Additional Automated Test: Empty Cart Checkout Prevention (Automates Manual Test A)
   * 1. Ensure cart is empty.
   * 2. Enter customer name.
   * 3. Click Place Order.
   * 4. Verify checkout is blocked with clear message.
   * 5. Verify customer name is preserved.
   */
  test('Additional Test: Empty Cart Checkout Prevention', async ({ page }) => {
    // 1. Verify cart is empty
    await expect(page.getByTestId('empty-cart-message')).toBeVisible();

    // 2. Enter customer name
    const nameInput = page.getByLabel(/Customer Name/i);
    await nameInput.fill('Sarah Connor');

    // 3. Click Place Order
    await page.getByRole('button', { name: /Place Order/i }).click();

    // 4. Assert checkout is blocked with empty cart validation message
    const cartError = page.getByTestId('cart-error');
    await expect(cartError).toBeVisible();
    await expect(cartError).toContainText('Your cart is empty. Please add at least one product to proceed.');
    await expect(page.getByTestId('order-confirmation')).not.toBeVisible();

    // 5. Assert customer name is preserved
    await expect(nameInput).toHaveValue('Sarah Connor');

    // Capture screenshot evidence of empty cart error
    await page.screenshot({ path: 'screenshots/validation-error-empty-cart.png', fullPage: true });
  });

  /**
   * Additional Automated Test: Rapid Double Click / Duplicate Prevention (Automates Manual Test B)
   * 1. Add Wireless Mouse to cart.
   * 2. Enter valid customer name.
   * 3. Rapidly click Place Order twice.
   * 4. Verify exactly one order confirmation exists.
   * 5. Verify order confirmation is permanent and Place Order is disabled.
   */
  test('Additional Test: Rapid Double Click Prevention', async ({ page }) => {
    await page.getByTestId('add-to-cart-mouse').click();
    const nameInput = page.getByLabel(/Customer Name/i);
    await nameInput.fill('Alex Mercer');

    const placeOrderBtn = page.getByRole('button', { name: /Place Order/i });

    // Double click rapidly
    await placeOrderBtn.dblclick();

    // Verify confirmation is visible
    const confirmations = page.getByTestId('order-confirmation');
    await expect(confirmations).toHaveCount(1);
    await expect(confirmations).toBeVisible();

    // Verify unique reference is present
    const refLocator = page.getByTestId('order-reference');
    await expect(refLocator).toBeVisible();

    // Verify Place Order button is disabled and text indicates confirmed
    await expect(page.getByTestId('place-order-button')).toBeDisabled();
    await expect(page.getByTestId('place-order-button')).toHaveText(/Order Confirmed/i);

    // Capture screenshot evidence of rapid double click confirmation
    await page.screenshot({ path: 'screenshots/rapid-double-click-confirmed.png', fullPage: true });
  });

  /**
   * Additional Automated Test: Minimum Quantity Limit & Item Removal
   * 1. Add Wireless Mouse (qty = 1).
   * 2. Verify decrease button is disabled (prevents qty < 1).
   * 3. Increase to 2, decrease button enables.
   * 4. Decrease back to 1, decrease button disables.
   * 5. Click Remove button, cart becomes empty.
   */
  test('Additional Test: Quantity Minimum Limit and Product Removal', async ({ page }) => {
    await page.getByTestId('add-to-cart-mouse').click();
    const decBtn = page.getByTestId('qty-decrease-mouse');
    const incBtn = page.getByTestId('qty-increase-mouse');

    // When qty is 1, decrease button must be disabled
    await expect(decBtn).toBeDisabled();

    // Increase to 2
    await incBtn.click();
    await expect(page.getByTestId('qty-value-mouse')).toHaveText('2');
    await expect(decBtn).toBeEnabled();

    // Decrease back to 1
    await decBtn.click();
    await expect(page.getByTestId('qty-value-mouse')).toHaveText('1');
    await expect(decBtn).toBeDisabled();

    // Remove from cart
    await page.getByTestId('remove-mouse').click();
    await expect(page.getByTestId('empty-cart-message')).toBeVisible();
    await expect(page.getByTestId('order-total')).toHaveText('₹0');
  });
});
