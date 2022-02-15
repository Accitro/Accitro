"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitter = void 0;
const base_1 = require("./base");
class EventEmitter extends base_1.BaseClass {
    static bindEventEmitter(discord, eventEmitter) {
        const oldEmit = discord.emit;
        const newEmit = eventEmitter.emit;
        discord.emit = (...args) => {
            oldEmit.call(discord, ...args);
            newEmit.call(eventEmitter, ...args);
            return true;
        };
    }
    constructor(client) {
        super(client);
        this.listeners = {};
        EventEmitter.bindEventEmitter(client.discordClient, this);
    }
    listeners;
    on(name, listener, once = false) {
        return (this.listeners[name] || (this.listeners[name] = [])).push({ listener, once });
    }
    once(name, listener) {
        return this.on(name, listener, true);
    }
    async emit(name, ...args) {
        const listeners = this.listeners[name];
        if (!listeners) {
            return;
        }
        await Promise.all(listeners.map(async (entry) => {
            const { once } = entry;
            const listener = entry.listener;
            if (once) {
                listeners.splice(listeners.indexOf(entry), 1);
            }
            await listener(...args)?.catch(console.error);
        }));
    }
}
exports.EventEmitter = EventEmitter;
