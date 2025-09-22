import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Step 1: Remove description column
    this.schema.alterTable('boards', (table) => {
      table.dropColumn('description')
    })

    // Step 2: Add new quantity-related fields
    this.schema.alterTable('boards', (table) => {
      // Indicates if this board tracks quantitative values (true) or just completion (false)
      table.boolean('is_quantity').defaultTo(false).notNullable()

      // Default/suggested value for this board (e.g., 300 for calories, 30 for minutes)
      table.decimal('default_value', 10, 2).nullable()

      // Unit name for display (e.g., "kcal", "min", "pages", "EUR", "USD")
      table.string('unit').nullable()

      // Unit symbol for display (e.g., "kcal", "min", "€", "$")
      table.string('unit_symbol').nullable()
    })

    // Step 3: Add value tracking to check_ins table
    this.schema.alterTable('check_ins', (table) => {
      // Actual value entered by user for this check-in (can override board default)
      table.decimal('value', 10, 2).nullable()

      // Unit used for this specific check-in (inherits from board but can be overridden)
      table.string('unit').nullable()
      table.string('unit_symbol').nullable()
    })
  }

  async down() {
    // Remove check_ins columns
    this.schema.alterTable('check_ins', (table) => {
      table.dropColumn('value')
      table.dropColumn('unit')
      table.dropColumn('unit_symbol')
    })

    // Remove boards columns
    this.schema.alterTable('boards', (table) => {
      table.dropColumn('is_quantity')
      table.dropColumn('default_value')
      table.dropColumn('unit')
      table.dropColumn('unit_symbol')
    })

    // Re-add description column
    this.schema.alterTable('boards', (table) => {
      table.string('description').nullable()
    })
  }
}
