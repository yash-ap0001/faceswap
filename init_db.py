import os
import sys
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
from db import db
from models import (
    User, WeddingEvent, Guest, Vendor, 
    UserImage, TemplateImage, GeneratedImage, 
    EventImage, Task, BudgetItem
)

def init_db(app=None):
    """Initialize the database with some sample data for demonstration."""
    # Create all tables if app is provided, otherwise assume we're in app context already
    if app:
        with app.app_context():
            db.create_all()
            _init_sample_data()
            return
    else:
        # Create all tables
        db.create_all()
        _init_sample_data()
        
def _init_sample_data():
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
            
            # Create sample budget
            print("Creating sample budget data...")
            wedding_event = WeddingEvent.query.filter_by(
                user_id=demo_user.id, 
                ceremony_type='wedding'
            ).first()
            
            # Set total budget
            from models import EventBudget, CategoryBudget, BudgetItem
            event_budget = EventBudget(
                event_id=wedding_event.id,
                total_amount=50000.00,
                notes="Budget for main wedding ceremony"
            )
            db.session.add(event_budget)
            
            # Set category budgets
            category_budgets = [
                {'category': 'venue', 'allocated_amount': 15000.00},
                {'category': 'catering', 'allocated_amount': 10000.00},
                {'category': 'decor', 'allocated_amount': 5000.00},
                {'category': 'attire', 'allocated_amount': 8000.00},
                {'category': 'photography', 'allocated_amount': 4000.00},
                {'category': 'entertainment', 'allocated_amount': 3000.00},
                {'category': 'transportation', 'allocated_amount': 2000.00},
                {'category': 'gifts', 'allocated_amount': 1000.00},
                {'category': 'beauty', 'allocated_amount': 1500.00},
                {'category': 'accommodation', 'allocated_amount': 0.00},
                {'category': 'stationery', 'allocated_amount': 500.00}
            ]
            
            for budget_data in category_budgets:
                category_budget = CategoryBudget(
                    event_id=wedding_event.id,
                    **budget_data
                )
                db.session.add(category_budget)
            
            # Add sample budget items
            budget_items = [
                {
                    'category': 'venue',
                    'description': 'Sacred Temple Booking',
                    'estimated_cost': 12000.00,
                    'actual_cost': 12500.00,
                    'payment_status': 'paid',
                    'payment_date': wedding_date - timedelta(days=60),
                    'event_id': wedding_event.id
                },
                {
                    'category': 'venue',
                    'description': 'Decoration Setup Fee',
                    'estimated_cost': 2000.00,
                    'actual_cost': 2000.00,
                    'payment_status': 'paid',
                    'payment_date': wedding_date - timedelta(days=30),
                    'event_id': wedding_event.id
                },
                {
                    'category': 'catering',
                    'description': 'Catering Services (200 guests)',
                    'estimated_cost': 8000.00,
                    'actual_cost': 8500.00,
                    'payment_status': 'partially_paid',
                    'payment_date': wedding_date - timedelta(days=45),
                    'event_id': wedding_event.id
                },
                {
                    'category': 'catering',
                    'description': 'Wedding Cake',
                    'estimated_cost': 1200.00,
                    'actual_cost': None,
                    'payment_status': 'unpaid',
                    'payment_date': None,
                    'event_id': wedding_event.id
                },
                {
                    'category': 'decor',
                    'description': 'Floral Arrangements',
                    'estimated_cost': 3000.00,
                    'actual_cost': 3200.00,
                    'payment_status': 'paid',
                    'payment_date': wedding_date - timedelta(days=15),
                    'event_id': wedding_event.id
                },
                {
                    'category': 'decor',
                    'description': 'Lighting Setup',
                    'estimated_cost': 1500.00,
                    'actual_cost': None,
                    'payment_status': 'unpaid',
                    'payment_date': None,
                    'event_id': wedding_event.id
                },
                {
                    'category': 'attire',
                    'description': 'Bridal Lehenga',
                    'estimated_cost': 5000.00,
                    'actual_cost': 4800.00,
                    'payment_status': 'paid',
                    'payment_date': wedding_date - timedelta(days=90),
                    'event_id': wedding_event.id
                },
                {
                    'category': 'attire',
                    'description': 'Groom\'s Sherwani',
                    'estimated_cost': 2500.00,
                    'actual_cost': 2700.00,
                    'payment_status': 'paid',
                    'payment_date': wedding_date - timedelta(days=90),
                    'event_id': wedding_event.id
                },
                {
                    'category': 'photography',
                    'description': 'Photography Package',
                    'estimated_cost': 3500.00,
                    'actual_cost': 3500.00,
                    'payment_status': 'paid',
                    'payment_date': wedding_date - timedelta(days=120),
                    'event_id': wedding_event.id
                },
                {
                    'category': 'entertainment',
                    'description': 'DJ Services',
                    'estimated_cost': 1500.00,
                    'actual_cost': None,
                    'payment_status': 'unpaid',
                    'payment_date': None,
                    'event_id': wedding_event.id
                },
                {
                    'category': 'transportation',
                    'description': 'Luxury Car Rental',
                    'estimated_cost': 1200.00,
                    'actual_cost': None,
                    'payment_status': 'unpaid',
                    'payment_date': None,
                    'event_id': wedding_event.id
                },
                {
                    'category': 'gifts',
                    'description': 'Guest Favors',
                    'estimated_cost': 800.00,
                    'actual_cost': None,
                    'payment_status': 'unpaid',
                    'payment_date': None,
                    'event_id': wedding_event.id
                }
            ]
            
            for item_data in budget_items:
                budget_item = BudgetItem(**item_data)
                db.session.add(budget_item)
            
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
        # Add sample event managers if they don't exist
        from models import EventManager
        if EventManager.query.count() == 0:
            print("Creating sample event managers...")
            event_managers = [
                {
                    'name': 'Priya Sharma',
                    'profile_photo': 'static/images/event_managers/priya_sharma.jpg',
                    'email': 'priya@weddingplanners.com',
                    'phone': '555-789-1234',
                    'website': 'www.priyasharmaevents.com',
                    'bio': 'With over 10 years of experience in planning luxury Indian weddings, Priya specializes in creating unforgettable ceremonies that blend tradition with modern elegance.',
                    'rating': 4.8,
                    'price_range': '$$$',
                    'service_categories': 'Full Planning,Day-of Coordination,Destination Weddings',
                    'location': 'Mumbai, Delhi NCR',
                    'experience_years': 10,
                    'specialization': 'Luxury Weddings',
                    'languages': 'Hindi, English, Punjabi'
                },
                {
                    'name': 'Arjun Patel',
                    'profile_photo': 'static/images/event_managers/arjun_patel.jpg',
                    'email': 'arjun@celebrateindia.com',
                    'phone': '555-234-5678',
                    'website': 'www.celebrateindia.com',
                    'bio': 'Arjun brings creativity and precision to every wedding he plans. His background in hospitality ensures that no detail is overlooked.',
                    'rating': 4.6,
                    'price_range': '$$',
                    'service_categories': 'Full Planning,Vendor Management,Decor Design',
                    'location': 'Bengaluru, Chennai',
                    'experience_years': 7,
                    'specialization': 'South Indian Ceremonies',
                    'languages': 'English, Tamil, Telugu, Kannada'
                },
                {
                    'name': 'Meera Kapoor',
                    'profile_photo': 'static/images/event_managers/meera_kapoor.jpg',
                    'email': 'meera@royalweddings.com',
                    'phone': '555-456-7890',
                    'website': 'www.meerakapoorweddings.com',
                    'bio': 'Meera specializes in royal-themed weddings that capture the grandeur of Indian heritage while incorporating contemporary elements.',
                    'rating': 4.9,
                    'price_range': '$$$$',
                    'service_categories': 'Luxury Planning,Royal Venue Selection,Celebrity Management',
                    'location': 'Jaipur, Udaipur',
                    'experience_years': 12,
                    'specialization': 'Royal Rajasthani Weddings',
                    'languages': 'Hindi, English, Rajasthani'
                },
                {
                    'name': 'Vikram Singh',
                    'profile_photo': 'static/images/event_managers/vikram_singh.jpg',
                    'email': 'vikram@destinationweddings.com',
                    'phone': '555-345-6789',
                    'website': 'www.vikramsinghweddings.com',
                    'bio': 'Vikram is known for his expertise in planning destination weddings across India and internationally, creating bespoke experiences for couples.',
                    'rating': 4.7,
                    'price_range': '$$$',
                    'service_categories': 'Destination Weddings,Travel Arrangements,Beach Ceremonies',
                    'location': 'Goa, Kerala',
                    'experience_years': 9,
                    'specialization': 'Beach Weddings',
                    'languages': 'English, Hindi, Konkani'
                },
                {
                    'name': 'Anjali Desai',
                    'profile_photo': 'static/images/event_managers/anjali_desai.jpg',
                    'email': 'anjali@intimateweddings.com',
                    'phone': '555-890-1234',
                    'website': 'www.anjalidesaiweddings.com',
                    'bio': 'Anjali focuses on creating intimate, personalized wedding experiences that tell each couple\'s unique story.',
                    'rating': 4.5,
                    'price_range': '$',
                    'service_categories': 'Intimate Weddings,Budget Planning,DIY Coordination',
                    'location': 'Pune, Ahmedabad',
                    'experience_years': 5,
                    'specialization': 'Intimate Ceremonies',
                    'languages': 'Gujarati, Hindi, English'
                },
                {
                    'name': 'Raj Malhotra',
                    'profile_photo': 'static/images/event_managers/raj_malhotra.jpg',
                    'email': 'raj@modernweddings.com',
                    'phone': '555-123-9876',
                    'website': 'www.rajmalhotraweddings.com',
                    'bio': 'Raj specializes in modern, tech-integrated weddings that combine traditional elements with contemporary innovation.',
                    'rating': 4.4,
                    'price_range': '$$',
                    'service_categories': 'Modern Planning,Tech Integration,Live Streaming',
                    'location': 'Hyderabad, Mumbai',
                    'experience_years': 6,
                    'specialization': 'Tech-Integrated Events',
                    'languages': 'English, Hindi'
                },
                {
                    'name': 'Nisha Mehta',
                    'profile_photo': 'static/images/event_managers/nisha_mehta.jpg',
                    'email': 'nisha@traditionweddings.com',
                    'phone': '555-567-8901',
                    'website': 'www.nishamehtaevents.com',
                    'bio': 'Nisha is dedicated to preserving cultural traditions while creating beautiful, meaningful wedding ceremonies.',
                    'rating': 4.7,
                    'price_range': '$$',
                    'service_categories': 'Traditional Ceremonies,Cultural Consulting,Ritual Planning',
                    'location': 'Kolkata, Varanasi',
                    'experience_years': 11,
                    'specialization': 'Traditional Bengali Weddings',
                    'languages': 'Bengali, Hindi, English'
                },
                {
                    'name': 'Sanjay Verma',
                    'profile_photo': 'static/images/event_managers/sanjay_verma.jpg',
                    'email': 'sanjay@luxeweddings.com',
                    'phone': '555-678-9012',
                    'website': 'www.sanjayvermaevents.com',
                    'bio': 'Sanjay brings his background in luxury hospitality to create opulent wedding experiences for high-profile clients.',
                    'rating': 4.8,
                    'price_range': '$$$$',
                    'service_categories': 'Celebrity Weddings,Luxury Planning,High-Profile Security',
                    'location': 'Delhi, Mumbai',
                    'experience_years': 15,
                    'specialization': 'Celebrity Weddings',
                    'languages': 'Hindi, English, French'
                }
            ]
            
            # Create an uploads/images/event_managers directory if it doesn't exist
            import os
            event_managers_dir = os.path.join('static', 'images', 'event_managers')
            os.makedirs(event_managers_dir, exist_ok=True)
            
            # Create placeholder profile images if they don't exist
            for manager in event_managers:
                # Check if the profile photo exists
                photo_path = manager['profile_photo']
                if not os.path.exists(photo_path):
                    # Create a placeholder image with the manager's initials
                    import cv2
                    import numpy as np
                    
                    # Create a colored background with manager's initials
                    img = np.zeros((400, 400, 3), dtype=np.uint8)
                    
                    # Generate a color based on the name (for consistent colors)
                    name_hash = sum(ord(c) for c in manager['name'])
                    color = (name_hash % 180 + 50, 180, 200)  # Ensure good hue, saturation, value
                    
                    # Fill the background
                    img[:] = color
                    
                    # Get initials
                    name_parts = manager['name'].split()
                    initials = ''.join([name[0] for name in name_parts])
                    
                    # Add text
                    font = cv2.FONT_HERSHEY_SIMPLEX
                    text_size = cv2.getTextSize(initials, font, 2, 3)[0]
                    text_x = (img.shape[1] - text_size[0]) // 2
                    text_y = (img.shape[0] + text_size[1]) // 2
                    
                    # White text
                    cv2.putText(img, initials, (text_x, text_y), font, 2, (255, 255, 255), 3)
                    
                    # Convert HSV to BGR for saving
                    if color[0] > 0:  # If we used HSV
                        img = cv2.cvtColor(img, cv2.COLOR_HSV2BGR)
                    
                    # Save the image
                    os.makedirs(os.path.dirname(photo_path), exist_ok=True)
                    cv2.imwrite(photo_path, img)
            
            # Add the event managers to the database
            for manager_data in event_managers:
                manager = EventManager(**manager_data)
                db.session.add(manager)
            
            db.session.commit()
        
        print("Database initialization complete!")

if __name__ == '__main__':
    init_db()