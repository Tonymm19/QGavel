#!/usr/bin/env python3
"""
Script to automatically add created_at and updated_at fields to all models
that don't have them.
"""

import re

# Read the models file
with open('court_rules/models.py', 'r') as f:
    content = f.read()

# Models that already have timestamps (skip these)
skip_models = [
    'Organization', 'User', 'UserAccessGrant', 'Court', 'HolidayCalendar',
    'Holiday', 'Judge', 'JudgeAssociation', 'JudgeProcedure', 'Case',
    'CaseNote', 'Document', 'Deadline', 'DeadlineReminder', 'Alert',
    'CalendarEvent', 'NotificationLog', 'AuditLog', 'RetrievalRun', 'CaseTeam'
]

# Find all model class definitions
model_pattern = r'(class (\w+)\((?:UUIDModel|models\.Model)\):.*?(?=\n\nclass |\Z))'
models = re.findall(model_pattern, content, re.DOTALL)

print(f"Found {len(models)} models")

# Process each model
for full_match, model_name in models:
    if model_name in skip_models or model_name in ['UUIDModel', 'UserManager']:
        print(f"Skipping {model_name} (already has timestamps or is abstract)")
        continue
    
    # Check if it already has created_at
    if 'created_at' in full_match:
        print(f"Skipping {model_name} (already has created_at)")
        continue
    
    # Find the class Meta section or the end of the model
    meta_match = re.search(r'(\n    class Meta:.*?(?=\n    def |\n\nclass |\Z))', full_match, re.DOTALL)
    if meta_match:
        # Insert before class Meta
        insert_pos = full_match.find('    class Meta:')
        timestamp_fields = '    created_at = models.DateTimeField(auto_now_add=True)\n    updated_at = models.DateTimeField(auto_now=True)\n\n'
        new_model = full_match[:insert_pos] + timestamp_fields + full_match[insert_pos:]
        content = content.replace(full_match, new_model)
        print(f"✅ Added timestamps to {model_name} (before Meta)")
    else:
        # Try to find def __str__ or end of last field
        str_match = re.search(r'(\n    def __str__)', full_match)
        if str_match:
            insert_pos = full_match.find('    def __str__')
            timestamp_fields = '    created_at = models.DateTimeField(auto_now_add=True)\n    updated_at = models.DateTimeField(auto_now=True)\n\n'
            new_model = full_match[:insert_pos] + timestamp_fields + full_match[insert_pos:]
            content = content.replace(full_match, new_model)
            print(f"✅ Added timestamps to {model_name} (before __str__)")
        else:
            print(f"⚠️  Could not find insertion point for {model_name}")

# Write the updated content
with open('court_rules/models.py', 'w') as f:
    f.write(content)

print("\n✅ Done! Updated models.py")



