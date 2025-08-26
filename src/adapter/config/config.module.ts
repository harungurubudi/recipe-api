import { Module } from '@nestjs/common';
import { ConfigModule as ConfigModuleLib } from '@nestjs/config';
import configuration from './configuration';

@Module({
  imports: [
    ConfigModuleLib.forRoot({
      isGlobal: true, 
      load: [configuration],
    }),
  ],
})
export class ConfigModule {}
