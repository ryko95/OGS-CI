# Envoi direct des signalements à Dr SREU Eric

La carte GitHub Pages ne dispose pas de serveur capable d'envoyer un e-mail. Le fichier `backend/apps-script/Code.gs` est le service de réception à déployer **sur votre propre compte Google**. Il transmet les formulaires à `sreueric@gmail.com` avec `MailApp`, sans demander aux visiteurs de posséder un compte ni d'ouvrir leur messagerie. La réception reste indépendante de la couche des cas documentés.

## Activation (une fois)

1. Ouvrir [script.google.com](https://script.google.com/home/projects/create) depuis le compte Google qui autorisera l'envoi. Créer un projet « OGS-CI Signalements » et coller **tout** le contenu de `backend/apps-script/Code.gs` dans `Code.gs`.
2. Sélectionner `autoriserEnvoi`, cliquer sur **Exécuter** et accepter l'autorisation Google demandée. Cette fonction vérifie seulement le quota disponible ; elle n'envoie aucun message.
3. **Déployer → Nouveau déploiement → Application Web**. Choisir « Exécuter en tant que : moi » et « Qui a accès : tout le monde ». Copier l'URL qui se termine par `/exec`, et non l'URL `/dev`.
4. Coller cette URL entre les apostrophes de `window.OGS_REPORT_ENDPOINT = '';` dans `report-config.js` et publier le fichier. Vous pouvez aussi me transmettre uniquement l'URL `/exec` pour que je fasse ce raccordement. L'URL du service est publique par nature ; elle ne contient ni mot de passe ni accès à la boîte mail.
5. Faire un essai contrôlé avec un texte explicitement marqué **TEST**, sans donnée personnelle, puis vérifier sa réception dans `sreueric@gmail.com`. Ne pas ajouter ce test à la carte des cas documentés.

Quand l'URL n'est pas configurée, le bouton « Envoyer directement » reste désactivé et les boutons WhatsApp / messagerie restent proposés. Une fois activé, le navigateur soumet le formulaire à un cadre invisible, puis attend l'accusé de réception du service. En cas de délai ou d'erreur, la page ne prétend pas que le message a été reçu. Le même identifiant est conservé pour un nouvel essai afin de limiter les doublons.

Le service exige les champs utiles, refuse les textes trop longs, utilise un champ piège et limite les envois à 6 par minute et 40 par heure. Il ignore les doublons d'identifiant pendant 6 heures et arrondit les coordonnées envoyées par e-mail à deux décimales. L'URL étant publique, ces protections ne remplacent pas une modération : surveillez les messages indésirables et le quota du compte. Les visiteurs sont invités à ne fournir ni noms, ni numéros personnels, ni adresses domiciliaires. Le formulaire n'ajoute jamais un signalement à la base des cas validés.
