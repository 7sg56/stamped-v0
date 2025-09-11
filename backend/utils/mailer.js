const nodemailer = require('nodemailer');

/**
 * Email Service for sending registration confirmations with QR codes
 */

/**
 * Create email transporter with SMTP configuration
 * @returns {Object} Nodemailer transporter
 */
function createTransporter() {
  const config = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  };

  // Validate required environment variables
  if (!config.host || !config.auth.user || !config.auth.pass) {
    throw new Error('Email configuration incomplete. Please check EMAIL_HOST, EMAIL_USER, and EMAIL_PASS environment variables.');
  }

  return nodemailer.createTransport(config);
}

/**
 * Generate HTML email template for registration confirmation
 * @param {Object} participant - Participant information
 * @param {Object} event - Event information
 * @returns {string} HTML email content
 */
function generateRegistrationEmailHTML(participant, event) {
  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Confirmation - ${event.title}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #007bff;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #007bff;
                margin: 0;
            }
            .event-details {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .event-details h3 {
                margin-top: 0;
                color: #007bff;
            }
            .qr-section {
                text-align: center;
                margin: 30px 0;
                padding: 20px;
                background-color: #e9ecef;
                border-radius: 5px;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
                font-size: 14px;
                color: #6c757d;
            }
            .highlight {
                background-color: #fff3cd;
                padding: 15px;
                border-radius: 5px;
                border-left: 4px solid #ffc107;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Registration Confirmed!</h1>
                <p>Thank you for registering for our event</p>
            </div>
            
            <p>Dear ${participant.name},</p>
            
            <p>Your registration has been successfully confirmed! We're excited to have you join us.</p>
            
            <div class="event-details">
                <h3>${event.title}</h3>
                <p><strong>Description:</strong> ${event.description}</p>
                <p><strong>Date & Time:</strong> ${eventDate}</p>
                <p><strong>Venue:</strong> ${event.venue}</p>
                <p><strong>Registration ID:</strong> ${participant.registrationId}</p>
            </div>
            
            <div class="highlight">
                <p><strong>Important:</strong> Please bring your QR code (attached to this email) to the event for quick check-in.</p>
            </div>
            
            <div class="qr-section">
                <h3>Your QR Code</h3>
                <p>Your unique QR code is attached to this email. You can also save it to your phone for easy access at the event.</p>
                <p><strong>File name:</strong> qr-code-${participant.registrationId}.png</p>
            </div>
            
            <div class="footer">
                <p>If you have any questions or need to make changes to your registration, please contact us.</p>
                <p>We look forward to seeing you at the event!</p>
                <p><em>This is an automated email. Please do not reply to this message.</em></p>
            </div>
        </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text email template for registration confirmation
 * @param {Object} participant - Participant information
 * @param {Object} event - Event information
 * @returns {string} Plain text email content
 */
function generateRegistrationEmailText(participant, event) {
  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
Registration Confirmed!

Dear ${participant.name},

Your registration has been successfully confirmed! We're excited to have you join us.

Event Details:
- Title: ${event.title}
- Description: ${event.description}
- Date & Time: ${eventDate}
- Venue: ${event.venue}
- Registration ID: ${participant.registrationId}

IMPORTANT: Please bring your QR code (attached to this email) to the event for quick check-in.

Your unique QR code is attached to this email as: qr-code-${participant.registrationId}.png

If you have any questions or need to make changes to your registration, please contact us.

We look forward to seeing you at the event!

This is an automated email. Please do not reply to this message.
  `.trim();
}

/**
 * Send registration confirmation email with QR code attachment
 * @param {Object} participant - Participant information
 * @param {Object} event - Event information
 * @param {Buffer} qrCodeBuffer - QR code image buffer
 * @returns {Promise<Object>} Email sending result
 */
async function sendRegistrationEmail(participant, event, qrCodeBuffer) {
  try {
    // Validate required parameters
    if (!participant || !event || !qrCodeBuffer) {
      throw new Error('Participant, event, and QR code buffer are required');
    }

    if (!participant.email || !participant.name || !participant.registrationId) {
      throw new Error('Participant must have email, name, and registrationId');
    }

    if (!event.title || !event.description || !event.date || !event.venue) {
      throw new Error('Event must have title, description, date, and venue');
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: participant.email,
      subject: `Registration Confirmed - ${event.title}`,
      text: generateRegistrationEmailText(participant, event),
      html: generateRegistrationEmailHTML(participant, event),
      attachments: [
        {
          filename: `qr-code-${participant.registrationId}.png`,
          content: qrCodeBuffer,
          contentType: 'image/png',
          cid: 'qrcode' // Content ID for referencing in HTML if needed
        }
      ]
    };

    const result = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };
  } catch (error) {
    throw new Error(`Failed to send registration email: ${error.message}`);
  }
}

/**
 * Verify email configuration
 * @returns {Promise<boolean>} True if configuration is valid
 */
async function verifyEmailConfig() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    throw new Error(`Email configuration verification failed: ${error.message}`);
  }
}

/**
 * Send test email to verify email service
 * @param {string} testEmail - Email address to send test to
 * @returns {Promise<Object>} Test email result
 */
async function sendTestEmail(testEmail) {
  try {
    if (!testEmail) {
      throw new Error('Test email address is required');
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: testEmail,
      subject: 'STAMPED Email Service Test',
      text: 'This is a test email from the STAMPED Event Management System. If you receive this, the email service is working correctly.',
      html: `
        <h2>STAMPED Email Service Test</h2>
        <p>This is a test email from the STAMPED Event Management System.</p>
        <p>If you receive this, the email service is working correctly.</p>
        <p><em>Sent at: ${new Date().toISOString()}</em></p>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };
  } catch (error) {
    throw new Error(`Failed to send test email: ${error.message}`);
  }
}

module.exports = {
  sendRegistrationEmail,
  verifyEmailConfig,
  sendTestEmail,
  generateRegistrationEmailHTML,
  generateRegistrationEmailText
};