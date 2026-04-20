require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");
const catalog = require("./data/catalog");

// API routers
const authRouter = require("./backend/routes/auth");
const coursesRouter = require("./backend/routes/courses");
const ordersRouter = require("./backend/routes/orders");
const adminRouter = require("./backend/routes/admin");

const app = express();
const PORT = process.env.PORT || 3000;

const { courses, bundles, workshops, ebooks, blogs, courseBySlug, findProduct, searchAll } = catalog;

const topSelling = {
  featured: {
    title: "Content Creation & Passive Income with AI",
    desc: "ChatGPT, Midjourney ও সোশ্যাল কন্টেন্ট স্ট্র্যাটেজি — এক জায়গায়।",
    price: 1999,
    oldPrice: 5000,
    image: courses[1].image,
    badge: "Pre-Recorded",
    slug: courses[1].slug,
  },
  side: [
    {
      title: "MidJourney & ChatGPT: AI for Social Media Content Generation Masterclass",
      price: 5000,
      oldPrice: null,
      image: catalog.img("topsell-side1", 280, 200),
      slug: "gemini-ai-design-masterclass",
    },
    {
      title: "Video Editing Masterclass",
      price: 999,
      oldPrice: 2500,
      image: catalog.img("topsell-side2", 280, 200),
      slug: "freepik-ai-masterclass",
    },
  ],
};

const featuredCourses = courses.slice(0, 4);

const testimonials = [
  { initials: "SM", name: "সাফিন মাহমুদ", date: "Apr 12, 2024", rating: 5, text: "কোর্সের কোয়ালিটি অসাধারণ। প্রজেক্ট বেসড শেখানো হয়েছে।", course: "Generative AI Design Masterclass" },
  { initials: "MO", name: "মেহেদী হাসান", date: "Mar 2, 2024", rating: 5, text: "Support team খুবই responsive। রেকমেন্ড করছি।", course: "Video Editing Masterclass" },
  { initials: "AR", name: "আয়েশা রহমান", date: "Feb 18, 2024", rating: 5, text: "From zero to portfolio — ধন্যবাদ CrackNcode Academy!", course: "MidJourney & ChatGPT Masterclass" },
  { initials: "RK", name: "রাফি কারিম", date: "Jan 5, 2024", rating: 4, text: "বাংলায় বুঝিয়ে দেওয়ার স্টাইল দারুণ।", course: "Gemini AI Design Masterclass" },
  { initials: "NS", name: "নাফিসা সুলতানা", date: "Dec 22, 2023", rating: 5, text: "ই-বুক + কোর্স কম্বো ভ্যালু ফর মানি।", course: "Prompt Engineering 101" },
  { initials: "TI", name: "তানভীর ইসলাম", date: "Nov 8, 2023", rating: 5, text: "Loved the structured modules and quizzes.", course: "Freepik AI Masterclass" },
  { initials: "HK", name: "হাসান কবির", date: "Oct 1, 2023", rating: 5, text: "ফ্রিল্যান্সিং ক্লায়েন্ট পেতে হেল্প করেছে।", course: "Career Starter Pack" },
  { initials: "LA", name: "লামিয়া আক্তার", date: "Sep 14, 2023", rating: 5, text: "UI খুব ক্লিন, লার্নিং এক্সপিরিয়েন্স smooth।", course: "Spoken English Boost" },
];

function cartCount(req) {
  const cart = req.session.cart || [];
  return cart.reduce((s, i) => s + (i.qty || 1), 0);
}

