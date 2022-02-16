"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommandFootprint = exports.getCommandOptionFootprint = exports.CommandManager = exports.CommandDirectAccess = exports.CommandGuildAccess = void 0;
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
