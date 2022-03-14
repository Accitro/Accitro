"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleManager = exports.Module = void 0;
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
        this.commandRunner = new command_1.CommandRunner(this);
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
    commandRunner;
    async init() {
        await this.commandRunner.init();
    }
    add(...entries) {
        this.entries.push(...entries);
        for (const entry of entries) {
            this.logger.log(`Register module: ${entry.name}`);
        }
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
