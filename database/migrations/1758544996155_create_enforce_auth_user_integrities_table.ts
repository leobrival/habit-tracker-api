import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Clean up any existing users with NULL or invalid auth_user_id
    // This should be safe as we want to enforce integrity
    this.schema.raw('DELETE FROM users WHERE auth_user_id IS NULL')
    this.schema.raw('DELETE FROM users WHERE auth_user_id NOT IN (SELECT id FROM auth.users)')

    // Step 1: Temporarily drop ALL existing policies that might reference auth_user_id
    this.schema.raw('DROP POLICY IF EXISTS "Users can view own profile" ON users')
    this.schema.raw('DROP POLICY IF EXISTS "Users can update own profile" ON users')
    this.schema.raw('DROP POLICY IF EXISTS "Users can create boards" ON boards')
    this.schema.raw('DROP POLICY IF EXISTS "Users can view own boards" ON boards')
    this.schema.raw('DROP POLICY IF EXISTS "Users can update own boards" ON boards')
    this.schema.raw('DROP POLICY IF EXISTS "Users can delete own boards" ON boards')
    this.schema.raw('DROP POLICY IF EXISTS "Users can view own check-ins" ON check_ins')
    this.schema.raw('DROP POLICY IF EXISTS "Users can create check-ins" ON check_ins')
    this.schema.raw('DROP POLICY IF EXISTS "Users can update own check-ins" ON check_ins')
    this.schema.raw('DROP POLICY IF EXISTS "Users can delete own check-ins" ON check_ins')

    // Step 2: Make auth_user_id NOT NULL using raw SQL
    this.schema.raw('ALTER TABLE users ALTER COLUMN auth_user_id SET NOT NULL')

    // Step 3: Recreate the original user policies
    this.schema.raw(`
      CREATE POLICY "Users can view own profile" ON users
        FOR SELECT USING (auth.uid() = auth_user_id)
    `)

    this.schema.raw(`
      CREATE POLICY "Users can update own profile" ON users
        FOR UPDATE USING (auth.uid() = auth_user_id)
    `)

    // Step 3b: Recreate boards policies
    this.schema.raw(`
      CREATE POLICY "Users can view own boards" ON boards
        FOR SELECT USING (
          user_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
          )
        )
    `)

    this.schema.raw(`
      CREATE POLICY "Users can create boards" ON boards
        FOR INSERT WITH CHECK (
          user_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
          )
        )
    `)

    this.schema.raw(`
      CREATE POLICY "Users can update own boards" ON boards
        FOR UPDATE USING (
          user_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
          )
        )
    `)

    this.schema.raw(`
      CREATE POLICY "Users can delete own boards" ON boards
        FOR DELETE USING (
          user_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
          )
        )
    `)

    // Step 3c: Recreate check_ins policies
    this.schema.raw(`
      CREATE POLICY "Users can view own check-ins" ON check_ins
        FOR SELECT USING (
          user_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
          )
        )
    `)

    this.schema.raw(`
      CREATE POLICY "Users can create check-ins" ON check_ins
        FOR INSERT WITH CHECK (
          user_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
          )
        )
    `)

    this.schema.raw(`
      CREATE POLICY "Users can update own check-ins" ON check_ins
        FOR UPDATE USING (
          user_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
          )
        )
    `)

    this.schema.raw(`
      CREATE POLICY "Users can delete own check-ins" ON check_ins
        FOR DELETE USING (
          user_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
          )
        )
    `)

    // Step 4: Create validation function for auth_user_id integrity
    this.schema.raw(`
      CREATE OR REPLACE FUNCTION validate_auth_user()
      RETURNS TRIGGER AS $$
      BEGIN
          -- Check if auth_user_id exists in auth.users
          IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.auth_user_id) THEN
              RAISE EXCEPTION 'auth_user_id must reference existing auth.users record';
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    // Step 5: Create trigger for validation
    this.schema.raw('DROP TRIGGER IF EXISTS validate_auth_user_trigger ON users')
    this.schema.raw(`
      CREATE TRIGGER validate_auth_user_trigger
          BEFORE INSERT OR UPDATE ON users
          FOR EACH ROW EXECUTE FUNCTION validate_auth_user();
    `)

    // Step 6: Add RLS policy for INSERT operations
    this.schema.raw('DROP POLICY IF EXISTS "Only auth users can insert" ON users')
    this.schema.raw(`
      CREATE POLICY "Only auth users can insert" ON users
      FOR INSERT TO public
      WITH CHECK (auth.uid() = auth_user_id);
    `)

    // Step 7: Add additional policy for DELETE (for security)
    this.schema.raw('DROP POLICY IF EXISTS "Users can delete own profile" ON users')
    this.schema.raw(`
      CREATE POLICY "Users can delete own profile" ON users
      FOR DELETE TO public
      USING (auth.uid() = auth_user_id);
    `)

    // Step 8: Ensure RLS is enabled on the users table (should already be enabled)
    this.schema.raw('ALTER TABLE users ENABLE ROW LEVEL SECURITY')
  }

  async down() {
    // Remove the additional security measures
    this.schema.raw('DROP TRIGGER IF EXISTS validate_auth_user_trigger ON users')
    this.schema.raw('DROP FUNCTION IF EXISTS validate_auth_user()')

    // Drop the new policies
    this.schema.raw('DROP POLICY IF EXISTS "Only auth users can insert" ON users')
    this.schema.raw('DROP POLICY IF EXISTS "Users can delete own profile" ON users')

    // Make auth_user_id nullable again
    this.schema.alterTable('users', (table) => {
      table.uuid('auth_user_id').nullable().alter()
    })
  }
}
