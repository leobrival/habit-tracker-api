import vine from '@vinejs/vine'

export const createCheckInValidator = vine.compile(
  vine.object({
    boardId: vine.number().positive(),
    checkDate: vine.date(),
    notes: vine.string().trim().optional(),
    completed: vine.boolean().optional(),
    value: vine.number().optional(),
    unit: vine.string().trim().optional(),
    unitSymbol: vine.string().trim().optional(),
  })
)

export const updateCheckInValidator = vine.compile(
  vine.object({
    boardId: vine.number().positive().optional(),
    checkDate: vine.date().optional(),
    notes: vine.string().trim().optional(),
    completed: vine.boolean().optional(),
    value: vine.number().optional(),
    unit: vine.string().trim().optional(),
    unitSymbol: vine.string().trim().optional(),
  })
)
