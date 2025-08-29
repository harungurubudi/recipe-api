import { Controller, Get, Param, NotFoundException, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipeID } from './domain/recipe.entity';
import { RecipeResponseDto } from './dto/response.dto';
import { BriefRecipeDto } from './dto/recipe.dto';

@Controller('recipes')
@UseInterceptors(ClassSerializerInterceptor)
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get(':id')
  /**
   * Finds a single recipe by its ID
   *
   * @param id the ID of the recipe to be found
   * @returns the recipe with the given ID, or a `RecipeError` if no such recipe exists
   */
  async findOne(@Param('id') id: string): Promise<RecipeResponseDto> {
    const result = await this.recipesService.findOne(RecipeID.of(+id))

    if (result.ok) {
      return new RecipeResponseDto('Recipe details by id', [
        new BriefRecipeDto(result.value),
      ])
    }

    throw new NotFoundException(result.error.error.message)
  } 
}
