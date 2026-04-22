const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ error: "Authentication required" });
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch (err) {
    const msg = err.name === "TokenExpiredError" ? "Token expired, please login again" : "Invalid token";
    res.status(401).json({ error: msg });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Admin access required" });
  next();
}

// Optional auth — attaches user if token present, doesn't block
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try { req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET); } catch (_) {}
  }
  next();
}

module.exports = { authenticate, requireAdmin, optionalAuth };
