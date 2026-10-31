import { PartialType } from "@nestjs/mapped-types";
import { ArrayUnique, IsArray, IsInt, IsOptional, IsString, Length } from "class-validator";

export class CreateRoleDto {
  @IsString()
  @Length(1, 100)
  code!: string;

  @IsString()
  @Length(1, 100)
  name!: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  permissionIds?: number[];
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
