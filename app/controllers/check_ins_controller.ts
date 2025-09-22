import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import CheckIn from '#models/check_in'
import Board from '#models/board'
import User from '#models/user'
import { createCheckInValidator, updateCheckInValidator } from '#validators/check_in'

// Extend HttpContext to include user property
interface AuthenticatedHttpContext extends HttpContext {
  user: User
}

export default class CheckInsController {
  async index({ user, request, response }: AuthenticatedHttpContext) {
    const boardId = request.input('board_id')

    let query = CheckIn.query()
      .where('user_id', user.id)
      .preload('board')
      .orderBy('check_date', 'desc')

    if (boardId) {
      query = query.where('board_id', boardId)
    }

    const checkIns = await query

    return response.ok({ checkIns })
  }

  async store({ request, user, response }: AuthenticatedHttpContext) {
    const data = await request.validateUsing(createCheckInValidator)

    await Board.query()
      .where('id', data.boardId)
      .where('user_id', user.id)
      .firstOrFail()

    const checkIn = await CheckIn.create({
      boardId: data.boardId,
      userId: user.id,
      checkDate: DateTime.fromJSDate(data.checkDate),
      notes: data.notes,
      completed: data.completed ?? true,
    })

    await checkIn.load('board')

    return response.created({ checkIn })
  }

  async show({ params, user, response }: AuthenticatedHttpContext) {
    const checkIn = await CheckIn.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .preload('board')
      .firstOrFail()

    return response.ok({ checkIn })
  }

  async update({ params, request, user, response }: AuthenticatedHttpContext) {
    const data = await request.validateUsing(updateCheckInValidator)

    const checkIn = await CheckIn.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    if (data.boardId) {
      await Board.query().where('id', data.boardId).where('user_id', user.id).firstOrFail()
    }

    if (data.boardId !== undefined) checkIn.boardId = data.boardId
    if (data.checkDate !== undefined) checkIn.checkDate = DateTime.fromJSDate(data.checkDate)
    if (data.notes !== undefined) checkIn.notes = data.notes
    if (data.completed !== undefined) checkIn.completed = data.completed

    await checkIn.save()
    await checkIn.load('board')

    return response.ok({ checkIn })
  }

  async destroy({ params, user, response }: AuthenticatedHttpContext) {
    const checkIn = await CheckIn.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    await checkIn.delete()

    return response.ok({ message: 'Check-in deleted successfully' })
  }
}
