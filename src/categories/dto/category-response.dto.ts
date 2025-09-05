import { CategoryType } from '../category.entity';

export class CategoryResponseDto {
  id: number;
  name: string;
  type: CategoryType;
  icon: string;
  background: string;
}
