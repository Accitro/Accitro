import Discord from 'discord.js';
import { Module, ModuleManager } from './module';
import { BaseArrayManager, BaseClass } from './base';
import { ScopedLogger } from './logger';
export interface Command {
    data: Discord.ChatInputApplicationCommandData;
    run: (logger: ScopedLogger, interaction: Discord.CommandInteraction) => (Promise<Parameters<Discord.CommandInteraction['reply']>[0] | void> | Parameters<Discord.CommandInteraction['reply']>[0] | void);
    defaultAccess: ({
        directSupport: true;
        direct: CommandDirectAccess;
    } | {
        directSupport: false;
    }) & ({
        guildSupport: true;
        guild: CommandGuildAccess;
    } | {
        guildSupport: false;
    });
}
export declare enum CommandGuildAccess {
    Everyone = 0,
    WithRole = 1,
    WithHigherRole = 2,
    Administrator = 3,
    GuildOwner = 4,
    BotOwner = 5
}
export declare enum CommandDirectAccess {
    Everyone = 0,
    BotOwner = 1
}
export declare class CommandManager extends BaseArrayManager<Command> {
    constructor(module: Module);
    get commandGuildTable(): import("..").TableQueryBuilder;
    get commandGuildAccessTable(): import("..").TableQueryBuilder;
    get commandDirectTable(): import("..").TableQueryBuilder;
    get commandDirectAccessTable(): import("..").TableQueryBuilder;
    readonly module: Module;
    private _logger?;
    get logger(): ScopedLogger;
    add(...entries: Array<Command>): void;
    getCommand(name: string): Command | undefined;
    setGuildAccess(name: string, guildId: string, access: CommandGuildAccess): Promise<void>;
    getGuildAccess(name: string, guildId: string): Promise<CommandGuildAccess>;
    resetGuildAccess(name: string, guildId: string): Promise<void>;
    setDirectAccess(name: string, access: CommandDirectAccess): Promise<void>;
    getDirectAccess(name: string): Promise<any>;
    resetDirectAccess(name: string): Promise<void>;
    enableGuild(name: string, guildId: string): Promise<void>;
    disableGuild(name: string, guildId: string): Promise<void>;
    isGuildEnabled(name: string, guildId: string): Promise<boolean>;
    enableDirect(name: string): Promise<void>;
    disableDirect(name: string): Promise<void>;
    isDirectEnabled(name: string): Promise<boolean>;
}
export declare const getCommandOptionFootprint: (data: Discord.ApplicationCommandOption | Discord.ApplicationCommandOptionData, footprint?: string) => string;
export declare const getCommandFootprint: (data: Discord.ApplicationCommand | Command['data'], footprint?: string) => string;
export declare class CommandRunner extends BaseClass {
    constructor(moduleManager: ModuleManager);
    readonly logger: ScopedLogger;
    readonly moduleManager: ModuleManager;
    readonly timeouts: {
        [key: string]: number;
    };
    readonly commandList: {
        [key: string]: {
            module: Module;
            command: Command;
        };
    };
    getTimeout(userId: string): number;
    setTimeout(userId: string, time: number): void;
    publishCommands(entryList: {
        [key: string]: {
            module: Module;
            command: Command;
        };
    }, application: Discord.ClientApplication): Promise<void>;
    init(): Promise<void>;
    checkPerms(interaction: Discord.Interaction, application: Discord.ClientApplication, command: Command, module: Module, user: Discord.User): Promise<void>;
    run(interaction: Discord.Interaction): Promise<void>;
}
