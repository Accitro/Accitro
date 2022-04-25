"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseArrayManager = exports.BaseClass = void 0;
class BaseClass extends (class {
}) {
    constructor(client) {
        super();
        this.client = client;
    }
    client;
}
exports.BaseClass = BaseClass;
class BaseArrayManager {
    constructor(client) {
        this.client = client;
        this.database = client.database;
        this.entries = [];
    }
    client;
    database;
    entries;
}
exports.BaseArrayManager = BaseArrayManager;
