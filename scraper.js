const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeAIStudio() {
  const url = process.env.AI_URL || "https://ai.studio/apps/drive/1tubqLw5bI6VwmqUsZpQEAQ8HQNf6p_TW";
  console.log('🔍 Scrapen van AI Studio URL: ' + url);
  
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Wacht op de specifieke container van AI Studio apps
    await page.waitForSelector('body');
    
    // Extraheer de volledige gebundelde code
    const content = await page.evaluate(() => {
      // Verwijder AI Studio UI elementen als die er zijn
      const scripts = Array.from(document.querySelectorAll('script')).map(s => s.outerHTML).join('\n');
      const styles = Array.from(document.querySelectorAll('style')).map(s => s.outerHTML).join('\n');
      const body = document.body.innerHTML;
      
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          ${styles}
        </head>
        <body>
          ${body}
          ${scripts}
        </body>
        </html>
      `;
    });

    if (!fs.existsSync('www')) fs.mkdirSync('www', { recursive: true });
    fs.writeFileSync(path.join('www', 'index.html'), content);
    console.log('✅ Code succesvol geëxtraheerd en opgeslagen in www/index.html');
  } catch (err) {
    console.error('❌ Scrape fout:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

scrapeAIStudio();