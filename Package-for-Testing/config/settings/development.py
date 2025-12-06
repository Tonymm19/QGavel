"""Development settings."""

from .base import *  # noqa: F403,F401

DEBUG = True

SECRET_KEY = 'django-insecure-development'

ALLOWED_HOSTS = ['*']

DATABASES = {  # noqa: F405
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'precedentum_poc',
        'USER': 'precedentum',
        'PASSWORD': 'dcapp',
        'HOST': '127.0.0.1',
        'PORT': '5432',
    }
}

CORS_ALLOWED_ORIGINS = [  # noqa: F405
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

INSTALLED_APPS += ['debug_toolbar']  # type: ignore # noqa: F405

MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')  # type: ignore # noqa: F405

INTERNAL_IPS = ['127.0.0.1']

