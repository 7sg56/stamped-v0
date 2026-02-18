from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    print("Navigating to http://localhost:3000/auth/register...")
    try:
        page.goto("http://localhost:3000/auth/register", timeout=60000)
    except Exception as e:
        print(f"Error navigating: {e}")
        browser.close()
        return

    # Wait for page load
    page.wait_for_load_state("networkidle")

    # Check for helper text
    try:
        helper_text = page.locator('text="Minimum 8 characters, including uppercase, lowercase, number, and special character"')
        if helper_text.is_visible():
            print("✅ Helper text verified.")
        else:
            print("❌ Helper text not found or not visible.")
    except Exception as e:
        print(f"Error checking helper text: {e}")

    # Fill invalid password to trigger validation
    page.fill('input[name="username"]', "testuser")
    page.fill('input[name="password"]', "pass12")
    page.fill('input[name="confirmPassword"]', "pass12")

    # Click register
    page.click('button[type="submit"]')

    # Wait for toast
    # Toasts often appear as dynamic content. I'll take a screenshot after a short delay.
    page.wait_for_timeout(2000)

    # Take screenshot
    page.screenshot(path="verification/registration_error.png")
    print("Screenshot saved to verification/registration_error.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
