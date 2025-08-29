import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { RecipeID, Recipe } from './domain/recipe.entity';
import { error, ok } from '../shared/result';
import { BriefRecipeDto } from './dto/recipe.dto';
import { RecipeResponseDto } from './dto/response.dto';

describe('RecipesController', () => {
  let controller: RecipesController;
  let service: RecipesService

  beforeEach(async () => {
    service = {
      findOne: jest.fn(),
    } as unknown as RecipesService;

    controller = new RecipesController(service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get by RecipeID and return Recipe', async () => {
    // Mock service behavior
    const recipe = new Recipe(RecipeID.of(1), "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, new Date(), new Date())
    service.findOne = jest.fn().mockResolvedValue(ok(recipe));
    const result = await controller.findOne('1');
    expect(result).toMatchObject(new RecipeResponseDto('Recipe details by id', [
      new BriefRecipeDto(recipe),
    ]));
  });

  it('should get by RecipeID and return error', async () => {
    const errorMessage = "Recipe with id 1 not found"
    // Mock service behavior
    service.findOne = jest.fn().mockResolvedValue(error({ type: 'RecipeNotFoundError', error: new Error(errorMessage) }));

    await expect(controller.findOne('1')).rejects.toThrow(errorMessage);
  });
});
