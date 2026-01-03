const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeAIStudio() {
  const url = process.env.AI_URL || "https://ai.studio/apps/drive/1tubqLw5bI6VwmqUsZpQEAQ8HQNf6p_TW";
  console.log('🔍 [INIT] Starten Cloud Scraper...');
  console.log('🌐 [URL] ' + url);
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process'
    ]
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    console.log('⏳ [WAIT] Pagina laden...');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    console.log('⏳ [WAIT] Wachten op JavaScript execution...');
    await new Promise(r => setTimeout(r, 15000));

    const result = await page.evaluate(() => {
      const getDeepContent = () => {
        const appContainer = document.querySelector('app-root') || document.querySelector('#app') || document.body;
        const frames = Array.from(document.querySelectorAll('iframe'));
        let frameContent = '';
        for (const frame of frames) {
          try {
            if (frame.contentDocument && frame.contentDocument.body.innerHTML.length > 200) {
              frameContent = frame.contentDocument.documentElement.outerHTML;
              break;
            }
          } catch (e) {}
        }
        return frameContent || document.documentElement.outerHTML;
      };

      return {
        html: getDeepContent(),
        title: document.title
      };
    });

    if (!result.html || result.html.length < 500) {
      throw new Error('Geen bruikbare content gedetecteerd.');
    }

    if (!fs.existsSync('www')) fs.mkdirSync('www', { recursive: true });
    const finalHtml = result.html.replace('<head>', '<head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">');
    fs.writeFileSync(path.join('www', 'index.html'), finalHtml);
    console.log('✅ [SUCCESS] Content geëxtraheerd.');
    
  } catch (err) {
    console.error('❌ [ERROR] Scraper gefaald: ' + err.message);
    process.exit(1); 
  } finally {
    await browser.close();
  }
}

scrapeAIStudio();