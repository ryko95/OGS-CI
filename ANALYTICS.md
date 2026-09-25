# Audience de l'Observatoire OGS-CI

Le nombre affiché dans l'en-tête provient de Page Views API : c'est le cumul de son compteur. La courbe quotidienne et la répartition par pays seront consultables dans le tableau de bord privé Cloudflare Web Analytics après activation. Les deux systèmes ont des méthodes de comptage distinctes et leurs valeurs peuvent différer.

## Activation

1. Connectez-vous à votre compte sur https://dash.cloudflare.com/ et ouvrez **Web Analytics**.
2. Choisissez **Add a site** ; indiquez le nom d'hôte exact `ryko95.github.io` (sans `https://` ni `/OGS-CI/`). Cette opération ne modifie ni les DNS, ni l'hébergement GitHub Pages.
3. Dans **Manage site**, copiez le jeton de 32 caractères hexadécimaux indiqué dans le code JavaScript proposé. Il s'agit du champ `token` de `data-cf-beacon`, et non d'une clé API privée. Ne partagez jamais votre mot de passe ni une clé API Cloudflare.
4. Placez uniquement ce jeton dans l'attribut `content` de `<meta name="cloudflare-web-analytics-token" content="">` dans `index.html`, puis publiez la modification sur la branche `main`.
5. Ouvrez `https://ryko95.github.io/OGS-CI/` dans un navigateur, puis vérifiez dans le réseau du navigateur que le script `beacon.min.js` se charge. Les données peuvent prendre quelques minutes à apparaître.

Le script `analytics.js` s'active uniquement sur le domaine et le chemin publics de l'Observatoire. Sans jeton valide, aucune requête Cloudflare n'est émise ; le compteur de visites existant reste opérationnel.

## Lecture des résultats

Dans **Cloudflare → Web Analytics → ryko95.github.io**, sélectionnez la période souhaitée, puis filtrez par chemin `/OGS-CI/` si vous suivez aussi d'autres pages sur le même nom d'hôte. Le graphique montre l'évolution dans le temps ; la dimension **Country** affiche les pays des visiteurs. Vous pouvez également consulter les référents et types d'appareils. Le tableau de bord demeure réservé aux personnes autorisées sur votre compte Cloudflare : un mot de passe placé dans une page GitHub Pages ne protégerait pas des statistiques privées.

La collecte commence **à la date d'activation**. Les anciennes visites du compteur ne contiennent aucune information récupérable sur leur jour exact ou leur pays. Évitez de traiter le compteur cumulé comme un nombre de personnes uniques ou de comparer directement ses valeurs avec les visites de Cloudflare.
