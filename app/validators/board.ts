import vine from '@vinejs/vine'

export const createBoardValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    isQuantity: vine.boolean().optional(),
    defaultValue: vine.number().optional(),
    unit: vine.string().trim().optional(),
    unitSymbol: vine.string().trim().optional(),
  })
)

export const updateBoardValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255).optional(),
    isQuantity: vine.boolean().optional(),
    defaultValue: vine.number().optional(),
    unit: vine.string().trim().optional(),
    unitSymbol: vine.string().trim().optional(),
  })
)