app.get("/cart/count", (req, res) => {
  res.json({ count: cartCount(req) });
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Session (must be before API routes and all page routes) ──
app.use(
  session({
    secret: process.env.SESSION_SECRET || "crackncode-academy-dev",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
  })
);

// ── API routes ────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminRouter);

app.use((req, res, next) => {
  if (!req.session.cart) req.session.cart = [];
  res.locals.cartCount = cartCount(req);
  res.locals.activeNav = "";
  res.locals.searchQuery = typeof req.query.q === "string" ? req.query.q : "";
  res.locals.authUser = req.session.user || null;
  next();
});

// Logout — clear session and redirect
app.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

function cartMoneyTotals(cart) {
  let subtotalOld = 0;
  let discountTotal = 0;
  let total = 0;
  let qtyTotal = 0;
  (cart || []).forEach((i) => {
    const qty = i.qty || 1;
    qtyTotal += qty;
    const oldP = i.oldPrice != null ? i.oldPrice : i.price;
    subtotalOld += oldP * qty;
    total += i.price * qty;
    discountTotal += Math.max(0, oldP - i.price) * qty;
  });
  return { subtotalOld, discountTotal, total, qtyTotal, lineCount: (cart || []).length };
}

function renderPage(res, view, data) {
  res.render(view, { title: "CrackNcode Academy", ...data });
}

app.get("/", async (_req, res) => {
  res.locals.activeNav = "home";
  const [dbCourses, dbBundles, dbEbooks] = await Promise.all([
    prismaClient.course.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" }, take: 10 }),
    prismaClient.bundle.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" } }),
    prismaClient.ebook.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" } }),
  ]);
  // fallback to catalog if DB is empty
  const allCourses = dbCourses.length ? dbCourses.map(c => ({ ...c, image: c.imageUrl, discountPct: c.oldPrice ? Math.round((1 - c.price / c.oldPrice) * 100) : 0 })) : courses;
  const allBundles = dbBundles.length ? dbBundles.map(b => ({ ...b, image: b.imageUrl, old: b.oldPrice })) : bundles;
  const allEbooks  = dbEbooks.length  ? dbEbooks.map(e => ({ ...e, cover: e.coverUrl, old: e.oldPrice })) : ebooks;
  const featured = allCourses[1] || allCourses[0];
  const dynamicTopSelling = {
    featured: { title: featured.title, desc: featured.description || featured.desc || "", price: featured.price, oldPrice: featured.oldPrice || featured.oldPrice, image: featured.image || featured.imageUrl, badge: featured.courseType || "Pre-Recorded", slug: featured.slug },
    side: allCourses.slice(2, 4).map(c => ({ title: c.title, price: c.price, oldPrice: c.oldPrice, image: c.image || c.imageUrl, slug: c.slug })),
  };
  renderPage(res, "index", {
    pageTitle: "হোম",
    topSelling: dynamicTopSelling,
    featuredCourses: allCourses.slice(0, 4),
    ebooks: allEbooks,
    bundles: allBundles,
    testimonials,
  });
});

app.get("/courses", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const where = { isPublished: true };
  if (q) where.OR = [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }];
  const dbCourses = await prismaClient.course.findMany({ where, orderBy: { createdAt: "desc" } });
  const list = dbCourses.length ? dbCourses.map(c => ({ ...c, image: c.imageUrl, discountPct: c.oldPrice ? Math.round((1 - c.price / c.oldPrice) * 100) : 0 })) : (q ? searchAll(q).courses : courses);
  res.locals.activeNav = "courses";
  renderPage(res, "pages/courses", { pageTitle: "কোর্স", courses: list, count: list.length, searchFilter: q });
});

