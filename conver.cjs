#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const inputDir = path.resolve(__dirname, 'src');  // Dein CommonJS-Code
const outputDir = path.resolve(__dirname, 'esm'); // Zielordner für ES Modules

/**
 * Rekursive Funktion, die alle JS-Dateien findet
 * und die relative Ordnerstruktur beibehält
 */
function convertDirectory(srcDir, destDir) {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  const files = fs.readdirSync(srcDir, { withFileTypes: true });

  files.forEach((file) => {
    const srcPath = path.join(srcDir, file.name);
    const destPath = path.join(destDir, file.name);

    if (file.isDirectory()) {
      // Ordner rekursiv durchlaufen
      convertDirectory(srcPath, destPath);
    } else if (file.isFile() && path.extname(file.name) === '.js') {
      // Backup der Originaldatei
      const backupPath = destPath + '.cjs.bak';
      fs.copyFileSync(srcPath, backupPath);

      // CommonJS → ES Module Konvertierung
      try {
        execSync(`npx cjstoesm "${srcPath}" "${destPath}"`, { stdio: 'inherit' });
        console.log(`✅ Konvertiert: ${srcPath} → ${destPath}`);
      } catch (err) {
        console.error(`❌ Fehler bei Datei: ${srcPath}`, err);
      }
    }
  });
}

// Start
console.log(`Starte Konvertierung von CommonJS → ES Modules`);
convertDirectory(inputDir, outputDir);
console.log(`🎉 Fertig! Alle konvertierten Dateien sind in ${outputDir}`);
