/**
 * @file src/main.ts
 * @description Entry point.
 */

import { ConfigService } from '@config/config.service';
import { LoggerService } from '@logger/logger.service';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useLogger(app.get(LoggerService));
    await app.listen(app.get(ConfigService).port);

    const config = app.get(ConfigService);
    config.dump();
}

bootstrap().catch((err) => {
    console.error('Failed to bootstrap app:', err);
    process.exit(1);
});
