import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function sendEmail(to, subject, html) {
  console.log("Sending email to:", to);

  const info = await transporter.sendMail({
    from: `"Task Manager" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log("Accepted:", info.accepted);
  console.log("Rejected:", info.rejected);
  console.log("Response:", info.response);

  return info;
}