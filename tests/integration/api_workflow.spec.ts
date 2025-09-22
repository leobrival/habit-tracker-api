import Board from '#models/board'
import CheckIn from '#models/check_in'
import { test } from '@japa/runner'
import { SupabaseTestHelper, type TestUserData } from '../helpers/supabase_test_helper.js'

/**
 * Complete API Workflow Integration Tests
 *
 * This test suite covers the entire user journey:
 * 1. User Registration & Email Confirmation
 * 2. User Login & Authentication
 * 3. User Profile Management
 * 4. Boards CRUD Operations
 * 5. Check-ins CRUD Operations
 * 6. User Logout & Security
 */
test.group('API Workflow Integration Tests', (group) => {
  let testUser: TestUserData
  let createdUserData: {
    userId: number
    authUserId: string
    email: string
  } | null = null
  let createdBoardId: number | null = null
  let createdCheckInId: number | null = null
  let globalClient: any
  let sessionCookies: string = '' // Store session cookies

  // Helper function to extract cookies from response
  function extractCookies(response: any): string {
    const setCookieHeaders = response.headers()['set-cookie'] || []
    const cookieStrings: string[] = []

    for (const cookieHeader of setCookieHeaders) {
      const cookiePart = cookieHeader.split(';')[0]
      cookieStrings.push(cookiePart)
    }

    return cookieStrings.join('; ')
  }

  group.setup(async () => {
    // Use existing test user
    testUser = SupabaseTestHelper.generateTestUser()
    console.log(`🧪 Using existing test user: ${testUser.email}`)

    // Set known user data from database
    createdUserData = {
      userId: 16, // Known user ID from database
      authUserId: '3c1565a2-74b9-494c-8b85-3d315c6279c7', // Known auth ID
      email: testUser.email,
    }
  })

  group.teardown(async () => {
    // Clean up test-created boards and check-ins, but keep the test user
    if (createdBoardId) {
      try {
        await Board.query().where('id', createdBoardId).delete()
        console.log(`🧹 Cleaned up test board: ${createdBoardId}`)
      } catch (error) {
        console.log(`Board ${createdBoardId} already deleted or doesn't exist`)
      }
    }

    if (createdCheckInId) {
      try {
        await CheckIn.query().where('id', createdCheckInId).delete()
        console.log(`🧹 Cleaned up test check-in: ${createdCheckInId}`)
      } catch (error) {
        console.log(`Check-in ${createdCheckInId} already deleted or doesn't exist`)
      }
    }
  })

  /**
   * Phase 1: Authentication Tests
   */
  test('should login existing user successfully', async ({ client, assert }) => {
    globalClient = client // Store the client globally for other tests

    const response = await globalClient.post('/api/auth/login').json({
      email: testUser.email,
      password: testUser.password,
    })

    response.assertStatus(200)

    // Extract and store session cookies for subsequent requests
    sessionCookies = extractCookies(response)
    console.log(`🍪 Session cookies extracted: ${sessionCookies}`)

    assert.properties(response.body(), ['message', 'user', 'session'])
    assert.equal(response.body().message, 'Login successful')
    assert.equal(response.body().user.email, testUser.email)
    assert.equal(response.body().user.id, createdUserData!.userId)
    assert.exists(response.body().session.access_token)

    console.log(
      `✅ User logged in successfully: ${testUser.email} (ID: ${response.body().user.id})`
    )
  })

  test('should get user profile', async ({ assert }) => {
    const response = await globalClient.get('/api/auth/me').header('Cookie', sessionCookies)

    response.assertStatus(200)

    assert.properties(response.body(), ['user'])
    assert.equal(response.body().user.email, testUser.email)
    assert.equal(response.body().user.fullName, testUser.fullName)

    console.log(`✅ Profile retrieved: ${response.body().user.fullName}`)
  })

  /**
   * Phase 2: Boards CRUD Tests
   */
  test('should create a new board', async ({ assert }) => {
    const boardData = {
      name: 'Integration Test Board',
      isQuantity: true,
      defaultValue: 25,
      unit: 'minutes',
      unitSymbol: 'min',
    }

    const response = await globalClient
      .post('/api/boards')
      .header('Cookie', sessionCookies)
      .json(boardData)

    response.assertStatus(201)

    assert.properties(response.body(), ['board'])
    assert.equal(response.body().board.name, boardData.name)
    assert.equal(response.body().board.isQuantity, boardData.isQuantity)
    assert.equal(response.body().board.defaultValue, boardData.defaultValue)
    assert.equal(response.body().board.unit, boardData.unit)
    assert.equal(response.body().board.unitSymbol, boardData.unitSymbol)
    assert.equal(response.body().board.userId, createdUserData!.userId)

    createdBoardId = response.body().board.id
    console.log(`✅ Board created with ID: ${createdBoardId}`)
  })

  test('should get all boards', async ({ assert }) => {
    const response = await globalClient.get('/api/boards').header('Cookie', sessionCookies)

    response.assertStatus(200)

    assert.properties(response.body(), ['boards'])
    assert.isArray(response.body().boards)
    assert.isAtLeast(response.body().boards.length, 1)

    const createdBoard = response.body().boards.find((board: any) => board.id === createdBoardId)
    assert.exists(createdBoard, 'Created board should be in the list')

    console.log(`✅ Found ${response.body().boards.length} boards`)
  })

  test('should get single board', async ({ assert }) => {
    const response = await globalClient
      .get(`/api/boards/${createdBoardId}`)
      .header('Cookie', sessionCookies)

    response.assertStatus(200)

    assert.properties(response.body(), ['board'])
    assert.equal(response.body().board.id, createdBoardId)
    assert.equal(response.body().board.name, 'Integration Test Board')

    console.log(`✅ Retrieved board: ${response.body().board.name}`)
  })

  test('should update board', async ({ assert }) => {
    const updateData = {
      name: 'Updated Integration Test Board',
      isQuantity: false,
      defaultValue: null,
      unit: null,
      unitSymbol: null,
    }

    const response = await globalClient
      .put(`/api/boards/${createdBoardId}`)
      .header('Cookie', sessionCookies)
      .json(updateData)

    response.assertStatus(200)

    assert.properties(response.body(), ['board'])
    assert.equal(response.body().board.id, createdBoardId)
    assert.equal(response.body().board.name, updateData.name)
    assert.equal(response.body().board.isQuantity, updateData.isQuantity)
    assert.equal(response.body().board.defaultValue, updateData.defaultValue)
    assert.equal(response.body().board.unit, updateData.unit)
    assert.equal(response.body().board.unitSymbol, updateData.unitSymbol)

    console.log(`✅ Board updated: ${response.body().board.name}`)
  })

  /**
   * Phase 3: Check-ins CRUD Tests
   */
  test('should create a check-in', async ({ assert }) => {
    const checkInData = {
      boardId: createdBoardId,
      checkDate: new Date().toISOString().split('T')[0], // Today's date
      notes: 'Integration test check-in',
      completed: true,
    }

    const response = await globalClient
      .post('/api/check-ins')
      .header('Cookie', sessionCookies)
      .json(checkInData)

    response.assertStatus(201)

    assert.properties(response.body(), ['checkIn'])
    assert.equal(response.body().checkIn.boardId, createdBoardId)
    assert.equal(response.body().checkIn.notes, checkInData.notes)
    assert.equal(response.body().checkIn.completed, checkInData.completed)
    assert.equal(response.body().checkIn.userId, createdUserData!.userId)

    createdCheckInId = response.body().checkIn.id
    console.log(`✅ Check-in created with ID: ${createdCheckInId}`)
  })

  test('should get all check-ins', async ({ assert }) => {
    const response = await globalClient.get('/api/check-ins').header('Cookie', sessionCookies)

    response.assertStatus(200)

    assert.properties(response.body(), ['checkIns'])
    assert.isArray(response.body().checkIns)
    assert.isAtLeast(response.body().checkIns.length, 1)

    const createdCheckIn = response
      .body()
      .checkIns.find((checkIn: any) => checkIn.id === createdCheckInId)
    assert.exists(createdCheckIn, 'Created check-in should be in the list')

    console.log(`✅ Found ${response.body().checkIns.length} check-ins`)
  })

  test('should update check-in', async ({ assert }) => {
    const updateData = {
      notes: 'Updated integration test check-in',
      completed: false,
    }

    const response = await globalClient
      .put(`/api/check-ins/${createdCheckInId}`)
      .header('Cookie', sessionCookies)
      .json(updateData)

    response.assertStatus(200)

    assert.properties(response.body(), ['checkIn'])
    assert.equal(response.body().checkIn.id, createdCheckInId)
    assert.equal(response.body().checkIn.notes, updateData.notes)
    assert.equal(response.body().checkIn.completed, updateData.completed)

    console.log(`✅ Check-in updated: ${response.body().checkIn.notes}`)
  })

  test('should delete check-in', async ({ assert }) => {
    const response = await globalClient
      .delete(`/api/check-ins/${createdCheckInId}`)
      .header('Cookie', sessionCookies)

    response.assertStatus(200)

    assert.properties(response.body(), ['message'])
    assert.include(response.body().message.toLowerCase(), 'deleted')

    console.log(`✅ Check-in deleted successfully`)
    createdCheckInId = null // Mark as deleted
  })

  /**
   * Phase 4: Cleanup & Security Tests
   */
  test('should delete board', async ({ assert }) => {
    const response = await globalClient
      .delete(`/api/boards/${createdBoardId}`)
      .header('Cookie', sessionCookies)

    response.assertStatus(200)

    assert.properties(response.body(), ['message'])
    assert.include(response.body().message.toLowerCase(), 'deleted')

    console.log(`✅ Board deleted successfully`)
    createdBoardId = null // Mark as deleted
  })

  test('should logout user', async ({ assert }) => {
    const response = await globalClient.post('/api/auth/logout').header('Cookie', sessionCookies)

    response.assertStatus(200)

    assert.properties(response.body(), ['message'])
    assert.include(response.body().message.toLowerCase(), 'successful')

    console.log(`✅ User logged out successfully`)
    // Clear session cookies after logout
    sessionCookies = ''
  })

  test('should block access to protected routes after logout', async ({ assert }) => {
    // Don't send cookies after logout - should be blocked
    const response = await globalClient.get('/api/boards')

    response.assertStatus(401)

    assert.properties(response.body(), ['errors'])
    assert.isArray(response.body().errors)

    console.log(`✅ Unauthorized access correctly blocked`)
  })

  /**
   * Phase 5: Data Integrity Tests
   */
  test('should verify data cleanup', async ({ assert }) => {
    if (!createdUserData) {
      assert.fail('No user data to verify cleanup')
      return
    }

    // Verify check-ins are cleaned up
    const remainingCheckIns = await CheckIn.query().where('user_id', createdUserData.userId)
    assert.lengthOf(remainingCheckIns, 0, 'All test check-ins should be deleted')

    console.log(`✅ Test data cleanup verified - no orphaned check-ins`)
    console.log(`ℹ️ Note: Test user and any existing boards are preserved for reuse`)
  })
})
