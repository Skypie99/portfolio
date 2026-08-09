-- ============================================================================
-- Studio Archive — add supplies.swatch_path (real physical-swatch photo)
-- ============================================================================
-- Additive + nullable, so it is safe on the live, seeded table: existing rows
-- get NULL (no swatch photo yet) and old client builds ignore the column.
--
-- Swatch objects live in the SAME private `artwork-photos` bucket under keys
-- `{uid}/supply/{supplyId}/thumb.jpg|display.jpg`. The first path segment is
-- still the owner's uid, so the existing storage.objects RLS policies
-- (20260808000100_studio_archive_storage_policies.sql) already scope them to the
-- owner — no new storage policy is needed.
--
-- ROLLBACK:
--   alter table public.supplies drop column if exists swatch_path;
-- ============================================================================

alter table public.supplies
  add column if not exists swatch_path text;
