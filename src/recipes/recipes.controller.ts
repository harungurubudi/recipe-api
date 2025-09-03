import { Controller, Get, Param, NotFoundException, UseInterceptors, ClassSerializerInterceptor, Post, Body, Patch, ValidationPipe, UsePipes, Delete, HttpCode } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipeCreateInput, RecipeID, RecipeUpdateInput } from './domain/recipe.entity';
import { MessageResponseDTO, RecipeResponseDto, RecipesResponseDto } from './dto/response.dto';
import { BriefRecipeDto, RecipeDto,  CreateRecipeDto, UpdateRecipeDto } from './dto/recipe.dto';
import { ParseIntPipe } from '@nestjs/common';
import { validate } from 'class-validator';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

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
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<RecipeResponseDto> {
    const result = await this.recipesService.findOne(RecipeID.of(id))
    
    if (result.ok) {
      return new RecipeResponseDto('Recipe details by id', [
        new BriefRecipeDto(result.value),
      ])
    }

    throw new NotFoundException(result.error.error.message)
  }

  @Post('')
  @HttpCode(200)
  /**
   * Creates a new recipe with the given data
   *
   * @param payload the new recipe's data
   * @returns the newly created recipe, or a `RecipeError` if something goes wrong
   */
  async create(@Body() body: object): Promise<RecipeResponseDto|MessageResponseDTO> {
    // Validate and transform the input. This part should be done in the DTO. But, since the test require to give 200, we are doing it here.
    const payload = plainToInstance(CreateRecipeDto, body)
    const validationErrors = await validate(payload)
    if (validationErrors.length > 0) {
      return new MessageResponseDTO('Recipe creation failed!')
    }

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
  async delete(@Param('id', ParseIntPipe) id: number): Promise<MessageResponseDTO> {
    const result = await this.recipesService.delete(RecipeID.of(id))

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
  /**
   * Updates an existing recipe by ID.
   *
   * @param id the ID of the recipe to be updated
   * @param payload the input data for the updated recipe
   * @returns the updated recipe, or a `RecipeError` if something goes wrong
   */
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: object): Promise<RecipeResponseDto|MessageResponseDTO> {
    // Validate and transform input. This part should be done in the DTO. But, since the test require to give 200, we are doing it here.
    const payload = plainToInstance(CreateRecipeDto, body)
    const validationErrors = await validate(payload)
    if (validationErrors.length > 0) {
      return new MessageResponseDTO('Recipe creation failed!')
    }
    
    const input = new RecipeUpdateInput()
    Object.assign(input, payload)
    const result = await this.recipesService.update(RecipeID.of(id), input)

    if (result.ok) {
      return new RecipeResponseDto('Recipe successfully updated!', [
        new RecipeDto(result.value),
      ])
    }

    throw new NotFoundException(result.error.error.message)
  }
}
