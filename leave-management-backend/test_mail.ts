import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

console.log('🔍 Loaded SMTP settings from .env:');
console.log('EMAIL_USER:', EMAIL_USER);
console.log('EMAIL_PASSWORD:', EMAIL_PASSWORD ? '••••••••••••••••' : '(empty)');

if (!EMAIL_USER || !EMAIL_PASSWORD) {
  console.error('❌ Error: EMAIL_USER or EMAIL_PASSWORD is missing in your .env file!');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

const run = async () => {
  console.log('⏳ Attempting to send a test email using Gmail SMTP...');
  try {
    const info = await transporter.sendMail({
      from: `"OOO Portal Tester" <${EMAIL_USER}>`,
      to: 'rakshakpatel2005@gmail.com',
      subject: '📧 OOO Portal: SMTP Connection Test Success!',
      text: 'Congratulations! Your Gmail dispenser credentials are fully working and successfully connected to the OOO Leave Management Portal.',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 500px; margin: auto;">
          <h2 style="color: #00236f;">🎉 Connection Test Successful!</h2>
          <p>This is a real test email confirming that your dispensing Gmail account is fully configured and delivering emails successfully.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b;">Dispensing Sender: ${EMAIL_USER}</p>
        </div>
      `,
    });
    console.log('✅ Success! Email sent successfully.');
    console.log('Message ID:', info.messageId);
    console.log('Recipient: rakshakpatel2005@gmail.com');
  } catch (error: any) {
    console.error('❌ SMTP Error encountered:');
    console.error(error);
  }
  process.exit(0);
};

run();
