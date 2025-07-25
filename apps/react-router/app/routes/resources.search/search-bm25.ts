// Client-side BM25 search implementation
interface BM25Document {
  id: string
  title: string
  path: string
  section?: string
  length: number
}

interface BM25Index {
  documents: BM25Document[]
  termFrequency: Record<string, Record<string, number>>
  documentFrequency: Record<string, number>
  averageDocumentLength: number
  totalDocuments: number
}

interface SearchResult {
  id: string
  title: string
  path: string
  excerpt: string
  score: {
    bm25: number
    vector: number
    combined: number
  }
  highlights: string[]
}

// BM25 parameters
const K1 = 1.2
const B = 0.75

// Japanese stop words (simplified set for client-side)
const STOP_WORDS = new Set([
  'の',
  'に',
  'は',
  'を',
  'た',
  'が',
  'で',
  'て',
  'と',
  'し',
  'れ',
  'さ',
  'ある',
  'いる',
  'も',
  'する',
  'から',
  'な',
  'こと',
  'として',
  'い',
  'や',
  'れる',
  'など',
  'なっ',
  'ない',
  'この',
  'ため',
  'その',
  'あっ',
  'よう',
  'また',
  'もの',
  'という',
  'あり',
  'まで',
  'られ',
  'なる',
  'へ',
  'か',
  'だ',
  'これ',
  'によって',
  'により',
  'おり',
  'より',
  'による',
  'ず',
])

/**
 * Extract API terms from text (React Router API names, camelCase, etc.)
 */
function extractApiTerms(text: string): string[] {
  const apiTerms = []

  // Extract camelCase terms (e.g., useNavigate, createBrowserRouter)
  const camelCaseRegex = /[a-z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*/g
  const camelCaseMatches = text.match(camelCaseRegex) || []
  apiTerms.push(...camelCaseMatches.map((term) => term.toLowerCase()))

  // Extract common React Router patterns
  const reactRouterPatterns = [
    /use[A-Z][a-zA-Z0-9]*/g, // useNavigate, useLocation, etc.
    /create[A-Z][a-zA-Z0-9]*/g, // createBrowserRouter, etc.
    /[a-z]+Router/g, // BrowserRouter, MemoryRouter, etc.
  ]

  for (const pattern of reactRouterPatterns) {
    const matches = text.match(pattern) || []
    apiTerms.push(...matches.map((term) => term.toLowerCase()))
  }

  // Extract code-like terms (alphanumeric with underscores)
  const codeTermRegex = /[a-zA-Z][a-zA-Z0-9_]*[a-zA-Z0-9]/g
  const codeMatches = text.match(codeTermRegex) || []
  apiTerms.push(...codeMatches.map((term) => term.toLowerCase()))

  return [...new Set(apiTerms)] // Remove duplicates
}

/**
 * Simple tokenizer for client-side use (without kuromoji)
 * Enhanced with API term extraction for React Router API names
 */
function simpleTokenize(text: string): string[] {
  // Extract API terms first
  const apiTerms = extractApiTerms(text)

  // Regular tokenization
  const regularTokens = text
    .toLowerCase()
    .replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, ' ')
    .split(/\s+/)
    .filter(
      (token) =>
        token.length > 1 && !STOP_WORDS.has(token) && !/^[0-9]+$/.test(token),
    )

  // Combine and deduplicate
  const allTokens = [...regularTokens, ...apiTerms]
  return [...new Set(allTokens)].filter((token) => token.length > 0)
}

/**
 * Calculate BM25 score for a document given query terms
 */
function calculateBM25Score(
  docId: string,
  queryTerms: string[],
  index: BM25Index,
): number {
  const doc = index.documents.find((d) => d.id === docId)
  if (!doc) return 0

  let score = 0

  for (const term of queryTerms) {
    const termFreqInDoc = index.termFrequency[term]?.[docId] ?? 0
    const docFreq = index.documentFrequency[term] ?? 0

    if (termFreqInDoc === 0 || docFreq === 0) continue

    // IDF calculation
    const idf = Math.log(
      (index.totalDocuments - docFreq + 0.5) / (docFreq + 0.5),
    )

    // TF calculation with normalization
    const tf =
      (termFreqInDoc * (K1 + 1)) /
      (termFreqInDoc +
        K1 * (1 - B + B * (doc.length / index.averageDocumentLength)))

    score += idf * tf
  }

  return score
}

