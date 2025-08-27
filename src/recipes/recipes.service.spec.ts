import { RecipesService } from './recipes.service';
import { RecipeRepository } from './repository/recipe.repository';
import { RecipeID, Recipe } from './domain/recipe.entity';
import { ok } from '../shared/result';

describe('RecipesService', () => {
  let service: RecipesService;
  let repository: RecipeRepository

  beforeEach(async () => {
    repository = {
      getByID: jest.fn(),
    } as unknown as RecipeRepository;

    service = new RecipesService(repository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get by RecipeID and return Recipe', async () => {
    // Mock repository behavior
    repository.getByID = jest.fn().mockResolvedValue(ok(
      new Recipe(RecipeID.of(1), "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, new Date(), new Date())
    ));

    const id = RecipeID.of(1);
    const result = await service.findOne(id);
    expect(result.ok).toBe(true);
  });
});
