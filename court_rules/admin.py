from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField

from . import models
from . import poc_models


class UserCreationForm(forms.ModelForm):
    password1 = forms.CharField(label="Password", widget=forms.PasswordInput)
    password2 = forms.CharField(label="Password confirmation", widget=forms.PasswordInput)

    class Meta:
        model = models.User
        fields = ("email", "first_name", "last_name", "organization", "phone", "role", "timezone")

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("The two password fields didn't match.")
        return password2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = models.User
        fields = (
            "email",
            "first_name",
            "last_name",
            "organization",
            "phone",
            "role",
            "timezone",
            "mfa_enabled",
            "created_by",
            "password",
            "is_active",
            "is_staff",
            "is_superuser",
            "groups",
            "user_permissions",
        )

    def clean_password(self):
        return self.initial.get("password")


@admin.register(models.User)
class UserAdmin(BaseUserAdmin):
    add_form = UserCreationForm
    form = UserChangeForm
    model = models.User
    list_display = ("email", "first_name", "last_name", "organization", "role", "is_staff", "is_active")
    list_filter = ("role", "organization", "is_staff", "is_active")
    ordering = ("email",)
    search_fields = ("email", "first_name", "last_name", "organization__name")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Profile", {"fields": ("first_name", "last_name", "organization", "phone", "role", "timezone", "mfa_enabled", "created_by", "deleted_at")}),
        (
            "Permissions",
            {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")},
        ),
        ("Important dates", {"fields": ("last_login", "created_at", "updated_at")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "first_name", "last_name", "organization", "phone", "role", "timezone", "password1", "password2"),
            },
        ),
    )
    readonly_fields = ("last_login", "created_at", "updated_at")


@admin.register(models.Court)
class CourtAdmin(admin.ModelAdmin):
    list_display = ("name", "district", "division", "timezone")
    search_fields = ("name", "district", "division")
    list_filter = ("timezone",)


@admin.register(models.Judge)
class JudgeAdmin(admin.ModelAdmin):
    list_display = ("full_name", "court", "courtroom")
    search_fields = ("full_name", "court__name")
    list_filter = ("court",)
    
    fieldsets = (
        ("Judge Information", {
            "fields": ("full_name", "court", "courtroom", "chambers_url", "holiday_calendar")
        }),
        ("Judge Contact", {
            "fields": ("contact_email", "contact_phone")
        }),
        ("Court Reporter", {
            "fields": ("court_reporter_name", "court_reporter_phone", "court_reporter_room"),
            "classes": ("collapse",)
        }),
        ("Courtroom Deputy", {
            "fields": ("clerk_name", "clerk_phone", "clerk_email", "clerk_room"),
            "classes": ("collapse",)
        }),
        ("Executive Law Clerk", {
            "fields": ("executive_law_clerk", "executive_law_clerk_phone", "executive_law_clerk_room"),
            "classes": ("collapse",)
        }),
        ("Judicial Assistant", {
            "fields": ("judicial_assistant", "judicial_assistant_phone", "judicial_assistant_room"),
            "classes": ("collapse",)
        }),
        ("Law Clerks & Additional Staff", {
            "fields": ("apprentices", "additional_staff"),
            "classes": ("collapse",)
        }),
    )


