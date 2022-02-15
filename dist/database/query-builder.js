"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = exports.TableQueryBuilder = void 0;
var tslib_1 = require("tslib");
var knex_1 = (0, tslib_1.__importDefault)(require("knex"));
var setup_1 = require("./setup");
var TableQueryBuilder = /** @class */ (function () {
    function TableQueryBuilder(query, name) {
        this.queryBuilder = query;
        this.insert = query.insert.bind(query, name);
        this.alter = query.alter.bind(query, name);
        this.drop = query.drop.bind(query, name);
        this.select = query.select.bind(query, name);
        this.count = query.count.bind(query, name);
        this.has = query.has.bind(query, name);
    }
    return TableQueryBuilder;
}());
exports.TableQueryBuilder = TableQueryBuilder;
var QueryBuilder = /** @class */ (function () {
    function QueryBuilder(client, credentials) {
        this.client = client;
        this.knex = (0, knex_1.default)({
            connection: {
                host: credentials.host,
                database: credentials.name,
                userName: credentials.username,
                password: credentials.password
            },
            client: 'mysql2'
        });
        this.tableManagers = {};
    }
    Object.defineProperty(QueryBuilder.prototype, "schema", {
        get: function () { return this.knex.schema; },
        enumerable: false,
        configurable: true
    });
    QueryBuilder.prototype.getTableManager = function (name) {
        var tableManagers = this.tableManagers;
        return tableManagers[name] || (tableManagers[name] = new TableQueryBuilder(this, name));
    };
    QueryBuilder.prototype.insert = function (table, data) {
        return this.knex.table(table).insert(data);
    };
    QueryBuilder.prototype.alter = function (table, where, data) {
        return this.knex.table(table).where(where).update(data);
    };
    QueryBuilder.prototype.drop = function (table, where) {
        return this.knex.table(table).where(where).delete();
    };
    QueryBuilder.prototype.select = function (table, where, select) {
        return ((function (table) { return select ? table.select.apply(table, (0, tslib_1.__spreadArray)([], (0, tslib_1.__read)((Array.isArray(select) ? select : [select])), false)) : table; })(this.knex.table(table))).where((0, tslib_1.__assign)({}, where));
    };
    QueryBuilder.prototype.count = function (table, where) {
        var _a;
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var _b;
            return (0, tslib_1.__generator)(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = Number;
                        return [4 /*yield*/, (function (knex) { return where ? knex.where(where) : knex; })(this.knex.table(table)).count().first()];
                    case 1: return [2 /*return*/, _b.apply(void 0, [(_a = (_c.sent())) === null || _a === void 0 ? void 0 : _a.count]) || 0];
                }
            });
        });
    };
    QueryBuilder.prototype.has = function (table, where) {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.select(table, where).first()];
                    case 1: return [2 /*return*/, !!(_a.sent())];
                }
            });
        });
    };
    QueryBuilder.prototype.hasTable = function (table) {
        return this.schema.hasTable(table);
    };
    QueryBuilder.prototype.createTable = function (table, callback) {
        return this.schema.createTable(table, callback);
    };
    QueryBuilder.prototype.setupTables = function () {
        return (0, tslib_1.__awaiter)(this, void 0, void 0, function () {
            var createTableIfNotExists;
            var _this = this;
            return (0, tslib_1.__generator)(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        createTableIfNotExists = function (table, callback) { return (0, tslib_1.__awaiter)(_this, void 0, void 0, function () {
                            return (0, tslib_1.__generator)(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.hasTable(table)];
                                    case 1:
                                        if (!!(_a.sent())) return [3 /*break*/, 3];
                                        return [4 /*yield*/, this.createTable(table, function (table) {
                                                table.charset('utf8');
                                                callback(table);
                                            })];
                                    case 2:
                                        _a.sent();
                                        _a.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); };
                        return [4 /*yield*/, Promise.all(setup_1.tableSetupAssoc.map(function (table) { return createTableIfNotExists(table[0], table[1]); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return QueryBuilder;
}());
exports.QueryBuilder = QueryBuilder;
