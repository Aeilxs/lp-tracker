import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { ConfigModule } from '@config/config.module';
import { Commands } from './commands';
import { CommandRegistryService } from './commands/command-registry.service';
import { SlashCommand } from './commands/command.interface';
import { RiotModule } from '@features/riot/riot.module';
import { PlayerPersistenceModule } from '@persistence/player/player.module';
import { MatchPersistenceModule } from '@persistence/match/match.module';
import { GuildPersistenceModule } from '@persistence/guild/guild.module';

@Module({
    imports: [ConfigModule, RiotModule, PlayerPersistenceModule, MatchPersistenceModule, GuildPersistenceModule],
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
