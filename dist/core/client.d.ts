import Discord from 'discord.js';
import { GlobalConfigManager } from '../resource/manager';
import { Guild, GuildMember, User } from '../resource/data';
import { DatabaseCredentials, QueryBuilder } from '../database/query-builder';
import { EventEmitter } from './events';
import { ScopedLogger } from './logger';
import { ModuleManager } from './module';
import { Knex } from 'knex';
export interface ClientOptions {
    knex?: Knex.Config;
}
export declare class Client {
    static defaultOptions: ClientOptions;
    constructor(client: Discord.Client, databaseCredentials: DatabaseCredentials, options?: Partial<ClientOptions>);
    readonly options: ClientOptions;
    readonly discordClient: Discord.Client;
    readonly database: QueryBuilder;
    readonly events: EventEmitter;
    readonly on: EventEmitter['on'];
    readonly once: EventEmitter['once'];
    readonly logger: ScopedLogger;
    readonly modules: ModuleManager;
    readonly config: GlobalConfigManager;
    private _application?;
    getApplication(): Promise<Discord.ClientApplication | null>;
    getGuild(guildResolvable: Discord.Guild | string): Guild;
    getUser(userResolvable: Discord.User | string): User;
    getGuildMember(guildMemberResolvable: Discord.GuildMember | [string, string]): GuildMember;
}
