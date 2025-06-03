import { REST } from '@discordjs/rest';
import { LoggerService } from '@logger/logger.service';
import { Routes } from 'discord-api-types/v10';

import { CommandRegistryService } from './command-registry.service';

export async function publishSlashCommands(
    loggerService: LoggerService,
    token: string,
    clientId: string,
    testGuildId: string | undefined,
    commandRegistry: CommandRegistryService,
    isDev = true,
) {
    const rest = new REST({ version: '10' }).setToken(token);
    const commandData = commandRegistry.getAll().map((cmd) => cmd.data.toJSON());

    const isTest = isDev && !!testGuildId;
    const route = isTest
        ? Routes.applicationGuildCommands(clientId, testGuildId)
        : Routes.applicationCommands(clientId);

    try {
        loggerService.log(`Publishing slash commands (scope: ${isTest ? 'guild' : 'global'})...`);
        await rest.put(route, { body: commandData });
        loggerService.log(`Slash commands successfully registered (${commandData.length})`);
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        loggerService.error('Failed to publish slash commands:', msg);
        throw new Error(`Failed to publish slash commands: ${msg}`);
    }
}
