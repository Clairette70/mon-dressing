# Mon Dressing

Application personnelle de dressing et de stylisme sur iPhone et Mac.

**Promesse produit :** renseigner ses besoins, obtenir **une tenue prête à porter** avec ses véritables vêtements, pouvoir **changer une seule pièce** si nécessaire, puis suivre les pièces effectivement portées. Priorités : harmonie, silhouette, **rotation intelligente du dressing** (500 pièces maximum) et **gain de temps**.

## Documents de référence — lire dans cet ordre

1. **[Décisions produit et direction artistique](MON_DRESSING_DECISIONS_PRODUIT.md)** — vision, expérience cible, choix validés et limites à ne pas dépasser.
2. **[État du projet et méthode de continuité](ETAT_PROJET.md)** — versions, tests réellement effectués, problèmes connus, priorités et procédure de développement.

### Documentation historique

- [Audit de la V9 — 17 novembre 2026](AUDIT_MON_DRESSING_V9_CONSOLIDE_2026-11-17.md)
- [Conception initiale du moteur laboratoire](CONCEPTION_MOTEUR_STYLISTIQUE_V1.md)

Ces deux documents sont des **archives datées**, pas des descriptions garanties de l'état actuel.

## Application et laboratoire

- **[Application Mon Dressing (V9 conservée)](https://clairette70.github.io/mon-dressing/)**
- **[Laboratoire stylistique V2.2](https://clairette70.github.io/mon-dressing/test-styles-labo.html)** — environnement de test distinct ; certains scénarios appellent une API payante.

**Important :** les Edge Functions et les secrets sont hébergés dans Supabase, pas dans ce dépôt GitHub. La V9 appelle `assistant-style` ; le laboratoire appelle `assistant-style-labo`. Ne jamais confondre ces deux fonctions ni supposer que GitHub reflète à lui seul la version réellement déployée dans Supabase.

## Méthode convenue avant chaque évolution

1. Relire les **décisions produit**, puis l'**état du projet**.
2. Vérifier les fichiers ou fonctions concernés et distinguer faits vérifiés, décisions et hypothèses.
3. Comparer les solutions selon leur **intérêt pour l'utilisatrice**, leur qualité, leur coût, leur simplicité et leurs risques.
4. Faire valider les décisions artistiques, fonctionnelles et techniques structurantes **avant de coder**.
5. Sauvegarder et tester **en laboratoire** avant toute évolution de la V9.
6. Actualiser les documents après validation ; ne pas inventer un état déployé ou un résultat de test.

**Règle de réussite :** la tenue doit être jugée réellement portable par l'utilisatrice ; les notes automatiques de GPT et les tests de syntaxe ne suffisent pas.

*Mise à jour de cet index : 24 novembre 2026.*
