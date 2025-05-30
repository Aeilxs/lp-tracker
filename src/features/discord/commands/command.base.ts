import { LoggerService } from '@logger/logger.service';
import { ChatInputCommandInteraction, GuildMember, MessageFlags, PermissionsBitField } from 'discord.js';

export abstract class BaseSlashCommand {
    constructor(protected readonly loggerService: LoggerService) {}

    protected async reply(interaction: ChatInputCommandInteraction, content: string, ephemeral = false) {
        if (interaction.replied || interaction.deferred) return;

        await interaction.reply({
            content,
            flags: ephemeral ? MessageFlags.Ephemeral : undefined,
        });
    }

    protected async assertIsAdmin(interaction: ChatInputCommandInteraction) {
        const member = interaction.member as GuildMember;
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await this.reply(interaction, 'You must be an admin to use this command.', true);
            throw new Error('[BaseSlashCommand] Not an admin');
        }
    }

    protected async assertInGuild(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!interaction.guildId) {
            await this.reply(interaction, 'This command must be used in a server.', true);
            throw new Error('[BaseSlashCommand] Not in a guild');
        }
    }
}
