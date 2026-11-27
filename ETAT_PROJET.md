# MON DRESSING — État du projet et méthode de continuité

**Mise à jour : 24 novembre 2026**  
**Document opérationnel : versions, résultats vérifiés, limites et prochaines étapes.**  
**Direction artistique et fonctionnelle : voir [MON_DRESSING_DECISIONS_PRODUIT.md](MON_DRESSING_DECISIONS_PRODUIT.md).**

> **Principe :** ne jamais confondre une décision validée, un code installé, un test technique réussi et une tenue jugée réellement portable. Les affirmations sur Supabase ci-dessous reposent sur les résultats et captures communiqués par l'utilisatrice ; la connexion GitHub ne permet pas à elle seule de lire le code actuellement déployé dans Supabase.

## 1. Vision — rappel synthétique

Mon Dressing est une application personnelle iPhone/Mac pour **gagner du temps chaque jour** : renseigner le contexte, recevoir **une tenue principale prête à porter** avec ses propres pièces, pouvoir **changer une seule pièce** sans recomposer tout le look, puis confirmer **« Je porte cette tenue »**.

- Dresser un catalogue raisonné de **500 pièces maximum**, sans favoriser les achats.
- Construire des tenues harmonieuses, féminines, chic contemporain, parfois romantiques, rock ou vintage ; **contraste maîtrisé** et proportions flatteuses pour une morphologie en A.
- Faire **tourner intelligemment les vêtements dans la durée** : une pièce ne doit pas être imposée si elle dégrade l'ensemble, mais les mêmes chaussures et sacs ne doivent pas revenir par automatisme.
- Valoriser les **photographies et le résultat visuel**. Les explications écrites sont secondaires, facultatives et concises : **40 mots ne constituent pas une limite métier bloquante**.
- Météo comme contexte utile, **désactivable** ; ne pas exiger des vêtements imperméables que le dressing ne possède pas.

Le contrat produit complet, ses priorités et les décisions encore ouvertes sont conservés dans `MON_DRESSING_DECISIONS_PRODUIT.md`.

## 2. État observé au 24 novembre 2026

| Élément | État | Source / limite de confirmation |
|---|---|---|
| Application publique | **V9 conservée**, utilisable sur iPhone/Mac | Déclarations et essais de l'utilisatrice ; `index.html` est présent sur GitHub |
| Hébergement de l'interface | **GitHub Pages**, dépôt `Clairette70/mon-dressing`, branche `main` | Vérifiable dans GitHub |
| Données et Edge Functions | **Supabase** | Fonctions déployées à contrôler dans Supabase en cas de changement |
| Fonction de production | `assistant-style` ; historique de moteur **Groq / GPT-OSS 120B** | État technique hérité ; ne pas présumer d'un nouveau déploiement sans vérification |
| Fonction laboratoire | `assistant-style-labo` ; **V2.2** selon déploiement et diagnostic de l'utilisatrice | Page GitHub `test-styles-labo.html` confirmée en V2.2 ; backend Supabase non stocké dans ce dépôt |
| Fournisseur laboratoire | **OpenAI payant**, distinct du moteur de production | Confirmé par les réponses de tests antérieurs (`fournisseur: openai`) |
| Catalogue du laboratoire | **50 pièces** au dernier diagnostic gratuit | Diagnostic affiché à l'utilisatrice ; 3 vestes et 1 manteau classés correctement après correction |
| Interface de laboratoire | Génération de trois propositions, comparaison, affichage des vraies photos, import gratuit d'un JSON obtenu précédemment | Testé sur la page GitHub |
| Profil permanent modifiable et rotation historique | **Objectifs validés, non encore intégrés de bout en bout** | À concevoir / vérifier |
| Bouton « Changer cette pièce » | **Décision validée : une seule alternative IA à la fois, possibilité d'en demander une autre ; non développé / non vérifié** | Architecture technique à comparer avant implémentation |
| Journal « examinée / proposée / enregistrée / portée » | **À concevoir** | Ne pas assimiler une proposition à un vêtement porté |

**Important :** le titre visible dans la page peut rester « Laboratoire V2 » alors que son titre HTML et sa logique correspondent à V2.2. Le fichier GitHub ne contient pas la source de la fonction Supabase déployée ; il faut consulter Supabase pour confirmer une version serveur exacte.

