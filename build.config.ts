import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineBuildConfig } from 'unbuild'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, 'nuxt')

console.log(rootDir)

export default defineBuildConfig({
    rootDir
})
