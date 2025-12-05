# court_rules/services/calendar_export.py

from __future__ import annotations

from typing import Iterable, Optional

from django.utils import timezone

from court_rules.models import Deadline

from datetime import timezone as dt_timezone

def _format_dt(dt) -> str:
    """
    Format a datetime or date in UTC as an iCalendar datetime (YYYYMMDDTHHMMSSZ).
    If a date is passed, it is treated as midnight in the current timezone.
    """
    if not dt:
        raise ValueError("Cannot format empty datetime for ICS export")

    if not hasattr(dt, "hour"):  # plain date
        dt = timezone.datetime(
            year=dt.year, month=dt.month, day=dt.day, tzinfo=timezone.get_current_timezone()
        )

    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt, timezone.get_current_timezone())

    dt_utc = dt.astimezone(dt_timezone.utc)
    return dt_utc.strftime("%Y%m%dT%H%M%SZ")


def _escape_ics_text(value: Optional[str]) -> str:
    """
    Escape text for ICS fields according to RFC 5545.
    """
    if not value:
        return ""
    value = value.replace("\\", "\\\\")
    value = value.replace(";", "\\;")
    value = value.replace(",", "\\,")
    # Newlines become literal '\n'
    value = value.replace("\r\n", "\\n").replace("\n", "\\n")
    return value


def _fold_ics_line(line: str) -> str:
    """
    Fold long lines to 75 octets as required by RFC 5545.
    For simplicity we fold at 75 characters which is usually fine.
    """
    if len(line) <= 75:
        return line
    parts = []
    while len(line) > 75:
        parts.append(line[:75])
        line = " " + line[75:]
    parts.append(line)
    return "\r\n".join(parts)


def generate_deadlines_ics(
    deadlines: Iterable[Deadline],
    *,
    calendar_name: str = "Precedentum Deadlines",
    owner_identifier: Optional[str] = None,
) -> str:
    """
    Build an ICS calendar containing the given deadlines.

    :param deadlines: iterable of Deadline objects
    :param calendar_name: human readable calendar name
    :param owner_identifier: optional string to include in PRODID / metadata
    :return: ICS file content as a string
    """
    now = timezone.now()
    prod_owner = owner_identifier or "Precedentum"

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        f"PRODID:-//{_escape_ics_text(prod_owner)}//Court Deadlines//EN",
        f"X-WR-CALNAME:{_escape_ics_text(calendar_name)}",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
    ]

    for deadline in deadlines:
        # Adjust these three attributes if your model uses different names
        due = getattr(deadline, "due_at", None) or getattr(deadline, "due_date", None)
        title = getattr(deadline, "title", None) or getattr(deadline, "name", None) or "Court deadline"
        notes = getattr(deadline, "notes", "") or ""

        if not due:
            # Skip malformed deadlines rather than breaking the whole export
            continue

        uid = f"deadline-{deadline.pk}@precedentum"
        dtstamp = _format_dt(now)
        dtstart = _format_dt(due)

        summary = _escape_ics_text(title)
        description = _escape_ics_text(notes)

        # Optional: if Deadline is linked to a Case, you can enrich the description
        # Example:
        # case = getattr(deadline, "case", None)
        # if case:
        #     description = f"Case: {case.number} - {case.title}\\n{description}"

        event_lines = [
            "BEGIN:VEVENT",
            f"UID:{uid}",
            f"DTSTAMP:{dtstamp}",
            f"DTSTART:{dtstart}",
            f"SUMMARY:{summary}",
        ]
        if description:
            event_lines.append(f"DESCRIPTION:{description}")

        event_lines.append("END:VEVENT")

        for l in event_lines:
            lines.append(_fold_ics_line(l))

    lines.append("END:VCALENDAR")

    ics = "\r\n".join(lines) + "\r\n"
    return ics