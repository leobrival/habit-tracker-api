import path from 'node:path'
import { fileURLToPath } from 'node:url'

export default {
  path: path.dirname(fileURLToPath(import.meta.url)) + '/../',
  title: 'Habit Tracker API',
  version: '1.0.0',
  description: 'API for managing habit tracking with boards and check-ins',
  tagIndex: 2,
  info: {
    title: 'Habit Tracker API',
    version: '1.0.0',
    description: 'A comprehensive API for tracking habits with users, boards, and check-ins functionality',
  },
  snakeCase: false,
  debug: false,
  ignore: ['/'],
  preferredPutPatch: 'PUT',
  common: {
    parameters: {},
    headers: {},
  },
  securitySchemes: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
  authMiddlewares: ['auth', 'auth:api'],
  defaultSecurityScheme: 'BearerAuth',
  persistAuthorization: true,
  showFullPath: false,
}