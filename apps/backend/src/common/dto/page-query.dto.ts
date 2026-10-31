import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export class PageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "页码必须为整数" })
  @Min(1, { message: "页码最小为1" })
  page = DEFAULT_PAGE;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "每页条数必须为整数" })
  @Min(1, { message: "每页条数最小为1" })
  @Max(MAX_PAGE_SIZE, { message: `每页条数最大为${MAX_PAGE_SIZE}` })
  pageSize = DEFAULT_PAGE_SIZE;
}
