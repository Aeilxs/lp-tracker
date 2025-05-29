import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Guild, GuildDocument } from './guild.schema';

@Injectable()
export class GuildRepository {
    constructor(
        @InjectModel(Guild.name)
        private readonly model: Model<GuildDocument>,
    ) {}

    async findOne(guildId: string): Promise<Guild | null> {
        return this.model.findOne({ guildId }).exec();
    }

    async save(guild: Guild): Promise<Guild> {
        const existing = await this.model.findOne({ guildId: guild.guildId }).exec();

        if (existing) {
            Object.assign(existing, guild);
            return existing.save();
        }
        return this.model.create(guild);
    }

    async addPlayerToGuild(guildId: string, puuid: string): Promise<Guild | null> {
        const guild = await this.model
            .findOneAndUpdate({ guildId }, { $addToSet: { trackedPuids: puuid } }, { new: true, upsert: true })
            .exec();

        return guild;
    }

    async removePlayerFromGuild(guildId: string, puuid: string): Promise<Guild | null> {
        return this.model.findOneAndUpdate({ guildId }, { $pull: { trackedPuids: puuid } }, { new: true }).exec();
    }

    async findAll(): Promise<Guild[]> {
        return this.model.find().exec();
    }
}
