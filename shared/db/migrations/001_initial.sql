-- Migration 001: initial schema
-- Run after: psql $DATABASE_URL -f shared/db/schema.sql
\i ../schema.sql
