import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
class RawMatch {
    @Prop({ required: true }) matchId: string;
    @Prop({ required: true }) region: string;
    @Prop({ required: true, type: Object }) data: Record<string, any>;
}
export const RawMatchSchema = SchemaFactory.createForClass(RawMatch);

@Schema({ timestamps: true })
export class Match {
    @Prop({ required: true, unique: true }) matchId: string;
    @Prop({ required: true }) region: string;
    @Prop({ required: true, type: Object }) data: Record<string, any>;

    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
export type MatchDocument = HydratedDocument<Match>;
