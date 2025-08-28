import { CategoriesController } from './categories.controller';
import { CategoriesSeedService } from './categories.seed';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesSeedService],
  exports: [CategoriesService, CategoriesSeedService],
})
export class CategoriesModule {}
