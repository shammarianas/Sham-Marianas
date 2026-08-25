// build.js
import { exec } from 'child_process';
import fs from 'fs';

console.log('🔨 Building project...');

// Step 1: Build with Vite
exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Build error: ${error}`);
    return;
  }
  console.log('✅ Build complete');
  
  // Step 2: Run prerender
  console.log('🔄 Prerendering pages...');
  exec('node prerender.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Prerender error: ${error}`);
      return;
    }
    console.log('✅ Prerendering complete');
    console.log('🎉 All pages are ready for deployment!');
  });
});