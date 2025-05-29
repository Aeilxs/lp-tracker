import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import pino, { Logger as PinoInstance } from 'pino';
import { ConfigService } from 'src/config/config.service';

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

    setContext(context: string) {
        this.logger = this.logger.child({ context });
    }

    log(message: any) {
        this.logger.info(message);
    }

    error(message: any, trace?: string) {
        this.logger.error({ msg: message, trace });
    }

    warn(message: any) {
        this.logger.warn(message);
    }

    debug(message: any) {
        this.logger.debug(message);
    }

    verbose(message: any) {
        this.logger.trace(message);
    }

    printBanner(title: string, entries: [string, string][], width: number) {
        const contentWidth = width - 4;

        const center = (text: string) => {
            const padding = Math.max(0, contentWidth - text.length);
            const left = Math.floor(padding / 2);
            const right = padding - left;
            return `│ ${' '.repeat(left)}${text}${' '.repeat(right)} │`;
        };

        const line = (label: string, value: string) => {
            // both label and value are empty => return empty line
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
