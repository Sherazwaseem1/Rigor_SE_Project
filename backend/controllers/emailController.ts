import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || "dheetcoders25@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "hurr nrhk svuk ijpy",
  },
});

// Exported controller
export const sendEmail = async (req: Request, res: Response) => {
  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
     res.status(400).json({ error: 'Missing required fields.' });  // ✅ return added
  }

  try {
    await transporter.sendMail({
      from: "dheetcoders25@gmail.com",
      to,
      subject,
      html,
    });

    res.status(200).json({ message: 'Email sent successfully.' });  // ✅ return added
  } catch (error) {
     res.status(500).json({ error: 'Failed to send email.' });  // ✅ return added
  }
};