app.get("/search", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!q) return renderPage(res, "pages/search", { pageTitle: "খুঁজুন", query: "", courses: [], bundles: [], workshops: [], ebooks: [], blogs: [], totalResults: 0 });

  // Try DB first
  const contains = (field) => ({ [field]: { contains: q, mode: "insensitive" } });
  const [dbCourses, dbBundles, dbWorkshops, dbEbooks, dbBlogs] = await Promise.all([
    prismaClient.course.findMany({ where: { isPublished: true, OR: [contains("title"), contains("description")] } }).catch(() => []),
    prismaClient.bundle.findMany({ where: { isPublished: true, OR: [contains("title")] } }).catch(() => []),
    prismaClient.workshop.findMany({ where: { isPublished: true, OR: [contains("title"), contains("description")] } }).catch(() => []),
    prismaClient.ebook.findMany({ where: { isPublished: true, OR: [contains("title"), contains("author")] } }).catch(() => []),
    prismaClient.blog.findMany({ where: { isPublished: true, OR: [contains("title"), contains("excerpt")] } }).catch(() => []),
  ]);

  // Fallback to catalog if DB empty
  const cat = searchAll(q);
  const r = {
    courses:   dbCourses.length   ? dbCourses.map(c => ({ ...c, image: c.imageUrl, desc: c.description }))   : cat.courses,
    bundles:   dbBundles.length   ? dbBundles.map(b => ({ ...b, image: b.imageUrl, old: b.oldPrice }))        : cat.bundles,
    workshops: dbWorkshops.length ? dbWorkshops.map(w => ({ ...w, image: w.imageUrl, old: w.oldPrice }))      : cat.workshops,
    ebooks:    dbEbooks.length    ? dbEbooks.map(e => ({ ...e, cover: e.coverUrl, old: e.oldPrice }))         : cat.ebooks,
    blogs:     dbBlogs.length     ? dbBlogs.map(b => ({ ...b, image: b.imageUrl }))                           : cat.blogs,
  };
  const totalResults = r.courses.length + r.bundles.length + r.workshops.length + r.ebooks.length + r.blogs.length;
  res.locals.activeNav = "";
  renderPage(res, "pages/search", { pageTitle: "খুঁজুন", query: q, ...r, totalResults });
});

app.get("/bundles", async (_req, res) => {
  const dbBundles = await prismaClient.bundle.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" } });
  const list = dbBundles.length ? dbBundles.map(b => ({ ...b, image: b.imageUrl, old: b.oldPrice, layout: "banner" })) : bundles;
  res.locals.activeNav = "bundles";
  renderPage(res, "pages/bundles", { pageTitle: "বান্ডেল", bundles: list, count: list.length });
});

app.get("/bundles/:id", async (req, res) => {
  let bundle = null;
  try {
    const dbB = await prismaClient.bundle.findUnique({ where: { id: req.params.id } });
    bundle = dbB ? { ...dbB, image: dbB.imageUrl, old: dbB.oldPrice } : null;
  } catch (_) {}
  if (!bundle) bundle = bundles.find(b => b.id === req.params.id) || null;
  if (!bundle) return res.status(404).send("Bundle not found");
  renderPage(res, "pages/bundle-detail", { pageTitle: bundle.title, bundle });
});

app.get("/workshops", async (_req, res) => {
  const dbWorkshops = await prismaClient.workshop.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" } });
  const list = dbWorkshops.length ? dbWorkshops.map(w => ({ ...w, image: w.imageUrl, old: w.oldPrice })) : workshops;
  res.locals.activeNav = "workshops";
  renderPage(res, "pages/workshops", { pageTitle: "ওয়ার্কশপ", workshops: list, count: list.length });
});

app.get("/workshops/:slug", async (req, res) => {
  let workshop = null;
  try {
    const dbW = await prismaClient.workshop.findUnique({ where: { slug: req.params.slug } });
    workshop = dbW ? { ...dbW, image: dbW.imageUrl, old: dbW.oldPrice } : null;
  } catch (_) {}
  if (!workshop) workshop = workshops.find(w => w.slug === req.params.slug) || null;
  if (!workshop) return res.status(404).send("Workshop not found");
  renderPage(res, "pages/workshop-detail", { pageTitle: workshop.title, workshop });
});

app.get("/ebooks", async (_req, res) => {
  const dbEbooks = await prismaClient.ebook.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" } });
  const list = dbEbooks.length ? dbEbooks.map(e => ({ ...e, cover: e.coverUrl, old: e.oldPrice })) : ebooks;
  res.locals.activeNav = "ebooks";
  renderPage(res, "pages/ebooks", { pageTitle: "ই-বুক", ebooks: list, count: list.length });
});

