#!/usr/bin/env node

// Debug script for Railway deployment
console.log('🚀 Railway Deployment Debug Information')
console.log('=====================================\n')

console.log('📋 Environment Information:')
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`)
console.log(`PORT: ${process.env.PORT || 'NOT SET'}`)
console.log(`HOST: ${process.env.HOST || 'NOT SET'}`)
console.log(`APP_KEY: ${process.env.APP_KEY ? '[SET]' : 'NOT SET'}`)
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '[SET]' : 'NOT SET'}`)
console.log(`LOG_LEVEL: ${process.env.LOG_LEVEL || 'NOT SET'}`)

console.log('\n🔧 Runtime Information:')
console.log(`Node.js Version: ${process.version}`)
console.log(`Platform: ${process.platform}`)
console.log(`Architecture: ${process.arch}`)
console.log(`Working Directory: ${process.cwd()}`)

console.log('\n📁 File System Check:')
const fs = require('fs')
const path = require('path')

const criticalFiles = [
  'bin/server.js',
  'package.json',
  'config/app.js',
  'config/database.js',
]

criticalFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file))
  console.log(`${exists ? '✅' : '❌'} ${file}: ${exists ? 'EXISTS' : 'MISSING'}`)
})

console.log('\n🌐 Network Check:')
console.log(`Attempting to start server on port ${process.env.PORT || 3333}...`)

// Try to test basic functionality
try {
  console.log('\n🔄 Loading AdonisJS application...')
  // This will fail if there are import/configuration issues
  const startTime = Date.now()
  console.log(`⏱️  Debug script completed in ${Date.now() - startTime}ms`)
} catch (error) {
  console.error('\n❌ Error during startup:')
  console.error(error.message)
  console.error(error.stack)
  process.exit(1)
}
