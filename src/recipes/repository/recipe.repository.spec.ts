import { Repository } from 'typeorm';
import { TypeOrmRecipeRepository } from "./recipe.repository";
import { RecipeEntity } from './entities/recipe.entity';
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from '@nestjs/typeorm';
import { Recipe, RecipeID, RecipeCreateInput, RecipeUpdateInput } from '../domain/recipe.entity';
import { ok, error } from '../../shared/result';

describe('Repository - findOneBy', () => {
  let repo: TypeOrmRecipeRepository;
  let ormRepo: jest.Mocked<Repository<RecipeEntity>>;
  let mockCache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(async () => {
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmRecipeRepository,
        {
          provide: getRepositoryToken(RecipeEntity),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: 'CACHE_MANAGER',
          useValue: mockCache,
        }
      ],
    }).compile();

    repo = module.get(TypeOrmRecipeRepository);
    ormRepo = module.get(getRepositoryToken(RecipeEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getByID - should return Recipe from cache', async () => {
    const id = 1;
    const now = new Date();
    const expected = new Recipe(RecipeID.of(id), "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, now, now);

    (mockCache.get).mockReturnValue(expected);

    const result = await repo.getByID(RecipeID.of(id));

    expect(mockCache.get).toHaveBeenCalledWith(`recipe:${id}`);
    expect(ormRepo.findOneBy).toHaveBeenCalledTimes(0);
    expect(result).toEqual(ok(expected));
  });

  it('getByID - should return Recipe from database', async () => {
    const id = 1;
    const now = new Date();
    const expected = new Recipe(RecipeID.of(id), "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, now, now);
    const dbResult = RecipeEntity.fromDomain(expected);

    (mockCache.get).mockReturnValue(null);
    (ormRepo.findOneBy as jest.Mock).mockResolvedValue(dbResult);

    const result = await repo.getByID(RecipeID.of(id));

    expect(mockCache.set).toHaveBeenCalledWith(`recipe:${id}`, dbResult, 60_000);
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
    
    (mockCache.get).mockReturnValue(null);
    (ormRepo.findOneBy as jest.Mock).mockRejectedValue(new Error('any error'));

    const result = await repo.getByID(RecipeID.of(id));

    expect(ormRepo.findOneBy).toHaveBeenCalledWith({ id: id });
    expect(result).toEqual(error({ type: 'RecipeNotFoundError', error: new Error('Failed to get recipe') }));
  });
});

describe('Repository - create', () => {
  let repo: TypeOrmRecipeRepository;
  let ormRepo: jest.Mocked<Repository<RecipeEntity>>;
  let mockCache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(async () => {
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmRecipeRepository,
        {
          provide: getRepositoryToken(RecipeEntity),
          useValue: {
            save: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
        {
          provide: 'CACHE_MANAGER',
          useValue: mockCache,
        }
      ],
    }).compile();

    repo = module.get(TypeOrmRecipeRepository);
    ormRepo = module.get(getRepositoryToken(RecipeEntity));
  });

  it('create - should return newly created Recipe', async () => {
    const id = 1
    const payload = new RecipeCreateInput("Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000);
    const dbInput = new RecipeEntity();
    Object.assign(dbInput, payload);

    const expected = new Recipe(RecipeID.of(id), "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, new Date(), new Date());
    const entity = new RecipeEntity();
    Object.assign(entity, expected);

    (ormRepo.save as jest.Mock).mockResolvedValue(entity);
    (ormRepo.findOneBy as jest.Mock).mockResolvedValue(entity);

    const result = await repo.create(payload);

    expect(ormRepo.save).toHaveBeenCalledWith(dbInput);
    expect(ormRepo.findOneBy).toHaveBeenCalledWith({ id });
    expect(mockCache.set).toHaveBeenCalledWith(`recipe:${id}`, entity, 60_000);
    expect(result).toEqual(ok(expected));
  });

  it('create - should return error', async () => {
    const payload = new RecipeCreateInput("Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000);
    const dbInput = new RecipeEntity();
    Object.assign(dbInput, payload);

    (ormRepo.save as jest.Mock).mockResolvedValue(null);

    const result = await repo.create(payload);

    expect(ormRepo.save).toHaveBeenCalledWith(dbInput);
    expect(result).toEqual(error({ type: 'RecipeSaveError', error: new Error('Failed to create recipe') }));
  });

  it('create - should thrown error', async () => {
    const payload = new RecipeCreateInput("Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000);
    const dbInput = new RecipeEntity();
    Object.assign(dbInput, payload);

    (ormRepo.save as jest.Mock).mockRejectedValue(new Error('any error'));

    const result = await repo.create(payload);

    expect(ormRepo.save).toHaveBeenCalledWith(dbInput);
    expect(result).toEqual(error({ type: 'RecipeSaveError', error: new Error('Failed to create recipe') }));
  });
});

describe('Repository - delete', () => {
  let repo: TypeOrmRecipeRepository;
  let ormRepo: jest.Mocked<Repository<RecipeEntity>>;
  let mockCache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(async () => {
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmRecipeRepository,
        {
          provide: getRepositoryToken(RecipeEntity),
          useValue: {
            findOneBy: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: 'CACHE_MANAGER',
          useValue: mockCache,
        }
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
    (mockCache.del).mockReturnValue(true);

    const result = await repo.delete(RecipeID.of(id));

    expect(ormRepo.findOneBy).toHaveBeenCalledWith({ id });
    expect(mockCache.del).toHaveBeenCalledWith(`recipe:${id}`);
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

describe('Repository - list', () => {
  let repo: TypeOrmRecipeRepository;
  let ormRepo: jest.Mocked<Repository<RecipeEntity>>;
  let mockCache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(async () => {
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmRecipeRepository,
        {
          provide: getRepositoryToken(RecipeEntity),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: 'CACHE_MANAGER',
          useValue: mockCache,
        }
      ],
    }).compile();

    repo = module.get(TypeOrmRecipeRepository);
    ormRepo = module.get(getRepositoryToken(RecipeEntity));
  });

  it('list - should return list of recipe', async () => {
    const recipes = [
      new Recipe(RecipeID.of(1), "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, new Date(), new Date()),
      new Recipe(RecipeID.of(2), "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, new Date(), new Date()),
    ];
    const entities = recipes.map(r => RecipeEntity.fromDomain(r));
    (ormRepo.find as jest.Mock).mockResolvedValue(entities);
    const result = await repo.list();
    expect(result).toEqual(ok(recipes));
  })

  it('list - shpould thrown error', async () => {
    (ormRepo.find as jest.Mock).mockRejectedValue(new Error('any error'));
    const result = await repo.list();
    expect(result).toEqual(error({ type: 'RecipeListError', error: new Error('Failed to list recipes') }));
  })
});


describe('Repository - update', () => {
  let repo: TypeOrmRecipeRepository;
  let ormRepo: jest.Mocked<Repository<RecipeEntity>>;
  let mockCache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(async () => {
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmRecipeRepository,
        {
          provide: getRepositoryToken(RecipeEntity),
          useValue: {
            update: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
        {
          provide: 'CACHE_MANAGER',
          useValue: mockCache,
        }
      ],
    }).compile();

    repo = module.get(TypeOrmRecipeRepository);
    ormRepo = module.get(getRepositoryToken(RecipeEntity));
  });

  it('update - should return Not found', async () => {
    const id = 1;
    const input = new RecipeUpdateInput("Chicken Curry - Large size", undefined, undefined, undefined, undefined);
    (ormRepo.update as jest.Mock).mockResolvedValue({ affected: 0 });
    const result = await repo.update(RecipeID.of(id), input);
    expect(ormRepo.update).toHaveBeenCalledWith({ id }, input);
    expect(result).toEqual(error({ type: 'RecipeUpdateError', error: new Error('No recipe found') }));
  });

  it('update - should return newly created Recipe', async () => {
    // Define update input
    const id = 1
    const input = new RecipeUpdateInput("Chicken Curry - Large size", undefined, undefined, undefined, undefined);
    const entity = RecipeEntity.fromDomain(new Recipe(RecipeID.of(id), "Chicken Curry - Large size", "45 min", "4 people", "onion, chicken, seasoning", 1000, new Date(), new Date()));

    (ormRepo.update as jest.Mock).mockResolvedValue({ affected: 1 });
    (ormRepo.findOneBy as jest.Mock).mockResolvedValue(entity);
    (mockCache.del).mockResolvedValue(true);

    const result = await repo.update(RecipeID.of(id), input);
    expect(ormRepo.update).toHaveBeenCalledWith({ id }, input);
    expect(mockCache.del).toHaveBeenCalledWith(`recipe:${id}`);
    expect(result).toEqual(ok(entity.toDomain()));
  });

  it('update - should thrown error', async () => {
    const id = 1;
    const input = new RecipeUpdateInput("Chicken Curry - Large size", undefined, undefined, undefined, undefined);
    (ormRepo.update as jest.Mock).mockRejectedValue(new Error('any error'));
    const result = await repo.update(RecipeID.of(id), input);
    expect(result).toEqual(error({ type: 'RecipeUpdateError', error: new Error('Failed to update recipe') }));
  });
});