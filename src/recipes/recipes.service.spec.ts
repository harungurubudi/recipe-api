import { RecipesService } from './recipes.service';
import { RecipeRepository } from './repository/recipe.repository';
import { RecipeID, Recipe, RecipeCreateInput } from './domain/recipe.entity';
import { ok } from '../shared/result';

describe('Service - Recipe Unit Test', () => {
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

  it('findOne - should return Recipe', async () => {
    // Mock repository behavior
    repository.getByID = jest.fn().mockResolvedValue(ok(
      new Recipe(RecipeID.of(1), "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, new Date(), new Date())
    ));

    const id = RecipeID.of(1);
    const result = await service.findOne(id);
    expect(result.ok).toBe(true);
  });

  it('create - should return Recipe', async () => {
    const payload: RecipeCreateInput = new RecipeCreateInput("Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000);
    
    // Mock repository behavior
    repository.create = jest.fn().mockResolvedValue(ok(
      new Recipe(RecipeID.of(1), "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, new Date(), new Date())
    ));

    const result = await service.create(payload);
    expect(result.ok).toBe(true);
  });

  it('delete - should return Recipe', async () => {
    // Mock repository behavior
    repository.delete = jest.fn().mockResolvedValue(ok(true));

    const id = RecipeID.of(1);
    const result = await service.delete(id);
    expect(result.ok).toBe(true);
  });

  it('list - should return Recipe', async () => {
    // Mock repository behavior
    repository.list = jest.fn().mockResolvedValue(ok([
      new Recipe(RecipeID.of(1), "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, new Date(), new Date())
    ]));

    const result = await service.list();
    expect(result.ok).toBe(true);
  });

  it('update - should return Recipe', async () => {
    const payload: RecipeCreateInput = new RecipeCreateInput("Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000);
    
    // Mock repository behavior
    repository.update = jest.fn().mockResolvedValue(ok(
      new Recipe(RecipeID.of(1), "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, new Date(), new Date())
    ));

    const id = RecipeID.of(1);
    const result = await service.update(id, payload);
    expect(result.ok).toBe(true);
  });
});
