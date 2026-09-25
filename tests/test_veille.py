import json
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

from scripts import veille


class TestVeille(unittest.TestCase):
    def test_deduplicates_and_does_not_add_map_cases(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'data').mkdir()
            (root / 'layers').mkdir()
            (root / 'data/veille_config.json').write_text('{"enabled":true}')
            (root / 'data/veille.json').write_text('{"articles":[]}')
            layer = 'var json_LIEUDESUICIDE_2 = {"features":[{"properties":{"url_source":"https://old.test/already","source_sec":""}}]};'
            (root / 'layers/LIEUDESUICIDE_2.js').write_text(layer)

            def fake_fetch(_query):
                return [
                    {'url': 'https://news.test/story?utm_source=a', 'title': 'Suicide à Abidjan', 'seendate': '20260925T123000Z'},
                    {'url': 'https://news.test/story?utm_source=b', 'title': 'Suicide à Abidjan', 'seendate': '20260925T123000Z'},
                    {'url': 'https://old.test/already', 'title': 'Suicide', 'seendate': '20260925T123000Z'},
                    {'url': 'https://news.test/irrelevant', 'title': 'Festival culturel', 'seendate': '20260925T123000Z'},
                ]

            with patch.multiple(veille, ROOT=root, OUTPUT=root / 'data/veille.json',
                                CONFIG=root / 'data/veille_config.json', EXISTING=root / 'layers/LIEUDESUICIDE_2.js'):
                out = veille.collect(fake_fetch, datetime(2026, 9, 25, 16, tzinfo=timezone.utc))
                self.assertEqual(1, len(out['articles']))
                self.assertEqual(1, out['nouvelles_references'])
                self.assertEqual(layer, (root / 'layers/LIEUDESUICIDE_2.js').read_text())
                self.assertEqual(out, json.loads((root / 'data/veille.json').read_text()))


if __name__ == '__main__':
    unittest.main()
