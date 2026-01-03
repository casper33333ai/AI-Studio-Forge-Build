const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runForge() {
  console.log('🏗️ [BUILD] Starten Native Transformatie...');

  const webPath = path.join(process.cwd(), 'www');
  if (!fs.existsSync(webPath) || !fs.existsSync(path.join(webPath, 'index.html'))) {
    console.error('❌ [ERROR] Geen web content gevonden in www/index.html. Scraper heeft waarschijnlijk gefaald.');
    process.exit(1);
  }

  try {
    const capConfig = {
      appId: "com.casper.transformationtrackerapp",
      appName: "TransformationTracker ",
      webDir: "www",
      bundledWebRuntime: false,
      server: { androidScheme: "https" }
    };
    fs.writeFileSync('capacitor.config.json', JSON.stringify(capConfig, null, 2));

    console.log('➕ [PLATFORM] Android toevoegen...');
    try { execSync('npx cap add android', { stdio: 'inherit' }); } catch(e) {}

    console.log('🔄 [SYNC] Capacitor Sync...');
    execSync('npx cap sync android', { stdio: 'inherit' });
    
    console.log('🛠️ [GRADLE] APK Compileren...');
    const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
    
    // Zorg dat gradlew executable is op Linux
    if (process.platform !== 'win32') {
      execSync('chmod +x android/gradlew');
    }

    execSync(`cd android && ${gradlew} assembleDebug --no-daemon`, { stdio: 'inherit' });

    console.log('🚀 [DONE] APK succesvol gegenereerd!');
  } catch (e) {
    console.error('❌ [FATAL] Build proces onderbroken: ' + e.message);
    process.exit(1);
  }
}

runForge();