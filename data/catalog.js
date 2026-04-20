const img = (seed, w = 600, h = 380) => `https://picsum.photos/seed/cnc-${seed}/${w}/${h}`;

const courses = [
  {
    slug: "freepik-ai-masterclass",
    title: "Freepik AI Masterclass",
    titleBn: "ফ্রিপিক AI মাস্টারক্লাস",
    desc: "AI ইমেজ, ভিডিও ও ডিজাইন ওয়ার্কফ্লো — বাংলায় সহজ গাইড।",
    subtitle: "The Next Level of AI Content Production",
    price: 2999,
    oldPrice: 15000,
    duration: "৩০ দিন",
    durationBadge: "30d",
    image: img("fcourse-1", 640, 400),
    category: "Artificial Intelligence",
    courseType: "Pre-Recorded",
    learners: 146,
    discountPct: 80,
    level: "Beginner",
    recordType: "Pre-Recorded",
    instructor: {
      name: "Sabbir Ahmed",
      email: "sabbir@crackncode.academy",
      avatar: img("instructor-sa", 160, 160),
    },
    detailParagraphs: [
      "আপনি কি 'টুল কালেক্টর' নাকি 'সলিউশন মেকার'?",
      "ফ্রি টুল দিয়ে খেলা করা আর প্রফেশনাল ইকোসিস্টেমে কাজ করা এক জিনিস না। Gemini, Sora, Runway, Freepik — সব একসাথে বাংলায় শিখুন।",
    ],
    modules: [
      { title: "মডিউল ১: মাইনডসেট শিফট করে প্রফেশনালি চিন্তাভাবনা শুরু করুন", lessons: 3 },
      { title: "মডিউল ২: প্রম্পট লিখেই ফটোশপ লেভেল গ্রাফিক ডিজাইন ও ফটো এডিটিং", lessons: 3 },
      { title: "মডিউল ৩: ভিডিও ও মোশন কন্টেন্ট প্রোডাকশন", lessons: 4 },
      { title: "মডিউল ৪: ব্র্যান্ড কিট ও ক্লায়েন্ট ডেলিভারি", lessons: 2 },
    ],
    reviewsSummary: { avg: 4.5, count: 2, bars: [70, 20, 5, 3, 2] },
    reviews: [
      { initials: "RA", name: "rakib khan", stars: 5, time: "2 days ago", text: "Good one, fulfill my expectations" },
      { initials: "MO", name: "mohona", stars: 4, time: "1 week ago", text: "ভালো লেগেছে, আপডেট চাই।" },
    ],
  },
  {
    slug: "content-creation-passive-income-ai",
    title: "Content Creation & Passive Income with AI",
    titleBn: "কন্টেন্ট ক্রিয়েশন ও প্যাসিভ ইনকাম উইথ AI",
    desc: "ChatGPT, Midjourney — সোশ্যাল ও ইউটিউব স্ট্র্যাটেজি।",
    subtitle: "Build once, earn repeatedly",
    price: 1999,
    oldPrice: 5000,
    duration: "৪৫ দিন",
    durationBadge: "45d",
    image: img("topsell-main", 640, 400),
    category: "Artificial Intelligence",
    courseType: "Pre-Recorded",
    learners: 89,
    discountPct: 60,
    level: "Beginner",
    recordType: "Pre-Recorded",
    instructor: { name: "CrackNcode Team", email: "team@crackncode.academy", avatar: img("instructor-t", 160, 160) },
    detailParagraphs: ["AI দিয়ে কন্টেন্ট পাইপলাইন বানানোর সম্পূর্ণ গাইড।"],
    modules: [{ title: "মডিউল ১: নিশ নির্বাচন ও অডিয়েন্স", lessons: 2 }],
    reviewsSummary: { avg: 5, count: 12, bars: [100, 0, 0, 0, 0] },
    reviews: [],
  },
  {
    slug: "linkedin-for-everyone",
    title: "LinkedIn for Everyone",
    titleBn: "লিংকডইন ফর এভরিওয়ান",
    desc: "প্রোফাইল, নেটওয়ার্কিং ও জব হান্টিং।",
    subtitle: "Grow your professional brand",
    price: 1499,
    oldPrice: 5000,
    duration: "২০ দিন",
    durationBadge: "20d",
    image: img("course-li", 640, 400),
    category: "Digital Marketing",
    courseType: "Pre-Recorded",
    learners: 54,
    discountPct: 70,
    level: "Beginner",
    recordType: "Pre-Recorded",
    instructor: { name: "CrackNcode Team", email: "team@crackncode.academy", avatar: img("instructor-li", 160, 160) },
    detailParagraphs: ["লিংকডইন অপটিমাইজেশন ও আউটরিচ।"],
    modules: [{ title: "মডিউল ১: প্রোফাইল অপটিমাইজ", lessons: 3 }],
    reviewsSummary: { avg: 4.8, count: 5, bars: [80, 20, 0, 0, 0] },
    reviews: [],
  },
  {
    slug: "facebook-ads-lets-learn",
    title: "Let's learn Facebook Ads",
    titleBn: "ফেসবুক অ্যাডস শিখি",
    desc: "ক্যাম্পেইন সেটআপ থেকে অপটিমাইজেশন।",
    subtitle: "Performance marketing basics",
    price: 1499,
    oldPrice: 5000,
    duration: "২৫ দিন",
    durationBadge: "25d",
    image: img("course-fb", 640, 400),
    category: "Digital Marketing",
    courseType: "Live Batch",
    learners: 120,
    discountPct: 70,
    level: "Beginner",
    recordType: "Live Batch",
    instructor: { name: "CrackNcode Team", email: "team@crackncode.academy", avatar: img("instructor-fb", 160, 160) },
    detailParagraphs: ["ফেসবুক বিজ্ঞাপনের ধাপে ধাপে গাইড।"],
    modules: [{ title: "মডিউল ১: পিক্সেল ও ইভেন্ট", lessons: 4 }],
    reviewsSummary: { avg: 4.6, count: 8, bars: [60, 30, 10, 0, 0] },
    reviews: [],
  },
  {
    slug: "ai-sales-landing-page",
    title: "AI দিয়ে সেলস ড্রিভেন ল্যান্ডিং পেইজ তৈরি",
    titleBn: "AI দিয়ে সেলস ড্রিভেন ল্যান্ডিং পেইজ তৈরি",
    desc: "কপি, লেআউট ও কনভার্শন ফোকাস।",
    subtitle: "Landing pages that sell",
    price: 999,
    oldPrice: 5000,
    duration: "১৫ দিন",
    durationBadge: "15d",
    image: img("course-lp", 640, 400),
    category: "Digital Marketing",
    courseType: "Pre-Recorded",
    learners: 200,
    discountPct: 80,
    level: "Beginner",
    recordType: "Pre-Recorded",
    instructor: { name: "CrackNcode Team", email: "team@crackncode.academy", avatar: img("instructor-lp", 160, 160) },
    detailParagraphs: ["AI টুল দিয়ে ল্যান্ডিং পেজ প্রোটোটাইপ।"],
    modules: [{ title: "মডিউল ১: হিরো সেকশন ও অফার", lessons: 2 }],
    reviewsSummary: { avg: 4.9, count: 20, bars: [90, 10, 0, 0, 0] },
    reviews: [],
  },
  {
    slug: "gemini-ai-design-masterclass",
    title: "Gemini AI Design Masterclass",
    titleBn: "জেমিনি AI ডিজাইন মাস্টারক্লাস",
    desc: "প্রম্পট থেকে ফাইনাল আউটপুট।",
    subtitle: "Design with Gemini",
    price: 999,
    oldPrice: 2500,
    duration: "২১ দিন",
    durationBadge: "21d",
    image: img("fcourse-2", 640, 400),
    category: "Artificial Intelligence",
    courseType: "Pre-Recorded",
    learners: 77,
    discountPct: 60,
    level: "Beginner",
    recordType: "Pre-Recorded",
    instructor: { name: "CrackNcode Team", email: "team@crackncode.academy", avatar: img("instructor-g", 160, 160) },
    detailParagraphs: ["জেমিনি দিয়ে ডিজাইন ওয়ার্কফ্লো।"],
    modules: [{ title: "মডিউল ১: ইমেজ জেনারেশন", lessons: 3 }],
    reviewsSummary: { avg: 4.7, count: 6, bars: [70, 20, 10, 0, 0] },
    reviews: [],
  },
];

