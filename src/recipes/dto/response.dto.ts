import { Expose, Type } from 'class-transformer';
import { BriefRecipeDto } from './recipe.dto';

export class RecipeResponseDto {
  @Expose()
  message: string;

  @Expose()
  @Type(() => BriefRecipeDto)
  recipe: BriefRecipeDto[];

  constructor(message: string, recipes: BriefRecipeDto[]) {
    this.message = message;
    this.recipe = recipes;
  }
}
