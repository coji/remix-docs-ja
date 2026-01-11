#!/usr/bin/env node

/**
 * Build BM25 search index from pre-built JSON documents
 */

import glob from 'fast-glob'
import { readFileSync, writeFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { BuiltDoc } from './build-docs.js'
import { BM25SearchEngine, type Document } from './services/bm25.js'

interface BuildOptions {
  docsPath: string
  outputPath: string
  product: 'react-router-v7' | 'remix'
}

interface BuildFromDocsOptions {
  docs: BuiltDoc[]
  outputPath: string
  product: 'react-router-v7' | 'remix'
}

/**
 * Extract plain text from HTML content
 */
function extractTextFromHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Generate document sections for better granular search
 */
function generateDocumentSections(
  pathname: string,
  title: string,
  html: string,
): Document[] {
  const documents: Document[] = []

  const baseDoc = {
    id: pathname,
    title,
    path: `/${pathname}`,
    section: undefined,
  }

  // Main document
  const mainContent = extractTextFromHtml(html)
  documents.push({
    ...baseDoc,
    content: `${title} ${mainContent}`,
    tokens: [],
    length: 0,
  })

  // If the document has sections (h2, h3), create separate documents for them
  const sectionRegex = /<h([23])[^>]*id="([^"]*)"[^>]*>([^<]*)<\/h[23]>/g
  let match: RegExpExecArray | null
  let lastIndex = 0

  // biome-ignore lint/suspicious/noAssignInExpressions: match is used in a loop
  while ((match = sectionRegex.exec(html)) !== null) {
    const [fullMatch, _level, id, sectionTitle] = match
    const sectionStart = match.index

    // Extract content between sections
    if (lastIndex < sectionStart) {
      const sectionHtml = html.slice(lastIndex, sectionStart)
      const sectionContent = extractTextFromHtml(sectionHtml)

      if (sectionContent.length > 50) {
        documents.push({
          ...baseDoc,
          id: `${pathname}#${id}`,
          path: `/${pathname}#${id}`,
          section: sectionTitle,
          content: `${sectionTitle} ${sectionContent}`,
          tokens: [],
          length: 0,
        })
      }
    }

    lastIndex = match.index + fullMatch.length
  }

  return documents
}

/**
 * Build BM25 index from pre-built docs (faster, no MD processing)
 */
export async function buildBM25IndexFromDocs(
  options: BuildFromDocsOptions,
): Promise<void> {
  const { docs, outputPath, product } = options

  console.log(`🔍 Building BM25 index for ${product}...`)

  const engine = new BM25SearchEngine()
  await engine.initialize()

  const allDocuments: Document[] = []

  for (const { pathname, doc } of docs) {
    if (doc.attributes.hidden) continue

    const documents = generateDocumentSections(
      pathname,
      String(doc.attributes.title),
      doc.html,
    )
    allDocuments.push(...documents)
  }

  console.log(`🏗️  Building index for ${allDocuments.length} documents...`)

  const index = engine.buildIndex(allDocuments)

  await mkdir(join(outputPath, 'bm25'), { recursive: true })

  const indexData = engine.serializeIndex()
  writeFileSync(join(outputPath, 'bm25', 'index.json'), indexData, 'utf-8')

  const metadata = {
    totalDocuments: index.totalDocuments,
    averageDocumentLength: index.averageDocumentLength,
    buildTime: new Date().toISOString(),
    product,
    version: '1.0.0',
  }

  writeFileSync(
    join(outputPath, 'bm25', 'metadata.json'),
    JSON.stringify(metadata, null, 2),
    'utf-8',
  )

  console.log('✅ BM25 index built successfully!')
  console.log(`   📊 Total documents: ${index.totalDocuments}`)
  console.log(
    `   📏 Average length: ${Math.round(index.averageDocumentLength)} tokens`,
  )
}

/**
 * Build BM25 index from JSON files (for standalone use)
 */
export async function buildBM25Index(options: BuildOptions): Promise<void> {
  const { docsPath, outputPath, product } = options

  console.log(`🔍 Building BM25 index for ${product} from JSON...`)

  const engine = new BM25SearchEngine()
  await engine.initialize()

  const pattern = join(docsPath, '**/*.json')
  const files = await glob(pattern)

  console.log(`📚 Found ${files.length} JSON files`)

  const allDocuments: Document[] = []

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8')
      const doc = JSON.parse(content)

      if (doc.attributes?.hidden) continue

      const pathname = file
        .replace(
          new RegExp(`^${docsPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`),
          '',
        )
        .replace(/\.json$/, '')

      const documents = generateDocumentSections(
        pathname,
        String(doc.attributes?.title || pathname),
        doc.html || '',
      )
      allDocuments.push(...documents)

      console.log(
        `📄 Processed: ${doc.attributes?.title || pathname} (${documents.length} sections)`,
      )
    } catch (error) {
      console.warn(`⚠️  Failed to process ${file}:`, error)
    }
  }

  console.log(`🏗️  Building index for ${allDocuments.length} documents...`)

  const index = engine.buildIndex(allDocuments)

  await mkdir(join(outputPath, 'bm25'), { recursive: true })

  const indexData = engine.serializeIndex()
  writeFileSync(join(outputPath, 'bm25', 'index.json'), indexData, 'utf-8')

  const metadata = {
    totalDocuments: index.totalDocuments,
    averageDocumentLength: index.averageDocumentLength,
    buildTime: new Date().toISOString(),
    product,
    version: '1.0.0',
  }

  writeFileSync(
    join(outputPath, 'bm25', 'metadata.json'),
    JSON.stringify(metadata, null, 2),
    'utf-8',
  )

  console.log('✅ BM25 index built successfully!')
  console.log(`   📊 Total documents: ${index.totalDocuments}`)
  console.log(
    `   📏 Average length: ${Math.round(index.averageDocumentLength)} tokens`,
  )
}

/**
 * CLI entry point
 */
async function main() {
  const product = process.argv[2] as 'react-router-v7' | 'remix'

  if (!product || !['react-router-v7', 'remix'].includes(product)) {
    console.error('Usage: tsx build-bm25-index.ts <react-router-v7|remix>')
    process.exit(1)
  }

  const docsPath = join(
    process.cwd(),
    '../../apps',
    product === 'react-router-v7' ? 'react-router' : 'remix',
    'prebuild/docs',
  )
  const outputPath = join(
    process.cwd(),
    '../../apps',
    product === 'react-router-v7' ? 'react-router' : 'remix',
    'public/search-index',
  )

  try {
    await buildBM25Index({
      docsPath,
      outputPath,
      product,
    })
  } catch (error) {
    console.error('❌ Failed to build BM25 index:', error)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  main()
}
