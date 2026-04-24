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

    const resolvedItems = await Promise.all(
      items.map(async (i) => {
        let courseId = i.courseId || null;
        let ebookId  = i.ebookId  || null;

        if (i.productType === "COURSE" && !courseId && i.productSlug) {
          const c = await prisma.course.findUnique({ where: { slug: i.productSlug }, select: { id: true } });
          courseId = c ? c.id : null;
        }
        if (i.productType === "EBOOK" && !ebookId && i.productSlug) {
          const e = await prisma.ebook.findUnique({ where: { slug: i.productSlug }, select: { id: true } });
          ebookId = e ? e.id : null;
        }
        return { ...i, courseId, ebookId };
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

    // Store ebookIds in order for pay step
    order._ebookIds = resolvedItems.filter(i => i.ebookId).map(i => i.ebookId);
    res.status(201).json(order);
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// POST /api/orders/:id/pay
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

    // Resolve ebook IDs from slugs
    const ebookItems = order.items.filter(i => i.productType === "EBOOK");
    const ebookIds = await Promise.all(
      ebookItems.map(async (i) => {
        const e = await prisma.ebook.findUnique({ where: { slug: i.productSlug }, select: { id: true } });
        return e ? e.id : null;
      })
    ).then(ids => ids.filter(Boolean));

    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } }),
      // Enroll in courses
      ...courseItems.map((i) =>
        prisma.enrollment.upsert({
          where: { userId_courseId: { userId: order.userId, courseId: i.courseId } },
          create: { userId: order.userId, courseId: i.courseId },
          update: {},
        })
      ),
      // Grant ebook access
      ...ebookIds.map((ebookId) =>
        prisma.ebookAccess.upsert({
          where: { userId_ebookId: { userId: order.userId, ebookId } },
          create: { userId: order.userId, ebookId },
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
