import { Repository } from 'typeorm';
import { TypeOrmRecipeRepository } from "./recipe.repository";
import { RecipeEntity } from './entities/recipe.entity';
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from '@nestjs/typeorm';
import { Recipe, RecipeID } from '../domain/recipe.entity';
import { ok, error } from '../../shared/result';

describe('TypeOrmRecipeRepository-GetByID', () => {
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

  it('should find recipe by id', async () => {
    const id = 1
    const now = new Date();
    const expected = new Recipe(RecipeID.of(id), "Chicken Curry", "45 min", "4 people", "onion, chicken, seasoning", 1000, now, now);
    const dbResult = RecipeEntity.fromDomain(expected);

    (ormRepo.findOneBy as jest.Mock).mockResolvedValue(dbResult);

    const result = await repo.getByID(RecipeID.of(id));

    expect(ormRepo.findOneBy).toHaveBeenCalledWith({ id });
    expect(result).toEqual(ok(expected));
  });

  it('should return null if recipe not found', async () => {
    const id = 1
    const expected = null;
    (ormRepo.findOneBy as jest.Mock).mockResolvedValue(null);

    const result = await repo.getByID(RecipeID.of(id));

    expect(ormRepo.findOneBy).toHaveBeenCalledWith({ id });
    expect(result).toEqual(error({ type: 'RecipeNotFoundError', error: new Error('No recipe found') }));
  });
});
