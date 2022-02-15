import { Knex } from 'knex';
declare type TableBuilder = Knex.CreateTableBuilder;
export declare const tableSetupAssoc: Array<[string, (table: TableBuilder) => void]>;
export {};
