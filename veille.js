(async function () {
  'use strict';
  const state = document.getElementById('veilleEtat');
  const list = document.getElementById('veilleLiens');
  try {
    const response = await fetch('./data/veille.json', {cache: 'no-store'});
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    if (!data.derniere_veille) {
      state.textContent = 'Première collecte à venir. Les cas documentés restent accessibles sur la carte.';
      return;
    }
    const last = new Date(data.derniere_veille);
    const date = Number.isNaN(last.getTime()) ? 'date inconnue' : last.toLocaleString('fr-FR', {dateStyle: 'short', timeStyle: 'short', timeZone: 'Africa/Abidjan'});
    const start = typeof data.debut_veille === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.debut_veille)
      ? new Date(data.debut_veille + 'T00:00:00Z').toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'})
      : null;
    const entries = Array.isArray(data.articles) ? data.articles : [];
    state.textContent = `${start ? `Depuis le ${start} · ` : ''}Dernière veille : ${date} · ${data.sources_interrogees || 0} recherches réussies · ${entries.length} liens à vérifier${data.requêtes_en_echec ? ` · ${data.requêtes_en_echec} recherche(s) indisponible(s)` : ''}.`;
    if (!entries.length) {
      list.textContent = 'Aucune nouvelle référence repérée sur la période surveillée.';
      return;
    }
    for (const item of entries.slice(0, 12)) {
      try {
        const url = new URL(item.url);
        if (url.protocol !== 'https:' || !url.hostname) continue;
        const row = document.createElement('div');
        row.className = 'veille-item';
        const anchor = document.createElement('a');
        anchor.href = url.href;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.textContent = item.domaine || url.hostname;
        const detail = document.createElement('small');
        detail.textContent = ` · ${item.date_publication || 'date inconnue'} · à vérifier`;
        row.append(anchor, detail);
        list.appendChild(row);
      } catch (_) { /* lien malformé : ignorer */ }
    }
  } catch (_) {
    state.textContent = 'Veille temporairement indisponible.';
  }
})();
