# Mon Dressing — Cap produit et décisions validées

**Date : 24 novembre 2026**  
**Statut : direction artistique et fonctionnelle validée ; mise en œuvre à concevoir**  
**Référence antérieure : `ETAT_PROJET.md` et documents de conception du moteur.**

## 1. Vision et promesse

**Mon Dressing est un styliste qui choisit une tenue, pas un catalogue qui demande de choisir.**

L'expérience visée : ouvrir l'application sur iPhone ou Mac, renseigner quelques besoins (programme, contraintes, météo prise en compte ou non), recevoir **une tenue complète prête à porter** avec les pièces du dressing, puis éventuellement remplacer une seule pièce. L'objectif est de **gagner du temps** et de mieux exploiter son dressing, pas de lire des explications stylistiques évidentes.

## 2. Direction artistique

- Chic féminin contemporain ; influences romantiques, rock ou vintage.
- Signature : **contraste maîtrisé** — base cohérente et un élément fort quand il apporte vraiment quelque chose.
- Priorité aux **proportions et à la morphologie en A**, puis aux coupes, harmonies de couleurs, matières et volumes.
- Préférence pour les teintes froides sans interdits absolus ; conserver le jugement stylistique indépendant.
- Sacs et chaussures sont des composantes importantes de la tenue. Veste/manteau si utile et disponible ; ne pas en ajouter systématiquement.
- **Le rendu visuel prime sur la justification écrite.** Conseils facultatifs, courts et réellement utiles ; **40 mots n'est pas une limite métier stricte**. Un dépassement ne doit pas faire perdre toute une génération.
- Les planches montrent les **véritables vêtements photographiés**. Le moteur ne doit pas prétendre avoir analysé des photos quand seules les descriptions lui ont été transmises.

## 3. Parcours utilisateur cible

1. **« Composer ma tenue »** — une proposition principale, pas trois choix imposés à comparer.
2. Visualiser directement la tenue complète (haut + bas ou robe, chaussures, sac et couche extérieure le cas échéant).
3. Si une pièce ne convient pas, choisir **« Changer cette pièce »** : c'est l'interaction **prioritaire**.
4. Le reste de la tenue demeure **strictement inchangé** ; le moteur sélectionne une alternative harmonieuse parmi les pièces disponibles. Revenir en arrière doit être possible.
5. **Une seule pièce de remplacement est présentée à la fois**, choisie par l'IA ; ne pas demander à l'utilisatrice de comparer trois candidates.
6. Si le premier remplacement ne convient pas, **« Une autre pour cette pièce »** cherche une nouvelle candidate sans changer les autres vêtements et, si possible, sans reproposer immédiatement une candidate déjà refusée dans cette session.
7. La substitution reste **provisoire** jusqu'à confirmation ; prévoir un retour à la pièce d'origine. Si aucune autre substitution satisfaisante n'existe, le signaler plutôt que dégrader la tenue.
8. **« Je porte cette tenue »** confirme une tenue effectivement portée ; ne pas confondre proposition et port réel.
9. « Une autre tenue complète » reste possible, mais secondaire par rapport au remplacement ciblé.

**Décision d'interface validée le 24 novembre 2026 :** une seule nouvelle pièce choisie par l'IA, avec un bouton pour en demander une autre pour le **même emplacement**. Les autres pièces restent verrouillées. Le résultat doit rester rapide et d'abord visuel.

**Choix technique encore ouvert :** remplacement par filtrage local, mini-appel IA ciblé ou méthode hybride. L'approche hybride est une **recommandation à valider**, pas un choix technique déjà adopté. Comparer qualité, coût, rapidité, maintien des pièces et fiabilité avant d'implémenter.

## 4. Rotation et exploitation du dressing

- Dressing raisonné de **500 pièces maximum**, sans achats inutiles.
- L'IA doit découvrir des associations intéressantes et **éviter de répéter systématiquement** les mêmes bottines, sacs ou looks d'une semaine à l'autre.
- La rotation n'est **pas aléatoire ni forcée** : la cohérence esthétique reste prioritaire.
- Conserver quatre informations distinctes : **pièce examinée**, **pièce proposée**, **tenue enregistrée**, **pièce réellement portée**.
- À terme, proposer des analyses des favoris, pièces délaissées, doublons et vêtements à redécouvrir.
- La diversité **dans le temps** prime sur la présentation de plusieurs tenues à chaque requête.

