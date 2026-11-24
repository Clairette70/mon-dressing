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
3. **Mémoire de rotation** et historique d'utilisation : distinguer *pièce examinée*, *pièce proposée*, *tenue enregistrée*, *pièce réellement portée*.
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

## 8. Prochaine action décidée

**Pas de refonte ni de test payant déclenché automatiquement.** Examiner avec l'utilisatrice la robustesse du laboratoire et les solutions techniques pour le remplacement ciblé d'une pièce et la mémoire de rotation, en se fondant sur ce document et sur les décisions produit. Prioriser l'évaluation stylistique par l'utilisatrice avant toute promotion en production.