## 3. Tests réels et enseignements

| Test | Résultat constaté | Appréciation humaine / conclusion |
|---|---|---|
| **F — Liberté stylistique** | Génération de 3 tenues en V2.2 ; affichage avec photos | **Tenue gagnante portable**, selon l'utilisatrice |
| **G — 8 °C, pluie, vent fictifs** | Génération de 3 tenues en V2.2 ; contexte météo pris en compte | **Tenue gagnante portable**, selon l'utilisatrice ; ne pas surévaluer le manque d'imperméables |
| **B — Rock chic / robe blazer** | **HTTP 422 COMPARAISON_INVALIDE** : conseils de l'option 3 dépassant 40 mots | **Échec technique de validation, pas un refus esthétique** ; aucune tenue B n'a pu être évaluée |
| Ancien test « robe blazer » (16 novembre) | Essais antérieurs insatisfaisants ; troisième tentative bloquée par limite Groq | Historique antérieur à V2.2, ne pas confondre avec le test B récent |

**Bilan : 2 tenues gagnantes déclarées portables sur 2 évaluées pour F et G.** Cela ne valide pas encore le moteur : objectif d'acceptation proposé **au moins 8 tenues satisfaisantes sur 10**, zéro vêtement inventé, contraintes explicites respectées et qualité déterminée par l'utilisatrice.

Le test B révèle un défaut de robustesse indépendant de la qualité stylistique. Une erreur de texte mineure ne doit pas faire perdre des résultats déjà payés. **Aucune solution technique à ce défaut n'est ici réputée déployée** ; comparer les options avant modification.

## 4. Contrat stylistique et règles de validation

**Contraintes dures :** IDs existants ; tenue techniquement composable (robe ou haut+bas, chaussures si disponibles) ; éléments explicitement imposés ou exclus ; pas d'invention de propriétés ou d'articles ; cohérence du format de réponse.

**Préférences souples :** couleurs froides sans interdiction absolue ; morphologie en A ; équilibre des volumes, tissus, décolletés et superpositions ; élégance, contraste maîtrisé, audace mesurée ; météo et ressenti pragmatiques ; rotation intelligente.

**Principes :**
- Ne pas forcer une veste, un sac ou une pièce rarement portée si cela dégrade la tenue.
- La sélection de plusieurs looks peut rester **interne au laboratoire**, mais l'interface cible n'en présente **qu'un seul par défaut**.
- Les photographies des vrais articles doivent être utilisées pour l'affichage ; **la vision par IA n'est pas encore démontrée**.
- Garder les conseils facultatifs et utiles, sans validation de longueur susceptible de bloquer toute une tenue.

## 5. Priorités fonctionnelles validées mais restant à réaliser

1. **Valider le cœur stylistique**, sur un ensemble varié de tenues effectivement jugées portables, avant intégration à la V9.
2. **« Changer cette pièce »** : décision produit confirmée — **une seule pièce alternative choisie par l'IA à la fois**, avec **« Une autre pour cette pièce »** ; conserver strictement tous les autres IDs, éviter les répétitions dans la même série de remplacements, autoriser retour arrière et signaler l'absence de solution satisfaisante. **Non implémenté.** Comparer filtrage local, appel IA ciblé et approche hybride selon qualité / coût / rapidité ; **architecture non validée**.
3. **Mémoire de rotation** et historique d'utilisation : distinguer *pièce examinée*, *pièce proposée*, *tenue enregistrée*, *pièce réellement portée*. **Décision validée le 24 novembre : le refus de remplacement est contextuel (pièce + autres vêtements de la tenue) et ne doit jamais pénaliser globalement cette pièce dans les futures propositions.** Éviter seulement de reproposer immédiatement la même alternative dans la même séquence ; journal des retours encore à concevoir.
4. **Profil stylistique permanent éditable**, réutilisé sans saisie répétitive.
5. **Planches visuelles et lookbooks** à partir des vrais vêtements, intégration stable iPhone/Mac, coûts maîtrisés et fournisseur IA interchangeable.

## 6. Méthode obligatoire avant les évolutions

