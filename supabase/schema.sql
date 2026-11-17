-- Esquema de la Central de Contenido (proyecto Supabase: jorgito-contenido)
-- Ya está aplicado en el proyecto como dos migraciones: esquema_inicial y flujo_y_propuestas.

-- ===== Equipo autorizado (lista blanca de correos) =====
create table public.equipo (
  email text primary key check (email = lower(email)),
  nombre text,
  rol text not null default 'editor' check (rol in ('admin','editor')),
  creado timestamptz not null default now()
);

create or replace function public.es_equipo() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.equipo where email = lower(coalesce(auth.jwt()->>'email','')));
$$;

create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.equipo where email = lower(coalesce(auth.jwt()->>'email','')) and rol = 'admin');
$$;

-- El primer usuario que entra queda como admin (solo si el equipo está vacío)
create or replace function public.reclamar_admin() returns boolean
language plpgsql security definer set search_path = public as $$
declare correo text := lower(coalesce(auth.jwt()->>'email',''));
begin
  if correo = '' then return false; end if;
  perform pg_advisory_xact_lock(4242);
  if exists(select 1 from public.equipo) then return public.es_equipo(); end if;
  insert into public.equipo(email, rol) values (correo, 'admin');
  return true;
end $$;
revoke execute on function public.es_equipo() from public, anon;
revoke execute on function public.es_admin() from public, anon;
revoke execute on function public.reclamar_admin() from public, anon;
grant execute on function public.es_equipo() to authenticated;
grant execute on function public.es_admin() to authenticated;
grant execute on function public.reclamar_admin() to authenticated;

-- ===== Contenido =====
create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  pilar text not null default 'recetas' check (pilar in ('recetas','trucos','tendencias','versus','efemerides')),
  formato text,
  estado text not null default 'idea' check (estado in ('idea','aprobada','guion','grabacion','edicion','publicada')),
  fecha_grabacion date,
  fecha_publicacion date,
  plataformas text[] not null default '{}',
  gancho text default '', guion text default '', cta text default '', notas text default '',
  evento text default '', origen text default '',
  creado_por text default lower(coalesce(auth.jwt()->>'email','')),
  creado timestamptz not null default now(),
  editado timestamptz not null default now()
);

-- Flujo de trabajo de cada idea
create table public.idea_pasos (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  orden int not null default 0,
  titulo text not null,
  responsable text default '',
  fecha date,
  hecho boolean not null default false,
  hecho_por text default '',
  hecho_en timestamptz
);
create index on public.idea_pasos(idea_id);

-- Propuestas dentro de cada idea (de la IA o del equipo)
create table public.idea_propuestas (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  tipo text not null default 'mejora' check (tipo in ('titulo','gancho','guion','cta','copy','miniatura','mejora','marca')),
  texto text not null,
  autor text not null default lower(coalesce(auth.jwt()->>'email','')),
  es_ia boolean not null default false,
  estado text not null default 'pendiente' check (estado in ('pendiente','aceptada','descartada')),
  resuelta_por text default '',
  creado timestamptz not null default now()
);
create index on public.idea_propuestas(idea_id);

create table public.referentes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null, handle text default '', plataforma text default '',
  creado timestamptz not null default now()
);

create table public.radar (
  id uuid primary key default gen_random_uuid(),
  fecha timestamptz not null default now(),
  referente text default '', plataforma text default '', link text default '',
  resumen text not null, oportunidad text default '', pilar text default 'tendencias', vistas text default '',
  estado text not null default 'nuevo' check (estado in ('nuevo','usado','descartado')),
  origen text default 'manual'
);

create table public.metricas (
  id uuid primary key default gen_random_uuid(),
  semana date not null, plataforma text not null,
  seguidores bigint, alcance bigint, reproducciones bigint, interacciones bigint,
  top text default '', notas text default '',
  unique (semana, plataforma)
);

create table public.fechas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  md text,      -- 'MM-DD' si se repite todos los años
  fecha date,   -- fecha única
  pilar text default 'efemerides', al text default 'cl', nota text default '',
  check (md is not null or fecha is not null)
);

create table public.informes (
  id uuid primary key default gen_random_uuid(),
  fecha timestamptz not null default now(),
  texto text not null
);

-- ===== Seguridad: solo el equipo lee y escribe =====
do $$
declare t text;
begin
  foreach t in array array['ideas','idea_pasos','idea_propuestas','referentes','radar','metricas','fechas','informes'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "equipo lee" on public.%I for select to authenticated using (public.es_equipo())', t);
    execute format('create policy "equipo crea" on public.%I for insert to authenticated with check (public.es_equipo())', t);
    execute format('create policy "equipo edita" on public.%I for update to authenticated using (public.es_equipo()) with check (public.es_equipo())', t);
    execute format('create policy "equipo borra" on public.%I for delete to authenticated using (public.es_equipo())', t);
  end loop;
end $$;

alter table public.equipo enable row level security;
create policy "equipo ve equipo" on public.equipo for select to authenticated using (public.es_equipo());
create policy "admin agrega" on public.equipo for insert to authenticated with check (public.es_admin());
create policy "admin edita" on public.equipo for update to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "admin quita" on public.equipo for delete to authenticated using (public.es_admin() and email <> lower(coalesce(auth.jwt()->>'email','')));

-- ===== Disparadores =====
create or replace function public.tocar_editado() returns trigger language plpgsql set search_path = public as $$
begin new.editado = now(); return new; end $$;
create trigger ideas_editado before update on public.ideas for each row execute function public.tocar_editado();

-- Al crear una idea se le pone el flujo base
create or replace function public.flujo_base() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.idea_pasos(idea_id, orden, titulo) values
    (new.id, 1, 'Validar la idea con Jorgito'),
    (new.id, 2, 'Escribir guion y gancho'),
    (new.id, 3, 'Comprar insumos / conseguir producto'),
    (new.id, 4, 'Grabar'),
    (new.id, 5, 'Editar'),
    (new.id, 6, 'Escribir copy y hashtags'),
    (new.id, 7, 'Publicar en todas las plataformas'),
    (new.id, 8, 'Revisar resultados a las 48 horas');
  return new;
end $$;
revoke execute on function public.flujo_base() from public, anon, authenticated;
create trigger ideas_flujo after insert on public.ideas for each row execute function public.flujo_base();

-- Tiempo real para el tablero compartido
alter publication supabase_realtime add table public.ideas, public.radar, public.idea_pasos, public.idea_propuestas;

insert into public.referentes(nombre, plataforma) values ('RobeGrill','Instagram'),('Nick DiGiovanni','TikTok');
