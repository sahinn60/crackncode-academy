const router = require("express").Router();
const prisma = require("../lib/prisma");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

// POST /api/orders
router.post("/", async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: "items array is required" });

    // Resolve courseId from slug for COURSE type items
    const resolvedItems = await Promise.all(
      items.map(async (i) => {
        let courseId = i.courseId || null;
        if (i.productType === "COURSE" && !courseId && i.productSlug) {
          const course = await prisma.course.findUnique({
            where: { slug: i.productSlug },
            select: { id: true },
          });
          courseId = course ? course.id : null;
        }
        return { ...i, courseId };
      })
    );

    const totalPrice = resolvedItems.reduce((sum, i) => sum + Number(i.price), 0);

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalPrice,
        items: {
          create: resolvedItems.map((i) => ({
            productType: i.productType,
            productSlug: i.productSlug,
            price: Number(i.price),
            courseId: i.courseId || null,
          })),
        },
      },
      include: { items: true },
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// POST /api/orders/:id/pay — mark PAID and enroll
router.post("/:id/pay", async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });

    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    if (order.status === "PAID") return res.status(409).json({ error: "Order already paid" });

    const courseItems = order.items.filter((i) => i.courseId);

    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } }),
      ...courseItems.map((i) =>
        prisma.enrollment.upsert({
          where: { userId_courseId: { userId: order.userId, courseId: i.courseId } },
          create: { userId: order.userId, courseId: i.courseId },
          update: {},
        })
      ),
    ]);

    res.json({ success: true, orderId: order.id });
  } catch (err) {
    console.error("Pay order error:", err);
    res.status(500).json({ error: "Payment processing failed" });
  }
});

// GET /api/orders
router.get("/", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

module.exports = router;
