/**
 * @file src/main.ts
 * @description Entry point.
 */

import { ConfigService } from '@config/config.service';
import { LoggerService } from '@logger/logger.service';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
// import { RiotService } from '@features/riot/riot.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useLogger(app.get(LoggerService));
    await app.listen(app.get(ConfigService).port);

    const config = app.get(ConfigService);
    config.dump();

    // const riot = app.get(RiotService);
    // const u = await riot.fetchFullPlayerProfile('sALU LER GA SAVA', 'CPP', 'euw1');
    // if (!u) throw new Error('fuck it');
    // const t = await riot.fetchRankedStats(u.summoner.id, 'euw1');
    // console.log(t);
}

bootstrap().catch((err) => {
    console.error('Failed to bootstrap app:', err);
    process.exit(1);
});
