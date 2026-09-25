OBSERVATOIRE GEOGRAPHIQUE DU SUICIDE EN COTE D'IVOIRE
Version prototype enrichie a partir de la webmap QGIS2Web fournie.

FONCTIONNALITES AJOUTEES
1. Cartographie thematique dynamique de la couche REGION SANITAIRE.
   - valeurs numeriques : tons chauds jaune-orange-rouge ;
   - valeurs nominales : tons froids bleu-cyan-vert ;
   - nombre de classes parametrable ;
   - option « Cas documentes » calculee a partir de la couche des points.
2. Requetes multicriteres sur les regions sanitaires et les lieux de suicide.
   - tous les champs des deux couches sont proposes ;
   - operateurs texte et numeriques ;
   - liaison des resultats par region ;
   - zoom sur les resultats.
3. Tableau de bord interactif sur les cas filtres :
   - nombre de cas et regions concernees ;
   - hommes / femmes ;
   - graphiques par region, sexe, type de lieu et methode.
4. Heatmap dynamique des cas affiches, avec rayon et flou reglables.
5. Formulaire de signalement : date, region, commune, quartier/localite,
   sexe, age, milieu, statut, description et position cartographique.
6. Les signalements du navigateur sont stockes dans localStorage et affiches
   en violet comme donnees NON VALIDEES. Un service Google Apps Script peut
   envoyer directement chaque signalement a l'adresse du responsable, sans
   ouvrir la messagerie du visiteur (voir SIGNALEMENTS_DIRECTS.md).
7. Couche existante des services de soins publics conservée et activable.

IMPORTANT POUR UNE MISE EN PRODUCTION
L'envoi direct reste desactive tant que l'URL du service Apps Script n'est pas
renseignee dans report-config.js. Les signalements transmis par e-mail doivent
etre verifies avant publication sur la carte. Ne pas collecter/publier
d'identites personnelles ni d'adresses domiciliaires precises.

OUVERTURE
Ouvrir index.html via un serveur web (GitHub Pages convient). Pour un test local,
il est preferable d'utiliser un petit serveur HTTP plutot qu'un double-clic sur
le fichier, notamment pour le fond OpenStreetMap.


MISE A JOUR FOND DE CARTE
-------------------------
Le fond OSM officiel direct a été remplacé par les tuiles OpenStreetMap France afin d'éviter l'affichage des erreurs 403 observées sur tile.openstreetmap.org. Les données cartographiques restent issues d'OpenStreetMap et l'attribution est conservée sur la carte.
