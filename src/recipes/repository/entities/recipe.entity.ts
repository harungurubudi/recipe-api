import { Recipe, RecipeID, RecipeInput } from "../../domain/recipe.entity"
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity("recipes")
export class RecipeEntity {
  @PrimaryGeneratedColumn("increment")
  id: number

  @Column({name: "title", type: "varchar", length: 100})
  title: string

  @Column({name: "making_time", type: "varchar", length: 100})
  makingTime: string

  @Column({name: "serves", type: "varchar", length: 100})
  serves: string

  @Column({name: "ingredients", type: "varchar", length: 300})
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

  static fromInput(input: RecipeInput): RecipeEntity {
    const entity = new RecipeEntity()
    entity.title = input.title
    entity.makingTime = input.makingTime
    entity.serves = input.serves
    entity.ingredients = input.ingredients
    entity.cost = input.cost
    return entity
  }
}