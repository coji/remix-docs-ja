/**
 * BM25 Ranking Algorithm Implementation for Japanese Text
 */

import type { Tokenizer, Token } from 'kuromoji';

// BM25 parameters
const K1 = 1.2; // term frequency saturation point
const B = 0.75; // length normalization parameter

// Japanese stop words
const STOP_WORDS = new Set([
  'の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し', 'れ', 'さ', 'ある', 'いる',
  'も', 'する', 'から', 'な', 'こと', 'として', 'い', 'や', 'れる', 'など', 'なっ', 'ない',
  'この', 'ため', 'その', 'あっ', 'よう', 'また', 'もの', 'という', 'あり', 'まで', 'られ',
  'なる', 'へ', 'か', 'だ', 'これ', 'によって', 'により', 'おり', 'より', 'による', 'ず',
  'なり', 'られる', 'において', 'ば', 'なかっ', 'なく', 'しかし', 'について', 'せ', 'だっ',
  'その後', 'できる', 'それ', 'う', 'ので', 'なお', 'のみ', 'でき', 'き', 'つ', 'における',
  'および', 'いう', 'さらに', 'でも', 'ら', 'たり', 'その他', 'に関して', 'たち', 'ます',
  'ん', 'なら', 'に対して', '特に', 'せる', '及び', 'これら', 'とき', 'では', 'にて', 'による'
]);

export interface Document {
  id: string;
  title: string;
  content: string;
  path: string;
  section?: string;
  tokens: string[];
  length: number;
}

export interface BM25Index {
  documents: Document[];
  termFrequency: Map<string, Map<string, number>>; // term -> docId -> frequency
  documentFrequency: Map<string, number>; // term -> number of documents containing term
  averageDocumentLength: number;
  totalDocuments: number;
}

export interface SearchResult {
  id: string;
  title: string;
  path: string;
  excerpt: string;
  score: {
    bm25: number;
    vector: number;
    combined: number;
  };
  highlights: string[];
}

export class BM25SearchEngine {
  private tokenizer: Tokenizer | null = null;
  private index: BM25Index | null = null;

