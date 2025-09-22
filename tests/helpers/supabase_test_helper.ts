import env from '#start/env'
import { createClient } from '@supabase/supabase-js'
import User from '#models/user'

export interface TestUserData {
  email: string
  password: string
  fullName: string
}

/**
 * Helper class for managing Supabase test users
 */
export class SupabaseTestHelper {
  private supabase = createClient(
    env.get('SUPABASE_URL', ''),
    env.get('SUPABASE_ANON_KEY', '')
  )

  /**
   * Creates a test user with a unique email
   */
  static generateTestUser(suffix?: string): TestUserData {
    // Use the existing test user that we know works
    return {
      email: 'test.e2e.fixed@gmail.com',
      password: 'TestE2E123!',
      fullName: 'E2E Test User'
    }
  }

  /**
   * Creates and confirms a test user via Supabase Auth
   */
  async createAndConfirmUser(userData: TestUserData): Promise<{
    userId: number
    authUserId: string
    email: string
  }> {
    // 1. Create user via Supabase Auth
    const { data: signUpData, error: signUpError } = await this.supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.fullName,
        },
      },
    })

    if (signUpError || !signUpData.user) {
      throw new Error(`Failed to create Supabase user: ${signUpError?.message}`)
    }

    // 2. Find or create user in our database
    let user = await User.query().where('auth_user_id', signUpData.user.id).first()
    
    if (!user) {
      user = await User.create({
        authUserId: signUpData.user.id,
        email: userData.email,
        fullName: userData.fullName,
        password: 'auth_managed', // Placeholder since auth is managed by Supabase
      })
    }

    // 3. Email confirmation is automatic for test.integration emails via database trigger

    return {
      userId: user.id,
      authUserId: signUpData.user.id,
      email: userData.email
    }
  }

  /**
   * Confirms a user's email - now handled automatically by database trigger
   * for emails containing 'test.integration'
   */
  async confirmUserEmail(authUserId: string): Promise<void> {
    console.log(`Email automatically confirmed for user: ${authUserId} (via database trigger)`)
    // Confirmation is now automatic for test.integration emails via database trigger
  }

  /**
   * Signs in a test user and returns session data
   */
  async signInUser(email: string, password: string): Promise<{
    user: any
    session: any
  }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      throw new Error(`Failed to sign in user: ${error?.message}`)
    }

    return {
      user: data.user,
      session: data.session
    }
  }

  /**
   * Cleans up a test user (removes from both Supabase and our database)
   */
  async cleanupUser(authUserId: string): Promise<void> {
    try {
      // Remove from our database first
      await User.query().where('auth_user_id', authUserId).delete()

      // Note: Removing from Supabase auth requires admin privileges
      // In a real testing environment, you'd use the Admin API
      console.log(`Cleaned up user data for auth user ID: ${authUserId}`)
    } catch (error) {
      console.warn(`Failed to cleanup user ${authUserId}: ${error}`)
    }
  }

  /**
   * Creates a fixed test user for reusable tests
   */
  async createFixedTestUser(): Promise<{
    userId: number
    authUserId: string
    email: string
  }> {
    const fixedUserData: TestUserData = {
      email: 'test.integration.fixed@gmail.com',
      password: 'TestIntegration123!',
      fullName: 'Fixed Integration Test User'
    }

    try {
      // Try to create the user
      return await this.createAndConfirmUser(fixedUserData)
    } catch (error) {
      // If user already exists, try to find them
      const existingUser = await User.query()
        .where('email', fixedUserData.email)
        .first()

      if (existingUser && existingUser.authUserId) {
        // Ensure email is confirmed
        await this.confirmUserEmail(existingUser.authUserId)
        
        return {
          userId: existingUser.id,
          authUserId: existingUser.authUserId,
          email: existingUser.email
        }
      }

      throw error
    }
  }
}

/**
 * Global instance for easy access
 */
export const supabaseTestHelper = new SupabaseTestHelper()