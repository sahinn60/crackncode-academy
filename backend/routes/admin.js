const router = require("express").Router();
const prisma = require("../lib/prisma");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { upload, uploadDoc } = require("../middleware/upload");

router.use(authenticate, requireAdmin);

// ── Image Upload ─────────────────────────────────────────────
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const url = req.file.path || ("/uploads/" + req.file.filename);
  res.json({ url });
});

// ── Document Upload ─────────────────────────────────────────
router.post("/upload-doc", uploadDoc.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const url = req.file.path || ("/uploads/" + req.file.filename);
  res.json({ url, name: req.file.originalname });
});

// ── Top Selling ─────────────────────────────────────────────
router.patch("/courses/:id/topselling", async (req, res) => {
  const { isTopSelling } = req.body;
  const course = await prisma.course.update({
    where: { id: req.params.id },
    data: { isTopSelling: !!isTopSelling },
  });
  res.json(course);
});

// ── Courses ──────────────────────────────────────────────

// GET /api/admin/courses
router.get("/courses", async (_req, res) => {
  const courses = await prisma.course.findMany({ orderBy: { createdAt: "desc" } });
  res.json(courses);
});

// POST /api/admin/courses
router.post("/courses", async (req, res) => {
  const { slug, title, titleBn, description, price, oldPrice, imageUrl, category, courseType, level, duration } = req.body;
  if (!slug || !title || price == null)
    return res.status(400).json({ error: "slug, title and price are required" });

  const course = await prisma.course.create({
    data: { slug, title, titleBn, description, price: +price, oldPrice: oldPrice ? +oldPrice : null, imageUrl, category, courseType, level, duration, isPublished: true },
  });
  res.status(201).json(course);
});

// PATCH /api/admin/courses/:id
router.patch("/courses/:id", async (req, res) => {
  const allowed = ["title", "titleBn", "description", "price", "oldPrice", "imageUrl", "category", "courseType", "level", "duration", "isPublished"];
  const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  if (data.price != null) data.price = +data.price;
  if (data.oldPrice != null) data.oldPrice = +data.oldPrice;

  const course = await prisma.course.update({ where: { id: req.params.id }, data });
  res.json(course);
});

// DELETE /api/admin/courses/:id
router.delete("/courses/:id", async (req, res) => {
  await prisma.course.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// ── Users ─────────────────────────────────────────────────

// GET /api/admin/users
router.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { orders: true, enrollments: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(users);
});

// PATCH /api/admin/users/:id/role
router.patch("/users/:id/role", async (req, res) => {
  const { role } = req.body;
  if (!["USER", "ADMIN"].includes(role))
    return res.status(400).json({ error: "role must be USER or ADMIN" });

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });
  res.json(user);
});

// ── Orders ────────────────────────────────────────────────

// GET /api/admin/orders
router.get("/orders", async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: { user: { select: { id: true, name: true, email: true } }, items: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});

// PATCH /api/admin/orders/:id/status
router.patch("/orders/:id/status", async (req, res) => {
  const { status } = req.body;
  const valid = ["PENDING", "PAID", "FAILED", "REFUNDED"];
  if (!valid.includes(status))
    return res.status(400).json({ error: `status must be one of ${valid.join(", ")}` });

  const order = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
  res.json(order);
});

// ── Dashboard stats ───────────────────────────────────────

// GET /api/admin/stats
router.get("/stats", async (_req, res) => {
  const [users, courses, orders, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { totalPrice: true } }),
  ]);
  res.json({ users, courses, paidOrders: orders, totalRevenue: revenue._sum.totalPrice ?? 0 });
});

// ── Bundles ───────────────────────────────────────────────
router.get("/bundles", async (_req, res) => {
  res.json(await prisma.bundle.findMany({ orderBy: { createdAt: "desc" } }));
});
router.post("/bundles", async (req, res) => {
  const { title, price, oldPrice, imageUrl } = req.body;
  if (!title || price == null) return res.status(400).json({ error: "title and price required" });
  res.status(201).json(await prisma.bundle.create({ data: { title, price: +price, oldPrice: oldPrice ? +oldPrice : null, imageUrl, isPublished: true } }));
});
router.patch("/bundles/:id", async (req, res) => {
  const allowed = ["title", "price", "oldPrice", "imageUrl", "isPublished"];
  const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  if (data.price != null) data.price = +data.price;
  if (data.oldPrice != null) data.oldPrice = +data.oldPrice;
  res.json(await prisma.bundle.update({ where: { id: req.params.id }, data }));
});
router.delete("/bundles/:id", async (req, res) => {
  await prisma.bundle.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// ── Workshops ─────────────────────────────────────────────
router.get("/workshops", async (_req, res) => {
  res.json(await prisma.workshop.findMany({ orderBy: { createdAt: "desc" } }));
});
router.post("/workshops", async (req, res) => {
  const { slug, title, description, price, oldPrice, imageUrl, category, wType, duration } = req.body;
  if (!slug || !title || price == null) return res.status(400).json({ error: "slug, title and price required" });
  res.status(201).json(await prisma.workshop.create({ data: { slug, title, description, price: +price, oldPrice: oldPrice ? +oldPrice : null, imageUrl, category, wType, duration, isPublished: true } }));
});
router.patch("/workshops/:id", async (req, res) => {
  const allowed = ["title", "description", "price", "oldPrice", "imageUrl", "category", "wType", "duration", "isPublished"];
  const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  if (data.price != null) data.price = +data.price;
  if (data.oldPrice != null) data.oldPrice = +data.oldPrice;
  res.json(await prisma.workshop.update({ where: { id: req.params.id }, data }));
});
router.delete("/workshops/:id", async (req, res) => {
  await prisma.workshop.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// ── Ebooks ────────────────────────────────────────────────
router.get("/ebooks", async (_req, res) => {
  res.json(await prisma.ebook.findMany({ orderBy: { createdAt: "desc" } }));
});
router.post("/ebooks", async (req, res) => {
  const { slug, title, author, price, oldPrice, coverUrl } = req.body;
  if (!slug || !title || price == null) return res.status(400).json({ error: "slug, title and price required" });
  res.status(201).json(await prisma.ebook.create({ data: { slug, title, author, price: +price, oldPrice: oldPrice ? +oldPrice : null, coverUrl, isPublished: true } }));
});
router.patch("/ebooks/:id", async (req, res) => {
  const allowed = ["title", "author", "price", "oldPrice", "coverUrl", "isPublished"];
  const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  if (data.price != null) data.price = +data.price;
  if (data.oldPrice != null) data.oldPrice = +data.oldPrice;
  res.json(await prisma.ebook.update({ where: { id: req.params.id }, data }));
});
router.delete("/ebooks/:id", async (req, res) => {
  await prisma.ebook.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// ── Blogs ─────────────────────────────────────────────────
router.get("/blogs", async (_req, res) => {
  res.json(await prisma.blog.findMany({ orderBy: { createdAt: "desc" } }));
});
router.post("/blogs", async (req, res) => {
  const { slug, title, excerpt, content, imageUrl } = req.body;
  if (!slug || !title) return res.status(400).json({ error: "slug and title required" });
  res.status(201).json(await prisma.blog.create({ data: { slug, title, excerpt, content, imageUrl, isPublished: true } }));
});
router.patch("/blogs/:id", async (req, res) => {
  const allowed = ["title", "excerpt", "content", "imageUrl", "isPublished"];
  const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  res.json(await prisma.blog.update({ where: { id: req.params.id }, data }));
});
router.delete("/blogs/:id", async (req, res) => {
  await prisma.blog.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

module.exports = router;
