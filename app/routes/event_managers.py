from flask import Blueprint, render_template, request, jsonify
from app.models import EventManager
from app import db

bp = Blueprint('event_managers', __name__)

@bp.route('/event-managers')
def event_managers():
    managers = EventManager.query.all()
    return render_template('event_managers.html', managers=managers)

@bp.route('/api/event-managers')
def get_managers():
    managers = EventManager.query.all()
    return jsonify([{
        'id': m.id,
        'name': m.name,
        'profile_photo': m.profile_photo,
        'email': m.email,
        'phone': m.phone,
        'website': m.website,
        'bio': m.bio,
        'rating': m.rating,
        'price_range': m.price_range,
        'service_categories': m.service_categories,
        'location': m.location,
        'experience_years': m.experience_years,
        'specialization': m.specialization,
        'languages': m.languages
    } for m in managers])

@bp.route('/api/event-managers/<int:id>')
def get_manager(id):
    manager = EventManager.query.get_or_404(id)
    return jsonify({
        'id': manager.id,
        'name': manager.name,
        'profile_photo': manager.profile_photo,
        'email': manager.email,
        'phone': manager.phone,
        'website': manager.website,
        'bio': manager.bio,
        'rating': manager.rating,
        'price_range': manager.price_range,
        'service_categories': manager.service_categories,
        'location': manager.location,
        'experience_years': manager.experience_years,
        'specialization': manager.specialization,
        'languages': manager.languages
    }) 