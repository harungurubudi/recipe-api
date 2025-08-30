import { Inject, Injectable } from '@nestjs/common';
import { Recipe, RecipeID, RecipeError, RecipeInput } from './domain/recipe.entity';
import { RecipeRepository } from './repository/recipe.repository';
import { Result } from 'shared/result';

/**
 * RecipeService
 *
 * Acts as an application/business logic layer for Recipe entities.
 *
 * Right now, this service only forwards calls (e.g., getById) to the repository.
 * However, in a real-world scenario, this is where business rules will be applied,
 * such as:
 *  - Validation of request data
 *  - Applying domain-specific rules (e.g., cost calculations, availability checks)
 *  - Transforming or enriching data before returning it
 *  - Coordinating across multiple repositories or external services
 *
 * This makes the service the proper place for encapsulating recipe-related
 * use cases, ensuring the controller remains thin and focused on I/O concerns.
 */
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

  /**
   * Creates a new recipe with the given data
   *
   * @param payload the new recipe's data
   * @returns the newly created recipe, or a `RecipeError` if something goes wrong
   */
  async create(payload: RecipeInput): Promise<Result<Recipe, RecipeError>> {
    return this.repository.create(payload)
  }

  /**
   * Deletes a recipe by its ID
   *
   * @param id the ID of the recipe to be deleted
   * @returns true if the recipe was successfully deleted, or a `RecipeError` if something went wrong
   */
  async delete(id: RecipeID): Promise<Result<boolean, RecipeError>> {
    return this.repository.delete(id)
  }

  /**
   * Lists all recipes in the database.
   *
   * @returns a list of all recipes in the database, or a `RecipeError` if something goes wrong
   */
  async list(): Promise<Result<Recipe[], RecipeError>> {
    return this.repository.list()
  }
}
