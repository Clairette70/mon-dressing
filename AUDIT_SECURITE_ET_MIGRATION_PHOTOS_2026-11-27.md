# Mon Dressing — Audit préalable sécurité et stockage photo

**Date : 27 novembre 2026**  
**Statut : audit en lecture seule + essai SQL transactionnel annulé. Aucune migration ni révocation permanente appliquée.**  
**Périmètre :** dépôt GitHub public, tables existantes, Supabase Storage et fonction d'activation automatique RLS. Aucune donnée personnelle ou photographie n'est copiée dans ce document public.

## 1. État constaté

- Le dépôt `Clairette70/mon-dressing` est **public**. Tout visiteur peut donc recopier le code du frontend et les sources serveur conservées dans le dépôt. La base Supabase n'est pas pour autant librement accessible ; ses droits doivent être vérifiés indépendamment.
- `public."vêtements"` : **50** fiches dont **50** images enregistrées sous forme d'URI `data:image/...` dans `photo_url`. Volume total du texte des images : **environ 60,9 Mo** (octets UTF-8).
- `public.tenues` : **3** lignes.
- Bucket Storage `photos-vetements` : `public=false` et **0 objet**. Ne pas croire que les images actuelles y sont stockées.
- RLS activée sur `vêtements` et `tenues` ; les politiques de `vêtements` sont réservées au compte propriétaire existant et celles de `tenues` filtrent selon `auth.uid() = user_id`.
- Les politiques d'accès aux photos dans Storage utilisent un **identifiant qui ne correspond à aucun utilisateur présent dans `auth.users`**. Elles devront être corrigées avant tout téléversement. Ne pas inscrire d'UUID de compte personnel dans cette documentation publique.
- La V9 récupère actuellement tous les champs via `select('*')` et utilise directement `photo_url` dans les images. Changer la signification de `photo_url` sans adapter tous les lecteurs casserait les photos.
- La fonction `public.rls_auto_enable()` (`SECURITY DEFINER`) est attachée au déclencheur d'événements `ensure_rls` (`ddl_command_end`). Les avis de sécurité Supabase signalent qu'elle est exécutable par `anon` et `authenticated` via l'API RPC.
- Essai de **révocation réversible** dans `BEGIN ... ROLLBACK` : après `REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated`, les deux rôles n'avaient plus `EXECUTE`, tandis que le déclencheur d'événements restait activé. **La transaction a été annulée : l'alerte n'est pas corrigée en production.**
- L'analyseur de sécurité signale aussi la protection contre les mots de passe compromis désactivée. Les politiques RLS des vêtements peuvent être optimisées pour le coût des requêtes, séparément de la correction sécurité.

## 2. Ordre de travaux — ne pas perdre de données

1. **Sauvegarde indépendante à restaurer** : exporter la liste des 50 fiches avec les images complètes et les 3 tenues, conserver la copie dans un lieu privé hors dépôt GitHub, tester la lisibilité et l'intégrité de la sauvegarde. Un simple export de noms/IDs ne suffit pas.
2. **Décider de l'hébergement du code** : un dépôt public facilite la copie des sources. Un dépôt privé et une solution d'hébergement compatible doivent être planifiés ensemble ; rendre le dépôt privé sans vérifier les conditions GitHub Pages peut interrompre l'application. Le code distribué au navigateur reste consultable, même si les sources internes sont privées.
3. **Corriger les règles de Storage** : utiliser le compte propriétaire valide et une politique de chemin explicite, sans élargir l'accès à tous les utilisateurs connectés. Bucket privé. Vérifier `SELECT`, `INSERT` et, si nécessaire, `UPDATE/DELETE` avant de les accorder. Prévoir des URLs signées à durée limitée ou un téléchargement authentifié.
4. **Préparer le double format sans casser la V9** : conserver `photo_url` (data URI) tant que nécessaire, ajouter éventuellement une référence distincte pour les nouveaux fichiers et résoudre les images dans tous les lecteurs (V9, labo et planches). Ne pas utiliser de lien public permanent pour un bucket privé.
5. **Migration progressive** : transférer une image test vers le bucket avec nom stable, vérifier type MIME, taille, décodage et comparaison d'empreinte binaire ; tester avec un compte authentifié ; migrer par lots avec journal de succès et possibilité de reprise. Conserver les anciens originaux tant que le nouveau mécanisme n'est pas validé.
6. **Bascule contrôlée** : après tests sur iPhone et Mac, lire prioritairement les images Storage, vérifier l'ensemble des 50 fiches et les 3 tenues, puis seulement décider quand supprimer les anciennes URI intégrées. Aucun effacement anticipé.
7. **Corriger les avis de sécurité indépendamment** : révoquer les droits d'exécution RPC inutiles de `rls_auto_enable` après validation ; contrôler les avis à nouveau. Vérifier l'option de protection des mots de passe dans Supabase Auth.

## 3. Critères avant toute modification en production

- Sauvegarde privée exportée, complète, accessible et testée.
- Plan de retour arrière clair pour l'affichage des images.
- Aucune perte de fiche, d'identifiant ou de tenue.
- Aucun élargissement de l'accès aux images.
- Aucun test IA payant déclenché par la migration.
- Aucune donnée personnelle provenant d'autres contextes utilisée dans le produit.
- Approbation pour les changements structurels ; **la V9 reste inchangée à ce stade**.

## 4. Sources vérifiées

Contrôles directs des métadonnées GitHub, du frontend `index.html`, des tables et politiques PostgreSQL, du bucket Storage et des avis sécurité Supabase le 27 novembre 2026. Pour les règles d'accès du stockage privé, voir la documentation Supabase : https://supabase.com/docs/guides/storage/buckets/fundamentals

**Ne pas traiter ce plan comme une migration effectuée ou comme une preuve qu'il n'y a jamais eu de fuite.**
