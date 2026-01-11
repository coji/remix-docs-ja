import type {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from 'kysely'

// Database tables
export interface Database {
  projects: ProjectsTable
  files: FilesTable
  translation_jobs: TranslationJobsTable
  translation_tasks: TranslationTasksTable
}

// Projects table
export interface ProjectsTable {
  id: string
  description: string | null
  prompt: string
  path: string
  pattern: string
  excludes: string
  updated_at: ColumnType<string, string | undefined, string | undefined>
  created_at: ColumnType<string, string | undefined, never>
}

export type Project = Selectable<ProjectsTable>
export type NewProject = Insertable<ProjectsTable>
export type ProjectUpdate = Updateable<ProjectsTable>

// Files table
export interface FilesTable {
  id: Generated<number>
  project_id: string
  path: string
  content: string
  content_md5: string
  title: string | null
  attrs: string | null
  is_updated: ColumnType<number, number | undefined, number | undefined>
  output: string | null
  translated_at: string | null
  updated_at: ColumnType<string, string | undefined, string | undefined>
  created_at: ColumnType<string, string | undefined, never>
}

export type File = Selectable<FilesTable>
export type NewFile = Insertable<FilesTable>
export type FileUpdate = Updateable<FilesTable>

// Translation jobs table
export interface TranslationJobsTable {
  id: Generated<number>
  project_id: string
  file_count: number
  translated_count: number
  status: string
  prompt_tokens: number
  output_tokens: number
  updated_at: ColumnType<string, string | undefined, string | undefined>
  created_at: ColumnType<string, string | undefined, never>
}

export type TranslationJob = Selectable<TranslationJobsTable>
export type NewTranslationJob = Insertable<TranslationJobsTable>
export type TranslationJobUpdate = Updateable<TranslationJobsTable>

// Translation tasks table
export interface TranslationTasksTable {
  id: Generated<number>
  job_id: number
  input: string
  output: string
  status: string
  prompt_tokens: number
  output_tokens: number
  prompt: string
  generated: string
  updated_at: ColumnType<string, string | undefined, string | undefined>
  created_at: ColumnType<string, string | undefined, never>
}

export type TranslationTask = Selectable<TranslationTasksTable>
export type NewTranslationTask = Insertable<TranslationTasksTable>
export type TranslationTaskUpdate = Updateable<TranslationTasksTable>
