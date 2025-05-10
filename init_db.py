import os
import sys
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
from app_updated import app, db
from models import (
    User, WeddingEvent, Guest, Vendor, 
    UserImage, TemplateImage, GeneratedImage, 
    EventImage, Task, BudgetItem
)

def init_db():
    """Initialize the database with some sample data for demonstration."""
    with app.app_context():
        # Create all tables
        db.create_all()
        
        print("Creating admin user...")
        # Create admin user if it doesn't exist
        admin = User.query.filter_by(email='admin@bridalvision.com').first()
        if not admin:
            admin = User(
                username='admin',
                email='admin@bridalvision.com',
                first_name='Admin',
                last_name='User',
                user_type='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
        
        # Create demo user if it doesn't exist
        demo_user = User.query.filter_by(email='demo@bridalvision.com').first()
        if not demo_user:
            demo_user = User(
                username='demo',
                email='demo@bridalvision.com',
                first_name='Demo',
                last_name='User',
                phone='555-123-4567',
                user_type='client'
            )
            demo_user.set_password('demo123')
            db.session.add(demo_user)
            db.session.commit()
        
        print("Creating template categories in database...")
        # Add template images to database if not already present
        template_categories = ['haldi', 'mehendi', 'sangeeth', 'wedding', 'reception']
        template_types = ['real', 'natural', 'ai']
        
        for template_type in template_types:
            template_dir = os.path.join('uploads', 'templates', template_type)
            if os.path.exists(template_dir):
                print(f"Processing templates in {template_dir}...")
                for filename in os.listdir(template_dir):
                    if filename.endswith(('.jpg', '.jpeg', '.png')):
                        file_path = os.path.join(template_dir, filename)
                        
                        # Skip if already in database
                        existing = TemplateImage.query.filter_by(filename=filename, template_type=template_type).first()
                        if existing:
                            continue
                        
                        # Determine category from filename
                        category = None
                        for cat in template_categories:
                            if cat.lower() in filename.lower():
                                category = cat
                                break
                        
                        if not category:
                            # If can't determine from filename, assign based on index
                            idx = template_categories.index(filename[0].lower()) % len(template_categories)
                            category = template_categories[idx]
                        
                        # Create template image record
                        template = TemplateImage(
                            filename=filename,
                            file_path=file_path,
                            file_size=os.path.getsize(file_path),
                            category=category,
                            template_type=template_type,
                            description=f"{category.capitalize()} template for bridal face swap",
                            creator_id=admin.id
                        )
                        db.session.add(template)
        
        # Create sample wedding events for demo user
        if WeddingEvent.query.filter_by(user_id=demo_user.id).count() == 0:
            print("Creating sample wedding events...")
            
            # Wedding date (3 months from now)
            wedding_date = datetime.now() + timedelta(days=90)
            
            # Create events with dates relative to the wedding
            events = [
                {
                    'title': 'Haldi Ceremony',
                    'description': 'Traditional Haldi ceremony with friends and family.',
                    'event_date': wedding_date - timedelta(days=2),
                    'venue': 'Family Home, 123 Main St',
                    'ceremony_type': 'haldi',
                },
                {
                    'title': 'Mehendi Night',
                    'description': 'Beautiful Mehendi celebration with intricate designs.',
                    'event_date': wedding_date - timedelta(days=1),
                    'venue': 'Garden Villa, 456 Park Ave',
                    'ceremony_type': 'mehendi',
                },
                {
                    'title': 'Sangeeth Celebration',
                    'description': 'Fun-filled music and dance event with family performances.',
                    'event_date': wedding_date - timedelta(hours=12),
                    'venue': 'Royal Ballroom, Grand Hotel',
                    'ceremony_type': 'sangeeth',
                },
                {
                    'title': 'Wedding Ceremony',
                    'description': 'Main wedding ceremony with traditional rituals.',
                    'event_date': wedding_date,
                    'venue': 'Sacred Temple, 789 Temple Rd',
                    'ceremony_type': 'wedding',
                },
                {
                    'title': 'Reception Party',
                    'description': 'Grand reception celebration with dinner and dancing.',
                    'event_date': wedding_date + timedelta(days=1),
                    'venue': 'Luxury Palace, 101 Gala Blvd',
                    'ceremony_type': 'reception',
                }
            ]
            
            for event_data in events:
                event = WeddingEvent(user_id=demo_user.id, **event_data)
                db.session.add(event)
            
            db.session.commit()
            
            # Get the events we just created
            demo_events = WeddingEvent.query.filter_by(user_id=demo_user.id).all()
            
            print("Creating sample guests...")
            # Add some sample guests to each event
            guests = [
                {'name': 'John Smith', 'email': 'john@example.com', 'rsvp_status': 'confirmed', 'plus_ones': 1},
                {'name': 'Mary Johnson', 'email': 'mary@example.com', 'rsvp_status': 'confirmed', 'plus_ones': 0},
                {'name': 'Robert Brown', 'email': 'robert@example.com', 'rsvp_status': 'pending', 'plus_ones': 2},
                {'name': 'Sarah Williams', 'email': 'sarah@example.com', 'rsvp_status': 'declined', 'plus_ones': 0},
            ]
            
            for event in demo_events:
                for guest_data in guests:
                    guest = Guest(event_id=event.id, **guest_data)
                    db.session.add(guest)
            
            print("Creating sample vendors...")
            # Add some sample vendors
            vendors = [
                {
                    'name': 'Elegant Eats Catering',
                    'category': 'catering',
                    'contact_person': 'Chef Michael',
                    'email': 'chef@eleganteats.com',
                    'phone': '555-234-5678',
                },
                {
                    'name': 'Blissful Decor',
                    'category': 'decor',
                    'contact_person': 'Designer Sarah',
                    'email': 'sarah@blissfuldecor.com',
                    'phone': '555-345-6789',
                },
                {
                    'name': 'Capture Magic Photography',
                    'category': 'photography',
                    'contact_person': 'Photographer David',
                    'email': 'david@capturemagic.com',
                    'phone': '555-456-7890',
                }
            ]
            
            for vendor_data in vendors:
                vendor = Vendor(**vendor_data)
                db.session.add(vendor)
            
            db.session.commit()
            
            # Create sample tasks
            print("Creating sample tasks...")
            wedding_event = WeddingEvent.query.filter_by(
                user_id=demo_user.id, 
                ceremony_type='wedding'
            ).first()
            
            tasks = [
                {
                    'title': 'Send Save-the-Dates',
                    'description': 'Design and send save-the-date cards to all guests.',
                    'due_date': wedding_date - timedelta(days=120),
                    'status': 'completed',
                    'priority': 'high',
                    'event_id': wedding_event.id,
                    'assigned_to': demo_user.id
                },
                {
                    'title': 'Finalize Guest List',
                    'description': 'Complete the final guest list with contact information.',
                    'due_date': wedding_date - timedelta(days=60),
                    'status': 'in_progress',
                    'priority': 'high',
                    'event_id': wedding_event.id,
                    'assigned_to': demo_user.id
                },
                {
                    'title': 'Order Wedding Cake',
                    'description': 'Choose cake design and place order with bakery.',
                    'due_date': wedding_date - timedelta(days=30),
                    'status': 'pending',
                    'priority': 'medium',
                    'event_id': wedding_event.id,
                    'assigned_to': demo_user.id
                },
                {
                    'title': 'Book Honeymoon',
                    'description': 'Research and book honeymoon destination and accommodations.',
                    'due_date': wedding_date - timedelta(days=45),
                    'status': 'pending',
                    'priority': 'medium',
                    'event_id': wedding_event.id,
                    'assigned_to': demo_user.id
                },
                {
                    'title': 'Final Fitting',
                    'description': 'Schedule final outfit fitting and alterations.',
                    'due_date': wedding_date - timedelta(days=14),
                    'status': 'pending',
                    'priority': 'high',
                    'event_id': wedding_event.id,
                    'assigned_to': demo_user.id
                }
            ]
            
            for task_data in tasks:
                task = Task(**task_data)
                db.session.add(task)
            
            db.session.commit()
        
        print("Database initialization complete!")

if __name__ == '__main__':
    init_db()