-- ============================================================================
-- Studio Archive — initial schema (skypistudio.com/archive)
-- ============================================================================
-- One personal art catalogue per user. Composite text primary keys (user_id, id)
-- preserve the prototype's literal ids (art-10…, sup-…, sup2-…) so imports round-
-- trip byte-for-byte and each user gets an independent id namespace.
--
-- RLS is the security boundary (the app ships a publishable anon key); every
-- policy is `to authenticated` and scoped to the caller's own rows. No anon
-- policies exist, so the anon key can read nothing.
--
-- Applied to the NEW dedicated project only (never AccessMap prod). If the
-- storage.objects policy block fails on ownership under the MCP role, run just
-- that block from the dashboard SQL editor (see the note above it).
--
-- ROLLBACK (manual, reverse dependency order):
--   drop table if exists public.artwork_supplies;
--   drop table if exists public.artworks;
--   drop table if exists public.supplies;
--   drop function if exists public.archive_set_updated_at();
--   drop policy if exists "archive_photos_select" on storage.objects;
--   drop policy if exists "archive_photos_insert" on storage.objects;
--   drop policy if exists "archive_photos_update" on storage.objects;
--   drop policy if exists "archive_photos_delete" on storage.objects;
--   delete from storage.buckets where id = 'artwork-photos';
-- ============================================================================

-- ---- shared updated_at trigger -------------------------------------------------
-- security invoker + empty search_path (satisfies the "function search path
-- mutable" advisor; now() resolves from pg_catalog regardless).
create or replace function public.archive_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---- supplies -----------------------------------------------------------------
create table if not exists public.supplies (
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  id         text        not null,
  name       text        not null default '',
  brand      text        not null default '',
  medium     text        not null default '',
  hex        text        not null default '#888888' check (hex ~ '^#[0-9a-f]{6}$'),
  notes      text        not null default '',
  swatched   boolean     not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create trigger supplies_set_updated_at
  before update on public.supplies
  for each row execute function public.archive_set_updated_at();

-- ---- artworks -----------------------------------------------------------------
create table if not exists public.artworks (
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  id         text        not null,
  sort_order integer     not null default 0,
  title      text        not null default '',
  medium     text        not null default '',
  note       text        not null default '',
  extras     text        not null default '',
  palette    text[]      not null default '{}' check (cardinality(palette) <= 8),
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists artworks_user_sort_idx on public.artworks (user_id, sort_order);

create trigger artworks_set_updated_at
  before update on public.artworks
  for each row execute function public.archive_set_updated_at();

-- ---- artwork_supplies (join) --------------------------------------------------
-- Composite FKs share user_id so the link can only ever join a user's own rows.
create table if not exists public.artwork_supplies (
  user_id    uuid not null default auth.uid(),
  artwork_id text not null,
  supply_id  text not null,
  primary key (user_id, artwork_id, supply_id),
  constraint artwork_supplies_artwork_fk
    foreign key (user_id, artwork_id) references public.artworks (user_id, id) on delete cascade,
  constraint artwork_supplies_supply_fk
    foreign key (user_id, supply_id) references public.supplies (user_id, id) on delete cascade
);

create index if not exists artwork_supplies_user_supply_idx
  on public.artwork_supplies (user_id, supply_id);

-- ---- row level security -------------------------------------------------------
alter table public.supplies         enable row level security;
alter table public.artworks         enable row level security;
alter table public.artwork_supplies enable row level security;

-- supplies
create policy supplies_select on public.supplies
  for select to authenticated using (user_id = (select auth.uid()));
create policy supplies_insert on public.supplies
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy supplies_update on public.supplies
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy supplies_delete on public.supplies
  for delete to authenticated using (user_id = (select auth.uid()));

-- artworks
create policy artworks_select on public.artworks
  for select to authenticated using (user_id = (select auth.uid()));
create policy artworks_insert on public.artworks
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy artworks_update on public.artworks
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy artworks_delete on public.artworks
  for delete to authenticated using (user_id = (select auth.uid()));

-- artwork_supplies
create policy artwork_supplies_select on public.artwork_supplies
  for select to authenticated using (user_id = (select auth.uid()));
create policy artwork_supplies_insert on public.artwork_supplies
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy artwork_supplies_update on public.artwork_supplies
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy artwork_supplies_delete on public.artwork_supplies
  for delete to authenticated using (user_id = (select auth.uid()));

-- ---- storage: private photo bucket -------------------------------------------
-- 5 MB cap, JPEG only. Object keys are `{uid}/{artId}/thumb.jpg|display.jpg`, so
-- the first path segment is the owner's uid — the policies below enforce that.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('artwork-photos', 'artwork-photos', false, 5242880, array['image/jpeg'])
on conflict (id) do nothing;

-- NOTE: if these four policies error with "must be owner of table objects" under
-- the MCP role, run THIS block alone from the dashboard SQL editor (Sky's
-- session owns storage). Everything above applies fine via apply_migration.
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
