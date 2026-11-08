import type { FindManyOptions, ObjectLiteral, Repository } from "typeorm";
import type { PageQueryDto } from "../dto/page-query.dto";

export const paginate = async <T extends ObjectLiteral>(
  repository: Repository<T>,
  { currentPage, pageSize }: PageQueryDto,
  options: FindManyOptions<T> = {},
) => {
  const [items, total] = await repository.findAndCount({
    ...options,
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  return { items, total, currentPage, pageSize };
};
