-- ============================================================================
-- Content OS — Supabase semasi (MVP). Constitution Bolum 7.
-- Calistir: Supabase SQL Editor'a yapistir.
-- ============================================================================

-- Marka beyni (her kullanici 1+ marka)
create table if not exists brands (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete cascade,
  name        text not null,
  sector      text not null,              -- 'insaat' | 'kafe' | 'eticaret' | 'hizmet' | 'guzellik'
  identity    jsonb not null default '{}'::jsonb,  -- misyon, deger onerisi, kisilik[]
  voice       jsonb not null default '{}'::jsonb,  -- ton(0-10), cumle yapisi, yasak[], imza[]
  audience    jsonb not null default '[]'::jsonb,  -- personas[] {name, pain, motivation}
  proof       jsonb not null default '{}'::jsonb,  -- numbers[], cases[], references[]
  created_at  timestamptz not null default now()
);

-- Uretilen icerik paketleri
create table if not exists content_packages (
  id           uuid primary key default gen_random_uuid(),
  brand_id     uuid references brands (id) on delete cascade,
  topic        text not null,
  content_type text not null,             -- 'deger' | 'urun' | 'hikaye' | 'kanit' | 'satis'
  angle        text not null,             -- 'korku' | 'kazanc' | 'sosyal_kanit' | 'egitici' | 'karsitlik'
  outputs      jsonb not null,            -- {instagram, tiktok, linkedin, x}
  created_at   timestamptz not null default now()
);

-- Sektor zekasi (sistem verisi; kullanici duzenlemez). Uygulama kodu da seed iceriyor.
create table if not exists sector_intelligence (
  sector      text primary key,          -- 'insaat' ...
  terminology jsonb not null default '[]'::jsonb,
  content_mix jsonb not null default '{}'::jsonb,  -- {deger: 50, urun: 30, ...}
  hooks       jsonb not null default '[]'::jsonb,
  seasonality jsonb not null default '{}'::jsonb
);

-- --- Row Level Security ------------------------------------------------------
alter table brands enable row level security;
alter table content_packages enable row level security;

create policy "own brands" on brands
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own packages" on content_packages
  for all using (
    auth.uid() = (select user_id from brands b where b.id = content_packages.brand_id)
  );

-- --- Seed: SADECE insaat (Constitution Bolum 11, adim 3) ---------------------
insert into sector_intelligence (sector, terminology, content_mix, hooks, seasonality)
values (
  'insaat',
  '["agrega","donati","hazir beton","santiye","muteahhit","tedarik suresi","tonaj"]'::jsonb,
  '{"deger":50,"urun":30,"kanit":20,"hikaye":0,"satis":0}'::jsonb,
  '["Santiyede en pahali hata: ___","Muteahhitlerin %80i bunu yanlis yapiyor","500 muteahhit neden ayni tedarikciyi secti?"]'::jsonb,
  '{"active_months":"Mart-Kasim","note":"Kis aylarinda planlama ve tedarik anlasmalari on plana cikar"}'::jsonb
)
on conflict (sector) do nothing;
