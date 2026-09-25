import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from scripts import alerte_email


class FakeSMTP:
    messages = []
    fail = False

    def __init__(self, host, port, **kwargs):
        assert (host, port) == ('smtp.gmail.com', 465)

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass

    def login(self, username, password):
        assert username == 'sender@example.com'
        assert password == 'secret-for-test'

    def send_message(self, message):
        if self.fail:
            raise OSError('temporary error')
        self.messages.append(message)


class TestAlertEmail(unittest.TestCase):
    def test_backlog_is_sent_once_and_failures_remain_pending(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'data').mkdir()
            (root / 'data/veille_config.json').write_text('{"enabled": true}')
            (root / 'data/veille.json').write_text(json.dumps({
                'articles': [{'id': 'article-1', 'url': 'https://news.test/item',
                              'domaine': 'news.test', 'date_publication': '2026-09-25'}]}))
            state_path = root / 'data/alerte_email.json'
            state_path.write_text('{"ids_envoyes": [], "dernier_envoi": null}')
            FakeSMTP.messages = []
            FakeSMTP.fail = True
            env = {'OGS_SMTP_USER': 'sender@example.com', 'OGS_SMTP_PASSWORD': 'secret-for-test'}
            with patch.multiple(alerte_email, ROOT=root, VEILLE=root / 'data/veille.json', STATE=state_path):
                with patch.dict(os.environ, env, clear=True):
                    with self.assertRaisesRegex(RuntimeError, 'Envoi SMTP échoué'):
                        alerte_email.send_alert(FakeSMTP)
                    self.assertEqual([], json.loads(state_path.read_text())['ids_envoyes'])
                    FakeSMTP.fail = False
                    self.assertTrue(alerte_email.send_alert(FakeSMTP))
                    self.assertFalse(alerte_email.send_alert(FakeSMTP))
            self.assertEqual(1, len(FakeSMTP.messages))
            self.assertEqual('sreueric@gmail.com', FakeSMTP.messages[0]['To'])
            self.assertIn('à vérifier', FakeSMTP.messages[0]['Subject'])
            self.assertEqual(['article-1'], json.loads(state_path.read_text())['ids_envoyes'])


if __name__ == '__main__':
    unittest.main()