app.get("/ebooks/:slug", async (req, res) => {
  let ebook = null;
  try {
    const dbE = await prismaClient.ebook.findUnique({ where: { slug: req.params.slug } });
    ebook = dbE ? { ...dbE, cover: dbE.coverUrl, old: dbE.oldPrice } : null;
  } catch (_) {}
  if (!ebook) ebook = ebooks.find(e => e.slug === req.params.slug) || null;
  if (!ebook) return res.status(404).send("E-Book not found");
  const discountPct = ebook.old && ebook.old > ebook.price ? Math.round((1 - ebook.price / ebook.old) * 100) : 0;
  res.locals.activeNav = "ebooks";
  renderPage(res, "pages/ebook-detail", { pageTitle: ebook.title, ebook, discountPct });
});

app.get("/blog", async (_req, res) => {
  const dbBlogs = await prismaClient.blog.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" } });
  const list = dbBlogs.length ? dbBlogs.map(b => ({ ...b, image: b.imageUrl, date: new Date(b.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) })) : blogs;
  res.locals.activeNav = "blog";
  renderPage(res, "pages/blog", { pageTitle: "ব্লগ", blogs: list, count: list.length });
});

app.get("/blog/:slug", async (req, res) => {
  let blog = null;
  try {
    const dbB = await prismaClient.blog.findUnique({ where: { slug: req.params.slug } });
    blog = dbB ? { ...dbB, image: dbB.imageUrl } : null;
  } catch (_) {}
  if (!blog) blog = blogs.find(b => b.slug === req.params.slug) || null;
  if (!blog) return res.status(404).send("Blog not found");
  renderPage(res, "pages/blog-detail", { pageTitle: blog.title, blog });
});

app.get("/team", (_req, res) => {
  renderPage(res, "pages/team", { pageTitle: "Meet The Team" });
});

app.get("/student-success", (_req, res) => {
  renderPage(res, "pages/student-success", { pageTitle: "Student Success" });
});

app.get("/contact", (_req, res) => {
  renderPage(res, "pages/contact", { pageTitle: "Contact Us" });
});

// POST /api/contact — save message to DB
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message)
      return res.status(400).json({ error: "All fields are required" });
    await prismaClient.contactMessage.create({ data: { name, email, subject, message } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

app.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.locals.activeNav = "login";
  renderPage(res, "pages/login", { pageTitle: "লগইন" });
});

