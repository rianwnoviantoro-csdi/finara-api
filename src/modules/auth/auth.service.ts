import {
  Injectable,
  Inject,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DB } from '../database/database.module';
import * as schema from '../../database/schema';
import { RegisterDto } from './dto/register.dto';
import { asyncHandler } from '../../utils/async-handler';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  register(data: RegisterDto) {
    return asyncHandler(async () => {
      const { name, email, password } = data;

      try {
        const hashedPassword = await bcrypt.hash(password, 12);

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

        return {
          success: true,
          data: result,
        };
      } catch (error: unknown) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          (error as Record<string, unknown>).code === '23505'
        ) {
          throw new ConflictException({
            success: false,
            error: 'Email already registered',
            code: 'EMAIL_EXISTS',
          });
        }

        const errorMessage =
          error instanceof Error ? error.message : 'Registration failed';
        throw new InternalServerErrorException({
          success: false,
          error: errorMessage,
        });
      }
    });
  }
}
