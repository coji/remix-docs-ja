import { db, now } from '~/services/db.server'

export const updateFileOutput = async (
  projectId: string,
  fileId: number,
  output: string,
) => {
  return await db
    .updateTable('files')
    .set({
      output,
      is_updated: 0,
      translated_at: now(),
      updated_at: now(),
    })
    .where('id', '=', fileId)
    .where('project_id', '=', projectId)
    .returningAll()
    .executeTakeFirstOrThrow()
}
