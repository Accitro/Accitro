"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const query_builder_1 = require("../database/query-builder");
const events_1 = require("./events");
const logger_1 = require("./logger");
const module_1 = require("./module");
class Client {
    static defaultOptions = {};
    constructor(client, databaseCredentials, options) {
        this.options = Object.assign(Client.defaultOptions, options);
        this.discordClient = client;
        this.database = new query_builder_1.QueryBuilder(this, databaseCredentials);
        this.events = new events_1.EventEmitter(this);
        this.logger = new logger_1.ScopedLogger(new logger_1.Logger(this), 'main');
        this.modules = new module_1.ModuleManager(this);
        this.on = this.events.on.bind(this.events);
        this.once = this.events.once.bind(this.events);
    }
    options;
    discordClient;
    database;
    events;
    logger;
    modules;
    on;
    once;
}
exports.Client = Client;
