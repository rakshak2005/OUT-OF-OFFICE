import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD; 

const hasCredentials = EMAIL_USER && EMAIL_PASSWORD;

const transporter = hasCredentials
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    })
  : null;

if (!hasCredentials) {
  console.log('⚠️ [EmailService] Gmail credentials (EMAIL_USER & EMAIL_PASSWORD) not found in env. Running in CONSOLE MOCK mode.');
}

const getHtmlEnvelope = (title: string, bodyContent: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #faf8ff;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 35, 111, 0.05);
          border: 1px solid #eef2ff;
        }
        .header {
          background: linear-gradient(135deg, #00236f 0%, #1e3a8a 100%);
          padding: 40px 30px;
          text-align: center;
          color: #ffffff;
        }
        .logo {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 5px;
          display: inline-block;
          border: 2px solid #ffffff;
          padding: 5px 15px;
          border-radius: 8px;
        }
        .subtitle {
          font-size: 10px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          opacity: 0.7;
          margin-top: 10px;
          font-weight: bold;
        }
        .content {
          padding: 40px 30px;
          color: #444651;
          line-height: 1.6;
        }
        .footer {
          background-color: #f8fafc;
          padding: 20px 30px;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          border-top: 1px solid #f1f5f9;
        }
        .btn {
          display: inline-block;
          padding: 14px 30px;
          background-color: #00236f;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 12px;
          font-weight: bold;
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 20px;
          box-shadow: 0 4px 12px rgba(0, 35, 111, 0.15);
        }
        .btn:hover {
          background-color: #1e3a8a;
        }
        h2 {
          color: #00236f;
          margin-top: 0;
          font-size: 20px;
          font-weight: 700;
        }
        .highlight {
          background-color: #f0f4ff;
          border-left: 4px solid #00236f;
          padding: 15px;
          border-radius: 0 12px 12px 0;
          margin: 20px 0;
        }
        .grid {
          display: table;
          width: 100%;
          margin: 20px 0;
        }
        .grid-row {
          display: table-row;
        }
        .grid-cell-label {
          display: table-cell;
          font-weight: bold;
          padding: 8px 0;
          color: #64748b;
          font-size: 12px;
          text-transform: uppercase;
          width: 30%;
        }
        .grid-cell-val {
          display: table-cell;
          padding: 8px 0;
          color: #00236f;
          font-weight: 600;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">OOO</div>
          <div class="subtitle">Out Of Office</div>
        </div>
        <div class="content">
          ${bodyContent}
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} Out Of Office Portal. All Rights Reserved.<br>
          This is an automated system notification. Please do not reply directly to this email.
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendEmail = async (to: string, subject: string, htmlContent: string) => {
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Out of Office Support" <${EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent,
      });
      console.log(`✉️ [EmailService] Sent email to ${to}: "${subject}"`);
    } catch (error) {
      console.error(`❌ [EmailService] Failed to send email to ${to}:`, error);
    }
  } else {
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✉️ [MOCK EMAIL SENT]`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body Snippet:`);
    console.log(htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').substring(0, 300) + '...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
};

