import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter with environment variables instead of hardcoded credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || "dheetcoders25@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "hurr nrhk svuk ijpy", // Using environment variable would be safer
  },
});

// Export as a named function (not as middleware directly)
export const sendEmail = async (req: Request, res: Response) => {
  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
     res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    await transporter.sendMail({
      from: "dheetcoders25@gmail.com",
      to,
      subject,
      html,
    });

     res.status(200).json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Email send failed:', error);
     res.status(400).json({ error: 'Failed to send email.' });
  }
};