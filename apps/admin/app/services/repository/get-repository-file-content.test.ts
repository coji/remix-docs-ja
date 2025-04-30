import { describe, expect, test } from 'vitest'
import { getRepositoryFileContent } from './get-repository-file-content'

describe('getRepositoryFileContent', () => {
  test('should return the content of the file', async () => {
    const result = await getRepositoryFileContent(
      'test/fixtures/projects/projectA/docs',
      'index.md',
    )
    expect(result.isOk()).toBe(true)
    expect(result._unsafeUnwrap()).toMatchSnapshot()
  })

  test('should return an error if the file does not exist', async () => {
    const result = await getRepositoryFileContent(
      'test/fixtures/projects/projectA/docs',
      'non-existent.md',
    )
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr()).toMatchSnapshot()
  })
})
