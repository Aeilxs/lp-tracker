import { ConfigService } from '@config/config.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Match, MatchDocument } from './match.schema';

@Injectable()
export class MatchRepository {
    constructor(
        @InjectModel(Match.name)
        private readonly model: Model<MatchDocument>,
        private readonly configService: ConfigService,
    ) {}

    async save(matchId: string, data: Record<string, any>): Promise<Match | null> {
        const existing = await this.model.findOne({ matchId }).exec();
        if (existing) return null; // match is immutable

        const seasonInfo = this.configService.seasonInfo;
        return this.model.create({ matchId, data, seasonInfo });
    }

    async findOne(matchId: string): Promise<Match | null> {
        return this.model.findOne({ matchId }).exec();
    }

    async findAll(): Promise<Match[]> {
        return this.model.find().exec();
    }

    async delete(matchId: string): Promise<Match | null> {
        return this.model.findOneAndDelete({ matchId }).exec();
    }
}
