import { ChatInputCommandInteraction } from 'discord.js';

export function createMockInteraction({
    gameName = 'sALU LER GA SAVA',
    tagLine = 'EUW',
    region = 'euw1',
    guildId = 'guild123',
    isAdmin = true,
}: {
    gameName?: string;
    tagLine?: string;
    region?: string;
    guildId?: string;
    isAdmin?: boolean;
} = {}): ChatInputCommandInteraction {
    return {
        guildId,
        replied: false,
        deferred: false,
        user: { username: 'tester' },
        reply: jest.fn(),
        options: {
            getString: jest
                .fn()
                .mockImplementationOnce(() => gameName)
                .mockImplementationOnce(() => tagLine)
                .mockImplementationOnce(() => region),
        },
        member: {
            permissions: {
                has: jest.fn().mockReturnValue(isAdmin),
            },
        },
    } as unknown as ChatInputCommandInteraction;
}
