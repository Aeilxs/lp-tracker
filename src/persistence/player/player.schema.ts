import { QUEUE_TYPE } from '@features/riot/constants';
import { PlayerProfileDto } from '@features/riot/dtos';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class RankedInfo {
    @Prop({ required: true }) tier: string;
    @Prop({ required: true }) rank: string;
    @Prop({ required: true }) leaguePoints: number;
    @Prop({ required: true }) wins: number;
    @Prop({ required: true }) losses: number;
}
export const RankedInfoSchema = SchemaFactory.createForClass(RankedInfo);

@Schema({ _id: false })
export class RankedSnapshot {
    @Prop({ required: true }) matchId: string;
    @Prop({ required: true }) timestamp: Date;
    @Prop({ required: true, enum: Object.values(QUEUE_TYPE) }) queueType: QUEUE_TYPE;
    @Prop({ type: RankedInfoSchema, required: true }) before: RankedInfo;
    @Prop({ type: RankedInfoSchema, required: true }) after: RankedInfo;
}
export const RankedSnapshotSchema = SchemaFactory.createForClass(RankedSnapshot);

@Schema({ _id: false })
export class RankedState {
    @Prop({ type: RankedInfoSchema }) soloQ?: RankedInfo;
    @Prop({ type: RankedInfoSchema }) flexQ?: RankedInfo;
}
export const RankedStateSchema = SchemaFactory.createForClass(RankedState);

@Schema({ timestamps: true })
export class Player {
    @Prop({ required: true, unique: true }) puuid: string;
    @Prop({ required: true }) summonerId: string;
    @Prop({ required: true }) gameName: string;
    @Prop({ required: true }) tagLine: string;
    @Prop({ required: true }) region: string;
    @Prop({ required: true }) profileIconId: number;
    @Prop({ required: true }) summonerLevel: number;
    @Prop({ type: RankedStateSchema, default: {} }) ranked: RankedState;
    @Prop({ type: [RankedSnapshotSchema], default: [] }) snapshots: RankedSnapshot[];

    readonly createdAt: Date;
    readonly updatedAt: Date;

    static fromDto(dto: PlayerProfileDto, region: string): Player {
        const player = new this();
        player.puuid = dto.account.puuid;
        player.summonerId = dto.summoner.id;
        player.gameName = dto.account.gameName;
        player.tagLine = dto.account.tagLine;
        player.region = region;
        player.profileIconId = dto.summoner.profileIconId;
        player.summonerLevel = dto.summoner.summonerLevel;
        player.ranked = {
            soloQ: dto.ranked.soloQ ?? undefined,
            flexQ: dto.ranked.flexQ ?? undefined,
        };
        return player;
    }
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
export type PlayerDocument = HydratedDocument<Player>;
