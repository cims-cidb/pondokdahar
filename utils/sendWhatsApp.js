const { whatsappClient } = require("../config/whatsapp");

async function sendWhatsAppMessage({ phone, message }) {
  // Adjust payload according to provider (Fonnte / Wablas / etc.)
  const payload = {
    target: phone,
    message,
  };

  const { data } = await whatsappClient.post("/send", payload);
  return data;
}

module.exports = { sendWhatsAppMessage };
