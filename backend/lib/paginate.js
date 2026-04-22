function paginate(query) {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 12));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
}

function paginationMeta(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

module.exports = { paginate, paginationMeta };
