import Discord from 'discord.js';
import { BaseArrayManager, BaseClass } from './base';
import { Client } from './client';
import { Command, CommandManager } from './command';
import { ClientEvents, EventEmitter } from './events';
export declare abstract class Module extends BaseClass {
    constructor(manager: ModuleManager);
    readonly moduleManager: ModuleManager;
    abstract readonly name: string;
    abstract readonly description: string;
    abstract readonly commands: CommandManager;
    abstract readonly eventListeners: {
        [Property in keyof ClientEvents]: (...args: ClientEvents[Property]) => (void | Promise<void>);
    };
    enable(): Promise<void>;
    disable(): Promise<void>;
    isEnabled(guildId?: string): Promise<boolean>;
    setGuildOverride(guildId: string, isEnabled: boolean): Promise<void>;
    unsetGuildOverride(guildId: string): Promise<void>;
}
export declare class ModuleManager extends BaseArrayManager<Module> {
    static bindEventEmitter(modules: ModuleManager, eventEmitter: EventEmitter): void;
    constructor(client: Client);
    get moduleTable(): import("../database/query-builder").TableQueryBuilder;
    get moduleGuildOverrideTable(): import("../database/query-builder").TableQueryBuilder;
    publishCommands(entryList: {
        [key: string]: {
            module: Module;
            command: Command;
        };
    }, application: Discord.ClientApplication): Promise<void>;
    init(): Promise<void>;
    private _application?;
    getApplication(): Promise<Discord.ClientApplication | null>;
    enable(name: string): Promise<void>;
    disable(name: string): Promise<void>;
    isEnabled(name: string, guildId?: string): Promise<boolean>;
    setGuildOverride(name: string, guildId: string, isEnabled: boolean): Promise<void>;
    unsetGuildOverride(name: string, guildId: string): Promise<void>;
}
