"""Découverte limitée aux liens de publications sociales PUBLIQUES indexées par Bing.

Aucun scraping de Facebook/Instagram/X, aucun accès aux contenus privés, aux
comptes ou aux identités. Un résultat RSS n'est jamais une preuve de suicide.
Cette interface ne garantit ni l'exhaustivité ni une date de publication exacte.
"""
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

SOCIAL_QUERIES = (
    ("Facebook", 'site:facebook.com "suicide" "Côte d Ivoire"'),
    ("Facebook", 'site:facebook.com "suicide" "Abidjan"'),
    ("Facebook", 'site:facebook.com "suicide" "Bouaké"'),
    ("Instagram", 'site:instagram.com "suicide" "Côte d Ivoire"'),
    ("X", 'site:x.com "suicide" "Côte d Ivoire"'),
)
USER_AGENT = "OGS-CI veille de sources publiques/1.0 (contact: sreueric@gmail.com)"
SOCIAL_HOSTS = {
    "facebook.com": "Facebook",
    "fb.watch": "Facebook",
    "instagram.com": "Instagram",
    "x.com": "X",
    "twitter.com": "X",
}


def social_platform(url):
    """Accepter uniquement un lien direct vers une plateforme sociale."""
    try:
        host = urllib.parse.urlsplit(url).hostname or ""
        host = host.lower().removeprefix("www.").removeprefix("m.").removeprefix("web.")
        platform = SOCIAL_HOSTS.get(host)
        if not platform:
            return ""
        path = urllib.parse.urlsplit(url).path.lower()
        if not path or path == "/":
            return ""
        # Ne pas considérer une page d'accueil ou une recherche comme un post.
        if path.startswith(("/search", "/hashtag", "/explore", "/login", "/groups/")):
            return ""
        if path.startswith(("/posts/", "/reel/", "/reels/", "/p/", "/status/",
                            "/videos/", "/photo", "/watch/", "/story.php",
                            "/permalink.php", "/stories/")):
            return platform
        # Formats fréquents de publications Facebook nommées /nom/posts/identifiant.
        if platform == "Facebook" and ("/posts/" in path or "/videos/" in path):
            return platform
        if platform == "Facebook" and host == "fb.watch":
            return platform
        return ""
    except (ValueError, AttributeError):
        return ""


def fetch_social_public(query):
    """Lire le flux de résultats indexés par Bing, PAS le contenu de Facebook."""
    params = urllib.parse.urlencode({"q": query, "format": "rss", "setlang": "fr"})
    req = urllib.request.Request("https://www.bing.com/search?" + params,
                                 headers={"User-Agent": USER_AGENT,
                                          "Accept": "application/rss+xml, application/xml;q=0.9"})
    with urllib.request.urlopen(req, timeout=18) as response:
        body = response.read(2_000_000)
    root = ET.fromstring(body)
    if root.tag.lower() not in ("rss", "{http://www.w3.org/2005/atom}feed"):
        raise ValueError("Moteur de recherche : réponse non RSS")
    results = []
    for item in root.findall("./channel/item"):
        results.append({"url": item.findtext("link") or "",
                        "title": item.findtext("title") or ""})
    return results
