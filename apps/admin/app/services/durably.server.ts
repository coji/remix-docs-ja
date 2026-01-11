import { createDurably, createDurablyHandler, defineJob } from '@coji/durably'
import { z } from 'zod'
import { db, dialect, now } from './db.server'
import { translateByGemini } from './translate-gemini'

// Define translation job
const translationJob = defineJob({
  name: 'translate-project',
  input: z.object({ projectId: z.string() }),
  output: z.object({
    translatedCount: z.number(),
    errorCount: z.number(),
    totalCount: z.number(),
    errors: z.array(z.object({ path: z.string(), error: z.string() })),
  }),
  run: async (step, { projectId }) => {
    // Fetch files to translate (also validates project exists)
    const files = await step.run('fetch-data', async () => {
      // Validate project exists
      await db
        .selectFrom('projects')
        .select('id')
        .where('id', '=', projectId)
        .executeTakeFirstOrThrow()

      return await db
        .selectFrom('files')
        .selectAll()
        .where('project_id', '=', projectId)
        .where('is_updated', '=', 1)
        .orderBy('created_at', 'asc')
        .execute()
    })

    step.log.info(`Starting translation for project: ${projectId}`)
    step.log.info(`Files to translate: ${files.length}`)

    const MAX_STORED_ERRORS = 50
    let translatedCount = 0
    let errorCount = 0
    const errors: { path: string; error: string }[] = []

    // Translate each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      const result = await step.run(`translate-file-${file.id}`, async () => {
        step.log.info(`Translating: ${file.path}`)

        const ret = await translateByGemini({
          source: file.content,
          prevTranslatedText: file.output ?? undefined,
        })

        if (ret.type === 'success') {
          await db
            .updateTable('files')
            .set({
              is_updated: 0,
              output: ret.translatedText,
              translated_at: now(),
              updated_at: now(),
            })
            .where('id', '=', file.id)
            .execute()

          step.log.info(`Translated: ${file.path}`)
          return { success: true as const, path: file.path }
        } else {
          step.log.error(`Failed: ${file.path} - ${ret.error}`)
          return { success: false as const, path: file.path, error: ret.error }
        }
      })

      if (result.success) {
        translatedCount++
      } else {
        errorCount++
        // Only store first MAX_STORED_ERRORS to prevent huge output
        if (errors.length < MAX_STORED_ERRORS) {
          errors.push({ path: result.path, error: result.error })
        }
      }

      // Report progress after each file
      step.progress(i + 1, files.length, `Translated ${i + 1}/${files.length}`)
    }

    step.log.info(
      `Translation complete: ${translatedCount} translated, ${errorCount} errors`,
    )

    return {
      translatedCount,
      errorCount,
      totalCount: files.length,
      errors,
    }
  },
})

// Create durably instance and register jobs
export const durably = createDurably({
  dialect,
  pollingInterval: 1000,
  heartbeatInterval: 5000,
  staleThreshold: 30000,
}).register({
  'translate-project': translationJob,
})

// Initialize durably tables
await durably.init()

// Export jobs for type inference on client
export const jobs = durably.jobs

// Create handler for API routes
export const durablyHandler = createDurablyHandler(durably)
