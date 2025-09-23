#!/usr/bin/env node

// Simple test to see if the server can start
console.log('🧪 Testing server startup...')

// Set minimal required environment variables if not present
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production'
if (!process.env.PORT) process.env.PORT = '3333'
if (!process.env.HOST) process.env.HOST = '0.0.0.0'
if (!process.env.LOG_LEVEL) process.env.LOG_LEVEL = 'info'
if (!process.env.SESSION_DRIVER) process.env.SESSION_DRIVER = 'cookie'

// Generate a basic APP_KEY if missing (THIS IS FOR TESTING ONLY)
if (!process.env.APP_KEY) {
  console.log('⚠️  Generating temporary APP_KEY for testing...')
  process.env.APP_KEY =
    'base64:' + Buffer.from('temporary-key-for-testing-only-' + Date.now()).toString('base64')
}

// Set placeholder database URLs if missing (THIS WILL FAIL IN REAL USE)
if (!process.env.DATABASE_URL) {
  console.log('⚠️  No DATABASE_URL found - this will cause database connection errors')
  process.env.DATABASE_URL = 'postgresql://placeholder:placeholder@placeholder:5432/placeholder'
}
if (!process.env.DIRECT_URL) {
  console.log('⚠️  No DIRECT_URL found - using DATABASE_URL as fallback')
  process.env.DIRECT_URL = process.env.DATABASE_URL
}

console.log('📊 Environment check:')
console.log(`NODE_ENV: ${process.env.NODE_ENV}`)
console.log(`PORT: ${process.env.PORT}`)
console.log(`HOST: ${process.env.HOST}`)
console.log(`APP_KEY: ${process.env.APP_KEY ? '[SET]' : 'NOT SET'}`)
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '[SET]' : 'NOT SET'}`)

try {
  console.log('🚀 Attempting to start server...')
  // Import from build directory
  await import('../build/bin/server.js')
} catch (error) {
  console.error('❌ Server failed to start:')
  console.error(error.message)
  console.error(error.stack)
  process.exit(1)
}
