import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipeEntity } from './entities/recipe.entity';
import { TypeOrmRecipeRepository } from './recipe.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecipeEntity]),
  ],
  providers: [{
    provide: "RecipeRepository",
    useClass: TypeOrmRecipeRepository
  }],
  exports: ['RecipeRepository'],
})
export class RepositoryModule {}
