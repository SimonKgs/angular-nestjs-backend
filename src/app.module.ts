import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    (() => {
      const mongoUri = process.env.MONGO_URI;
      console.log('MONGO_URI:', mongoUri);  // Log the MONGO_URI
      return MongooseModule.forRoot(mongoUri, {
        dbName: process.env.MONGO_DB_NAME,
      });
    })(),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
