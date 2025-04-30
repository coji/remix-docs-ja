import { fromAsyncThrowable } from 'neverthrow'
import fs from 'node:fs/promises'
import path from 'node:path'
import { md5sum } from '~/libs/md5sum'
import type { RepositoryFile } from './types'

const fileContentImpl = async (
  directory: string,
  filename: string,
): Promise<RepositoryFile> => {
  const content = await fs.readFile(path.join(directory, filename), 'utf-8')
  const md5 = md5sum(content)

  return { filename, content, md5 }
}

export const getRepositoryFileContent = (
  directory: string,
  filename: string,
) => {
  return fromAsyncThrowable(
    () => fileContentImpl(directory, filename),
    (err) => err,
  )()
}
