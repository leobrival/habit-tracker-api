import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Supabase Auth middleware pour les routes protégées
 * Vérifie la session Supabase stockée dans la session AdonisJS
 */
export default class SupabaseAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { session, response } = ctx

    try {
      console.log('SupabaseAuthMiddleware: Starting authentication check')

      // Vérifier si l'utilisateur est connecté via Supabase
      const authUserId = session.get('auth_user_id')
      const userId = session.get('user_id')

      console.log('SupabaseAuthMiddleware: authUserId =', authUserId, 'userId =', userId)

      if (!authUserId || !userId) {
        console.log('SupabaseAuthMiddleware: Missing auth or user ID')
        return response.status(401).json({
          errors: [{ message: 'Unauthorized access' }],
        })
      }

      // Récupérer l'utilisateur depuis la base de données
      const user = await User.find(userId)
      console.log('SupabaseAuthMiddleware: Found user =', user?.email)

      if (!user || user.authUserId !== authUserId) {
        console.log('SupabaseAuthMiddleware: User not found or auth mismatch')
        return response.status(401).json({
          errors: [{ message: 'Unauthorized access' }],
        })
      }

      // Ajouter l'utilisateur au contexte pour l'utiliser dans les contrôleurs
      ;(ctx as any).user = user
      console.log('SupabaseAuthMiddleware: User added to context successfully')

      return next()
    } catch (error) {
      console.error('SupabaseAuthMiddleware error:', error)
      return response.status(500).json({
        errors: [{ message: 'Internal server error' }],
      })
    }
  }
}
