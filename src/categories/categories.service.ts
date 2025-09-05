import { Category, CategoryType } from './category.entity';
import { Injectable, NotFoundException } from '@nestjs/common';

import { CATEGORIES } from './categories.constants';
import { CategoryResponseDto } from './dto/category-response.dto';

@Injectable()
export class CategoriesService {
  private mapToResponseDto(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      type: category.type,
      icon: category.icon,
      background: category.background,
    };
  }

  findAll(): CategoryResponseDto[] {
    return CATEGORIES.map((category) => this.mapToResponseDto(category));
  }

  findByType(type: CategoryType): CategoryResponseDto[] {
    return CATEGORIES.filter((category) => category.type === type).map(
      (category) => this.mapToResponseDto(category),
    );
  }

  findOne(id: number): CategoryResponseDto {
    const category = CATEGORIES.find((cat) => cat.id === id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return this.mapToResponseDto(category);
  }
}
