"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitter = void 0;
var tslib_1 = require("tslib");
var base_1 = require("./base");
var EventEmitter = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(EventEmitter, _super);
    function EventEmitter(client) {
        var _this = _super.call(this, client) || this;
        _this.listeners = {};
        EventEmitter.bindEventEmitter(client.discordClient, _this);
        return _this;
    }
    EventEmitter.bindEventEmitter = function (discord, eventEmitter) {
        var oldEmit = discord.emit;
        var newEmit = eventEmitter.emit;
        discord.emit = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            oldEmit.call.apply(oldEmit, (0, tslib_1.__spreadArray)([discord], (0, tslib_1.__read)(args), false));
            newEmit.call.apply(newEmit, (0, tslib_1.__spreadArray)([eventEmitter], (0, tslib_1.__read)(args), false));
            return true;
        };
    };
    EventEmitter.prototype.on = function (name, listener, once) {
        if (once === void 0) { once = false; }
        return (this.listeners[name] || (this.listeners[name] = [])).push({ listener: listener, once: once });
    };
    EventEmitter.prototype.once = function (name, listener) {
        return this.on(name, listener, true);
    };
    EventEmitter.prototype.emit = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var listeners;
            var _this = this;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        listeners = this.listeners[name];
                        if (!listeners) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, Promise.all(listeners.map(function (entry) { return (0, tslib_1.__awaiter)(_this, void 0, void 0, function () {
                                var once, listener;
                                var _a;
                                return (0, tslib_1.__generator)(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            once = entry.once;
                                            listener = entry.listener;
                                            if (once) {
                                                listeners.splice(listeners.indexOf(entry), 1);
                                            }
                                            return [4 /*yield*/, ((_a = listener.apply(void 0, (0, tslib_1.__spreadArray)([], (0, tslib_1.__read)(args), false))) === null || _a === void 0 ? void 0 : _a.catch(console.error))];
                                        case 1:
                                            _b.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return EventEmitter;
}(base_1.BaseClass));
exports.EventEmitter = EventEmitter;
