-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT,
    "prompt" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "excludes" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_projects" ("createdAt", "description", "id", "path", "pattern", "prompt", "updatedAt") SELECT "createdAt", "description", "id", "path", "pattern", "prompt", "updatedAt" FROM "projects";
DROP TABLE "projects";
ALTER TABLE "new_projects" RENAME TO "projects";
PRAGMA foreign_key_check("projects");
PRAGMA foreign_keys=ON;