const bundles = [
  { id: "b1", title: "Salary Day offer - পার্সোনাল গ্রোথ ই-বুক বান্ডেল", price: 597, old: 1299, image: img("bundle-ebook", 640, 360), layout: "banner" },
  { id: "b2", title: "কালবৈশাখী স্পেশাল বান্ডেল", price: 4999, old: 11000, image: img("bundle-kb", 640, 360), layout: "banner" },
  {
    id: "b3",
    title: "Facebook Ads + বোনাস ভিডিও এডিটিং",
    price: 1999,
    old: 4500,
    image: img("bundle-combo", 640, 360),
    layout: "combo",
    mainItem: { label: "MAIN ITEM", title: "Facebook Ads - 2 Hour Workshop", thumb: img("combo-main", 120, 80) },
    bonusItem: { label: "FREE BONUS", title: "Video Editing Masterclass", thumb: img("combo-bonus", 120, 80) },
  },
  { id: "b4", title: "AI সুপার স্ট্যাক বান্ডেল", price: 8999, old: 20000, image: img("bundle-2", 640, 360), layout: "banner" },
  { id: "b5", title: "ক্যারিয়ার স্টার্টার প্যাক", price: 3999, old: 9000, image: img("bundle-3", 640, 360), layout: "banner" },
  { id: "b6", title: "ডিজাইন + ভিডিও কম্বো", price: 4999, old: 11000, image: img("bundle-4", 640, 360), layout: "banner" },
];

