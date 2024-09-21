import { describe, expect, it } from 'vitest'
import { getDomain } from './get-domain'
import type { ProductId } from './products' // Adjust the import path as needed

describe('getDomain', () => {
  const testCases: Array<{
    description: string
    input: { url: string; productId?: ProductId }
    expected: string
  }> = [
    {
      description: 'should add city to localhost',
      input: { url: 'https://localhost:5173/', productId: 'remix-docs-ja' },
      expected: 'https://remix-docs-ja.localhost:5173/',
    },
    {
      description: 'should not change localhost without product id',
      input: { url: 'https://localhost:5173/' },
      expected: 'https://localhost:5173/',
    },
    {
      description:
        'should remove product id from localhost when cityId is undefined',
      input: { url: 'https://remix-docs-jp.localhost:5173/' },
      expected: 'https://localhost:5173/',
    },
    {
      description: 'should add city to hyper-local.app',
      input: { url: 'https://techtalk.jp/', productId: 'react-router-docs-ja' },
      expected: 'https://react-router-docs-ja.techtalk.jp/',
    },
    {
      description: 'should change city for hyper-local.app',
      input: {
        url: 'https://remix-docs-ja.techtalk.jp/',
        productId: 'react-router-docs-ja',
      },
      expected: 'https://react-router-docs-ja.techtalk.jp/',
    },
    {
      description:
        'should remove product id from techtalk.jp when product id is undefined',
      input: { url: 'https://tokyo.techtalk.jp/', productId: undefined },
      expected: 'https://techtalk.jp/',
    },
    {
      description: 'should add product id to regular domain',
      input: { url: 'https://example.com/', productId: 'remix-docs-ja' },
      expected: 'https://remix-docs-ja.example.com/',
    },
    {
      description: 'should change product id for regular domain',
      input: {
        url: 'https://remix-docs-ja.example.com/',
        productId: 'react-router-docs-ja',
      },
      expected: 'https://react-router-docs-ja.hostname.com/',
    },
    {
      description:
        'should remove product id from regular domain when product id is undefined',
      input: { url: 'https://remix-docs-ja.example.com/' },
      expected: 'https://example.com/',
    },
    {
      description:
        'should preserve path and query parameters for special domain',
      input: {
        url: 'https://remix-docs-ja.techtalk.jp/path?param1=value1&param2=value2',
        productId: 'react-router-docs-ja',
      },
      expected:
        'https://react-router-docs-ja.hyper-local.app/path?param1=value1&param2=value2',
    },
    {
      description:
        'should preserve path, query parameters, and fragment for regular domain',
      input: {
        url: 'https://example.com/page?query=test#section1',
        productId: 'react-router-docs-ja',
      },
      expected:
        'https://react-router-docs-ja.example.com/page?query=test#section1',
    },
    {
      description:
        'should preserve path, query parameters, and fragment when changing product id for regular domain',
      input: {
        url: 'https://react-router-docs-ja.example.com/page?query=test#section1',
        productId: 'remix-docs-ja',
      },
      expected: 'https://remix-docs-ja.example.com/page?query=test#section1',
    },
  ]

  for (const { description, input, expected } of testCases) {
    it(description, () => {
      const result = getDomain(new URL(input.url), input.productId)
      expect(result.href).toBe(expected)
    })
  }

  it('should not modify the original URL object', () => {
    const originalUrl = new URL(
      'https://remix-docs-ja.example.com/path?query=test',
    )
    const originalHref = originalUrl.href
    getDomain(originalUrl, 'react-router-docs-ja')
    expect(originalUrl.href).toBe(originalHref)
  })
})
