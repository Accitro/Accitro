import knex, { Knex } from 'knex'

import { Client } from '../core/client'
import { tableSetupAssoc } from './setup'

export interface DatabaseCredentials {
  host: string
  name: string
  password: string
  username: string
}

export interface DatabaseRow {
  [key: string]: any
}

export class TableQueryBuilder {
  public constructor (query: QueryBuilder, name: string) {
    this.queryBuilder = query

    this.insert = query.insert.bind(query, name)
    this.alter = query.alter.bind(query, name)
    this.drop = query.drop.bind(query, name)
    this.select = query.select.bind(query, name)
    this.count = query.count.bind(query, name)
    this.has = query.has.bind(query, name)
  }

  public readonly queryBuilder: QueryBuilder

  public readonly insert: (data: DatabaseRow) => ReturnType<QueryBuilder['insert']>
  public readonly alter: (where: DatabaseRow, data: DatabaseRow) => ReturnType<QueryBuilder['alter']>
  public readonly drop: (where: DatabaseRow) => ReturnType<QueryBuilder['drop']>
  public readonly select: (where?: DatabaseRow, select?: Array<string> | '*') => ReturnType<QueryBuilder['select']>
  public readonly count: (where?: DatabaseRow) => ReturnType<QueryBuilder['count']>
  public readonly has: (where: DatabaseRow) => ReturnType<QueryBuilder['has']>
}

export class QueryBuilder {
  public constructor (client: Client, credentials: DatabaseCredentials) {
    this.client = client
    this.knex = knex({
      connection: {
        host: credentials.host,
        database: credentials.name,
        user: credentials.username,
        password: credentials.password
      },
      client: 'mysql2'
    })
    this.tableManagers = {}
    this.client.on('ready', () => this.setupTables())
  }

  public readonly client: Client
  public readonly knex: Knex

  public get schema () { return this.knex.schema }

  public readonly tableManagers: { [key: string]: TableQueryBuilder }
  public getTableManager (name: string) {
    const { tableManagers } = this
    return tableManagers[name] || (tableManagers[name] = new TableQueryBuilder(this, name))
  }

  public insert (table: string, data: DatabaseRow) {
    return this.knex.table(table).insert(data)
  }

  public alter (table: string, where: DatabaseRow, data: DatabaseRow) {
    return this.knex.table(table).where(where).update(data)
  }

  public drop (table: string, where: DatabaseRow) {
    return this.knex.table(table).where(where).delete()
  }

  public select (table: string, where?: DatabaseRow, select?: Array<string> | '*') {
    return (((table) => select ? table.select(...(Array.isArray(select) ? select : [select])) : table)(this.knex.table(table))).where({ ...where })
  }

  public async count (table: string, where?: DatabaseRow) {
    return Number((await ((knex) => where ? knex.where(where) : knex)(this.knex.table(table)).count().first())?.count) || 0
  }

  public async has (table: string, where: DatabaseRow) {
    return !!await this.select(table, where).first()
  }

  public hasTable (table: string) {
    return this.schema.hasTable(table)
  }

  public createTable (table: string, callback: (builder: Knex.CreateTableBuilder) => any) {
    return this.schema.createTable(table, callback)
  }

  public async setupTables () {
    const createTableIfNotExists = async (table: string, callback: (table: Knex.CreateTableBuilder) => void) => {
      if (!await this.hasTable(table)) {
        await this.createTable(table, (table) => {
          table.charset('utf8')

          callback(table)
        })
      }
    }

    await Promise.all(tableSetupAssoc.map((table) => createTableIfNotExists(table[0], table[1])))
  }
}
