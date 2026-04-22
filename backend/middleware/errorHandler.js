function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const isApi = req.path.startsWith("/api");

  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${status}:`, err.message);

  if (isApi) {
    return res.status(status).json({
      error: status === 500 ? "Internal server error" : err.message,
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
  }

  // Page error
  const messages = {
    400: "Bad request",
    401: "Please login to continue",
    403: "You don't have permission to access this page",
    404: "Page not found",
    500: "Something went wrong on our end",
  };

  res.status(status).render("pages/error", {
    title: "CrackNcode Academy",
    pageTitle: `Error ${status}`,
    status,
    message: messages[status] || err.message,
    authUser: req.session?.user || null,
    cartCount: 0,
    activeNav: "",
    searchQuery: "",
  });
}

function notFound(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
}

module.exports = { errorHandler, notFound };
