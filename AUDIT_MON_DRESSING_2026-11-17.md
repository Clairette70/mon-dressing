# Mon Dressing — Audit technique initial et plan de refonte du moteur

**Date : 17 novembre 2026**  
**Statut : audit statique partiel, sans déploiement, sans dépense d'API**  
**Référence de projet : `ETAT_PROJET.md`**

## 1. Périmètre réellement inspecté

- Moteur TypeScript `mon_dressing_moteur_corrige_2026-11-16.ts` (18 551 octets, 239 lignes) retrouvé dans la bibliothèque. D'après les décisions précédentes, il a été déployé comme fonction Supabase `assistant-style` ; déploiement non vérifié directement.
- Copie du frontend `index(7).html` (73 047 octets), trouvée dans la bibliothèque. Cette copie comporte l'appel à la fonction `assistant-style`, les formulaires, le lookbook et la sauvegarde des tenues. **Son pied de page affiche « Version 8.1 », donc elle n'est pas une preuve de correspondance exacte avec la V9 en production.**
- Document de référence `ETAT_PROJET.md`.
- Le dépôt GitHub distant, les réglages Supabase, les règles RLS et les journaux de production n'ont pas pu être consultés directement dans cet audit. Aucun test réel auprès de Groq, OpenAI ou Claude n'a été effectué.

## 2. Constat principal

**Le circuit technique de génération existe, mais il ne démontre pas encore la qualité stylistique attendue.** Le moteur actuel rassemble dans une seule fonction la lecture du catalogue, la classification sommaire, la présélection des pièces, le prompt, l'appel à Groq et les validations. La plupart des erreurs rencontrées viennent potentiellement de plusieurs maillons de ce circuit, pas uniquement du modèle.

## 3. Points positifs à conserver

1. La fonction est côté serveur (Supabase), avec authentification utilisateur et contrôle d'accès propre à l'usage personnel.
2. Le contrat de réponse est structuré : nom, IDs des pièces, occasion, conseils et classement, ce qui facilite l'intégration dans l'application.
3. Le code vérifie les IDs retournés et empêche certaines compositions objectivement incomplètes.
4. Le frontend disponible offre déjà un aperçu photographique, une modification manuelle et un enregistrement de tenue.
5. Les clés d'IA sont lues côté serveur, et non dans le navigateur (à conserver impérativement).
6. La V9 et les données doivent rester intactes pendant le développement du moteur de laboratoire.

## 4. Faiblesses confirmées dans le code du moteur

| Priorité | Constat observé | Conséquence | Correction générale |
|---|---|---|---|
| P0 | `inventory()` limite la charge envoyée à ~10 000, 6 000 puis 3 200 octets. Si le catalogue dépasse le budget, seules certaines pièces sont visibles par l'IA. | Une pièce pertinente peut être exclue avant que l'IA ne la considère. | Recherche de candidats traçable, avec couverture des rôles, pièces explicitement demandées garanties et contrôle des exclusions. |
| P0 | La sélection d'une pièce imposée repose notamment sur la présence littérale de son **nom entier** dans `precisions`. | Une reformulation naturelle de la demande peut manquer la bonne pièce. | Résolution explicite des pièces demandées par ID ou recherche robuste de correspondances ; signaler les ambiguïtés. |
| P0 | Une grande partie des informations stylistiques n'est envoyée que comme texte tronqué ; aucune image n'est transmise au modèle par cette fonction. | Mauvaise compréhension possible des coupes, proportions et détails ; qualité limitée par les fiches. | Distinguer catalogue riche, résumé compact normalisé et éventuelle inspection visuelle ciblée. |
| P1 | `role()` classe les pièces par expressions régulières sur des champs libres. | Des sous-catégories ou formulations non prévues peuvent être mal reconnues. | Taxonomie de rôles explicite et normalisation lors de la lecture des fiches. |
| P1 | L'option « ignorer la météo » est inférée d'expressions dans `precisions`. | Comportement variable selon les mots utilisés. | Champ booléen `ignorer_meteo` distinct dans le contrat de requête. |
| P1 | Le prompt mêle contraintes objectives et directives de goût particulières ; `noBelt()` et certaines autres validations ajoutent des exceptions textuelles. | Risque de rigidifier le stylisme et de surcorriger un cas isolé. | Séparer contraintes dures validables et préférences souples évaluées par l'IA. |
| P1 | Une seule proposition est retournée, après une consigne interne de comparer deux silhouettes, non observable. | On ne peut ni vérifier la comparaison ni sélectionner une meilleure option avec des scores. | Générer deux ou trois candidats structurés, les examiner puis choisir, en maîtrisant les coûts. |
| P1 | L'API peut relancer les appels mais ne trace pas les pièces candidates exclues, ni les causes fines des refus, ni le coût en tokens. | Difficile de diagnostiquer et d'éviter les régressions ; dépenses moins prévisibles. | Journal de diagnostic sans données sensibles ni clés, nombre de tokens, ID des candidats et motif d'échec. |
| P2 | Aucun mécanisme de mémoire des retours ni d'historique des pièces envisagées/portées n'apparaît dans cette fonction. | L'application n'apprend pas durablement du jugement de l'utilisatrice. | Concevoir des événements distincts, après validation du cœur stylistique. |

