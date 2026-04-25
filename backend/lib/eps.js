const crypto = require("crypto");

const EPS_BASE_URL   = process.env.EPS_BASE_URL   || "https://pgapi.eps.com.bd/v1";
const EPS_MERCHANT_ID = process.env.EPS_MERCHANT_ID;
const EPS_STORE_ID    = process.env.EPS_STORE_ID;
const EPS_USERNAME    = process.env.EPS_USERNAME;
const EPS_PASSWORD    = process.env.EPS_PASSWORD;
const EPS_HASH_KEY    = process.env.EPS_HASH_KEY   || "SFNLQHJlY2lwZXdhbGEjYTc3Zi1mOTQ5NWZhY2M2ZTZuZXQ=";

// ── Hash Generation ───────────────────────────────────────────
// Step 1: Decode Hash Key from Base64
// Step 2: Create HMACSHA512 using decoded key
// Step 3: Compute hash using the data string
// Step 4: Return Base64 string
function generateHash(data) {
  const keyBuffer = Buffer.from(EPS_HASH_KEY, "base64");
  const hmac = crypto.createHmac("sha512", keyBuffer);
  hmac.update(data, "utf8");
  return hmac.digest("base64");
}

// ── Generate unique merchant transaction ID ───────────────────
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

// ── API 01: Get Auth Token ────────────────────────────────────
async function getToken() {
  const xHash = generateHash(EPS_USERNAME);

  const response = await fetch(`${EPS_BASE_URL}/Auth/GetToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hash": xHash,
    },
    body: JSON.stringify({
      userName: EPS_USERNAME,
      password: EPS_PASSWORD,
    }),
  });

  const text = await response.text();
  if (!text) throw new Error("EPS GetToken: empty response");

  let data;
  try { data = JSON.parse(text); }
  catch (_) { throw new Error("EPS GetToken: invalid JSON — " + text.slice(0, 200)); }

  if (!data.token) throw new Error(data.errorMessage || "EPS GetToken failed");
  return data.token;
}

// ── API 02: Initialize Payment ────────────────────────────────
async function initiatePayment({
  orderId, amount, customerName, customerEmail, customerPhone,
  customerAddress = "Dhaka, Bangladesh",
  customerCity = "Dhaka", customerState = "Dhaka",
  customerPostcode = "1200", customerCountry = "BD",
  productName = "Course/Ebook", successUrl, failUrl, cancelUrl,
  merchantTransactionId,
}) {
  const isMockMode = !EPS_MERCHANT_ID || EPS_MERCHANT_ID === "your_merchant_id";
  if (isMockMode) {
    console.warn("[EPS] Mock mode — credentials not configured");
    const txnId = merchantTransactionId || generateMerchantTxnId();
    return { paymentUrl: successUrl + "&mock=1", merchantTransactionId: txnId };
  }

  const txnId = merchantTransactionId || generateMerchantTxnId();

  // Get bearer token
  const token = await getToken();

  // Hash is generated using merchantTransactionId
  const xHash = generateHash(txnId);

  const payload = {
    merchantId:            EPS_MERCHANT_ID,
    storeId:               EPS_STORE_ID,
    CustomerOrderId:       orderId,
    merchantTransactionId: txnId,
    transactionTypeId:     1,        // 1 = Web
    financialEntityId:     0,
    transitionStatusId:    0,
    totalAmount:           amount,
    ipAddress:             "127.0.0.1",
    version:               "1",
    successUrl,
    failUrl,
    cancelUrl,
    customerName,
    customerEmail,
    CustomerAddress:  customerAddress,
    CustomerAddress2: "",
    CustomerCity:     customerCity,
    CustomerState:    customerState,
    CustomerPostcode: customerPostcode,
    CustomerCountry:  customerCountry,
    CustomerPhone:    customerPhone,
    ShipmentName:     customerName,
    ShipmentAddress:  customerAddress,
    ShipmentAddress2: "",
    ShipmentCity:     customerCity,
    ShipmentState:    customerState,
    ShipmentPostcode: customerPostcode,
    ShipmentCountry:  customerCountry,
    ValueA: orderId,
    ValueB: "",
    ValueC: "",
    ValueD: "",
    ShippingMethod:  "NO",
    NoOfItem:        "1",
    ProductName:     productName,
    ProductProfile:  "digital",
    ProductCategory: "Education",
    ProductList: [
      {
        ProductName:     productName,
        NoOfItem:        "1",
        ProductProfile:  "digital",
        ProductCategory: "Education",
        ProductPrice:    amount.toString(),
      },
    ],
  };

  const response = await fetch(`${EPS_BASE_URL}/EPSEngine/InitializeEPS`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "x-hash":        xHash,
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  if (!text) throw new Error("EPS InitializeEPS: empty response");

  let data;
  try { data = JSON.parse(text); }
  catch (_) { throw new Error("EPS InitializeEPS: invalid JSON — " + text.slice(0, 200)); }

  if (!data.RedirectURL) {
    throw new Error(data.ErrorMessage || data.errorMessage || "EPS InitializeEPS failed");
  }

  return { paymentUrl: data.RedirectURL, merchantTransactionId: txnId, transactionId: data.TransactionId };
}

// ── API 03: Verify Transaction ────────────────────────────────
async function checkTransactionStatus(merchantTransactionId, epsTransactionId) {
  const isMockMode = !EPS_MERCHANT_ID || EPS_MERCHANT_ID === "your_merchant_id";
  if (isMockMode) return { Status: "Success" };

  const token = await getToken();

  // Hash using merchantTransactionId (or EPSTransactionId)
  const hashData = merchantTransactionId || epsTransactionId;
  const xHash = generateHash(hashData);

  const params = new URLSearchParams();
  if (merchantTransactionId) params.set("merchantTransactionId", merchantTransactionId);
  if (epsTransactionId)      params.set("EPSTransactionId", epsTransactionId);

  const response = await fetch(
    `${EPS_BASE_URL}/EPSEngine/CheckMerchantTransactionStatus?${params.toString()}`,
    {
      headers: {
        "x-hash":        xHash,
        "Authorization": `Bearer ${token}`,
      },
    }
  );

  const text = await response.text();
  if (!text) throw new Error("EPS Verify: empty response");

  let data;
  try { data = JSON.parse(text); }
  catch (_) { throw new Error("EPS Verify: invalid JSON"); }

  return data;
}

module.exports = { initiatePayment, checkTransactionStatus, generateMerchantTxnId, generateHash };
