import { Module } from '@nestjs/common';
import { RecipesModule } from './recipes/recipes.module';
import { AdapterModule } from './adapter/adapter.module';

@Module({
  imports: [RecipesModule, AdapterModule],
})
export class AppModule {}
