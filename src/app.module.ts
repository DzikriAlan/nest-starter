import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SharedModule } from './shared/shared.module'
import { AuthModule } from './features/auth/auth.module'
import { UsersModule } from './features/users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SharedModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
