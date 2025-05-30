import { ConfigService } from '@config/config.service';
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import pino, { Logger as PinoInstance } from 'pino';

@Injectable()
export class LoggerService implements NestLoggerService {
    private logger: PinoInstance;

    constructor(private readonly configService: ConfigService) {
        const baseLogger = this.configService.isProduction
            ? pino({
                  level: this.configService.logLevel,
                  timestamp: pino.stdTimeFunctions.isoTime,
              })
            : pino({
                  level: this.configService.logLevel,
                  transport: {
                      target: 'pino-pretty',
                      options: {
                          colorize: true,
                          ignore: 'pid,hostname',
                      },
                  },
              });

        this.logger = baseLogger;
    }

    setContext(context: string): void {
        this.logger = this.logger.child({ context }) as PinoInstance;
    }

    log(message: string | Record<string, unknown>): void {
        this.logger.info(message);
    }

    error(message: string | Error, trace?: string): void {
        const msg = message instanceof Error ? message.message : message;
        this.logger.error({ msg, trace });
    }

    warn(message: string | Record<string, unknown>): void {
        this.logger.warn(message);
    }

    debug(message: string | Record<string, unknown>): void {
        this.logger.debug(message);
    }

    verbose(message: string | Record<string, unknown>): void {
        this.logger.trace(message);
    }

    printBanner(title: string, entries: [string, string][], width: number): void {
        const contentWidth = width - 4;

        const center = (text: string) => {
            const padding = Math.max(0, contentWidth - text.length);
            const left = Math.floor(padding / 2);
            const right = padding - left;
            return `│ ${' '.repeat(left)}${text}${' '.repeat(right)} │`;
        };

        const line = (label: string, value: string) => {
            if (label === '' && value === '') return `│ ${' '.repeat(contentWidth)} │`;

            const content = `${label} : ${value}`;
            const padding = Math.max(0, contentWidth - content.length);
            return `│ ${content}${' '.repeat(padding)} │`;
        };

        this.log(
            [
                '',
                '╭' + '─'.repeat(contentWidth + 2) + '╮',
                center(title),
                '├' + '─'.repeat(contentWidth + 2) + '┤',
                ...entries.map(([label, value]) => line(label, value)),
                '╰' + '─'.repeat(contentWidth + 2) + '╯',
                '',
            ].join('\n'),
        );
    }
}
