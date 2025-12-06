from django.apps import AppConfig


class CourtRulesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'court_rules'

    def ready(self):
        # Ensure the POC models are registered so Django sees them
        from . import poc_models  # noqa: F401