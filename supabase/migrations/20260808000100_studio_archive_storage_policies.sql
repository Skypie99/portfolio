-- ============================================================================
-- Studio Archive — storage.objects RLS policies (private artwork-photos bucket)
-- ============================================================================
-- Split out from 20260808000000_studio_archive_init.sql on purpose: CREATE POLICY
-- on storage.objects can require ownership of that table, and a failure here must
-- NOT roll back the schema. This file runs as its own transaction — if it fails
-- with "must be owner of relation objects" under a restricted role, the schema
-- migration is already safely committed and you can run THIS block from the
-- dashboard SQL editor (Sky's session owns storage) instead.
--
-- Object keys are `{uid}/{artId}/thumb.jpg|display.jpg`; each policy scopes to the
-- owner by matching the first path segment to the caller's uid.
--
-- ROLLBACK:
--   drop policy if exists "archive_photos_select" on storage.objects;
--   drop policy if exists "archive_photos_insert" on storage.objects;
--   drop policy if exists "archive_photos_update" on storage.objects;
--   drop policy if exists "archive_photos_delete" on storage.objects;
-- ============================================================================

create policy "archive_photos_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'artwork-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "archive_photos_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'artwork-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "archive_photos_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'artwork-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'artwork-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "archive_photos_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'artwork-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
