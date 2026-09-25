"""Collecte de liens publics pour la veille OGS-CI ; aucun cas n'est créé ici."""

import hashlib
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "veille.json"
CONFIG = ROOT / "data" / "veille_config.json"
EXISTING = ROOT / "layers" / "LIEUDESUICIDE_2.js"
API = "https://api.gdeltproject.org/api/v2/doc/doc"
QUERIES = (
    'suicide "Cote d Ivoire"',
    'suicide Abidjan',
    'suicide Bouake',
    'suicide Yamoussoukro',
    'suicide Yopougon',
    'suicide Korhogo',
)
USER_AGENT = "OGS-CI veille de presse/1.0 (contact: sreueric@gmail.com)"


def canonical_url(value):
    """Conserve uniquement des liens HTTPS publics et retire le suivi publicitaire."""
    try:
        u = urllib.parse.urlsplit(value.strip())
        if u.scheme not in ("https", "http") or not u.hostname:
            return ""
        host = u.hostname.lower()
        if host in ("localhost",) or host.endswith((".local", ".internal")):
            return ""
        if u.port and u.port not in (80, 443):
            return ""
        pairs = urllib.parse.parse_qsl(u.query, keep_blank_values=True)
        pairs = [(k, v) for k, v in pairs if not k.lower().startswith("utm_") and k.lower() not in ("fbclid", "gclid")]
        return urllib.parse.urlunsplit(("https", host, u.path.rstrip("/") or "/", urllib.parse.urlencode(pairs), ""))
    except (ValueError, AttributeError):
        return ""


def published(value):
    raw = re.sub(r"\D", "", str(value or ""))
    if len(raw) < 8:
        return ""
    try:
        return datetime.strptime(raw[:8], "%Y%m%d").date().isoformat()
    except ValueError:
        return ""


def previous_urls():
    """Évite de proposer de nouveau les URL déjà présentes sur la carte."""
    raw = EXISTING.read_text(encoding="utf-8")
    data = json.loads(raw[raw.index("=") + 1:].strip().rstrip(";"))
    urls = set()
    for feature in data["features"]:
        p = feature["properties"]
        url = str(p.get("url_source") or "") + str(p.get("source_sec") or "")
        if canonical_url(url):
            urls.add(canonical_url(url))
    return urls


def fetch(query):
    params = urllib.parse.urlencode({"query": query, "mode": "artlist", "format": "json", "maxrecords": "75", "timespan": "7d"})
    req = urllib.request.Request(f"{API}?{params}", headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=25) as response:
        payload = json.load(response)
    if not isinstance(payload.get("articles"), list):
        raise ValueError("Réponse GDELT sans liste d'articles")
    return payload["articles"]


def collect(fetcher=fetch, now=None):
    now = now or datetime.now(timezone.utc)
    if not json.loads(CONFIG.read_text(encoding="utf-8")).get("enabled", False):
        print("Veille désactivée dans data/veille_config.json")
        return None
    old = json.loads(OUTPUT.read_text(encoding="utf-8"))
    threshold = (now - timedelta(days=90)).date().isoformat()
    entries = {a["id"]: a for a in old.get("articles", []) if a.get("date_publication", "") >= threshold}
    mapped = previous_urls()
    seen = {a["url"] for a in entries.values()} | mapped
    errors, successes, detected = [], 0, 0
    for query in QUERIES:
        try:
            articles = fetcher(query)
            successes += 1
        except Exception as exc:
            errors.append(f"{query}: {type(exc).__name__}")
            continue
        for article in articles:
            url = canonical_url(article.get("url", ""))
            date = published(article.get("seendate"))
            if not url or url in seen or not date or date < threshold:
                continue
            title = str(article.get("title") or "").casefold()
            # Ce filtre ne constitue PAS une vérification du fait rapporté.
            if "suicid" not in title:
                continue
            hostname = urllib.parse.urlsplit(url).hostname
            id_ = hashlib.sha256(url.encode()).hexdigest()[:20]
            entries[id_] = {"id": id_, "url": url, "domaine": hostname,
                            "date_publication": date, "premiere_detection": now.isoformat(timespec="seconds"),
                            "statut": "Article à vérifier"}
            seen.add(url)
            detected += 1
    if not successes:
        raise RuntimeError("Aucune requête GDELT réussie : " + "; ".join(errors))
    result = {"derniere_veille": now.isoformat(timespec="seconds"),
              "sources_interrogees": successes, "nouvelles_references": detected,
              "requêtes_en_echec": len(errors),
              "articles": sorted(entries.values(), key=lambda a: (a["date_publication"], a["id"]), reverse=True)[:300]}
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{successes}/{len(QUERIES)} requêtes réussies, {detected} nouveaux liens, {len(result['articles'])} liens conservés")
    if errors:
        print("Erreurs partielles : " + "; ".join(errors), file=sys.stderr)
    return result


if __name__ == "__main__":
    collect()