// Profile — requires login
app.get("/profile", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  const prisma = require("./backend/lib/prisma");
  const [user, enrollments, orders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: req.session.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.enrollment.findMany({
      where: { userId: req.session.user.id },
      include: { course: true },
      orderBy: { enrolledAt: "desc" },
    }),
    prisma.order.findMany({
      where: { userId: req.session.user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  if (!user) return res.redirect("/login");
  renderPage(res, "pages/profile", { pageTitle: "My Profile", user, enrollments, orders });
});

app.get("/my-courses", (req, res) => res.redirect("/profile"));
app.get("/orders", (req, res) => res.redirect("/profile"));

// ── Admin panel ───────────────────────────────────────────
const prismaClient = require("./backend/lib/prisma");

function requireAdminSession(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  if (req.session.user.role !== "ADMIN") return res.status(403).send("Access denied");
  next();
}

app.get("/admin", requireAdminSession, async (req, res) => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [users, courseCount, paidOrders, revenue, recentOrders,
    allOrders, allUsers, coursesCnt, bundlesCnt, workshopsCnt, ebooksCnt, recentUsers] = await Promise.all([
    prismaClient.user.count(),
    prismaClient.course.count(),
    prismaClient.order.count({ where: { status: "PAID" } }),
    prismaClient.order.aggregate({ where: { status: "PAID" }, _sum: { totalPrice: true } }),
    prismaClient.order.findMany({ take: 8, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true, email: true } } } }),
    prismaClient.order.findMany({ where: { createdAt: { gte: sixMonthsAgo } }, select: { createdAt: true, totalPrice: true, status: true } }),
    prismaClient.user.findMany({ select: { role: true } }),
    prismaClient.course.count(),
    prismaClient.bundle.count(),
    prismaClient.workshop.count(),
    prismaClient.ebook.count(),
    prismaClient.user.findMany({ take: 8, orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
  ]);

  // Build last 6 months labels
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: d.toLocaleString('en-GB', { month: 'short', year: '2-digit' }), year: d.getFullYear(), month: d.getMonth() });
  }

  const revenueByMonth = months.map(m =>
    allOrders.filter(o => o.status === 'PAID' && new Date(o.createdAt).getFullYear() === m.year && new Date(o.createdAt).getMonth() === m.month)
      .reduce((s, o) => s + o.totalPrice, 0)
  );
  const ordersByMonth = months.map(m =>
    allOrders.filter(o => new Date(o.createdAt).getFullYear() === m.year && new Date(o.createdAt).getMonth() === m.month).length
  );

  const orderStatusCount = {
    PAID:     allOrders.filter(o => o.status === 'PAID').length,
    PENDING:  allOrders.filter(o => o.status === 'PENDING').length,
    FAILED:   allOrders.filter(o => o.status === 'FAILED').length,
    REFUNDED: allOrders.filter(o => o.status === 'REFUNDED').length,
  };
  const adminCount = allUsers.filter(u => u.role === 'ADMIN').length;
  const userCount  = allUsers.filter(u => u.role === 'USER').length;

  const chartData = {
    months: months.map(m => m.label),
    revenue: revenueByMonth,
    orders: ordersByMonth,
    orderStatus: orderStatusCount,
    userRoles: { admin: adminCount, user: userCount },
    products: { courses: coursesCnt, bundles: bundlesCnt, workshops: workshopsCnt, ebooks: ebooksCnt },
  };

  res.render("admin/dashboard", {
    pageTitle: "Dashboard",
    adminNav: "dashboard",
    authUser: req.session.user,
    stats: { users, courses: courseCount, paidOrders, totalRevenue: revenue._sum.totalPrice ?? 0 },
    recentOrders,
    recentUsers,
    chartData: JSON.stringify(chartData),
  });
});

app.get("/admin/courses", requireAdminSession, async (req, res) => {
  const courses = await prismaClient.course.findMany({ orderBy: { createdAt: "desc" } });
  res.render("admin/courses", {
    pageTitle: "Courses",
    adminNav: "courses",
    authUser: req.session.user,
    courses,
  });
});

app.get("/admin/users", requireAdminSession, async (req, res) => {
  const users = await prismaClient.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { enrollments: true, orders: true } } },
  });
  res.render("admin/users", {
    pageTitle: "Users",
    adminNav: "users",
    authUser: req.session.user,
    users,
  });
});

app.get("/admin/orders", requireAdminSession, async (req, res) => {
  const orders = await prismaClient.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } }, items: true },
  });
  res.render("admin/orders", { pageTitle: "Orders", adminNav: "orders", authUser: req.session.user, orders });
});

app.get("/admin/bundles", requireAdminSession, async (req, res) => {
  const items = await prismaClient.bundle.findMany({ orderBy: { createdAt: "desc" } });
  res.render("admin/bundles", { pageTitle: "Bundles", adminNav: "bundles", authUser: req.session.user, items });
});

app.get("/admin/workshops", requireAdminSession, async (req, res) => {
  const items = await prismaClient.workshop.findMany({ orderBy: { createdAt: "desc" } });
  res.render("admin/workshops", { pageTitle: "Workshops", adminNav: "workshops", authUser: req.session.user, items });
});

app.get("/admin/ebooks", requireAdminSession, async (req, res) => {
  const items = await prismaClient.ebook.findMany({ orderBy: { createdAt: "desc" } });
  res.render("admin/ebooks", { pageTitle: "E-Books", adminNav: "ebooks", authUser: req.session.user, items });
});

app.get("/admin/blogs", requireAdminSession, async (req, res) => {
  const items = await prismaClient.blog.findMany({ orderBy: { createdAt: "desc" } });
  res.render("admin/blogs", { pageTitle: "Blogs", adminNav: "blogs", authUser: req.session.user, items });
});

