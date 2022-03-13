"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleManager = exports.Module = void 0;
const tslib_1 = require("tslib");
const discord_js_1 = tslib_1.__importDefault(require("discord.js"));
const base_1 = require("./base");
const command_1 = require("./command");
class Module extends base_1.BaseClass {
    constructor(manager) {
        super(manager.client);
        this.moduleManager = manager;
        this.commands = new command_1.CommandManager(this);
        this.eventListeners = {};
    }
    moduleManager;
    _logger;
    get logger() {
        if (!this._logger) {
            this._logger = this.moduleManager.logger.newScope(`Module: ${this.name}`);
        }
        return this._logger;
    }
    commands;
    eventListeners;
    enable() {
        return this.moduleManager.enable(this.name);
    }
    disable() {
        return this.moduleManager.disable(this.name);
    }
    isEnabled(guildId) {
        return this.moduleManager.isEnabled(this.name, guildId);
    }
    setGuildOverride(guildId, isEnabled) {
        return this.moduleManager.setGuildOverride(this.name, guildId, isEnabled);
    }
    unsetGuildOverride(guildId) {
        return this.moduleManager.unsetGuildOverride(this.name, guildId);
    }
}
exports.Module = Module;
class ModuleManager extends base_1.BaseArrayManager {
    static bindEventEmitter(modules, eventEmitter) {
        const oldEmit = eventEmitter.emit;
        const newEmit = (async (name, ...args) => {
            for (const module of modules.entries) {
                const listener = module.eventListeners[name];
                if (listener) {
                    await listener.call(module, ...args);
                }
            }
        });
        eventEmitter.emit = (async (...args) => {
            await oldEmit.call(eventEmitter, ...args);
            await newEmit.call(modules, ...args);
        });
    }
    constructor(client) {
        super(client);
        this.logger = client.logger.newScope('Module Manager');
        ModuleManager.bindEventEmitter(this, client.events);
        client.on('ready', () => this.init());
    }
    get moduleTable() {
        return this.database.getTableManager('module');
    }
    get moduleGuildOverrideTable() {
        return this.database.getTableManager('moduleGuildOverride');
    }
    logger;
    async publishCommands(entryList, application) {
        const { logger } = this;
        const commandMap = {};
        for (const entryKey in entryList) {
            const { command, module } = entryList[entryKey];
            if (!(command.data.name in commandMap)) {
                commandMap[command.data.name] = {};
            }
            commandMap[command.data.name].local = { command, module };
        }
        for (const [, command] of await application.commands.fetch()) {
            if (!(command.name in commandMap)) {
                commandMap[command.name] = {};
            }
            if (command.type === 'CHAT_INPUT') {
                commandMap[command.name].remote = command;
            }
        }
        for (const mapKey in commandMap) {
            const { local, remote } = commandMap[mapKey];
            if (local && (!remote)) {
                await application.commands.create(local.command.data);
                logger.log(`Set chat input interaction command "${local.command.data.name}" to Discord.`);
            }
            else if (remote && (!local)) {
                await application.commands.delete(remote.id);
                logger.log(`Delete chat input interaction command "${remote.name}" from Discord.`);
            }
            else if (remote && local) {
                const remoteFootprint = (0, command_1.getCommandFootprint)(remote);
                const localFootprint = (0, command_1.getCommandFootprint)(local.command.data);
                if (remoteFootprint !== localFootprint) {
                    await application.commands.edit(remote.id, local.command.data);
                    logger.log(`Update chat input interaction command "${remote.name}" on Discord.`);
                }
            }
        }
    }
    async init() {
        const { client } = this;
        const application = await this.getApplication();
        if (!application) {
            throw new Error('Discord application not available');
        }
        const entryList = {};
        await Promise.all(this.entries.map(async (module) => {
            const { commands } = module;
            await Promise.all(commands.entries.map(async (command) => {
                if (command.data.name in entryList) {
                    throw new Error(`Command name ambiguity detected: ${command.data.name}`);
                }
                entryList[command.data.name] = { module, command };
            }));
        }));
        await this.publishCommands(entryList, application);
        client.on('interaction', async (interaction) => {
            if (!interaction.isCommand()) {
                return;
            }
            const respond = (data) => {
                if (interaction.replied || interaction.deferred) {
                    return interaction.editReply(data);
                }
                else {
                    return interaction.reply(data);
                }
            };
            const run = async () => {
                const guildId = interaction.guildId || undefined;
                const entry = entryList[interaction.commandName];
                if (!entry) {
                    throw new Error('Cannot fetch command.');
                }
                const user = interaction.user;
                const me = client.discordClient.user;
                const { command, module } = entry;
                if (!await module.isEnabled(guildId)) {
                    throw new Error('Module is disabled.');
                }
                else if (!me) {
                    throw new Error('Cannot fetch bot user.');
                }
                if (guildId) {
                    if (!await module.commands.isGuildEnabled(command.data.name, guildId)) {
                        throw new Error('Command is disabled on guilds.');
                    }
                    const guild = client.discordClient.guilds.cache.get(guildId);
                    if (!guild) {
                        throw new Error('Cannot fetch guild.');
                    }
                    const member = guild.members.cache.get(user.id);
                    if (!member) {
                        throw new Error('Cannot fetch member.');
                    }
                    const meMember = guild.me;
                    if (!meMember) {
                        throw new Error('Cannot fetch bot member.');
                    }
                    const guildAccess = await module.commands.getGuildAccess(command.data.name, guildId);
                    const checkPerms = () => {
                        if (guildAccess <= command_1.CommandGuildAccess.BotOwner) {
                            if (application.owner instanceof discord_js_1.default.Team) {
                                if (!application.owner.members.find((teamMember) => teamMember.id === member.id)) {
                                    if (guildAccess === command_1.CommandGuildAccess.BotOwner) {
                                        throw new Error('User must be one of the bot owners.');
                                    }
                                }
                                else {
                                    return;
                                }
                            }
                            else if (application.owner instanceof discord_js_1.default.User) {
                                if (application.owner.id !== member.id) {
                                    if (guildAccess === command_1.CommandGuildAccess.BotOwner) {
                                        throw new Error('User must be the bot owner.');
                                    }
                                }
                                else {
                                    return;
                                }
                            }
                            else {
                                if (guildAccess >= command_1.CommandGuildAccess.BotOwner) {
                                    throw new Error('Cannot fetch discord application.');
                                }
                            }
                        }
                        if (guildAccess <= command_1.CommandGuildAccess.GuildOwner) {
                            if (guild.ownerId !== member.id) {
                                if (guildAccess >= command_1.CommandGuildAccess.GuildOwner) {
                                    throw new Error('User must be the guild owner.');
                                }
                            }
                            else {
                                return;
                            }
                        }
                        if (guildAccess <= command_1.CommandGuildAccess.Administrator) {
                            if (!member.permissions.has('ADMINISTRATOR')) {
                                if (guildAccess >= command_1.CommandGuildAccess.Administrator) {
                                    throw new Error('User must be an administrator.');
                                }
                            }
                            else {
                                return;
                            }
                        }
                        if (guildAccess <= command_1.CommandGuildAccess.WithHigherRole) {
                            if (member.roles.highest.position < meMember.roles.highest.position) {
                                if (guildAccess >= command_1.CommandGuildAccess.WithHigherRole) {
                                    throw new Error('User must have at list one role that is higher than the bot role.');
                                }
                            }
                            else {
                                return;
                            }
                        }
                        if (guildAccess <= command_1.CommandGuildAccess.WithRole) {
                            if (member.roles.highest.id === guild.id) {
                                if (guildAccess >= command_1.CommandGuildAccess.WithRole) {
                                    throw new Error('User must have at least one role.');
                                }
                            }
                        }
                    };
                    checkPerms();
                }
                else {
                    if (!await module.commands.isDirectEnabled(command.data.name)) {
                        throw new Error('Command is disabled on direct.');
                    }
                    const directAccess = await module.commands.getDirectAccess(command.data.name);
                    const checkPerms = () => {
                        if (directAccess <= command_1.CommandDirectAccess.BotOwner) {
                            if (application.owner instanceof discord_js_1.default.Team) {
                                if (!application.owner.members.find((teamMember) => teamMember.id === user.id)) {
                                    if (directAccess >= command_1.CommandDirectAccess.BotOwner) {
                                        throw new Error('User must be one of the bot owners.');
                                    }
                                }
                            }
                            else if (application.owner instanceof discord_js_1.default.User) {
                                if (application.owner.id !== user.id) {
                                    if (directAccess >= command_1.CommandDirectAccess.BotOwner) {
                                        throw new Error('User must be the bot owner.');
                                    }
                                }
                            }
                            else {
                                if (directAccess >= command_1.CommandDirectAccess.BotOwner) {
                                    throw new Error('Cannot fetch discord application.');
                                }
                            }
                        }
                    };
                    checkPerms();
                }
                return await command.run(module.commands.logger.newScope(`Module: ${module.name} / Command: ${command.data.name}`), interaction);
            };
            let result;
            try {
                result = await run();
            }
            catch (error) {
                console.error(this.logger.error(error));
                result = {
                    ephemeral: true,
                    embeds: [
                        {
                            title: 'Fatal Error',
                            description: [
                                error.message,
                                '```plain',
                                ...error.stack.split('\n').slice(1),
                                '```'
                            ].join('\n')
                        }
                    ]
                };
            }
            if (result) {
                await respond(result).catch((error) => this.logger.error(error));
            }
        });
    }
    add(...entries) {
        this.entries.push(...entries);
        for (const entry of entries) {
            this.logger.log(`Register module: ${entry.name}`);
        }
    }
    _application;
    async getApplication() {
        if (this._application === undefined) {
            this._application = await this.client.discordClient.application?.fetch() || null;
        }
        return this._application;
    }
    async enable(name) {
        const { moduleTable } = this;
        const isEnabled = true;
        if (await moduleTable.has({ name })) {
            await moduleTable.alter({ name }, { isEnabled });
        }
        else {
            await moduleTable.insert({ name, isEnabled });
        }
    }
    async disable(name) {
        const { moduleTable } = this;
        const isEnabled = false;
        if (await moduleTable.has({ name })) {
            await moduleTable.alter({ name }, { isEnabled });
        }
        else {
            await moduleTable.insert({ name, isEnabled });
        }
    }
    async isEnabled(name, guildId) {
        if (guildId) {
            const result = await this.moduleGuildOverrideTable.select({ name }).first();
            if (result) {
                return !!result.enabled;
            }
        }
        const result = await this.moduleTable.select({ name }).first();
        return result ? !!result.enabled : true;
    }
    async setGuildOverride(name, guildId, isEnabled) {
        const { moduleGuildOverrideTable } = this;
        if (await moduleGuildOverrideTable.has({ name, guildId })) {
            await moduleGuildOverrideTable.alter({ name, guildId }, { isEnabled });
        }
        else {
            await moduleGuildOverrideTable.insert({ name, guildId, isEnabled });
        }
    }
    async unsetGuildOverride(name, guildId) {
        const { moduleGuildOverrideTable } = this;
        await moduleGuildOverrideTable.drop({ name, guildId });
    }
}
exports.ModuleManager = ModuleManager;
