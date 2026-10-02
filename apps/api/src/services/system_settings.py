import os
import json
import logging

logger = logging.getLogger(__name__)

SYSTEM_SETTINGS_FILE = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "config", "system_settings.json")
)


def get_system_settings() -> dict:
    defaults = {
        "site_name": "Oxonom Edu",
        "site_logo": "/lrn-dash.svg",
        "footer_text": "© 2026 Oxonom Education Technologies. Tüm hakları saklıdır.",
        "footer_link_text": "Oxonom Technologies",
        "footer_link_url": "https://www.oxonom.com",
        "ai": {
            "is_ai_enabled": True,
            "provider": "google",
            "api_key": "",
            "base_url": "",
            "model_fast": "gemini-2.5-flash",
            "model_standard": "gemini-2.5-flash",
            "model_pro": "gemini-2.5-pro",
        },
    }
    if os.path.exists(SYSTEM_SETTINGS_FILE):
        try:
            with open(SYSTEM_SETTINGS_FILE, "r", encoding="utf-8") as f:
                saved = json.load(f)
                defaults["site_name"] = saved.get("site_name", defaults["site_name"])
                defaults["site_logo"] = saved.get("site_logo", defaults["site_logo"])
                defaults["footer_text"] = saved.get("footer_text", defaults["footer_text"])
                defaults["footer_link_text"] = saved.get("footer_link_text", defaults["footer_link_text"])
                defaults["footer_link_url"] = saved.get("footer_link_url", defaults["footer_link_url"])
                if "ai" in saved and isinstance(saved["ai"], dict):
                    defaults["ai"].update(saved["ai"])
        except Exception as e:
            logger.warning(f"Failed to read system settings: {e}")
    return defaults


def save_system_settings(settings: dict) -> None:
    os.makedirs(os.path.dirname(SYSTEM_SETTINGS_FILE), exist_ok=True)
    with open(SYSTEM_SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(settings, f, ensure_ascii=False, indent=2)
