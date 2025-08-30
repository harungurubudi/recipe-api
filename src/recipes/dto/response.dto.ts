import { Expose, Type } from 'class-transformer';
import { BriefRecipeDto, RecipeDto } from './recipe.dto';

export class RecipeResponseDto {
  @Expose()
  message: string;

  @Expose()
  recipe: BriefRecipeDto[] | RecipeDto[];
  constructor(message: string, recipes: BriefRecipeDto[] | RecipeDto[]) {
    this.message = message;
    this.recipe = recipes;
  }
}

export class MessageResponseDTO {
  @Expose()
  message: string;
  constructor(message: string) {
    this.message = message;
  }
}