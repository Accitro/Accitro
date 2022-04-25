import { BaseArrayManager, BaseClass } from './base';
import { Client } from './client';
import { CommandManager, CommandRunner } from './command';
import { ClientEvents, EventEmitter } from './events';
import { ScopedLogger } from './logger';
export declare abstract class Module extends BaseClass {
    constructor(manager: ModuleManager);
    readonly moduleManager: ModuleManager;
    private _logger?;
    get logger(): ScopedLogger;
    abstract readonly name: string;
    abstract readonly description: string;
    readonly commands: CommandManager;
    readonly eventListeners: {
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
    get moduleTable(): import("..").TableQueryBuilder;
    get moduleGuildOverrideTable(): import("..").TableQueryBuilder;
    readonly logger: ScopedLogger;
    readonly commandRunner: CommandRunner;
    init(): Promise<void>;
    add(...entries: Module[]): void;
    enable(name: string): Promise<void>;
    disable(name: string): Promise<void>;
    isEnabled(name: string, guildId?: string): Promise<boolean>;
    setGuildOverride(name: string, guildId: string, isEnabled: boolean): Promise<void>;
    unsetGuildOverride(name: string, guildId: string): Promise<void>;
}
