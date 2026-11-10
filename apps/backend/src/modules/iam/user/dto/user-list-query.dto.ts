import { Type } from "class-transformer";
import { IsDateString, IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

import { PageQueryDto } from "../../../../common/dto/page-query.dto";

export class UserListQueryDto extends PageQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  keyword?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  roleId?: number;

  @IsOptional()
  @IsDateString()
  createdAtStart?: string;

  @IsOptional()
  @IsDateString()
  createdAtEnd?: string;
}
