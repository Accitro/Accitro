import Discord from 'discord.js';
import { DatabaseCredentials, QueryBuilder } from '../database/query-builder';
import { EventEmitter } from './events';
import { ScopedLogger } from './logger';
import { ModuleManager } from './module';
export interface ClientOptions {
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
}
