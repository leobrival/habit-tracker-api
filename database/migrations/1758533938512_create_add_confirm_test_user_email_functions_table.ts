import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'confirm_test_user_email_function'

  async up() {
    // Create RPC function for confirming test user emails
    this.schema.raw(`
      CREATE OR REPLACE FUNCTION confirm_test_user_email(user_id UUID)
      RETURNS BOOLEAN
      SECURITY DEFINER
      SET search_path = public
      AS $$
      BEGIN
        -- Update the user's email confirmation
        UPDATE auth.users 
        SET 
          email_confirmed_at = now(),
          email_confirm_token = NULL
        WHERE id = user_id;
        
        RETURN FOUND;
      END;
      $$ LANGUAGE plpgsql;
    `)

    // Create trigger function to auto-confirm test user emails
    this.schema.raw(`
      CREATE OR REPLACE FUNCTION auto_confirm_test_emails()
      RETURNS TRIGGER
      SECURITY DEFINER
      SET search_path = public
      AS $$
      BEGIN
        -- Auto-confirm emails for test users (emails containing 'test.integration')
        IF NEW.email LIKE '%test.integration%' THEN
          NEW.email_confirmed_at = now();
          NEW.email_confirm_token = NULL;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    // Create trigger to automatically confirm test user emails on insert
    this.schema.raw(`
      DROP TRIGGER IF EXISTS auto_confirm_test_emails_trigger ON auth.users;
      
      CREATE TRIGGER auto_confirm_test_emails_trigger
        BEFORE INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION auto_confirm_test_emails();
    `)
  }

  async down() {
    // Drop the trigger first
    this.schema.raw('DROP TRIGGER IF EXISTS auto_confirm_test_emails_trigger ON auth.users;')
    
    // Drop the trigger function
    this.schema.raw('DROP FUNCTION IF EXISTS auto_confirm_test_emails();')
    
    // Drop the RPC function
    this.schema.raw('DROP FUNCTION IF EXISTS confirm_test_user_email(UUID);')
  }
}
