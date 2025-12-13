const { createEmailTransporter } = require("../config/email");

async function sendEmail({ to, subject, html }) {
  const transporter = createEmailTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
  return info;
}

module.exports = { sendEmail };
