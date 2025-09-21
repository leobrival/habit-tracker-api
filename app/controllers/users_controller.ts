import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { updateUserValidator } from '#validators/user'

export default class UsersController {
  async index({ response }: HttpContext) {
    const users = await User.query().orderBy('created_at', 'desc')
    return response.ok({ users })
  }

  async show({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    return response.ok({ user })
  }

  async update({ params, request, auth, response }: HttpContext) {
    const currentUser = auth.use('web').user!
    const data = await request.validateUsing(updateUserValidator)

    if (currentUser.id !== Number.parseInt(params.id)) {
      return response.forbidden({ message: 'You can only update your own profile' })
    }

    const user = await User.findOrFail(params.id)
    user.merge(data)
    await user.save()

    return response.ok({ user })
  }

  async destroy({ params, auth, response }: HttpContext) {
    const currentUser = auth.use('web').user!

    if (currentUser.id !== Number.parseInt(params.id)) {
      return response.forbidden({ message: 'You can only delete your own account' })
    }

    const user = await User.findOrFail(params.id)
    await user.delete()

    return response.ok({ message: 'User deleted successfully' })
  }
}
