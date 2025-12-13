const axios = require("axios");

const whatsappClient = axios.create({
  baseURL: process.env.WHATSAPP_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.WHATSAPP_API_KEY}`,
    "Content-Type": "application/json",
  },
});

module.exports = { whatsappClient };