app.get("/admin/messages", requireAdminSession, async (req, res) => {
  const messages = await prismaClient.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  res.render("admin/messages", {
    pageTitle: "Messages",
    adminNav: "messages",
    authUser: req.session.user,
    messages,
  });
});

app.patch("/api/admin/messages/:id/read", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  await prismaClient.contactMessage.update({ where: { id: req.params.id }, data: { isRead: true } });
  res.json({ success: true });
});

app.get("/courses/:slug", async (req, res) => {
  const dbCourse = await prismaClient.course.findUnique({ where: { slug: req.params.slug } });
  const course = dbCourse
    ? { ...dbCourse, image: dbCourse.imageUrl, discountPct: dbCourse.oldPrice ? Math.round((1 - dbCourse.price / dbCourse.oldPrice) * 100) : 0, modules: [], reviews: [], reviewsSummary: { avg: 0, count: 0, bars: [] } }
    : courseBySlug(req.params.slug);
  if (!course) return res.status(404).send("Course not found");
  res.locals.activeNav = "courses";
  renderPage(res, "pages/course-detail", { pageTitle: course.titleBn || course.title, course });
});

app.get("/cart", (req, res) => {
  res.locals.activeNav = "cart";
  const cart = req.session.cart || [];
  const { subtotalOld, discountTotal, total, qtyTotal, lineCount } = cartMoneyTotals(cart);
  const firstItem = cart[0] || null;
  const showCheckoutNote = cart.length > 1;
  renderPage(res, "pages/cart", {
    pageTitle: "কার্ট",
    cart,
    total,
    subtotalOld,
    discountTotal,
    qtyTotal,
    lineCount,
    firstCheckoutTarget: firstItem ? { type: firstItem.type, slug: firstItem.slug } : null,
    showCheckoutNote,
  });
});

app.post("/cart/remove", (req, res) => {
  const idx = parseInt(req.body.index, 10);
  const cart = req.session.cart || [];
  if (!Number.isNaN(idx) && idx >= 0 && idx < cart.length) cart.splice(idx, 1);
  req.session.cart = cart;
  res.redirect("/cart");
});

app.post("/cart/clear", (req, res) => {
  req.session.cart = [];
  res.redirect("/cart");
});

// ── Static info pages ──────────────────────────────────────
app.get("/about", (_req, res) => renderPage(res, "pages/static", { pageTitle: "About Us", heading: "About Us" }));
app.get("/become-instructor", (_req, res) => renderPage(res, "pages/static", { pageTitle: "Become an Instructor", heading: "Become an Instructor" }));
app.get("/terms", (_req, res) => renderPage(res, "pages/static", { pageTitle: "Terms & Conditions", heading: "Terms & Conditions" }));
app.get("/privacy", (_req, res) => renderPage(res, "pages/static", { pageTitle: "Privacy Policy", heading: "Privacy Policy" }));
app.get("/refund", (_req, res) => renderPage(res, "pages/static", { pageTitle: "Refund Policy", heading: "Refund Policy" }));

