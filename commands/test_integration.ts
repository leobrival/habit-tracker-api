import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { join } from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

export default class TestIntegration extends BaseCommand {
  static commandName = 'make:test-integration'
  static description = 'Generate an integration test file'

  static options: CommandOptions = {}

  @args.string({ description: 'Name of the integration test' })
  declare name: string

  async run() {
    const testName = this.name
    const fileName = `${testName.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.spec.ts`
    const testDir = this.app.makePath('tests/integration')
    const filePath = join(testDir, fileName)

    // Ensure directory exists
    if (!existsSync(testDir)) {
      await mkdir(testDir, { recursive: true })
    }

    const template = this.getTestTemplate(testName)

    await writeFile(filePath, template, 'utf8')

    this.logger.success(`Integration test created: ${filePath}`)
  }

  private getTestTemplate(testName: string): string {
    return `import { test } from '@japa/runner'
import { ApiClient } from '@japa/api-client'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('${testName} Integration Tests', (group) => {
  let client: ApiClient

  group.setup(async () => {
    // Start HTTP server
    await testUtils.httpServer().start()
    // Add any additional setup here (user creation, etc.)
  })

  group.teardown(async () => {
    // Clean up resources
    await testUtils.httpServer().close()
  })

  test('should pass basic test', async ({ assert }) => {
    // Replace with your integration test logic
    assert.isTrue(true)
  })
})
`
  }
}
