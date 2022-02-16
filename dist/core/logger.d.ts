import { BaseClass } from './base';
import { Client } from './client';
export declare class Logger extends BaseClass {
    constructor(client: Client);
    log(scope: string, message: string): void;
    verbose(scope: string, message: string): void;
    error(scope: string, error: Error): void;
}
export declare class ScopedLogger extends BaseClass {
    constructor(logger: Logger, scope: string);
    readonly logger: Logger;
    newScope(scope: string): ScopedLogger;
    log: (message: string) => void;
    verbose: (message: string) => void;
    error: (error: Error) => void;
}
