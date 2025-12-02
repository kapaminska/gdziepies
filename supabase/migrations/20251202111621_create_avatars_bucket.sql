-- =====================================================================
-- migration:    create_avatars_bucket
-- filename:     20251202111621_create_avatars_bucket.sql
-- purpose:      utworzenie bucketu Storage 'avatars' dla zdjęć profilowych
--               z odpowiednimi politykami RLS
-- =====================================================================

-- utworzenie bucketu 'avatars'
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true, -- publiczny bucket (można pobierać publiczne URL)
  2097152, -- 2MB limit
  array['image/jpeg', 'image/jpg', 'image/png']
)
on conflict (id) do nothing;

-- =====================================================================
-- polityki RLS dla storage.objects w bucketcie 'avatars'
-- =====================================================================

-- polityka: wszyscy mogą czytać pliki (bucket jest publiczny)
create policy "avatars_select_public"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- polityka: zalogowani użytkownicy mogą uploadować pliki do swojego folderu
create policy "avatars_insert_authenticated"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- polityka: zalogowani użytkownicy mogą aktualizować swoje pliki
create policy "avatars_update_authenticated"
  on storage.objects for update
  using (
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- polityka: zalogowani użytkownicy mogą usuwać swoje pliki
create policy "avatars_delete_authenticated"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );



