"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = exports.TableQueryBuilder = void 0;
const tslib_1 = require("tslib");
const knex_1 = tslib_1.__importDefault(require("knex"));
const setup_1 = require("./setup");
class TableQueryBuilder {
    constructor(query, name) {
        this.queryBuilder = query;
        this.insert = query.insert.bind(query, name);
        this.alter = query.alter.bind(query, name);
        this.drop = query.drop.bind(query, name);
        this.select = query.select.bind(query, name);
        this.count = query.count.bind(query, name);
        this.has = query.has.bind(query, name);
    }
    queryBuilder;
    insert;
    alter;
    drop;
    select;
    count;
    has;
}
exports.TableQueryBuilder = TableQueryBuilder;
class QueryBuilder {
    constructor(client, credentials) {
        this.client = client;
        this.knex = (0, knex_1.default)({
            connection: {
                host: credentials.host,
                database: credentials.name,
                user: credentials.username,
                password: credentials.password
            },
            client: 'mysql2'
        });
        this.tableManagers = {};
        this.client.on('ready', () => this.setupTables());
    }
    client;
    knex;
    get schema() { return this.knex.schema; }
    tableManagers;
    getTableManager(name) {
        const { tableManagers } = this;
        return tableManagers[name] || (tableManagers[name] = new TableQueryBuilder(this, name));
    }
    insert(table, data) {
        return this.knex.table(table).insert(data);
    }
    alter(table, where, data) {
        return this.knex.table(table).where(where).update(data);
    }
    drop(table, where) {
        return this.knex.table(table).where(where).delete();
    }
    select(table, where, select) {
        return (((table) => select ? table.select(...(Array.isArray(select) ? select : [select])) : table)(this.knex.table(table))).where({ ...where });
    }
    async count(table, where) {
        return Number((await ((knex) => where ? knex.where(where) : knex)(this.knex.table(table)).count().first())?.count) || 0;
    }
    async has(table, where) {
        return !!await this.select(table, where).first();
    }
    hasTable(table) {
        return this.schema.hasTable(table);
    }
    createTable(table, callback) {
        return this.schema.createTable(table, callback);
    }
    async setupTables() {
        const createTableIfNotExists = async (table, callback) => {
            if (!await this.hasTable(table)) {
                await this.createTable(table, (table) => {
                    table.charset('utf8');
                    callback(table);
                });
            }
        };
        await Promise.all(setup_1.tableSetupAssoc.map((table) => createTableIfNotExists(table[0], table[1])));
    }
}
exports.QueryBuilder = QueryBuilder;
