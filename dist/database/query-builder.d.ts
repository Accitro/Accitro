import { Knex } from 'knex';
import { Client } from '../core/client';
export interface DatabaseCredentials {
    host: string;
    name: string;
    password: string;
    username: string;
}
export interface DatabaseRow {
    [key: string]: any;
}
export declare class TableQueryBuilder {
    constructor(query: QueryBuilder, name: string);
    readonly queryBuilder: QueryBuilder;
    readonly insert: (data: DatabaseRow) => ReturnType<QueryBuilder['insert']>;
    readonly alter: (where: DatabaseRow, data: DatabaseRow) => ReturnType<QueryBuilder['alter']>;
    readonly drop: (where: DatabaseRow) => ReturnType<QueryBuilder['drop']>;
    readonly select: (where?: DatabaseRow, select?: Array<string> | '*') => ReturnType<QueryBuilder['select']>;
    readonly count: (where?: DatabaseRow) => ReturnType<QueryBuilder['count']>;
    readonly has: (where: DatabaseRow) => ReturnType<QueryBuilder['has']>;
}
export declare class QueryBuilder {
    constructor(client: Client, credentials: DatabaseCredentials);
    readonly client: Client;
    readonly knex: Knex;
    get schema(): Knex.SchemaBuilder;
    readonly tableManagers: {
        [key: string]: TableQueryBuilder;
    };
    getTableManager(name: string): TableQueryBuilder;
    insert(table: string, data: DatabaseRow): Knex.QueryBuilder<unknown, number[]>;
    alter(table: string, where: DatabaseRow, data: DatabaseRow): Knex.QueryBuilder<unknown, number>;
    drop(table: string, where: DatabaseRow): Knex.QueryBuilder<unknown, number>;
    select(table: string, where?: DatabaseRow, select?: Array<string> | '*'): Knex.QueryBuilder<unknown, Record<string, any>[]>;
    count(table: string, where?: DatabaseRow): Promise<number>;
    has(table: string, where: DatabaseRow): Promise<boolean>;
    hasTable(table: string): Promise<boolean>;
    createTable(table: string, callback: (builder: Knex.CreateTableBuilder) => any): Knex.SchemaBuilder;
    setupTables(): Promise<void>;
}
