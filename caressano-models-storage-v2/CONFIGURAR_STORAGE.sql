-- Ejecutar SOLO después de revisar y autorizar, primero en un proyecto de prueba.
-- Preparado para valentincabralakd@gmail.com; la cuenta debe existir en Supabase Auth.
-- No modifica caressano_site, no elimina fotos ni permite cargas anónimas.
begin;

create table if not exists public.caressano_media_admins (
  user_id uuid primary key references auth.users(id)
);
alter table public.caressano_media_admins enable row level security;
revoke all on public.caressano_media_admins from anon, authenticated;
grant select on public.caressano_media_admins to authenticated;

do $$
declare
  admin_email text := 'valentincabralakd@gmail.com';
  admin_id uuid;
begin
  if position('@' in admin_email) < 2 then
    raise exception 'Primero reemplazar el marcador por el correo del administrador.';
  end if;
  select id into admin_id from auth.users where lower(email) = lower(admin_email);
  if admin_id is null then raise exception 'La cuenta no existe en Supabase Authentication'; end if;
  insert into public.caressano_media_admins(user_id) values(admin_id) on conflict do nothing;

  if not exists(select 1 from pg_policies where schemaname='public' and tablename='caressano_media_admins' and policyname='caressano_media_admin_self') then
    create policy caressano_media_admin_self on public.caressano_media_admins
      for select to authenticated using(user_id=(select auth.uid()));
  end if;
end $$;

insert into storage.buckets(id,name,public,file_size_limit)
values('caressano-media','caressano-media',true,52428800)
on conflict(id) do nothing;

do $$
begin
  if not exists(select 1 from storage.buckets where id='caressano-media' and public=true) then
    raise exception 'El bucket existente es privado: no se modificó. Revisar antes de continuar.';
  end if;
  if not exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='caressano_media_admin_insert_v2') then
    create policy caressano_media_admin_insert_v2 on storage.objects
      for insert to authenticated with check (
        bucket_id='caressano-media'
        and (storage.foldername(name))[1]='main'
        and exists(select 1 from public.caressano_media_admins where user_id=(select auth.uid()))
      );
  end if;
end $$;
commit;

-- Verificación: deben aparecer el bucket público y un administrador permitido.
select id, public, file_size_limit from storage.buckets where id='caressano-media';
select user_id from public.caressano_media_admins;

