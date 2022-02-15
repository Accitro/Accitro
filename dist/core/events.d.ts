import Discord from 'discord.js';
import { BaseClass } from './base';
import { Client } from './client';
export interface ClientEvents extends Discord.ClientEvents {
}
export declare class EventEmitter extends BaseClass {
    static bindEventEmitter(discord: Discord.Client, eventEmitter: EventEmitter): void;
    constructor(client: Client);
    readonly listeners: {
        [Property in keyof ClientEvents]: Array<{
            listener: (...args: ClientEvents[Property]) => (void | Promise<void>);
            once: boolean;
        }>;
    };
    on<T extends keyof ClientEvents>(name: T, listener: (...args: ClientEvents[T]) => (void | Promise<void>), once?: boolean): number;
    once<T extends keyof ClientEvents>(name: T, listener: (...args: ClientEvents[T]) => (void | Promise<void>)): number;
    emit<T extends keyof ClientEvents>(name: T, ...args: ClientEvents[T]): Promise<void>;
}
