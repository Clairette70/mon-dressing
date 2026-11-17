# MON DRESSING — Audit consolidé de la V9 et contrat de validation

**Date : 17 novembre 2026**  
**Statut : analyse statique des fichiers transmis ; aucun déploiement ni appel API effectué.**  
**Document de continuité associé : `ETAT_PROJET.md`.**

## 1. Sources et périmètre

- `index(8).html` : 73 047 octets, 254 lignes de source HTML/JavaScript. Le titre indique « Assistant IA v9 » ; le pied de page indique encore « Version 8.1 ». L'empreinte du fichier correspond exactement à la copie antérieure `index(7).html`. Il faut considérer « 8.1 » comme un libellé ancien **à confirmer**, non comme une preuve de déploiement d'une autre version.
- `ETAT_PROJET(1).md` : identique au document de référence antérieurement partagé.
- `README.md` : description minimale du dépôt.
- `mon_dressing_moteur_corrige_2026-11-16.ts` : dernière version corrigée disponible de la fonction Supabase `assistant-style` ; **son contenu exact en production n'a pas été vérifié**.

Contrôle effectué : extraction du JavaScript embarqué dans `index(8).html` et analyse syntaxique `node --check` réussie. **Cela ne vérifie ni le fonctionnement réel du navigateur, ni la sécurité Supabase, ni la qualité des tenues proposées.**

## 2. Verdict

**Conserver l'interface V9. Reconcevoir le noyau stylistique et son contrat de données dans un laboratoire isolé.**  
Le code montre une application déjà capable de gérer des articles, d'afficher leurs photographies, de créer et sauvegarder des tenues, de filtrer le lookbook et d'interroger la météo. Le cœur problématique est principalement le parcours *demande → choix des pièces candidates → raisonnement IA → vérification → proposition*.

La migration vers un modèle payant ne doit pas précéder la correction des limites de ce parcours.

## 3. Points confirmés à conserver

1. **Frontend** : onglets Accueil, Tenue du jour, Mon dressing, Créer une tenue, Lookbook et Mes données.
2. **Catalogue** : création et édition de fiches (catégorie, sous-catégorie, couleur, matière, coupe, saison, chaleur, confort, description, etc.), ajout de photo et export.
3. **Lookbook** : enregistrement Supabase, favoris, filtres et modification manuelle.
4. **Demandes IA** : date, programme, style du jour, ressenti thermique, confort et précisions ; météo Open-Meteo.
5. **Intégration** : l'interface appelle `/functions/v1/assistant-style`, avec une session utilisateur.
6. **Contrat JSON** : nom, IDs des pièces, occasion, conseils et classement ; largement réutilisable lors du changement de fournisseur.
7. **Secret fournisseur** : le code du moteur fourni lit la clé Groq côté serveur, pratique à conserver.

## 4. Problèmes à résoudre AVANT d'évaluer une IA payante

| Priorité | Fait observé | Pourquoi cela gêne le stylisme | Solution générale |
|---|---|---|---|
| P0 | Dans le moteur transmis, `inventory()` réduit le catalogue envoyé si le budget de taille est dépassé. | Certaines pièces ne sont pas visibles par l'IA ; une bonne IA ne peut pas choisir une pièce absente. | Sélection explicable, couverture des rôles, inclusion certaine des pièces imposées et suivi des candidats. |
| P0 | La reconnaissance d'une pièce demandée se fonde notamment sur la présence littérale du nom complet dans `precisions` ; `validate()` ne vérifie pas sa présence dans la tenue. | Une reformulation peut être ignorée, sans erreur détectée. | Résoudre le vêtement demandé avant génération en ID(s) ; contrôle obligatoire de la tenue finale. |
| P0 | L'interface demande une « autre proposition » en ajoutant du texte dans `precisions`, sans vérifier que les pièces ont changé. | Des variantes identiques peuvent être présentées comme nouvelles. | Transmettre les IDs précédents dans un champ structuré et imposer une différence effective. |
| P1 | L'option « ignorer la météo » est déduite du texte libre ; aucun contrôle dédié n'apparaît dans l'interface. | La même intention peut être interprétée différemment selon la formulation. | Ajouter ultérieurement un booléen explicite, tout en conservant la compatibilité V9. |
| P1 | `role()` et `noBelt()` classent les vêtements et contraintes par mots-clés. | Risques de mauvaise classification et de règles contradictoires. | Normaliser les rôles et représenter explicitement les contraintes dures. |
| P1 | Le moteur n'envoie pas les images au modèle ; l'interface les utilise pour l'affichage. | L'IA n'a pas accès directement aux volumes, aux coupes et aux détails visibles. | Permettre une inspection visuelle ciblée plus tard, sans transmettre systématiquement 500 images. |
| P1 | Le profil stylistique est surtout inscrit en dur dans le prompt, et non dans une fiche de préférences versionnée. | Le modèle ne bénéficie pas automatiquement des évolutions de goûts et des retours. | Créer une fiche profil structurée, distincte du moteur et modifiable. |
| P1 | Les images sont enregistrées comme URL de données dans la base ; l'application charge les fiches avec `select('*')` et représente toutes les pièces. | Risque de lenteur et de transferts volumineux à mesure que le dressing approche 500 pièces. | Mesurer les performances ; prévoir stockage séparé/cache et affichage progressif si nécessaire. |
| P2 | Favoris et tenues enregistrées existent, mais pas la distinction formelle *examinée / proposée / enregistrée / portée*. | Impossible de faire des statistiques fiables d'utilisation et d'apprentissage. | Ajouter un journal d'événements après validation du stylisme. |

