import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        return {
          uri,
          onConnectionCreate: (connection: Connection) => {
            connection.on('connected', () => console.log('mongoose connected'));
            connection.on('open', () => console.log('mongoose open'));
            connection.on('disconnected', () =>
              console.log('mongoose disconnected'),
            );
            connection.on('reconnected', () =>
              console.log('mongoose reconnected'),
            );
            connection.on('disconnecting', () =>
              console.log('mongoose disconnecting'),
            );

            return connection;
          },
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
  ],
})
export class AppModule {}
