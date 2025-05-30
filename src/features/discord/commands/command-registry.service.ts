import { Injectable } from '@nestjs/common';

import { SlashCommand } from './command.interface';

@Injectable()
export class CommandRegistryService {
    private readonly commandMap = new Map<string, SlashCommand>();

    constructor(commands: SlashCommand[]) {
        for (const command of commands) {
            this.commandMap.set(command.data.name, command);
        }
    }

    getCommand(name: string): SlashCommand | undefined {
        return this.commandMap.get(name);
    }

    getAll(): SlashCommand[] {
        return Array.from(this.commandMap.values());
    }
}
