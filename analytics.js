// Active Cloudflare Web Analytics uniquement après configuration du jeton public.
// Le compteur historique en haut de la page continue de fonctionner séparément.
(function () {
  const configuration = document.querySelector('meta[name="cloudflare-web-analytics-token"]');
  const token = configuration && configuration.content.trim();
  if (!token || !/^[a-f0-9]{32}$/i.test(token)) return;
  if (window.location.hostname !== 'ryko95.github.io' || !/^\/OGS-CI(?:\/|$)/i.test(window.location.pathname)) return;

  const beacon = document.createElement('script');
  beacon.type = 'module';
  beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  beacon.defer = true;
  beacon.setAttribute('data-cf-beacon', JSON.stringify({ token: token }));
  document.head.appendChild(beacon);
})();
