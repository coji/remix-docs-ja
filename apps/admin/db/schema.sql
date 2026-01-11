-- Atlas schema for admin app

CREATE TABLE projects (
  id TEXT PRIMARY KEY NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  path TEXT NOT NULL,
  pattern TEXT NOT NULL,
  excludes TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  path TEXT NOT NULL,
  content TEXT NOT NULL,
  content_md5 TEXT NOT NULL,
  title TEXT,
  attrs TEXT,
  is_updated INTEGER NOT NULL DEFAULT 1,
  output TEXT,
  translated_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE (project_id, path)
);

CREATE TABLE translation_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  file_count INTEGER NOT NULL,
  translated_count INTEGER NOT NULL,
  status TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE translation_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL,
  input TEXT NOT NULL,
  output TEXT NOT NULL,
  status TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  prompt TEXT NOT NULL,
  generated TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (job_id) REFERENCES translation_jobs(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_files_project_id ON files(project_id);
CREATE INDEX idx_translation_jobs_project_id ON translation_jobs(project_id);
CREATE INDEX idx_translation_tasks_job_id ON translation_tasks(job_id);
