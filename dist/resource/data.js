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
    getGuildMember(user) {
        const { discordGuild, discordGuild: { members: { cache: discordGuildMembers } }, client } = this;
        const { discordUser } = user;
        const discordGuildMember = discordGuildMembers.get(discordUser.id);
        if (!discordGuildMember) {
            throw new Error(`User ${discordUser.id} is not in guild ${discordGuild.id}`);
        }
        return new GuildMember(client, discordGuildMember, { user, guild: this });
    }
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
    getGuildMember(guild) {
        const { discordUser, client } = this;
        const { discordGuild, discordGuild: { members: { cache: discordGuildMembers } } } = guild;
        const discordGuildMember = discordGuildMembers.get(discordUser.id);
        if (!discordGuildMember) {
            throw new Error(`User ${discordUser.id} is not in guild ${discordGuild.id}`);
        }
        return new GuildMember(client, discordGuildMember, { user: this, guild });
    }
}
exports.User = User;
class GuildMember extends base_1.BaseClass {
    constructor(client, discordGuildMember, reuse) {
        super(client);
        this.discordGuildMember = discordGuildMember;
        this.config = new manager_1.GuildMemberConfigManager(this, []);
        this.user = reuse?.user || new User(client, discordGuildMember.user);
        this.guild = reuse?.guild || new Guild(client, discordGuildMember.guild);
    }
    discordGuildMember;
    config;
    user;
    guild;
}
exports.GuildMember = GuildMember;
