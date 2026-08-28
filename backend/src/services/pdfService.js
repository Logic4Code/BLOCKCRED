const PDFDocument = require('pdfkit');
const { generateQRBuffer } = require('./qrService');

/**
 * Generate a credential PDF certificate
 * @param {Object} credential - Credential data block
 * @param {string} verifyUrl - Verification URL for QR
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generateCredentialPDF(credential, verifyUrl) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 40, bottom: 40, left: 60, right: 60 }
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      // ─── Background ───────────────────────────────────────────────
      doc.rect(0, 0, pageWidth, pageHeight).fill('#0a0a1a');

      // Outer border (neon cyan)
      doc.rect(20, 20, pageWidth - 40, pageHeight - 40)
        .lineWidth(3)
        .stroke('#00e5ff');

      // Inner border (neon green)
      doc.rect(28, 28, pageWidth - 56, pageHeight - 56)
        .lineWidth(1)
        .stroke('#00ff9d');

      // Corner decorations
      const corners = [[30, 30], [pageWidth - 60, 30], [30, pageHeight - 60], [pageWidth - 60, pageHeight - 60]];
      corners.forEach(([x, y]) => {
        doc.rect(x, y, 30, 30).lineWidth(2).stroke('#7c3aed');
      });

      // ─── Header ───────────────────────────────────────────────────
      doc.fontSize(10).fillColor('#00e5ff')
        .text('BLOCKCHAIN-SECURED CREDENTIAL', 0, 50, { align: 'center' });

      doc.fontSize(28).fillColor('#ffffff')
        .font('Helvetica-Bold')
        .text('CERTIFICATE OF ACHIEVEMENT', 0, 72, { align: 'center' });

      doc.moveDown(0.3);
      doc.fontSize(11).fillColor('#00ff9d')
        .font('Helvetica')
        .text('This is to certify that', 0, doc.y, { align: 'center' });

      // ─── Student Name ─────────────────────────────────────────────
      doc.fontSize(32).fillColor('#ffd700')
        .font('Helvetica-Bold')
        .text(credential.studentName, 0, doc.y + 10, { align: 'center' });

      doc.fontSize(11).fillColor('#a0aec0')
        .font('Helvetica')
        .text(`Student ID: ${credential.studentId}`, 0, doc.y + 8, { align: 'center' });

      // ─── Credential Details ───────────────────────────────────────
      doc.fontSize(13).fillColor('#ffffff')
        .text('has successfully completed', 0, doc.y + 14, { align: 'center' });

      doc.fontSize(20).fillColor('#00e5ff')
        .font('Helvetica-Bold')
        .text(credential.course, 0, doc.y + 8, { align: 'center' });

      doc.fontSize(12).fillColor('#a0aec0')
        .font('Helvetica')
        .text(`Specialization: ${credential.specialization || 'N/A'}`, 0, doc.y + 6, { align: 'center' });

      // ─── Grade + CGPA row ─────────────────────────────────────────
      const detailY = doc.y + 18;
      const col1X = 120, col2X = 320, col3X = 520;

      doc.fontSize(10).fillColor('#00ff9d').text('GRADE', col1X, detailY, { width: 120, align: 'center' });
      doc.fontSize(10).fillColor('#00ff9d').text('CGPA', col2X, detailY, { width: 120, align: 'center' });
      doc.fontSize(10).fillColor('#00ff9d').text('YEAR', col3X, detailY, { width: 120, align: 'center' });

      doc.fontSize(22).fillColor('#ffd700').font('Helvetica-Bold')
        .text(credential.grade || 'A', col1X, detailY + 16, { width: 120, align: 'center' });
      doc.fontSize(22).fillColor('#ffd700')
        .text(credential.cgpa || '9.5', col2X, detailY + 16, { width: 120, align: 'center' });
      doc.fontSize(22).fillColor('#ffd700')
        .text(credential.yearOfPassing || new Date().getFullYear().toString(), col3X, detailY + 16, { width: 120, align: 'center' });

      // ─── Issuer ───────────────────────────────────────────────────
      const issuerY = detailY + 60;
      doc.fontSize(13).fillColor('#ffffff').font('Helvetica')
        .text('Issued by', 0, issuerY, { align: 'center' });
      doc.fontSize(16).fillColor('#00e5ff').font('Helvetica-Bold')
        .text(credential.issuerName, 0, doc.y + 4, { align: 'center' });
      doc.fontSize(10).fillColor('#a0aec0').font('Helvetica')
        .text(`Date of Issue: ${new Date(credential.issuedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, 0, doc.y + 4, { align: 'center' });

      // ─── QR Code ──────────────────────────────────────────────────
      const qrBuffer = await generateQRBuffer(verifyUrl);
      const qrSize = 90;
      const qrX = pageWidth - 160;
      const qrY = pageHeight - 160;

      // QR border
      doc.rect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12).fill('#0f1729');
      doc.rect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12).lineWidth(1).stroke('#00ff9d');
      doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });
      doc.fontSize(7).fillColor('#00ff9d')
        .text('SCAN TO VERIFY', qrX - 6, qrY + qrSize + 8, { width: qrSize + 12, align: 'center' });

      // ─── Hash strip ───────────────────────────────────────────────
      const hashY = pageHeight - 52;
      doc.rect(60, hashY, pageWidth - 120, 24).fill('#0f1729');
      doc.fontSize(7).fillColor('#00ff9d')
        .text(`BLOCKCHAIN HASH: ${credential.blockHash}`, 60, hashY + 8, {
          width: pageWidth - 120,
          align: 'center'
        });

      // ─── Credential ID strip ──────────────────────────────────────
      doc.fontSize(8).fillColor('#a0aec0')
        .text(`Credential ID: ${credential.credentialId}  |  Block #${credential.blockIndex}  |  This document is cryptographically secured.`, 60, hashY - 16, {
          width: pageWidth - 120,
          align: 'center'
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateCredentialPDF };
