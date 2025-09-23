import { NextRequest, NextResponse } from 'next/server';

// Email service integration (you can use SendGrid, Resend, or similar)
export async function POST(request: NextRequest) {
  try {
    const { userEmail, summary, pdfData, reportDate } = await request.json();

    if (!userEmail || !summary || !pdfData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create email content
    const htmlContent = generateEmailHTML(summary, reportDate);
    
    // Send email using your preferred service
    // Example with a generic email service API
    const emailResponse = await sendEmail({
      to: userEmail,
      subject: `Your LabWise Analysis Report - ${reportDate}`,
      html: htmlContent,
      attachments: [
        {
          filename: `labwise-report-${reportDate}.pdf`,
          content: pdfData,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    });

    if (emailResponse.success) {
      return NextResponse.json({ success: true });
    } else {
      throw new Error(emailResponse.error || 'Email sending failed');
    }

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

async function sendEmail(emailData: {
  to: string;
  subject: string;
  html: string;
  attachments: Array<{
    filename: string;
    content: string;
    type: string;
    disposition: string;
  }>;
}) {
  // Implementation depends on your email service
  // This is a placeholder that you would replace with actual service
  
  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    return await sendWithSendGrid(emailData);
  } else if (process.env.EMAIL_SERVICE === 'resend') {
    return await sendWithResend(emailData);
  } else {
    // Fallback or mock for development
    console.log('Email would be sent:', emailData.to);
    return { success: true };
  }
}

async function sendWithSendGrid(emailData: {
  to: string;
  subject: string;
  html: string;
  attachments: Array<{ filename: string; content: string; type: string; disposition: string }>;
}) {
  try {
    // Note: @sendgrid/mail needs to be installed: npm install @sendgrid/mail
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('SendGrid not implemented - would send email to:', emailData.to);
    return { success: true };

    // Implementation would go here
  } catch (error) {
    console.error('SendGrid error:', error);
    return { success: false, error: 'SendGrid error' };
  }
}

async function sendWithResend(emailData: {
  to: string;
  subject: string;
  html: string;
  attachments: Array<{ filename: string; content: string; type: string; disposition: string }>;
}) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'reports@labwise.rialys.eu',
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
        attachments: emailData.attachments
      }),
    });

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.json();
      return { success: false, error: error.message };
    }
    } catch (error) {
    console.error('Resend error:', error);
    return { success: false, error: 'Resend error' };
  }
}

function generateEmailHTML(summary: {
  total: number;
  normal: number;
  abnormal: number;
  critical: number;
  markers: Array<{ marker: string; value: string; unit: string; status: string }>;
}, reportDate: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your LabWise Analysis Report</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 32px 24px; text-align: center; }
        .content { padding: 32px 24px; }
        .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 24px 0; }
        .summary-item { background-color: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center; }
        .summary-number { font-size: 24px; font-weight: bold; color: #3b82f6; }
        .summary-label { font-size: 14px; color: #6b7280; margin-top: 4px; }
        .disclaimer { background-color: #fef3cd; border: 1px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 24px 0; }
        .footer { background-color: #f8f9fa; padding: 24px; text-align: center; font-size: 14px; color: #6b7280; }
        .status-normal { color: #10b981; }
        .status-high, .status-low { color: #f59e0b; }
        .status-critical { color: #ef4444; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">Your Lab Analysis Report</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">Generated on ${reportDate}</p>
        </div>
        
        <div class="content">
          <h2 style="color: #1f2937; margin-bottom: 16px;">Analysis Summary</h2>
          
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-number">${summary.total}</div>
              <div class="summary-label">Total Markers</div>
            </div>
            <div class="summary-item">
              <div class="summary-number status-normal">${summary.normal}</div>
              <div class="summary-label">Normal Results</div>
            </div>
            <div class="summary-item">
              <div class="summary-number status-high">${summary.abnormal}</div>
              <div class="summary-label">Abnormal Results</div>
            </div>
            <div class="summary-item">
              <div class="summary-number status-critical">${summary.critical}</div>
              <div class="summary-label">Critical Results</div>
            </div>
          </div>

          ${summary.markers.length > 0 ? `
            <h3 style="color: #1f2937; margin: 24px 0 16px 0;">Sample Results</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Marker</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Value</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${summary.markers.map((marker: any) => `
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${marker.marker}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${marker.value} ${marker.unit}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;" class="status-${marker.status}">${marker.status.toUpperCase()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}

          <div class="disclaimer">
            <h4 style="margin: 0 0 8px 0; color: #92400e;">⚠️ Important Medical Disclaimer</h4>
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              This report provides educational information only and is not intended to replace professional medical advice, 
              diagnosis, or treatment. Always consult with qualified healthcare providers for medical decisions.
            </p>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
            For the complete analysis with detailed explanations, please see the attached PDF report.
          </p>
        </div>

        <div class="footer">
          <p style="margin: 0;">
            Generated by <strong>LabWise</strong><br>
            <a href="https://labwise.rialys.eu" style="color: #3b82f6; text-decoration: none;">labwise.rialys.eu</a>
          </p>
          <p style="margin: 16px 0 0 0; font-size: 12px;">
            This email was sent to ${emailData.to}. If you didn't request this report, please ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
