"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildMember = exports.User = exports.Guild = void 0;
const base_1 = require("../core/base");
const manager_1 = require("./manager");
class Guild extends base_1.BaseClass {
    constructor(client, discordGuild) {
        super(client);
        this.discordGuild = discordGuild;
        this.config = new manager_1.GuildConfigManager(this, []);
    }
    discordGuild;
    config;
}
exports.Guild = Guild;
class User extends base_1.BaseClass {
    constructor(client, discordUser) {
        super(client);
        this.discordUser = discordUser;
        this.config = new manager_1.UserConfigManager(this, []);
    }
    discordUser;
    config;
}
exports.User = User;
class GuildMember extends base_1.BaseClass {
    constructor(client, discordGuildMember) {
        super(client);
        this.discordGuildMember = discordGuildMember;
        this.config = new manager_1.GuildMemberConfigManager(this, []);
    }
    discordGuildMember;
    config;
}
exports.GuildMember = GuildMember;
