const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { authenticate } = require("../middleware/auth");

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "name, email and password required" });

    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, role: true },
    });

    const token = signToken(user);
    req.session.user = user;
    req.session.token = token;
    res.status(201).json({ token, user });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ error: "Invalid email or password" });

    const { passwordHash: _, ...safeUser } = user;
    const token = signToken(safeUser);
    req.session.user = safeUser;
    req.session.token = token;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// GET /api/auth/me
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// PATCH /api/auth/profile
router.patch("/profile", authenticate, async (req, res) => {
  try {
    const { name, password } = req.body;
    const data = {};
    if (name) data.name = name.trim();
    if (password) {
      if (password.length < 6)
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      data.passwordHash = await bcrypt.hash(password, 10);
    }
    if (Object.keys(data).length === 0)
      return res.status(400).json({ error: "Nothing to update" });

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, name: true, email: true, role: true },
    });
    // keep session in sync
    if (req.session.user) req.session.user.name = user.name;
    res.json(user);
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

module.exports = router;
