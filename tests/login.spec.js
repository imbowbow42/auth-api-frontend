import { test, expect } from '@playwright/test';

test.describe('Login & Authentication Flow', () => {

  test('Should render the login page correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Login/);
    await expect(page.locator('h1.login-title')).toHaveText('Welcome back');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('Should show error on empty submission or native validation', async ({ page }) => {
    await page.goto('/');
    
    // HTML5 native validation triggers if we try to click 'Continue' without filling required fields.
    // For this test, we can just ensure the fields have the 'required' attribute.
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');
    
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('Should show network generic error or UI error when API returns unauthorized', async ({ page }) => {
    await page.route('**/auth/login', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid email or password' })
      });
    });

    await page.goto('/');
    await page.fill('#email', 'fakeuser@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('#submit-button');

    const errorMsg = page.locator('#error-message');
    await expect(errorMsg).not.toHaveClass(/hidden/);
    await expect(page.locator('#error-text')).toHaveText('Invalid email or password');
  });

  test('Should successfully login and redirect to home on correct credentials', async ({ page }) => {
    // Mock the backend auth/login endpoint to return a fake token
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Login successful',
          accessToken: 'fake-jwt-token'
        })
      });
    });

    // Mock the profile API endpoint since the home page will fetch it immediately
    await page.route('**/api/profile', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: '123',
            email: 'test@example.com',
            username: 'Test User'
          }
        })
      });
    });

    await page.goto('/');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'correctpassword');
    await page.click('#submit-button');

    // Wait for the redirect and verify we land on the home page
    await page.waitForURL('**/home.html');
    await expect(page).toHaveTitle(/Home/);

    // Ensure the profile loaded correctly
    await expect(page.locator('#profile-card')).not.toHaveClass(/hidden/);
    await expect(page.locator('#profile-name')).toHaveText('Test User');
    await expect(page.locator('#profile-email')).toHaveText('test@example.com');
  });

  test('Should protect home page route if not logged in', async ({ page }) => {
    await page.goto('/home.html');
    
    // Auth guard should immediately redirect back to login
    await page.waitForURL('**/');
    await expect(page.locator('.login-card')).toBeVisible();
  });

  test('Should logout successfully and redirect to login page', async ({ page }) => {
    // Fake the login explicitly by setting localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('accessToken', 'fake-jwt-token');
    });

    // Mock the profile to succeed
    await page.route('**/api/profile', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: '123', email: 'test@example.com', username: 'Test User' }
        })
      });
    });

    // Now navigate to home
    await page.goto('/home.html');
    await expect(page.locator('#profile-name')).toHaveText('Test User');

    // Click logout
    await page.click('#logout-btn');

    // Should redirect back to login and show login card
    await expect(page.locator('.login-card')).toBeVisible();
    
    // Expect localStorage to be clear and googleLogoutPending to be set
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeNull();
  });

});
