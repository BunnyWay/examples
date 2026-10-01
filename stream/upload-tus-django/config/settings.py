import os

# Development settings. Set DJANGO_SECRET_KEY, turn off DEBUG, and set ALLOWED_HOSTS before you deploy.
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "django-insecure-development-only")
DEBUG = True
ALLOWED_HOSTS: list[str] = []

# No database, auth, or sessions: Bunny Stream stores the videos.
INSTALLED_APPS = ["django.contrib.staticfiles", "uploads"]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "APP_DIRS": True,
    }
]

STATIC_URL = "static/"
