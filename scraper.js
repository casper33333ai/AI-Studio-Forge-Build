const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeAIStudio() {
  const url = process.env.AI_URL || "https://ai.studio/apps/drive/1tubqLw5bI6VwmqUsZpQEAQ8HQNf6p_TW";
  console.log('🚀 Starten van Cloud Scraper voor: ' + url);
  
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1920,1080'
    ]
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
  
  try {
    console.log('🌐 Navigeren...');
    // Verhoogde timeout naar 2 minuten voor zware AI Studio omgevingen
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });
    
    console.log('⏳ Wachten op AI Studio componenten...');
    // AI Studio shared links laden vaak de eigenlijke app in een iframe
    await page.waitForSelector('body', { timeout: 30000 });
    
    // Extra pauze om async scripts de tijd te geven
    await new Promise(r => setTimeout(r, 10000));

    console.log('🔍 Analyseren van pagina-structuur...');
    
    const content = await page.evaluate(async () => {
      // Functie om diep in iframes te kijken
      const findAppContent = () => {
        // 1. Zoek naar iframes (vaak wordt de app hierin gerenderd)
        const iframes = Array.from(document.querySelectorAll('iframe'));
        for (const frame of iframes) {
          try {
            if (frame.contentDocument && frame.contentDocument.body.innerHTML.length > 500) {
              return frame.contentDocument.documentElement.outerHTML;
            }
          } catch (e) {
            // Cross-origin restricties kunnen hier optreden
          }
        }
        
        // 2. Geen iframe gevonden? Pak de volledige bron van de top-level
        return document.documentElement.outerHTML;
      };

      let finalHtml = findAppContent();
      
      // Opschonen: verwijder AI Studio specifieke overlays als die er zijn
      // Dit is een heuristiek: we willen de pure app code
      return finalHtml;
    });

    if (!content || content.length < 100) {
      throw new Error('Geen bruikbare content gevonden op de pagina.');
    }

    if (!fs.existsSync('www')) fs.mkdirSync('www', { recursive: true });
    fs.writeFileSync(path.join('www', 'index.html'), content);
    console.log('✅ Succes! Code geëxtraheerd (' + content.length + ' bytes).');
    
  } catch (err) {
    console.error('❌ FOUT GEHAAID: ' + err.message);
    // Maak een nood-bestand aan zodat de build stap niet crasht op missende mappen
    if (!fs.existsSync('www')) fs.mkdirSync('www', { recursive: true });
    fs.writeFileSync(path.join('www', 'index.html'), '<html><body><h1>Build Error</h1><p>De scraper kon de content niet ophalen.</p></body></html>');
    process.exit(1); 
  } finally {
    await browser.close();
  }
}

scrapeAIStudio();