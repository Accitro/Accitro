import Discord from 'discord.js';
import { BaseClass } from '../core/base';
import { Client } from '../core/client';
import { GuildConfigManager, GuildMemberConfigManager, UserConfigManager } from './manager';
export declare class Guild extends BaseClass {
    constructor(client: Client, discordGuild: Discord.Guild);
    readonly discordGuild: Discord.Guild;
    readonly config: GuildConfigManager;
}
export declare class User extends BaseClass {
    constructor(client: Client, discordUser: Discord.User);
    readonly discordUser: Discord.User;
    readonly config: UserConfigManager;
}
export declare class GuildMember extends BaseClass {
    constructor(client: Client, discordGuildMember: Discord.GuildMember);
    readonly discordGuildMember: Discord.GuildMember;
    readonly config: GuildMemberConfigManager;
}
