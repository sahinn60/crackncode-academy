const router = require("express").Router();
const prisma = require("../lib/prisma");
const { authenticate } = require("../middleware/auth");

// GET /api/courses — public list of published courses
router.get("/", async (req, res) => {
  const { category, level, q } = req.query;
  const where = { isPublished: true };
  if (category) where.category = category;
  if (level) where.level = level;
  if (q) where.OR = [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }];

  const courses = await prisma.course.findMany({ where, orderBy: { createdAt: "desc" } });
  res.json(courses);
});

// GET /api/courses/:slug — single course
router.get("/:slug", async (req, res) => {
  const course = await prisma.course.findUnique({ where: { slug: req.params.slug } });
  if (!course) return res.status(404).json({ error: "Course not found" });
  res.json(course);
});

// GET /api/courses/:slug/enrolled — check if current user is enrolled
router.get("/:slug/enrolled", authenticate, async (req, res) => {
  const course = await prisma.course.findUnique({ where: { slug: req.params.slug }, select: { id: true } });
  if (!course) return res.status(404).json({ error: "Course not found" });

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: req.user.id, courseId: course.id } },
  });
  res.json({ enrolled: !!enrollment });
});

// GET /api/courses/my/enrollments — all courses the logged-in user is enrolled in
router.get("/my/enrollments", authenticate, async (req, res) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: req.user.id },
    include: { course: true },
    orderBy: { enrolledAt: "desc" },
  });
  res.json(enrollments.map((e) => e.course));
});

module.exports = router;
