"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScopedLogger = exports.Logger = void 0;
var tslib_1 = require("tslib");
var base_1 = require("./base");
var Logger = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(Logger, _super);
    function Logger(client) {
        var _this = this;
        var events = client.events;
        _this = _super.call(this, client) || this;
        _this.events = events;
        events.on('debug', function (message) { return _this.log('Discord', message); });
        events.on('error', function (error) { return _this.error('Discord', error); });
        return _this;
    }
    Logger.prototype.log = function (scope, message) {
        this.events.emit('logInfo', scope, message);
    };
    Logger.prototype.verbose = function (scope, message) {
        this.events.emit('logVerbose', scope, message);
    };
    Logger.prototype.error = function (scope, error) {
        this.events.emit('logError', scope, error);
    };
    return Logger;
}(base_1.BaseClass));
exports.Logger = Logger;
var ScopedLogger = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(ScopedLogger, _super);
    function ScopedLogger(logger, scope) {
        var _this = this;
        var log = logger.log, verbose = logger.verbose, error = logger.error;
        _this = _super.call(this, logger.client) || this;
        _this.logger = logger;
        _this.log = log.bind(logger, scope);
        _this.verbose = verbose.bind(logger, scope);
        _this.error = error.bind(logger, scope);
        return _this;
    }
    ScopedLogger.prototype.newScope = function (scope) {
        return new ScopedLogger(this.logger, scope);
    };
    return ScopedLogger;
}(base_1.BaseClass));
exports.ScopedLogger = ScopedLogger;
