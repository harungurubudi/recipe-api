import { Exclude, Expose, Transform } from 'class-transformer';
import { Recipe, RecipeID } from '../domain/recipe.entity';

/**
 * DTO for brief recipe information
 * It is exluding : createdAt and updatedAt
 */
export class BriefRecipeDto {
  @Transform(({ value }) => RecipeID.value(value))
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose({ name: 'making_time' })
  makingTime: string;

  @Expose()
  serves: string;

  @Expose()
  ingredients: string;

  @Expose()
  @Transform(({ value }) => value.toString()) // ensure cost becomes string
  cost: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  constructor(recipe: Recipe) {
    Object.assign(this, recipe);  
  }
}
