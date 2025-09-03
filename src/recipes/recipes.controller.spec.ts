import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { RecipeID, Recipe, RecipeUpdateInput } from './domain/recipe.entity';
import { error, ok } from '../shared/result';
import { BriefRecipeDto, RecipeDto, CreateRecipeDto, UpdateRecipeDto } from './dto/recipe.dto';
import { MessageResponseDTO, RecipeResponseDto, RecipesResponseDto } from './dto/response.dto';
import { DataSource } from 'typeorm';
import { RecipeEntity } from './repository/entities/recipe.entity';
import { TypeOrmRecipeRepository } from './repository/recipe.repository';
import { validate } from 'class-validator';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { plainToInstance } from 'class-transformer';

describe('Controller - Recipe Unit Test', () => {
  let controller: RecipesController;
  let service: RecipesService

  beforeEach(async () => {
    service = {
      findOne: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
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
    const result = await controller.findOne(1);
    expect(result).toMatchObject(new RecipeResponseDto('Recipe details by id', [
      new BriefRecipeDto(recipe),
    ]));
  });

  it('findOne - should return error on not found', async () => {
    const errorMessage = "Recipe with id 1 not found"
    // Mock service behavior
    service.findOne = jest.fn().mockResolvedValue(error({ type: 'RecipeNotFoundError', error: new Error(errorMessage) }));

    await expect(controller.findOne(1)).rejects.toThrow(errorMessage);
  });

  it('inputDTO - should return error due to invalid input', async () => {
    /** 
     * - Making time should be error. It should be 45 min, 1 hour, 45m
     * - Serves should be error. It should be 4 people, 4 servings
     * - Cost should be error. It should be number
     * - Ingredients should be error. It should be string
     */
    const payload = new CreateRecipeDto("Chicken Curry", "45", "4 group", "", 0)
    const validationError = await validate(payload);
    expect(validationError.length).toBe(4);
  });

  it('create - should return Recipe', async () => {
    // Mock service behavior
    const input = {
      title: "Chicken Curry",
      making_time: "45 min",
      serves: "4 people",
      ingredients: "onion, chicken, seasoning",
      cost: 1000
    }
    
    const recipe = new Recipe(RecipeID.of(1), "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, new Date(), new Date())
    service.create = jest.fn().mockResolvedValue(ok(recipe));

    const result = await controller.create(input);
    expect(result).toMatchObject(new RecipeResponseDto('Recipe successfully created', [
      new RecipeDto(recipe),
    ]));

  });

  it('create - should return error from service', async () => {
    const input = {
      title: "Chicken Curry",
      making_time: "45 min",
      serves: "4 people",
      ingredients: "onion, chicken, seasoning",
      cost: 1000
    }

    const errorMessage = "Failed to save recipe"
    // Mock service behavior
    service.create = jest.fn().mockResolvedValue(error({ type: 'Failed to save', error: new Error(errorMessage) }));

    await expect(controller.create(input)).rejects.toThrow(errorMessage);
  });

  it('delete - should delete Recipe', async () => {
    service.delete = jest.fn().mockResolvedValue(ok(true));
    const result = await controller.delete(1);
    expect(result).toMatchObject(new MessageResponseDTO('Recipe successfully deleted'));
  })

  it('delete - should return error from service', async () => {
    const errorMessage = "Failed to delete recipe"
    // Mock service behavior
    service.delete = jest.fn().mockResolvedValue(error({ type: 'Failed to delete', error: new Error(errorMessage) }));

    await expect(controller.delete(1)).rejects.toThrow(errorMessage);
  });

  it('list - should return Recipe', async () => {
    // Mock service behavior
    const recipe = new Recipe(RecipeID.of(1), "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, new Date(), new Date())
    service.list = jest.fn().mockResolvedValue(ok([recipe]));
    const result = await controller.list();
    expect(result).toMatchObject(new RecipesResponseDto([
      new BriefRecipeDto(recipe),
    ]));
  });

  it('list - should return error from service', async () => {
    const errorMessage = "Failed to list recipes"
    // Mock service behavior
    service.list = jest.fn().mockResolvedValue(error({ type: 'Failed to list', error: new Error(errorMessage) }));

    await expect(controller.list()).rejects.toThrow(errorMessage);
  });

  it('update - should update Recipe', async () => {
    const input = {
      title: "Chicken Curry - Large size",
      making_time: "45 min",
      serves: "4 people",
      ingredients: "onion, chicken, seasoning",
      cost: 1000
    }
    
    const recipe = new Recipe(RecipeID.of(1), "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, new Date(), new Date())
    service.update = jest.fn().mockResolvedValue(ok(recipe));
    const result = await controller.update(1, input);

    const dto = plainToInstance(UpdateRecipeDto, input)
    const updateInput = new RecipeUpdateInput();
    Object.assign(updateInput, dto);
    
    expect(service.update).toHaveBeenCalledWith(RecipeID.of(1), updateInput);
    expect(result).toMatchObject(new RecipeResponseDto('Recipe successfully updated!', [
      new RecipeDto(recipe),
    ]));
  })

  it('update - should return error from service', async () => {
    const payload = new UpdateRecipeDto();
    payload.title = "Chicken Curry - Large size"
    const errorMessage = "Failed to update recipe"
    // Mock service behavior
    service.update = jest.fn().mockResolvedValue(error({ type: 'Failed to update', error: new Error(errorMessage) }));
  })
});

type testComponent = {
  dataSource: DataSource;
  controller: RecipesController;
}

async function createTestComponent(): Promise<testComponent> {

  const module = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        entities: [RecipeEntity],
        synchronize: true,
      }),
      TypeOrmModule.forFeature([RecipeEntity]),
      CacheModule.register(),
    ],
    providers: [TypeOrmRecipeRepository],
  }).compile();

  const repository = module.get(TypeOrmRecipeRepository);

  const service = new RecipesService(repository);

  const controller = new RecipesController(service);

  const dataSource = module.get(DataSource);

  return { dataSource, controller };
}

