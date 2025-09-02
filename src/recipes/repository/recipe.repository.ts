import { Injectable, Inject } from "@nestjs/common";
import { RecipeEntity } from "./entities/recipe.entity";
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm";
import { Recipe, RecipeID, RecipeError, RecipeCreateInput, RecipeUpdateInput } from "../domain/recipe.entity";
import { Result, ok, error } from "../../shared/result";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";

export abstract class RecipeRepository {
  abstract getByID(id: RecipeID): Promise<Result<Recipe, RecipeError>>;
  abstract create(payload: RecipeCreateInput): Promise<Result<Recipe, RecipeError>>
  abstract delete(id: RecipeID): Promise<Result<boolean, RecipeError>>
  abstract list(): Promise<Result<Recipe[], RecipeError>>
  abstract update(id: RecipeID, payload: RecipeUpdateInput): Promise<Result<Recipe, RecipeError>>
}

const cachePrefix = 'recipe'

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

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) {}

  /**
   * Retrieves a recipe by ID.
   *
   * @param id the ID of the recipe to be retrieved
   * @returns the recipe with the given ID, or null if none exists
   */
  async getByID(id: RecipeID): Promise<Result<Recipe, RecipeError>> {
    const cacheKey = cachePrefix + ':' + RecipeID.value(id).toString()
    try {
      // Try to get from cache first
      const cached = await this.cacheManager.get<Recipe>(cacheKey)
    
      if (cached) {
        return ok(cached)
      }

      // If not in cache, get from DB and save to cache
      const entity = await this.repository.findOneBy({ id: RecipeID.value(id) })
      if (entity) {
        const result = entity.toDomain()
        await this.cacheManager.set(cacheKey, result, 60_000)
        return ok(result)
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
  async create(payload: RecipeCreateInput): Promise<Result<Recipe, RecipeError>> {
    try {
      const entity = new RecipeEntity()
      Object.assign(entity, payload)

      const recipe = await this.repository.save(entity)
      if (recipe) {
        return this.getByID(RecipeID.of(recipe.id))
      }
      return error({ type: 'RecipeSaveError', error: new Error('Failed to create recipe') })
    } catch (e) {
      return error({ type: 'RecipeSaveError', error: new Error('Failed to create recipe') })
    }
  }

  async delete(id: RecipeID): Promise<Result<boolean, RecipeError>> {
    const cacheKey = cachePrefix + ':' + RecipeID.value(id).toString()
    try {
      const recipe = await this.repository.findOneBy({ id: RecipeID.value(id) });
      if (!recipe) {
        return error({ type: 'RecipeDeleteError', error: new Error('No recipe found') });
      }

      await this.repository.delete({ id: RecipeID.value(id) });
      await this.cacheManager.del(cacheKey)
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
      const recipes = await this.repository.find();
      return ok(recipes.map(r => {
        const result = r.toDomain()
        // Set each element to cache
        this.cacheManager.set(cachePrefix + ':' + r.id.toString(), result, 60_000)
        return result
      }))
    } catch (e) {
      return error({
        type: 'RecipeListError',
        error: new Error('Failed to list recipes')
      });
    }
  }

  /**
   * Updates an existing recipe by ID.
   *
   * @param id the ID of the recipe to be updated
   * @param payload the input data for the updated recipe
   * @returns the updated recipe, or a RecipeError if something goes wrong
   */
  async update(id: RecipeID, payload: RecipeUpdateInput): Promise<Result<Recipe, RecipeError>> {
    const cacheKey = cachePrefix + ':' + RecipeID.value(id).toString()
    try {
      const result = await this.repository.update({ id: RecipeID.value(id) }, payload);
      if (result.affected === 0) {
        return error({ type: 'RecipeUpdateError', error: new Error('No recipe found') });
      }
      await this.cacheManager.del(cacheKey)
      return this.getByID(id);
    } catch (e) {
      return error({ type: 'RecipeUpdateError', error: new Error('Failed to update recipe') });
    }
  }
}
