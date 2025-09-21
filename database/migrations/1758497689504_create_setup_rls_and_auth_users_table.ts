import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Add auth_user_id column to users table
    this.schema.alterTable('users', (table) => {
      table
        .uuid('auth_user_id')
        .nullable()
        .references('id')
        .inTable('auth.users')
        .onDelete('CASCADE')
      table.unique(['auth_user_id'])
    })

    // Enable RLS on all tables
    this.schema.raw('ALTER TABLE users ENABLE ROW LEVEL SECURITY')
    this.schema.raw('ALTER TABLE boards ENABLE ROW LEVEL SECURITY')
    this.schema.raw('ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY')

    // Create RLS policies for users table
    this.schema.raw(`
      CREATE POLICY "Users can view own profile" ON users
        FOR SELECT USING (auth.uid() = auth_user_id)
    `)

    this.schema.raw(`
      CREATE POLICY "Users can update own profile" ON users
        FOR UPDATE USING (auth.uid() = auth_user_id)
    `)

    // Create RLS policies for boards table
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

    // Create RLS policies for check_ins table
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

    // Create function to handle new user creation
    this.schema.raw(`
      CREATE OR REPLACE FUNCTION handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO users (auth_user_id, email, full_name, password, created_at, updated_at)
        VALUES (
          NEW.id,
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
          'auth_managed',
          NOW(),
          NOW()
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `)

    // Create trigger for new users
    this.schema.raw(`
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    `)

    // Create function to handle user updates
    this.schema.raw(`
      CREATE OR REPLACE FUNCTION handle_user_update()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE users
        SET
          email = NEW.email,
          full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
          updated_at = NOW()
        WHERE auth_user_id = NEW.id;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `)

    // Create trigger for user updates
    this.schema.raw(`
      CREATE TRIGGER on_auth_user_updated
        AFTER UPDATE ON auth.users
        FOR EACH ROW EXECUTE FUNCTION handle_user_update();
    `)

    // Create function to handle user deletion
    this.schema.raw(`
      CREATE OR REPLACE FUNCTION handle_user_delete()
      RETURNS TRIGGER AS $$
      BEGIN
        DELETE FROM users WHERE auth_user_id = OLD.id;
        RETURN OLD;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `)

    // Create trigger for user deletion
    this.schema.raw(`
      CREATE TRIGGER on_auth_user_deleted
        AFTER DELETE ON auth.users
        FOR EACH ROW EXECUTE FUNCTION handle_user_delete();
    `)
  }

  async down() {
    // Drop triggers
    this.schema.raw('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users')
    this.schema.raw('DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users')
    this.schema.raw('DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users')

    // Drop functions
    this.schema.raw('DROP FUNCTION IF EXISTS handle_new_user()')
    this.schema.raw('DROP FUNCTION IF EXISTS handle_user_update()')
    this.schema.raw('DROP FUNCTION IF EXISTS handle_user_delete()')

    // Drop RLS policies
    this.schema.raw('DROP POLICY IF EXISTS "Users can view own profile" ON users')
    this.schema.raw('DROP POLICY IF EXISTS "Users can update own profile" ON users')
    this.schema.raw('DROP POLICY IF EXISTS "Users can view own boards" ON boards')
    this.schema.raw('DROP POLICY IF EXISTS "Users can create boards" ON boards')
    this.schema.raw('DROP POLICY IF EXISTS "Users can update own boards" ON boards')
    this.schema.raw('DROP POLICY IF EXISTS "Users can delete own boards" ON boards')
    this.schema.raw('DROP POLICY IF EXISTS "Users can view own check-ins" ON check_ins')
    this.schema.raw('DROP POLICY IF EXISTS "Users can create check-ins" ON check_ins')
    this.schema.raw('DROP POLICY IF EXISTS "Users can update own check-ins" ON check_ins')
    this.schema.raw('DROP POLICY IF EXISTS "Users can delete own check-ins" ON check_ins')

    // Disable RLS
    this.schema.raw('ALTER TABLE users DISABLE ROW LEVEL SECURITY')
    this.schema.raw('ALTER TABLE boards DISABLE ROW LEVEL SECURITY')
    this.schema.raw('ALTER TABLE check_ins DISABLE ROW LEVEL SECURITY')

    // Remove auth_user_id column
    this.schema.alterTable('users', (table) => {
      table.dropUnique(['auth_user_id'])
      table.dropColumn('auth_user_id')
    })
  }
}
