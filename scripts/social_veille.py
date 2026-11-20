"""Découverte limitée aux liens de publications sociales PUBLIQUES indexées par Bing.

Aucun scraping de Facebook/Instagram/X, aucun accès aux contenus privés, aux
comptes ou aux identités. Un résultat RSS n'est jamais une preuve de suicide.
Cette interface ne garantit ni l'exhaustivité ni une date de publication exacte.
"""
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

# Requêtes combinant type d'événement et lieux ivoiriens.
# La liste des localités n'est qu'un outil de découverte, pas une preuve territoriale.
SOCIAL_QUERIES = (
    ("Facebook", 'site:facebook.com "suicide" "Côte d Ivoire"'),
    ("Facebook", 'site:facebook.com "tentative de suicide" "Côte d Ivoire"'),
    ("Facebook", 'site:facebook.com "se suicider" "Abidjan"'),
    ("Facebook", 'site:facebook.com "tentative de suicide" "Abidjan"'),
    ("Facebook", 'site:facebook.com "suicide" "Bouaké"'),
    ("Facebook", 'site:facebook.com "tentative" "suicide" "Bouaké"'),
    ("Facebook", 'site:facebook.com "suicide" "Yamoussoukro"'),
    ("Facebook", 'site:facebook.com "suicide" "Daloa"'),
    ("Facebook", 'site:facebook.com "suicide" "Korhogo"'),
    ("Facebook", 'site:facebook.com "suicide" "San Pedro"'),
    ("Facebook", 'site:facebook.com "suicide" "Bondoukou"'),
    ("Facebook", 'site:facebook.com "suicide" "Gagnoa"'),
    ("Instagram", 'site:instagram.com "suicide" "Côte d Ivoire"'),
    ("X", 'site:x.com "tentative de suicide" "Côte d Ivoire"'),
)

import re
import unicodedata

def normalize_text(value):
    value = unicodedata.normalize("NFKD", str(value or ""))
    return "".join(char for char in value if not unicodedata.combining(char)).lower()

# Des localités sont utilisées pour trier les liens ; une mention du pays,
# d'une ville ou d'une région ne prouve jamais que les faits s'y sont déroulés.
IVORIAN_TERMS = (
    "cote d ivoire", "ivoirien", "ivoirienne", "abidjan", "bouake", "yamoussoukro",
    "korhogo", "daloa", "san pedro", "sassandra", "gagnoa", "agboville", "man",
    "bondoukou", "abengourou", "adzope", "divo", "ferkessedougou", "odienne",
    "soubré", "soubre", "bouna", "bouafle", "dabou", "bingerville",
    "yopougon", "cocody", "adjame", "attécoubé", "attecoube", "koumassi",
    "treichville", "marcory", "port bouet", "plateau", "alepe", "niakara",
    "zuenoula", "guiglo", "duekoue", "tengrela", "bongouanou", "issia",
    "agboville", "sinématiali", "sinematiali", "fresco", "adiake",
)
# Exclut explicitement les titres exclusivement documentaires/préventifs.
NON_EVENT_TERMS = (
    "journee mondiale", "prevention du suicide", "sensibilisation au suicide",
    "campagne de prevention", "colloque sur le suicide", "statistiques du suicide",
    "observatoire du suicide", "taux de suicide", "etude sur le suicide",
)
SUICIDE_TERMS = ("suicid", "se donner la mort", "met fin a ses jours", "met fin à ses jours")
ATTEMPT_TERMS = ("tentative de suicide", "tente de se suicider", "tente de suicider",
                 "a tente de se suicider", "voulait se suicider", "menacait de se suicider")

def social_candidate(title, description=""):
    """Triage par extrait indexé, jamais confirmation d'un événement ni de son lieu."""
    t = normalize_text(title + " " + description)
    if not any(k in t for k in SUICIDE_TERMS):
        return None
    if any(k in t for k in NON_EVENT_TERMS):
        return None
    # Mot isolé « man » ou « divo » risquerait des faux positifs dans d'autres pays.
    location_terms = tuple(k for k in IVORIAN_TERMS if k not in ("man", "divo", "plateau"))
    if not any(re.search(r"(?<!\\w)" + re.escape(k) + r"(?!\\w)", t) for k in location_terms):
        return None
    kind = "Tentative ou crise à vérifier" if any(k in t for k in ATTEMPT_TERMS) else "Suicide signalé à vérifier"
    return {"type_documentaire": kind,
            "statut_territorial": "Lieu des faits en Côte d'Ivoire à confirmer manuellement"}

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
        if platform == "X" and "/status/" in path:
            return platform
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
                        "title": item.findtext("title") or "",
                        "description": item.findtext("description") or ""})
    return results
