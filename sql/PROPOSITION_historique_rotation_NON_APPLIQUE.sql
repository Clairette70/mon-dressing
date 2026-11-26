-- PROPOSITION NON APPLIQUÉE : historique de rotation de Mon Dressing
-- Date : 24 novembre 2026
-- STATUT : CONCEPTION VALIDÉE PAR TESTS RÉVERSIBLES, PAS UNE MIGRATION APPLIQUÉE.
-- Test du 26 novembre 2026 : tables équivalentes créées dans un schéma temporaire,
-- contrôles de contraintes, unicité et isolation entre identités simulées,
-- le tout annulé explicitement par ROLLBACK. Aucun objet conservé.
-- Attention : les accès anon par API, les scénarios complets à deux vrais comptes,
-- les événements métier, les sauvegardes et la double soumission client
-- restent à tester avant une application durable.
-- Correction issue du test : DEFAULT auth.uid() (et non DEFAULT (select auth.uid()),
-- forme refusée par PostgreSQL).
-- Après validation du modèle de données, utiliser le mécanisme de migrations Supabase.
-- Ne pas exécuter ce fichier sans sauvegarde et validation explicite.
--
-- Tables de journal indépendantes de public."vêtements" et public.tenues.
-- Les données enregistrent le contexte d'une association, jamais un rejet global
-- d'un vêtement. Une tenue enregistrée n'est PAS considérée comme portée.
-- L'historique est append-only : une correction crée un nouvel événement.

begin;

create table public.labo_sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid()
       references auth.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    request_context jsonb not null default '{}'::jsonb,
    constraint labo_sessions_context_object
       check (jsonb_typeof(request_context) = 'object'),
    constraint labo_sessions_owner_pair unique (id, user_id)
);

create table public.labo_evenements (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null,
    user_id uuid not null default auth.uid()
       references auth.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    type_evenement text not null check (type_evenement in (
        'examinee', 'proposee', 'remplacement_demande',
        'remplacement_propose', 'remplacement_refuse',
        'tenue_enregistree', 'tenue_portee', 'port_annule'
    )),
    -- Ensemble des IDs figurant dans la tenue à ce moment-là, si applicable.
    piece_ids bigint[] not null default '{}'::bigint[],
    -- Données contextualisées : piece_remplacee_id, alternative_id,
    -- ids_des_autres_pieces, jour_de_port, motif explicite, etc.
    contexte jsonb not null default '{}'::jsonb,
    constraint labo_evenements_contexte_object
       check (jsonb_typeof(contexte) = 'object'),
    constraint labo_evenements_session_owner_fk
       foreign key (session_id, user_id)
       references public.labo_sessions (id, user_id)
       on delete cascade
);

create index labo_sessions_owner_date_idx
    on public.labo_sessions (user_id, created_at desc);
create index labo_evenements_session_date_idx
    on public.labo_evenements (session_id, created_at desc);
create index labo_evenements_owner_type_date_idx
    on public.labo_evenements (user_id, type_evenement, created_at desc);

alter table public.labo_sessions enable row level security;
alter table public.labo_evenements enable row level security;

-- Pas de politique UPDATE ni DELETE : journal immuable.
-- Corriger un port déclaré par erreur avec 'port_annule', sans effacer
-- l'historique. Ne jamais transformer 'tenue_enregistree' en 'tenue_portee'.

create policy labo_sessions_lecture_proprietaire
    on public.labo_sessions for select to authenticated
    using ((select auth.uid()) = user_id);
create policy labo_sessions_ajout_proprietaire
    on public.labo_sessions for insert to authenticated
    with check ((select auth.uid()) = user_id);

create policy labo_evenements_lecture_proprietaire
    on public.labo_evenements for select to authenticated
    using ((select auth.uid()) = user_id);
create policy labo_evenements_ajout_proprietaire
    on public.labo_evenements for insert to authenticated
    with check ((select auth.uid()) = user_id);

revoke all on table public.labo_sessions from anon;
revoke all on table public.labo_evenements from anon;
revoke all on table public.labo_sessions from authenticated;
revoke all on table public.labo_evenements from authenticated;
grant select, insert on table public.labo_sessions to authenticated;
grant select, insert on table public.labo_evenements to authenticated;

commit;

-- À tester AVANT exploitation :
-- 1. Connecté en utilisateur A, insert/select autorisés.
-- 2. Sans connexion et en utilisateur B, aucune lecture ni écriture de A.
-- 3. Un événement avec user_id de A et session_id de B doit être refusé.
-- 4. UPDATE et DELETE interdits depuis le client.
-- 5. 'tenue_enregistree' n'incrémente pas le compteur de ports.
-- 6. 'remplacement_refuse' n'abaisse pas un score global de la pièce ;
--    l'association est identifiée par les pièces présentes dans contexte.
-- 7. Les vrais IDs des vêtements doivent être vérifiés par le moteur
--    dans le périmètre utilisateur avant de générer un événement.
-- 8. Test de double clic : l'UUID client d'événement doit être réutilisé
--    en cas de retry pour empêcher un double 'tenue_portee'.
-- 9. Avant déploiement, vérifier Supabase Advisors, la Data API et
--    le fonctionnement de la V9. Ne jamais promouvoir directement le labo.
