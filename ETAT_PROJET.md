# MON DRESSING — Référence du projet
*Mise à jour : 17 novembre 2026 — document de continuité à actualiser après chaque étape validée.*

## 1. Vision
Application personnelle de dressing sur iPhone et Mac, avec un assistant stylistique exigeant, créatif, indépendant, cohérent et non complaisant. Utiliser **les vrais vêtements** de l’utilisatrice pour créer des tenues portables et visuellement intéressantes. Mieux exploiter un dressing raisonné (maximum 500 pièces), pas favoriser de nouveaux achats.

## 2. État confirmé
- Application web **V9** installée et fonctionnelle : ajout de photographies testé.
- Hébergement / code : GitHub ; données et fonction IA : Supabase.
- Fonction actuellement utilisée par la V9 : **`assistant-style`** (Supabase Edge Function).
- Fournisseur actuel du moteur : Groq, modèle `openai/gpt-oss-120b`.
- Correctif du **16 novembre 2026** : fichier `mon_dressing_moteur_corrige_2026-11-16.ts`, fondé sur `assistant-style-v2`, compatible avec la V9 ; il a été collé et déployé dans `assistant-style` d’après l’utilisatrice.
- **16 tests locaux** annoncés comme réussis pour ce correctif, mais **qualité réelle non validée** : troisième passage du test 4 bloqué par « limite Groq atteinte ».
- **Ancienne V10 à ne pas installer** : fondée sur un moteur antérieur.
- **Pas de nouveau fournisseur API activé à ce stade.** Aucun choix payant définitivement validé ; GPT et Claude évoqués, comparaison réelle non faite.

## 3. Exigences prioritaires
1. Tenues réellement harmonieuses : couleurs, colorimétrie froide, matières, coupes, proportions, volumes, encolures, superpositions, confort ; savoir choisir une tenue simple plutôt que surcharger.
2. Style personnel féminin, chic, moderne, parfois rock ; préserver un jugement indépendant, non complaisant, créatif sans être fantaisiste.
3. Respect strict des vêtements existants et de leurs caractéristiques connues ; aucune pièce ni propriété inventée.
4. Prendre en compte occasion, envie, météo / température / vent / pluie, ressenti thermique, contraintes explicites, choix d’une pièce imposée ; pouvoir ignorer la météo sur demande.
5. Conserver les informations utiles des fiches de 500 pièces maximum ; éviter qu’une présélection masquée élimine systématiquement des pièces pertinentes.
6. Conseils stylistiques précis, courts, argumentés, sur les seuls articles réellement sélectionnés.
7. Photos de vêtements bien détourées et idéalement transparentes ; planches de looks et lookbooks à partir des vrais articles.
8. Mémoire des appréciations et refus, correction des tenues, diversité des propositions.
9. Distinguer quatre événements : pièce analysée / proposée / tenue enregistrée / pièce réellement portée ; statistiques du dressing, pièces inutilisées, doublons, vêtements à redécouvrir et achats complémentaires éventuels.
10. Application stable iPhone et Mac, avec évolutions testées, coûts maîtrisés, sauvegardes et capacité de changer de fournisseur IA sans réécrire l’application.

## 4. Échecs / preuves actuelles
- **Test 4 : robe blazer noire à double boutonnage.** Deux essais jugés insuffisants (autour de 5/10), notamment avec ceinture argentée et poncho gris peu pertinents ; les corrections ad hoc ont conduit à multiplier les exceptions.
- Troisième essai du 16 novembre impossible à évaluer : plafond ou limite Groq atteint.
- **Le passage de 16 tests de code ne prouve pas la qualité réelle du conseil stylistique.**
- Les photos ne sont pas actuellement interprétées par le moteur stylistique à chaque génération : ce dernier exploite surtout des descriptions.
- En cas de volume important, les données de fiches sont condensées et des pièces peuvent être présélectionnées. Risque de perdre des informations utiles.

## 5. Nouvelle méthode retenue — principes de développement
- **Arrêter les règles spécifiques à un vêtement ou à un test** comme solution centrale.
- Définir un « contrat stylistique » général avec des **contraintes dures** (pièces existantes, IDs, demandes expresses, catégories indispensables) et des **préférences souples** (esthétique, degré de superposition, créativité).
- Séparer clairement 5 composants : (1) catalogue et fiches de qualité ; (2) recherche / présélection traçable et sans pertes critiques ; (3) raisonnement stylistique par l’IA ; (4) validation déterministe des faits et contraintes ; (5) retours, historique et analyses.
- Versionner les tests représentatifs et les résultats ; contrôler les régressions avant chaque déploiement.
- Ne modifier le code en production qu'après sauvegarde et validation dans un environnement de test.
- Garder des fonctions et schémas indépendants du fournisseur (adaptateur OpenAI, Claude, etc.).

## 6. Démonstration de valeur AVANT une refonte complète
- Geler la V9, conserver une sauvegarde du code `assistant-style`.
- Définir **10 situations de test représentatives** et une grille commune : fidélité aux fiches, faisabilité/compatibilité, cohérence stylistique, personnalisation, qualité du conseil, diversité.
- Tester un moteur payant **en laboratoire**, sur les vraies fiches et plusieurs styles, sans remplacer l’application en production.
- Se donner des critères de décision : **zéro vêtement inventé**, demandes expresses respectées, pas d’erreur manifeste de composition et **au moins 8 tenues sur 10 jugées satisfaisantes** par l’utilisatrice. Ce dernier seuil est **une cible proposée, non un résultat mesuré**.
- Si les résultats ne sont pas au rendez-vous, analyser si l’échec provient du modèle, des informations envoyées ou de l’architecture avant de changer encore de fournisseur.
- Ne développer ensuite les fonctions avancées (mémoire, statistiques, vision) qu’une fois le cœur stylistique validé.

## 7. Continuité entre conversations
Cette fiche est la **source de vérité écrite** : la relire au début de toute nouvelle session et la mettre à jour seulement après un changement validé. Il est possible de la placer dans le dépôt GitHub (par exemple `docs/ETAT_PROJET.md`) ou de la joindre à une nouvelle conversation. Ne pas supposer qu’une nouvelle conversation connaît automatiquement l’état exact du code ou des tests. Conserver en outre les fichiers sources versionnés et, pour chaque modification, noter : version installée, correctif, raison, tests réussis / non réussis, prochaine action.

## 8. Prochaine étape, sans coût et sans toucher à la V9
Établir le **contrat stylistique général et la grille des 10 cas de test**, puis préparer le moteur de laboratoire. Le choix précis du fournisseur API sera validé après la comparaison des besoins techniques et un premier test, et non sur un argument commercial.
