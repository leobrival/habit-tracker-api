import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

// Extend HttpContext to include user property
interface AuthenticatedHttpContext extends HttpContext {
  user: User
}

export default class TestController {
  async test({ user, response }: AuthenticatedHttpContext) {
    return response.json({
      message: 'Test successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    })
  }

  /**
   * Confirm user email for testing purposes
   * WARNING: This should only be available in development environment
   */
  async confirmEmail({ request, response }: HttpContext) {
    // Security check - only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return response.status(403).json({
        message: 'This endpoint is only available in development',
      })
    }

    const { email } = request.only(['email'])

    if (!email) {
      return response.status(400).json({
        message: 'Email is required',
      })
    }

    try {
      // This is a simulation since we don't have access to the service role key
      // In a real E2E test environment, you would use the Supabase Admin API
      // For now, we'll just return success to indicate the email would be confirmed

      return response.ok({
        message: 'Email confirmation simulated successfully',
        email: email,
        note: 'In a production E2E test, this would actually confirm the user in Supabase Auth',
      })
    } catch (error: any) {
      return response.status(500).json({
        message: 'Email confirmation failed',
        error: error.message,
      })
    }
  }
}
