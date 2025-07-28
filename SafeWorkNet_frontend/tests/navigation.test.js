const puppeteer = require('puppeteer');

describe('Navigation Test', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
    await page.goto('https://dev.cvsec.secmotic.com/login');

    // Login first
    await page.type('#username', 'cvsec-admin@email.com');
    await page.type('#password', 'keycloakAdmin.!963');
    await page.click('button.w-100');
    await page.waitForNavigation();
  });

  afterAll(async () => {
    await browser.close();
  });

  const navigateAndCheckURL = async (menuText, expectedPath) => {
    const menuItem = await page.$x(`//li[contains(text(), '${menuText}')]`);
    if (menuItem.length === 0) {
      throw new Error(`Menu item with text "${menuText}" not found`);
    }
    await menuItem[0].click();
    await page.waitForNavigation();
    const url = await page.url();
    expect(url).toContain(expectedPath);
  };

  it('should navigate to Usuarios', async () => {
    await navigateAndCheckURL('Usuarios', '/users');
  });

  it('should navigate to Dispositivos', async () => {
    await navigateAndCheckURL('Dispositivos', '/devices');
  });

  it('should navigate to Modelos IA', async () => {
    await navigateAndCheckURL('Modelos IA', '/aiModels');
  });

  it('should navigate to Flujos de video', async () => {
    await navigateAndCheckURL('Flujos de video', '/videoStreams');
  });

  it('should navigate to Notificaciones', async () => {
    await navigateAndCheckURL('Notificaciones', '/notifications');
  });
});