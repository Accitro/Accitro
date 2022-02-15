"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildMember = exports.User = exports.Guild = void 0;
var tslib_1 = require("tslib");
var base_1 = require("../core/base");
var manager_1 = require("./manager");
var Guild = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(Guild, _super);
    function Guild(client, discordGuild) {
        var _this = _super.call(this, client) || this;
        _this.discordGuild = discordGuild;
        _this.config = new manager_1.GuildConfigManager(_this, []);
        return _this;
    }
    return Guild;
}(base_1.BaseClass));
exports.Guild = Guild;
var User = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(User, _super);
    function User(client, discordUser) {
        var _this = _super.call(this, client) || this;
        _this.discordUser = discordUser;
        _this.config = new manager_1.UserConfigManager(_this, []);
        return _this;
    }
    return User;
}(base_1.BaseClass));
exports.User = User;
var GuildMember = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(GuildMember, _super);
    function GuildMember(client, discordGuildMember) {
        var _this = _super.call(this, client) || this;
        _this.discordGuildMember = discordGuildMember;
        _this.config = new manager_1.GuildMemberConfigManager(_this, []);
        return _this;
    }
    return GuildMember;
}(base_1.BaseClass));
exports.GuildMember = GuildMember;
