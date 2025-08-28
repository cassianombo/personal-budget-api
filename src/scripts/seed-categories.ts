import { AppModule } from '../app.module';
import { CategoriesSeedService } from '../categories/categories.seed';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const seedService = app.get(CategoriesSeedService);
    await seedService.seed();
    console.log('Categories seeding completed successfully!');
  } catch (error) {
    console.error('Failed to seed categories:', error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
