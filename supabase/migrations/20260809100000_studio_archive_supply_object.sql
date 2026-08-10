-- ============================================================================
-- Studio Archive — add supplies.object_path (the real art-supply photo)
-- ============================================================================
-- The card FRONT can show a cut-out photo of the physical supply (pencil / bar /
-- pan) that comes alive on hover (the "Spotlight" motion). Additive + nullable,
-- so it is safe on the live, seeded table: existing rows get NULL and fall back
-- to the pigment-stick look. Objects live in the SAME private `artwork-photos`
-- bucket under `{uid}/object/{supplyId}/thumb.jpg|display.jpg`; the first path
-- segment is still the owner's uid, so the existing storage.objects RLS already
-- scopes them to the owner — no new storage policy needed.
--
-- ROLLBACK:
--   alter table public.supplies drop column if exists object_path;
-- ============================================================================

alter table public.supplies
  add column if not exists object_path text;

-- Object cut-outs are transparent PNGs (so the supply floats with no box behind
-- it during the Spotlight motion). The bucket was JPEG-only; allow PNG too.
update storage.buckets
  set allowed_mime_types = array['image/jpeg', 'image/png']
  where id = 'artwork-photos';
