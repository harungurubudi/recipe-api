import { Controller, Get, Param, NotFoundException, UseInterceptors, ClassSerializerInterceptor, Post, Body, Patch, ValidationPipe, UsePipes, Delete } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipeCreateInput, RecipeID, RecipeUpdateInput } from './domain/recipe.entity';
import { MessageResponseDTO, RecipeResponseDto, RecipesResponseDto } from './dto/response.dto';
import { BriefRecipeDto, RecipeDto,  CreateRecipeDto, UpdateRecipeDto } from './dto/recipe.dto';

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

  @Post('')
  @UsePipes(new ValidationPipe({ transform: true }))
  /**
   * Creates a new recipe with the given data
   *
   * @param payload the new recipe's data
   * @returns the newly created recipe, or a `RecipeError` if something goes wrong
   */
  async create(@Body() payload: CreateRecipeDto): Promise<RecipeResponseDto> {
    const input = new RecipeCreateInput(
      payload.title,
      payload.makingTime,
      payload.serves,
      payload.ingredients,
      payload.cost
    );
    const result = await this.recipesService.create(input)

    if (result.ok) {
      return new RecipeResponseDto('Recipe successfully created', [
        new RecipeDto(result.value),
      ])
    }

    throw new NotFoundException(result.error.error.message)
  }

  @Delete(':id')
  /**
   * Deletes a recipe by its ID
   *
   * @param id the ID of the recipe to be deleted
   * @returns an empty response if the recipe was successfully deleted, or a `RecipeError` if something went wrong
   */
  async delete(@Param('id') id: string): Promise<MessageResponseDTO> {
    const result = await this.recipesService.delete(RecipeID.of(+id))

    if (result.ok) {
      return new MessageResponseDTO('Recipe successfully deleted')
    }

    throw new NotFoundException(result.error.error.message)
  }

  @Get('')
  /**
   * Lists all recipes in the database.
   *
   * @returns a list of all recipes in the database, or a `RecipeError` if something goes wrong
   */
  async list(): Promise<RecipesResponseDto> {
    const result = await this.recipesService.list()

    if (result.ok) {
      return new RecipesResponseDto(result.value.map(r => new BriefRecipeDto(r)))
    }

    throw new NotFoundException(result.error.error.message)
  }

  @Patch('/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  /**
   * Updates an existing recipe by ID.
   *
   * @param id the ID of the recipe to be updated
   * @param payload the input data for the updated recipe
   * @returns the updated recipe, or a `RecipeError` if something goes wrong
   */
  async update(@Param('id') id: string, @Body() payload: UpdateRecipeDto): Promise<RecipeResponseDto> {
    const input = new RecipeUpdateInput()
    Object.assign(input, payload)
    const result = await this.recipesService.update(RecipeID.of(+id), input)

    if (result.ok) {
      return new RecipeResponseDto('Recipe successfully updated!', [
        new RecipeDto(result.value),
      ])
    }

    throw new NotFoundException(result.error.error.message)
  }
}
