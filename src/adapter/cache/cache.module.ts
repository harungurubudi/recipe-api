// cache.module.ts
import { Module } from '@nestjs/common';
import { CacheModule as CacheModuleLib } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createKeyv } from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';


@Module({
  imports: [
    CacheModuleLib.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = `redis://${configService.get('redis.host')}:${configService.get('redis.port')}`;
        const redisKeyV = createKeyv({
          url: redisUrl,
          password: configService.get('redis.password'),
        })
        redisKeyV.on('error', err => console.error(err));

        return {
          stores: [
            redisKeyV,
            new Keyv({
              store: new CacheableMemory(),
            }),
          ],
        };
      },
    }),
  ],
  exports: [CacheModuleLib],
})
export class CacheModule { }
