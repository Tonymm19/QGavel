"""Root URL configuration."""

from django.conf import settings
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health_check(request):
    """
    Simple health check endpoint for load balancer.
    Returns 200 OK if the server is running.
    No authentication required.
    """
    return JsonResponse({"status": "healthy", "service": "qgavel-backend"})


urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('admin/', admin.site.urls),
    path('api/v1/', include('court_rules.api.v1.urls')),
]

if settings.DEBUG:
    import debug_toolbar

    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),
    ]

