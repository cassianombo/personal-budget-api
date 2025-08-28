import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { CategoryType } from '../category.entity';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @IsNotEmpty()
  @IsString()
  icon: string;

  @IsNotEmpty()
  @IsString()
  background: string;
}