1. **Lire les références à jour** : d'abord `MON_DRESSING_DECISIONS_PRODUIT.md` pour les décisions artistiques et fonctionnelles, puis ce document pour le statut et les risques.
2. **Vérifier le code effectivement concerné**, dans GitHub pour le frontend et dans Supabase pour les fonctions serveur. Si une source est inaccessible, le signaler : ne jamais prétendre l'avoir contrôlée.
3. **Recentrer la demande sur l'objectif** : valeur quotidienne, qualité visuelle, rotation du dressing et gain de temps.
4. **Comparer les options** selon qualité, complexité, coûts, risque de régression et réversibilité ; formuler une recommandation argumentée.
5. **Faire valider les décisions structurantes par l'utilisatrice**, responsable de la direction artistique et produit ; éviter de lui faire arbitrer des détails techniques inutiles.
6. **Modifier en laboratoire**, sauvegarder, tester les cas représentatifs et les non-régressions ; protéger `assistant-style` et la V9 jusqu'à accord explicite.
7. **Mettre à jour les deux documents** après une décision ou un déploiement réellement validé ; distinguer « décidé », « développé », « déployé », « testé » et « jugé satisfaisant ».

**Reprise d'une nouvelle conversation :** au message « On reprend Mon Dressing », rechercher ces documents dans le dépôt, contrôler leur date, résumer brièvement l'état réel et proposer l'étape la plus utile. L'accès au dépôt n'est pas garanti à chaque session ; annoncer les limites d'accès. Ne pas lancer de test payant répétitif sans justification.

## 7. Historique technique à conserver

- **16 novembre 2026 :** V9 et `assistant-style` (historique Groq), correctif `mon_dressing_moteur_corrige_2026-11-16.ts` transmis ; 16 tests locaux annoncés réussis, insuffisants pour attester la qualité des looks ; limite Groq rencontrée. **Ne pas installer l'ancienne V10** fondée sur un moteur antérieur.
- **17 novembre 2026 :** audit structurel de la V9 et conception d'un moteur laboratoire, pour éviter les correctifs ad hoc, distinguer catalogue / sélection / IA / validation / retours et préserver les données des fiches.
- **18–22 novembre 2026 :** évolution du moteur laboratoire en deux passes avec index jusqu'à 500 pièces, comparaison de tenues, diagnostics, puis correction de classification veste/manteau et affichage photo. Plusieurs erreurs de validation et de schéma rencontrées puis identifiées.
- **22–24 novembre 2026 :** laboratoire V2.2 testé avec 50 pièces ; F et G déclarées portables ; B bloqué par la validation stricte des 40 mots.
- **24 novembre 2026 :** cap produit reformulé : un look principal, remplacement ciblé d'une pièce, rotation du dressing dans le temps, conseils écrits secondaires et gouvernance partagée avec décision artistique finale de l'utilisatrice.

**Archives à conserver** : `AUDIT_MON_DRESSING_V9_CONSOLIDE_2026-11-17.md` et `CONCEPTION_MOTEUR_STYLISTIQUE_V1.md`. Leur contenu représente l'état de connaissances à leurs dates respectives ; ce ne sont pas des affirmations sur la production actuelle.

## 8. Audit Supabase et préparation du journal — 24 novembre 2026

**Audit direct réalisé en lecture seule** avec le connecteur Supabase, sur le projet identifié dans le frontend :
- `public."vêtements"` : **50 lignes**, RLS activée, identifiant bigint ; politiques réservées à un utilisateur authentifié déterminé.
- `public.tenues` : **3 lignes**, RLS activée, `user_id uuid` lié à `auth.users`, `pieces jsonb` ; politiques d'accès par propriétaire pour SELECT/INSERT/UPDATE/DELETE.
- Aucune table `labo_sessions` ou `labo_evenements` constatée ; aucune migration existante enregistrée dans l'historique Supabase.
- Deux fichiers enregistrés dans GitHub : `sql/diagnostic_historique_rotation.sql` (lecture seule) et `sql/PROPOSITION_historique_rotation_NON_APPLIQUE.sql` (**proposition non exécutée**). Aucun changement de schéma ni de production effectué.
- La proposition prévoit un journal append-only lié à l'utilisateur, RLS, séparation entre proposé/sauvegardé/porté, refus limités à l'association, annulation d'un port erroné. Avant adoption, **évaluer et tester** la migration, les droits, l'intégrité du catalogue et le comportement en cas de double clic.

