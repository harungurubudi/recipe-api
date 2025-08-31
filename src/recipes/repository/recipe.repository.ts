import { Injectable } from "@nestjs/common";
import { RecipeEntity } from "./entities/recipe.entity";
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm";
import { Recipe, RecipeID, RecipeError, RecipeInput } from "../domain/recipe.entity";
import { Result, ok, error } from "../../shared/result";

export abstract class RecipeRepository {
  abstract getByID(id: RecipeID): Promise<Result<Recipe, RecipeError>>;
  abstract create(payload: RecipeInput): Promise<Result<Recipe, RecipeError>>
  abstract delete(id: RecipeID): Promise<Result<boolean, RecipeError>>
  abstract list(): Promise<Result<Recipe[], RecipeError>>
}

@Injectable()
export class TypeOrmRecipeRepository implements RecipeRepository {
  /**
   * Construct a new TypeORM-based recipe repository
   *
   * @param repository the underlying TypeORM repository for the recipe entity
   */
  constructor(
    @InjectRepository(RecipeEntity)
    private readonly repository: Repository<RecipeEntity>,
  ) { }

  /**
   * Retrieves a recipe by ID.
   *
   * @param id the ID of the recipe to be retrieved
   * @returns the recipe with the given ID, or null if none exists
   */
  async getByID(id: RecipeID): Promise<Result<Recipe, RecipeError>> {
    try {
      const recipe = await this.repository.findOneBy({ id: RecipeID.value(id) })
      if (recipe) {
        return ok(recipe.toDomain())
      }
      return error({ type: 'RecipeNotFoundError', error: new Error('No recipe found') })
    } catch (e) {
      return error({ type: 'RecipeNotFoundError', error: new Error('Failed to get recipe') })
    }
  }

  /**
   * Creates a new recipe and saves it to the database.
   *
   * @param payload the input data for the new recipe
   * @returns the newly created recipe, or a RecipeError if something goes wrong
   */
  async create(payload: RecipeInput): Promise<Result<Recipe, RecipeError>> {
    try {
      const recipe = await this.repository.save(RecipeEntity.fromInput(payload))
      if (recipe) {
        return ok(recipe.toDomain())
      }
      return error({ type: 'RecipeSaveError', error: new Error('Failed to create recipe') })
    } catch (e) {
      return error({ type: 'RecipeSaveError', error: new Error('Failed to create recipe') })
    }
  }

  async delete(id: RecipeID): Promise<Result<boolean, RecipeError>> {
    try {
      const recipe = await this.repository.findOneBy({ id: RecipeID.value(id) });
      if (!recipe) {
        return error({ type: 'RecipeDeleteError', error: new Error('No recipe found') });
      }

      await this.repository.delete({ id: RecipeID.value(id) });
      return ok(true);

    } catch (e) {
      return error({ type: 'RecipeDeleteError', error: new Error('Failed to delete recipe') });
    }
  }

  /**
   * Lists all recipes in the database.
   *
   * @returns a list of all recipes in the database, or a RecipeError if something goes wrong
   */
  async list(): Promise<Result<Recipe[], RecipeError>> {
    try {
      const recipes =  await this.repository.find();
      return ok(recipes.map(r => r.toDomain()))
    } catch (e) {
      return error({ 
        type: 'RecipeListError', 
        error: new Error('Failed to list recipes') 
      });
    }
  }
}
