# Mon Dressing — Conception générale du moteur stylistique (laboratoire V1)

**17 novembre 2026 · document de travail · pas encore déployé**

## Décision

Conserver l'interface V9 actuelle. Préparer un moteur en deux passes, indépendant des fournisseurs, avec contrôle déterministe des contraintes. Les fournisseurs IA (OpenAI, Anthropic ou autre) seront introduits derrière un adaptateur, **sans inscrire leur nom dans les règles métier**.

## Fondements déjà constatés

Le HTML V9 transmet à `assistant-style` : `date`, `lieu`, `meteo`, `envie`, `programme`, `ressenti`, `confort`, `precisions`. Il attend en retour : `nom`, `pieces` (IDs numériques), `occasion`, `conseils`, `classement` avec `style`, `styles`, `saison`, `meteo`, `temp_min`, `temp_max`.

Dans l'ancienne fonction `assistant-style`, les vêtements sont préfiltrés et leur description peut être tronquée. Cela peut priver l'IA d'articles ou de précisions importantes. Le nouveau moteur est conçu pour supprimer ces pertes *silencieuses*.

## Flux cible

1. **Lecture du catalogue et validation** : 1 à 500 pièces, IDs uniques, catégories et noms présents. Les photos restent dans l'application ; seule une future étape de vision ciblée les enverra au fournisseur.
2. **Résolution des obligations** : IDs de vêtements explicitement choisis ou correspondance de nom dans les précisions. Les ambiguïtés provoquent une erreur identifiable plutôt qu'une invention.
3. **Passe A — index de tout le catalogue** : le modèle reçoit une liste compacte des **500 pièces maximum**, avec IDs, noms, rôles, couleurs, types, styles et saisons. Il nomme des candidates par ID. Si l'index dépasse le budget, le moteur s'arrête avec une erreur explicite et ne supprime rien en cachette.
4. **Passe B — fiches détaillées** : la sélection tient compte des nominations, des pièces obligatoires et de la diversité des rôles. Une fiche choisie n'est jamais tronquée. Le moteur signale les IDs dont les fiches complètes n'ont pas été envoyées.
5. **Composition stylistique** : la deuxième passe IA raisonne sur les fiches complètes et les préférences, compare plusieurs silhouettes et renvoie un objet JSON compatible avec la V9.
6. **Vérification déterministe** : IDs réels, IDs effectivement transmis, vêtement imposé, base robe ou haut + bas, chaussures si le catalogue en contient, exclusions, doublons, contraintes explicites de ceinture, classement correct, véritable alternative si une tenue précédente est fournie.
7. **Validation humaine** : la qualité esthétique (équilibre de la silhouette, subtilité de l'association, créativité et portabilité réelle) n'est **pas démontrable** par ces contrôles informatiques. Elle devra être notée sur de vraies propositions de tenues.

## Contrat de décision

| Inconditionnel / vérifiable | Préférence / appréciation |
|---|---|
| Identifiants réels et présents dans les fiches détaillées | Colorimétrie froide |
| Pièce explicitement imposée présente | Silhouette en A et effet visuel recherché |
| Respect d'une véritable interdiction exprimée dans une fiche | Équilibre des volumes et des matières |
| Pas de vêtements inventés ni de catégories incompatibles | Originalité, rock, vintage, sobriété |
| Réponse JSON de la V9 | Valeur stylistique des accessoires et superpositions |
| Alternative non identique si IDs précédents fournis | Confort et raffinement évalués par la personne |

### Deux principes importants

- « Vendue sans ceinture » n'interdit pas de porter une ceinture ; « ne doit pas être ceinturée » impose une interdiction. À terme, cette information devra être une propriété structurée de la fiche pour éviter les lectures approximatives.
- En cas de doute sur la pièce imposée ou l'absence de protection météo, le système doit **déclarer son incertitude**, pas faire semblant de savoir.

## Limites assumées de cette première version

- **Laboratoire seulement** : aucun appel réel à Groq, OpenAI, Claude, Supabase ou GitHub. Pas de code de production modifié.
- Deux passes IA peuvent coûter plus cher et prendre plus de temps qu'une seule. Les coûts et la latence devront être mesurés avant choix du fournisseur.
- L'index donne au modèle une vue de tous les articles, mais les fiches complètes restent réservées aux candidats sélectionnés. Une mauvaise nomination peut donc encore écarter une bonne association ; nous devons auditer et évaluer cette sélection.
- Les demandes libres de type « ma robe noire » peuvent rester ambiguës. Une interface permettant de **choisir un vêtement par ID** est le correctif général recommandé.
- L'ancienne V9 n'envoie pas `requiredPieceIds`, `excludedPieceIds`, `previousPieceIds` ni `ignorer_meteo` sous forme structurée. Le contrat accepte ces champs en option pour une future évolution ; ils **ne sont pas encore activés dans la V9**.
- Les photographies et les jugements d'esthétique réelle ne sont pas examinés par le module de test.
- Aucun modèle commercial ni tarif n'a été fixé par ce code.

## Plan de validation stylistique — dix scénarios

1. Tenue de travail chic à partir des vrais vêtements.
2. Tenue décontractée féminine non surchargée.
3. Temps chaud avec sensibilité thermique.
4. Robe blazer noire à double boutonnage, pièce imposée, ceinture/poncho non automatiques.
5. Pluie et vent avec protection réelle, sans inventer d'imperméabilité.
6. Demande explicite d'ignorer la météo.
7. Sweat VOGUE + jean + perfecto + talons, si l'association est pertinente.
8. Morphologie en A : valoriser le haut et l'équilibre des volumes.
9. Dressing proche de 500 pièces : couverture de l'index et qualité des candidates.
10. Deuxième proposition : changement réel d'articles sans perte de qualité.

**Critère de réussite proposé (non encore atteint)** : aucune pièce inventée, toutes les contraintes impératives respectées et au moins 8 tenues jugées satisfaisantes sur 10 par l'utilisatrice, avec justification de chaque note.

## Phase 1 effectivement réalisée

Modules TypeScript purs créés : `domain`, `normalisation`, `contraintes`, `catalogue`, `validation`, `pipeline`. Deux interfaces de modèle sans fournisseur codé en dur. **37 tests locaux sur 37 réussis** au 17 novembre 2026, en utilisant des vêtements fictifs reproduisant nos cas techniques. Tests **techniques seulement**, pas d'appel API et pas de preuve de qualité stylistique.

## Étape suivante (sans toucher à la V9)

1. Vérifier les contraintes de sécurité Supabase et l'état exact de `assistant-style` actuellement déployé.
2. Créer une fonction **distincte** `assistant-style-labo` avec cet orchestrateur et un adaptateur API testable, sans secret dans GitHub.
3. Réaliser le test 4 et le reste du protocole sur un **export anonymisé ou les vraies fiches sous accès authentifié**, avec facturation API limitée et consentie.
4. Ne promouvoir le moteur que si les tests apportent une amélioration réelle.

**Sécurité** : aucun mot de passe, jeton, clé API ni identifiant de compte n'a sa place dans ces documents ou modules de laboratoire.
