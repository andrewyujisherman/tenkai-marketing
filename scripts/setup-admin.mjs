/**
 * Setup admin user — run once to create/update Andrew's admin account
 * Usage: node scripts/setup-admin.mjs
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mvhuxiswjtomvebcgpqr.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY env var')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const ADMIN_EMAIL = 'andrewyujisherman@gmail.com'
const ADMIN_PASSWORD = process.env.ADMIN_MASTER_PASSWORD || 'Tenkai2026!admin'

async function main() {
  // Check if user exists
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const existing = users?.find(u => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase())

  if (existing) {
    console.log(`Found existing user ${existing.id}, updating...`)
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
      app_metadata: { role: 'admin' },
    })
    if (error) {
      console.error('Update failed:', error.message)
      process.exit(1)
    }
    console.log('Updated admin user with role: admin')
  } else {
    console.log('Creating new admin user...')
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      app_metadata: { role: 'admin' },
    })
    if (error) {
      console.error('Create failed:', error.message)
      process.exit(1)
    }
    console.log('Created admin user:', data.user.id)
  }

  console.log(`\nAdmin ready:`)
  console.log(`  Email: ${ADMIN_EMAIL}`)
  console.log(`  Password: ${ADMIN_PASSWORD}`)
  console.log(`  Login: https://tenkai-marketing.vercel.app/auth/login`)
}

main()
