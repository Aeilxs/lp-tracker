// interactionFactory.ts – enhanced mock for ChatInputCommandInteraction
// -----------------------------------------------------------------------------
// DX improvements:
//  • Named args map → no order dependency.
//  • Generic typing so `interaction.options.getString('foo')` narrows to the
//    actual type provided in args.
//  • Mocks for getString / getInteger / getBoolean out of the box.
//  • Common interaction helpers (deferReply, editReply, followUp).
//  • Builder‑style API for fluent creation, while keeping simple function.
// -----------------------------------------------------------------------------
// Basic usage:
// const i = InteractionFactory.createMockInteraction({
//   args: { gameName: 'Faker', tagLine: 'EUW', ranked: true },
//   isAdmin: false,
// });
// await command.execute(i);
//
// Advanced (builder):
// const i = InteractionFactory.builder()
//   .withArgs({ gameName: 'Faker', tagLine: 'EUW' })
//   .nonAdmin()
//   .inGuild('guild42')
//   .build();
// -----------------------------------------------------------------------------

import { ChatInputCommandInteraction } from 'discord.js';

export namespace InteractionFactory {
    /* ----------------------------------------------------------------------- */
    /*  Types                                                                  */
    /* ----------------------------------------------------------------------- */
    export interface ArgsDefinition {
        [key: string]: string | number | boolean | null;
    }

    export interface Options<A extends ArgsDefinition = ArgsDefinition> {
        args?: A;
        guildId?: string;
        isAdmin?: boolean;
        userName?: string;
    }

    type OptionReturnType<V> = V extends string
        ? string | null
        : V extends number
          ? number | null
          : V extends boolean
            ? boolean | null
            : unknown;

    /* ----------------------------------------------------------------------- */
    /*  Core factory                                                           */
    /* ----------------------------------------------------------------------- */
    export function createMockInteraction<A extends ArgsDefinition = ArgsDefinition>(
        opts: Options<A> = {},
    ): ChatInputCommandInteraction {
        const { args = {} as A, guildId = 'guild123', isAdmin = true, userName = 'tester' } = opts;

        const makeGetter = <K extends keyof A>() =>
            jest.fn(<T extends K>(name: T): OptionReturnType<A[T]> => args[name] as OptionReturnType<A[T]>);

        const interaction = {
            guildId,
            replied: false,
            deferred: false,
            user: { username: userName },
            reply: jest.fn(),
            deferReply: jest.fn().mockResolvedValue(undefined),
            editReply: jest.fn(),
            followUp: jest.fn(),
            options: {
                getString: makeGetter(),
                getInteger: makeGetter(),
                getBoolean: makeGetter(),
            },
            member: {
                permissions: {
                    has: jest.fn().mockReturnValue(isAdmin),
                },
            },
        } as unknown as ChatInputCommandInteraction;

        return interaction;
    }

    /* ----------------------------------------------------------------------- */
    /*  Fluent builder                                                         */
    /* ----------------------------------------------------------------------- */
    interface Builder {
        withArgs<A extends ArgsDefinition>(args: A): Builder;
        inGuild(id: string): Builder;
        asAdmin(): Builder;
        nonAdmin(): Builder;
        withUser(name: string): Builder;
        build(): ChatInputCommandInteraction;
    }

    export function builder(): Builder {
        let opts: Options = {};
        const self: Builder = {
            withArgs<A extends ArgsDefinition>(args: A) {
                opts = { ...opts, args };
                return self;
            },
            inGuild(id: string) {
                opts.guildId = id;
                return self;
            },
            asAdmin() {
                opts.isAdmin = true;
                return self;
            },
            nonAdmin() {
                opts.isAdmin = false;
                return self;
            },
            withUser(name: string) {
                opts.userName = name;
                return self;
            },
            build() {
                return createMockInteraction(opts);
            },
        };
        return self;
    }
}
