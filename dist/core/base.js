"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseArrayManager = exports.BaseClass = void 0;
var tslib_1 = require("tslib");
var BaseClass = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(BaseClass, _super);
    function BaseClass(client) {
        var _this = _super.call(this) || this;
        _this.client = client;
        return _this;
    }
    return BaseClass;
}((/** @class */ (function () {
    function class_1() {
    }
    return class_1;
}()))));
exports.BaseClass = BaseClass;
var BaseArrayManager = /** @class */ (function (_super) {
    (0, tslib_1.__extends)(BaseArrayManager, _super);
    function BaseArrayManager(client) {
        var _this = _super.call(this) || this;
        _this.client = client;
        _this.database = client.database;
        return _this;
    }
    return BaseArrayManager;
}(Array));
exports.BaseArrayManager = BaseArrayManager;
