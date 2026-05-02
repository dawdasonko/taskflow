import os
from pathlib import Path
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("SECRET_KEY", "taskflow_django_secret")
DEBUG = os.environ.get("DEBUG", "True") == "True"

ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "api",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "taskflow_backend.urls"

TEMPLATES = []

WSGI_APPLICATION = "taskflow_backend.wsgi.application"

DATABASES = {
    "default": dj_database_url.config(
        default=os.environ.get("DATABASE_PUBLIC_URL") or os.environ.get("DATABASE_URL"),
        conn_max_age=600,
        ssl_require=True,
    )
}

CORS_ALLOW_ALL_ORIGINS = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"