**Avertissements de sécurité existants, sans lien direct avec les nouvelles tables :**
- `public.rls_auto_enable()` est une fonction `SECURITY DEFINER` exécutable par `anon` et `authenticated` selon les advisors et la vérification SQL. Examiner sa finalité et révoquer les droits d'exécution superflus dans une modification distincte et validée.
- La protection Supabase Auth contre les mots de passe compromis est désactivée ; recommandation d'activation après vérification des options du projet.

**Ne pas traiter ces alertes comme corrigées.** Ne pas appliquer la proposition SQL sur le projet principal tant que les tests et la stratégie d'intégration n'ont pas été validés.

## 9. Contrôle réversible de l'historique — 26 novembre 2026

**Résultat technique :** les deux tables proposées ont été recréées dans un schéma temporaire et testées dans une **transaction annulée par ROLLBACK**. Tests réussis : création des tables et index, contraintes JSON, clé étrangère composite de propriété de session, refus d'un événement à identifiant dupliqué, lecture autorisée pour le propriétaire, invisibilité des données sous une autre identité simulée, refus d'insertion sous une autre identité et absence de privilèges UPDATE/DELETE pour le rôle `authenticated`. **Le schéma de test a disparu après annulation, résultat vérifié.**

**Erreur trouvée et corrigée :** `DEFAULT (select auth.uid())` provoquait une erreur SQL ; remplacer par `DEFAULT auth.uid()`. Correction conservée dans `sql/PROPOSITION_historique_rotation_NON_APPLIQUE.sql`.

**Limites :** la vérification s'est faite sur le projet principal, mais dans une transaction temporaire annulée. Elle ne constitue pas un test complet depuis deux vrais comptes et ne démontre ni l'absence de doublons métier au double clic, ni l'exposition Data API, ni la fiabilité des journaux `port_annule`, ni l'intégration à l'interface. **Aucune table de rotation n'a été créée de façon permanente et aucune fonction V9 n'a été modifiée.**

**Avant migration :** déterminer explicitement le moment où un port devient effectif, prévoir une clé d'idempotence stable et une stratégie de suppression/rectification des événements et de rétention des données ; tester avec la session réelle du client et vérifier les alertes Supabase existantes.

## 10. Premier atelier « Changer cette pièce » — 26 novembre 2026

**Statut : prototype distinct créé, non encore essayé par l'utilisatrice ni approuvé pour la V9.**

- **Code isolé** : `laboratoire/remplacement/index.ts` dans GitHub ; Edge Function Supabase `assistant-remplacer-labo` version 1 (ACTIVE, vérification JWT activée), distincte de `assistant-style-labo` V2.2 et de `assistant-style` V9.
- **Page distincte** : [test-remplacement-labo.html](test-remplacement-labo.html) ; JavaScript analysé sans erreur de syntaxe. Le service GitHub Pages peut nécessiter un délai de publication ; sa disponibilité publique et les essais sur iPhone restent à vérifier.
- Reprise d'un résultat JSON déjà généré via `sessionStorage` (même onglet/origine) ou collage manuel, **sans nouvelle génération de tenue**.
- Sur une tenue déjà affichée, bouton « Changer cette pièce », une seule alternative proposée par l'IA et photo issue du catalogue réel ; boutons « Garder », « Une autre pour cette pièce », « Revenir en arrière », remise à zéro de la tenue.
- **Contrôle côté serveur** : utilisateur autorisé, catalogue sous RLS, IDs existants, candidat d'un rôle équivalent, exclusion des autres articles et des propositions déjà refusées dans la séquence, aucun autre ID ne change, aucune sauvegarde des tenues.
- **Coût** : modes diagnostic gratuits, `remplacer` = un appel IA au maximum par clic ; le choix peut être facturé même si aucune alternative satisfaisante n'est trouvée.
- **Contrôles effectués** : déploiement Supabase ACTIVE, publication du code GitHub, compilation du script navigateur avec analyse de syntaxe. **Non effectués** : appel IA authentifié, test effectif du résultat sur une vraie tenue, contrôle de toutes les catégories et test iPhone.
- **Aucun changement** de `index.html`, `assistant-style`, `assistant-style-labo` ou des tables existantes. L'historique de rotation n'est pas encore installé.

