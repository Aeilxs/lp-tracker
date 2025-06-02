import { ConfigModule } from '@config/config.module';
import { RiotModule } from '@features/riot/riot.module';
import { Module } from '@nestjs/common';
import { GuildPersistenceModule } from '@persistence/guild/guild.module';
import { PlayerPersistenceModule } from '@persistence/player/player.module';

import { Commands } from './commands';
import { CommandRegistryService } from './commands/command-registry.service';
import { SlashCommand } from './commands/command.interface';
import { DiscordService } from './discord.service';

@Module({
    imports: [ConfigModule, RiotModule, PlayerPersistenceModule, GuildPersistenceModule],
    providers: [
        DiscordService,
        CommandRegistryService,
        ...Commands,
        {
            provide: CommandRegistryService,
            useFactory: (...cmds: SlashCommand[]) => new CommandRegistryService(cmds),
            inject: Commands,
        },
    ],
    exports: [DiscordService],
})
export class DiscordModule {}
