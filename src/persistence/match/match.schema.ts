import { MatchV5 } from '@features/riot/dtos';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
class SeasonInfo {
    @Prop({ required: true }) year: number;
    @Prop({ required: true }) season: number;
    @Prop({ required: true }) split: number;
    @Prop({ required: true }) preseason: boolean;
}
const SeasonInfoSchema = SchemaFactory.createForClass(SeasonInfo);

@Schema({ timestamps: true })
export class Match {
    @Prop({ required: true, unique: true }) matchId: string;
    @Prop({ required: true, type: Object }) data: MatchV5.MatchDTO;
    @Prop({ required: true, type: SeasonInfoSchema }) seasonInfo: SeasonInfo;

    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
export type MatchDocument = HydratedDocument<Match>;