**Sécurité à contrôler avant tout déploiement** : politiques RLS sur `vêtements` et `tenues`, droits de la fonction de laboratoire, protection des secrets et éventuelle facturation API. Le code du navigateur ne permet pas de certifier ces réglages.

## 5. Architecture cible générale

```text
V9 (interface conservée) ──> assistant-style-labo (Supabase)
                                  |
                                  +─ A. Profil & contraintes du jour
                                  +─ B. Catalogue normalisé
                                  +─ C. Résolution des pièces obligatoires
                                  +─ D. Sélection traçable des candidats
                                  +─ E. IA : proposer / comparer des silhouettes
                                  +─ F. Vérification déterministe des faits
                                  +─ G. Résultat JSON compatible V9 + diagnostic séparé
                                  |
                                  └─ Plus tard : photo ciblée, retours, port réel, statistiques
```

### Contrat de décision à respecter

- **Contraintes dures** : IDs existants, pièce explicitement imposée, éléments de base requis, interdiction réellement renseignée, aucune caractéristique inventée, format de sortie.
- **Préférences souples** : colorimétrie froide, morphologie en A, équilibre des volumes, originalité, degré de superposition, style personnel, confort souhaité.
- **Évaluation stylistique** : proportions, cohérence couleur/matière, effet sur la silhouette, portabilité, intérêt créatif, sobriété des accessoires. Le code **ne doit pas prétendre mesurer automatiquement** toutes ces qualités.
- **Échec explicite** : si aucune solution cohérente n'existe avec les pièces disponibles, expliquer pourquoi, sans substituer une pièce inventée.

## 6. Dix tests de validation (à réaliser avec les vraies fiches)

| Test | Situation | Points de contrôle prioritaires |
|---|---|---|
| 1 | Tenue de travail chic | Ensemble complet ; cohérence et proportions |
| 2 | Tenue décontractée et féminine | Porter de vrais vêtements, sans surcharge |
| 3 | Journée chaude avec sensibilité thermique | Respect de la chaleur ressentie, couches adaptées |
| 4 | Robe blazer noire à double boutonnage | Pièce imposée effectivement retenue ; pas de ceinture ou poncho ajouté sans justification ; respect exact de la fiche |
| 5 | Pluie et vent | Protection réelle, sans inventer de matière imperméable |
| 6 | Demande expresse d'ignorer la météo | La proposition ne dépend pas du temps actuel |
| 7 | Sweat VOGUE, jean, perfecto, talons | Créativité rock/vintage sans perdre l'équilibre de la silhouette |
| 8 | Silhouette en A | Travail pertinent du haut, épaules et volumes |
| 9 | Catalogue volumineux | Pièces candidates utiles non silencieusement écartées ; couverture traçable |
| 10 | Nouvelle proposition à demande identique | Pièces réellement différentes, qualité maintenue |

### Grille commune, à renseigner pour chaque test

1. **Validité technique** : aucun ID inventé ; JSON compatible ; enregistrement possible.
2. **Contraintes obligatoires** : toutes celles qui s'appliquent sont satisfaites.
3. **Style et silhouette** : note de 0 à 5, justifiée par l'utilisatrice.
4. **Portabilité et confort** : note de 0 à 5.
5. **Qualité du conseil** : note de 0 à 5 (précis, non flatteur, fondé sur les pièces).
6. **Diagnostic** : liste des IDs reçus et écartés, éventuelles limitations, modèle choisi, durée et tokens (sans clé secrète).

Un test est **satisfaisant** seulement si les contraintes obligatoires passent et si la personne juge la tenue réellement convaincante. Cible initiale : **8 tests satisfaisants sur 10**, dont le test 4. Ce seuil est une décision de projet, pas un résultat déjà obtenu.

## 7. Séquence de travail recommandée

1. Conserver la V9 et le moteur de production inchangés ; sauvegarder leur version exacte.
2. Créer et tester localement les modules de *résolution des pièces imposées*, de *présélection traçable*, de *validation des tenues* et la forme des messages échangés.
3. Préparer `assistant-style-labo`, avec un contrat de sortie compatible V9.
4. Réaliser un premier essai avec **un seul fournisseur payant**, à faible coût, après préparation de l'accès API et de ses limites.
5. Mesurer les résultats sur les 10 cas ; corriger les défauts **structurels**, pas chaque accessoire individuellement.
6. Ne déployer en production qu'après réussite de la grille et sauvegarde.
7. Ensuite seulement : mémoire des préférences, statistiques, vision ciblée et optimisation de stockage photo.

## 8. Limites de cet audit

- Absence de vérification de la branche distante et de son déploiement réel.
- Absence de lecture du code `assistant-style` actuellement affiché dans Supabase, distinct de notre copie sauvegardée.
- Absence d'accès aux règles RLS et aux journaux Supabase.
- Aucun essai réel d'un modèle payant ; aucun calcul fiable de taux de réussite stylistique à ce stade.

**Décision proposée** : passer à la préparation du contrat stylistique et du moteur de laboratoire, sans modifier ni payer quoi que ce soit aujourd'hui.
