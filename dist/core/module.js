"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleManager = exports.Module = void 0;
var tslib_1 = require("tslib");
var discord_js_1 = (0, tslib_1.__importDefault)(require("discord.js"));
var base_1 = require("./base");
var command_1 = require("./command");
var Module = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(Module, _super);
    function Module(manager) {
        var _this = _super.call(this, manager.client) || this;
        _this.moduleManager = manager;
        _this.commands = new command_1.CommandManager(_this);
        _this.eventListeners = {};
        return _this;
    }
    Object.defineProperty(Module.prototype, "logger", {
        get: function () {
            if (!this._logger) {
                this._logger = this.moduleManager.logger.newScope("Module: ".concat(this.name));
            }
            return this._logger;
        },
        enumerable: false,
        configurable: true
    });
    Module.prototype.enable = function () {
        return this.moduleManager.enable(this.name);
    };
    Module.prototype.disable = function () {
        return this.moduleManager.disable(this.name);
    };
    Module.prototype.isEnabled = function (guildId) {
        return this.moduleManager.isEnabled(this.name, guildId);
    };
    Module.prototype.setGuildOverride = function (guildId, isEnabled) {
        return this.moduleManager.setGuildOverride(this.name, guildId, isEnabled);
    };
    Module.prototype.unsetGuildOverride = function (guildId) {
        return this.moduleManager.unsetGuildOverride(this.name, guildId);
    };
    return Module;
}(base_1.BaseClass));
exports.Module = Module;
var ModuleManager = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(ModuleManager, _super);
    function ModuleManager(client) {
        var _this = _super.call(this, client) || this;
        ModuleManager.bindEventEmitter(_this, client.events);
        _this.logger = client.logger.newScope('Module Manager');
        return _this;
    }
    ModuleManager.bindEventEmitter = function (modules, eventEmitter) {
        var oldEmit = eventEmitter.emit;
        var newEmit = (function (name) {
            var e_1, _a;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            try {
                for (var modules_1 = (0, tslib_1.__values)(modules), modules_1_1 = modules_1.next(); !modules_1_1.done; modules_1_1 = modules_1.next()) {
                    var module_1 = modules_1_1.value;
                    var listener = module_1.eventListeners[name];
                    if (listener) {
                        listener.call.apply(listener, (0, tslib_1.__spreadArray)([module_1], (0, tslib_1.__read)(args), false));
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (modules_1_1 && !modules_1_1.done && (_a = modules_1.return)) _a.call(modules_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
        eventEmitter.emit = (function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            oldEmit.call.apply(oldEmit, (0, tslib_1.__spreadArray)([eventEmitter], (0, tslib_1.__read)(args), false));
            newEmit.call.apply(newEmit, (0, tslib_1.__spreadArray)([modules], (0, tslib_1.__read)(args), false));
            return true;
        });
    };
    Object.defineProperty(ModuleManager.prototype, "moduleTable", {
        get: function () {
            return this.database.getTableManager('module');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ModuleManager.prototype, "moduleGuildOverrideTable", {
        get: function () {
            return this.database.getTableManager('moduleGuildOverride');
        },
        enumerable: false,
        configurable: true
    });
    ModuleManager.prototype.publishCommands = function (entryList, application) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var commandMap, entryKey, command, _a, _b, _c, command, _d, _e, _i, mapKey, _f, local, remote, remoteFootprint, localFootprint;
            var e_2, _g;
            return (0, tslib_1.__generator)(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        commandMap = {};
                        for (entryKey in entryList) {
                            command = entryList[entryKey].command;
                            if (!(command.data.name in commandMap)) {
                                commandMap[command.data.name] = {};
                            }
                            commandMap[command.data.name].local = command;
                        }
                        try {
                            for (_a = (0, tslib_1.__values)(application.commands.cache), _b = _a.next(); !_b.done; _b = _a.next()) {
                                _c = (0, tslib_1.__read)(_b.value, 2), command = _c[1];
                                if (!(command.name in commandMap)) {
                                    commandMap[command.name] = {};
                                }
                                if (command.type === 'CHAT_INPUT') {
                                    commandMap[command.name].remote = command;
                                }
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_g = _a.return)) _g.call(_a);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        _d = [];
                        for (_e in commandMap)
                            _d.push(_e);
                        _i = 0;
                        _h.label = 1;
                    case 1:
                        if (!(_i < _d.length)) return [3 /*break*/, 7];
                        mapKey = _d[_i];
                        _f = commandMap[mapKey], local = _f.local, remote = _f.remote;
                        if (!(local && (!remote))) return [3 /*break*/, 3];
                        return [4 /*yield*/, application.commands.create(local.data)];
                    case 2:
                        _h.sent();
                        return [3 /*break*/, 6];
                    case 3:
                        if (!(remote && (!local))) return [3 /*break*/, 4];
                        application.commands.delete(remote.name);
                        return [3 /*break*/, 6];
                    case 4:
                        if (!(remote && local)) return [3 /*break*/, 6];
                        remoteFootprint = (0, command_1.getCommandFootprint)(remote);
                        localFootprint = (0, command_1.getCommandFootprint)(local.data);
                        if (!(remoteFootprint !== localFootprint)) return [3 /*break*/, 6];
                        return [4 /*yield*/, application.commands.edit(remote.name, local.data)];
                    case 5:
                        _h.sent();
                        _h.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ModuleManager.prototype.init = function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var client, application, entryList;
            var _this = this;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = this.client;
                        return [4 /*yield*/, this.getApplication()];
                    case 1:
                        application = _a.sent();
                        if (!application) {
                            throw new Error('Discord application not available');
                        }
                        entryList = {};
                        return [4 /*yield*/, this.publishCommands(entryList, application)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, Promise.all(this.map(function (module) { return (0, tslib_1.__awaiter)(_this, void 0, void 0, function () {
                                var commands;
                                var _this = this;
                                return (0, tslib_1.__generator)(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            commands = module.commands;
                                            return [4 /*yield*/, Promise.all(commands.map(function (command) { return (0, tslib_1.__awaiter)(_this, void 0, void 0, function () {
                                                    return (0, tslib_1.__generator)(this, function (_a) {
                                                        if (command.data.name in entryList) {
                                                            throw new Error("Command name ambiguity detected: ".concat(command.data.name));
                                                        }
                                                        return [2 /*return*/];
                                                    });
                                                }); }))];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 3:
                        _a.sent();
                        client.on('interaction', function (interaction) { return (0, tslib_1.__awaiter)(_this, void 0, void 0, function () {
                            var respond, run, result, error_1;
                            var _this = this;
                            return (0, tslib_1.__generator)(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!interaction.isCommand()) {
                                            return [2 /*return*/];
                                        }
                                        respond = function (data) {
                                            if (interaction.replied || interaction.deferred) {
                                                return interaction.editReply(data);
                                            }
                                            else {
                                                return interaction.reply(data);
                                            }
                                        };
                                        run = function () { return (0, tslib_1.__awaiter)(_this, void 0, void 0, function () {
                                            var guildId, entry, user, me, command, module, guild, member_1, meMember;
                                            return (0, tslib_1.__generator)(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        guildId = interaction.guildId || undefined;
                                                        entry = entryList[interaction.commandName];
                                                        if (!entry) {
                                                            throw new Error('Cannot fetch command.');
                                                        }
                                                        user = interaction.user;
                                                        me = client.discordClient.user;
                                                        command = entry.command, module = entry.module;
                                                        return [4 /*yield*/, module.isEnabled(guildId)];
                                                    case 1:
                                                        if (!(_a.sent())) {
                                                            throw new Error('Module is disabled.');
                                                        }
                                                        else if (!me) {
                                                            throw new Error('Cannot fetch bot user.');
                                                        }
                                                        if (!guildId) return [3 /*break*/, 4];
                                                        return [4 /*yield*/, module.commands.isGuildEnabled(command.data.name, guildId)];
                                                    case 2:
                                                        if (!(_a.sent())) {
                                                            throw new Error('Command is disabled on guilds.');
                                                        }
                                                        guild = client.discordClient.guilds.cache.get(guildId);
                                                        if (!guild) {
                                                            throw new Error('Cannot fetch guild.');
                                                        }
                                                        member_1 = guild.members.cache.get(user.id);
                                                        if (!member_1) {
                                                            throw new Error('Cannot fetch member.');
                                                        }
                                                        meMember = guild.me;
                                                        if (!meMember) {
                                                            throw new Error('Cannot fetch bot member.');
                                                        }
                                                        return [4 /*yield*/, module.commands.getGuildAccess(command.data.name, guildId)];
                                                    case 3:
                                                        switch (_a.sent()) {
                                                            case command_1.CommandGuildAccess.WithRole:
                                                                if (member_1.roles.highest.id === guild.id) {
                                                                    throw new Error('User must have at least one role.');
                                                                }
                                                                break;
                                                            case command_1.CommandGuildAccess.WithHigherRole:
                                                                if (member_1.roles.highest.position < meMember.roles.highest.position) {
                                                                    throw new Error('User must have at list one role that is higher than the bot role.');
                                                                }
                                                                break;
                                                            case command_1.CommandGuildAccess.Administrator:
                                                                if (!member_1.permissions.has('ADMINISTRATOR')) {
                                                                    throw new Error('User must be an administrator.');
                                                                }
                                                                break;
                                                            case command_1.CommandGuildAccess.GuildOwner:
                                                                if (guild.ownerId !== member_1.id) {
                                                                    throw new Error('User must be the guild owner.');
                                                                }
                                                                break;
                                                            case command_1.CommandGuildAccess.BotOwner:
                                                                if (application.owner instanceof discord_js_1.default.Team) {
                                                                    if (!application.owner.members.find(function (teamMember) { return teamMember.id === member_1.id; })) {
                                                                        throw new Error('User must be one of the bot owners.');
                                                                    }
                                                                }
                                                                else if (application.owner instanceof discord_js_1.default.User) {
                                                                    if (application.owner.id !== member_1.id) {
                                                                        throw new Error('User must be the bot owner.');
                                                                    }
                                                                }
                                                                else {
                                                                    throw new Error('Cannot fetch discord application.');
                                                                }
                                                                break;
                                                        }
                                                        return [3 /*break*/, 7];
                                                    case 4: return [4 /*yield*/, module.commands.isDirectEnabled(command.data.name)];
                                                    case 5:
                                                        if (!(_a.sent())) {
                                                            throw new Error('Command is disabled on direct.');
                                                        }
                                                        return [4 /*yield*/, module.commands.getDirectAccess(command.data.name)];
                                                    case 6:
                                                        switch (_a.sent()) {
                                                            case command_1.CommandDirectAccess.BotOwner:
                                                                if (application.owner instanceof discord_js_1.default.Team) {
                                                                    if (!application.owner.members.find(function (teamMember) { return teamMember.id === user.id; })) {
                                                                        throw new Error('User must be one of the bot owners.');
                                                                    }
                                                                }
                                                                else if (application.owner instanceof discord_js_1.default.User) {
                                                                    if (application.owner.id !== user.id) {
                                                                        throw new Error('User must be the bot owner.');
                                                                    }
                                                                }
                                                                else {
                                                                    throw new Error('Cannot fetch discord application.');
                                                                }
                                                                break;
                                                        }
                                                        _a.label = 7;
                                                    case 7: return [4 /*yield*/, command.run(module.commands.logger.newScope("Module: ".concat(module.name, " / Command: ").concat(command.data.name)), interaction)];
                                                    case 8: return [2 /*return*/, _a.sent()];
                                                }
                                            });
                                        }); };
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, run()];
                                    case 2:
                                        result = _a.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        error_1 = _a.sent();
                                        console.error(this.logger.error(error_1));
                                        result = {
                                            ephemeral: true,
                                            embeds: [
                                                {
                                                    title: 'Fatal Error',
                                                    description: "".concat(error_1.message)
                                                }
                                            ]
                                        };
                                        return [3 /*break*/, 4];
                                    case 4: return [4 /*yield*/, respond(result).catch(function (error) { return _this.logger.error(error); })];
                                    case 5:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        });
    };
    ModuleManager.prototype.push = function () {
        var e_3, _a;
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        var result = _super.prototype.push.apply(this, (0, tslib_1.__spreadArray)([], (0, tslib_1.__read)(items), false));
        try {
            for (var items_1 = (0, tslib_1.__values)(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
                var item = items_1_1.value;
                this.logger.log("Register module: ".concat(item.name));
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return result;
    };
    ModuleManager.prototype.getApplication = function () {
        var _a;
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var _b;
            return (0, tslib_1.__generator)(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(this._application === undefined)) return [3 /*break*/, 2];
                        _b = this;
                        return [4 /*yield*/, ((_a = this.client.discordClient.application) === null || _a === void 0 ? void 0 : _a.fetch())];
                    case 1:
                        _b._application = (_c.sent()) || null;
                        _c.label = 2;
                    case 2: return [2 /*return*/, this._application];
                }
            });
        });
    };
    ModuleManager.prototype.enable = function (name) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var moduleTable, isEnabled;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        moduleTable = this.moduleTable;
                        isEnabled = true;
                        return [4 /*yield*/, moduleTable.has({ name: name })];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 3];
                        return [4 /*yield*/, moduleTable.alter({ name: name }, { isEnabled: isEnabled })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, moduleTable.insert({ name: name, isEnabled: isEnabled })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ModuleManager.prototype.disable = function (name) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var moduleTable, isEnabled;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        moduleTable = this.moduleTable;
                        isEnabled = false;
                        return [4 /*yield*/, moduleTable.has({ name: name })];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 3];
                        return [4 /*yield*/, moduleTable.alter({ name: name }, { isEnabled: isEnabled })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, moduleTable.insert({ name: name, isEnabled: isEnabled })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ModuleManager.prototype.isEnabled = function (name, guildId) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var result_1, result;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!guildId) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.moduleGuildOverrideTable.select({ name: name }).first()];
                    case 1:
                        result_1 = _a.sent();
                        if (result_1) {
                            return [2 /*return*/, !!result_1.enabled];
                        }
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.moduleTable.select({ name: name }).first()];
                    case 3:
                        result = _a.sent();
                        return [2 /*return*/, result ? !!result.enabled : true];
                }
            });
        });
    };
    ModuleManager.prototype.setGuildOverride = function (name, guildId, isEnabled) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var moduleGuildOverrideTable;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        moduleGuildOverrideTable = this.moduleGuildOverrideTable;
                        return [4 /*yield*/, moduleGuildOverrideTable.has({ name: name, guildId: guildId })];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 3];
                        return [4 /*yield*/, moduleGuildOverrideTable.alter({ name: name, guildId: guildId }, { isEnabled: isEnabled })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, moduleGuildOverrideTable.insert({ name: name, guildId: guildId, isEnabled: isEnabled })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ModuleManager.prototype.unsetGuildOverride = function (name, guildId) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var moduleGuildOverrideTable;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        moduleGuildOverrideTable = this.moduleGuildOverrideTable;
                        return [4 /*yield*/, moduleGuildOverrideTable.drop({ name: name, guildId: guildId })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ModuleManager;
}(base_1.BaseArrayManager));
exports.ModuleManager = ModuleManager;
