const { execSync } = require('child_process');
const fs = require('fs');

async function runForge() {
  console.log('🛠️ Starten van Native Transformatie...');

  try {
    const capConfig = {
      appId: "com.forge.aiapp",
      appName: "TransformationTracker ",
      webDir: "www",
      bundledWebRuntime: false,
      server: { androidScheme: "https" }
    };
    fs.writeFileSync('capacitor.config.json', JSON.stringify(capConfig, null, 2));

    if (!fs.existsSync('android')) {
      console.log('➕ Toevoegen van Android platform...');
      execSync('npx cap add android', { stdio: 'inherit' });
    }

    console.log('🔄 Synchroniseren...');
    execSync('npx cap sync android', { stdio: 'inherit' });
    
    console.log('🏗️ Gradle Build...');
    const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
    execSync(`cd android && ${gradlew} assembleDebug --no-daemon`, { stdio: 'inherit' });

    console.log('🚀 APK succesvol gebouwd!');
  } catch (e) {
    console.error('❌ Build faal:', e.message);
    process.exit(1);
  }
}

runForge();