describe('Integration Testing - findOne', () => {
  let dataSource: DataSource;
  let controller: RecipesController;

  beforeEach(async () => {
    ({ dataSource, controller } = await createTestComponent());
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

    const result = await controller.findOne(1);
    expect(result).toMatchObject(new RecipeResponseDto('Recipe details by id', [
      new BriefRecipeDto(recipe),
    ]));
  });

  it('findOne - should return error on not found', async () => {
    await expect(controller.findOne(2)).rejects.toThrow('No recipe found');
    await dataSource.destroy();
  });
});

describe('Integration Testing - create', () => {
  let dataSource: DataSource;
  let controller: RecipesController;

  beforeEach(async () => {
    ({ dataSource, controller } = await createTestComponent());
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
    const input = {
      title: "Chicken Curry",
      making_time: "45 min",
      serves: "4 people",
      ingredients: "onion, chicken, seasoning",
      cost: 1000
    }

    const result = await controller.create(input) as RecipeResponseDto;
    const recipe = result.recipe[0];

    expect(recipe.title).toBe(input.title);
    expect(recipe.makingTime).toBe(input.making_time);
    expect(recipe.serves).toBe(input.serves);
    expect(recipe.ingredients).toBe(input.ingredients);
    expect(recipe.cost).toBe(input.cost);
  });
});

describe('Integration Testing - delete', () => {
  let dataSource: DataSource;
  let controller: RecipesController;

  beforeEach(async () => {
    ({ dataSource, controller } = await createTestComponent());
  });

  afterEach(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delete - should be succeeded', async () => {
    const id = RecipeID.of(1);
    const recipe = new Recipe(id, "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, new Date(), new Date());

    await dataSource.getRepository(RecipeEntity).save(RecipeEntity.fromDomain(recipe));

    const result = await controller.delete(1);
    expect(result).toMatchObject(new MessageResponseDTO('Recipe successfully deleted'));
  });

  it('delete - should return error on not found', async () => {
    await expect(controller.findOne(2)).rejects.toThrow('No recipe found');
    await dataSource.destroy();
  });
});

describe('Integration Testing - list', () => {
  let dataSource: DataSource;
  let controller: RecipesController;

  beforeEach(async () => {
    ({ dataSource, controller } = await createTestComponent());
  });

  afterEach(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('list - should be succeeded', async () => {
    const id = RecipeID.of(1);
    const recipe = new Recipe(id, "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, new Date(), new Date());

    await dataSource.getRepository(RecipeEntity).save(RecipeEntity.fromDomain(recipe));

    const result = await controller.list();
    expect(result).toMatchObject(new RecipesResponseDto([
      new BriefRecipeDto(recipe),
    ]));
  });

  it('list - should return error on not found', async () => {
    await expect(controller.findOne(2)).rejects.toThrow('No recipe found');
    await dataSource.destroy();
  });
});

describe('Integration Testing - update', () => {
  let dataSource: DataSource;
  let controller: RecipesController;

  beforeEach(async () => {
    ({ dataSource, controller } = await createTestComponent());
  });

  afterEach(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('update - should be succeeded', async () => {
    const id = RecipeID.of(1);
    const recipe = new Recipe(id, "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, new Date(), new Date());
    await dataSource.getRepository(RecipeEntity).save(RecipeEntity.fromDomain(recipe));
    const input = {
      title: "Chicken Curry",
      making_time: "45 min",
      serves: "4 people",
      ingredients: "onion, chicken, seasoning",
      cost: 1000
    }

    const result = await controller.update(1, input) as RecipeResponseDto;
    const resultRecipe = result.recipe[0];
    expect(resultRecipe.title).toBe(input.title);
    expect(resultRecipe.makingTime).toBe(recipe.makingTime);
    expect(resultRecipe.serves).toBe(recipe.serves);
    expect(resultRecipe.ingredients).toBe(recipe.ingredients);
    expect(resultRecipe.cost).toBe(recipe.cost);
  });

  it('update - should return error on not found', async () => {
    await expect(controller.findOne(2)).rejects.toThrow('No recipe found');
    await dataSource.destroy();
  });
});