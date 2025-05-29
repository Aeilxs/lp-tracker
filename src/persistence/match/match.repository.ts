import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument } from './match.schema';
import { ConfigService } from '@config/config.service';

@Injectable()
export class MatchRepository {
    constructor(
        @InjectModel(Match.name)
        private readonly model: Model<MatchDocument>,
        private readonly configService: ConfigService,
    ) {}

    async save(match: Match): Promise<Match> {
        const existing = await this.model.findOne({ matchId: match.matchId }).exec();
        if (existing) {
            Object.assign(existing, match);
            return existing.save();
        }
        return this.model.create(match);
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
