import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      /**
       * A function that returns a TypeORM configuration object.
       * 
       * @param configService - The ConfigService injected by Nest.
       * 
       * @returns {Promise<TypeOrmModuleOptions>} - A Promise that resolves to
       * a TypeORM configuration object.
       */
      useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
        const synchronize = configService.get<string>('environment', "production") === "development";
        // const dbConf = configService.get<string>('database')
        // console.log(dbConf)
        return {
          type: 'mysql',
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.user'),
          password: configService.get<string>('database.password'),
          database: configService.get<string>('database.name'),
          synchronize: synchronize,
          migrations: [__dirname + '/../../../migrations/*{.ts,.js}'],
          migrationsRun: true,
          entities: [__dirname + '/../../../recipes/repositories/entities/*.entity.{.ts,.js}'],
        }
      },
    }),
  ],
})
export class DatabaseModule {}
