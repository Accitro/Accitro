import Discord from 'discord.js';
import { Client } from '../core/client';
import { QueryBuilder } from '../database/query-builder';
import { Guild, GuildMember, User } from './data';
export declare class BaseManager {
    constructor(client: Client);
    readonly client: Client;
    readonly database: QueryBuilder;
}
export declare class GlobalConfigManager extends BaseManager {
    constructor(client: Client, context: Array<string>);
    readonly context: Array<string>;
    get globalConfigTable(): import("../database/query-builder").TableQueryBuilder;
    newContext(context: Array<string>): GlobalConfigManager;
    getKey(name: string): Promise<string>;
    get(name: string, defaultValue?: any): Promise<any>;
    set(name: string, value: any): Promise<void>;
    has(name: string): Promise<boolean>;
    unset(name: string): Promise<void>;
}
export declare class BaseConfigManager<T extends 'guild' | 'user'> extends BaseManager {
    constructor(client: Client, type: T, id: string, context: Array<string>);
    readonly type: T;
    readonly id: string;
    readonly context: Array<string>;
    get guildConfigTable(): import("../database/query-builder").TableQueryBuilder;
    get userConfigTable(): import("../database/query-builder").TableQueryBuilder;
    get configTable(): import("../database/query-builder").TableQueryBuilder;
    newContext(context: Array<string>): BaseConfigManager<T>;
    getKey(name: string): Promise<string>;
    get(name: string, defaultValue?: any): Promise<any>;
    set(name: string, value: any): Promise<void>;
    has(name: string): Promise<boolean>;
    unset(name: string): Promise<void>;
}
export declare class DataManager extends BaseManager {
    get(guild: Discord.Guild): Guild;
}
export declare class GuildConfigManager extends BaseConfigManager<'guild'> {
    constructor(guild: Guild, context: Array<string>);
    newContext(context: string[]): BaseConfigManager<'guild'>;
    readonly guild: Guild;
}
export declare class UserConfigManager extends BaseConfigManager<'user'> {
    constructor(user: User, context: Array<string>);
    newContext(context: string[]): BaseConfigManager<'user'>;
    readonly user: User;
}
export declare class GuildMemberConfigManager extends BaseConfigManager<'guild'> {
    constructor(guildMember: GuildMember, context: Array<string>);
    readonly guildMember: GuildMember;
}
