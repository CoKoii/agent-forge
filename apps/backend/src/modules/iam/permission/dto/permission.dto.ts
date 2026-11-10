import { IsInt, IsOptional, IsString, Length, Min } from "class-validator";

export class CreatePermissionDto {
  @IsString()
  @Length(1, 100)
  code!: string;

  @IsString()
  @Length(1, 100)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  parentId?: number | null;
}

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  code?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  parentId?: number | null;
}
