const { execSync } = require('child_process');
const fs = require('fs');

const log = (msg) => console.log(`[36m[FORGE-CLOUD][0m ${msg}`);

async function runForge() {
  log('🛠️ Starten van Native Transformatie...');

  try {
    // 1. Capacitor setup
    const capConfig = {
      appId: "com.TransformationTracker.app",
      appName: "TransformationTracker ",
      webDir: "www",
      bundledWebRuntime: false,
      server: { androidScheme: "https" }
    };
    fs.writeFileSync('capacitor.config.json', JSON.stringify(capConfig, null, 2));

    // 2. Platform toevoegen
    if (!fs.existsSync('android')) {
      execSync('npx cap add android', { stdio: 'inherit' });
    }

    // 3. Icoon verwerking
    if (fs.existsSync('app-icon.png')) {
      log('🎨 Icoon injecteren...');
      // ... icoon kopieer logica ...
    }

    // 4. Sync & Build
    execSync('npx cap sync android', { stdio: 'inherit' });
    
    log('🏗️ Gradle Build starten...');
    const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
    execSync(`cd android && ${gradlew} assembleDebug --no-daemon`, { stdio: 'inherit' });

    log('🚀 APK succesvol gebouwd!');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

runForge();