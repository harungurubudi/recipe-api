import { Exclude, Expose, Transform } from 'class-transformer';
import { Recipe, RecipeID, RecipeInput } from '../domain/recipe.entity';
import { IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for brief recipe information
 * It is exluding : createdAt and updatedAt
 */
export class RecipeDto {
  @Transform(({ value }) => RecipeID.value(value))
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose({ name: 'making_time' })
  makingTime: string;

  @Expose()
  serves: string;

  @Expose()
  ingredients: string;

  @Expose()
  @Transform(({ value }) => value.toString()) // ensure cost becomes string
  cost: string;

  constructor(recipe: Recipe) {
    Object.assign(this, recipe);  
  }
}

export class BriefRecipeDto extends RecipeDto {
  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
  
  constructor(recipe: Recipe) {
    super(recipe);
    Object.assign(this, recipe);  
  }
}


/**
 * DTO for creating a new recipe and updating an existing recipe
 */
export class RecipeInputDto {
  @ApiProperty({ example: 'Spaghetti' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;
  
  @ApiProperty({ example: '30 min' })
  @IsString()
  @IsNotEmpty()
  // e.g., "30 min" or "1h 20m"
  @Matches(/^\d+\s?(min|hour|h|m)$/i, { message: 'makingTime must be like "30 min" or "1h"' })
  @MaxLength(100)
  makingTime: string;
  
  @ApiProperty({ example: '2 people' })
  @IsString()
  @IsNotEmpty()
  // e.g., "2 people", "4 servings"
  @Matches(/^\d+\s?(people|servings?)$/i, { message: 'serves must be like "2 people" or "4 servings"' })
  @MaxLength(100)
  serves: string;
  
  @ApiProperty({ example: 'onion, chicken, seasoning' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  ingredients: string;
  
  @ApiProperty({ example: '100' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  cost: number;

  constructor(title: string, makingTime: string, serves: string, ingredients: string, cost: number) {
    this.title = title;
    this.makingTime = makingTime;
    this.serves = serves;
    this.ingredients = ingredients;
    this.cost = cost;
  }
}

export class RecipeDtoMapper {
  static toDomain(dto: RecipeInputDto): RecipeInput {
    return new RecipeInput(dto.title, dto.makingTime, dto.serves, dto.ingredients, dto.cost);
  }

  static toDto(recipe: Recipe): BriefRecipeDto {
    return new BriefRecipeDto(recipe);
  }
}
