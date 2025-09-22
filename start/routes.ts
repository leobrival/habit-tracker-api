/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import swagger from '#config/swagger'
import router from '@adonisjs/core/services/router'
import AutoSwagger from 'adonis-autoswagger'
import { middleware } from './kernel.js'

const AuthController = () => import('#controllers/auth_controller')
const BoardsController = () => import('#controllers/boards_controller')
const UsersController = () => import('#controllers/users_controller')
const CheckInsController = () => import('#controllers/check_ins_controller')
const TestController = () => import('#controllers/test_controller')

// Health check route
router.get('/health', async ({ response }) => {
  try {
    return response.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'habit-tracker',
      uptime: Math.floor(process.uptime()) + 's',
    })
  } catch (error) {
    return response.status(503).json({
      status: 'error',
      service: 'habit-tracker',
    })
  }
})

// Swagger documentation routes
router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
})

// Test routes (only available in development)
if (process.env.NODE_ENV === 'development') {
  router.post('/api/test/confirm-email', [TestController, 'confirmEmail'])
}

// Authentication routes (using Supabase Auth)
router
  .group(() => {
    router.post('/login', [AuthController, 'login'])
    router.post('/register', [AuthController, 'register'])
    router.post('/logout', [AuthController, 'logout'])
    router.get('/me', [AuthController, 'me'])
  })
  .prefix('/api/auth')

// Protected API routes
router
  .group(() => {
    // Boards CRUD
    router.resource('boards', BoardsController).except(['create', 'edit'])

    // Users CRUD
    router.resource('users', UsersController).except(['create', 'edit', 'store'])

    // Check-ins CRUD
    router.resource('check-ins', CheckInsController).except(['create', 'edit'])
  })
  .prefix('/api')
  .use(middleware.supabaseAuth())