const workshops = [
  { slug: "dm-deep-dive", title: "ডিজিটাল মার্কেটিং ডিপ ডাইভ", desc: "লাইভ Q&A সহ সম্পূর্ণ ওয়ার্কশপ।", price: 2499, old: 5000, duration: "90d", image: img("ws-1", 640, 400), category: "Digital Marketing", wType: "Live Workshop" },
  { slug: "ai-landing-2h", title: "AI ল্যান্ডিং পেইজ ২ ঘণ্টা", desc: "হ্যান্ডস-অন টেমপ্লেট।", price: 499, old: 1500, duration: "2h", image: img("ws-2", 640, 400), category: "Artificial Intelligence", wType: "Live Workshop" },
  { slug: "brand-story", title: "ব্র্যান্ড স্টোরিটেলিং", desc: "গ্রাফিক ডিজাইনারদের জন্য।", price: 999, old: 2000, duration: "30d", image: img("ws-3", 640, 400), category: "Graphic Design", wType: "Pre-Recorded" },
  { slug: "content-sprint", title: "কন্টেন্ট স্প্রিন্ট", desc: "৭ দিনে ৩০ পোস্ট প্ল্যান।", price: 799, old: 1600, duration: "7d", image: img("ws-4", 640, 400), category: "Digital Marketing", wType: "Bootcamp Training" },
  { slug: "figma-ui", title: "Figma UI ক্র্যাশকোর্স", desc: "UI কিট থেকে ডেভ হ্যান্ডঅফ।", price: 1499, old: 3000, duration: "14d", image: img("ws-5", 640, 400), category: "Graphic Design", wType: "Live Batch" },
  { slug: "mentor-ai", title: "AI মেন্টরশিপ সেশন", desc: "১-টু-১ গাইডেন্স।", price: 5000, old: 8000, duration: "30d", image: img("ws-6", 640, 400), category: "Artificial Intelligence", wType: "Mentorship Program" },
];

const ebooks = [
  { slug: "eb-ai-handbook", title: "AI কন্টেন্ট হ্যান্ডবুক", author: "Sabbir Ahmed", price: 199, old: 499, cover: img("ebook-1", 400, 520) },
  { slug: "eb-spoken", title: "স্পোকেন ইংলিশ গাইড", author: "Guest Author", price: 149, old: 399, cover: img("ebook-2", 400, 520) },
  { slug: "eb-prompt", title: "প্রম্পট ইঞ্জিনিয়ারিং ই-বুক", author: "CrackNcode Team", price: 99, old: 299, cover: img("ebook-3", 400, 520) },
  { slug: "eb-freelance", title: "ফ্রিল্যান্সিং রোডম্যাপ", author: "CrackNcode Team", price: 249, old: 599, cover: img("ebook-4", 400, 520) },
  { slug: "eb-data", title: "ডাটা সায়েন্স স্টার্টার", author: "CrackNcode Team", price: 299, old: 799, cover: img("ebook-5", 400, 520) },
  { slug: "eb-job-biz", title: "চাকরির পাশাপাশি বিজনেস", author: "Sabbir Ahmed", price: 179, old: 449, cover: img("ebook-6", 400, 520) },
  { slug: "eb-fb", title: "ফেসবুক মার্কেটিং চিটশিট", author: "CrackNcode Team", price: 129, old: 349, cover: img("ebook-7", 400, 520) },
  { slug: "eb-yt", title: "ইউটিউব গ্রোথ প্লেবুক", author: "CrackNcode Team", price: 219, old: 499, cover: img("ebook-8", 400, 520) },
];

