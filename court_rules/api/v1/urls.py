from django.urls import path
from rest_framework.routers import DefaultRouter

from court_rules.api.v1.viewsets import (
    AuditLogViewSet,
    BillingRecordViewSet,
    CaseViewSet,
    DeadlineReminderViewSet,
    DeadlineViewSet,
    JudgeViewSet,
    OrganizationViewSet,
    PocChangeEventViewSet,
    PocComplianceCheckViewSet,
    PocCourtViewSet,
    PocJudgeProcNodeViewSet,
    PocJudgeViewSet,
    PocRequirementViewSet,
    PocRuleNodeViewSet,
    RuleViewSet,
    SubscriptionHistoryViewSet,
    SubscriptionViewSet,
    UserAccessGrantViewSet,
    UserManagementViewSet,
    UserViewSet,
    billing_dashboard,
    dashboard_metrics,
    obtain_auth_token_email,
)

from .views_calendar import DeadlineCalendarExportView

router = DefaultRouter()

# Core business endpoints
router.register(r'judges', JudgeViewSet, basename='judge')
router.register(r'cases', CaseViewSet, basename='case')
router.register(r'deadlines', DeadlineViewSet, basename='deadline')
router.register(r'rules', RuleViewSet, basename='rule')
router.register(r'deadline-reminders', DeadlineReminderViewSet, basename='deadline-reminder')
router.register(r'audit-log', AuditLogViewSet, basename='audit-log')
router.register(r'users', UserViewSet, basename='user')

# Admin & management endpoints
router.register(r'admin/organizations', OrganizationViewSet, basename='organization')
router.register(r'admin/users', UserManagementViewSet, basename='user-management')
router.register(r'admin/access-grants', UserAccessGrantViewSet, basename='access-grant')

# Subscription & billing endpoints
router.register(r'admin/subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'admin/subscription-history', SubscriptionHistoryViewSet, basename='subscription-history')
router.register(r'admin/billing-records', BillingRecordViewSet, basename='billing-record')

# ILND POC data endpoints
router.register(r'ilnd/courts', PocCourtViewSet, basename='poc-court')
router.register(r'ilnd/rule-nodes', PocRuleNodeViewSet, basename='poc-rule-node')
router.register(r'ilnd/judges', PocJudgeViewSet, basename='poc-judge')
router.register(r'ilnd/judge-procedures', PocJudgeProcNodeViewSet, basename='poc-judge-proc-node')
router.register(r'ilnd/requirements', PocRequirementViewSet, basename='poc-requirement')
router.register(r'ilnd/compliance-checks', PocComplianceCheckViewSet, basename='poc-compliance-check')
router.register(r'ilnd/change-events', PocChangeEventViewSet, basename='poc-change-event')

urlpatterns = [
    path('auth/token/', obtain_auth_token_email, name='api-token-auth'),
    path('dashboard/metrics/', dashboard_metrics, name='dashboard-metrics'),
    path('billing/dashboard/', billing_dashboard, name='billing-dashboard'),
    path(
        "calendar/deadlines.ics",
        DeadlineCalendarExportView.as_view(),
        name="deadline-calendar-export",
    ),
]
urlpatterns += router.urls
