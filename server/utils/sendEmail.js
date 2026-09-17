import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const senderEmail = process.env.EMAIL_USER || "attendancesystemcec@gmail.com";
    const senderPass = process.env.EMAIL_PASS;

    // Check if configured with valid SMTP credentials
    if (senderEmail && senderPass && senderEmail !== "dev@example.com" && senderPass !== "devpass") {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: senderEmail,
          pass: senderPass,
        },
      });

      // Target recipient email (fallback to admin email if recipient is dummy domain or invalid)
      let recipient = to ? to.trim() : senderEmail;
      if (!recipient || recipient.includes("example.com") || recipient.includes("citizen.gov.in") || !recipient.includes("@")) {
        recipient = senderEmail;
      }

      const plainText = html ? html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : subject;
      const sanitizedSubject = subject ? subject.replace(/^[\u1F600-\u1F6FF\u2600-\u26FF\u2700-\u27BF\s]+/, "").trim() : "Smart Civic Notification";

      const mailOptions = {
        from: `"Smart Civic Portal" <${senderEmail}>`,
        replyTo: `"Smart Civic Helpdesk" <${senderEmail}>`,
        to: recipient,
        subject: sanitizedSubject || subject,
        text: plainText,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Live Email dispatched successfully to ${recipient} (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    }

    // Fallback: Log email details cleanly in server console for demo mode
    console.log(`\n================= 📧 DISPATCHED EMAIL NOTIFICATION =================`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`STATUS: Logged in Dev Console`);
    console.log(`===================================================================\n`);
    return { success: true, mode: "console" };
  } catch (err) {
    console.error("❌ Email dispatch error:", err.message);
    return { success: false, error: err.message };
  }
};