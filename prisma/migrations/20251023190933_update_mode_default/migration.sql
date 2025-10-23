-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AlmaSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "messages" JSONB NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'speak',
    "memory" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AlmaSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AlmaSession" ("createdAt", "id", "memory", "messages", "mode", "title", "updatedAt", "userId") SELECT "createdAt", "id", "memory", "messages", "mode", "title", "updatedAt", "userId" FROM "AlmaSession";
DROP TABLE "AlmaSession";
ALTER TABLE "new_AlmaSession" RENAME TO "AlmaSession";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
