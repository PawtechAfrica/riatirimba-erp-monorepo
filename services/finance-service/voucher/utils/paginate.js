// utils/paginate.js
const MAX_PAGE_SIZE = 100

function getPagination (query) {
  let page = parseInt(query.page, 10)
  let pageSize = parseInt(query.pageSize, 10)

  if (!Number.isInteger(page) || page < 1) page = 1
  if (!Number.isInteger(pageSize) || pageSize < 1) pageSize = 20
  if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE

  const offset = (page - 1) * pageSize
  return { page, pageSize, offset, limit: pageSize }
}

function buildPaginatedResponse (page, pageSize, totalCount, data) {
  const lastPageIs = totalCount === 0 ? 1 : Math.ceil(totalCount / pageSize)
  return { page, pageSize, lastPageIs, data }
}

module.exports = { getPagination, buildPaginatedResponse }