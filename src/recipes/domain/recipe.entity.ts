export type RecipeID = number & { readonly brand: unique symbol };

/**
 * Type guard function to narrow a `number` to a `RecipeID`
 *
 * @param id the number to narrow
 * @returns the narrowed `RecipeID`
 */
function RecipeID(id: number): RecipeID {
  return id as RecipeID;
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
