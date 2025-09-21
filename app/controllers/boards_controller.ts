import type { HttpContext } from '@adonisjs/core/http'
import Board from '#models/board'
import { createBoardValidator, updateBoardValidator } from '#validators/board'

/**
 * @swagger
 * components:
 *   schemas:
 *     Board:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         userId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateBoardRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *     CheckIn:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         boardId:
 *           type: integer
 *         userId:
 *           type: integer
 *         checkDate:
 *           type: string
 *           format: date
 *         notes:
 *           type: string
 *         completed:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export default class BoardsController {
  async index({ auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const boards = await Board.query()
      .where('user_id', user.id)
      .preload('checkIns')
      .orderBy('created_at', 'desc')

    return response.ok({ boards })
  }

  async store({ request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const data = await request.validateUsing(createBoardValidator)

    const board = await Board.create({
      ...data,
      userId: user.id,
    })

    return response.created({ board })
  }

  async show({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const board = await Board.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .preload('checkIns')
      .firstOrFail()

    return response.ok({ board })
  }

  async update({ params, request, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const data = await request.validateUsing(updateBoardValidator)

    const board = await Board.query().where('id', params.id).where('user_id', user.id).firstOrFail()

    board.merge(data)
    await board.save()

    return response.ok({ board })
  }

  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.use('web').user!
    const board = await Board.query().where('id', params.id).where('user_id', user.id).firstOrFail()

    await board.delete()

    return response.ok({ message: 'Board deleted successfully' })
  }
}
