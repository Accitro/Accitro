"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildMemberConfigManager = exports.UserConfigManager = exports.GuildConfigManager = exports.DataManager = exports.BaseConfigManager = exports.BaseManager = void 0;
var tslib_1 = require("tslib");
var path_1 = (0, tslib_1.__importDefault)(require("path"));
var data_1 = require("./data");
var BaseManager = /** @class */ (function () {
    function BaseManager(client) {
        this.client = client;
        this.database = client.database;
    }
    return BaseManager;
}());
exports.BaseManager = BaseManager;
var BaseConfigManager = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(BaseConfigManager, _super);
    function BaseConfigManager(client, type, id, context) {
        var _this = _super.call(this, client) || this;
        _this.type = type;
        _this.id = id;
        _this.context = context;
        return _this;
    }
    Object.defineProperty(BaseConfigManager.prototype, "guildConfigTable", {
        get: function () {
            return this.database.getTableManager('guildConfig');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseConfigManager.prototype, "userConfigTable", {
        get: function () {
            return this.database.getTableManager('userConfig');
        },
        enumerable: false,
        configurable: true
    });
    BaseConfigManager.prototype.newContext = function (context) {
        return new BaseConfigManager(this.client, this.type, this.id, (0, tslib_1.__spreadArray)((0, tslib_1.__spreadArray)([], (0, tslib_1.__read)(this.context), false), (0, tslib_1.__read)(context), false));
    };
    BaseConfigManager.prototype.getKey = function (name) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            return (0, tslib_1.__generator)(this, function (_a) {
                return [2 /*return*/, path_1.default.join.apply(path_1.default, (0, tslib_1.__spreadArray)((0, tslib_1.__spreadArray)([], (0, tslib_1.__read)(this.context), false), [name], false))];
            });
        });
    };
    Object.defineProperty(BaseConfigManager.prototype, "configTable", {
        get: function () {
            return this.type === 'guild' ? this.guildConfigTable : this.userConfigTable;
        },
        enumerable: false,
        configurable: true
    });
    BaseConfigManager.prototype.get = function (name, defaultValue) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var _a, configTable, id, key, result, _b, _c, _d, _e;
            var _this = this;
            return (0, tslib_1.__generator)(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = this, configTable = _a.configTable, id = _a.id;
                        key = this.getKey(name);
                        return [4 /*yield*/, configTable.select({ id: id, key: key }).first()];
                    case 1:
                        result = _f.sent();
                        if (!result) return [3 /*break*/, 2];
                        _b = JSON.parse(result.value);
                        return [3 /*break*/, 9];
                    case 2:
                        if (!(defaultValue !== undefined)) return [3 /*break*/, 7];
                        _d = (function (value) { return (0, tslib_1.__awaiter)(_this, void 0, void 0, function () {
                            return (0, tslib_1.__generator)(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, configTable.insert({ id: id, key: key, value: JSON.stringify(value) })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/, value];
                                }
                            });
                        }); });
                        if (!(typeof (defaultValue) === 'function')) return [3 /*break*/, 4];
                        return [4 /*yield*/, defaultValue()];
                    case 3:
                        _e = _f.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        _e = defaultValue;
                        _f.label = 5;
                    case 5: return [4 /*yield*/, _d.apply(void 0, [_e])];
                    case 6:
                        _c = _f.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        _c = undefined;
                        _f.label = 8;
                    case 8:
                        _b = _c;
                        _f.label = 9;
                    case 9: return [2 /*return*/, _b];
                }
            });
        });
    };
    BaseConfigManager.prototype.set = function (name, value) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var _a, configTable, id, key;
            return (0, tslib_1.__generator)(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, configTable = _a.configTable, id = _a.id;
                        key = this.getKey(name);
                        return [4 /*yield*/, configTable.has({ id: id, key: key })];
                    case 1:
                        if (!_b.sent()) return [3 /*break*/, 3];
                        return [4 /*yield*/, configTable.alter({ id: id, key: key }, { value: JSON.stringify(value) })];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, configTable.insert({ id: id, key: key, value: JSON.stringify(value) })];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    BaseConfigManager.prototype.has = function (name) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var _a, configTable, id, key;
            return (0, tslib_1.__generator)(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, configTable = _a.configTable, id = _a.id;
                        key = this.getKey(name);
                        return [4 /*yield*/, configTable.has({ id: id, key: key })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    BaseConfigManager.prototype.unset = function (name) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var _a, configTable, id, key;
            return (0, tslib_1.__generator)(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this, configTable = _a.configTable, id = _a.id;
                        key = this.getKey(name);
                        return [4 /*yield*/, configTable.drop({ id: id, key: key })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return BaseConfigManager;
}(BaseManager));
exports.BaseConfigManager = BaseConfigManager;
var DataManager = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(DataManager, _super);
    function DataManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataManager.prototype.get = function (guild) {
        return new data_1.Guild(this.client, guild);
    };
    return DataManager;
}(BaseManager));
exports.DataManager = DataManager;
var GuildConfigManager = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(GuildConfigManager, _super);
    function GuildConfigManager(guild, context) {
        var _this = _super.call(this, guild.client, 'guild', guild.discordGuild.id, context) || this;
        _this.guild = guild;
        return _this;
    }
    return GuildConfigManager;
}(BaseConfigManager));
exports.GuildConfigManager = GuildConfigManager;
var UserConfigManager = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(UserConfigManager, _super);
    function UserConfigManager(user, context) {
        var _this = _super.call(this, user.client, 'user', user.discordUser.id, context) || this;
        _this.user = user;
        return _this;
    }
    return UserConfigManager;
}(BaseConfigManager));
exports.UserConfigManager = UserConfigManager;
var GuildMemberConfigManager = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(GuildMemberConfigManager, _super);
    function GuildMemberConfigManager(guildMember, context) {
        var _this = _super.call(this, guildMember.client, 'guild', guildMember.discordGuildMember.guild.id, (0, tslib_1.__spreadArray)(["member/".concat(guildMember.discordGuildMember.id)], (0, tslib_1.__read)(context), false)) || this;
        _this.guildMember = guildMember;
        return _this;
    }
    return GuildMemberConfigManager;
}(BaseConfigManager));
exports.GuildMemberConfigManager = GuildMemberConfigManager;
