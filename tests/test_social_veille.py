"""Tests hors réseau : les références sociales restent non validées."""
import json
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

from scripts import social_veille, veille


class TestSocialVeille(unittest.TestCase):
    def test_only_direct_public_post_urls(self):
        self.assertEqual("Facebook", social_veille.social_platform(
            "https://www.facebook.com/organisation/posts/1234"))
        self.assertEqual("Facebook", social_veille.social_platform(
            "https://www.facebook.com/permalink.php?story_fbid=12&id=5"))
        self.assertEqual("Instagram", social_veille.social_platform(
            "https://www.instagram.com/p/abc123/"))
        self.assertEqual("X", social_veille.social_platform(
            "https://x.com/compte/status/123"))
        for u in ("https://www.facebook.com/groups/private",
                  "https://facebook.com/", "https://www.facebook.com/search/posts?q=suicide",
                  "https://malicious-facebook.com/u/posts/123", "https://example.org/post"):
            self.assertEqual("", social_veille.social_platform(u))

    def test_social_rss_without_social_network_scraping(self):
        xml = b'<rss version="2.0"><channel><item><title>Suicide pres de Bouake</title><link>https://facebook.com/page/posts/123</link></item></channel></rss>'
        class Reply:
            def __enter__(self): return self
            def __exit__(self, *args): return False
            def read(self, *args): return xml
        with patch.object(social_veille.urllib.request, "urlopen", return_value=Reply()):
            data = social_veille.fetch_social_public("site:facebook.com suicide")
        self.assertEqual("https://facebook.com/page/posts/123", data[0]["url"])

    def test_collect_marks_social_as_unverified_and_never_edits_cases(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "data").mkdir()
            (root / "layers").mkdir()
            (root / "data/veille_config.json").write_text(json.dumps({
                "enabled": True, "social_enabled": True, "start_date": "2026-09-01"
            }), encoding="utf-8")
            (root / "data/veille.json").write_text('{"articles":[]}', encoding="utf-8")
            layer='var json_LIEUDESUICIDE_2 = {"features":[]};'
            (root / "layers/LIEUDESUICIDE_2.js").write_text(layer, encoding="utf-8")
            def social(_q):
                return [
                    {"url": "https://www.facebook.com/page/posts/11",
                     "title": "Suicide à Bouaké"},
                    {"url": "https://www.facebook.com/page/posts/11?utm_source=x",
                     "title": "Suicide à Bouaké"},
                    {"url": "https://www.facebook.com/groupes/posts/12",
                     "title": "Information sans lien avec la veille"},
                    {"url": "https://bad.example/posts/123",
                     "title": "Suicide à Abidjan"}]
            with patch.multiple(veille, ROOT=root, OUTPUT=root / "data/veille.json",
                                CONFIG=root / "data/veille_config.json", EXISTING=root / "layers/LIEUDESUICIDE_2.js"):
                with patch.object(veille, "fetch_news", return_value=[]):
                    result=veille.collect(fetcher=lambda q: [], social_fetcher=social,
                        now=datetime(2026,11,20,12,tzinfo=timezone.utc))
            self.assertEqual(1, len(result["articles"]))
            entry=result["articles"][0]
            self.assertEqual("Réseau social", entry["categorie_source"])
            self.assertEqual("Facebook", entry["plateforme"])
            self.assertEqual("reperage", entry["type_date"])
            self.assertEqual("Publication publique indexée à vérifier", entry["statut"])
            self.assertEqual(layer, (root / "layers/LIEUDESUICIDE_2.js").read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
