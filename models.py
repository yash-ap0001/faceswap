from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from app import db

# User model for authentication
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    first_name = db.Column(db.String(64))
    last_name = db.Column(db.String(64))
    phone = db.Column(db.String(20))
    user_type = db.Column(db.String(20), default='client')  # 'client', 'vendor', 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    events = db.relationship('WeddingEvent', backref='user', lazy='dynamic')
    images = db.relationship('UserImage', backref='user', lazy='dynamic')
    templates = db.relationship('TemplateImage', backref='created_by', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.username}>'

# Wedding event model
class WeddingEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)
    event_date = db.Column(db.DateTime, nullable=False)
    venue = db.Column(db.String(256))
    ceremony_type = db.Column(db.String(64))  # 'haldi', 'mehendi', 'sangeeth', 'wedding', 'reception'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationships
    images = db.relationship('EventImage', backref='event', lazy='dynamic')
    guests = db.relationship('Guest', backref='event', lazy='dynamic')
    vendors = db.relationship('Vendor', secondary='event_vendors', backref='events', lazy='dynamic')
    
    def __repr__(self):
        return f'<WeddingEvent {self.title}>'

# Guest model for managing invitations
class Guest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    rsvp_status = db.Column(db.String(20), default='pending')  # 'confirmed', 'declined', 'pending'
    plus_ones = db.Column(db.Integer, default=0)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    event_id = db.Column(db.Integer, db.ForeignKey('wedding_event.id'), nullable=False)
    
    def __repr__(self):
        return f'<Guest {self.name}>'

# Vendor model for various wedding services
class Vendor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    category = db.Column(db.String(64), nullable=False)  # 'catering', 'decor', 'photography', 'venue', etc.
    contact_person = db.Column(db.String(128))
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    website = db.Column(db.String(256))
    address = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Vendor {self.name}>'

# Association table for event-vendor relationship (many-to-many)
event_vendors = db.Table('event_vendors',
    db.Column('event_id', db.Integer, db.ForeignKey('wedding_event.id'), primary_key=True),
    db.Column('vendor_id', db.Integer, db.ForeignKey('vendor.id'), primary_key=True),
    db.Column('service_details', db.Text),
    db.Column('price', db.Float),
    db.Column('status', db.String(20), default='pending')  # 'confirmed', 'pending', 'canceled'
)

# Base model for all image types
class ImageBase(db.Model):
    __abstract__ = True
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(256), nullable=False)
    original_filename = db.Column(db.String(256))
    file_path = db.Column(db.String(512), nullable=False)
    file_size = db.Column(db.Integer)  # Size in bytes
    file_type = db.Column(db.String(64))  # MIME type
    width = db.Column(db.Integer)
    height = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Image {self.filename}>'

# User uploaded images
class UserImage(ImageBase):
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    is_profile = db.Column(db.Boolean, default=False)
    
    # Relationship to track generated images from this source
    generated_images = db.relationship('GeneratedImage', backref='source_image', lazy='dynamic')

# Template images for face swapping
class TemplateImage(ImageBase):
    category = db.Column(db.String(64), nullable=False)  # 'haldi', 'mehendi', 'sangeeth', 'wedding', 'reception'
    style = db.Column(db.String(64))  # 'traditional', 'modern', 'fusion', etc.
    template_type = db.Column(db.String(64), default='real')  # 'real', 'ai', 'natural'
    description = db.Column(db.Text)
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'))  # Admin who uploaded the template
    
    # Relationship to track generated images from this template
    generated_images = db.relationship('GeneratedImage', backref='template_image', lazy='dynamic')

# Images generated from face swapping
class GeneratedImage(ImageBase):
    source_image_id = db.Column(db.Integer, db.ForeignKey('user_image.id'), nullable=False)
    template_image_id = db.Column(db.Integer, db.ForeignKey('template_image.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    customization_data = db.Column(db.JSON)  # Store customization options as JSON
    
    # Relationship to user
    user = db.relationship('User', backref='generated_images')

# Images associated with specific wedding events
class EventImage(ImageBase):
    event_id = db.Column(db.Integer, db.ForeignKey('wedding_event.id'), nullable=False)
    image_type = db.Column(db.String(64))  # 'invitation', 'venue', 'decor', 'food', etc.
    description = db.Column(db.Text)

# Task model for wedding planning checklist
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text)
    due_date = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'in_progress', 'completed'
    priority = db.Column(db.String(20), default='medium')  # 'high', 'medium', 'low'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    event_id = db.Column(db.Integer, db.ForeignKey('wedding_event.id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    # Relationship to assigned user
    assignee = db.relationship('User', backref='tasks')
    
    def __repr__(self):
        return f'<Task {self.title}>'

# Budget item model for tracking wedding expenses
class BudgetItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(64), nullable=False)
    description = db.Column(db.Text)
    estimated_cost = db.Column(db.Float)
    actual_cost = db.Column(db.Float)
    payment_status = db.Column(db.String(20), default='unpaid')  # 'paid', 'unpaid', 'partially_paid'
    payment_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    event_id = db.Column(db.Integer, db.ForeignKey('wedding_event.id'), nullable=False)
    vendor_id = db.Column(db.Integer, db.ForeignKey('vendor.id'))
    
    # Relationship to vendor
    vendor = db.relationship('Vendor', backref='budget_items')
    
    def __repr__(self):
        return f'<BudgetItem {self.category} - {self.description}>'