const blogs = [
  { slug: "fb-retarget", title: "ফেসবুক অ্যাড রিটার্গেটিংয়ের হিডেন ট্রিকস", excerpt: "অডিয়েন্স স্ট্যাকিং ও লুকআলাইক — সংক্ষেপে যা জানা দরকার।", date: "Apr 11, 2026", image: img("blog-1", 640, 360) },
  { slug: "ai-workflow", title: "২০২৬ সালের AI ওয়ার্কফ্লো", excerpt: "টুল চয়ন থেকে ডেলিভারি পর্যন্ত চেকলিস্ট।", date: "Apr 8, 2026", image: img("blog-2", 640, 360) },
  { slug: "prompt-101", title: "প্রম্পট লেখার ৫টি নিয়ম", excerpt: "LLM থেকে ভালো আউটপুট বের করার কৌশল।", date: "Apr 1, 2026", image: img("blog-3", 640, 360) },
  { slug: "design-tokens", title: "ডিজাইন টোকেন দিয়ে স্কেল", excerpt: "টিম হ্যান্ডঅফ সহজ করুন।", date: "Mar 22, 2026", image: img("blog-4", 640, 360) },
  { slug: "linkedin-leads", title: "লিংকডইন থেকে লিড", excerpt: "DM টেমপ্লেট যা স্প্যাম নয়।", date: "Mar 10, 2026", image: img("blog-5", 640, 360) },
  { slug: "video-hook", title: "প্রথম ৩ সেকেন্ডে হুক", excerpt: "শর্টফর্ম কন্টেন্ট টিপস।", date: "Feb 28, 2026", image: img("blog-6", 640, 360) },
  { slug: "pricing-freelance", title: "ফ্রিল্যান্স প্রাইসিং", excerpt: "প্যাকেজ vs আওয়ারly রেট।", date: "Feb 14, 2026", image: img("blog-7", 640, 360) },
  { slug: "student-habits", title: "শিক্ষার্থীদের ৭ অভ্যাস", excerpt: "কোর্স শেষ করার হার বাড়ানোর উপায়।", date: "Feb 2, 2026", image: img("blog-8", 640, 360) },
];

function courseBySlug(slug) {
  return courses.find((c) => c.slug === slug) || null;
}

function workshopBySlug(slug) {
  return workshops.find((w) => w.slug === slug) || null;
}

/** Find purchasable item for cart / checkout */
function searchAll(rawQuery) {
  const q = String(rawQuery || "")
    .trim()
    .toLowerCase();
  if (!q) {
    return { courses: [], bundles: [], workshops: [], ebooks: [], blogs: [], query: "" };
  }
  const m = (s) => String(s || "")
    .toLowerCase()
    .includes(q);
  return {
    query: String(rawQuery).trim(),
    courses: courses.filter((c) => m(c.title) || m(c.titleBn) || m(c.desc) || m(c.subtitle)),
    bundles: bundles.filter((b) => m(b.title)),
    workshops: workshops.filter((w) => m(w.title) || m(w.desc)),
    ebooks: ebooks.filter((e) => m(e.title) || m(e.author)),
    blogs: blogs.filter((b) => m(b.title) || m(b.excerpt)),
  };
}

function findProduct(type, slug) {
  if (type === "course") {
    const c = courseBySlug(slug);
    if (!c) return null;
    return { type, slug, title: c.title, price: c.price, oldPrice: c.oldPrice, image: c.image };
  }
  if (type === "workshop") {
    const w = workshopBySlug(slug);
    if (!w) return null;
    return { type, slug, title: w.title, price: w.price, oldPrice: w.old, image: w.image };
  }
  if (type === "ebook") {
    const e = ebooks.find((x) => x.slug === slug);
    if (!e) return null;
    return { type, slug, title: e.title, price: e.price, oldPrice: e.old, image: e.cover };
  }
  if (type === "bundle") {
    const b = bundles.find((x) => x.id === slug);
    if (!b) return null;
    return { type, slug: b.id, title: b.title, price: b.price, oldPrice: b.old, image: b.image };
  }
  return null;
}

module.exports = {
  img,
  courses,
  bundles,
  workshops,
  ebooks,
  blogs,
  courseBySlug,
  workshopBySlug,
  findProduct,
  searchAll,
};
