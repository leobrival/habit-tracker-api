import vine from '@vinejs/vine'

export const createBoardValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    description: vine.string().trim().optional(),
  })
)

export const updateBoardValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255).optional(),
    description: vine.string().trim().optional(),
  })
)
