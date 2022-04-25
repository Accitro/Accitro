"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const manager_1 = require("../resource/manager");
const data_1 = require("../resource/data");
const query_builder_1 = require("../database/query-builder");
const events_1 = require("./events");
const logger_1 = require("./logger");
const module_1 = require("./module");
class Client {
    static defaultOptions = {};
    constructor(client, databaseCredentials, options) {
        this.options = { ...Client.defaultOptions, ...options };
        this.discordClient = client;
        this.events = new events_1.EventEmitter(this);
        this.on = this.events.on.bind(this.events);
        this.once = this.events.once.bind(this.events);
        this.database = new query_builder_1.QueryBuilder(this, databaseCredentials, this.options.knex);
        this.logger = new logger_1.ScopedLogger(new logger_1.Logger(this), 'main');
        this.modules = new module_1.ModuleManager(this);
        this.config = new manager_1.GlobalConfigManager(this, []);
    }
    options;
    discordClient;
    database;
    events;
    on;
    once;
    logger;
    modules;
    config;
    _application;
    async getApplication() {
        if (this._application === undefined) {
            this._application = await this.discordClient.application?.fetch() || null;
        }
        return this._application;
    }
    getGuild(guildResolvable) {
        const { discordClient: { guilds: { cache: discordGuilds } } } = this;
        const discordGuild = (() => {
            if (typeof (guildResolvable) !== 'string') {
                return guildResolvable;
            }
            return discordGuilds.get(guildResolvable);
        })();
        if (!discordGuild) {
            throw new Error(`Could not find guild #${guildResolvable}`);
        }
        return new data_1.Guild(this, discordGuild);
    }
    getUser(userResolvable) {
        const { discordClient: { users: { cache: discordUsers } } } = this;
        const discordUser = (() => {
            if (typeof (userResolvable) !== 'string') {
                return userResolvable;
            }
            return discordUsers.get(userResolvable);
        })();
        if (!discordUser) {
            throw new Error(`Could not find user #${userResolvable}`);
        }
        return new data_1.User(this, discordUser);
    }
    getGuildMember(guildMemberResolvable) {
        const { discordClient: { guilds: { cache: discordGuilds } } } = this;
        const discordGuildMember = (() => {
            if (!Array.isArray(guildMemberResolvable)) {
                return guildMemberResolvable;
            }
            return discordGuilds.get(guildMemberResolvable[0])
                ?.members.cache.get(guildMemberResolvable[1]);
        })();
        if (!discordGuildMember) {
            throw new Error(`Could not find guild member #${guildMemberResolvable}`);
        }
        return new data_1.GuildMember(this, discordGuildMember);
    }
}
exports.Client = Client;
