"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildMemberConfigManager = exports.UserConfigManager = exports.GuildConfigManager = exports.DataManager = exports.BaseConfigManager = exports.GlobalConfigManager = exports.BaseManager = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const data_1 = require("./data");
class BaseManager {
    constructor(client) {
        this.client = client;
        this.database = client.database;
    }
    client;
    database;
}
exports.BaseManager = BaseManager;
class GlobalConfigManager extends BaseManager {
    constructor(client, context) {
        super(client);
        this.context = context;
    }
    context;
    get globalConfigTable() {
        return this.database.getTableManager('globalConfig');
    }
    newContext(context) {
        return new GlobalConfigManager(this.client, [...this.context, ...context]);
    }
    async getKey(name) {
        return path_1.default.join(...this.context, name);
    }
    async get(name, defaultValue) {
        const { globalConfigTable } = this;
        const key = this.getKey(name);
        const result = await globalConfigTable.select({ key }).first();
        return result
            ? JSON.parse(result.value)
            : defaultValue !== undefined
                ? await (async (value) => {
                    await globalConfigTable.insert({ key, value: JSON.stringify(value) });
                    return value;
                })(typeof (defaultValue) === 'function' ? await defaultValue() : defaultValue)
                : undefined;
    }
    async set(name, value) {
        const { globalConfigTable } = this;
        const key = this.getKey(name);
        if (await globalConfigTable.has({ key })) {
            await globalConfigTable.alter({ key }, { value: JSON.stringify(value) });
        }
        else {
            await globalConfigTable.insert({ key, value: JSON.stringify(value) });
        }
    }
    async has(name) {
        return await this.globalConfigTable.has({ key: this.getKey(name) });
    }
    async unset(name) {
        await this.globalConfigTable.drop({ key: this.getKey(name) });
    }
}
exports.GlobalConfigManager = GlobalConfigManager;
class BaseConfigManager extends BaseManager {
    constructor(client, type, id, context) {
        super(client);
        this.type = type;
        this.id = id;
        this.context = context;
    }
    type;
    id;
    context;
    get guildConfigTable() {
        return this.database.getTableManager('guildConfig');
    }
    get userConfigTable() {
        return this.database.getTableManager('userConfig');
    }
    get configTable() {
        return this.type === 'guild' ? this.guildConfigTable : this.userConfigTable;
    }
    newContext(context) {
        return new BaseConfigManager(this.client, this.type, this.id, [...this.context, ...context]);
    }
    async getKey(name) {
        return path_1.default.join(...this.context, name);
    }
    async get(name, defaultValue) {
        const { configTable, id } = this;
        const key = this.getKey(name);
        const result = await configTable.select({ id, key }).first();
        return result
            ? JSON.parse(result.value)
            : defaultValue !== undefined
                ? await (async (value) => {
                    await configTable.insert({ id, key, value: JSON.stringify(value) });
                    return value;
                })(typeof (defaultValue) === 'function' ? await defaultValue() : defaultValue)
                : undefined;
    }
    async set(name, value) {
        const { configTable, id } = this;
        const key = this.getKey(name);
        if (await configTable.has({ id, key })) {
            await configTable.alter({ id, key }, { value: JSON.stringify(value) });
        }
        else {
            await configTable.insert({ id, key, value: JSON.stringify(value) });
        }
    }
    async has(name) {
        const { configTable, id } = this;
        const key = this.getKey(name);
        return await configTable.has({ id, key });
    }
    async unset(name) {
        const { configTable, id } = this;
        const key = this.getKey(name);
        await configTable.drop({ id, key });
    }
}
exports.BaseConfigManager = BaseConfigManager;
class DataManager extends BaseManager {
    get(guild) {
        return new data_1.Guild(this.client, guild);
    }
}
exports.DataManager = DataManager;
class GuildConfigManager extends BaseConfigManager {
    constructor(guild, context) {
        super(guild.client, 'guild', guild.discordGuild.id, context);
        this.guild = guild;
    }
    newContext(context) {
        return new GuildConfigManager(this.guild, [...this.context, ...context]);
    }
    guild;
}
exports.GuildConfigManager = GuildConfigManager;
class UserConfigManager extends BaseConfigManager {
    constructor(user, context) {
        super(user.client, 'user', user.discordUser.id, context);
        this.user = user;
    }
    newContext(context) {
        return new UserConfigManager(this.user, [...this.context, ...context]);
    }
    user;
}
exports.UserConfigManager = UserConfigManager;
class GuildMemberConfigManager extends BaseConfigManager {
    constructor(guildMember, context) {
        super(guildMember.client, 'guild', guildMember.discordGuildMember.guild.id, [`member/${guildMember.discordGuildMember.id}`, ...context]);
        this.guildMember = guildMember;
    }
    guildMember;
}
exports.GuildMemberConfigManager = GuildMemberConfigManager;