**Décision validée le 24 novembre 2026 — refus contextualisé :**
- Quand l'utilisatrice demande à remplacer un vêtement, cela signifie **« cette pièce ne convient pas dans cette association »**, et **non** « je n'aime pas cette pièce en général ».
- Le moteur peut donc reproposer ce vêtement dans une autre tenue, avec d'autres associations.
- Durant la série de remplacements de la **même pièce dans la même tenue**, éviter de revenir immédiatement à une alternative déjà refusée ; conserver la possibilité d'annuler et de revenir à l'original.
- Pour préparer la mémoire de rotation, rattacher le retour au **contexte de la tenue** (identifiants des pièces associées et pièce remplacée), plutôt que diminuer globalement la préférence pour le vêtement.
- Un désamour durable pour un vêtement relève d'une éventuelle fonction **distincte et explicite**, jamais déduite automatiquement d'un simple changement de pièce.

**Statut : règle produit validée, non encore implémentée.** Le schéma précis de l'historique reste à concevoir.

## 5. Météo pragmatique

- Éviter les incohérences évidentes entre température et tenue.
- Travailler avec **les pièces réellement possédées** ; si aucun imperméable n'est disponible, ne pas multiplier les rejets et les avertissements.
- Un bref signalement suffit lorsqu'une protection est incertaine. La météo reste un **contexte**, pas la raison d'être de l'application.
- L'utilisatrice peut choisir d'ignorer la météo.

## 6. Limite de confidentialité du profil

- **Aucune donnée de santé, de traitement, de diagnostic ou d'historique médical** ne doit être intégrée aux consignes des modèles, au profil stylistique, au code, à la documentation ou aux journaux de Mon Dressing sans demande spécifique et accord explicite de l'utilisatrice.
- Ne pas déduire une contrainte vestimentaire à partir d'informations personnelles issues d'autres conversations. Les préférences utilisées par l'application doivent être des choix de style explicitement formulés pour Mon Dressing.
- Le ressenti thermique peut être demandé au jour le jour en termes vestimentaires génériques ; ne pas en inférer une origine médicale.
- Avant déploiement, vérifier les consignes serveur et le frontend. Cette règle s'applique aussi aux futurs essais et aux fournisseurs d'IA interchangeables.

## 7. Gouvernance du projet

**L'utilisatrice reste décisionnaire de la direction artistique et des orientations produit.**

- **Art :** elle juge le style, les associations et le rendu ; son critère est « est-ce que je porterais cette tenue ? ».
- **Fonctionnel :** comparer les possibilités et arbitrer ensemble les priorités et les parcours.
- **Technique :** l'assistant propose plusieurs solutions avec leurs avantages, limites, coûts et risques ; les changements structurants sont soumis à validation.
- Ne pas enchaîner les correctifs ad hoc après chaque génération. Corriger des problèmes récurrents et structurels.
- Préserver la **V9** en production ; expérimenter dans la fonction de laboratoire indépendante.
- Coûts maîtrisés, stabilité iPhone/Mac, sauvegardes et fournisseur IA interchangeable.

## 8. État du projet lors de cette décision

- **V9 :** application conservée et fonctionnelle.
- **Laboratoire V2.2 :** génération et comparaison de tenues expérimentales, sur environ 50 pièces.
- **Tests F et G :** l'utilisatrice a confirmé qu'elle porterait les deux tenues retenues. C'est un signal positif, **pas une validation complète du moteur**.
- **Test B :** erreur HTTP 422 liée à un texte de conseils trop long dans l'option 3 ; on ne peut pas en déduire la qualité esthétique de la génération rejetée.
- **À concevoir / intégrer :** remplacement ciblé d'une pièce, historique de rotation, confirmation des vêtements réellement portés, profil stylistique permanent modifiable, planches et lookbooks aboutis.

## 9. Priorités de réalisation

1. Conserver ce cap dans toute décision future.
2. **Valider le cœur stylistique** sur un échantillon représentatif selon la qualité réellement portée, sans multiplier les tests payants.
3. Concevoir puis faire valider l'interaction **« Changer cette pièce »**.
4. Concevoir l'**historique de propositions, d'enregistrements et de ports réels** pour soutenir la rotation.
5. Intégrer progressivement dans l'application après tests et sauvegardes, en privilégiant l'ergonomie et la rapidité du quotidien.

---

**Continuité :** ce fichier complète `ETAT_PROJET.md` sans remplacer son historique technique. Faire évoluer ce document après chaque décision validée plutôt que disperser des consignes contradictoires.
