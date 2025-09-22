import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Board from './board.js'
import User from './user.js'

export default class CheckIn extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare boardId: number

  @column()
  declare userId: number

  @column.date()
  declare checkDate: DateTime

  @column()
  declare notes: string | null

  @column()
  declare completed: boolean

  @column()
  declare value: number | null

  @column()
  declare unit: string | null

  @column()
  declare unitSymbol: string | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Board)
  declare board: BelongsTo<typeof Board>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
