import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Guild {
    @Prop({ required: true, unique: true })
    guildId: string;

    @Prop({ type: [String], default: [] })
    puuids: string[];

    static fromGuildId(guildId: string): Guild {
        const guild = new this();
        guild.guildId = guildId;
        return guild;
    }
}

export const GuildSchema = SchemaFactory.createForClass(Guild);
export type GuildDocument = HydratedDocument<Guild>;