/**
 * Generate excerpt with highlights
 */
function generateExcerpt(
  title: string,
  _queryTerms: string[],
  maxLength = 150,
): string {
  // For now, just return the title as excerpt
  // In a full implementation, we'd need the full content
  const excerpt = title
  if (excerpt.length <= maxLength) {
    return excerpt
  }
  return `${excerpt.substring(0, maxLength - 3)}...`
}

/**
 * Find highlights in title
 */
function findHighlights(title: string, queryTerms: string[]): string[] {
  const highlights = []
  const titleLower = title.toLowerCase()

  for (const term of queryTerms) {
    if (titleLower.includes(term.toLowerCase())) {
      highlights.push(term)
    }
  }

  return highlights
}

/**
 * Search using BM25 algorithm
 */
function searchBM25(
  query: string,
  index: BM25Index,
  limit = 10,
): SearchResult[] {
  const queryTerms = simpleTokenize(query)
  if (queryTerms.length === 0) return []

  const results: SearchResult[] = []

  for (const doc of index.documents) {
    const bm25Score = calculateBM25Score(doc.id, queryTerms, index)

    if (bm25Score > 0) {
      const excerpt = generateExcerpt(doc.title, queryTerms)
      const highlights = findHighlights(doc.title, queryTerms)

      results.push({
        id: doc.id,
        title: doc.title,
        path: doc.path,
        excerpt,
        score: {
          bm25: bm25Score,
          vector: 0, // Will be implemented in Phase 2
          combined: bm25Score,
        },
        highlights,
      })
    }
  }

  // Sort by BM25 score and return top results
  return results.sort((a, b) => b.score.bm25 - a.score.bm25).slice(0, limit)
}

// Global cache for the index
let cachedIndex: BM25Index | null = null

/**
 * Load BM25 index (cached)
 */
async function loadBM25Index(): Promise<BM25Index> {
  if (cachedIndex) {
    return cachedIndex
  }

  try {
    const response = await fetch('/search-index/bm25/index.json')
    if (!response.ok) {
      throw new Error(`Failed to load BM25 index: ${response.status}`)
    }

    const indexData = (await response.json()) as {
      documents: BM25Document[]
      termFrequency: Record<string, Record<string, number>>
      documentFrequency: Record<string, number>
      averageDocumentLength: number
      totalDocuments: number
    }

    // Convert plain objects back to the expected format
    cachedIndex = {
      documents: indexData.documents,
      termFrequency: indexData.termFrequency,
      documentFrequency: indexData.documentFrequency,
      averageDocumentLength: indexData.averageDocumentLength,
      totalDocuments: indexData.totalDocuments,
    }

    return cachedIndex
  } catch (error) {
    console.error('Failed to load BM25 index:', error)
    throw new Error('Search index not available')
  }
}

/**
 * Search API loader
 */
export async function search({
  query,
  limit,
}: {
  query: string
  limit?: number
}) {
  // Return empty results for empty queries
  if (!query.trim()) {
    return { results: [], query: '', total: 0 }
  }

  try {
    const index = await loadBM25Index()
    const results = searchBM25(query, index, limit)

    return {
      results,
      query,
      total: results.length,
      metadata: {
        algorithm: 'BM25',
        totalDocuments: index.totalDocuments,
        averageDocumentLength: Math.round(index.averageDocumentLength),
        queryTerms: simpleTokenize(query),
      },
    }
  } catch (error) {
    console.error('Search error:', error)
    return {
      error: 'Search service unavailable',
      results: [],
      query,
      total: 0,
    }
  }
}
