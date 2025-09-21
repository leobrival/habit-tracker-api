/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'

const AuthController = () => import('#controllers/auth_controller')
const BoardsController = () => import('#controllers/boards_controller')
const UsersController = () => import('#controllers/users_controller')
const CheckInsController = () => import('#controllers/check_ins_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// Swagger Documentation Routes
router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
})

// Authentication routes
router
  .group(() => {
    router.post('/login', [AuthController, 'login'])
    router.post('/register', [AuthController, 'register'])
    router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
    router.get('/me', [AuthController, 'me']).use(middleware.auth())
    router.post('/refresh-token', [AuthController, 'refreshToken']).use(middleware.auth())
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
  .use(middleware.auth())
