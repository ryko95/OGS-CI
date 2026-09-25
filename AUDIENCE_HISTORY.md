# Traçabilité de l'audience d'OGS-CI

## Jalons vérifiables

| Date et heure (UTC, comme en Côte d'Ivoire) | Événement | Source et portée |
| --- | --- | --- |
| 17 septembre 2026, 15 h 51 | Premier dépôt des fichiers de l'Observatoire | Historique Git du dépôt ; ce jalon ne prouve pas à lui seul l'heure exacte de publication sur GitHub Pages. |
| 17 septembre 2026, 17 h 00 | Ajout du compteur Page Views API | Historique Git ; le compteur n'existait pas dans le dépôt avant ce changement. |
| 25 septembre 2026 | Activation du suivi Cloudflare Web Analytics | Code de suivi publié sur GitHub Pages ce jour-là. Les données Cloudflare commencent à compter de son activation effective, sans reconstitution rétroactive. |
| 25 septembre 2026, 13 h 42 | **78** vues cumulées indiquées par Page Views API | Lecture de `GET https://page-views-api.ratneshc.com/api/v1/views?site=ryko95.github.io&path=%2FOGS-CI` à 13 h 42 min 16 s UTC. Point de référence historique, et non nombre de personnes uniques. |

## Ce que l'on peut et ne peut pas déduire

- **Avant le 25 septembre :** le compteur donne un total cumulé, sans dates ni pays. Les 78 vues ont été mesurées depuis l'installation du compteur ; leur répartition quotidienne et géographique est inconnue.
- **Depuis le 25 septembre :** consulter Cloudflare Web Analytics pour la courbe des visites et la dimension « Country ». Le nombre de visites Cloudflare et le total Page Views API ne suivent pas nécessairement la même définition.
- **Google Search Console :** si l'Observatoire était déjà visible dans Google, exporter le rapport « Performances → Résultats de recherche » filtré sur sa page. Il peut donner les clics par date et par pays **issus de Google Search uniquement** ; ces clics ne représentent pas toutes les visites du site.
- **GitHub Insights → Traffic :** renseigne la fréquentation du **dépôt** sur les 14 derniers jours. Ne pas l'intégrer à la série des visites de la webmap.

Pour un bilan, présenter séparément la période antérieure au suivi Cloudflare (« total cumulé connu, distribution inconnue ») et la période suivie par Cloudflare. Ne pas interpoler de jours ou de pays manquants.
