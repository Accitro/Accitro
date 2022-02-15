"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommandFootprint = exports.getCommandOptionFootprint = exports.CommandManager = exports.CommandDirectAccess = exports.CommandGuildAccess = void 0;
var tslib_1 = require("tslib");
var crypto_1 = (0, tslib_1.__importDefault)(require("crypto"));
var base_1 = require("./base");
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
var CommandManager = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(CommandManager, _super);
    function CommandManager(module) {
        var _this = _super.call(this, module.client) || this;
        _this.module = module;
        _this.logger = module.logger.newScope("Module: ".concat(module.name, " / Command Manager"));
        return _this;
    }
    Object.defineProperty(CommandManager.prototype, "commandGuildTable", {
        get: function () {
            return this.database.getTableManager('commandGuild');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CommandManager.prototype, "commandGuildAccessTable", {
        get: function () {
            return this.database.getTableManager('commandGuildAccess');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CommandManager.prototype, "commandDirectTable", {
        get: function () {
            return this.database.getTableManager('commandDirect');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CommandManager.prototype, "commandDirectAccessTable", {
        get: function () {
            return this.database.getTableManager('commandDirectAccess');
        },
        enumerable: false,
        configurable: true
    });
    CommandManager.prototype.push = function () {
        var e_1, _a;
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        var result = _super.prototype.push.apply(this, (0, tslib_1.__spreadArray)([], (0, tslib_1.__read)(items), false));
        try {
            for (var items_1 = (0, tslib_1.__values)(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
                var item = items_1_1.value;
                this.logger.log("Register command: ".concat(item.data.name));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return result;
    };
    CommandManager.prototype.getCommand = function (name) {
        return this.find(function (command) { return command.data.name === name; });
    };
    CommandManager.prototype.setGuildAccess = function (name, guildId, access) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var command, commandGuildAccessTable;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = this.getCommand(name);
                        if (!command) {
                            throw new Error("Command missing: ".concat(name, "."));
                        }
                        else if (!command.defaultAccess.guildSupport) {
                            throw new Error("Command \"".concat(name, "\" does not work on guild."));
                        }
                        commandGuildAccessTable = this.commandGuildAccessTable;
                        return [4 /*yield*/, commandGuildAccessTable.has({ name: name, guildId: guildId })];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 3];
                        return [4 /*yield*/, commandGuildAccessTable.alter({ name: name, guildId: guildId }, { access: access })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, commandGuildAccessTable.insert({ name: name, guildId: guildId, access: access })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CommandManager.prototype.getGuildAccess = function (name, guildId) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var command, result;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = this.getCommand(name);
                        if (!command) {
                            throw new Error("Command missing: ".concat(name));
                        }
                        else if (!command.defaultAccess.guildSupport) {
                            throw new Error("Command \"".concat(name, "\" does not work on guild."));
                        }
                        return [4 /*yield*/, this.commandGuildAccessTable.select({ name: name, guildId: guildId }).first()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result
                                ? result.access
                                : command.defaultAccess.guild];
                }
            });
        });
    };
    CommandManager.prototype.resetGuildAccess = function (name, guildId) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var command;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = this.getCommand(name);
                        if (!command) {
                            throw new Error("Command missing: ".concat(name));
                        }
                        else if (!command.defaultAccess.guildSupport) {
                            throw new Error("Command \"".concat(name, "\" does not work on guild."));
                        }
                        return [4 /*yield*/, this.commandGuildAccessTable.drop({ name: name, guildId: guildId })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CommandManager.prototype.setDirectAccess = function (name, access) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var command, commandDirectAccessTable;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = this.getCommand(name);
                        if (!command) {
                            throw new Error("Command missing: ".concat(name));
                        }
                        else if (!command.defaultAccess.directSupport) {
                            throw new Error("Command \"".concat(name, "\" does not work on direct."));
                        }
                        commandDirectAccessTable = this.commandDirectAccessTable;
                        return [4 /*yield*/, commandDirectAccessTable.has({ name: name })];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 3];
                        return [4 /*yield*/, commandDirectAccessTable.alter({ name: name }, { access: access })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, commandDirectAccessTable.insert({ name: name, access: access })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CommandManager.prototype.getDirectAccess = function (name) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var command, result;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = this.getCommand(name);
                        if (!command) {
                            throw new Error("Command missing: ".concat(name));
                        }
                        else if (!command.defaultAccess.directSupport) {
                            throw new Error("Command \"".concat(name, "\" does not work on direct."));
                        }
                        return [4 /*yield*/, this.commandDirectAccessTable.select({ name: name }).first()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result
                                ? result.access
                                : command.defaultAccess.direct];
                }
            });
        });
    };
    CommandManager.prototype.resetDirectAccess = function (name) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var command;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = this.getCommand(name);
                        if (!command) {
                            throw new Error("Command missing: ".concat(name));
                        }
                        else if (!command.defaultAccess.directSupport) {
                            throw new Error("Command \"".concat(name, "\" does not work on direct."));
                        }
                        return [4 /*yield*/, this.commandDirectAccessTable.drop({ name: name })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CommandManager.prototype.enableGuild = function (name, guildId) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var command, commandGuildTable, isEnabled;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = this.getCommand(name);
                        if (!command) {
                            throw new Error("Command missing: ".concat(name));
                        }
                        else if (!command.defaultAccess.guildSupport) {
                            throw new Error("Command \"".concat(name, "\" does not work on guild."));
                        }
                        commandGuildTable = this.commandGuildTable;
                        isEnabled = true;
                        return [4 /*yield*/, commandGuildTable.has({ name: name, guildId: guildId })];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 3];
                        return [4 /*yield*/, commandGuildTable.alter({ name: name, guildId: guildId }, { isEnabled: isEnabled })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, commandGuildTable.drop({ name: name, guildId: guildId })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CommandManager.prototype.disableGuild = function (name, guildId) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var command, commandGuildTable, isEnabled;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = this.getCommand(name);
                        if (!command) {
                            throw new Error("Command missing: ".concat(name));
                        }
                        else if (!command.defaultAccess.guildSupport) {
                            throw new Error("Command \"".concat(name, "\" does not work on guild."));
                        }
                        commandGuildTable = this.commandGuildTable;
                        isEnabled = false;
                        return [4 /*yield*/, commandGuildTable.has({ name: name, guildId: guildId })];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 3];
                        return [4 /*yield*/, commandGuildTable.alter({ name: name, guildId: guildId }, { isEnabled: isEnabled })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, commandGuildTable.drop({ name: name, guildId: guildId })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CommandManager.prototype.isGuildEnabled = function (name, guildId) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var command, result;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = this.getCommand(name);
                        if (!command) {
                            throw new Error("Command missing: ".concat(name));
                        }
                        else if (!command.defaultAccess.guildSupport) {
                            throw new Error("Command \"".concat(name, "\" does not work on guild."));
                        }
                        return [4 /*yield*/, this.commandGuildTable.select({ name: name, guildId: guildId }).first()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result ? !!result.isEnabled : true];
                }
            });
        });
    };
    CommandManager.prototype.enableDirect = function (name) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var command, commandDirectTable, isEnabled;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = this.getCommand(name);
                        if (!command) {
                            throw new Error("Command missing: ".concat(name));
                        }
                        else if (!command.defaultAccess.directSupport) {
                            throw new Error("Command \"".concat(name, "\" does not work on direct."));
                        }
                        commandDirectTable = this.commandDirectTable;
                        isEnabled = true;
                        return [4 /*yield*/, commandDirectTable.has({ name: name })];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 3];
                        return [4 /*yield*/, commandDirectTable.alter({ name: name }, { isEnabled: isEnabled })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, commandDirectTable.insert({ name: name, isEnabled: isEnabled })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CommandManager.prototype.disableDirect = function (name) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var command, commandDirectTable, isEnabled;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = this.getCommand(name);
                        if (!command) {
                            throw new Error("Command missing: ".concat(name));
                        }
                        else if (!command.defaultAccess.directSupport) {
                            throw new Error("Command \"".concat(name, "\" does not work on direct."));
                        }
                        commandDirectTable = this.commandDirectTable;
                        isEnabled = false;
                        return [4 /*yield*/, commandDirectTable.has({ name: name })];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 3];
                        return [4 /*yield*/, commandDirectTable.alter({ name: name }, { isEnabled: isEnabled })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, commandDirectTable.insert({ name: name, isEnabled: isEnabled })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CommandManager.prototype.isDirectEnabled = function (name) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var command, result;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = this.getCommand(name);
                        if (!command) {
                            throw new Error("Command missing: ".concat(name));
                        }
                        else if (!command.defaultAccess.directSupport) {
                            throw new Error("Command \"".concat(name, "\" does not work on guild."));
                        }
                        return [4 /*yield*/, this.commandDirectTable.select({ name: name }).first()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result ? !!result.isEnabled : true];
                }
            });
        });
    };
    return CommandManager;
}(base_1.BaseArrayManager));
exports.CommandManager = CommandManager;
var getCommandOptionFootprint = function (data, footprint) {
    var e_2, _a;
    footprint
        .update(data.name)
        .update(data.description)
        .update("".concat(data.type));
    if ((data.type === 'SUB_COMMAND') ||
        (data.type === 'SUB_COMMAND_GROUP')) {
        try {
            for (var _b = (0, tslib_1.__values)((data.options || [])), _c = _b.next(); !_c.done; _c = _b.next()) {
                var option = _c.value;
                (0, exports.getCommandOptionFootprint)(option, footprint);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    return footprint;
};
exports.getCommandOptionFootprint = getCommandOptionFootprint;
var getCommandFootprint = function (data, footprint) {
    var e_3, _a;
    if (footprint === void 0) { footprint = crypto_1.default.createHash('sha256'); }
    footprint
        .update(data.name)
        .update(data.description)
        .update("".concat(data.type));
    try {
        for (var _b = (0, tslib_1.__values)((data.options || [])), _c = _b.next(); !_c.done; _c = _b.next()) {
            var option = _c.value;
            (0, exports.getCommandOptionFootprint)(option, footprint);
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return footprint;
};
exports.getCommandFootprint = getCommandFootprint;
