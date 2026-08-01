import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    // If real Gmail credentials provided in process.env
    if (
      process.env.EMAIL_USER &&
      process.env.EMAIL_USER !== "dev@example.com" &&
      process.env.EMAIL_PASS &&
      process.env.EMAIL_PASS !== "devpass"
    ) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Smart Civic Portal" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });

      console.log(`✅ Live Email dispatched successfully to: ${to}`);
      return;
    }

    // Fallback: Log email details cleanly in server console for demo mode
    console.log(`\n================= 📧 DISPATCHED EMAIL NOTIFICATION =================`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`STATUS: Logged in Dev Console (Configure Gmail App Password in server/.env to send to real inbox)`);
    console.log(`===================================================================\n`);
  } catch (err) {
    console.error("❌ Email dispatch error:", err.message);
  }
};