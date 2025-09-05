import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoryType } from './category.entity';
import { CategoryResponseDto } from './dto/category-response.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(): CategoryResponseDto[] {
    return this.categoriesService.findAll();
  }

  @Get('type/:type')
  findByType(
    @Param('type', new ParseEnumPipe(CategoryType)) type: CategoryType,
  ): CategoryResponseDto[] {
    return this.categoriesService.findByType(type);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): CategoryResponseDto {
    return this.categoriesService.findOne(id);
  }
}