**Observation complémentaire :** la validation de la tenue est essentiellement factuelle (IDs, rôles, champs). Elle ne peut pas démontrer à elle seule une harmonie stylistique ; les anciens « 16 tests locaux réussis » n'évaluent pas cette dimension.

## 5. Constats sur la copie de l'interface — à confirmer sur la vraie V9

- Le frontend appelle `/functions/v1/assistant-style` avec une session authentifiée.
- Il transmet date, lieu, météo, envie, programme, ressenti, confort et précisions. Il retire le catalogue complet de la requête car le serveur relit sa propre base, ce qui est cohérent.
- Les photographies servent à afficher les compositions, mais ne sont pas analysées directement par l'IA à chaque génération.
- Les tenues enregistrées possèdent un champ `favori`, mais ce mécanisme ne constitue pas encore une mémoire stylistique interprétable.
- La demande de variante mentionne la tenue précédente dans le texte, sans contrôle final garantissant qu'une autre combinaison a réellement été créée.
- Le pied de page indique « Version 8.1 », alors que notre référence métier est « V9 ». **Il faut vérifier le fichier réellement en production avant toute modification du frontend.**

## 6. Architecture cible proposée (une refonte cohérente, pas une liste de rustines)

```text
Application V9 (inchangée pour le premier laboratoire)
         |
         v
API Supabase : assistant-style-labo
         |
         +--> 1. Lire le catalogue + normaliser les fiches
         |
         +--> 2. Comprendre la demande (météo, occasion, pièce imposée)
         |
         +--> 3. Retrouver un ensemble de pièces candidates + expliquer les exclusions
         |
         +--> 4. Composer/évaluer plusieurs tenues (adaptateur IA interchangeable)
         |
         +--> 5. Vérifier déterministiquement les contraintes et les IDs
         |
         +--> 6. Retourner un JSON stable et un diagnostic technique séparé
         |
         +--> 7. Plus tard : historique, retours et statistiques
```

**Principe :** l'IA décide de l'esthétique ; le code contrôle l'existence des vêtements, les contraintes explicites, les formats, les erreurs et les dépenses. Aucune nouvelle règle « spéciale robe blazer » n'est ajoutée au noyau.

## 7. Contrat de test proposé — dix scénarios

1. **Robe blazer noire imposée** : robe prise en compte, silhouette non encombrée, respect des véritables contraintes de fiche.
2. **Tenue de travail chic** : proportions, style personnel et portabilité sans accessoires forcés.
3. **Journée de chaleur / sensibilité thermique** : couches adaptées au ressenti, sans extrapoler les données.
4. **Pluie et vent** : aucune protection imperméable inventée ; absence signalée si nécessaire.
5. **Météo expressément ignorée** : pas de réintroduction implicite de la météo du jour.
6. **Pièce demandée avec formulation différente** : correspondance robuste ou explication en cas d'ambiguïté.
7. **Tenue créative rock / vintage** : originalité cohérente sans systématiquement choisir du cuir.
8. **Morphologie en A et structure des épaules** : équilibre des volumes, sans dogmatisme.
9. **Grande garde-robe** : diversités de catégories, candidat pertinent non évincé, suivi des pièces effectivement examinées.
10. **Demande de seconde proposition** : combinaison réellement différente et qualité maintenue.

### Critères de passage

- Zéro ID inventé ; aucune référence à une pièce non sélectionnée.
- Toute pièce explicitement imposée, existante et compatible doit être prise en compte ; sinon, explication.
- Aucune propriété de tissu ou de protection inventée.
- Au moins **8 tenues jugées satisfaisantes sur 10**, selon une grille remplie par l'utilisatrice.
- Aucune régression sur le test 4 et la gestion météo.
- Coût et latence mesurés avant de basculer en production.

## 8. Décisions et ordre de travail

1. **Geler V9 et sauvegarder** `assistant-style` et le dépôt.
2. **Vérifier le vrai code V9** (ZIP ou connexion GitHub) pour achever l'audit de l'interface, sans présumer que `index(7).html` soit la dernière version.
3. Formaliser les fiches/rôles, la requête et le JSON de sortie dans des contrats stables.
4. Implémenter dans `assistant-style-labo` les composants 1 à 5, sans activer de service payant pour les tests locaux.
5. Faire les 10 essais sur un échantillon réel du dressing, puis mesurer le coût et la satisfaction avec un seul fournisseur API pour commencer.
6. Ne modifier `assistant-style` en production qu'après validation. Reporter mémoire, photos analysées et statistiques à des étapes distinctes, pour ne pas masquer les problèmes du cœur stylistique.

## 9. Ce que cet audit ne prouve pas

Il ne prouve ni la performance d'un modèle payant, ni la validité des politiques Supabase, ni la qualité du front V9 en production, ni le coût réel à grande échelle. Une garantie de qualité stylistique permanente serait injustifiée à ce stade.
