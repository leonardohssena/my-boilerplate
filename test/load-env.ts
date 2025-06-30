import * as fs from 'fs'
import * as path from 'path'

import * as dotenv from 'dotenv'

const testEnvPath = path.resolve(process.cwd(), '.env.test')

if (fs.existsSync(testEnvPath)) {
  dotenv.config({ path: testEnvPath, override: true })
  console.log('[Jest] ✅ Loaded .env.test')
} else {
  console.warn('[Jest] ⚠️ .env.test not found')
}
