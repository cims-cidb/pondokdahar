const axios = require("axios");

const WA_ENDPOINT = process.env.WHATSAPP_ENDPOINT || "";
const WA_TOKEN = process.env.WHATSAPP_TOKEN || "";

async function sendSupplierPaymentNotification({
  phone,
  supplierName,
  invoiceNo,
  amount,
  reference,
}) {
  if (!WA_ENDPOINT || !WA_TOKEN || !phone) {
    return;
  }

  const text =
    "Halo " +
    supplierName +
    ", pembayaran untuk invoice " +
    invoiceNo +
    " sejumlah RM" +
    Number(amount || 0).toFixed(2) +
    " telah berjaya diproses. Ref: " +
    reference +
    ".";

  try {
    await axios.post(
      WA_ENDPOINT,
      {
        to: phone,
        message: text,
      },
      {
        headers: {
          Authorization: "Bearer " + WA_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {}
}

module.exports = {
  sendSupplierPaymentNotification,
};