**Premier essai utilisateur réel — 26 novembre 2026 :** tenue enregistrée « Pervenche & noir — chic urbain » (blouse bleu pervenche ID 20, pantalon palazzo noir ID 9, mocassins noirs pointus ID 12), chargée via JSON fourni à partir de Supabase. L'utilisatrice confirme que le remplacement a fonctionné : **blouse bleue → blouse verte**. Son évaluation visuelle : **« le résultat me paraît bien »**. C'est **un avis stylistique positif sur un seul exemple**, pas encore une validation de fiabilité générale, ni une preuve de l'expérience complète « Une autre » / annulation / toutes catégories. Pas de sauvegarde ni de port réel déduit du test.

**Prochaine validation produit :** tester « Une autre pour cette pièce » sans répétition, puis « Revenir en arrière », et au moins un remplacement de chaussures ou de sac. Conserver la distinction entre succès technique, avis esthétique et validation globale avant promotion en V9.

## 11. Tests utilisateur et simplification de l'atelier — 26 novembre 2026

**Retour utilisateur confirmé :** la commande « Une autre pour cette pièce » et le retour arrière ont tous deux fonctionné sur la tenue « Pervenche & noir — chic urbain ». La première association de remplacement de la blouse bleue par une blouse verte avait été jugée positive. **Ne pas confondre ce test de fonctionnement sur une tenue avec une validation générale du styliste ni présumer que toutes les autres alternatives ont été jugées élégantes.**

**Amélioration publiée sur GitHub :** `test-remplacement-labo.html` permet désormais de **choisir une tenue directement dans la table existante `tenues`** après connexion (lecture seule et contrôle via RLS), sans import JSON. Chargement de photos des vrais vêtements via la table `vêtements`. Le JSON reste disponible en secours. Aucun changement dans `index.html`, aucune donnée ajoutée ou modifiée, aucun appel IA supplémentaire pour choisir une tenue. Syntaxe JavaScript vérifiée ; **sélection directe d’une tenue sauvegardée confirmée fonctionnelle par l’utilisatrice le 26 novembre 2026** (sans import JSON). Ce retour concerne le chargement direct de la tenue ; il ne valide pas à lui seul un remplacement de chaussures.

