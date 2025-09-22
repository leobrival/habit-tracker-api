import Board from '#models/board'
import User from '#models/user'
import { createBoardValidator, updateBoardValidator } from '#validators/board'
import type { HttpContext } from '@adonisjs/core/http'
import { UnitHelper } from '../constants/units.js'

// Extend HttpContext to include user property
interface AuthenticatedHttpContext extends HttpContext {
  user: User
}

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
  async index({ user, response }: AuthenticatedHttpContext) {
    const boards = await Board.query()
      .where('user_id', user.id)
      .preload('checkIns')
      .orderBy('created_at', 'desc')

    return response.ok({ boards })
  }

  async store({ request, user, response }: AuthenticatedHttpContext) {
    const data = await request.validateUsing(createBoardValidator)

    // Auto-assign unit defaults if quantity board with unit but no defaultValue specified
    let boardData = {
      ...data,
      userId: user.id,
    }

    if (data.isQuantity && data.unit && data.defaultValue === undefined) {
      const unitInfo = UnitHelper.getUnitByName(data.unit)
      if (unitInfo) {
        boardData.defaultValue = unitInfo.defaultValue
        boardData.unitSymbol = unitInfo.symbol
      }
    }

    const board = await Board.create(boardData)

    return response.created({ board })
  }

  async show({ params, user, response }: AuthenticatedHttpContext) {
    const board = await Board.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .preload('checkIns')
      .firstOrFail()

    return response.ok({ board })
  }

  async update({ params, request, user, response }: AuthenticatedHttpContext) {
    const data = await request.validateUsing(updateBoardValidator)

    const board = await Board.query().where('id', params.id).where('user_id', user.id).firstOrFail()

    board.merge(data)
    await board.save()

    return response.ok({ board })
  }

  async destroy({ params, user, response }: AuthenticatedHttpContext) {
    const board = await Board.query().where('id', params.id).where('user_id', user.id).firstOrFail()

    await board.delete()

    return response.ok({ message: 'Board deleted successfully' })
  }
}
