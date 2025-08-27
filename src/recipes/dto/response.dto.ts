import { Recipe } from "recipes/domain/recipe.entity";
import { Expose } from "class-transformer";

// recipes/dto/recipe-response.dto.ts
export class RecipeResponseDto {
  @Expose()
  id: string;
  @Expose()
  title: string;
  @Expose({ name: 'making_time' })
  makingTime?: string;
  @Expose()
  serves?: string;
  @Expose()
  ingredients?: string;
  @Expose()
  cost?: string;
  @Expose({ name: 'created_at' })
  createdAt: string;
  @Expose({ name: 'updated_at' })
  updatedAt: string;

  /**
   * Creates a new `RecipeResponseDto` from a given `Recipe` domain object.
   * @param recipe the `Recipe` domain object to be converted
   * @returns a new `RecipeResponseDto` with the properties of the `Recipe` domain object
   */
  constructor(recipe: Recipe) {
    this.id = recipe.id.toString();
    this.title = recipe.title;
    this.makingTime = recipe.makingTime;
    this.serves = recipe.serves;
    this.ingredients = recipe.ingredients;
    this.cost = recipe.cost.toString();
    this.createdAt = this.formatDate(recipe.createdAt);
    this.updatedAt = this.formatDate(recipe.updatedAt);
  }

  private formatDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
           `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
}
