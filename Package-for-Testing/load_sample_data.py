"""
Simple script to load sample data into Precedentum database.
Run this if you see empty screens after setup.

Usage:
    python load_sample_data.py
"""

import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.core.management import call_command

def main():
    """Load sample data into the database."""
    print("=" * 50)
    print("Loading Sample Data for Precedentum")
    print("=" * 50)
    print()
    
    try:
        print("Step 1: Loading Illinois Northern District Judges...")
        print("This includes 8 judges with complete chamber staff information.")
        print()
        
        # Run the seed_ilnd_data management command
        call_command('seed_ilnd_data')
        
        print()
        print("=" * 50)
        print("✅ SUCCESS! Sample data loaded successfully!")
        print("=" * 50)
        print()
        print("You should now see:")
        print("  • 8 Judges in the Judge Profiles section")
        print("  • Chamber staff for each judge")
        print("  • Sample court rules and procedures")
        print()
        print("If you don't see Tony's or Bruce's user account:")
        print("  1. Go to Django Admin: http://localhost:8000/admin/")
        print("  2. Log in with your credentials")
        print("  3. Go to Users section")
        print("  4. Add your email address as a new user")
        print()
        print("Refresh your browser and you're ready to test!")
        print()
        
    except Exception as e:
        print()
        print("=" * 50)
        print("❌ ERROR occurred while loading data")
        print("=" * 50)
        print()
        print(f"Error details: {str(e)}")
        print()
        print("Troubleshooting:")
        print("  1. Make sure the database is running")
        print("  2. Make sure you ran 'python manage.py migrate'")
        print("  3. Check if you're in the virtual environment")
        print()
        sys.exit(1)

if __name__ == '__main__':
    main()




