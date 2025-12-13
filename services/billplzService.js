const axios = require("axios");

const BILLPLZ_API_KEY = process.env.BILLPLZ_API_KEY || "";
const BILLPLZ_ENDPOINT =
  process.env.BILLPLZ_ENDPOINT ||
  "https://www.billplz.com/api/v4/open_collection";

async function payToSupplier({
  bankName,
  accountNumber,
  amount,
  reference,
  description,
}) {
  const amountInSen = Math.round(Number(amount || 0) * 100);

  if (!BILLPLZ_API_KEY) {
    return {
      success: true,
      reference: `SIM-${Date.now()}`,
    };
  }

  try {
    const payload = {
      bank_name: bankName,
      bank_account: accountNumber,
      amount: amountInSen,
      reference,
      description,
    };

    const res = await axios.post(BILLPLZ_ENDPOINT, payload, {
      auth: {
        username: BILLPLZ_API_KEY,
        password: "",
      },
    });

    return {
      success: true,
      reference: res.data && res.data.id ? res.data.id : reference,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "billplz_error",
    };
  }
}

module.exports = {
  payToSupplier,
};
