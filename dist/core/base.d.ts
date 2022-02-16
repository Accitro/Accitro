import { QueryBuilder } from '../database/query-builder';
import { Client } from './client';
declare const BaseClass_base: {
    new (): {};
};
export declare class BaseClass extends BaseClass_base {
    constructor(client: Client);
    readonly client: Client;
}
export declare class BaseArrayManager<T> {
    constructor(client: Client);
    readonly client: Client;
    readonly database: QueryBuilder;
    readonly entries: Array<T>;
}
export {};
