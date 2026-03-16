import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../database/schema';

export const DB = Symbol('DRIZZLE_DB');

@Global()
@Module({
  providers: [
    {
      provide: DB,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const connectionString =
          configService.getOrThrow<string>('DATABASE_URL');
        const client = postgres(connectionString);
        return drizzle(client, { schema });
      },
    },
  ],
  exports: [DB],
})
export class DatabaseModule {}
