import { Recipe, RecipeID } from "../../domain/recipe.entity"
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity("recipes")
export class RecipeEntity {
  @PrimaryGeneratedColumn("increment")
  id: number

  @Column({name: "title", type: "varchar", length: 100, collation: "utf8_unicode_ci" })
  title: string

  @Column({name: "making_time", type: "varchar", length: 100, collation: "utf8_unicode_ci" })
  makingTime: string

  @Column({name: "serves", type: "varchar", length: 100, collation: "utf8_unicode_ci" })
  serves: string

  @Column({name: "ingredients", type: "varchar", length: 300, collation: "utf8_unicode_ci" })
  ingredients: string

  @Column({name: "cost", type: "int", default: 0 })
  cost: number

  @Column({ name: "created_at", type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date

  @Column({ name: "updated_at", type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
  updatedAt: Date

  // Convert entity → domain
  toDomain(): Recipe {
    return new Recipe(
      RecipeID.of(this.id),
      this.title,
      this.makingTime,
      this.serves,
      this.ingredients,
      this.cost,
      this.createdAt,
      this.updatedAt
    )
  }

  // Convert domain → entity
  static fromDomain(recipe: Recipe): RecipeEntity {
    const entity = new RecipeEntity()
    entity.id = recipe.id
    entity.title = recipe.title
    entity.makingTime = recipe.makingTime
    entity.serves = recipe.serves
    entity.ingredients = recipe.ingredients
    entity.cost = recipe.cost
    entity.createdAt = recipe.createdAt
    entity.updatedAt = recipe.updatedAt
    return entity
  }
}