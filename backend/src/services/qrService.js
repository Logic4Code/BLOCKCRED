const QRCode = require('qrcode');

/**
 * Generate QR code as base64 data URL
 * @param {string} verifyUrl - The verification URL or hash
 * @returns {Promise<string>} base64 data URL
 */
async function generateQRCode(verifyUrl) {
  try {
    const qrDataURL = await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      color: {
        dark: '#00ff9d',   // neon green
        light: '#0a0a1a'  // dark background
      },
      width: 300
    });
    return qrDataURL;
  } catch (err) {
    throw new Error('QR generation failed: ' + err.message);
  }
}

/**
 * Generate QR code as Buffer (for embedding in PDF)
 */
async function generateQRBuffer(verifyUrl) {
  return QRCode.toBuffer(verifyUrl, {
    errorCorrectionLevel: 'H',
    width: 200,
    margin: 1
  });
}

module.exports = { generateQRCode, generateQRBuffer };
