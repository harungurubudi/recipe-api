import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecipesModule } from './recipes/recipes.module';
import { AdapterModule } from './adapter/adapter.module';

@Module({
  imports: [RecipesModule, AdapterModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
