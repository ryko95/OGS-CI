/**
 * OGS-CI — réception des signalements anonymes depuis GitHub Pages.
 * Déployer comme application Web : Exécuter en tant que moi ; accès Tout le monde.
 * Un signalement est une information à vérifier, jamais un cas publié.
 */
const DESTINATAIRE = 'sreueric@gmail.com';
const ORIGINE_CARTE = 'https://ryko95.github.io';

function autoriserEnvoi() {
  // Lancer une fois depuis l'éditeur pour autoriser MailApp sans envoyer d'e-mail.
  return MailApp.getRemainingDailyQuota();
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  const id = String(p.id || '').trim();
  if (!/^OGS-[0-9a-f-]{12,64}$/i.test(id)) return reponse_('', false, 'Référence invalide');
  if (p.website) return reponse_(id, false, 'Soumission non acceptée');

  const date = propre_(p.date, 10);
  const region = propre_(p.region, 90);
  const commune = propre_(p.commune, 90);
  const quartier = propre_(p.quartier, 100);
  const situation = propre_(p.situation, 1400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !region || !commune || !situation) {
    return reponse_(id, false, 'Champs obligatoires incomplets');
  }
  if (String(p.situation || '').length > 1400 || String(p.commune || '').length > 90) {
    return reponse_(id, false, 'Texte trop long');
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return reponse_(id, false, 'Service occupé, réessayez');
  try {
    const cache = CacheService.getScriptCache();
    if (cache.get('signalement:' + id)) return reponse_(id, true, 'Déjà reçu');
    const minute = 'minute:' + Math.floor(Date.now() / 60000);
    const heure = 'heure:' + Math.floor(Date.now() / 3600000);
    const compteMinute = Number(cache.get(minute) || 0);
    const compteHeure = Number(cache.get(heure) || 0);
    if (compteMinute >= 6 || compteHeure >= 40 || MailApp.getRemainingDailyQuota() < 1) {
      return reponse_(id, false, 'Service temporairement indisponible');
    }

    const valeurs = [
      ['Référence', id], ['Date signalée', date], ['Région', region],
      ['Commune', commune], ['Quartier / localité', quartier || 'Non précisé'],
      ['Sexe', propre_(p.sexe, 30) || 'Non précisé'],
      ['Âge / tranche d’âge', propre_(p.age, 40) || 'Non précisé'],
      ['Type de milieu', propre_(p.milieu, 40) || 'Non précisé'],
      ['Statut du signalement', propre_(p.statut, 40) || 'À vérifier'],
      ['Situation', situation],
      ['Position approximative', position_(p.lat, p.lon)],
    ];
    const texte = ['OGS-CI — NOUVEAU SIGNALEMENT NON VÉRIFIÉ', '',
      ...valeurs.map(v => v[0] + ' : ' + v[1]), '',
      'Ne pas ajouter directement ce signalement à la carte des cas documentés.',
      'Vérifier les faits, la source et les doublons avant toute publication.'].join('\n');

    MailApp.sendEmail({to: DESTINATAIRE, subject: 'OGS-CI — Signalement à vérifier — ' + id, body: texte});
    cache.put('signalement:' + id, '1', 21600);
    cache.put(minute, String(compteMinute + 1), 120);
    cache.put(heure, String(compteHeure + 1), 7200);
    return reponse_(id, true, 'Signalement reçu');
  } catch (err) {
    console.error('Échec de traitement du signalement : ' + String(err));
    return reponse_(id, false, 'Envoi momentanément indisponible');
  } finally {
    lock.releaseLock();
  }
}

function propre_(value, max) {
  return String(value || '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
}

function position_(latitude, longitude) {
  const lat = Number(latitude), lon = Number(longitude);
  if (!latitude || !longitude || !Number.isFinite(lat) || !Number.isFinite(lon)) return 'Non précisée';
  if (lat < 4 || lat > 11 || lon < -9 || lon > -2) return 'Hors des limites attendues';
  return lat.toFixed(2) + ', ' + lon.toFixed(2) + ' (approximation volontaire)';
}

function reponse_(id, ok, message) {
  // L'envoi d'un formulaire vers un iframe évite l'ouverture d'une boîte mail.
  // Un message signé par cette réponse avertit uniquement la page OGS-CI.
  const payload = JSON.stringify({type: 'ogs-report-response', id: id, ok: ok, message: message})
    .replace(/</g, '\\u003c');
  const html = '<!doctype html><meta charset="utf-8"><script>' +
    'window.top.postMessage(' + payload + ',' + JSON.stringify(ORIGINE_CARTE) + ');' +
    '</script>';
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
