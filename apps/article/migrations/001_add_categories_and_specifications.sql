-- Migration: Add categories, article_categories junction table, and specifications column
-- Created: 2024
-- Description: Adds hierarchical category system, many-to-many article-category relationships, and product specifications

-- Create categories table
CREATE TABLE IF NOT EXISTS "categories" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "name" varchar(100) NOT NULL,
    "slug" varchar(120) NOT NULL,
    "description" text,
    "parentId" varchar(50),
    "isActive" boolean NOT NULL DEFAULT true,
    "order" integer NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "PK_categories" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_categories_slug" UNIQUE ("slug")
);

-- Create indexes for categories
CREATE INDEX IF NOT EXISTS "IDX_categories_name" ON "categories" ("name");
CREATE INDEX IF NOT EXISTS "IDX_categories_parentId" ON "categories" ("parentId");
CREATE INDEX IF NOT EXISTS "IDX_categories_isActive" ON "categories" ("isActive");

-- Create article_categories junction table
CREATE TABLE IF NOT EXISTS "article_categories" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "articleId" varchar(50) NOT NULL,
    "categoryId" varchar(50) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMP,
    CONSTRAINT "PK_article_categories" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_article_categories_article_category" UNIQUE ("articleId", "categoryId")
);

-- Create indexes for article_categories
CREATE INDEX IF NOT EXISTS "IDX_article_categories_articleId" ON "article_categories" ("articleId");
CREATE INDEX IF NOT EXISTS "IDX_article_categories_categoryId" ON "article_categories" ("categoryId");

-- Add specifications column to articles table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'specifications'
    ) THEN
        ALTER TABLE "articles" ADD COLUMN "specifications" jsonb;
    END IF;
END $$;

-- Add foreign key constraints (if articles table uses UUID for id)
-- Note: Adjust these based on your actual article table structure
-- ALTER TABLE "article_categories" 
--     ADD CONSTRAINT "FK_article_categories_article" 
--     FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE;

-- ALTER TABLE "article_categories" 
--     ADD CONSTRAINT "FK_article_categories_category" 
--     FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE;

-- ALTER TABLE "categories" 
--     ADD CONSTRAINT "FK_categories_parent" 
--     FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL;

-- Create full-text search indexes for articles (PostgreSQL)
-- These indexes improve search performance on title, description, and SKU
CREATE INDEX IF NOT EXISTS "IDX_articles_title_fts" ON "articles" USING gin(to_tsvector('simple', COALESCE("title", '')));
CREATE INDEX IF NOT EXISTS "IDX_articles_description_fts" ON "articles" USING gin(to_tsvector('simple', COALESCE("description", '')));
CREATE INDEX IF NOT EXISTS "IDX_articles_sku_fts" ON "articles" USING gin(to_tsvector('simple', COALESCE("sku", '')));

-- Create indexes for filtering performance
CREATE INDEX IF NOT EXISTS "IDX_articles_price" ON "articles" (CAST("price" AS DECIMAL));
CREATE INDEX IF NOT EXISTS "IDX_articles_stock" ON "articles" ("stock");
CREATE INDEX IF NOT EXISTS "IDX_articles_createdAt" ON "articles" ("createdAt");

-- Migration complete
-- Note: The old categoryId column in articles table is kept for backward compatibility
-- You may want to migrate existing categoryId data to the new article_categories table:
-- 
-- INSERT INTO article_categories ("articleId", "categoryId", "createdAt", "updatedAt")
-- SELECT "id", "categoryId", "createdAt", "updatedAt"
-- FROM articles
-- WHERE "categoryId" IS NOT NULL
-- ON CONFLICT DO NOTHING;

