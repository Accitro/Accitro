/// <reference types="node" />
import Discord from 'discord.js';
import Crypto from 'crypto';
import { Module } from './module';
import { BaseArrayManager } from './base';
import { ScopedLogger } from './logger';
export interface Command {
    data: Discord.ChatInputApplicationCommandData;
    run: (logger: ScopedLogger, interaction: Discord.CommandInteraction) => (Promise<Parameters<Discord.CommandInteraction['reply']>[0]> | Parameters<Discord.CommandInteraction['reply']>[0]);
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
    readonly logger: ScopedLogger;
    push(...items: Command[]): number;
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
export declare const getCommandOptionFootprint: (data: Discord.ApplicationCommandOption | Discord.ApplicationCommandOptionData, footprint: Crypto.Hash) => Crypto.Hash;
export declare const getCommandFootprint: (data: Discord.ApplicationCommand | Command['data'], footprint?: Crypto.Hash) => Crypto.Hash;
