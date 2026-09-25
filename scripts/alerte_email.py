"""Envoyer un récapitulatif des nouveaux liens de veille, après collecte.

Les liens restent des informations à vérifier, jamais des cas confirmés.
"""

import json
import os
import smtplib
import ssl
from datetime import datetime, timezone
from email.message import EmailMessage
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VEILLE = ROOT / "data" / "veille.json"
STATE = ROOT / "data" / "alerte_email.json"
DEFAULT_RECIPIENT = "sreueric@gmail.com"
SITE_URL = "https://ryko95.github.io/OGS-CI/"


def send_alert(smtp_factory=smtplib.SMTP_SSL):
    """Ne marque les liens comme envoyés qu'après une remise SMTP réussie."""
    if not json.loads((ROOT / "data" / "veille_config.json").read_text(encoding="utf-8")).get("enabled", False):
        print("Veille désactivée : aucune alerte envoyée.")
        return False
    username = os.environ.get("OGS_SMTP_USER", "").strip()
    password = os.environ.get("OGS_SMTP_PASSWORD", "")
    recipient = (os.environ.get("OGS_ALERT_EMAIL") or DEFAULT_RECIPIENT).strip()
    if not username or not password:
        print("Alerte email en attente : secrets OGS_SMTP_USER / OGS_SMTP_PASSWORD absents.")
        return False
    if not recipient or "\n" in recipient or "\r" in recipient:
        raise ValueError("Destinataire email invalide")

    data = json.loads(VEILLE.read_text(encoding="utf-8"))
    state = json.loads(STATE.read_text(encoding="utf-8"))
    sent = set(state.get("ids_envoyes", []))
    unseen = [entry for entry in data.get("articles", []) if entry["id"] not in sent]
    if not unseen:
        print("Aucun nouveau lien à notifier.")
        return False

    message = EmailMessage()
    message["From"] = username
    message["To"] = recipient
    message["Subject"] = f"OGS-CI : {len(unseen)} nouveau(x) lien(s) de presse à vérifier"
    lines = [
        "Veille de l'Observatoire géographique du suicide en Côte d'Ivoire",
        "",
        f"{len(unseen)} référence(s) publiques repérées depuis le dernier e-mail.",
        "Ce sont des liens à examiner, pas des cas confirmés. Plusieurs liens peuvent",
        "décrire le même fait ou ne concerner aucun cas en Côte d'Ivoire.",
        "",
    ]
    for number, entry in enumerate(unseen, 1):
        lines += [f"{number}. {entry.get('domaine', 'Source inconnue')} — {entry.get('date_publication', 'date inconnue')}",
                  entry["url"], ""]
    lines += ["Observatoire : " + SITE_URL, "Aucune identité ni détail personnel n'est inclus dans ce message."]
    message.set_content("\n".join(lines))

    try:
        with smtp_factory("smtp.gmail.com", 465, context=ssl.create_default_context(), timeout=25) as server:
            server.login(username, password)
            server.send_message(message)
    except (OSError, smtplib.SMTPException) as exc:
        # Ne jamais afficher la réponse SMTP complète : elle pourrait contenir des données du compte.
        raise RuntimeError("Envoi SMTP échoué : " + type(exc).__name__) from None

    sent.update(entry["id"] for entry in unseen)
    state = {"ids_envoyes": sorted(sent),
             "dernier_envoi": datetime.now(timezone.utc).isoformat(timespec="seconds")}
    STATE.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Alerte envoyée à {recipient} pour {len(unseen)} lien(s).")
    return True


if __name__ == "__main__":
    send_alert()
