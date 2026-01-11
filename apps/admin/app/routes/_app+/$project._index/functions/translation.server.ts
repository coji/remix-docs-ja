import { db, now } from '~/services/db.server'
import { translateByGemini } from '~/services/translate-gemini'

export const startTranslationJob = async (projectId: string) => {
  const project = await db
    .selectFrom('projects')
    .selectAll()
    .where('id', '=', projectId)
    .executeTakeFirstOrThrow()

  const files = await db
    .selectFrom('files')
    .selectAll()
    .where('project_id', '=', projectId)
    .orderBy('created_at', 'asc')
    .execute()

  const job = await db
    .insertInto('translation_jobs')
    .values({
      project_id: projectId,
      file_count: files.length,
      prompt_tokens: 0,
      output_tokens: 0,
      translated_count: 0,
      status: 'pending',
      updated_at: now(),
      created_at: now(),
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  for (const file of files) {
    if (!file.is_updated) {
      continue
    }

    console.log(`translation task started: ${file.path}`)
    const task = await db
      .insertInto('translation_tasks')
      .values({
        job_id: job.id,
        input: file.content,
        output: '',
        prompt: project.prompt,
        prompt_tokens: 0,
        output_tokens: 0,
        generated: '',
        status: 'pending',
        updated_at: now(),
        created_at: now(),
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    const ret = await translateByGemini({
      source: file.content,
      prevTranslatedText: file.output ?? undefined,
    })

    console.log(file.path, ret.type)

    if (ret.type === 'success') {
      const updated = await db
        .updateTable('files')
        .set({
          is_updated: 0,
          output: ret.translatedText,
          translated_at: now(),
          updated_at: now(),
        })
        .where('id', '=', file.id)
        .returningAll()
        .executeTakeFirstOrThrow()

      console.log(`file updated: ${updated.path}`)

      await db
        .updateTable('translation_tasks')
        .set({
          output: ret.translatedText,
          status: 'done',
          updated_at: now(),
        })
        .where('id', '=', task.id)
        .execute()
    } else {
      await db
        .updateTable('translation_tasks')
        .set({
          output: ret.error,
          status: 'error',
          updated_at: now(),
        })
        .where('id', '=', task.id)
        .execute()
    }
  }

  console.log('translation job finished: ', job.id)

  return job
}
