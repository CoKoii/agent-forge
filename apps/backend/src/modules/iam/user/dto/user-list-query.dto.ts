import { IsDateString, IsOptional, IsString, MaxLength } from "class-validator";

import { PageQueryDto } from "../../../../common/dto/page-query.dto";

export class UserListQueryDto extends PageQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  keyword?: string;

  @IsOptional()
  @IsDateString()
  createdAtStart?: string;

  @IsOptional()
  @IsDateString()
  createdAtEnd?: string;
}
