const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];
const inputSvg = path.join(__dirname, '../public/icon.svg');
const outputDir = path.join(__dirname, '../public');

async function generateIcons() {
  try {
    // Read SVG
    const svgBuffer = fs.readFileSync(inputSvg);
    
    // Generate PNGs
    for (const size of sizes) {
      const outputFile = path.join(outputDir, `android-chrome-${size}x${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputFile);
      
      console.log(`Generated: ${outputFile}`);
    }
    
    // Generate favicon
    const faviconBuffer = await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toBuffer();
    
    fs.writeFileSync(path.join(outputDir, 'favicon.ico'), faviconBuffer);
    console.log('Generated: favicon.ico');
    
    // Apple touch icon
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));
    console.log('Generated: apple-touch-icon.png');
    
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();