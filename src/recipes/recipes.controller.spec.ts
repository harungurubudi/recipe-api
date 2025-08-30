import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { RecipeID, Recipe } from './domain/recipe.entity';
import { error, ok } from '../shared/result';
import { BriefRecipeDto, RecipeDto, RecipeInputDto } from './dto/recipe.dto';
import { RecipeResponseDto } from './dto/response.dto';
import { DataSource } from 'typeorm';
import { RecipeEntity } from './repository/entities/recipe.entity';
import { TypeOrmRecipeRepository } from './repository/recipe.repository';
import { validate } from 'class-validator';

describe('Controller - Recipe Unit Test', () => {
  let controller: RecipesController;
  let service: RecipesService

  beforeEach(async () => {
    service = {
      findOne: jest.fn(),
      create: jest.fn(),
    } as unknown as RecipesService;

    controller = new RecipesController(service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findOne - should return Recipe', async () => {
    // Mock service behavior
    const recipe = new Recipe(RecipeID.of(1), "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, new Date(), new Date())
    service.findOne = jest.fn().mockResolvedValue(ok(recipe));
    const result = await controller.findOne('1');
    expect(result).toMatchObject(new RecipeResponseDto('Recipe details by id', [
      new BriefRecipeDto(recipe),
    ]));
  });

  it('findOne - should return error on not found', async () => {
    const errorMessage = "Recipe with id 1 not found"
    // Mock service behavior
    service.findOne = jest.fn().mockResolvedValue(error({ type: 'RecipeNotFoundError', error: new Error(errorMessage) }));

    await expect(controller.findOne('1')).rejects.toThrow(errorMessage);
  });

  it('inputDTO - should return error due to invalid input', async () => {
    /** 
     * - Making time should be error. It should be 45 min, 1 hour, 45m
     * - Serves should be error. It should be 4 people, 4 servings
     * - Cost should be error. It should be number
     * - Ingredients should be error. It should be string
     */ 
    const payload = new RecipeInputDto("Chicken Curry", "45", "4 group", "", 0)
    const validationError = await validate(payload);
    expect(validationError.length).toBe(4);
  });

  it('create - should return Recipe', async () => {
    // Mock service behavior
    const payload = new RecipeInputDto("Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000)
    const validationError = await validate(payload);
    expect(validationError.length).toBe(0);

    const recipe = new Recipe(RecipeID.of(1), "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, new Date(), new Date())
    service.create = jest.fn().mockResolvedValue(ok(recipe));
    
    const result = await controller.create(payload);
    expect(result).toMatchObject(new RecipeResponseDto('Recipe successfully created', [
      new RecipeDto(recipe),
    ]));
  });

  it('create - should return error from service', async () => {
    const payload = new RecipeInputDto("Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000)
    const validationError = await validate(payload);
    expect(validationError.length).toBe(0);
    const errorMessage = "Failed to save recipe"
    // Mock service behavior
    service.create = jest.fn().mockResolvedValue(error({ type: 'Failed to save', error: new Error(errorMessage) }));

    await expect(controller.create(payload)).rejects.toThrow(errorMessage);
  });
});

type testComponent = {
  dataSource: DataSource;
  controller: RecipesController;
}

async function createTestComponent(): Promise<testComponent> {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    synchronize: true, // auto create schema
    entities: [RecipeEntity],
  });

  await dataSource.initialize();

  const repository = new TypeOrmRecipeRepository(dataSource.getRepository(RecipeEntity));
  const service = new RecipesService(repository);

  const controller = new RecipesController(service);

  return { dataSource, controller };
}

describe('Integration Testing - findOne', () => {
  let dataSource: DataSource;
  let controller: RecipesController;

  beforeEach(async () => {
    ({ dataSource, controller } = await  createTestComponent());
  });

  afterEach(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findOne - should return Recipe', async () => {
    const id = RecipeID.of(1);
    const recipe = new Recipe(id, "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, new Date(), new Date());
    
    await dataSource.getRepository(RecipeEntity).save(RecipeEntity.fromDomain(recipe));
    
    const result = await controller.findOne('1');
    expect(result).toMatchObject(new RecipeResponseDto('Recipe details by id', [
      new BriefRecipeDto(recipe),
    ]));
  });

  it('findOne - should return error on not found', async () => {
    await expect( controller.findOne('2')).rejects.toThrow('No recipe found');
    await dataSource.destroy();
  });
});

describe('Integration Testing - create', () => {
  let dataSource: DataSource;
  let controller: RecipesController;

  beforeEach(async () => {
    ({ dataSource, controller } = await  createTestComponent());
  });

  afterEach(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create - should return Recipe', async () => {
    const payload = new RecipeInputDto("Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000)
     
    const result = await controller.create(payload);
    const recipe = result.recipe[0];

    expect(recipe.title).toBe(payload.title);
    expect(recipe.makingTime).toBe(payload.makingTime);
    expect(recipe.serves).toBe(payload.serves);
    expect(recipe.ingredients).toBe(payload.ingredients);
    expect(recipe.cost).toBe(payload.cost);
  });
});