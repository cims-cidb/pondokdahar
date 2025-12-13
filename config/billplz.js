const axios = require("axios");

const billplzClient = axios.create({
  baseURL: process.env.BILLPLZ_ENDPOINT || "https://www.billplz.com/api/v4",
  auth: {
    username: process.env.BILLPLZ_API_KEY || "",
    password: "", // Billplz uses API key as basic auth username; password empty
  },
});

module.exports = { billplzClient };
