import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DB } from '../database/database.module';
import * as schema from '../../database/schema';
import { RegisterDto } from './dto/register.dto';
import { asyncHandler } from '../../utils/async-handler';
import { hashPassword } from '../../utils/hash.util';
import { AppError } from '../../common/errors';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  register(data: RegisterDto) {
    return asyncHandler(async () => {
      const { name, email, password } = data;

      try {
        const hashedPassword = await hashPassword(password);

        const result = await this.db.transaction(async (tx) => {
          const [newUser] = await tx
            .insert(schema.users)
            .values({
              name,
              email,
              password: hashedPassword,
            })
            .returning({
              id: schema.users.id,
              name: schema.users.name,
              email: schema.users.email,
              createdAt: schema.users.createdAt,
            });

          const defaultCategories = [
            { name: 'Gaji', type: 'INCOME' as const, userId: newUser.id },
            { name: 'Bonus', type: 'INCOME' as const, userId: newUser.id },
            { name: 'Makan', type: 'EXPENSE' as const, userId: newUser.id },
            { name: 'Transport', type: 'EXPENSE' as const, userId: newUser.id },
            { name: 'Belanja', type: 'EXPENSE' as const, userId: newUser.id },
          ];

          await tx.insert(schema.categories).values(defaultCategories);

          return newUser;
        });

        return result;
      } catch (error: unknown) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          (error as Record<string, unknown>).code === '23505'
        ) {
          throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
        }

        const errorMessage =
          error instanceof Error ? error.message : 'Registration failed';
        throw new AppError(errorMessage, 500, 'INTERNAL_SERVER_ERROR');
      }
    });
  }
}
