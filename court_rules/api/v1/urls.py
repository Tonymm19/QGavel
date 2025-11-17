from django.urls import path
from rest_framework.routers import DefaultRouter

from court_rules.api.v1.viewsets import (
    AuditLogViewSet,
    CaseViewSet,
    DeadlineReminderViewSet,
    DeadlineViewSet,
    JudgeViewSet,
    PocChangeEventViewSet,
    PocComplianceCheckViewSet,
    PocCourtViewSet,
    PocJudgeProcNodeViewSet,
    PocJudgeViewSet,
    PocRequirementViewSet,
    PocRuleNodeViewSet,
    RuleViewSet,
    UserViewSet,
    obtain_auth_token_email,
)

router = DefaultRouter()
router.register(r'judges', JudgeViewSet, basename='judge')
router.register(r'cases', CaseViewSet, basename='case')
router.register(r'deadlines', DeadlineViewSet, basename='deadline')
router.register(r'rules', RuleViewSet, basename='rule')
router.register(r'deadline-reminders', DeadlineReminderViewSet, basename='deadline-reminder')
router.register(r'audit-log', AuditLogViewSet, basename='audit-log')
router.register(r'users', UserViewSet, basename='user')
router.register(r'ilnd/courts', PocCourtViewSet, basename='poc-court')
router.register(r'ilnd/rule-nodes', PocRuleNodeViewSet, basename='poc-rule-node')
router.register(r'ilnd/judges', PocJudgeViewSet, basename='poc-judge')
router.register(r'ilnd/judge-procedures', PocJudgeProcNodeViewSet, basename='poc-judge-proc-node')
router.register(r'ilnd/requirements', PocRequirementViewSet, basename='poc-requirement')
router.register(r'ilnd/compliance-checks', PocComplianceCheckViewSet, basename='poc-compliance-check')
router.register(r'ilnd/change-events', PocChangeEventViewSet, basename='poc-change-event')

urlpatterns = [
    path('auth/token/', obtain_auth_token_email, name='api-token-auth'),
]
urlpatterns += router.urls
