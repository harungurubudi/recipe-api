import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RepositoryModule } from './repository/repository.module';
import { AdapterModule } from 'adapter/adapter.module';
import { RecipesController } from './recipes.controller';

@Module({
  controllers: [RecipesController],
  providers: [RecipesService],
  imports: [AdapterModule, RepositoryModule, RecipesModule],
})
export class RecipesModule {}
