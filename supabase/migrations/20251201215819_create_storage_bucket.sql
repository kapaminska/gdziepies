-- =====================================================================
-- migration:    create_storage_bucket
-- filename:     20251201215819_create_storage_bucket.sql
-- purpose:      utworzenie bucketu Storage 'announcements' dla zdjęć ogłoszeń
--               z odpowiednimi politykami RLS
-- =====================================================================

-- utworzenie bucketu 'announcements'
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'announcements',
  'announcements',
  true, -- publiczny bucket (można pobierać publiczne URL)
  5242880, -- 5MB limit
  array['image/jpeg', 'image/jpg', 'image/png']
)
on conflict (id) do nothing;

-- =====================================================================
-- polityki RLS dla storage.objects w bucketcie 'announcements'
-- =====================================================================

-- polityka: wszyscy mogą czytać pliki (bucket jest publiczny)
create policy "announcements_select_public"
  on storage.objects for select
  using (bucket_id = 'announcements');

-- polityka: zalogowani użytkownicy mogą uploadować pliki
create policy "announcements_insert_authenticated"
  on storage.objects for insert
  with check (
    bucket_id = 'announcements' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- polityka: zalogowani użytkownicy mogą aktualizować swoje pliki
create policy "announcements_update_authenticated"
  on storage.objects for update
  using (
    bucket_id = 'announcements' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'announcements' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- polityka: zalogowani użytkownicy mogą usuwać swoje pliki
create policy "announcements_delete_authenticated"
  on storage.objects for delete
  using (
    bucket_id = 'announcements' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

