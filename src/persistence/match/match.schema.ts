import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
class StatPerks {
    @Prop({ required: true }) defense: number;
    @Prop({ required: true }) flex: number;
    @Prop({ required: true }) offense: number;
}
const StatPerksSchema = SchemaFactory.createForClass(StatPerks);

@Schema({ _id: false })
class PerkStyleSelection {
    @Prop({ required: true }) perk: number;
    @Prop({ required: true }) var1: number;
    @Prop({ required: true }) var2: number;
    @Prop({ required: true }) var3: number;
}
const PerkStyleSelectionSchema = SchemaFactory.createForClass(PerkStyleSelection);

@Schema({ _id: false })
class PerkStyle {
    @Prop({ required: true }) description: string;
    @Prop({ required: true }) style: number;
    @Prop({ type: [PerkStyleSelectionSchema], required: true }) selections: PerkStyleSelection[];
}
const PerkStyleSchema = SchemaFactory.createForClass(PerkStyle);

@Schema({ _id: false })
class Perks {
    @Prop({ type: StatPerksSchema, required: true }) statPerks: StatPerks;
    @Prop({ type: [PerkStyleSchema], required: true }) styles: PerkStyle[];
}
const PerksSchema = SchemaFactory.createForClass(Perks);

@Schema({ _id: false })
export class MatchParticipation {
    @Prop({ required: true }) puuid: string;
    @Prop({ required: true }) summonerId: string;
    @Prop({ required: true }) summonerName: string;
    @Prop({ required: true }) riotIdGameName: string;
    @Prop({ required: true }) riotIdTagline: string;

    @Prop({ required: true }) championId: number;
    @Prop({ required: true }) championName: string;
    @Prop({ required: true }) champLevel: number;
    @Prop({ required: true }) championTransform: number;

    @Prop({ required: true }) kills: number;
    @Prop({ required: true }) deaths: number;
    @Prop({ required: true }) assists: number;
    @Prop({ required: true }) win: boolean;
    @Prop({ required: true }) teamId: number;
    @Prop({ required: true }) teamPosition: string;
    @Prop({ required: true }) individualPosition: string;
    @Prop({ required: true }) role: string;
    @Prop({ required: true }) placement: number;
    @Prop({ required: true }) subteamPlacement: number;
    @Prop({ required: true }) teamEarlySurrendered: boolean;

    @Prop({ required: true }) goldEarned: number;
    @Prop({ required: true }) goldSpent: number;
    @Prop({ required: true }) totalMinionsKilled: number;
    @Prop({ required: true }) neutralMinionsKilled: number;
    @Prop({ required: true }) totalDamageDealt: number;
    @Prop({ required: true }) totalDamageDealtToChampions: number;
    @Prop({ required: true }) totalDamageTaken: number;

    @Prop({ type: PerksSchema, required: true }) perks: Perks;
}

export const MatchParticipationSchema = SchemaFactory.createForClass(MatchParticipation);

@Schema()
export class Match {
    @Prop({ required: true, unique: true }) matchId: string;
    @Prop({ required: true }) gameCreation: number;
    @Prop({ required: true }) gameDuration: number;
    @Prop({ required: true }) gameEndTimestamp: number;
    @Prop({ required: true }) gameMode: string;
    @Prop({ required: true }) gameType: string;
    @Prop({ required: true }) queueId: number;
    @Prop({ required: true }) mapId: number;
    @Prop({ required: true }) platformId: string;

    @Prop({ type: [MatchParticipationSchema], default: [] }) participants: MatchParticipation[];

    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
export type MatchDocument = HydratedDocument<Match>;
