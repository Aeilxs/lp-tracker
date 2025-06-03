import { DiscordModule } from '@features/discord/discord.module';
import { LoggerModule } from '@logger/logger.module';
import { Module } from '@nestjs/common';
import { GuildPersistenceModule } from '@persistence/guild/guild.module';

import { NotificationsService } from './notifications.service';

@Module({
    imports: [DiscordModule, LoggerModule, GuildPersistenceModule],
    providers: [NotificationsService],
    exports: [NotificationsService],
})
export class NotificationsModule {}
