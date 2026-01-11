import glob from 'fast-glob'
import fs from 'node:fs/promises'
import path from 'node:path'
import { getDoc } from './services/document'
import { getOgpImageResponse } from './services/ogp-image.server'

interface BuildDocsOptions {
  docsPath: string
  outputPath: string
  ogpOutputPath: string
  productId: string
  concurrency?: number
}

export interface BuiltDoc {
  pathname: string
  doc: {
    attributes: { title: string; hidden?: boolean; [key: string]: unknown }
    raw: string
    html: string
    headings: { headingLevel: string; html: string; slug: string | undefined }[]
  }
}

/**
 * Build docs JSON and OGP images in parallel
 * Returns the built docs for use by search index builders
 */
export const buildDocs = async (
  options: BuildDocsOptions,
): Promise<BuiltDoc[]> => {
  const {
    docsPath,
    outputPath,
    ogpOutputPath,
    productId,
    concurrency = 10,
  } = options

  const files = await glob(path.join(docsPath, '/**/*.md'))
  console.log(`📚 Building ${files.length} documents...`)

  const results: BuiltDoc[] = []
  const docsPathRegex = new RegExp(
    `^${docsPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`,
  )

  // Process in batches for concurrency
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map(async (filename) => {
        const pathname = filename
          .replace(docsPathRegex, '')
          .replace(/\.md$/, '')

        try {
          const doc = await getDoc(pathname, { productId })
          if (!doc) {
            console.log(`⚠️  doc not found: ${pathname}`)
            return null
          }

          // Write JSON
          const jsonFilename = path.join(outputPath, `${pathname}.json`)
          await fs.mkdir(path.dirname(jsonFilename), { recursive: true })
          await fs.writeFile(
            jsonFilename,
            JSON.stringify(doc, null, 2),
            'utf-8',
          )

          // Generate OGP image
          const ogpImage = await getOgpImageResponse(productId, pathname)
          const ogpFilename = path.join(ogpOutputPath, `${pathname}.png`)
          await fs.mkdir(path.dirname(ogpFilename), { recursive: true })
          await fs.writeFile(
            ogpFilename,
            Buffer.from(await ogpImage.arrayBuffer()),
          )

          console.log(`✓ ${pathname}`)

          return { pathname, doc } as BuiltDoc
        } catch (error) {
          console.error(`❌ Failed: ${pathname}`, error)
          return null
        }
      }),
    )

    results.push(...batchResults.filter((r): r is BuiltDoc => r !== null))
  }

  console.log(`✅ Built ${results.length} documents`)
  return results
}
