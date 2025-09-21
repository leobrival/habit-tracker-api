import User from '#models/user'
import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  env.get('SUPABASE_URL'),
  env.get('SUPABASE_ANON_KEY')
)

/**
 * @swagger
 * components:
 *   schemas:
 *     SupabaseLoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *     SupabaseRegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - fullName
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *         fullName:
 *           type: string
 */

export default class SupabaseAuthController {
  /**
   * @swagger
   * /api/auth/supabase/login:
   *   post:
   *     tags:
   *       - Supabase Authentication
   *     summary: Login user with Supabase Auth
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SupabaseLoginRequest'
   *     responses:
   *       200:
   *         description: Login successful
   *       401:
   *         description: Invalid credentials
   */
  async login({ request, response, session }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return response.status(401).json({
        message: 'Invalid credentials',
        error: error.message,
      })
    }

    if (!data.user) {
      return response.status(401).json({
        message: 'Authentication failed',
      })
    }

    // Get the user from public.users table
    const user = await User.query().where('auth_user_id', data.user.id).first()

    if (!user) {
      return response.status(404).json({
        message: 'User profile not found',
      })
    }

    // Store user session
    session.put('auth_user_id', data.user.id)
    session.put('user_id', user.id)

    return response.ok({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        authUserId: data.user.id,
      },
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
      },
    })
  }

  /**
   * @swagger
   * /api/auth/supabase/register:
   *   post:
   *     tags:
   *       - Supabase Authentication
   *     summary: Register user with Supabase Auth
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SupabaseRegisterRequest'
   *     responses:
   *       201:
   *         description: Registration successful
   *       400:
   *         description: Registration failed
   */
  async register({ request, response, session }: HttpContext) {
    const { email, password, fullName } = request.only(['email', 'password', 'fullName'])

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      return response.status(400).json({
        message: 'Registration failed',
        error: error.message,
      })
    }

    if (!data.user) {
      return response.status(400).json({
        message: 'Registration failed',
      })
    }

    // The user profile should be automatically created by the trigger
    // Wait a moment and try to find it
    let user = await User.query().where('auth_user_id', data.user.id).first()

    if (!user) {
      // If trigger didn't work, create manually
      user = await User.create({
        authUserId: data.user.id,
        email: data.user.email!,
        fullName: fullName,
        password: 'auth_managed', // Placeholder
      })
    }

    // Store user session
    session.put('auth_user_id', data.user.id)
    session.put('user_id', user.id)

    return response.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        authUserId: data.user.id,
      },
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
      },
    })
  }

  /**
   * @swagger
   * /api/auth/supabase/logout:
   *   post:
   *     tags:
   *       - Supabase Authentication
   *     summary: Logout user
   *     responses:
   *       200:
   *         description: Logout successful
   */
  async logout({ response, session }: HttpContext) {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return response.status(400).json({
        message: 'Logout failed',
        error: error.message,
      })
    }

    session.clear()

    return response.ok({
      message: 'Logout successful',
    })
  }

  /**
   * @swagger
   * /api/auth/supabase/me:
   *   get:
   *     tags:
   *       - Supabase Authentication
   *     summary: Get current user
   *     responses:
   *       200:
   *         description: User information
   *       401:
   *         description: Not authenticated
   */
  async me({ response, session }: HttpContext) {
    const authUserId = session.get('auth_user_id')
    const userId = session.get('user_id')

    if (!authUserId || !userId) {
      return response.status(401).json({
        message: 'Not authenticated',
      })
    }

    const user = await User.find(userId)

    if (!user) {
      return response.status(404).json({
        message: 'User not found',
      })
    }

    return response.ok({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        authUserId: authUserId,
      },
    })
  }
}
