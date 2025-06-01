import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Player, PlayerDocument, RankedSnapshot, RankedState } from './player.schema';

@Injectable()
export class PlayerRepository {
    constructor(
        @InjectModel(Player.name)
        private readonly model: Model<PlayerDocument>,
    ) {}

    async save(player: Player): Promise<Player> {
        const existing = await this.model.findOne({ puuid: player.puuid }).exec();
        if (existing) {
            Object.assign(existing, player);
            return existing.save();
        }
        return this.model.create(player);
    }

    async findOne(puuid: string): Promise<Player | null> {
        return this.model.findOne({ puuid }).exec();
    }

    async updateRankedState(puuid: string, ranked: RankedState): Promise<void> {
        await this.model.updateOne({ puuid }, { $set: { ranked } });
    }

    async findOneByGameName(gameName: string, tagLine: string, region: string): Promise<Player | null> {
        return this.model.findOne({ gameName, tagLine, region });
    }

    async findAll(): Promise<Player[]> {
        return this.model.find().exec();
    }

    async delete(puuid: string): Promise<Player | null> {
        return this.model.findOneAndDelete({ puuid }).exec();
    }

    /**
     * Push a ranked snapshot to a player.
     */
    async addSnapshot(puuid: string, snapshot: RankedSnapshot): Promise<Player | null> {
        const player = await this.model.findOne({ puuid }).exec();
        if (!player) return null;

        const alreadyExists = player.snapshots.some((s) => s.matchId === snapshot.matchId);
        if (alreadyExists) return null;

        player.snapshots.push(snapshot);

        return player.save();
    }
}
