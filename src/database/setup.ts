import { Knex } from 'knex'

type TableBuilder = Knex.CreateTableBuilder

export const tableSetupAssoc = ((): Array<[string, (table: TableBuilder) => void]> => {
  const module = (table: TableBuilder) => {
    table.string('name').index().notNullable()
    table.boolean('isEnabled').index().notNullable()
  }

  const moduleGuildOverride = (table: TableBuilder) => {
    table.string('name').index().notNullable()
    table.string('guildId').index().notNullable()
    table.boolean('isEnabled').index().notNullable()
  }

  const commandGuild = (table: TableBuilder) => {
    table.string('name').index().notNullable()
    table.string('guildId').index().notNullable()
    table.boolean('isEnabled').index().notNullable()
  }

  const commandGuildAccess = (table: TableBuilder) => {
    table.string('name').index().notNullable()
    table.string('guildId').index().notNullable()
    table.integer('access').index().notNullable()
  }

  const commandDirect = (table: TableBuilder) => {
    table.string('name').index().notNullable()
    table.string('isEnabled').index().notNullable()
  }

  const commandDirectAccess = (table: TableBuilder) => {
    table.string('name').index().notNullable()
    table.string('isEnabled').index().notNullable()
  }

  const config = (table: TableBuilder) => {
    table.string('id').index().notNullable()
    table.string('key').index().notNullable()
    table.json('value').notNullable()
  }

  return [
    ['module', module],
    ['moduleGuildOverride', moduleGuildOverride],
    ['commandGuild', commandGuild],
    ['commandGuildAccess', commandGuildAccess],
    ['commandDirect', commandDirect],
    ['commandDirectAccess', commandDirectAccess],
    ['guildConfig', config],
    ['userConfig', config]
  ]
})()