app.post("/cart/add", async (req, res) => {
  const { type, slug, redirect, ajax } = req.body;

  // Try catalog first
  let product = findProduct(type || "course", slug);

  // If not in catalog, try DB
  if (!product) {
    try {
      if (type === "bundle") {
        const dbB = await prismaClient.bundle.findUnique({ where: { id: slug } });
        if (dbB) product = { type: "bundle", slug: dbB.id, title: dbB.title, price: dbB.price, oldPrice: dbB.oldPrice, image: dbB.imageUrl };
      } else if (type === "workshop") {
        const dbW = await prismaClient.workshop.findUnique({ where: { slug } });
        if (dbW) product = { type: "workshop", slug: dbW.slug, title: dbW.title, price: dbW.price, oldPrice: dbW.oldPrice, image: dbW.imageUrl };
      } else if (type === "ebook") {
        const dbE = await prismaClient.ebook.findUnique({ where: { slug } });
        if (dbE) product = { type: "ebook", slug: dbE.slug, title: dbE.title, price: dbE.price, oldPrice: dbE.oldPrice, image: dbE.coverUrl };
      } else if (type === "course") {
        const dbC = await prismaClient.course.findUnique({ where: { slug } });
        if (dbC) product = { type: "course", slug: dbC.slug, title: dbC.title, price: dbC.price, oldPrice: dbC.oldPrice, image: dbC.imageUrl };
      }
    } catch (_) {}
  }

  if (!product) {
    if (ajax) return res.status(404).json({ error: "Product not found", count: cartCount(req) });
    return res.redirect(redirect || "/courses");
  }
  const cart = req.session.cart || [];
  const key = `${product.type}:${product.slug}`;
  const existing = cart.find((i) => `${i.type}:${i.slug}` === key);
  if (existing) existing.qty = (existing.qty || 1) + 1;
  else cart.push({ ...product, qty: 1 });
  req.session.cart = cart;
  if (ajax) return res.json({ success: true, count: cartCount(req) });
  const dest = redirect && String(redirect).startsWith("/") ? redirect : req.get("Referer") || "/cart";
  res.redirect(dest);
});

// Payment result pages
app.get("/payment/success", (req, res) => {
  const orderId = req.query.orderId || "";
  const courseName = req.query.course || "Course";
  renderPage(res, "pages/payment-success", { pageTitle: "Payment Successful", orderId, courseName });
});

app.get("/payment/failed", (req, res) => {
  renderPage(res, "pages/payment-failed", { pageTitle: "Payment Failed" });
});

app.get("/checkout/:slug", (req, res) => {
  const course = courseBySlug(req.params.slug);
  if (!course) return res.status(404).send("Course not found");
  return res.redirect(`/checkout?type=course&slug=${encodeURIComponent(course.slug)}`);
});

app.get("/checkout", async (req, res) => {
  const type = typeof req.query.type === "string" ? req.query.type : "course";
  const slug = typeof req.query.slug === "string" ? req.query.slug : "";

  let product = null;
  try {
    if (type === "bundle") {
      const dbB = await prismaClient.bundle.findUnique({ where: { id: slug } });
      if (dbB) product = { type: "bundle", slug: dbB.id, title: dbB.title, price: dbB.price, oldPrice: dbB.oldPrice, image: dbB.imageUrl };
    } else if (type === "workshop") {
      const dbW = await prismaClient.workshop.findUnique({ where: { slug } });
      if (dbW) product = { type: "workshop", slug: dbW.slug, title: dbW.title, price: dbW.price, oldPrice: dbW.oldPrice, image: dbW.imageUrl };
    } else if (type === "ebook") {
      const dbE = await prismaClient.ebook.findUnique({ where: { slug } });
      if (dbE) product = { type: "ebook", slug: dbE.slug, title: dbE.title, price: dbE.price, oldPrice: dbE.oldPrice, image: dbE.coverUrl };
    } else if (type === "course") {
      const dbC = await prismaClient.course.findUnique({ where: { slug } });
      if (dbC) product = { type: "course", slug: dbC.slug, title: dbC.title, price: dbC.price, oldPrice: dbC.oldPrice, image: dbC.imageUrl };
    }
  } catch (_) {}

  if (!product) product = findProduct(type, slug);
  if (!product) return res.status(404).send("Product not found");

  const discount = Math.max(0, (product.oldPrice != null ? product.oldPrice : product.price) - product.price);
  const discountPct = product.oldPrice && product.oldPrice > product.price ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  res.locals.activeNav = type === "ebook" ? "ebooks" : type === "course" ? "courses" : "";
  renderPage(res, "pages/checkout", { pageTitle: "চেকআউট", product, discount, discountPct });
});

app.listen(PORT, () => {
  console.log(`CrackNcode Academy → http://localhost:${PORT}`);
});
