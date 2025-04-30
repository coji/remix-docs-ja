import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { listRepositoryFiles } from './list-repository-files'

describe('listRepositoryFiles', () => {
  test('should return the list of files in the directory', async () => {
    const directory = path.join('test/fixtures/projects/projectA/docs')
    const files = await listRepositoryFiles(directory)
    expect(files.isOk()).toBe(true)
    expect(files._unsafeUnwrap()).toMatchSnapshot()
  })

  // excludes
  test('should exclude files that match the exclude pattern', async () => {
    const directory = path.join('test/fixtures/projects/projectA/docs')
    const files = await listRepositoryFiles(directory, {
      pattern: '**/*',
      excludes: ['index.*'],
    })
    expect(files.isOk()).toBe(true)
    expect(files._unsafeUnwrap()).toMatchSnapshot()
  })

  test('should return empty array if the directory does not exist', async () => {
    const directory = path.join('test/fixtures/projects/non-existent')
    const result = await listRepositoryFiles(directory)
    expect(result.isOk()).toBe(true)
    expect(result._unsafeUnwrap()).toEqual([])
  })
})
