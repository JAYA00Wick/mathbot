const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const buildDir = path.join(rootDir, 'build');
const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(buildDir)) {
  console.error('Expected build directory at', buildDir, 'but none was found.');
  process.exit(1);
}

try {
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.renameSync(buildDir, distDir);
  console.log('Moved build output to dist/ for Firebase hosting.');
} catch (error) {
  console.error('Failed to move build directory to dist:', error);
  process.exit(1);
}
