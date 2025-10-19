# court_rules/poc_models.py
from django.db import models


class PocCourt(models.Model):
    code = models.CharField(max_length=20, primary_key=True)
    name = models.TextField()
    url = models.URLField(blank=True, null=True)

    class Meta:
        db_table = 'court'
        managed = False
        verbose_name = 'POC Court'
        verbose_name_plural = 'POC Courts'

    def __str__(self):
        return f"{self.code} – {self.name}"


class PocRuleNode(models.Model):
    NODE_TYPES = [
        ('rule', 'Rule'),
        ('section', 'Section'),
        ('subsection', 'Subsection'),
        ('clause', 'Clause'),
    ]

    court = models.ForeignKey(PocCourt, on_delete=models.CASCADE, related_name='rules')
    rule_code = models.CharField(max_length=50)
    node_type = models.CharField(max_length=20, choices=NODE_TYPES)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='children')
    ordinal = models.IntegerField(default=0)
    heading = models.TextField(blank=True)
    text = models.TextField(blank=True)
    source_url = models.URLField(blank=True, null=True)
    normalized_text_hash = models.CharField(max_length=64, blank=True)
    effective_from = models.DateTimeField(auto_now_add=True)
    effective_to = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rule_node'
        indexes = [
            models.Index(fields=['court', 'rule_code']),
            models.Index(fields=['effective_from', 'effective_to']),
        ]
        managed = False
        verbose_name = 'POC Rule Node'
        verbose_name_plural = 'POC Rule Nodes'

    def __str__(self):
        return f"{self.rule_code} – {self.heading or 'Untitled'}"


class PocJudge(models.Model):
    court = models.ForeignKey(PocCourt, on_delete=models.CASCADE, related_name='judges')
    display_name = models.TextField()
    role = models.CharField(max_length=100, blank=True, null=True)
    courtroom = models.CharField(max_length=50, blank=True, null=True)
    chambers = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=30, blank=True, null=True)
    fax = models.CharField(max_length=30, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'judge'
        managed = False
        verbose_name = 'POC Judge'
        verbose_name_plural = 'POC Judges'

    def __str__(self):
        return self.display_name


class PocJudgeProcNode(models.Model):
    judge = models.ForeignKey(PocJudge, on_delete=models.CASCADE, related_name='procedures')
    node_type = models.CharField(max_length=20)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='children')
    ordinal = models.IntegerField(default=0)
    heading = models.TextField(blank=True)
    text = models.TextField(blank=True)
    source_url = models.URLField(blank=True, null=True)
    normalized_text_hash = models.CharField(max_length=64, blank=True)
    effective_from = models.DateTimeField(auto_now_add=True)
    effective_to = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'judge_proc_node'
        managed = False
        verbose_name = 'POC Judge Procedure'
        verbose_name_plural = 'POC Judge Procedures'

    def __str__(self):
        return f"{self.judge.display_name} – {self.heading or 'Untitled'}"


class PocRequirement(models.Model):
    SOURCE_TYPES = [
        ('rule_node', 'Rule Node'),
        ('judge_proc_node', 'Judge Procedure'),
    ]

    REQUIREMENT_TYPES = [
        ('page_limit', 'Page Limit'),
        ('word_limit', 'Word Limit'),
        ('formatting', 'Formatting'),
        ('deadline', 'Deadline'),
        ('filing', 'Filing'),
        ('service', 'Service'),
        ('content', 'Content'),
        ('procedural', 'Procedural'),
    ]

    source_type = models.CharField(max_length=20, choices=SOURCE_TYPES)
    source_id = models.BigIntegerField()
    requirement_type = models.CharField(max_length=20, choices=REQUIREMENT_TYPES)
    requirement_text = models.TextField()
    confidence_score = models.DecimalField(max_digits=3, decimal_places=2, null=True)
    metadata = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'requirement'
        indexes = [
            models.Index(fields=['source_type', 'source_id']),
        ]
        managed = False
        verbose_name = 'POC Requirement'
        verbose_name_plural = 'POC Requirements'

    def __str__(self):
        return f"{self.requirement_type}: {self.requirement_text[:50]}"


class PocComplianceCheck(models.Model):
    STATUS_CHOICES = [
        ('pass', 'Pass'),
        ('fail', 'Fail'),
        ('warning', 'Warning'),
    ]

    check_date = models.DateTimeField(auto_now_add=True)
    court_code = models.CharField(max_length=20)
    judge = models.ForeignKey(PocJudge, null=True, blank=True, on_delete=models.SET_NULL)
    case_metadata = models.JSONField()
    overall_status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    violations = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'compliance_check'
        indexes = [
            models.Index(fields=['court_code']),
            models.Index(fields=['check_date']),
        ]
        managed = False
        verbose_name = 'POC Compliance Check'
        verbose_name_plural = 'POC Compliance Checks'

    def __str__(self):
        return f"POC Compliance Check #{self.pk} – {self.overall_status}"


class PocChangeEvent(models.Model):
    ENTITY_KINDS = [
        ('rule_node', 'Rule Node'),
        ('judge_proc_node', 'Judge Procedure'),
        ('judge', 'Judge'),
    ]

    CHANGE_TYPES = [
        ('created', 'Created'),
        ('modified', 'Modified'),
        ('deleted', 'Deleted'),
    ]

    entity_kind = models.CharField(max_length=20, choices=ENTITY_KINDS)
    entity_id = models.BigIntegerField()
    change_type = models.CharField(max_length=10, choices=CHANGE_TYPES)
    old_hash = models.CharField(max_length=64, blank=True, null=True)
    new_hash = models.CharField(max_length=64, blank=True, null=True)
    detected_at = models.DateTimeField(auto_now_add=True)
    diff_text = models.TextField(blank=True, null=True)
    diff_metadata = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'change_event'
        indexes = [
            models.Index(fields=['entity_kind', 'entity_id']),
            models.Index(fields=['detected_at']),
        ]
        managed = False  
        verbose_name = 'POC Change Event'
        verbose_name_plural = 'POC Change Events'

    def __str__(self):
        return f"{self.change_type} – {self.entity_kind} {self.entity_id}"