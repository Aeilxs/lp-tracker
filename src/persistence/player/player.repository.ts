// player.repository.ts

import { QUEUE_TYPE } from '@features/riot/constants';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Player, PlayerDocument } from './player.schema';
import { RankedSnapshot } from './player.schema';

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

    async findAll(): Promise<Player[]> {
        return this.model.find().exec();
    }

    async delete(puuid: string): Promise<Player | null> {
        return this.model.findOneAndDelete({ puuid }).exec();
    }

    /**
     * Push a ranked snapshot to a player.
     * Automatically updates the ranked state as well.
     */
    async pushSnapshotToPlayer(puuid: string, snapshot: RankedSnapshot): Promise<Player | null> {
        const player = await this.model.findOne({ puuid }).exec();
        if (!player) return null;

        const alreadyExists = player.snapshots.some((s) => s.matchId === snapshot.matchId);
        if (alreadyExists) return null; // ou throw si tu veux

        player.snapshots.push(snapshot);

        // Update ranked state
        if (snapshot.queueType === QUEUE_TYPE.RANKED_SOLO_5x5) {
            player.ranked.soloQ = snapshot.after;
        } else if (snapshot.queueType === QUEUE_TYPE.RANKED_FLEX_SR) {
            player.ranked.flexQ = snapshot.after;
        }

        return player.save();
    }
}
