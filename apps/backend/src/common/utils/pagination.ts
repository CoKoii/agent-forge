export const getPagination = (page = 1, pageSize = 20) => {
  const size = Math.min(Math.max(pageSize, 1), 100);
  const currentPage = Math.max(page, 1);

  return {
    page: currentPage,
    pageSize: size,
    skip: (currentPage - 1) * size,
    take: size,
  };
};

export type Pagination = ReturnType<typeof getPagination>;

export const pageResult = <T>(items: T[], total: number, { page, pageSize }: Pagination) => ({
  items,
  total,
  page,
  pageSize,
});
