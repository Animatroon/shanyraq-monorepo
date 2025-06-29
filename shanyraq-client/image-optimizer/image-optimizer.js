
// image-optimizer.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const watchDir = path.join(__dirname, '../src/assets/images');


function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const isImage = ['.jpg', '.jpeg', '.png'].includes(ext);
  if (!isImage) return;

  const fileName = path.basename(filePath, ext);
  const outputWebP = path.join(watchDir, fileName + '.webp');

  sharp(filePath)
    .resize({ width: 1280 })
    .webp({ quality: 80 })
    .toFile(outputWebP)
    .then(() => console.log('✅ Optimized:', outputWebP))
    .catch(err => console.error('❌ Error optimizing image:', err));
}

fs.watch(watchDir, (eventType, filename) => {
  if (eventType === 'rename' && filename) {
    const fullPath = path.join(watchDir, filename);
    setTimeout(() => {
      if (fs.existsSync(fullPath)) {
        optimizeImage(fullPath);
      }
    }, 100);
  }
});
