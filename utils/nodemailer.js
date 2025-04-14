import nodemailer from 'nodemailer';
import 'dotenv/config';

const { USER_EMAIL, PASSWORD_EMAIL, NAME_EMAIL } = process.env;

export const transporter = nodemailer.createTransport({
  pool: true,
  maxConnections: 10,
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: USER_EMAIL,
    pass: PASSWORD_EMAIL,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendEmail = async ({ email, subject, text, html }) => {
  const maxAttempts = 3;
  let attempts = 0;
  let send = false;
  while (attempts < maxAttempts) {
    try {
      await transporter.sendMail({
        from: NAME_EMAIL + ' <' + USER_EMAIL + '>',
        to: email,
        subject: subject,
        text: text,
        html: html,
      });
      send = true;
      break;
    } catch (error) {
      console.log('Error al enviar email: ', error);
      send = false;
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
      }
    }
  }
  return send;
};
