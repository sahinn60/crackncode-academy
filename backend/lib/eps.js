const crypto = require("crypto");

const EPS_BASE_URL = process.env.EPS_BASE_URL || "https://pgapi.eps.com.bd/v1/EPSEngine";
const EPS_MERCHANT_ID = process.env.EPS_MERCHANT_ID;
const EPS_API_KEY = process.env.EPS_API_KEY;
const EPS_SECRET_KEY = process.env.EPS_SECRET_KEY;

// Generate unique merchant transaction ID
function generateMerchantTxnId() {
  const now = new Date();
  const ts = now.getFullYear().toString()
    + String(now.getMonth() + 1).padStart(2, "0")
    + String(now.getDate()).padStart(2, "0")
    + String(now.getHours()).padStart(2, "0")
    + String(now.getMinutes()).padStart(2, "0")
    + String(now.getSeconds()).padStart(2, "0")
    + String(now.getMilliseconds()).padStart(3, "0");
  return ts + Math.floor(Math.random() * 1000).toString().padStart(3, "0");
}

// Initiate EPS payment — returns redirect URL
async function initiatePayment({ orderId, amount, customerName, customerEmail, customerPhone, successUrl, failUrl, cancelUrl, merchantTransactionId }) {
  const txnId = merchantTransactionId || generateMerchantTxnId();

  // If EPS credentials not configured, use mock mode
  if (!EPS_MERCHANT_ID || EPS_MERCHANT_ID === "your_merchant_id") {
    console.warn("[EPS] Credentials not set — using mock payment mode");
    return { paymentUrl: successUrl + "&mock=1", merchantTransactionId: txnId };
  }

  const payload = {
    merchantId: EPS_MERCHANT_ID,
    merchantTransactionId: txnId,
    amount: amount.toString(),
    currency: "BDT",
    customerName,
    customerEmail,
    customerPhone,
    successUrl,
    failUrl,
    cancelUrl,
    remarks: `Order ${orderId}`,
  };

  const response = await fetch(`${EPS_BASE_URL}/InitiatePayment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apiKey": EPS_API_KEY },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  if (!text) throw new Error("EPS returned empty response");

  let data;
  try { data = JSON.parse(text); }
  catch (_) { throw new Error("EPS returned invalid JSON: " + text.slice(0, 100)); }

  if (!response.ok || !data.paymentUrl) {
    throw new Error(data.message || data.error || "EPS payment initiation failed");
  }

  return { paymentUrl: data.paymentUrl, merchantTransactionId: txnId };
}

// Verify EPS transaction status
async function checkTransactionStatus(merchantTransactionId, epsTransactionId) {
  const url = `${EPS_BASE_URL}/CheckMerchantTransactionStatus?merchantTransactionId=${merchantTransactionId}&EPSTransactionId=${epsTransactionId}`;
  const response = await fetch(url, {
    headers: { "apiKey": EPS_API_KEY },
  });
  return await response.json();
}

module.exports = { initiatePayment, checkTransactionStatus, generateMerchantTxnId };
