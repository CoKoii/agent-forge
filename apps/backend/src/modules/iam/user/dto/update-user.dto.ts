import { Type } from "class-transformer";
import { ArrayUnique, IsArray, IsInt, IsString, Length, Min, ValidateIf } from "class-validator";

export class UpdateUserDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Length(0, 50)
  realName?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Length(0, 50)
  nickname?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  roleIds?: number[];
}
