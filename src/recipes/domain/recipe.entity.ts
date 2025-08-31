// Errors definition
export type RecipeError =
  | { type: 'RecipeNotFoundError'; error: Error; }
  | { type: 'RecipeSaveError'; error: Error; }
  | { type: 'RecipeDeleteError'; error: Error; }
  | { type: 'RecipeListError'; error: Error; }
  | { type: 'RecipeUpdateError'; error: Error; }
  
// RecipeID definition
export type RecipeID = number & { readonly brand: unique symbol };

export const RecipeID = {
  of: (id: number): RecipeID => id as RecipeID,
  value: (id: RecipeID): number => id as number,
}

export class Recipe {
  /**
   * Construct a new Recipe with the given parameters
   *
   * @param id the ID of the recipe
   * @param title the title of the recipe
   * @param makingTime the time it takes to make the recipe
   * @param serves how many people the recipe serves
   * @param ingredients the ingredients used in the recipe
   * @param cost the cost of the recipe
   * @param createdAt when the recipe was created
   * @param updatedAt when the recipe was last updated
   */
  constructor(
    public readonly id: RecipeID,
    public title: string,
    public makingTime: string,
    public serves: string,
    public ingredients: string,
    public cost: number,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}

export class RecipeCreateInput {
  /**
   * Construct a new RecipeInput with the given parameters
   *
   * @param title the title of the recipe
   * @param makingTime the time it takes to make the recipe
   * @param serves how many people the recipe serves
   * @param ingredients the ingredients used in the recipe
   * @param cost the cost of the recipe
   */
  constructor(
    public title: string,
    public makingTime: string,
    public serves: string,
    public ingredients: string,
    public cost: number,
  ) {}
}

export class RecipeUpdateInput {
  /**
   * Construct a new RecipeUpdateInput with the given parameters
   *
   * @param title the new title of the recipe
   * @param makingTime the new time it takes to make the recipe
   * @param serves the new number of people the recipe serves
   * @param ingredients the new ingredients used in the recipe
   * @param cost the new cost of the recipe
   */
  constructor(
    public title?: string,
    public makingTime?: string,
    public serves?: string,
    public ingredients?: string,
    public cost?: number,
  ) {}
}