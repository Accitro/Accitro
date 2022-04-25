import { Knex } from 'knex';
declare type TableBuilder = Knex.CreateTableBuilder;
export declare const tableSetupAssoc: [string, (table: TableBuilder) => void][];
export {};
