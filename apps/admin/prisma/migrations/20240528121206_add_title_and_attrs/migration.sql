-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_files" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "project_id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "content_md5" TEXT NOT NULL,
    "title" TEXT,
    "attrs" TEXT,
    "isUpdated" BOOLEAN NOT NULL DEFAULT true,
    "output" TEXT,
    "translated_at" DATETIME,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "files_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_files" ("content", "content_md5", "createdAt", "id", "isUpdated", "output", "path", "project_id", "translated_at", "updatedAt") SELECT "content", "content_md5", "createdAt", "id", "isUpdated", "output", "path", "project_id", "translated_at", "updatedAt" FROM "files";
DROP TABLE "files";
ALTER TABLE "new_files" RENAME TO "files";
CREATE UNIQUE INDEX "files_project_id_path_key" ON "files"("project_id", "path");
PRAGMA foreign_key_check("files");
PRAGMA foreign_keys=ON;
