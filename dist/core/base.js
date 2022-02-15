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
class BaseArrayManager extends Array {
    constructor(client) {
        super();
        this.client = client;
        this.database = client.database;
    }
    client;
    database;
}
exports.BaseArrayManager = BaseArrayManager;
