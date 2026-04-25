const crypto = require("crypto");

const EPS_BASE_URL    = process.env.EPS_BASE_URL    || "https://pgapi.eps.com.bd/v1";
const EPS_MERCHANT_ID = process.env.EPS_MERCHANT_ID;
const EPS_STORE_ID    = process.env.EPS_STORE_ID;
const EPS_USERNAME    = process.env.EPS_USERNAME;
const EPS_PASSWORD    = process.env.EPS_PASSWORD;
const EPS_HASH_KEY    = process.env.EPS_HASH_KEY;

// ── Hash Generation (per EPS docs) ───────────────────────────
// Step 1: Encode Hash Key using UTF8
// Step 2: Create HMACSHA512 using encoded key
// Step 3: Compute Hash using data string
// Step 4: Return Base64 string
function generateHash(data) {
  if (!EPS_HASH_KEY) throw new Error("EPS_HASH_KEY not configured");
  const keyBuffer = Buffer.from(EPS_HASH_KEY, "utf8"); // UTF8 encode key
  const hmac = crypto.createHmac("sha512", keyBuffer);
  hmac.update(String(data), "utf8");
  return hmac.digest("base64");
}

// ── Unique merchant transaction ID ───────────────────────────
function generateMerchantTxnId() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
    String(now.getMilliseconds()).padStart(3, "0"),
    String(Math.floor(Math.random() * 1000)).padStart(3, "0"),
  ].join("");
}

// ── Token cache (avoid calling GetToken on every request) ────
let _cachedToken = null;
let _tokenExpiry = null;

async function getToken() {
  // Return cached token if still valid (with 60s buffer)
  if (_cachedToken && _tokenExpiry && Date.now() < _tokenExpiry - 60000) {
    return _cachedToken;
  }

  if (!EPS_USERNAME || !EPS_PASSWORD) throw new Error("EPS_USERNAME / EPS_PASSWORD not configured");

  // Hash is generated using username (per API 01 docs)
  const xHash = generateHash(EPS_USERNAME);

  const response = await fetch(`${EPS_BASE_URL}/Auth/GetToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hash": xHash,
    },
    body: JSON.stringify({ userName: EPS_USERNAME, password: EPS_PASSWORD }),
  });

  const text = await response.text();
  if (!text) throw new Error("EPS GetToken: empty response");

  let data;
  try { data = JSON.parse(text); }
  catch (_) { throw new Error("EPS GetToken: invalid JSON — " + text.slice(0, 200)); }

  if (data.errorCode || data.errorMessage) throw new Error("EPS GetToken error: " + (data.errorMessage || data.errorCode));
  if (!data.token) throw new Error("EPS GetToken: no token in response");

  // Cache token
  _cachedToken = data.token;
  _tokenExpiry = data.expireDate ? new Date(data.expireDate).getTime() : Date.now() + 3600000;

  return _cachedToken;
}

// ── Validate credentials configured ──────────────────────────
function isMockMode() {
  return !EPS_MERCHANT_ID || EPS_MERCHANT_ID === "your_merchant_id" || !EPS_USERNAME || !EPS_HASH_KEY;
}

// ── API 02: Initialize Payment ────────────────────────────────
async function initiatePayment({
  orderId, amount, customerName, customerEmail, customerPhone,
  customerAddress = "Dhaka, Bangladesh",
  customerCity = "Dhaka", customerState = "Dhaka",
  customerPostcode = "1200", customerCountry = "BD",
  productName = "Digital Product",
  successUrl, failUrl, cancelUrl,
  merchantTransactionId,
}) {
  // Validate required fields
  if (!orderId)     throw new Error("orderId is required");
  if (!amount)      throw new Error("amount is required");
  if (!successUrl)  throw new Error("successUrl is required");
  if (!customerEmail) throw new Error("customerEmail is required");

  const txnId = merchantTransactionId || generateMerchantTxnId();

  if (isMockMode()) {
    console.warn("[EPS] Mock mode — real credentials not configured");
    return { paymentUrl: successUrl + "&mock=1", merchantTransactionId: txnId };
  }

  const token = await getToken();

  // Hash generated using merchantTransactionId (per API 02 docs)
  const xHash = generateHash(txnId);

  const payload = {
    merchantId:            EPS_MERCHANT_ID,
    storeId:               EPS_STORE_ID,
    CustomerOrderId:       String(orderId),
    merchantTransactionId: txnId,
    transactionTypeId:     1,
    financialEntityId:     0,
    transitionStatusId:    0,
    totalAmount:           Number(amount),
    ipAddress:             "127.0.0.1",
    version:               "1",
    successUrl,
    failUrl,
    cancelUrl,
    customerName:     customerName  || "Customer",
    customerEmail:    customerEmail || "",
    CustomerAddress:  customerAddress,
    CustomerAddress2: "",
    CustomerCity:     customerCity,
    CustomerState:    customerState,
    CustomerPostcode: customerPostcode,
    CustomerCountry:  customerCountry,
    CustomerPhone:    customerPhone || "01700000000",
    ShipmentName:     customerName  || "Customer",
    ShipmentAddress:  customerAddress,
    ShipmentAddress2: "",
    ShipmentCity:     customerCity,
    ShipmentState:    customerState,
    ShipmentPostcode: customerPostcode,
    ShipmentCountry:  customerCountry,
    ValueA: String(orderId),
    ValueB: "",
    ValueC: "",
    ValueD: "",
    ShippingMethod:  "NO",
    NoOfItem:        "1",
    ProductName:     productName,
    ProductProfile:  "digital",
    ProductCategory: "Education",
    ProductList: [{
      ProductName:     productName,
      NoOfItem:        "1",
      ProductProfile:  "digital",
      ProductCategory: "Education",
      ProductPrice:    String(amount),
    }],
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

  if (data.ErrorCode || data.ErrorMessage) throw new Error("EPS InitializeEPS error: " + (data.ErrorMessage || data.ErrorCode));
  if (!data.RedirectURL) throw new Error("EPS InitializeEPS: no RedirectURL in response");

  return {
    paymentUrl:            data.RedirectURL,
    merchantTransactionId: txnId,
    transactionId:         data.TransactionId,
  };
}

// ── API 03: Verify Transaction ────────────────────────────────
async function checkTransactionStatus(merchantTransactionId, epsTransactionId) {
  if (isMockMode()) return { Status: "Success" };

  const token  = await getToken();
  const hashData = merchantTransactionId || epsTransactionId;
  if (!hashData) throw new Error("merchantTransactionId or epsTransactionId required");

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

// ── Verify payment is genuinely successful ────────────────────
function isPaymentSuccessful(statusResponse) {
  if (!statusResponse) return false;
  const s = (statusResponse.Status || statusResponse.status || "").toLowerCase();
  return s === "success" || s === "successful" || statusResponse.responseCode === "00";
}

module.exports = { initiatePayment, checkTransactionStatus, generateMerchantTxnId, generateHash, isPaymentSuccessful };
