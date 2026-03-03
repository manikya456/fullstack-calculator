import os
from pathlib import Path

from decouple import AutoConfig


BASE_DIR = Path(__file__).resolve().parent.parent.parent
config = AutoConfig(search_path=BASE_DIR)
ENVIRONMENT = config("DJANGO_ENV", default=os.getenv("DJANGO_ENV", "development")).lower()

if ENVIRONMENT == "production":
    from .production import *  # noqa: F403,F401
else:
    from .development import *  # noqa: F403,F401
