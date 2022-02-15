"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tableSetupAssoc = void 0;
exports.tableSetupAssoc = (() => {
    const module = (table) => {
        table.string('name').index().notNullable();
        table.boolean('isEnabled').index().notNullable();
    };
    const moduleGuildOverride = (table) => {
        table.string('name').index().notNullable();
        table.string('guildId').index().notNullable();
        table.boolean('isEnabled').index().notNullable();
    };
    const commandGuild = (table) => {
        table.string('name').index().notNullable();
        table.string('guildId').index().notNullable();
        table.boolean('isEnabled').index().notNullable();
    };
    const commandGuildAccess = (table) => {
        table.string('name').index().notNullable();
        table.string('guildId').index().notNullable();
        table.integer('access').index().notNullable();
    };
    const commandDirect = (table) => {
        table.string('name').index().notNullable();
        table.string('isEnabled').index().notNullable();
    };
    const commandDirectAccess = (table) => {
        table.string('name').index().notNullable();
        table.string('isEnabled').index().notNullable();
    };
    const config = (table) => {
        table.string('id').index().notNullable();
        table.string('key').index().notNullable();
        table.json('value').notNullable();
    };
    return [
        ['module', module],
        ['moduleGuildOverride', moduleGuildOverride],
        ['commandGuild', commandGuild],
        ['commandGuildAccess', commandGuildAccess],
        ['commandDirect', commandDirect],
        ['commandDirectAccess', commandDirectAccess],
        ['guildConfig', config],
        ['userConfig', config]
    ];
})();
