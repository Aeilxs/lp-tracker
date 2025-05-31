import { ConfigService } from '@config/config.service';
import { LoggerService } from '@logger/logger.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, GatewayIntentBits, Interaction } from 'discord.js';

import { CommandRegistryService } from './commands/command-registry.service';
import { publishSlashCommands } from './commands/publishCommands';
import { DISCORD_CHANNEL_NAME } from './constants';

@Injectable()
export class DiscordService implements OnModuleInit {
    private readonly client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    });

    constructor(
        private readonly loggerService: LoggerService,
        private readonly configService: ConfigService,
        private readonly commandRegistry: CommandRegistryService,
    ) {}

    private async onInteraction(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = this.commandRegistry.getCommand(interaction.commandName);
        if (!command) {
            await interaction.reply({ content: 'Unknown command.', ephemeral: true });
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            this.loggerService.error(`Error while executing /${interaction.commandName}: ${msg}`);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'An error occurred.', ephemeral: true });
            }
        }
    }

    async onModuleInit() {
        this.loggerService.log('Initializing Discord service...');
        await this.setup();
    }

    private async setup() {
        this.client.once('ready', () => {
            void (async () => {
                const clientId = this.client.user?.id;
                if (!clientId) {
                    this.loggerService.error('Discord client ID is not available.');
                    return;
                }

                this.loggerService.log(`Discord bot is online as ${this.client.user?.tag}`);

                await publishSlashCommands(
                    this.loggerService,
                    this.configService.discordToken,
                    clientId,
                    this.configService.discordTestGuildId,
                    this.commandRegistry,
                );
            })();
        });

        this.client.on('interactionCreate', (i: Interaction) => {
            void this.onInteraction(i);
        });

        this.client.on('guildCreate', (guild) => {
            void (async () => {
                this.loggerService.log(`Bot added to guild: ${guild.name}`);
                try {
                    const channel = await guild.channels.create({
                        name: DISCORD_CHANNEL_NAME,
                        type: 0,
                        reason: 'Automatic channel creation for lp-tracker',
                    });

                    if (channel.isTextBased()) {
                        await channel.send(`Hello! I am lp-tracker :).`);
                    }
                } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : 'Unknown error';
                    this.loggerService.error(`Cannot create channel: ${msg}`);
                }
            })();
        });

        await this.client.login(this.configService.discordToken);
    }
}
