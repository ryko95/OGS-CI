# Veille automatique de l'OGS-CI

Le workflow `Veille médiatique OGS-CI` s'exécute chaque jour à 01 h 17, 07 h 17, 13 h 17 et 19 h 17 UTC (heures de Côte d'Ivoire), sous réserve des éventuels retards de GitHub Actions. Il peut aussi être lancé avec **Actions → Veille médiatique OGS-CI → Run workflow**. Il interroge GDELT (sept derniers jours) et les flux publics de Google Actualités (réglage CI/fr), sans clé ni abonnement. Les quatre requêtes comprennent la Côte d'Ivoire et plusieurs villes. La veille commence le **1er septembre 2026**, conformément à `start_date` dans `data/veille_config.json`. Les liens antérieurs à cette date sont exclus ; les autres sont conservés au maximum 90 jours, avec un plafond de 300 références. Les doublons d'URL et les URL déjà intégrées à la couche sont exclus.

Le panneau « Veille médiatique » affiche la date de la dernière exécution réussie et des liens à examiner. **Un article n'est pas un cas**, même si son titre contient le mot « suicide ». La collecte ne géocode pas, ne déduit pas le nombre de victimes et ne modifie ni les 52 cas documentés ni leurs statistiques. Le relevé `data/veille.json` est public, car GitHub Pages est un site public. Il ne stocke ni titres, ni noms, ni texte d'articles : seulement des URL, domaines et dates de repérage. Examiner la source, la date des faits, le lieu et les doublons avant de saisir un nouveau cas dans la couche, avec une localisation suffisamment générale et sans identité personnelle.

La date issue de Google Actualités correspond à la date du flux. Pour GDELT, `seendate` correspond à la date de détection dans son index : vérifier la date réelle de l'article et celle des faits avant toute validation.

Les réseaux sociaux ne sont **pas** surveillés dans cette version : leurs données nécessitent un accès/API autorisé propre à chaque plateforme. Cette collecte ne prétend pas couvrir tous les médias ivoiriens. Les liens Google Actualités peuvent être des pages intermédiaires redirigeant vers l'article. Les signalements citoyens présents dans la carte sont stockés localement dans le navigateur de chaque visiteur et ne remontent pas dans ce relevé.

## Recevoir les nouveaux liens par e-mail

Le même workflow prépare un e-mail **uniquement lorsqu'il existe des liens qui n'ont jamais été envoyés**. Le destinataire par défaut est `sreueric@gmail.com`. Seuls les liens respectant la date de début peuvent être inclus dans le premier envoi. Le message ne contient pas de nom ni de titre d'article : uniquement les domaines, les dates et les liens à examiner. Les identifiants des liens déjà expédiés sont conservés dans `data/alerte_email.json` pour éviter l'envoi à chaque exécution.

Pour activer l'envoi, ouvrir **GitHub → OGS-CI → Settings → Secrets and variables → Actions → New repository secret** et créer :

1. `OGS_SMTP_USER` : l'adresse Gmail qui expédiera les alertes (par exemple votre propre adresse) ;
2. `OGS_SMTP_PASSWORD` : un **mot de passe d'application Google** du compte expéditeur, jamais le mot de passe habituel du compte ;
3. facultatif, `OGS_ALERT_EMAIL` : autre adresse de réception si vous ne souhaitez pas utiliser `sreueric@gmail.com`.

Le compte expéditeur doit avoir la validation en deux étapes et autoriser la création d'un mot de passe d'application. Après avoir ajouté les deux secrets obligatoires, lancer **Actions → Veille médiatique OGS-CI → Run workflow** pour recevoir le premier récapitulatif sans attendre l'horaire suivant. N'inscrivez jamais un mot de passe dans le dépôt, une issue, un message ou le fichier de configuration. Si les secrets manquent, la carte continue à se mettre à jour, mais aucun e-mail ne part. Une erreur SMTP arrête l'exécution avant d'enregistrer l'envoi, afin que les liens restent à notifier lors de la prochaine tentative. Un cas exceptionnel d'interruption juste après l'envoi peut produire un doublon ; dans ce cas les URL permettent de le reconnaître.

## Désactiver

Dans GitHub, ouvrir **Actions → Veille médiatique OGS-CI → ⋯ → Disable workflow**. Pour suspendre également les lancements manuels, remplacer `"enabled": true` par `"enabled": false` dans `data/veille_config.json`. L'historique de veille déjà publié reste affiché tant que `data/veille.json` n'est pas vidé. GitHub peut aussi désactiver automatiquement un workflow programmé sur un dépôt public inactif pendant 60 jours.

Si les exécutions échouent, ouvrir l'onglet **Actions** et consulter le journal. Lorsqu'aucune recherche ne réussit, le script échoue sans écraser le dernier relevé ; une erreur isolée est comptée dans `requêtes_en_echec`.
