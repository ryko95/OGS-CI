# Veille automatique de l'OGS-CI

Le workflow `Veille médiatique OGS-CI` s'exécute chaque jour à 01 h 17, 07 h 17, 13 h 17 et 19 h 17 UTC (heures de Côte d'Ivoire), sous réserve des éventuels retards de GitHub Actions. Il peut aussi être lancé avec **Actions → Veille médiatique OGS-CI → Run workflow**. Il interroge GDELT (sept derniers jours) et les flux publics de Google Actualités (réglage CI/fr), sans clé ni abonnement. Les quatre requêtes comprennent la Côte d'Ivoire et plusieurs villes. La veille commence le **1er septembre 2026**, conformément à `start_date` dans `data/veille_config.json`. Les liens antérieurs à cette date sont exclus ; les autres sont conservés au maximum 90 jours, avec un plafond de 300 références. Les doublons d'URL et les URL déjà intégrées à la couche sont exclus.

Le panneau « Veille médiatique » affiche la date de la dernière exécution réussie et des liens à examiner. **Un article n'est pas un cas**, même si son titre contient le mot « suicide ». La collecte ne géocode pas, ne déduit pas le nombre de victimes et ne modifie ni les cas documentés ni leurs statistiques. Le relevé `data/veille.json` est public, car GitHub Pages est un site public. Il ne stocke ni titres, ni noms, ni texte d'articles : seulement des URL, domaines et dates de repérage. Examiner la source, la date des faits, le lieu et les doublons avant de saisir un nouveau cas dans la couche, avec une localisation suffisamment générale et sans identité personnelle.

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

## Intégration validée du 9 octobre 2026

Le cas `CIV-S-2026-001`, survenu à Cocody le 2 septembre 2026 et publié par KOACI le 3 septembre (article 200147), a été ajouté à la demande de Dr SREU Eric, qui le confirme après ses enquêtes. La date du 9 octobre est celle de la réception de cette confirmation, pas nécessairement celle des enquêtes. Le sexe, l’âge et le niveau de preuve codifié A/B/C restent non renseignés. La position est un repère communal approximatif sourcé dans la fiche, pas le lieu exact de l’événement. La couche des points contient désormais 53 cas ; les totaux de D.A ABIDJAN passent à 27 cas, 27 urbains et 4 confirmés.

## Courbe mensuelle et alerte des nouveaux cas

La courbe regroupe les points selon `date_evene` (JJ/MM/AAAA ou AAAA-MM-JJ). Les dates absentes ou invalides ne sont jamais remplacées par une date de publication ; leur nombre est affiché séparément. La vue globale est affichée en premier, du premier mois documenté au mois courant, sans mois futurs et sans défilement horizontal nécessaire. La courbe précède les chiffres du tableau de bord. Le sélecteur permet ensuite de détailler une année. Un clic sur un mois applique un filtre supplémentaire aux points, aux résultats, aux indicateurs et à la heatmap ; « Retirer le filtre mensuel » retrouve la requête initiale. Lancer ou réinitialiser une requête retire ce filtre mensuel.

Pour chaque ajout validé par le responsable, renseigner dans les propriétés du point :

- `date_ajout` : date réelle de publication dans la couche, au format AAAA-MM-JJ ;
- `validation_par` : nom du responsable ayant validé l’intégration ;
- `date_evene` : date des faits, si connue, distincte de la date d’ajout.

Le bouton rouge en tête du tableau de bord est calculé automatiquement à partir des cas déjà présents dans la couche, ayant un validateur et une date d’ajout comprise entre le premier jour du mois en cours et aujourd’hui (calendrier UTC, identique à Abidjan). Avec un seul nouvel ajout, un clic sur le bouton centre directement la carte sur ce point sans popup. Avec plusieurs ajouts, il affiche la liste ; chaque bouton « Voir sur la carte » centre le point sans popup. La veille médiatique et les signalements locaux non validés ne déclenchent pas cette alerte. Sans ces métadonnées, une entrée ne sera pas présentée comme un nouvel ajout validé. Le cas CIV-S-2026-001 porte la date d’ajout du 2026-10-09.

Le bouton indique le mois et reste visible, grisé et désactivé lorsqu’aucun cas n’a été intégré pendant ce mois. Les ajouts du mois précédent ne sont pas reportés. Le changement de mois est pris en compte même si la page reste ouverte.
