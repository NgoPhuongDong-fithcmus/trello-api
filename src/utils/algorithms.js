export const skipPage = (pageNumber, itemsPerPage) => {
  if (!pageNumber || !itemsPerPage) return 0
  if (pageNumber <= 0 || itemsPerPage <= 0) return 0

  return (pageNumber - 1) * itemsPerPage
}