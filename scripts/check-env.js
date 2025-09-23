#!/usr/bin/env node

// Script to check required environment variables
const requiredVars = [
  'NODE_ENV',
  'PORT',
  'APP_KEY',
  'LOG_LEVEL',
  'DATABASE_URL',
  'DIRECT_URL',
  'SESSION_DRIVER',
]

const optionalVars = [
  'HOST',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
]

console.log('🔍 Checking environment variables...\n')

let missingRequired = []
let missingOptional = []

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    missingRequired.push(varName)
    console.log(`❌ MISSING REQUIRED: ${varName}`)
  } else {
    console.log(`✅ ${varName}: ${varName === 'APP_KEY' ? '[HIDDEN]' : process.env[varName]}`)
  }
})

console.log('\nOptional variables:')
optionalVars.forEach(varName => {
  if (!process.env[varName]) {
    missingOptional.push(varName)
    console.log(`⚠️  OPTIONAL MISSING: ${varName}`)
  } else {
    console.log(`✅ ${varName}: ${varName.includes('KEY') ? '[HIDDEN]' : process.env[varName]}`)
  }
})

console.log(`\n📊 Summary:`)
console.log(`✅ Required variables present: ${requiredVars.length - missingRequired.length}/${requiredVars.length}`)
console.log(`⚠️  Optional variables present: ${optionalVars.length - missingOptional.length}/${optionalVars.length}`)

if (missingRequired.length > 0) {
  console.log(`\n❌ Missing required variables: ${missingRequired.join(', ')}`)
  process.exit(1)
} else {
  console.log(`\n🎉 All required environment variables are present!`)
  process.exit(0)
}