  async initialize(tokenizerPath?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Dynamic import for kuromoji in ESM
      import('kuromoji').then((kuromojiModule) => {
        const kuromoji = kuromojiModule.default || kuromojiModule;
        kuromoji.builder({
          dicPath: tokenizerPath || 'node_modules/kuromoji/dict'
        }).build((err: Error | null, tokenizer: Tokenizer) => {
          if (err) {
            reject(err);
          } else {
            this.tokenizer = tokenizer;
            resolve();
          }
        });
      }).catch(reject);
    });
  }

  /**
   * Tokenize Japanese text and remove stop words
   */
  tokenize(text: string): string[] {
    if (!this.tokenizer) {
      throw new Error('Tokenizer not initialized. Call initialize() first.');
    }

    const tokens = this.tokenizer.tokenize(text);
    return tokens
      .map((token: Token) => token.surface_form.toLowerCase())
      .filter((token: string) => 
        token.length > 1 && // Remove single characters
        !STOP_WORDS.has(token) && // Remove stop words
        !/^[0-9]+$/.test(token) && // Remove pure numbers
        !/^[!-/:-@\[-`{-~]+$/.test(token) // Remove punctuation
      );
  }

  /**
   * Build BM25 index from documents
   */
  buildIndex(documents: Document[]): BM25Index {
    const termFrequency = new Map<string, Map<string, number>>();
    const documentFrequency = new Map<string, number>();
    
    let totalLength = 0;

    // Process each document
    for (const doc of documents) {
      const tokens = this.tokenize(doc.content);
      doc.tokens = tokens;
      doc.length = tokens.length;
      totalLength += tokens.length;

      // Count term frequencies in this document
      const docTermFreq = new Map<string, number>();
      for (const term of tokens) {
        docTermFreq.set(term, (docTermFreq.get(term) || 0) + 1);
      }

      // Update global term frequency map
      for (const [term, freq] of docTermFreq) {
        if (!termFrequency.has(term)) {
          termFrequency.set(term, new Map());
        }
        // biome-ignore lint/style/noNonNullAssertion: Map entry is guaranteed to exist
        termFrequency.get(term)!.set(doc.id, freq);

        // Update document frequency
        documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1);
      }
    }

    const averageDocumentLength = totalLength / documents.length;

    this.index = {
      documents,
      termFrequency,
      documentFrequency,
      averageDocumentLength,
      totalDocuments: documents.length
    };

    return this.index;
  }

  /**
   * Calculate BM25 score for a document given query terms
   */
  private calculateBM25Score(docId: string, queryTerms: string[]): number {
    if (!this.index) {
      throw new Error('Index not built. Call buildIndex() first.');
    }

    const doc = this.index.documents.find(d => d.id === docId);
    if (!doc) return 0;

    let score = 0;

    for (const term of queryTerms) {
      const termFreqInDoc = this.index.termFrequency.get(term)?.get(docId) ?? 0;
      const docFreq = this.index.documentFrequency.get(term) ?? 0;

      if (termFreqInDoc === 0 || docFreq === 0) continue;

      // IDF calculation
      const idf = Math.log((this.index.totalDocuments - docFreq + 0.5) / (docFreq + 0.5));

      // TF calculation with normalization
      const tf = (termFreqInDoc * (K1 + 1)) / 
                 (termFreqInDoc + K1 * (1 - B + B * (doc.length / this.index.averageDocumentLength)));

      score += idf * tf;
    }

    return score;
  }

  /**
   * Search documents using BM25
   */
  search(query: string, limit: number = 10): SearchResult[] {
    if (!this.index) {
      throw new Error('Index not built. Call buildIndex() first.');
    }

    const queryTerms = this.tokenize(query);
    if (queryTerms.length === 0) return [];

    const results = [];

    for (const doc of this.index.documents) {
      const bm25Score = this.calculateBM25Score(doc.id, queryTerms);
      
      if (bm25Score > 0) {
        // Generate excerpt with highlights
        const excerpt = this.generateExcerpt(doc.content, queryTerms);
        const highlights = this.findHighlights(doc.content, queryTerms);

        results.push({
          id: doc.id,
          title: doc.title,
          path: doc.path,
          excerpt,
          score: {
            bm25: bm25Score,
            vector: 0, // Will be implemented in Phase 2
            combined: bm25Score
          },
          highlights
        });
      }
    }

    // Sort by BM25 score and return top results
    return results
      .sort((a, b) => b.score.bm25 - a.score.bm25)
      .slice(0, limit);
  }

  /**
   * Generate excerpt around query terms
   */
  private generateExcerpt(content: string, queryTerms: string[], maxLength: number = 200): string {
    const sentences = content.split(/[。！？\n]/);
    let bestSentence = '';
    let maxMatches = 0;

    for (const sentence of sentences) {
      const sentenceTokens = this.tokenize(sentence);
      const matches = queryTerms.filter(term => 
        sentenceTokens.some(token => token.includes(term) || term.includes(token))
      ).length;

      if (matches > maxMatches) {
        maxMatches = matches;
        bestSentence = sentence;
      }
    }

    if (bestSentence.length <= maxLength) {
      return bestSentence;
    }

    return `${bestSentence.substring(0, maxLength - 3)}...`;
  }

  /**
   * Find text segments to highlight
   */
  private findHighlights(content: string, queryTerms: string[]): string[] {
    const highlights = [];
    const contentTokens = this.tokenize(content);

    for (const term of queryTerms) {
      const matchingTokens = contentTokens.filter(token => 
        token.includes(term) || term.includes(token)
      );
      highlights.push(...matchingTokens);
    }

    return [...new Set(highlights)]; // Remove duplicates
  }

  /**
   * Serialize index to JSON for static serving
   */
  serializeIndex(): string {
    if (!this.index) {
      throw new Error('Index not built. Call buildIndex() first.');
    }

    return JSON.stringify({
      documents: this.index.documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        path: doc.path,
        section: doc.section,
        length: doc.length
      })),
      termFrequency: Object.fromEntries(
        Array.from(this.index.termFrequency.entries()).map(([term, docMap]) => [
          term,
          Object.fromEntries(docMap.entries())
        ])
      ),
      documentFrequency: Object.fromEntries(this.index.documentFrequency.entries()),
      averageDocumentLength: this.index.averageDocumentLength,
      totalDocuments: this.index.totalDocuments
    }, null, 2);
  }

  /**
   * Load index from serialized JSON
   */
  loadIndex(serializedIndex: string): void {
    const data = JSON.parse(serializedIndex);
    
    this.index = {
      documents: data.documents,
      termFrequency: new Map(
        Object.entries(data.termFrequency).map(([term, docMap]) => [
          term,
          new Map(Object.entries(docMap as Record<string, number>))
        ])
      ),
      documentFrequency: new Map(Object.entries(data.documentFrequency)),
      averageDocumentLength: data.averageDocumentLength,
      totalDocuments: data.totalDocuments
    };
  }
}