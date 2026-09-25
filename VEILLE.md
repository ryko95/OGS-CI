# Veille automatique de l'OGS-CI

Le workflow `Veille médiatique OGS-CI` s'exécute chaque jour à 01 h 17, 07 h 17, 13 h 17 et 19 h 17 UTC (heures de Côte d'Ivoire), sous réserve des éventuels retards de GitHub Actions. Il peut aussi être lancé avec **Actions → Veille médiatique OGS-CI → Run workflow**. Il utilise le moteur de recherche d'articles GDELT, sans clé ni abonnement. Les six requêtes comprennent la Côte d'Ivoire et plusieurs villes. Les liens publics repérés lors des sept derniers jours sont conservés au maximum 90 jours, avec un plafond de 300 références. Les doublons d'URL et les URL déjà intégrées à la couche sont exclus.

Le panneau « Veille médiatique » affiche la date de la dernière exécution réussie et des liens à examiner. **Un article n'est pas un cas**, même si son titre contient le mot « suicide ». La collecte ne géocode pas, ne déduit pas le nombre de victimes et ne modifie ni les 52 cas documentés ni leurs statistiques. Le relevé `data/veille.json` est public, car GitHub Pages est un site public. Il ne stocke ni titres, ni noms, ni texte d'articles : seulement des URL, domaines et dates de repérage. Examiner la source, la date des faits, le lieu et les doublons avant de saisir un nouveau cas dans la couche, avec une localisation suffisamment générale et sans identité personnelle.

Les réseaux sociaux ne sont **pas** surveillés dans cette version : leurs données nécessitent un accès/API autorisé propre à chaque plateforme. Cette collecte ne prétend pas couvrir tous les médias ivoiriens. Les signalements citoyens présents dans la carte sont stockés localement dans le navigateur de chaque visiteur et ne remontent pas dans ce relevé.

## Désactiver

Dans GitHub, ouvrir **Actions → Veille médiatique OGS-CI → ⋯ → Disable workflow**. Pour suspendre également les lancements manuels, remplacer `"enabled": true` par `"enabled": false` dans `data/veille_config.json`. L'historique de veille déjà publié reste affiché tant que `data/veille.json` n'est pas vidé. GitHub peut aussi désactiver automatiquement un workflow programmé sur un dépôt public inactif pendant 60 jours.

Si les exécutions échouent, ouvrir l'onglet **Actions** et consulter le journal. Lorsqu'aucune recherche ne réussit, le script échoue sans écraser le dernier relevé ; une erreur isolée est comptée dans `requêtes_en_echec`.
