// src/lib/mailer.ts
import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config();

// Use environment variables for security!
const emailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // or 'smtp.gmail.com'
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verify connection on startup
emailer.verify((error, _success) => {
    if (error) {
        // todo: Report this error to sentry or whatever
        console.error('❌ Mailer connection failed:', error);
    } else {
        console.log('📧 MAILER IS READY TO SEND EMAILS');
    }
});

export default emailer;
