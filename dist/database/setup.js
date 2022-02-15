"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tableSetupAssoc = void 0;
var module = function (table) {
    table.string('name').index().notNullable();
    table.boolean('isEnabled').index().notNullable();
};
var moduleGuildOverride = function (table) {
    table.string('name').index().notNullable();
    table.string('guildId').index().notNullable();
    table.boolean('isEnabled').index().notNullable();
};
var commandGuild = function (table) {
    table.string('name').index().notNullable();
    table.string('guildId').index().notNullable();
    table.boolean('isEnabled').index().notNullable();
};
var commandGuildAccess = function (table) {
    table.string('name').index().notNullable();
    table.string('guildId').index().notNullable();
    table.integer('access').index().notNullable();
};
var commandDirect = function (table) {
    table.string('name').index().notNullable();
    table.string('isEnabled').index().notNullable();
};
var commandDirectAccess = function (table) {
    table.string('name').index().notNullable();
    table.string('isEnabled').index().notNullable();
};
var config = function (table) {
    table.string('id').index().notNullable();
    table.string('key').index().notNullable();
    table.json('value').notNullable();
};
exports.tableSetupAssoc = [
    ['module', module],
    ['moduleGuildOverride', moduleGuildOverride],
    ['commandGuild', commandGuild],
    ['commandGuildAccess', commandGuildAccess],
    ['commandDirect', commandDirect],
    ['commandDirectAccess', commandDirectAccess],
    ['guildConfig', config],
    ['userConfig', config]
];
