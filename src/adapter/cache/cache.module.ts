import { Module } from '@nestjs/common';
import { CacheModule as CacheModuleLib } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModuleLib.register({
      isGlobal: true,
    }),
  ],
})
export class CacheModule {}
