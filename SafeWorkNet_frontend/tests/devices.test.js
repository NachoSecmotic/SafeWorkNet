const puppeteer = require('puppeteer');

describe('Create Device Test', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('https://dev.cvsec.secmotic.com/login');

    // Login
    await page.type('#username', 'cvsec-admin@email.com');
    await page.type('#password', 'keycloakAdmin.!963');
    await page.click('button.w-100');
    await page.waitForNavigation();

    // Navigate to Devices
    const devicesMenuItem = await page.$x("//li[contains(text(), 'Dispositivos')]");
    await devicesMenuItem[0].click();
    await page.waitForNavigation();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should create a new device', async () => {
    // Locate and click the "Add Device" button
    const [addDeviceButton] = await page.$x("//button[@id='CVSECButton' and (contains(text(), 'Add Device') or contains(text(), 'Nuevo Dispositivo'))]");
    if (addDeviceButton) {
      await addDeviceButton.click();
    } else {
      throw new Error("Add Device button not found");
    }
    
    // Fill out the form fields
    await page.type('input[id="name"]', 'Test Device');
    await page.type('input[id="location"]', '40.7128, -74.0060');
    
    // Handle the 'Type' dropdown
    const typeDropdown = await page.$('input[id="type"]');
    await typeDropdown.click();
    await page.type('input[id="type"]', 'Dispositivo Edge');
    await page.keyboard.press('Enter');
    
    // Handle the 'Resolution' dropdown
    const resolutionDropdown = await page.$('input[id="resolution"]');
    await resolutionDropdown.click();
    await page.type('input[id="resolution"]', '640x480 (VGA)');
    await page.keyboard.press('Enter');

    // Submit the form by clicking the "Enviar" button
    const [submitButton] = await page.$x("//button[@type='button' and contains(@class, 'ant-btn-primary') and .//span[text()='Enviar']]");
    if (submitButton) {
      await submitButton.click();
    } else {
      throw new Error("Submit button not found");
    }

    // Wait for the device list to update and verify creation
    await page.waitForSelector('table tbody'); // Ensure the table body is loaded
    
    // Check if the "Test Device" row exists
    const deviceExists = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      return rows.some(row => {
        const nameCell = row.querySelector('td:nth-child(3) div');
        return nameCell && nameCell.textContent.trim().includes('Test Device');
      });
    });

    expect(deviceExists).toBe(true);
  });
  it('should edit the newly created device', async () => {
    // Locate the "Test Device" row
    const testDeviceRow = await page.evaluateHandle(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      return rows.find(row => {
        const nameCell = row.querySelector('td:nth-child(3) div');
        return nameCell && nameCell.textContent.trim().includes('Test Device');
      });
    });

    if (!testDeviceRow) {
      throw new Error("Test Device row not found");
    }

    // Click the edit button in the "Settings" column (last column)
    const editButton = await testDeviceRow.$('td:last-child div.styles_containerActions__uZBHs button');
    await page.evaluate(button => button.click(), editButton);

    // Modify the device details
    await page.waitForSelector('input[id="name"]');
    await page.click('input[id="name"]', { clickCount: 3 }); // Select all text
    await page.type('input[id="name"]', 'Edited Test Device');
    
    await page.click('input[id="location"]', { clickCount: 3 });
    await page.type('input[id="location"]', '34.0522, -118.2437');

    // Modify the 'Type' dropdown
    const typeDropdown = await page.$('input[id="type"]');
    await typeDropdown.click();
    await page.type('input[id="type"]', 'Mobile Cam');
    await page.keyboard.press('Enter');

    // Modify the 'Resolution' dropdown
    const resolutionDropdown = await page.$('input[id="resolution"]');
    await resolutionDropdown.click();
    await page.type('input[id="resolution"]', '320x240');
    await page.keyboard.press('Enter');

    // Submit the form
    const [submitButton] = await page.$x("//button[@type='button' and contains(@class, 'ant-btn-primary') and .//span[text()='Enviar']]");
    if (submitButton) {
      await submitButton.click();
    } else {
      throw new Error("Submit button not found");
    }

    // Verify the changes in the table
    await page.waitForSelector('table tbody');

    const deviceEdited = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      return rows.some(row => {
        const nameCell = row.querySelector('td:nth-child(3) div');
        const locationCell = row.querySelector('td:nth-child(5) div');
        const typeCell = row.querySelector('td:nth-child(4) div');
        const resolutionCell = row.querySelector('td:nth-child(6) div');
        return (
          nameCell && nameCell.textContent.trim() === 'Edited Test Device' &&
          locationCell && locationCell.textContent.trim() === '34.0522,-118.2437' &&
          typeCell && typeCell.textContent.trim() === 'Mobile Cam' &&
          resolutionCell && resolutionCell.textContent.trim() === '320X240'
        );
      });
    });

    expect(deviceEdited).toBe(true);
  });
});