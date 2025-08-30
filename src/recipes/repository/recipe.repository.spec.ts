import { Repository } from 'typeorm';
import { TypeOrmRecipeRepository } from "./recipe.repository";
import { RecipeEntity } from './entities/recipe.entity';
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from '@nestjs/typeorm';
import { Recipe, RecipeID, RecipeInput } from '../domain/recipe.entity';
import { ok, error } from '../../shared/result';

describe('Repository - findOneBy', () => {
  let repo: TypeOrmRecipeRepository;
  let ormRepo: jest.Mocked<Repository<RecipeEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmRecipeRepository,
        {
          provide: getRepositoryToken(RecipeEntity),
          useValue: {
            findOneBy: jest.fn(), // directly mock the method you need
          },
        },
      ],
    }).compile();

    repo = module.get(TypeOrmRecipeRepository);
    ormRepo = module.get(getRepositoryToken(RecipeEntity));
  });

  it('getByID - should return Recipe', async () => {
    const id = 1;
    const now = new Date();
    const expected = new Recipe(RecipeID.of(id), "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, now, now);
    const dbResult = RecipeEntity.fromDomain(expected);

    (ormRepo.findOneBy as jest.Mock).mockResolvedValue(dbResult);

    const result = await repo.getByID(RecipeID.of(id));

    expect(ormRepo.findOneBy).toHaveBeenCalledWith({ id });
    expect(result).toEqual(ok(expected));
  });

  it('getByID - should return error on not found', async () => {
    const id = 1;
    (ormRepo.findOneBy as jest.Mock).mockResolvedValue(null);

    const result = await repo.getByID(RecipeID.of(id));

    expect(ormRepo.findOneBy).toHaveBeenCalledWith({ id: id });
    expect(result).toEqual(error({ type: 'RecipeNotFoundError', error: new Error('No recipe found') }));
  });

  it('getByID - should thrown error', async () => {
    const id = 1;
    (ormRepo.findOneBy as jest.Mock).mockRejectedValue(new Error('any error'));

    const result = await repo.getByID(RecipeID.of(id));

    expect(ormRepo.findOneBy).toHaveBeenCalledWith({ id: id });
    expect(result).toEqual(error({ type: 'RecipeNotFoundError', error: new Error('Failed to get recipe') }));
  });
});

describe('Repository - create', () => {
  let repo: TypeOrmRecipeRepository;
  let ormRepo: jest.Mocked<Repository<RecipeEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmRecipeRepository,
        {
          provide: getRepositoryToken(RecipeEntity),
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    repo = module.get(TypeOrmRecipeRepository);
    ormRepo = module.get(getRepositoryToken(RecipeEntity));
  });

  it('create - should return newly created Recipe', async () => {
    const id = 1
    const payload = new RecipeInput("Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000);
    const dbInput = RecipeEntity.fromInput(payload);

    const expected = new Recipe(RecipeID.of(id), "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, new Date(), new Date());
    const entity = RecipeEntity.fromDomain(expected);

    (ormRepo.save as jest.Mock).mockResolvedValue(entity);

    const result = await repo.create(payload);

    expect(ormRepo.save).toHaveBeenCalledWith(dbInput);
    expect(result).toEqual(ok(expected));
  });

  it('create - should return error', async () => {
    const payload = new RecipeInput("Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000);
    const dbInput = RecipeEntity.fromInput(payload);

    (ormRepo.save as jest.Mock).mockResolvedValue(null);

    const result = await repo.create(payload);

    expect(ormRepo.save).toHaveBeenCalledWith(dbInput);
    expect(result).toEqual(error({ type: 'RecipeSaveError', error: new Error('Failed to create recipe') }));
  });

  it('create - should thrown error', async () => {
    const payload = new RecipeInput("Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000);
    const dbInput = RecipeEntity.fromInput(payload);

    (ormRepo.save as jest.Mock).mockRejectedValue(new Error('any error'));

    const result = await repo.create(payload);

    expect(ormRepo.save).toHaveBeenCalledWith(dbInput);
    expect(result).toEqual(error({ type: 'RecipeSaveError', error: new Error('Failed to create recipe') }));
  });
});


describe('Repository - delete', () => {
  let repo: TypeOrmRecipeRepository;
  let ormRepo: jest.Mocked<Repository<RecipeEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmRecipeRepository,
        {
          provide: getRepositoryToken(RecipeEntity),
          useValue: {
            findOneBy: jest.fn(), // directly mock the method you need
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    repo = module.get(TypeOrmRecipeRepository);
    ormRepo = module.get(getRepositoryToken(RecipeEntity));
  });

  it('getByID - should return Ok', async () => {
    const id = 1
    const now = new Date();
    const dbResult = RecipeEntity.fromDomain(new Recipe(RecipeID.of(id), "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, now, now));

    (ormRepo.findOneBy as jest.Mock).mockResolvedValue(dbResult);
    (ormRepo.delete as jest.Mock).mockResolvedValue({ affected: 1 });

    const result = await repo.delete(RecipeID.of(id));

    expect(ormRepo.findOneBy).toHaveBeenCalledWith({ id });
    expect(result).toEqual(ok(true));
  });

  it('getByID - should return Not found', async () => {
    (ormRepo.findOneBy as jest.Mock).mockResolvedValue(null);
    const result = await repo.delete(RecipeID.of(1));
    expect(ormRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual(error({ type: 'RecipeDeleteError', error: new Error('No recipe found') }));
  });

  it('getByID - should thrown error', async () => {
    (ormRepo.findOneBy as jest.Mock).mockRejectedValue(new Error('any error'));
    const result = await repo.delete(RecipeID.of(1));
    expect(ormRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual(error({ type: 'RecipeDeleteError', error: new Error('Failed to delete recipe') }));
  });
});