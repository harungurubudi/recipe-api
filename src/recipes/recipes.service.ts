import { Inject, Injectable } from '@nestjs/common';
import { Recipe, RecipeID, RecipeError } from './domain/recipe.entity';
import { RecipeRepository } from './repository/recipe.repository';
import { Result } from 'shared/result';

@Injectable()
export class RecipesService {
    constructor(
    @Inject('RecipeRepository')
    private readonly repository: RecipeRepository,
  ) { }
  
  /**
   * Finds a single recipe by its ID
   *
   * @param id the ID of the recipe to be found
   * @returns the recipe with the given ID, or a `RecipeError` if no such recipe exists
   */
  async findOne(id: RecipeID): Promise<Result<Recipe, RecipeError>> {
    return this.repository.getByID(id)
  }
}
