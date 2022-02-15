"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScopedLogger = exports.Logger = void 0;
const base_1 = require("./base");
class Logger extends base_1.BaseClass {
    constructor(client) {
        const { events } = client;
        super(client);
        this.events = events;
        events.on('debug', (message) => this.log('Discord', message));
        events.on('error', (error) => this.error('Discord', error));
    }
    events;
    log(scope, message) {
        this.events.emit('logInfo', scope, message);
    }
    verbose(scope, message) {
        this.events.emit('logVerbose', scope, message);
    }
    error(scope, error) {
        this.events.emit('logError', scope, error);
    }
}
exports.Logger = Logger;
class ScopedLogger extends base_1.BaseClass {
    constructor(logger, scope) {
        const { log, verbose, error } = logger;
        super(logger.client);
        this.logger = logger;
        this.log = log.bind(logger, scope);
        this.verbose = verbose.bind(logger, scope);
        this.error = error.bind(logger, scope);
    }
    logger;
    newScope(scope) {
        return new ScopedLogger(this.logger, scope);
    }
    log;
    verbose;
    error;
}
exports.ScopedLogger = ScopedLogger;