@admin.register(models.Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ("caption", "case_number", "status", "court", "lead_attorney")
    search_fields = ("caption", "case_number", "internal_case_id")
    list_filter = ("status", "court")
    filter_horizontal = ()


@admin.register(models.Deadline)
class DeadlineAdmin(admin.ModelAdmin):
    list_display = ("case", "due_at", "status", "owner", "priority")
    list_filter = ("status", "priority")
    search_fields = ("case__caption",)


@admin.register(models.Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "case", "source", "uploaded_at", "ocr_status")
    list_filter = ("source", "ocr_status")
    search_fields = ("title", "case__caption")


@admin.register(models.Rule)
class RuleAdmin(admin.ModelAdmin):
    list_display = ("citation", "source_type", "jurisdiction", "version")
    list_filter = ("source_type", "jurisdiction")
    search_fields = ("citation", "text")


@admin.register(models.Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "case", "severity", "created_at")
    list_filter = ("severity", "created_at")
    search_fields = ("title", "body")


admin.site.register(models.JudgeProcedure)
admin.site.register(models.CaseTeam)
admin.site.register(models.CaseContact)
admin.site.register(models.CaseRelationship)
admin.site.register(models.CaseTag)
admin.site.register(models.CaseTagAssignment)
admin.site.register(models.CaseNote)
admin.site.register(models.Contact)
admin.site.register(models.ContactAddress)
admin.site.register(models.RuleCrossRef)
admin.site.register(models.DeadlineReminder)
admin.site.register(models.DeadlineDependency)
admin.site.register(models.DocketEntry)
admin.site.register(models.Filing)
admin.site.register(models.FilingExhibit)
admin.site.register(models.FilingServiceContact)
admin.site.register(models.Hearing)
admin.site.register(models.HearingFollowUp)
admin.site.register(models.CalendarEvent)
admin.site.register(models.HolidayCalendar)
admin.site.register(models.Holiday)
admin.site.register(models.UserNotificationSubscription)
admin.site.register(models.NotificationLog)
admin.site.register(models.AuditLog)
admin.site.register(models.CasePermission)
admin.site.register(models.RetrievalRun)


@admin.register(poc_models.PocCourt)
class PocCourtAdmin(admin.ModelAdmin):
    list_display = ("code", "name")
    search_fields = ("code", "name")
    ordering = ("code",)


@admin.register(poc_models.PocRuleNode)
class PocRuleNodeAdmin(admin.ModelAdmin):
    list_display = ("rule_code", "node_type", "court", "heading")
    list_filter = ("node_type", "court")
    search_fields = ("rule_code", "heading", "text")
    autocomplete_fields = ("court", "parent")
    ordering = ("court", "rule_code", "ordinal")


@admin.register(poc_models.PocJudge)
class PocJudgeAdmin(admin.ModelAdmin):
    list_display = ("display_name", "court", "role", "courtroom")
    list_filter = ("court",)
    search_fields = ("display_name", "role", "court__name")
    autocomplete_fields = ("court",)
    ordering = ("display_name",)


@admin.register(poc_models.PocJudgeProcNode)
class PocJudgeProcNodeAdmin(admin.ModelAdmin):
    list_display = ("judge", "node_type", "heading", "ordinal")
    list_filter = ("node_type", "judge")
    search_fields = ("heading", "text", "judge__display_name")
    autocomplete_fields = ("judge", "parent")
    ordering = ("judge", "ordinal")


@admin.register(poc_models.PocRequirement)
class PocRequirementAdmin(admin.ModelAdmin):
    list_display = ("requirement_type", "source_type", "source_id", "confidence_score")
    list_filter = ("requirement_type", "source_type")
    search_fields = ("requirement_text",)
    ordering = ("requirement_type", "source_type")


@admin.register(poc_models.PocComplianceCheck)
class PocComplianceCheckAdmin(admin.ModelAdmin):
    list_display = ("id", "check_date", "court_code", "judge", "overall_status")
    list_filter = ("overall_status", "court_code", "check_date")
    search_fields = ("court_code", "case_metadata")
    autocomplete_fields = ("judge",)
    ordering = ("-check_date",)


@admin.register(poc_models.PocChangeEvent)
class PocChangeEventAdmin(admin.ModelAdmin):
    list_display = ("id", "entity_kind", "entity_id", "change_type", "detected_at")
    list_filter = ("entity_kind", "change_type")
    search_fields = ("entity_kind", "entity_id", "diff_text")
    ordering = ("-detected_at",)


# =============================================================================
# Subscription Management Admin
# =============================================================================

@admin.register(models.Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("organization", "licensed_users", "monthly_rate", "status", "billing_cycle_type", "contract_start_date")
    list_filter = ("status", "billing_cycle_type")
    search_fields = ("organization__name", "notes")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at")
    
    fieldsets = (
        ("Organization", {
            "fields": ("organization",)
        }),
        ("License & Pricing", {
            "fields": ("licensed_users", "monthly_rate")
        }),
        ("Billing Details", {
            "fields": ("billing_cycle_type", "billing_day", "contract_start_date", "contract_end_date")
        }),
        ("Status", {
            "fields": ("status", "notes")
        }),
        ("Metadata", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )


@admin.register(models.SubscriptionHistory)
class SubscriptionHistoryAdmin(admin.ModelAdmin):
    list_display = ("subscription", "change_type", "changed_by", "effective_date", "created_at")
    list_filter = ("change_type", "effective_date")
    search_fields = ("subscription__organization__name", "reason", "old_value", "new_value")
    ordering = ("-created_at",)
    readonly_fields = ("created_at",)
    
    fieldsets = (
        ("Subscription", {
            "fields": ("subscription", "change_type")
        }),
        ("Change Details", {
            "fields": ("old_value", "new_value", "reason", "effective_date")
        }),
        ("Metadata", {
            "fields": ("changed_by", "created_at"),
            "classes": ("collapse",)
        }),
    )


@admin.register(models.BillingRecord)
class BillingRecordAdmin(admin.ModelAdmin):
    list_display = ("subscription", "billing_period_start", "billing_period_end", "amount_billed", "amount_paid", "balance_due", "payment_status")
    list_filter = ("payment_status", "billing_period_start")
    search_fields = ("subscription__organization__name", "invoice_number", "notes")
    ordering = ("-billing_period_start",)
    readonly_fields = ("created_at", "updated_at")
    
    fieldsets = (
        ("Subscription", {
            "fields": ("subscription",)
        }),
        ("Billing Period", {
            "fields": ("billing_period_start", "billing_period_end")
        }),
        ("Financial Details", {
            "fields": ("amount_billed", "amount_paid", "balance_due", "invoice_number")
        }),
        ("Dates", {
            "fields": ("invoice_date", "payment_due_date", "payment_received_date", "payment_cleared_date", "reminder_sent_date")
        }),
        ("Custom Dates", {
            "fields": ("custom_date_1", "custom_date_2", "custom_date_3"),
            "classes": ("collapse",)
        }),
        ("Status & Notes", {
            "fields": ("payment_status", "notes")
        }),
        ("Metadata", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        }),
    )
