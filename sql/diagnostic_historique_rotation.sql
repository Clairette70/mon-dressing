-- MON DRESSING — Diagnostic en LECTURE SEULE avant création de la mémoire de rotation
-- 24 novembre 2026
--
-- Objet : examiner uniquement la structure des tables, contraintes et protections RLS.
-- Ne lit AUCUN vêtement, aucune tenue, aucune donnée personnelle ni aucun secret.
-- N'exécute AUCUN CREATE, ALTER, INSERT, UPDATE ou DELETE.
-- À utiliser dans le SQL Editor de Supabase, après vérification du bon projet,
-- ou directement via le connecteur Supabase une fois autorisé.
--
-- Tables ciblées : public."vêtements", public.tenues,
--                  public.labo_sessions, public.labo_evenements
-- L'absence des deux dernières est normale si la migration n'a pas été créée.

WITH colonnes AS (
  SELECT
    'COLONNE'::text AS rubrique,
    c.table_name || '.' || c.column_name AS objet,
    concat(
      'type=', c.data_type, ' (', c.udt_name, ')',
      '; nullable=', c.is_nullable,
      '; defaut=', coalesce(c.column_default, 'aucun')
    ) AS details
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name IN ('vêtements', 'tenues', 'labo_sessions', 'labo_evenements')
),
tables AS (
  SELECT
    'TABLE'::text AS rubrique,
    t.tablename::text AS objet,
    concat(
      'RLS activé=', t.rowsecurity,
      '; RLS forcé=', t.forcerowsecurity,
      '; propriétaire=', t.tableowner
    ) AS details
  FROM pg_catalog.pg_tables t
  WHERE t.schemaname = 'public'
    AND t.tablename IN ('vêtements', 'tenues', 'labo_sessions', 'labo_evenements')
),
politiques AS (
  SELECT
    'POLITIQUE_RLS'::text AS rubrique,
    p.tablename || '.' || p.policyname AS objet,
    concat(
      'commande=', p.cmd,
      '; rôles=', array_to_string(p.roles, ','),
      '; USING=', coalesce(p.qual, '—'),
      '; WITH CHECK=', coalesce(p.with_check, '—')
    ) AS details
  FROM pg_catalog.pg_policies p
  WHERE p.schemaname = 'public'
    AND p.tablename IN ('vêtements', 'tenues', 'labo_sessions', 'labo_evenements')
),
contraintes AS (
  SELECT
    'CONTRAINTE'::text AS rubrique,
    cls.relname || '.' || con.conname AS objet,
    pg_get_constraintdef(con.oid) AS details
  FROM pg_catalog.pg_constraint con
  JOIN pg_catalog.pg_class cls ON cls.oid = con.conrelid
  JOIN pg_catalog.pg_namespace ns ON ns.oid = cls.relnamespace
  WHERE ns.nspname = 'public'
    AND cls.relname IN ('vêtements', 'tenues', 'labo_sessions', 'labo_evenements')
),
indexs AS (
  SELECT
    'INDEX'::text AS rubrique,
    i.tablename || '.' || i.indexname AS objet,
    i.indexdef AS details
  FROM pg_catalog.pg_indexes i
  WHERE i.schemaname = 'public'
    AND i.tablename IN ('vêtements', 'tenues', 'labo_sessions', 'labo_evenements')
)
SELECT rubrique, objet, details FROM tables
UNION ALL SELECT rubrique, objet, details FROM colonnes
UNION ALL SELECT rubrique, objet, details FROM contraintes
UNION ALL SELECT rubrique, objet, details FROM politiques
UNION ALL SELECT rubrique, objet, details FROM indexs
ORDER BY rubrique, objet;

-- Ce diagnostic ne valide pas à lui seul la sécurité d'une future migration.
-- Les tables à créer doivent appartenir à l'utilisateur authentifié (auth.uid()),
-- protéger SELECT/INSERT/UPDATE/DELETE par RLS et éviter tout lien ambigu
-- entre « tenue proposée » et « tenue réellement portée ».
-- Ne pas appliquer de migration avant analyse des résultats et plan de retour arrière.
