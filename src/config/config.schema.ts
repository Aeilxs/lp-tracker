/**
 * @file config/config.schema.ts
 * This file defines the configuration schema for the application using Joi.
 */

import * as Joi from 'joi';

import { DEVELOPMENT, PRODUCTION } from './constants';

export const configSchema = Joi.object({
    NODE_ENV: Joi.string().valid(DEVELOPMENT, PRODUCTION).default(DEVELOPMENT),
    PORT: Joi.number().default(8080),
    LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug', 'trace').default('info'),

    DISCORD_TOKEN: Joi.string().required(),
    RIOT_API_KEY: Joi.string().required(),
    DISCORD_TEST_GUILD_ID: Joi.string().optional(),

    MONGO_DB_NAME: Joi.string().required(),
    MONGO_URI: Joi.string().uri().required(),

    SEASON_INFO: Joi.string().required(),
});
