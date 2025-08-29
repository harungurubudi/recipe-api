import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { RecipeID, Recipe } from './domain/recipe.entity';
import { error, ok } from '../shared/result';
import { BriefRecipeDto } from './dto/recipe.dto';
import { RecipeResponseDto } from './dto/response.dto';
import { DataSource } from 'typeorm';
import { RecipeEntity } from './repository/entities/recipe.entity';
import { TypeOrmRecipeRepository } from './repository/recipe.repository';

describe('Controller - Recipe Unit Test', () => {
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
});

describe('Controller - Integration Testing', () => {
  let dataSource: DataSource;
  let controller: RecipesController;

  beforeEach(async () => {
    // Create a test database
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true, // auto create schema
      entities: [RecipeEntity],
    });
    await dataSource.initialize();

    const repository = new TypeOrmRecipeRepository(dataSource.getRepository(RecipeEntity));
    const service = new RecipesService(repository);

    controller = new RecipesController(service);
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

    await dataSource.destroy();
  });

  it('findOne - should return error on not found', async () => {
    await expect( controller.findOne('2')).rejects.toThrow('No recipe found');
    await dataSource.destroy();
  });
});