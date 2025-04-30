import { prisma } from '~/services/db.server'
import { translateByGemini } from '~/services/translate-gemini'

export const startTranslationJob = async (projectId: string) => {
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
  })
  const files = await prisma.file.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
  })

  const job = await prisma.translationJob.create({
    data: {
      projectId,
      fileCount: files.length,
      promptTokens: 0,
      outputTokens: 0,
      translatedCount: 0,
      status: 'pending',
    },
  })

  for (const file of files) {
    if (!file.isUpdated) {
      continue
    }

    console.log(`translation task started: ${file.path}`)
    const task = await prisma.translationTask.create({
      data: {
        jobId: job.id,
        input: file.content,
        output: '',
        prompt: project.prompt,
        promptTokens: 0,
        outputTokens: 0,
        generated: '',
        status: 'pending',
      },
    })

    const ret = await translateByGemini({
      source: file.content,
      prevTranslatedText: file.output ?? undefined,
    })

    console.log(file.path, ret.type)

    if (ret.type === 'success') {
      const updated = await prisma.file.update({
        where: { id: file.id },
        data: {
          isUpdated: false,
          output: ret.translatedText,
          translatedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
      console.log(`file updated: ${updated.path}`)

      await prisma.translationTask.update({
        where: { id: task.id },
        data: {
          output: ret.translatedText,
          status: 'done',
        },
      })
    } else {
      await prisma.translationTask.update({
        where: { id: task.id },
        data: {
          output: ret.error,
          status: 'error',
        },
      })
    }
  }

  console.log('translation job finished: ', job.id)

  return job
}