export const emailService = {
  
  async sendLoginNotificationEmail(to: string, userName: string, loginTime: string) {
    const title = 'Successful Account Login';
    const body = `
      <h2>Hello, ${userName}</h2>
      <p>This email is to notify you that a successful login just occurred on your <strong>Out Of Office</strong> Leave Management Account.</p>
      
      <div class="highlight">
        <div class="grid">
          <div class="grid-row">
            <div class="grid-cell-label">Date & Time:</div>
            <div class="grid-cell-val">${loginTime}</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell-label">Account:</div>
            <div class="grid-cell-val">${to}</div>
          </div>
        </div>
      </div>
      
      <p>If this was you, no action is required. If you did not perform this login, please immediately contact your system administrator or reset your password.</p>
    `;
    const html = getHtmlEnvelope(title, body);
    await sendEmail(to, `🔐 OOO Login Notification: Successful Sign-in`, html);
  },

  
  async sendHolidayReminderEmail(to: string, userName: string, holidayName: string, holidayDate: string) {
    const title = 'Upcoming Holiday Reminder';
    const body = `
      <h2>Hello, ${userName}</h2>
      <p>This is an automated operational alert to remind you of an official company holiday tomorrow!</p>
      
      <div class="highlight">
        <div class="grid">
          <div class="grid-row">
            <div class="grid-cell-label">Holiday Name:</div>
            <div class="grid-cell-val" style="color: #ea580c;">🎉 ${holidayName}</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell-label">Date:</div>
            <div class="grid-cell-val">${holidayDate}</div>
          </div>
        </div>
      </div>
      
      <p>Enjoy your well-deserved break! The office will be officially closed for operations during this period.</p>
      <center><a href="http://localhost:5173/app/holidays" class="btn">View Holiday Calendar</a></center>
    `;
    const html = getHtmlEnvelope(title, body);
    await sendEmail(to, `🎉 Holiday Reminder: ${holidayName} is tomorrow!`, html);
  },

  
  async sendLeaveStatusEmail(
    to: string,
    userName: string,
    leaveType: string,
    fromDate: string,
    toDate: string,
    days: number,
    status: 'approved' | 'rejected',
    approverName: string,
    remarks?: string
  ) {
    const isApproved = status === 'approved';
    const statusText = isApproved ? 'APPROVED' : 'DENIED';
    const color = isApproved ? '#10b981' : '#ef4444';
    const emoji = isApproved ? '✅' : '❌';
    
    const title = `Leave Request ${statusText}`;
    const body = `
      <h2>Hello, ${userName}</h2>
      <p>Your leave request has been officially reviewed and processed by the administration desk.</p>
      
      <div class="highlight" style="border-left-color: ${color};">
        <div class="grid">
          <div class="grid-row">
            <div class="grid-cell-label">Leave Type:</div>
            <div class="grid-cell-val">${leaveType.toUpperCase()}</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell-label">Duration:</div>
            <div class="grid-cell-val">${days} Day(s)</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell-label">Period:</div>
            <div class="grid-cell-val">${fromDate} to ${toDate}</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell-label">Decision:</div>
            <div class="grid-cell-val" style="color: ${color}; font-weight: 800;">${emoji} ${statusText}</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell-label">Reviewed By:</div>
            <div class="grid-cell-val">${approverName}</div>
          </div>
        </div>
      </div>
      
      ${remarks ? `<p><strong>Administrative Remarks:</strong> <span style="font-style: italic; color: #64748b;">"${remarks}"</span></p>` : ''}
      
      <center><a href="http://localhost:5173/app/my-leaves" class="btn">View Leave Logs</a></center>
    `;
    const html = getHtmlEnvelope(title, body);
    await sendEmail(to, `${emoji} Leave Request ${statusText}: ${leaveType} Leave`, html);
  },

  
  async sendLeavePendingApprovalEmail(
    managerEmail: string,
    managerName: string,
    employeeName: string,
    leaveType: string,
    fromDate: string,
    toDate: string,
    days: number,
    reason: string
  ) {
    const title = 'Authorization Request Pending';
    const body = `
      <h2>Hello, ${managerName}</h2>
      <p>A new leave application has been submitted by an employee in your department and requires your immediate strategic review and authorization.</p>
      
      <div class="highlight">
        <div class="grid">
          <div class="grid-row">
            <div class="grid-cell-label">Applicant:</div>
            <div class="grid-cell-val" style="color: #00236f;">👤 ${employeeName}</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell-label">Leave Type:</div>
            <div class="grid-cell-val">${leaveType.toUpperCase()}</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell-label">Duration:</div>
            <div class="grid-cell-val">${days} Day(s)</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell-label">Period:</div>
            <div class="grid-cell-val">${fromDate} to ${toDate}</div>
          </div>
        </div>
      </div>
      
      <p><strong>Employee Stated Reason:</strong> <span style="font-style: italic; color: #64748b;">"${reason}"</span></p>
      
      <p>Please log in to the administrative command center to authorize or deny this request.</p>
      <center><a href="http://localhost:5173/app/approve-leaves" class="btn">Go To Approval Desk</a></center>
    `;
    const html = getHtmlEnvelope(title, body);
    await sendEmail(managerEmail, `⏳ Action Required: Leave Approval Request for ${employeeName}`, html);
  },
};
