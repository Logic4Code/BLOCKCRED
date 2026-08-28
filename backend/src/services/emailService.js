const nodemailer = require('nodemailer');

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  // Use Ethereal test account (no real SMTP needed for demo)
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  console.log('\n📧 Email Test Account Created:');
  console.log('   User:', testAccount.user);
  console.log('   Pass:', testAccount.pass);
  console.log('   Preview URL: https://ethereal.email/login\n');

  return transporter;
}

/**
 * Send credential email to student with QR code and PDF attachment
 */
async function sendCredentialEmail({ to, studentName, credentialId, blockHash, qrDataURL, pdfBuffer, verifyUrl, issuerName, course }) {
  const transport = await getTransporter();

  // Convert base64 QR to buffer for inline attachment
  const qrBase64 = qrDataURL.split(',')[1];
  const qrBuffer = Buffer.from(qrBase64, 'base64');

  const mailOptions = {
    from: '"BlockCred System" <noreply@blockcred.io>',
    to,
    subject: `🎓 Your Credential Certificate — ${course} | BlockCred`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; background: #0a0a1a; font-family: 'Segoe UI', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #0f1729; border: 1px solid #00e5ff33; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0f1729 0%, #1a0533 100%); padding: 40px 30px; text-align: center; border-bottom: 2px solid #00e5ff; }
    .logo { font-size: 28px; font-weight: 900; color: #00e5ff; letter-spacing: 4px; margin-bottom: 4px; }
    .logo span { color: #00ff9d; }
    .tagline { color: #a0aec0; font-size: 12px; letter-spacing: 2px; }
    .badge { display: inline-block; background: #00ff9d22; border: 1px solid #00ff9d; color: #00ff9d; padding: 4px 12px; border-radius: 20px; font-size: 11px; margin-top: 12px; }
    .body { padding: 36px 30px; }
    .greeting { color: #ffffff; font-size: 18px; margin-bottom: 8px; }
    .sub { color: #a0aec0; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
    .cred-card { background: #1a2744; border: 1px solid #00e5ff33; border-radius: 10px; padding: 24px; margin: 20px 0; }
    .cred-card h3 { color: #00e5ff; font-size: 13px; letter-spacing: 2px; margin: 0 0 16px; text-transform: uppercase; }
    .field { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ffffff11; }
    .field:last-child { border-bottom: none; }
    .field-label { color: #a0aec0; font-size: 13px; }
    .field-value { color: #ffffff; font-size: 13px; font-weight: 600; }
    .hash-box { background: #0a0a1a; border: 1px solid #00ff9d44; border-radius: 8px; padding: 14px; margin: 20px 0; word-break: break-all; }
    .hash-label { color: #00ff9d; font-size: 11px; letter-spacing: 2px; margin-bottom: 6px; }
    .hash-value { color: #e2e8f0; font-size: 11px; font-family: monospace; }
    .qr-section { text-align: center; padding: 24px 0; }
    .qr-section img { border: 2px solid #00ff9d; border-radius: 8px; padding: 8px; background: #0a0a1a; }
    .qr-label { color: #a0aec0; font-size: 12px; margin-top: 10px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #00e5ff, #00ff9d); color: #0a0a1a; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; letter-spacing: 1px; margin: 20px 0; }
    .footer { background: #080812; padding: 20px 30px; text-align: center; border-top: 1px solid #ffffff11; }
    .footer p { color: #4a5568; font-size: 11px; margin: 4px 0; }
    .warning { background: #2d1b00; border: 1px solid #f6ad55; border-radius: 8px; padding: 14px; margin: 20px 0; color: #fbd38d; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">BLOCK<span>CRED</span></div>
      <div class="tagline">BLOCKCHAIN CREDENTIAL VERIFICATION SYSTEM</div>
      <div class="badge">✓ CRYPTOGRAPHICALLY SECURED</div>
    </div>
    <div class="body">
      <div class="greeting">Hello, ${studentName} 👋</div>
      <p class="sub">
        Congratulations! Your academic credential has been successfully issued and recorded on the BlockCred blockchain. 
        Your certificate is now tamper-proof and instantly verifiable by any employer or institution.
      </p>

      <div class="cred-card">
        <h3>🔗 Credential Details</h3>
        <div class="field">
          <span class="field-label">Credential ID</span>
          <span class="field-value">${credentialId}</span>
        </div>
        <div class="field">
          <span class="field-label">Course</span>
          <span class="field-value">${course}</span>
        </div>
        <div class="field">
          <span class="field-label">Issued By</span>
          <span class="field-value">${issuerName}</span>
        </div>
        <div class="field">
          <span class="field-label">Issue Date</span>
          <span class="field-value">${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div class="field">
          <span class="field-label">Status</span>
          <span class="field-value" style="color: #00ff9d;">✓ ACTIVE &amp; VERIFIED</span>
        </div>
      </div>

      <div class="hash-box">
        <div class="hash-label">🔐 BLOCKCHAIN HASH</div>
        <div class="hash-value">${blockHash}</div>
      </div>

      <div class="qr-section">
        <p style="color: #a0aec0; font-size: 13px; margin-bottom: 12px;">Share this QR code with employers for instant verification:</p>
        <img src="cid:qrcode" alt="Verification QR Code" width="150" height="150" />
        <div class="qr-label">📱 Scan to verify instantly — no login required</div>
      </div>

      <div style="text-align: center;">
        <a href="${verifyUrl}" class="btn">🔍 Verify Online</a>
      </div>

      <div class="warning">
        ⚠️ <strong>Keep this safe!</strong> Your credential hash is your unique identifier. 
        If you need corrections, log into the Student Portal and submit a Modification Request.
        A new credential with updated details will be issued.
      </div>
    </div>
    <div class="footer">
      <p>Your PDF certificate is attached to this email.</p>
      <p>BlockCred — Immutable. Instant. Trustworthy.</p>
      <p style="color: #2d3748;">This is an automated message. Do not reply.</p>
    </div>
  </div>
</body>
</html>
    `,
    attachments: [
      {
        filename: `credential_${credentialId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      },
      {
        filename: 'qrcode.png',
        content: qrBuffer,
        contentType: 'image/png',
        cid: 'qrcode'
      }
    ]
  };

  const info = await transport.sendMail(mailOptions);
  const previewUrl = nodemailer.getTestMessageUrl(info);

  console.log(`\n📧 Credential email sent for ${credentialId}`);
  if (previewUrl) {
    console.log('   📬 Preview URL:', previewUrl);
  }

  return { messageId: info.messageId, previewUrl };
}

/**
 * Send modification approval notification
 */
async function sendModificationEmail({ to, studentName, credentialId, newHash, verifyUrl, changes }) {
  const transport = await getTransporter();

  const info = await transport.sendMail({
    from: '"BlockCred System" <noreply@blockcred.io>',
    to,
    subject: `✅ Credential Updated — New Hash Issued | BlockCred`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  body { background: #0a0a1a; font-family: Arial, sans-serif; }
  .container { max-width: 580px; margin: 0 auto; background: #0f1729; border: 1px solid #00e5ff33; border-radius: 12px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #0f1729, #1a0533); padding: 30px; text-align: center; border-bottom: 2px solid #00ff9d; }
  .logo { font-size: 24px; font-weight: 900; color: #00e5ff; letter-spacing: 4px; }
  .logo span { color: #00ff9d; }
  .body { padding: 30px; color: #e2e8f0; }
  .hash-box { background: #0a0a1a; border: 1px solid #00ff9d44; border-radius: 8px; padding: 14px; margin: 16px 0; }
  .hash-label { color: #00ff9d; font-size: 11px; letter-spacing: 2px; }
  .hash-value { color: #e2e8f0; font-size: 11px; font-family: monospace; word-break: break-all; }
  .btn { display: inline-block; background: linear-gradient(135deg, #00e5ff, #00ff9d); color: #0a0a1a; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo">BLOCK<span>CRED</span></div>
  </div>
  <div class="body">
    <h2 style="color:#00ff9d">Credential Successfully Updated</h2>
    <p>Hello ${studentName},</p>
    <p>Your modification request for credential <strong>${credentialId}</strong> has been approved and processed. A new credential block has been added to the blockchain with the updated information.</p>
    <p><strong>Changes applied:</strong> ${changes}</p>
    <div class="hash-box">
      <div class="hash-label">🔐 NEW BLOCKCHAIN HASH</div>
      <div class="hash-value">${newHash}</div>
    </div>
    <p>Your old QR code is now superseded. Please use the new credential for all verification purposes.</p>
    <a href="${verifyUrl}" class="btn">View New Credential</a>
  </div>
</div>
</body>
</html>
    `
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) console.log('📬 Modification email preview:', previewUrl);
  return { messageId: info.messageId, previewUrl };
}

module.exports = { sendCredentialEmail, sendModificationEmail };
