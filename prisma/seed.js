require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../backend/lib/prisma");
const catalog = require("../data/catalog");

async function main() {
  // Admin user
  const passwordHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@crackncode.academy" },
    update: {},
    create: { name: "Admin", email: "admin@crackncode.academy", passwordHash, role: "ADMIN" },
  });
  console.log("Admin seeded:", admin.email);

  // Courses
  for (const c of catalog.courses) {
    await prisma.course.upsert({
      where: { slug: c.slug },
      update: { title: c.title, titleBn: c.titleBn, description: c.desc, price: c.price, oldPrice: c.oldPrice, imageUrl: c.image, category: c.category, courseType: c.courseType, level: c.level, duration: c.duration, isPublished: true },
      create: { slug: c.slug, title: c.title, titleBn: c.titleBn, description: c.desc, price: c.price, oldPrice: c.oldPrice, imageUrl: c.image, category: c.category, courseType: c.courseType, level: c.level, duration: c.duration, isPublished: true },
    });
  }
  console.log(`${catalog.courses.length} courses seeded.`);

  // Workshops
  for (const w of catalog.workshops) {
    await prisma.workshop.upsert({
      where: { slug: w.slug },
      update: { title: w.title, description: w.desc, price: w.price, oldPrice: w.old, imageUrl: w.image, category: w.category, wType: w.wType, duration: w.duration, isPublished: true },
      create: { slug: w.slug, title: w.title, description: w.desc, price: w.price, oldPrice: w.old, imageUrl: w.image, category: w.category, wType: w.wType, duration: w.duration, isPublished: true },
    });
  }
  console.log(`${catalog.workshops.length} workshops seeded.`);

  // Ebooks
  for (const e of catalog.ebooks) {
    await prisma.ebook.upsert({
      where: { slug: e.slug },
      update: { title: e.title, author: e.author, price: e.price, oldPrice: e.old, coverUrl: e.cover, isPublished: true },
      create: { slug: e.slug, title: e.title, author: e.author, price: e.price, oldPrice: e.old, coverUrl: e.cover, isPublished: true },
    });
  }
  console.log(`${catalog.ebooks.length} ebooks seeded.`);

  // Blogs
  for (const b of catalog.blogs) {
    await prisma.blog.upsert({
      where: { slug: b.slug },
      update: { title: b.title, excerpt: b.excerpt, imageUrl: b.image, isPublished: true },
      create: { slug: b.slug, title: b.title, excerpt: b.excerpt, imageUrl: b.image, isPublished: true },
    });
  }
  console.log(`${catalog.blogs.length} blogs seeded.`);

  // Bundles
  for (const b of catalog.bundles) {
    const existing = await prisma.bundle.findFirst({ where: { title: b.title } });
    if (existing) {
      await prisma.bundle.update({ where: { id: existing.id }, data: { title: b.title, price: b.price, oldPrice: b.old, imageUrl: b.image, isPublished: true } });
    } else {
      await prisma.bundle.create({ data: { title: b.title, price: b.price, oldPrice: b.old, imageUrl: b.image, isPublished: true } });
    }
  }
  console.log(`${catalog.bundles.length} bundles seeded.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
