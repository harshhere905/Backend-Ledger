import nodemailer from 'nodemailer'
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend_Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
const sendRegistrationEmail = async (userEmail, name) => {
    const subject = "Welcome to Backend Ledger 🚀";

    const text = `Hello ${name},

Welcome to Backend Ledger!

Your account has been successfully created and is now ready to use.

With Backend Ledger, you can:
• Create and manage accounts
• Track transactions
• Maintain accurate ledger records
• Monitor account activity

We're excited to have you on board.

Thank you for joining us!

— Backend Ledger Team 🚀`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
            
            <h1 style="color: #2563eb; text-align: center;">
                Welcome to Backend Ledger 🚀
            </h1>

            <p>Hello <strong>${name}</strong>,</p>

            <p>
                Your account has been <strong>successfully created</strong> and is now ready to use.
            </p>

            <p>
                Backend Ledger helps you manage accounts, track transactions,
                and maintain accurate financial records with ease.
            </p>

            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3>What you can do:</h3>
                <ul>
                    <li>Create and manage accounts</li>
                    <li>Track transactions securely</li>
                    <li>Maintain ledger entries</li>
                    <li>Monitor account activity</li>
                </ul>
            </div>

            <p>
                We're excited to have you as part of our community and look forward
                to helping you manage your financial records efficiently.
            </p>

            <hr style="margin: 25px 0; border: none; border-top: 1px solid #e5e7eb;">

            <p style="text-align: center;">
                Thank you for choosing <strong>Backend Ledger</strong> 🙌
            </p>

            <p style="text-align: center; color: #6b7280;">
                — Backend Ledger Team 🚀
            </p>
        </div>
    `;

    await sendEmail(userEmail, subject, text, html);
};
const sendTransactionEmail = async (
    userEmail,
    name,
    amount,
    fromAccount,
    toAccount
) => {
    const subject = "Transaction Alert - Backend Ledger 💸";

    const text = `Hello ${name},

A transaction of ₹${amount} has been successfully processed.

From Account: ${fromAccount}
To Account: ${toAccount}
Amount: ₹${amount}

If you did not authorize this transaction, please contact support immediately.

Thank you for using Backend Ledger.

- Backend Ledger Team`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2 style="color: #2563eb;">Transaction Alert 💸</h2>

            <p>Hello <strong>${name}</strong>,</p>

            <p>Your transaction has been successfully processed.</p>

            <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">₹${amount}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>From Account</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${fromAccount}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>To Account</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${toAccount}</td>
                </tr>
            </table>

            <p>If you did not authorize this transaction, please contact support immediately.</p>

            <br/>
            <p>Thank you for using <strong>Backend Ledger</strong>.</p>

            <p>— Backend Ledger Team 🚀</p>
        </div>
    `;

    await sendEmail(userEmail, subject, text, html);
};
const sendTransactionFailureEmail = async (
    userEmail,
    name,
    amount,
    fromAccount,
    toAccount,
    reason = "Unknown error"
) => {
    const subject = "Transaction Failed - Backend Ledger ❌";

    const text = `Hello ${name},

We were unable to process your transaction.

Transaction Details:
Amount: ₹${amount}
From Account: ${fromAccount}
To Account: ${toAccount}

Reason:
${reason}

No funds have been transferred successfully.

Please review the transaction details and try again.

Thank you for using Backend Ledger.

— Backend Ledger Team`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">

            <h2 style="color: #dc2626; text-align: center;">
                Transaction Failed ❌
            </h2>

            <p>Hello <strong>${name}</strong>,</p>

            <p>
                We were unable to process your transaction.
            </p>

            <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">₹${amount}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>From Account</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${fromAccount}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>To Account</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${toAccount}</td>
                </tr>
            </table>

            <div style="background-color: #fef2f2; padding: 12px; border-radius: 8px; margin: 15px 0;">
                <strong>Reason:</strong> ${reason}
            </div>

            <p>
                No funds have been transferred successfully.
            </p>

            <p>
                Please verify the details and try again.
            </p>

            <hr style="margin: 25px 0; border: none; border-top: 1px solid #e5e7eb;">

            <p style="text-align: center;">
                Thank you for using <strong>Backend Ledger</strong>.
            </p>

            <p style="text-align: center; color: #6b7280;">
                — Backend Ledger Team
            </p>
        </div>
    `;

    await sendEmail(userEmail, subject, text, html);
};

export {sendRegistrationEmail, sendTransactionEmail, sendTransactionFailureEmail}