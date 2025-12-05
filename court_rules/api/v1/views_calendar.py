# court_rules/api/v1/views_calendar.py

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse
from django.utils import timezone

from court_rules.models import Deadline
from court_rules.services.calendar_export import generate_deadlines_ics


class DeadlineCalendarExportView(APIView):
    """
    GET /api/v1/calendar/deadlines.ics

    One-way ICS export of deadlines for the authenticated user.

    Typical flow on the frontend:
      - User clicks "Export deadlines to calendar"
      - Browser hits this endpoint
      - Browser downloads a .ics file that can be imported into Outlook, Google Calendar, etc.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        # Adjust this filter to match your data model
        # Examples:
        #   deadlines = Deadline.objects.filter(assigned_to=user)
        #   deadlines = Deadline.objects.filter(owner=user)
        #   deadlines = Deadline.objects.filter(case__organization=user.organization)
        deadlines = Deadline.objects.filter(created_by=user).order_by("due_at")

        display_name = getattr(user, "email", None) or getattr(user, "username", None) or str(user)
        calendar_name = f"Precedentum deadlines for {display_name}"
        owner_identifier = f"Precedentum User {user.pk}"

        ics_content = generate_deadlines_ics(
            deadlines,
            calendar_name=calendar_name,
            owner_identifier=owner_identifier,
        )

        filename = f"precedentum-deadlines-{timezone.now().date().isoformat()}.ics"

        response = HttpResponse(ics_content, content_type="text/calendar; charset=utf-8")
        response["Content-Disposition"] = f'attachment; filename="{filename}"'

        return response