**Prochaine vérification :** sur une tenue chargée directement, essayer le remplacement des mocassins (ou d'une autre paire de chaussures), puis contrôler la cohérence de la proposition, « Une autre pour cette pièce » et le retour arrière. Ne pas déclencher d'appels IA payants supplémentaires sans besoin. Garder la V9 inchangée.

## 12. Liaison des deux ateliers de laboratoire — 26 novembre 2026

**Implémenté dans GitHub, non encore essayé par l'utilisatrice :**
- Sur `test-styles-labo.html`, la **tenue retenue** affiche désormais un bouton « Changer une pièce de cette tenue ».
- Ce bouton transmet dans le stockage temporaire du **même onglet** seulement le nom de la tenue et la liste des identifiants de pièces, puis ouvre `test-remplacement-labo.html?source=generateur`.
- La page de remplacement relit les vêtements concernés depuis Supabase avec les règles RLS déjà en place, charge la tenue et efface le transfert temporaire après succès. La sélection des tenues déjà enregistrées et l'import JSON demeurent disponibles en secours.
- Aucun nouvel appel IA, aucune écriture en base, aucun changement de `index.html` ni de fonction serveur ; le fonctionnement du lien a été **vérifié par lecture de code et validation de syntaxe JavaScript**, mais **pas encore testé sur navigateur authentifié**.
- Conformément au périmètre du projet, aucune information médicale ou personnelle issue d'autres conversations n'est injectée dans le transfert.

**Prochaine vérification :** depuis le générateur du laboratoire, cliquer sur le nouveau bouton de la tenue retenue, constater le chargement direct dans l'atelier de remplacement, puis essayer un remplacement ciblé seulement si nécessaire.

## 13. Première interface unifiée du laboratoire — 26 novembre 2026

**Statut : version de laboratoire publiée sur GitHub, validation fonctionnelle par l'utilisatrice encore nécessaire.**

- `test-styles-labo.html` est devenu le point d'entrée de la **première interface unifiée** : accès aux tenues sauvegardées (gratuit) ou génération par le moteur de laboratoire (payante, sur clic), puis affichage **d'une seule tenue principale** et remplacement ciblé directement sur la même page.
- Les commandes « Changer cette pièce », « Une autre pour cette pièce », « Garder cette pièce », « Revenir en arrière » et « Revenir à la tenue initiale » utilisent `assistant-remplacer-labo`, fonction déjà isolée et ayant donné des résultats positifs dans des essais distincts.
- Les pièces non visées demeurent inchangées ; une alternative n'est appliquée à la composition qu'après acceptation explicite. Le refus reste limité à la même association et au même poste de remplacement. Aucun port réel n'est déduit ou sauvegardé.
- Le diagnostic et les anciennes comparaisons restent possibles, mais l'interface ne propose qu'une tenue principale à la fois ; ses photos viennent du catalogue. Les autres résultats ne sont pas proposés comme choix simultanés.
- **Précaution de confidentialité :** seules les références au catalogue et des consignes vestimentaires génériques sont utilisées dans les nouvelles requêtes de remplacement ; aucun transfert d'historique personnel ou médical. Contrôle automatisé d'absence de termes médicaux explicites sur le nouveau code frontend.
- **Vérifications faites :** récupération et réécriture du fichier GitHub, analyse de syntaxe JavaScript après modification, contrôle des points d'entrée et des éléments de la page, comparaison : `index.html` de la V9 inchangé. Aucun test payant IA n'a été exécuté.
- **Non encore validé :** parcours complet en navigateur authentifié sur la version unifiée, qualité de chaque catégorie de remplacement, expérience sur iPhone, nouveaux résultats générés par l'IA et éventuels cas d'échec réseau. Ne pas promouvoir en production avant ces tests.

**Prochaine vérification :** depuis `test-styles-labo.html`, ouvrir une tenue sauvegardée sans coût, contrôler les photos, changer une pièce, puis accepter ou annuler. Utiliser une nouvelle génération payante seulement si elle présente une vraie valeur de test.

## 14. Prochaine action décidée

**Pas de refonte ni de test payant déclenché automatiquement.** Examiner avec l'utilisatrice la robustesse du laboratoire et les solutions techniques pour le remplacement ciblé d'une pièce et la mémoire de rotation, en se fondant sur ce document et sur les décisions produit. Prioriser l'évaluation stylistique par l'utilisatrice avant toute promotion en production.


## 15. Correction des remplacements de manteau — 26 novembre 2026

**Signal utilisateur :** sur le scénario H du laboratoire (14 °C, temps sec), la tentative de remplacer le manteau échouait avec « aucun autre vêtement dans la catégorie ». La cause a été confirmée : un seul manteau (ID 33), mais trois vestes (IDs 28, 34, 35) dans le catalogue. Le filtre initial imposait une catégorie fonctionnelle strictement identique.

**Modification effectuée, uniquement dans le laboratoire :**
- Le moteur `assistant-remplacer-labo` version **2 ACTIVE** considère désormais vestes et manteaux comme candidats mutuels pour la fonction de couche extérieure ; le poncho reste une catégorie différente et n'est pas proposé automatiquement comme remplacement direct.
- L'IA doit encore juger la cohérence de la protection, de la silhouette et de la météo ; aucune substitution obligatoire, et les autres vêtements restent inchangés.
- L'interface unifiée transmet désormais au remplacement les éléments météorologiques du scénario de génération, lorsqu'ils existent. Pour H, ce sont des données de **simulation** à 14 °C, et non une prévision réelle. Aucun contexte supplémentaire ne doit être inféré pour les tenues enregistrées.
- Contrôles effectués : code et fonction actifs relus ; présence du filtre de rôle compatible en version 2 ; syntaxe JavaScript du frontend vérifiée ; trois vestes alternatives recensées dans le catalogue. **Pas encore testé via la session de l'utilisatrice ni évalué stylistiquement après le correctif.**
- Aucun changement de la V9 ou des tables de catalogue, et aucun appel IA payant déclenché par le correctif.

**Prochaine vérification :** réessayer le remplacement du manteau dans le scénario H. L'IA peut proposer une veste adaptée, ou refuser pour un motif stylistique réel ; elle ne doit plus refuser simplement parce que la catégorie « manteau » n'a pas d'autre exemplaire.


## 16. Reprise et audit sécurité/stockage du 27 novembre 2026

**État :** vérifications réalisées, V9 et données personnelles non modifiées.

- Audit documenté dans [AUDIT_SECURITE_ET_MIGRATION_PHOTOS_2026-11-27.md](AUDIT_SECURITE_ET_MIGRATION_PHOTOS_2026-11-27.md). Il établit 50 photos stockées dans la base comme `data:image` (environ 60,9 Mo), bucket privé vide et politique Storage liée à un identifiant utilisateur inexistant ; le dépôt GitHub est public.
- Les tables `vêtements` et `tenues` ont RLS activée et des politiques réservées à l'utilisateur attendu ; ceci **ne prouve pas** une absence totale de risque et ne sécurise pas le code public.
- `public.rls_auto_enable()`, fonction privilégiée attachée au déclencheur d'événements `ensure_rls`, est accessible en RPC aux rôles `anon` et `authenticated` d'après les advisors. Une révocation temporaire `BEGIN/ROLLBACK` a été testée : elle retirait l'exécution des deux rôles et gardait le déclencheur activé. **Aucune révocation permanente appliquée**.
- Avis supplémentaire : protection contre les mots de passe compromis désactivée. Ne pas dire que les alertes sont corrigées.
- **Amélioration non destructive du laboratoire :** `test-styles-labo.html` affiche désormais directement la section des scénarios F à J (avec H) ; diagnostic gratuit toujours nécessaire pour activer les tests payants. Validation de syntaxe JavaScript réussie, fonctionnement sur appareil à confirmer.
- **Prochaine décision :** sauvegarde privée restaurable, puis règles Storage correctes et migration progressive des photos, sans supprimer les originaux ni modifier la V9 prématurément. L'hébergement privé du code requiert un choix tenant compte de GitHub Pages et du fait que le JavaScript navigateur demeure inspectable.


## 17. Correction de la fonction RPC privilégiée — 27 novembre 2026

**Action autorisée explicitement par l'utilisatrice et exécutée dans Supabase :** `REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;`.

**Contrôles directs après application :** `has_function_privilege('anon', ..., 'EXECUTE') = false` et `has_function_privilege('authenticated', ..., 'EXECUTE') = false`. Le déclencheur d'événements `ensure_rls` demeure activé (`evtenabled = 'O'`). Les nombres de fiches et tenues sont inchangés (50 et 3).

**Nouveau contrôle du conseiller sécurité Supabase :** les deux alertes `anon_security_definer_function_executable` et `authenticated_security_definer_function_executable` ont disparu. **L'alerte `auth_leaked_password_protection` reste ouverte** ; elle est distincte et n'a pas été modifiée. Documentation : https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection.

**Périmètre :** seule la permission EXECUTE de cette fonction a été modifiée ; aucune migration de photos, aucun changement de politiques Storage, aucune modification de `index.html`, aucun appel IA. La sauvegarde privée restaurable reste la prochaine étape avant toute migration d'images.


## 18. Outil de sauvegarde privée en lecture seule — 27 novembre 2026

**Créé dans GitHub :** `sauvegarde-locale-verifiee.html`, outil autonome distinct de la V9. Disponible depuis la même origine GitHub Pages et authentification Supabase existante.

- Téléchargement **sur clic uniquement**, directement dans le navigateur de l'utilisatrice. Aucun fichier contenant les données personnelles ou les images n'a été publié sur GitHub ; le dépôt public ne contient que le code de l'outil.
- Relit `public."vêtements"` en lots de 4 avec les champs complets et `public.tenues` (sans écriture en base). Vérifie les identifiants, les formats PNG/JPEG/WebP/GIF encodés en base64, les références des tenues, les décomptes et les doublons.
- Construit une archive JSON intégrant toutes les fiches et les photos d'origine ainsi que les tenues, avec empreinte SHA-256 du contenu. Section indépendante pour **rouvrir le fichier téléchargé et comparer son empreinte** localement.
- Contrôles effectués : fichier créé et relu dans GitHub, validation de syntaxe JavaScript, chemins d'export et de vérification présents, aucune méthode d'écriture Supabase dans la page. **Aucune sauvegarde de données réelles téléchargée ni aucun fichier restauré par l'utilisatrice à ce stade.** L'exécution sur son navigateur et l'intégrité de la sauvegarde restent à valider avant migration.
- Limite : une sauvegarde dont la somme de contrôle est valide prouve l'intégrité structurelle du fichier reçu selon les contrôles implémentés, **pas** la restaurabilité réelle. Le test de restauration et la conservation privée doivent précéder toute suppression des données actuelles.
- La V9 `index.html`, les 50 images dans la base et les 3 tenues sont inchangées. Aucun appel IA payant lancé.

**Prochaine action de l'utilisatrice :** ouvrir la page de sauvegarde, se connecter, cliquer sur « Télécharger ma sauvegarde complète », sélectionner ensuite le fichier téléchargé dans « Vérifier le fichier téléchargé » et confirmer le message d'intégrité. Ne migrer aucune photo avant confirmation.


## 19. Préparation et droits privés du stockage photo — 27 novembre 2026

**Retour utilisateur :** téléchargement et vérification de la sauvegarde annoncés « tout est ok ». Le fichier privé n'a pas été envoyé à l'assistant ; la restauration réelle reste à vérifier avant toute suppression.

**Migration SQL appliquée à Storage :** anciennes politiques `ajout_photos pd03l5_0` et `lecture_photos pd03l5_0` remplacées par `mon_dressing_photos_insert_prive` (INSERT) et `mon_dressing_photos_select_prive` (SELECT), limitées au bucket privé `photos-vetements`, à l'utilisateur propriétaire existant et au dossier portant son identifiant `auth.uid()`. Aucun accès UPDATE/DELETE accordé. Après application, lecture directe des deux politiques confirmée, 50 photos originales toujours dans la table, bucket encore vide.

**Outil de test sans modification des fiches :** `test-stockage-photo.html` publié dans GitHub. Après authentification, la personne choisit une pièce, déclenche elle-même la copie d'une seule photo en `migration-test/`, puis vérification SHA-256 des octets téléchargés à partir du stockage privé. L'original de `photo_url` n'est jamais modifié ; aucune IA ni écriture de vêtement. Le fichier test dans Storage est conservé après succès et pourra être supprimé distinctement plus tard si souhaité.

**Vérifications effectuées :** page GitHub relue, syntaxe JavaScript testée, politiques RLS inspectées, bucket privé vide avant premier test. **Reste à valider :** essai complet avec une session navigateur authentifiée (UPLOAD + DOWNLOAD), qualité de l'image affichée, accès refusé aux autres comptes, procédure réversible de migration et restauration. La V9 reste inchangée.


## 20. Copie progressive des 50 photos vers Storage — 27 novembre 2026

**Retour utilisateur :** premier test sur une photo déclaré réussi. Vérification Supabase indépendante : **1 objet** dans le bucket privé `photos-vetements` (dossier `migration-test`), et **50 photos originales** encore présentes dans les fiches `vêtements`.

**Outil de migration préparé et publié :** `migration-photos-privees.html`, distinct de la V9 et du laboratoire stylistique. Son fonctionnement prévu :
- authentification avec le compte existant ; analyse du catalogue et liste du dossier privé `<user.id>/photos-v1` ;
- lancement **manuel** du transfert des images, une par une ; chaque copie est nommée par l'identifiant de la fiche et un préfixe d'empreinte SHA-256 ;
- téléchargement authentifié de chaque copie et comparaison des octets et de l'empreinte SHA-256 avec la source ;
- reprise d'une session interrompue en recontrôlant les copies déjà existantes ; aucune écriture de `vêtements.photo_url`, aucune suppression d'image et aucun nouvel appel IA.
- bouton d'arrêt après vérification de la photo en cours ; affichage du nombre d'images validées.

**Vérifications effectuées :** fichier créé puis relu dans GitHub ; analyseur JavaScript sans erreur de syntaxe ; contrôle manuel de la logique de vérification et de l'absence de mutation de fiches. **La copie des 50 images n'a pas encore été exécutée dans le navigateur.** Actuellement, seul l'objet du test initial existe dans Storage.

**Prochaine vérification :** utiliser la page de migration depuis une session authentifiée, contrôler le total 50/50 et la correspondance SHA-256 ; garder l'export local comme protection et ne pas supprimer les photos originales. Ensuite seulement préparer un mode de lecture authentifié des photos du bucket avec maintien du retour arrière.
