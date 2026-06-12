import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { defaultProducts } from '../lib/defaultProducts.mjs'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envFiles = ['.env.production.local', '.env.local', '.env']

for (const fileName of envFiles) {
  loadEnvFile(path.join(rootDir, fileName))
}

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
const missingEnv = requiredEnv.filter((key) => !process.env[key]?.trim())

if (missingEnv.length > 0) {
  console.error(`Missing required environment variable(s): ${missingEnv.join(', ')}`)
  console.error('Add them to your shell environment or to an untracked .env.local file, then rerun npm run seed:products.')
  process.exit(1)
}

const supabaseUrl = process.env.SUPABASE_URL.trim()
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY.trim()

try {
  const url = new URL(supabaseUrl)
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('SUPABASE_URL must be an HTTP(S) URL.')
  }
} catch (error) {
  console.error(`Invalid SUPABASE_URL: ${error.message}`)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

const now = new Date().toISOString()
const products = defaultProducts.map((product) => ({
  ...product,
  updatedAt: now,
}))

const expectedIds = products.map((product) => product.id)
const selectColumns = [
  'id',
  'name',
  'tagline',
  'description',
  'ingredients',
  'color',
  'imagePos',
  'emoji',
  'price',
  'imageZoom',
  'imageBrightness',
  'imageContrast',
  'image',
  'updatedAt',
]

console.log(`Publishing ${products.length} products to Supabase table jfm_products...`)

const { error: readError } = await supabase
  .from('jfm_products')
  .select('id')
  .limit(1)

if (readError) {
  failSupabase('Unable to read jfm_products. Verify that the table exists and the service role key is valid.', readError)
}

const { error: upsertError } = await supabase
  .from('jfm_products')
  .upsert(products, { onConflict: 'id' })

if (upsertError) {
  failSupabase('Unable to upsert products into jfm_products. Verify the table columns and id unique constraint.', upsertError)
}

const { data: savedProducts, error: verifyError } = await supabase
  .from('jfm_products')
  .select(selectColumns.join(','))
  .in('id', expectedIds)

if (verifyError) {
  failSupabase('Products were upserted, but verification failed.', verifyError)
}

const savedById = new Map((savedProducts || []).map((product) => [product.id, product]))
const missingIds = expectedIds.filter((id) => !savedById.has(id))

if (missingIds.length > 0) {
  console.error(`Verification failed. Missing product id(s): ${missingIds.join(', ')}`)
  process.exit(1)
}

const mismatches = findMismatches(products, savedById)

if (mismatches.length > 0) {
  console.error('Verification failed. Supabase rows do not match the source products:')
  for (const mismatch of mismatches) {
    console.error(`- ${mismatch}`)
  }
  process.exit(1)
}

console.log(`Published and verified ${products.length} products: ${expectedIds.join(', ')}`)
console.log('Existing products with other IDs were left untouched.')

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return

  const content = readFileSync(filePath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    let value = trimmed.slice(separatorIndex + 1).trim()

    if (!key || process.env[key] !== undefined) continue

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    process.env[key] = value
  }
}

function findMismatches(sourceProducts, savedById) {
  const fields = [
    'name',
    'tagline',
    'description',
    'ingredients',
    'color',
    'imagePos',
    'emoji',
    'price',
    'imageZoom',
    'imageBrightness',
    'imageContrast',
    'image',
  ]

  const mismatches = []

  for (const sourceProduct of sourceProducts) {
    const savedProduct = savedById.get(sourceProduct.id)

    for (const field of fields) {
      if (!sameValue(sourceProduct[field], savedProduct[field])) {
        mismatches.push(`${sourceProduct.id}.${field}`)
      }
    }
  }

  return mismatches
}

function sameValue(expected, actual) {
  if (Array.isArray(expected)) {
    return Array.isArray(actual) && JSON.stringify(expected) === JSON.stringify(actual)
  }

  if (typeof expected === 'number') {
    return Number(expected) === Number(actual)
  }

  return expected === actual
}

function failSupabase(message, error) {
  console.error(message)
  console.error(`Supabase error: ${error.message}`)
  process.exit(1)
}
