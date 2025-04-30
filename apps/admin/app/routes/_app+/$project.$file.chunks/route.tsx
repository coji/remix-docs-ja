import type { File, Project } from '@prisma/client'
import { useOutletContext } from 'react-router'
import { Label, Textarea } from '~/components/ui'
import { splitMarkdownByHeaders } from '~/libs/split-markdown'

export default function TestPage() {
  const { file } = useOutletContext<{ file: File; project: Project }>()
  const chunks = splitMarkdownByHeaders(file.content)

  return (
    <div className="grid grid-cols-2 grid-rows-1 gap-2">
      <div className="grid grid-cols-1 grid-rows-[auto_1fr] gap-2">
        <Label htmlFor="original">Original</Label>
        <Textarea
          id="original"
          className="block rounded border"
          defaultValue={file.content}
        />
      </div>
      <div className="grid grid-cols-1 gap-4">
        {chunks.map((chunk, index) => (
          <div className="grid grid-cols-1" key={`${index}_${chunk}`}>
            <div className="mb-0.5 flex text-sm">
              <span>{index + 1}. </span>
              <span className="flex-1" />
              <span className="text-muted-foreground text-sm">
                {chunk.length.toLocaleString()} characters
              </span>
            </div>
            <div className="rounded border bg-slate-50 px-3 py-2 text-sm break-words whitespace-pre-wrap">
              {chunk}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
