const puppeteer = require('puppeteer');

describe('Login Test', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });
  it('should show an error message with incorrect credentials', async () => {
    await page.goto('https://dev.cvsec.secmotic.com/login');
    
    // Typing incorrect credentials
    await page.type('#username', 'cvsec-admin@email.com'); // Correct username
    await page.type('#password', 'wrongpassword'); // Incorrect password

    // Submitting the form
    await page.click('button.w-100'); // Adjust if necessary
    
    // Check for the error message
    await page.waitForSelector('span'); // Wait for any span to appear
    
    const errorMessage = await page.$x("//span[contains(text(), 'Incorrect user name and/or password')]");
    expect(errorMessage.length).toBeGreaterThan(0); // Ensure the error message exists
  });
  it('should successfully log in with valid credentials', async () => {
    await page.goto('https://dev.cvsec.secmotic.com/login');
    
    // Typing valid credentials
    await page.type('#username', 'cvsec-admin@email.com'); // Using id as selector for username input
    await page.type('#password', 'keycloakAdmin.!963'); // Using id as selector for password input

    // Submitting the form
    await page.click('button.w-100'); // If it has a specific class
    
    // Wait for navigation to the dashboard
    await page.waitForNavigation();
    const url = await page.url();
    expect(url).toContain('/dashboards');
    
    // Check for the existence of the "Users" menu item
    const usersMenuItem = await page.$x("//li[contains(text(), 'Users')]");
    expect(usersMenuItem.length).toBeGreaterThan(0); // Ensure the element exists
  });


});