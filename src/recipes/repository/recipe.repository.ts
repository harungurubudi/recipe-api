import { Injectable } from "@nestjs/common";
import { RecipeEntity } from "./entities/recipe.entity";
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm";
import { Recipe, RecipeID } from "../domain/recipe.entity";

export abstract class RecipeRepository {
  abstract getByID(id: RecipeID): Promise<Recipe | null>;
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
  ) {}

  /**
   * Retrieves a recipe by ID.
   *
   * @param id the ID of the recipe to be retrieved
   * @returns the recipe with the given ID, or null if none exists
   */
  async getByID(id: RecipeID): Promise<Recipe | null> {
    return this.repository
      .findOneBy({ id: RecipeID.value(id) })
      .then((user) => {
        if (user) {
          return user.toDomain()
        }
        return null
      })
  }
}
