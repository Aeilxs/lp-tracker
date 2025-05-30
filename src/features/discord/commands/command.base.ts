import { ChatInputCommandInteraction, GuildMember, MessageFlags } from 'discord.js';

import { LoggerService } from '@logger/logger.service';

export abstract class BaseSlashCommand {
    constructor(protected readonly loggerService: LoggerService) {}

    protected async reply(interaction: ChatInputCommandInteraction, content: string, ephemeral = false) {
        await interaction.reply({
            content,
            flags: ephemeral ? MessageFlags.Ephemeral : undefined,
        });
    }

    protected isAdmin(interaction: ChatInputCommandInteraction): boolean {
        const member = interaction.member as GuildMember;
        // TODO: impl
        return true;
    }
}
