#!/usr/bin/env node

/**
 * Build BM25 search index from documentation markdown files
 */

import glob from 'fast-glob'
import { readFileSync, writeFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { BM25SearchEngine, type Document } from './services/bm25.js'
import { processMarkdown } from './services/md.server.js'

interface BuildOptions {
  docsPath: string
  outputPath: string
  product: 'react-router-v7' | 'remix'
}

/**
 * Extract plain text from HTML content
 */
function extractTextFromHtml(html: string): string {
  // Remove HTML tags and decode entities
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

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function generateDocumentSections(doc: any): Document[] {
  const documents: Document[] = []
  
  // Remove product prefix from path (e.g., react-router-v7/ or remix/)
  const cleanPath = doc.attributes.slug.replace(/^(react-router-v7|remix)\//, '')
  
  const baseDoc = {
    id: cleanPath,
    title: doc.attributes.title,
    path: `/${cleanPath}`,
    section: undefined,
  }

  // Main document
  const mainContent = extractTextFromHtml(doc.html)
  documents.push({
    ...baseDoc,
    content: `${doc.attributes.title} ${mainContent}`,
    tokens: [],
    length: 0,
  })

  // If the document has sections (h2, h3), create separate documents for them
  const sectionRegex = /<h([23])[^>]*id="([^"]*)"[^>]*>([^<]*)<\/h[23]>/g
  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  let match
  let lastIndex = 0

  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  while ((match = sectionRegex.exec(doc.html)) !== null) {
    const [fullMatch, _level, id, title] = match
    const sectionStart = match.index

    // Extract content between sections
    if (lastIndex < sectionStart) {
      const sectionHtml = doc.html.slice(lastIndex, sectionStart)
      const sectionContent = extractTextFromHtml(sectionHtml)

      if (sectionContent.length > 50) {
        // Only include substantial content
        documents.push({
          ...baseDoc,
          id: `${cleanPath}#${id}`,
          path: `/${cleanPath}#${id}`,
          section: title,
          content: `${title} ${sectionContent}`,
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
 * Build BM25 index for a specific product
 */
export async function buildBM25Index(options: BuildOptions): Promise<void> {
  console.log(`🔍 Building BM25 index for ${options.product}...`)

  const engine = new BM25SearchEngine()
  await engine.initialize()

  // Collect all markdown files
  const pattern = join(options.docsPath, '**/*.md')
  const files = await glob(pattern)

  console.log(`📚 Found ${files.length} documentation files`)

  const allDocuments: Document[] = []

  // Process each file
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8')
      const slug = file.replace(/^.*\/docs\//, '').replace(/\.md$/, '')
      const doc = await processMarkdown(content)

      // Add slug to attributes for compatibility
      doc.attributes.slug = slug

      // Skip hidden documents
      if (doc.attributes.hidden) {
        continue
      }

      // Generate document sections
      const documents = generateDocumentSections(doc)
      allDocuments.push(...documents)

      console.log(
        `📄 Processed: ${doc.attributes.title} (${documents.length} sections)`,
      )
    } catch (error) {
      console.warn(`⚠️  Failed to process ${file}:`, error)
    }
  }

  console.log(`🏗️  Building index for ${allDocuments.length} documents...`)

  // Build the index
  const index = engine.buildIndex(allDocuments)

  // Create output directory
  await mkdir(join(options.outputPath, 'bm25'), { recursive: true })

  // Save index
  const indexData = engine.serializeIndex()
  writeFileSync(
    join(options.outputPath, 'bm25', 'index.json'),
    indexData,
    'utf-8',
  )

  // Save metadata separately for faster loading
  const metadata = {
    totalDocuments: index.totalDocuments,
    averageDocumentLength: index.averageDocumentLength,
    buildTime: new Date().toISOString(),
    product: options.product,
    version: '1.0.0',
  }

  writeFileSync(
    join(options.outputPath, 'bm25', 'metadata.json'),
    JSON.stringify(metadata, null, 2),
    'utf-8',
  )

  console.log('✅ BM25 index built successfully!')
  console.log(`   📊 Total documents: ${index.totalDocuments}`)
  console.log(
    `   📏 Average length: ${Math.round(index.averageDocumentLength)} tokens`,
  )
  console.log(`   💾 Output: ${options.outputPath}/bm25/`)
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

  const docsPath = join(process.cwd(), '../../docs', product)
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
