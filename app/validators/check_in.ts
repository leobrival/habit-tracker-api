import vine from '@vinejs/vine'

export const createCheckInValidator = vine.compile(
  vine.object({
    boardId: vine.number().positive(),
    checkDate: vine.date(),
    notes: vine.string().trim().optional(),
    completed: vine.boolean().optional(),
  })
)

export const updateCheckInValidator = vine.compile(
  vine.object({
    boardId: vine.number().positive().optional(),
    checkDate: vine.date().optional(),
    notes: vine.string().trim().optional(),
    completed: vine.boolean().optional(),
  })
)
