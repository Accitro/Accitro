"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandRunner = exports.CommandError = exports.getCommandFootprint = exports.getCommandOptionFootprint = exports.CommandManager = exports.CommandDirectAccess = exports.CommandGuildAccess = void 0;
const tslib_1 = require("tslib");
const discord_js_1 = tslib_1.__importDefault(require("discord.js"));
const base_1 = require("./base");
var CommandGuildAccess;
(function (CommandGuildAccess) {
    CommandGuildAccess[CommandGuildAccess["Everyone"] = 0] = "Everyone";
    CommandGuildAccess[CommandGuildAccess["WithRole"] = 1] = "WithRole";
    CommandGuildAccess[CommandGuildAccess["WithHigherRole"] = 2] = "WithHigherRole";
    CommandGuildAccess[CommandGuildAccess["Administrator"] = 3] = "Administrator";
    CommandGuildAccess[CommandGuildAccess["GuildOwner"] = 4] = "GuildOwner";
    CommandGuildAccess[CommandGuildAccess["BotOwner"] = 5] = "BotOwner";
})(CommandGuildAccess = exports.CommandGuildAccess || (exports.CommandGuildAccess = {}));
var CommandDirectAccess;
(function (CommandDirectAccess) {
    CommandDirectAccess[CommandDirectAccess["Everyone"] = 0] = "Everyone";
    CommandDirectAccess[CommandDirectAccess["BotOwner"] = 1] = "BotOwner";
})(CommandDirectAccess = exports.CommandDirectAccess || (exports.CommandDirectAccess = {}));
class CommandManager extends base_1.BaseArrayManager {
    constructor(module) {
        super(module.client);
        this.module = module;
    }
    get commandGuildTable() {
        return this.database.getTableManager('commandGuild');
    }
    get commandGuildAccessTable() {
        return this.database.getTableManager('commandGuildAccess');
    }
    get commandDirectTable() {
        return this.database.getTableManager('commandDirect');
    }
    get commandDirectAccessTable() {
        return this.database.getTableManager('commandDirectAccess');
    }
    module;
    _logger;
    get logger() {
        if (!this._logger) {
            this._logger = this.module.logger.newScope(`Module: ${this.module.name} / Command Manager`);
        }
        return this._logger;
    }
    add(...entries) {
        this.entries.push(...entries);
        for (const entry of entries) {
            this.logger.log(`Register command: ${entry.data.name}`);
        }
    }
    getCommand(name) {
        return this.entries.find((command) => command.data.name === name);
    }
    async setGuildAccess(name, guildId, access) {
        const command = this.getCommand(name);
        if (!command) {
            throw new Error(`Command missing: ${name}.`);
        }
        else if (!command.defaultAccess.guildSupport) {
            throw new Error(`Command "${name}" does not work on guild.`);
        }
        const { commandGuildAccessTable } = this;
        if (await commandGuildAccessTable.has({ name, guildId })) {
            await commandGuildAccessTable.alter({ name, guildId }, { access });
        }
        else {
            await commandGuildAccessTable.insert({ name, guildId, access });
        }
    }
    async getGuildAccess(name, guildId) {
        const command = this.getCommand(name);
        if (!command) {
            throw new Error(`Command missing: ${name}`);
        }
        else if (!command.defaultAccess.guildSupport) {
            throw new Error(`Command "${name}" does not work on guild.`);
        }
        const result = await this.commandGuildAccessTable.select({ name, guildId }).first();
        return result
            ? result.access
            : command.defaultAccess.guild;
    }
    async resetGuildAccess(name, guildId) {
        const command = this.getCommand(name);
        if (!command) {
            throw new Error(`Command missing: ${name}`);
        }
        else if (!command.defaultAccess.guildSupport) {
            throw new Error(`Command "${name}" does not work on guild.`);
        }
        await this.commandGuildAccessTable.drop({ name, guildId });
    }
    async setDirectAccess(name, access) {
        const command = this.getCommand(name);
        if (!command) {
            throw new Error(`Command missing: ${name}`);
        }
        else if (!command.defaultAccess.directSupport) {
            throw new Error(`Command "${name}" does not work on direct.`);
        }
        const { commandDirectAccessTable } = this;
        if (await commandDirectAccessTable.has({ name })) {
            await commandDirectAccessTable.alter({ name }, { access });
        }
        else {
            await commandDirectAccessTable.insert({ name, access });
        }
    }
    async getDirectAccess(name) {
        const command = this.getCommand(name);
        if (!command) {
            throw new Error(`Command missing: ${name}`);
        }
        else if (!command.defaultAccess.directSupport) {
            throw new Error(`Command "${name}" does not work on direct.`);
        }
        const result = await this.commandDirectAccessTable.select({ name }).first();
        return result
            ? result.access
            : command.defaultAccess.direct;
    }
    async resetDirectAccess(name) {
        const command = this.getCommand(name);
        if (!command) {
            throw new Error(`Command missing: ${name}`);
        }
        else if (!command.defaultAccess.directSupport) {
            throw new Error(`Command "${name}" does not work on direct.`);
        }
        await this.commandDirectAccessTable.drop({ name });
    }
    async enableGuild(name, guildId) {
        const command = this.getCommand(name);
        if (!command) {
            throw new Error(`Command missing: ${name}`);
        }
        else if (!command.defaultAccess.guildSupport) {
            throw new Error(`Command "${name}" does not work on guild.`);
        }
        const { commandGuildTable } = this;
        const isEnabled = true;
        if (await commandGuildTable.has({ name, guildId })) {
            await commandGuildTable.alter({ name, guildId }, { isEnabled });
        }
        else {
            await commandGuildTable.drop({ name, guildId });
        }
    }
    async disableGuild(name, guildId) {
        const command = this.getCommand(name);
        if (!command) {
            throw new Error(`Command missing: ${name}`);
        }
        else if (!command.defaultAccess.guildSupport) {
            throw new Error(`Command "${name}" does not work on guild.`);
        }
        const { commandGuildTable } = this;
        const isEnabled = false;
        if (await commandGuildTable.has({ name, guildId })) {
            await commandGuildTable.alter({ name, guildId }, { isEnabled });
        }
        else {
            await commandGuildTable.drop({ name, guildId });
        }
    }
    async isGuildEnabled(name, guildId) {
        const command = this.getCommand(name);
        if (!command) {
            throw new Error(`Command missing: ${name}`);
        }
        else if (!command.defaultAccess.guildSupport) {
            throw new Error(`Command "${name}" does not work on guild.`);
        }
        const result = await this.commandGuildTable.select({ name, guildId }).first();
        return result ? !!result.isEnabled : true;
    }
    async enableDirect(name) {
        const command = this.getCommand(name);
        if (!command) {
            throw new Error(`Command missing: ${name}`);
        }
        else if (!command.defaultAccess.directSupport) {
            throw new Error(`Command "${name}" does not work on direct.`);
        }
        const { commandDirectTable } = this;
        const isEnabled = true;
        if (await commandDirectTable.has({ name })) {
            await commandDirectTable.alter({ name }, { isEnabled });
        }
        else {
            await commandDirectTable.insert({ name, isEnabled });
        }
    }
    async disableDirect(name) {
        const command = this.getCommand(name);
        if (!command) {
            throw new Error(`Command missing: ${name}`);
        }
        else if (!command.defaultAccess.directSupport) {
            throw new Error(`Command "${name}" does not work on direct.`);
        }
        const { commandDirectTable } = this;
        const isEnabled = false;
        if (await commandDirectTable.has({ name })) {
            await commandDirectTable.alter({ name }, { isEnabled });
        }
        else {
            await commandDirectTable.insert({ name, isEnabled });
        }
    }
    async isDirectEnabled(name) {
        const command = this.getCommand(name);
        if (!command) {
            throw new Error(`Command missing: ${name}`);
        }
        else if (!command.defaultAccess.directSupport) {
            throw new Error(`Command "${name}" does not work on guild.`);
        }
        const result = await this.commandDirectTable.select({ name }).first();
        return result ? !!result.isEnabled : true;
    }
}
exports.CommandManager = CommandManager;
const getCommandOptionFootprint = (data, footprint = '') => {
    footprint += data.name;
    footprint += data.description;
    footprint += data.type;
    return footprint;
};
exports.getCommandOptionFootprint = getCommandOptionFootprint;
const getCommandFootprint = (data, footprint = '') => {
    footprint += data.name;
    footprint += data.description;
    footprint += data.type || 'CHAT_INPUT';
    for (const option of data.options || []) {
        footprint += (0, exports.getCommandFootprint)(option, footprint);
    }
    return footprint;
};
exports.getCommandFootprint = getCommandFootprint;
class CommandError extends Error {
    constructor(message) {
        const { errorMessage, errorStack } = message instanceof Error
            ? { errorMessage: message.message, errorStack: message.stack }
            : { errorMessage: message, errorStack: undefined };
        super(errorMessage);
        this.name = 'Command Error';
        this.stack = errorStack || this.stack;
    }
}
exports.CommandError = CommandError;
class CommandRunner extends base_1.BaseClass {
    constructor(moduleManager) {
        super(moduleManager.client);
        this.logger = moduleManager.logger.newScope('CommandRunner');
        this.moduleManager = moduleManager;
        this.timeouts = {};
        this.commandList = {};
    }
    logger;
    moduleManager;
    timeouts;
    commandList;
    getTimeout(userId) {
        return this.timeouts[userId] || 0;
    }
    setTimeout(userId, time) {
        this.timeouts[userId] = time;
    }
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
                const remoteFootprint = (0, exports.getCommandFootprint)(remote);
                const localFootprint = (0, exports.getCommandFootprint)(local.command.data);
                if (remoteFootprint !== localFootprint) {
                    await application.commands.edit(remote.id, local.command.data);
                    logger.log(`Update chat input interaction command "${remote.name}" on Discord.`);
                }
            }
        }
    }
    async init() {
        const { commandList, client } = this;
        const application = await this.client.getApplication();
        if (!application) {
            throw new Error('Discord application not available');
        }
        await Promise.all(this.moduleManager.entries.map(async (module) => {
            const { commands } = module;
            await Promise.all(commands.entries.map(async (command) => {
                if (command.data.name in commandList) {
                    throw new Error(`Command name ambiguity detected: ${command.data.name}`);
                }
                commandList[command.data.name] = { module, command };
            }));
        }));
        await this.publishCommands(commandList, application);
        client.on('interaction', (interaction) => this.run(interaction));
    }
    async checkPerms(interaction, application, command, module, user) {
        const { client } = this;
        const { guildId } = interaction;
        if (guildId) {
            if (!await module.commands.isGuildEnabled(command.data.name, guildId)) {
                throw new CommandError('Command is disabled on guilds.');
            }
            const guild = client.discordClient.guilds.cache.get(guildId);
            if (!guild) {
                throw new CommandError('Cannot fetch guild.');
            }
            const member = guild.members.cache.get(user.id);
            if (!member) {
                throw new CommandError('Cannot fetch member.');
            }
            const meMember = guild.me;
            if (!meMember) {
                throw new CommandError('Cannot fetch bot member.');
            }
            const guildAccess = await module.commands.getGuildAccess(command.data.name, guildId);
            if (guildAccess <= CommandGuildAccess.BotOwner) {
                if (application.owner instanceof discord_js_1.default.Team) {
                    if (!application.owner.members.find((teamMember) => teamMember.id === member.id)) {
                        if (guildAccess === CommandGuildAccess.BotOwner) {
                            throw new CommandError('User must be one of the bot owners.');
                        }
                    }
                    else {
                        return;
                    }
                }
                else if (application.owner instanceof discord_js_1.default.User) {
                    if (application.owner.id !== member.id) {
                        if (guildAccess === CommandGuildAccess.BotOwner) {
                            throw new CommandError('User must be the bot owner.');
                        }
                    }
                    else {
                        return;
                    }
                }
                else {
                    if (guildAccess >= CommandGuildAccess.BotOwner) {
                        throw new CommandError('Cannot fetch discord application.');
                    }
                }
            }
            if (guildAccess <= CommandGuildAccess.GuildOwner) {
                if (guild.ownerId !== member.id) {
                    if (guildAccess >= CommandGuildAccess.GuildOwner) {
                        throw new CommandError('User must be the guild owner.');
                    }
                }
                else {
                    return;
                }
            }
            if (guildAccess <= CommandGuildAccess.Administrator) {
                if (!member.permissions.has('ADMINISTRATOR')) {
                    if (guildAccess >= CommandGuildAccess.Administrator) {
                        throw new CommandError('User must be an administrator.');
                    }
                }
                else {
                    return;
                }
            }
            if (guildAccess <= CommandGuildAccess.WithHigherRole) {
                if (member.roles.highest.position < meMember.roles.highest.position) {
                    if (guildAccess >= CommandGuildAccess.WithHigherRole) {
                        throw new CommandError('User must have at least one role that is higher than the bot role.');
                    }
                }
                else {
                    return;
                }
            }
            if (guildAccess <= CommandGuildAccess.WithRole) {
                if (member.roles.highest.id === guild.id) {
                    if (guildAccess >= CommandGuildAccess.WithRole) {
                        throw new CommandError('User must have at least one role.');
                    }
                }
            }
        }
        else {
            if (!await module.commands.isDirectEnabled(command.data.name)) {
                throw new CommandError('Command is disabled on direct.');
            }
            const directAccess = await module.commands.getDirectAccess(command.data.name);
            if (directAccess <= CommandDirectAccess.BotOwner) {
                if (application.owner instanceof discord_js_1.default.Team) {
                    if (!application.owner.members.find((teamMember) => teamMember.id === user.id)) {
                        if (directAccess >= CommandDirectAccess.BotOwner) {
                            throw new CommandError('User must be one of the bot owners.');
                        }
                    }
                }
                else if (application.owner instanceof discord_js_1.default.User) {
                    if (application.owner.id !== user.id) {
                        if (directAccess >= CommandDirectAccess.BotOwner) {
                            throw new CommandError('User must be the bot owner.');
                        }
                    }
                }
                else {
                    if (directAccess >= CommandDirectAccess.BotOwner) {
                        throw new CommandError('Cannot fetch discord application.');
                    }
                }
            }
        }
    }
    async run(interaction) {
        const { commandList, client, logger } = this;
        const application = await client.getApplication();
        if (!application) {
            throw new Error('Discord application not available');
        }
        else if (!interaction.isCommand()) {
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
            const { command, module } = commandList[interaction.commandName] || {};
            const user = interaction.user;
            const me = client.discordClient.user;
            logger.log(`User ${user.id} invoked /${command.data.name} command.`);
            if (!(command && module)) {
                throw new Error('Cannot fetch command.');
            }
            else if (!await module.isEnabled(guildId)) {
                throw new Error('Module is disabled.');
            }
            else if (!me) {
                throw new Error('Cannot fetch bot user.');
            }
            try {
                await this.checkPerms(interaction, application, command, module, user);
            }
            catch (error) {
                logger.log(`User ${user.id} did not have enough permission to run /${command.data.name} command.`);
                throw error;
            }
            try {
                return await command.run(module.commands.logger.newScope(`Module: ${module.name} / Command: ${command.data.name}`), interaction);
            }
            catch (error) {
                logger.log(`An error occured when user ${user.id} invoked /${command.data.name} command.`);
                throw error;
            }
        };
        const result = await (async () => {
            try {
                return await run();
            }
            catch (error) {
                this.logger.error(error);
                return {
                    ephemeral: true,
                    embeds: [
                        {
                            title: `Fatal: ${error.name}`,
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
        })();
        result && await respond(result).catch((error) => this.logger.error(error));
    }
}
exports.CommandRunner = CommandRunner;
