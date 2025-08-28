import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { categoriesMock } from './categories.mock';

@Injectable()
export class CategoriesSeedService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async seed() {
    try {
      // Check if categories already exist
      const existingCategories = await this.categoryRepository.count();
      
      if (existingCategories > 0) {
        console.log('Categories already exist, skipping seed...');
        return;
      }

      // Insert all categories
      const createdCategories = await this.categoryRepository.save(categoriesMock);
      
      console.log(`Successfully seeded ${createdCategories.length} categories`);
      return createdCategories;
    } catch (error) {
      console.error('Error seeding categories:', error);
      throw error;
    }
  }

  async clear() {
    try {
      await this.categoryRepository.clear();
      console.log('All categories cleared');
    } catch (error) {
      console.error('Error clearing categories:', error);
      throw error;
    }
  }
}
